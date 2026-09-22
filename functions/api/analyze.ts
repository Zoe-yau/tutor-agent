import { LIMITS, MODELS } from '../../src/lib/config';
import { RateLimitedError, createClient, errorStatus, generateJson } from '../../src/lib/server/gemini';
import { createLimiter } from '../../src/lib/server/rateLimit';
import { analysisResponseSchema, parseAnalysis } from '../../src/lib/server/schemas';
import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisPrompt } from '../../src/lib/server/tutorPrompt';
import type { AnalyzeResponse, ChatMessage } from '../../src/lib/types';

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

function getClientAddress(request: Request): string {
	return request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
}

export const onRequest: PagesFunction = async (context) => {
	const { request, env } = context;

	if (request.method !== 'POST') {
		return reply(405, { ok: false, reason: 'error' });
	}

	const clientAddress = getClientAddress(request);
	if (!limiter.check(clientAddress).ok) return reply(429, { ok: false, reason: 'rate_limited' });

	let parsed: ReturnType<typeof parseBody> = null;
	try {
		parsed = parseBody(await request.json());
	} catch {
		/* fall through */
	}
	if (!parsed) return reply(400, { ok: false, reason: 'error' });

	let ai;
	try {
		ai = createClient(env.GEMINI_API_KEY);
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
