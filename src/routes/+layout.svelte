<script lang="ts">
	let { children } = $props();
</script>

<header>
	<a href="/" class="brand">Tutor</a>
	<nav aria-label="Main">
		<a href="/">Topics</a>
		<a href="/progress">Progress</a>
	</nav>
</header>
<main>{@render children()}</main>

<style>
	:global(:root) {
		--bg: #f7f7fa;
		--surface: #ececf3;
		--border: #c9c9d6;
		--text: #1d1d28;
		--muted: #6b6b7d;
		--accent: #4a47d6;
	}
	:global(body) {
		margin: 0;
		font-family: system-ui, sans-serif;
		background: var(--bg);
		color: var(--text);
		height: 100dvh;
		display: flex;
		flex-direction: column;
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--border);
	}
	.brand {
		font-weight: 700;
		font-size: 1.2rem;
	}
	nav {
		display: flex;
		gap: 1rem;
	}
	a {
		color: var(--accent);
		text-decoration: none;
	}
	main {
		flex: 1;
		min-height: 0;
		max-width: 1100px;
		width: 100%;
		margin: 0 auto;
	}
</style>
