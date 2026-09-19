import { detectStuck, initialHintState, reduceHint, type HintState } from '$lib/hintLadder';
import type { Analysis, AnalyzeResponse, ChatMessage, StreamEvent } from '$lib/types';

export type SessionStatus = 'idle' | 'streaming' | 'error';

/** Parses a buffer of SSE text into events; returns the events and the unconsumed remainder. */
export function parseSse(buffer: string): { events: StreamEvent[]; rest: string } {
	const parts = buffer.split('\n\n');
	const rest = parts.pop() ?? '';
	const events: StreamEvent[] = [];
	for (const part of parts) {
		const data = part.split('\n').find((l) => l.startsWith('data: '));
		if (!data) continue;
		try {
			events.push(JSON.parse(data.slice(6)) as StreamEvent);
		} catch {
			/* ignore malformed frame */
		}
	}
	return { events, rest };
}

export interface SessionOptions {
	topic?: string;
	knownConcepts?: () => string[];
	onAnalysis?: (analysis: Analysis) => void;
}

export class Session {
	messages = $state<ChatMessage[]>([]);
	status = $state<SessionStatus>('idle');
	error = $state<string | null>(null);
	retryAt = $state<number | null>(null);
	hint = $state<HintState>(initialHintState());

	private abort: AbortController | null = null;

	constructor(private opts: SessionOptions = {}) {}

	/** Sets the concept being discussed; the hint level resets when it changes. */
	setConcept(concept: string): void {
		this.hint = reduceHint(this.hint, { type: 'concept_changed', concept });
	}

	/** Explicit "Show me a hint" button. */
	requestHint(): Promise<void> {
		return this.send('Can I have a hint?', true);
	}

	async send(text: string, hintRequested = false): Promise<void> {
		const content = text.trim();
		if (!content || this.status === 'streaming') return;

		// Only raise the level if there is already a tutor turn to escalate from.
		if (this.messages.length > 0) {
			if (hintRequested) this.hint = reduceHint(this.hint, { type: 'request_hint' });
			else if (detectStuck(content)) this.hint = reduceHint(this.hint, { type: 'stuck' });
		}

		this.error = null;
		this.retryAt = null;
		this.messages.push({ role: 'user', content });
		const history = $state.snapshot(this.messages) as ChatMessage[];
		this.messages.push({ role: 'model', content: '' });
		const reply = this.messages.length - 1;
		this.status = 'streaming';
		this.abort = new AbortController();

		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ messages: history, hintLevel: this.hint.level }),
				signal: this.abort.signal
			});

			if (!res.ok || !res.body) {
				const e = (await res.json().catch(() => null)) as StreamEvent | null;
				this.fail(reply, e?.type === 'error' ? e : null);
				return;
			}

			const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
			let buffer = '';
			let finished = false;
			while (true) {
				const { value, done } = await reader.read();
				if (done) break;
				buffer += value;
				const parsed = parseSse(buffer);
				buffer = parsed.rest;
				for (const ev of parsed.events) {
					if (ev.type === 'token') this.messages[reply].content += ev.text;
					else if (ev.type === 'error') {
						this.fail(reply, ev);
						return;
					} else finished = true;
				}
			}
			if (!finished) this.fail(reply, null);
			else {
				this.status = 'idle';
				void this.analyze(history);
			}
		} catch (err) {
			if ((err as Error).name === 'AbortError') this.status = 'idle';
			else this.fail(reply, null);
		}
	}

	/** Best-effort analysis of the student's latest turn; failures are silent so chat is never blocked. */
	private async analyze(history: ChatMessage[]): Promise<void> {
		try {
			const res = await fetch('/api/analyze', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ messages: history, knownConcepts: this.opts.knownConcepts?.() ?? [], topic: this.opts.topic })
			});
			const data = (await res.json()) as AnalyzeResponse;
			if (!data.ok) return;
			this.setConcept(data.analysis.concepts[0]);
			this.opts.onAnalysis?.(data.analysis);
		} catch {
			/* ignore */
		}
	}

	stop(): void {
		this.abort?.abort();
	}

	private fail(reply: number, e: Extract<StreamEvent, { type: 'error' }> | null): void {
		if (!this.messages[reply]?.content) this.messages.splice(reply, 1);
		this.status = 'error';
		this.error = e?.message ?? 'Could not reach the tutor. Check your connection and try again.';
		this.retryAt = e?.retryAfterMs ? Date.now() + e.retryAfterMs : null;
	}
}
