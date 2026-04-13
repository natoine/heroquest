<script lang="ts">
	import '../app.css';
	import { isLoading } from 'svelte-i18n';
	import { authUser } from '$lib/stores/auth';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';

	let { children, data } = $props();

	// Sync server-side user into client store on every navigation
	$effect(() => {
		authUser.set(data.user ?? null);
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{#if $isLoading}
	<div class="loading-screen" aria-busy="true" aria-label="Loading…">
		<div class="loading-torch" aria-hidden="true">🔥</div>
	</div>
{:else}
	<Header />
	<main>
		{@render children()}
	</main>
	<Footer />
{/if}

<style>
	.loading-screen {
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg);
	}

	.loading-torch {
		font-size: 3rem;
		animation: flicker 1s ease-in-out infinite;
	}

	main {
		flex: 1;
	}
</style>
