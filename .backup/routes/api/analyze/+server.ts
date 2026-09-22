import { env } from '$env/dynamic/private';
import { LIMITS, MODELS } from '$lib/config';
import { RateLimitedError, createClient, errorStatus, generateJson } from '$lib/server/gemini';
import { createLimiter } from '$lib/server/rateLimit';
import { analysisResponseSchema, parseAnalysis } from '$lib/server/schemas';
import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisPrompt } from '$lib/server/tutorPrompt';
import type { AnalyzeResponse, ChatMessage } from '$lib/types';
import type { RequestHandler } from './$types';

const limiter = createLimiter(LIMITS.requestsPerWindow, LIMITS.windowMs);
const MAX_TRANSCRIPT = 6;

const reply = (status: number, body: AnalyzeResponse) =>
	new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

function parseBody(body: unknown): { messages: ChatMessage[]; known: string[]; topic?: string } | null {
	const b = body as { messages?: unknown; knownConcepts?: unknown; topic?: unknown } | null;
	if (!b || !Array.isArray(b.messages) || b.messages.length === 0) return null;
	const messages = b.messages.slice(-MAX_TRANSCRIPT);
	for (const m of messages) {
		if (!m || (m.role !== 'user' && m.role !== 'model')) return null;
		if (typeof m.content !== 'string' || m.content.length > LIMITS.maxMessageChars) return null;
	}
	if (messages[messages.length - 1].role !== 'user') return null;
	const known = Array.isArray(b.knownConcepts)
		? b.knownConcepts.filter((c): c is string => typeof c === 'string').slice(0, 30).map((c) => c.slice(0, 80))
		: [];
	return {
		messages: messages.map((m) => ({ role: m.role, content: m.content })),
		known,
		topic: typeof b.topic === 'string' ? b.topic.slice(0, 100) : undefined
	};
}

export const POST: RequestHandler = async ({ request, platform, getClientAddress }) => {
	if (!limiter.check(getClientAddress()).ok) return reply(429, { ok: false, reason: 'rate_limited' });

	let parsed: ReturnType<typeof parseBody> = null;
	try {
		parsed = parseBody(await request.json());
	} catch {
		/* fall through */
	}
	if (!parsed) return reply(400, { ok: false, reason: 'error' });

	let ai;
	try {
		ai = createClient(platform?.env?.GEMINI_API_KEY ?? env.GEMINI_API_KEY);
	} catch {
		return reply(500, { ok: false, reason: 'error' });
	}

	try {
		const raw = await generateJson(
			ai,
			MODELS.analysis,
			ANALYSIS_SYSTEM_PROMPT,
			buildAnalysisPrompt(parsed.messages, parsed.known, parsed.topic),
			analysisResponseSchema
		);
		const analysis = parseAnalysis(raw);
		return analysis ? reply(200, { ok: true, analysis }) : reply(200, { ok: false, reason: 'malformed' });
	} catch (err) {
		const limited = err instanceof RateLimitedError || errorStatus(err) === 429;
		return limited ? reply(429, { ok: false, reason: 'rate_limited' }) : reply(502, { ok: false, reason: 'error' });
	}
};
