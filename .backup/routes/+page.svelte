<script lang="ts">
	import { goto } from '$app/navigation';
	import TopicCard from '$lib/components/TopicCard.svelte';
	import { LIMITS } from '$lib/config';
	import { storage } from '$lib/storage';
	import { CUSTOM_TOPIC_ID, TOPICS } from '$lib/topics';

	let title = $state('');
	let material = $state('');
	const remaining = $derived(LIMITS.maxMaterialChars - material.length);

	async function startCustom(e: SubmitEvent) {
		e.preventDefault();
		const text = material.trim();
		if (!text) return;
		const id = crypto.randomUUID();
		const now = Date.now();
		await storage.saveSession({
			id,
			topicId: CUSTOM_TOPIC_ID,
			topicTitle: title.trim() || 'My study material',
			material: text.slice(0, LIMITS.maxMaterialChars),
			messages: [],
			hint: { level: 1, concept: null },
			concepts: [],
			startedAt: now,
			updatedAt: now
		});
		await goto(`/learn/${CUSTOM_TOPIC_ID}?session=${id}`);
	}
</script>

<svelte:head><title>Topics · Tutor</title></svelte:head>

<div class="home">
	<h1>What would you like to learn?</h1>
	<p class="lead">Pick a topic and your tutor will guide you with questions and hints.</p>

	<div class="grid">
		{#each TOPICS as topic (topic.id)}
			<TopicCard {topic} />
		{/each}
	</div>

	<h2>Or paste your own material</h2>
	<p class="lead">Text you paste is sent to Google Gemini. Avoid personal or confidential content.</p>
	<form onsubmit={startCustom}>
		<label>
			Title (optional)
			<input bind:value={title} maxlength="100" placeholder="e.g. Chapter 4 notes" />
		</label>
		<label>
			Study material
			<textarea
				bind:value={material}
				maxlength={LIMITS.maxMaterialChars}
				rows="6"
				placeholder="Paste notes, a textbook passage, or a problem set…"
			></textarea>
		</label>
		<div class="row">
			<span class="count" class:low={remaining < 500}>{remaining.toLocaleString()} characters left</span>
			<button type="submit" disabled={!material.trim()}>Start session</button>
		</div>
	</form>
</div>

<style>
	.home {
		padding: 1.5rem 1rem 3rem;
		overflow-y: auto;
		height: 100%;
		box-sizing: border-box;
	}
	h1 {
		margin: 0 0 0.25rem;
	}
	.lead {
		margin: 0 0 1.25rem;
		color: var(--muted);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
		gap: 0.75rem;
	}
	h2 {
		margin: 2rem 0 0.75rem;
		font-size: 1.1rem;
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.9rem;
	}
	input,
	textarea {
		font: inherit;
		padding: 0.5rem;
		border: 1px solid var(--border);
		border-radius: 8px;
	}
	.row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.count {
		font-size: 0.8rem;
		color: var(--muted);
	}
	.count.low {
		color: #8a1c1c;
	}
	button {
		font: inherit;
		padding: 0.5rem 1.1rem;
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
</style>
