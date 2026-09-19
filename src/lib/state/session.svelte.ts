import type { ChatMessage, StreamEvent } from '$lib/types';

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

export class Session {
	messages = $state<ChatMessage[]>([]);
	status = $state<SessionStatus>('idle');
	error = $state<string | null>(null);
	retryAt = $state<number | null>(null);

	private abort: AbortController | null = null;

	async send(text: string): Promise<void> {
		const content = text.trim();
		if (!content || this.status === 'streaming') return;

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
				body: JSON.stringify({ messages: history }),
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
			else this.status = 'idle';
		} catch (err) {
			if ((err as Error).name === 'AbortError') this.status = 'idle';
			else this.fail(reply, null);
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
