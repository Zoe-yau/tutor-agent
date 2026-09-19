export type Role = 'user' | 'model';

export interface ChatMessage {
	role: Role;
	content: string;
}

export interface ChatRequest {
	messages: ChatMessage[];
	hintLevel: 1 | 2 | 3 | 4;
}

/** SSE events emitted by /api/chat. */
export type StreamEvent =
	| { type: 'token'; text: string }
	| { type: 'error'; code: 'rate_limited' | 'server' | 'bad_request'; message: string; retryAfterMs?: number }
	| { type: 'done' };

export interface Misconception {
	label: string;
	explanation: string;
}

export interface Analysis {
	/** Concepts the student's latest turn touched (1-5, short names). */
	concepts: string[];
	/** Confidence 0-1 that the student understands those concepts, judged from their turn. */
	confidence: number;
	misconception: Misconception | null;
}

export type AnalyzeResponse = { ok: true; analysis: Analysis } | { ok: false; reason: 'malformed' | 'rate_limited' | 'error' };
