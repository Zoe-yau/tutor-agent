<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head><title>{page.status} · Tutor</title></svelte:head>

<div class="err" role="alert">
	<h1>{page.status === 404 ? 'Page not found' : 'Something went wrong'}</h1>
	<p>{page.status === 404 ? "We couldn't find that page." : (page.error?.message ?? 'Please try again.')}</p>
	<a href="/">Back to topics</a>
</div>

<style>
	.err {
		padding: 3rem 1rem;
		text-align: center;
	}
</style>
