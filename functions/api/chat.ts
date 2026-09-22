import { LIMITS, MODELS } from '../../src/lib/config';
import { RateLimitedError, createClient, errorStatus, streamChat } from '../../src/lib/server/gemini';
import { createLimiter } from '../../src/lib/server/rateLimit';
import { buildTutorPrompt, type TutorContext } from '../../src/lib/server/tutorPrompt';
import type { HintLevel } from '../../src/lib/hintLadder';
import type { ChatMessage, StreamEvent } from '../../src/lib/types';

const limiter = createLimiter(LIMITS.requestsPerWindow, LIMITS.windowMs);

function parseMessages(body: unknown): ChatMessage[] | null {
	const messages = (body as { messages?: unknown })?.messages;
	if (!Array.isArray(messages) || messages.length === 0 || messages.length > LIMITS.maxMessages) return null;
	for (const m of messages) {
		if (!m || (m.role !== 'user' && m.role !== 'model')) return null;
		if (typeof m.content !== 'string' || !m.content.trim() || m.content.length > LIMITS.maxMessageChars) return null;
	}
	if (messages[messages.length - 1].role !== 'user') return null;
	return messages.map((m) => ({ role: m.role, content: m.content }));
}

function parseContext(body: unknown): TutorContext | null {
	const b = body as { topic?: unknown; material?: unknown } | null;
	const ctx: TutorContext = {};
	if (typeof b?.topic === 'string') ctx.topic = b.topic.slice(0, 100);
	if (b?.material !== undefined) {
		if (typeof b.material !== 'string' || b.material.length > LIMITS.maxMaterialChars) return null;
		if (b.material.trim()) ctx.material = b.material;
	}
	return ctx;
}

function parseHintLevel(body: unknown): HintLevel {
	const l = (body as { hintLevel?: unknown })?.hintLevel;
	return l === 2 || l === 3 || l === 4 ? l : 1;
}

function getClientAddress(request: Request): string {
	return request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
}

const json = (status: number, event: StreamEvent, headers: HeadersInit = {}) =>
	new Response(JSON.stringify(event), { status, headers: { 'content-type': 'application/json', ...headers } });

export const onRequest: PagesFunction = async (context) => {
	const { request, env } = context;

	if (request.method !== 'POST') {
		return json(405, { type: 'error', code: 'method_not_allowed', message: 'POST only' });
	}

	const clientAddress = getClientAddress(request);
	const limit = limiter.check(clientAddress);
	if (!limit.ok) {
		return json(
			429,
			{ type: 'error', code: 'rate_limited', message: 'Too many requests. Please wait a moment.', retryAfterMs: limit.retryAfterMs },
			{ 'retry-after': String(Math.ceil(limit.retryAfterMs / 1000)) }
		);
	}

	let messages: ChatMessage[] | null = null;
	let hintLevel: HintLevel = 1;
	let context_data: TutorContext | null = null;
	try {
		const body = await request.json();
		messages = parseMessages(body);
		hintLevel = parseHintLevel(body);
		context_data = parseContext(body);
	} catch {
		/* fall through to 400 */
	}
	if (!messages || !context_data) return json(400, { type: 'error', code: 'bad_request', message: 'Invalid chat request.' });

	let ai;
	try {
		ai = createClient(env.GEMINI_API_KEY);
	} catch {
		return json(500, { type: 'error', code: 'server', message: 'The tutor is not configured yet (missing API key).' });
	}

	const encoder = new TextEncoder();
	const send = (c: ReadableStreamDefaultController, e: StreamEvent) =>
		c.enqueue(encoder.encode(`event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`));

	const stream = new ReadableStream({
		async start(controller) {
			try {
				for await (const text of streamChat(ai, MODELS.tutor, buildTutorPrompt(hintLevel, context_data), messages)) {
					send(controller, { type: 'token', text });
				}
				send(controller, { type: 'done' });
			} catch (err) {
				const limited = err instanceof RateLimitedError || errorStatus(err) === 429;
				send(
					controller,
					limited
						? { type: 'error', code: 'rate_limited', message: 'The tutor is busy right now. Please try again in a moment.', retryAfterMs: 10_000 }
						: { type: 'error', code: 'server', message: 'Something went wrong talking to the tutor. Please try again.' }
				);
			} finally {
				controller.close();
			}
		}
	});

	return new Response(stream, {
		headers: { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-cache, no-transform' }
	});
};
