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
