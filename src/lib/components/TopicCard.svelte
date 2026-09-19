<script lang="ts">
	import type { Topic } from '$lib/topics';

	let { topic, note }: { topic: Topic; note?: string } = $props();
</script>

<a class="card" href="/learn/{topic.id}">
	<h3>{topic.title}</h3>
	<p>{topic.description}</p>
	{#if note}<span class="note">{note}</span>{/if}
</a>

<style>
	.card {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 1rem;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: white;
		color: var(--text);
		text-decoration: none;
	}
	.card:hover,
	.card:focus-visible {
		border-color: var(--accent);
		outline: none;
		box-shadow: 0 0 0 2px var(--accent);
	}
	h3 {
		margin: 0;
		font-size: 1.05rem;
	}
	p {
		margin: 0;
		color: var(--muted);
		font-size: 0.9rem;
	}
	.note {
		font-size: 0.8rem;
		color: var(--accent);
	}
</style>
