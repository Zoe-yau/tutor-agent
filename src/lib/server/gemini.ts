import { GoogleGenAI, type Schema } from '@google/genai';
import type { ChatMessage } from '$lib/types';

export class RateLimitedError extends Error {
	constructor(
		message = 'Gemini rate limit reached',
		public retryAfterMs?: number
	) {
		super(message);
		this.name = 'RateLimitedError';
	}
}

export interface RetryOptions {
	retries?: number;
	baseMs?: number;
	maxMs?: number;
	sleep?: (ms: number) => Promise<void>;
	random?: () => number;
}

/** True for errors worth retrying: HTTP 429 (quota) and 503 (overloaded). */
export function isRetryable(err: unknown): boolean {
	return errorStatus(err) === 429 || errorStatus(err) === 503;
}

export function errorStatus(err: unknown): number | undefined {
	if (typeof err !== 'object' || err === null) return undefined;
	const e = err as { status?: unknown; code?: unknown; message?: unknown };
	if (typeof e.status === 'number') return e.status;
	if (typeof e.code === 'number') return e.code;
	const msg = typeof e.message === 'string' ? e.message : '';
	if (/\b429\b|RESOURCE_EXHAUSTED/.test(msg)) return 429;
	if (/\b503\b|UNAVAILABLE/.test(msg)) return 503;
	return undefined;
}

/**
 * Runs `fn`, retrying retryable errors with exponential backoff + full jitter.
 * After the retries are exhausted a 429 becomes RateLimitedError; other errors are rethrown.
 */
export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
	const {
		retries = 3,
		baseMs = 500,
		maxMs = 8_000,
		sleep = (ms) => new Promise((r) => setTimeout(r, ms)),
		random = Math.random
	} = opts;

	for (let attempt = 0; ; attempt++) {
		try {
			return await fn();
		} catch (err) {
			if (!isRetryable(err)) throw err;
			if (attempt >= retries) {
				if (errorStatus(err) === 429) throw new RateLimitedError(undefined, maxMs);
				throw err;
			}
			const ceiling = Math.min(maxMs, baseMs * 2 ** attempt);
			await sleep(Math.floor(random() * ceiling));
		}
	}
}

export function createClient(apiKey: string | undefined): GoogleGenAI {
	if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');
	return new GoogleGenAI({ apiKey });
}

/** Streams text chunks. Retries only while establishing the stream, before any token is sent. */
export async function* streamChat(
	ai: GoogleGenAI,
	model: string,
	systemInstruction: string,
	messages: ChatMessage[]
): AsyncGenerator<string> {
	const stream = await withRetry(() =>
		ai.models.generateContentStream({
			model,
			contents: messages.map((m) => ({ role: m.role, parts: [{ text: m.content }] })),
			config: { systemInstruction }
		})
	);
	for await (const chunk of stream) {
		if (chunk.text) yield chunk.text;
	}
}

/** One-shot structured-output call; returns the raw JSON text (validate before use). */
export async function generateJson(
	ai: GoogleGenAI,
	model: string,
	systemInstruction: string,
	prompt: string,
	responseSchema: Schema
): Promise<string> {
	const res = await withRetry(() =>
		ai.models.generateContent({
			model,
			contents: prompt,
			config: { systemInstruction, responseMimeType: 'application/json', responseSchema, temperature: 0 }
		})
	);
	return res.text ?? '';
}
