<script lang="ts">
	import { tick } from 'svelte';
	import type { Session } from '$lib/state/session.svelte';
	import HintLadder from './HintLadder.svelte';
	import MessageBubble from './MessageBubble.svelte';

	let { session, intro = 'Ask a question to get started.' }: { session: Session; intro?: string } = $props();

	let draft = $state('');
	let log: HTMLElement;
	let now = $state(Date.now());

	const waitSeconds = $derived(session.retryAt ? Math.max(0, Math.ceil((session.retryAt - now) / 1000)) : 0);
	const blocked = $derived(session.status === 'streaming' || waitSeconds > 0);

	$effect(() => {
		if (!session.retryAt) return;
		const t = setInterval(() => (now = Date.now()), 500);
		return () => clearInterval(t);
	});

	$effect(() => {
		session.messages.at(-1)?.content;
		tick().then(() => log?.scrollTo({ top: log.scrollHeight }));
	});

	function submit(e: SubmitEvent) {
		e.preventDefault();
		if (blocked || !draft.trim()) return;
		const text = draft;
		draft = '';
		session.send(text);
	}
</script>

<section class="chat" aria-label="Chat with your tutor">
	<div class="log" bind:this={log} role="log" aria-live="polite" aria-busy={session.status === 'streaming'}>
		{#if session.messages.length === 0}
			<p class="empty">{intro}</p>
		{/if}
		{#each session.messages as message, i (i)}
			<MessageBubble {message} pending={session.status === 'streaming' && i === session.messages.length - 1} />
		{/each}
		{#if session.status === 'streaming' && session.messages.at(-1)?.content === ''}
			<p class="empty">Tutor is thinking…</p>
		{/if}
	</div>

	{#if session.error}
		<p class="error" role="alert">
			{session.error}{#if waitSeconds > 0} Try again in {waitSeconds}s.{/if}
		</p>
	{/if}

	<HintLadder
		level={session.hint.level}
		disabled={blocked || session.messages.length === 0}
		onhint={() => session.requestHint()}
	/>

	<form onsubmit={submit}>
		<label class="sr-only" for="draft">Your message</label>
		<textarea
			id="draft"
			bind:value={draft}
			rows="2"
			placeholder="Type your message…"
			onkeydown={(e) => {
				if (e.key === 'Enter' && !e.shiftKey) {
					e.preventDefault();
					e.currentTarget.form?.requestSubmit();
				}
			}}
		></textarea>
		{#if session.status === 'streaming'}
			<button type="button" onclick={() => session.stop()}>Stop</button>
		{:else}
			<button type="submit" disabled={blocked || !draft.trim()}>
				{waitSeconds > 0 ? `Wait ${waitSeconds}s` : 'Send'}
			</button>
		{/if}
	</form>
</section>

<style>
	.chat {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
	}
	.log {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding: 1rem;
	}
	.empty {
		color: var(--muted);
		text-align: center;
		margin: auto;
	}
	.error {
		margin: 0 1rem;
		padding: 0.5rem 0.75rem;
		border-radius: 8px;
		background: #fde8e8;
		color: #8a1c1c;
	}
	form {
		display: flex;
		gap: 0.5rem;
		padding: 1rem;
	}
	textarea {
		flex: 1;
		resize: none;
		font: inherit;
		padding: 0.5rem;
		border-radius: 8px;
		border: 1px solid var(--border);
	}
	button {
		font: inherit;
		padding: 0 1.1rem;
		border: 0;
		border-radius: 8px;
		background: var(--accent);
		color: white;
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
	}
</style>
