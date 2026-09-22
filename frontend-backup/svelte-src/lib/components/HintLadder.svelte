<script lang="ts">
	import { HINT_LEVEL_LABELS, MAX_HINT_LEVEL, type HintLevel } from '$lib/hintLadder';

	let { level, disabled = false, onhint }: { level: HintLevel; disabled?: boolean; onhint: () => void } = $props();

	const levels = [1, 2, 3, 4] as HintLevel[];
</script>

<div class="ladder">
	<ol aria-label="Hint level">
		{#each levels as l (l)}
			<li class:active={l === level} class:done={l < level} aria-current={l === level ? 'step' : undefined}>
				<span class="n">{l}</span>
				<span class="label">{HINT_LEVEL_LABELS[l]}</span>
			</li>
		{/each}
	</ol>
	<button type="button" {disabled} onclick={onhint}>
		{level >= MAX_HINT_LEVEL ? 'Explain again' : 'Show me a hint'}
	</button>
</div>

<style>
	.ladder {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0 1rem;
		flex-wrap: wrap;
	}
	ol {
		display: flex;
		gap: 0.4rem;
		list-style: none;
		margin: 0;
		padding: 0;
		font-size: 0.8rem;
	}
	li {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		color: var(--muted);
	}
	.n {
		display: inline-grid;
		place-items: center;
		width: 1.4rem;
		height: 1.4rem;
		border-radius: 50%;
		border: 1px solid var(--border);
	}
	.done .n,
	.active .n {
		background: var(--accent);
		border-color: var(--accent);
		color: white;
	}
	.active {
		color: var(--text);
		font-weight: 600;
	}
	.label {
		display: none;
	}
	.active .label {
		display: inline;
	}
	@media (min-width: 640px) {
		.label {
			display: inline;
		}
	}
	button {
		font: inherit;
		font-size: 0.85rem;
		padding: 0.35rem 0.8rem;
		border-radius: 8px;
		border: 1px solid var(--accent);
		background: transparent;
		color: var(--accent);
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
