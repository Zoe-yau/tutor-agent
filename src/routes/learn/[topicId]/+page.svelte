<script lang="ts">
	import ChatWindow from '$lib/components/ChatWindow.svelte';
	import { Session } from '$lib/state/session.svelte';

	const session = new Session();
</script>

<ChatWindow {session} />
