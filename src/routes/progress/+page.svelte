<script lang="ts">
	import { onMount } from 'svelte';
	import { masteryLabel } from '$lib/mastery';
	import { progress } from '$lib/state/progress.svelte';
	import { storage, type StoredSession } from '$lib/storage';
	import { suggestTopics } from '$lib/suggest';
	import { TOPICS } from '$lib/topics';

	let sessions = $state<StoredSession[]>([]);
	let ready = $state(false);

	onMount(async () => {
		await progress.init();
		sessions = await storage.listSessions();
		ready = true;
	});

	const used = $derived(sessions.filter((s) => s.messages.length > 0));
	const weak = $derived(progress.ranked.filter(([, m]) => m.score < 0.6).slice(0, 5));
	const suggestions = $derived(suggestTopics(TOPICS, used, progress.mastery));

	async function remove(id: string) {
		await storage.deleteSession(id);
		sessions = sessions.filter((s) => s.id !== id);
	}

	function preview(s: StoredSession): string {
		return s.messages.find((m) => m.role === 'user')?.content.slice(0, 90) ?? '';
	}
</script>

<div class="wrap">
	<h1>Progress</h1>

	{#if !ready}
		<p class="muted">Loading…</p>
	{:else if used.length === 0 && progress.ranked.length === 0}
		<p class="empty">No sessions yet. <a href="/">Pick a topic</a> to start learning.</p>
	{:else}
		<section aria-labelledby="weak">
			<h2 id="weak">Weak spots</h2>
			{#if weak.length === 0}
				<p class="muted">Nothing weak right now. Keep going!</p>
			{:else}
				<ul class="plain">
					{#each weak as [concept, m] (concept)}
						<li>
							<span>{concept}</span>
							<span class="muted">{masteryLabel(m.score)} · {Math.round(m.score * 100)}%</span>
						</li>
					{/each}
				</ul>
			{/if}
			{#if progress.misconceptions.length > 0}
				<h3>Misconceptions spotted</h3>
				<ul class="plain">
					{#each progress.misconceptions as m (m.at + m.label)}
						<li class="misc"><strong>{m.label}</strong> <span>{m.explanation}</span></li>
					{/each}
				</ul>
			{/if}
		</section>

		<section aria-labelledby="next">
			<h2 id="next">Suggested next</h2>
			{#if suggestions.length === 0}
				<p class="muted">You're on top of every topic. Try pasting new material.</p>
			{:else}
				<ul class="plain">
					{#each suggestions as s (s.topic.id)}
						<li>
							<a href="/learn/{s.topic.id}">{s.topic.title}</a>
							<span class="muted">{s.reason}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<section aria-labelledby="history">
			<h2 id="history">History</h2>
			<ul class="plain">
				{#each used as s (s.id)}
					<li>
						<div>
							<a href="/learn/{s.topicId}?session={s.id}">{s.topicTitle}</a>
							<div class="muted small">
								{new Date(s.updatedAt).toLocaleString()} · {s.messages.length} messages
								{#if preview(s)}· “{preview(s)}”{/if}
							</div>
						</div>
						<button type="button" onclick={() => remove(s.id)} aria-label="Delete session {s.topicTitle}">Delete</button>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</div>

<style>
	.wrap {
		padding: 1.5rem 1rem 3rem;
		overflow-y: auto;
		height: 100%;
		box-sizing: border-box;
	}
	h1 {
		margin: 0 0 1rem;
	}
	h2 {
		font-size: 1.1rem;
		margin: 1.5rem 0 0.5rem;
	}
	h3 {
		font-size: 0.95rem;
		margin: 1rem 0 0.5rem;
	}
	.plain {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding: 0.6rem 0.8rem;
		background: white;
		border: 1px solid var(--border);
		border-radius: 8px;
	}
	li.misc {
		display: block;
		background: #fff4e0;
		color: #5c3a00;
		border-color: #f0d9a8;
	}
	.muted {
		color: var(--muted);
	}
	.small {
		font-size: 0.8rem;
	}
	.empty {
		color: var(--muted);
	}
	button {
		font: inherit;
		font-size: 0.8rem;
		padding: 0.25rem 0.6rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: transparent;
		cursor: pointer;
		flex-shrink: 0;
	}
</style>
