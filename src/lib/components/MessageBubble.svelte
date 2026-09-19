<script lang="ts">
	import type { ChatMessage } from '$lib/types';

	let { message, pending = false }: { message: ChatMessage; pending?: boolean } = $props();
</script>

<div class="bubble {message.role}">
	<span class="who">{message.role === 'user' ? 'You' : 'Tutor'}</span>
	<p>{message.content}{#if pending}<span class="cursor" aria-hidden="true">▍</span>{/if}</p>
</div>

<style>
	.bubble {
		max-width: 85%;
		padding: 0.6rem 0.9rem;
		border-radius: 12px;
		background: var(--surface);
	}
	.user {
		align-self: flex-end;
		background: var(--accent);
		color: white;
	}
	.model {
		align-self: flex-start;
	}
	.who {
		font-size: 0.75rem;
		opacity: 0.7;
	}
	p {
		margin: 0.15rem 0 0;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.cursor {
		animation: blink 1s steps(2) infinite;
	}
	@keyframes blink {
		50% {
			opacity: 0;
		}
	}
</style>
