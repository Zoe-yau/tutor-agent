<script lang="ts">
	import { page } from '$app/state';
	import ChatWindow from '$lib/components/ChatWindow.svelte';
	import MasteryPanel from '$lib/components/MasteryPanel.svelte';
	import { progress } from '$lib/state/progress.svelte';
	import { Session } from '$lib/state/session.svelte';

	const topicId = page.params.topicId;
	const session = new Session({
		topic: topicId === 'general' ? undefined : topicId,
		knownConcepts: () => Object.keys(progress.mastery),
		onAnalysis: (a) => progress.apply(a)
	});

	let drawerOpen = $state(false);
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (drawerOpen = false)} />

<div class="layout">
	<div class="chat">
		<ChatWindow {session} />
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

<style>
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 300px;
		height: 100%;
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
