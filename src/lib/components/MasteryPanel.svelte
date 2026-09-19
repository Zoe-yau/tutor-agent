<script lang="ts">
	import { masteryLabel } from '$lib/mastery';
	import type { Progress } from '$lib/state/progress.svelte';

	let { progress }: { progress: Progress } = $props();
</script>

<div class="panel">
	<h2>Mastery</h2>
	{#if progress.ranked.length === 0}
		<p class="empty">Concepts will appear here as you chat.</p>
	{:else}
		<ul>
			{#each progress.ranked as [concept, m] (concept)}
				<li>
					<div class="row">
						<span>{concept}</span>
						<span class="tag {masteryLabel(m.score).toLowerCase()}">{masteryLabel(m.score)}</span>
					</div>
					<div
						class="bar"
						role="meter"
						aria-label="{concept} mastery"
						aria-valuemin="0"
						aria-valuemax="100"
						aria-valuenow={Math.round(m.score * 100)}
					>
						<div class="fill" style="width: {m.score * 100}%"></div>
					</div>
				</li>
			{/each}
		</ul>
	{/if}

	<h2>Misconceptions</h2>
	{#if progress.misconceptions.length === 0}
		<p class="empty">None detected.</p>
	{:else}
		<ul>
			{#each progress.misconceptions as m (m.at + m.label)}
				<li class="misc">
					<strong>{m.label}</strong>
					<span>{m.explanation}</span>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	h2 {
		font-size: 0.95rem;
		margin: 0 0 0.5rem;
	}
	h2:not(:first-child) {
		margin-top: 1.25rem;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	.row {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		font-size: 0.9rem;
	}
	.tag {
		font-size: 0.75rem;
		color: var(--muted);
	}
	.bar {
		height: 6px;
		background: var(--surface);
		border-radius: 3px;
		overflow: hidden;
		margin-top: 0.2rem;
	}
	.fill {
		height: 100%;
		background: var(--accent);
		transition: width 0.4s;
	}
	.misc {
		display: flex;
		flex-direction: column;
		font-size: 0.85rem;
		padding: 0.5rem;
		border-radius: 8px;
		background: #fff4e0;
		color: #5c3a00;
	}
	.empty {
		color: var(--muted);
		font-size: 0.85rem;
		margin: 0;
	}
</style>
