<script lang="ts">
	import { onMount } from 'svelte';
	import { goto, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import ChatWindow from '$lib/components/ChatWindow.svelte';
	import MasteryPanel from '$lib/components/MasteryPanel.svelte';
	import { progress } from '$lib/state/progress.svelte';
	import { Session } from '$lib/state/session.svelte';
	import { storage } from '$lib/storage';
	import { CUSTOM_TOPIC_ID, getTopic } from '$lib/topics';

	const topicId = page.params.topicId ?? '';
	const sessionParam = page.url.searchParams.get('session');

	let session = $state<Session | null>(null);
	let drawerOpen = $state(false);

	const intro = (s: Session) =>
		topicId === CUSTOM_TOPIC_ID
			? `Let's work through your material. Tell me what you already understand, or ask about any part of it.`
			: `Let's explore ${s.snapshot().topicTitle}. Tell me what you already know, or ask a question.`;

	onMount(async () => {
		await progress.init();
		const builtin = getTopic(topicId);
		let saved = sessionParam ? await storage.getSession(sessionParam) : null;
		if (saved && saved.topicId !== topicId) saved = null;

		// Custom sessions need their saved material; unknown topics have nothing to teach.
		if ((topicId === CUSTOM_TOPIC_ID && !saved) || (!builtin && topicId !== CUSTOM_TOPIC_ID)) {
			await goto('/', { replaceState: true });
			return;
		}

		const id = saved?.id ?? sessionParam ?? crypto.randomUUID();
		const s = new Session({
			id,
			topicId,
			topicTitle: saved?.topicTitle ?? builtin?.title ?? 'Study session',
			material: saved?.material,
			knownConcepts: () => Object.keys(progress.mastery),
			onAnalysis: (a) => progress.apply(a),
			onPersist: (x) => void storage.saveSession(x)
		});
		if (saved) s.restore(saved);
		if (!sessionParam) replaceState(`?session=${id}`, {});
		session = s;
	});
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (drawerOpen = false)} />

{#if session}
<div class="layout">
	<div class="chat">
		<ChatWindow {session} intro={intro(session)} />
	</div>
	<aside class:open={drawerOpen} aria-label="Mastery and misconceptions">
		<MasteryPanel {progress} />
	</aside>
	<button
		class="toggle"
		type="button"
		aria-expanded={drawerOpen}
		onclick={() => (drawerOpen = !drawerOpen)}
	>
		{drawerOpen ? 'Hide progress' : 'Show progress'}
	</button>
</div>
{:else}
	<p class="loading">Loading…</p>
{/if}

<style>
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 300px;
		height: 100%;
	}
	.loading {
		padding: 2rem 1rem;
		color: var(--muted);
	}
	.chat {
		min-height: 0;
		min-width: 0;
	}
	aside {
		padding: 1rem;
		border-left: 1px solid var(--border);
		overflow-y: auto;
	}
	.toggle {
		display: none;
	}
	@media (max-width: 767px) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
			grid-template-rows: auto minmax(0, 1fr);
		}
		aside {
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
			max-height: 60dvh;
			background: var(--bg);
			border: 0;
			border-top: 1px solid var(--border);
			border-radius: 16px 16px 0 0;
			box-shadow: 0 -4px 16px rgb(0 0 0 / 0.15);
			transform: translateY(100%);
			visibility: hidden;
			transition: transform 0.25s, visibility 0.25s;
			z-index: 10;
		}
		aside.open {
			transform: none;
			visibility: visible;
		}
		.toggle {
			display: block;
			order: -1;
			justify-self: end;
			margin: 0.5rem 1rem 0;
			font: inherit;
			font-size: 0.85rem;
			padding: 0.3rem 0.7rem;
			border-radius: 8px;
			border: 1px solid var(--accent);
			background: var(--bg);
			color: var(--accent);
		}
	}
</style>
