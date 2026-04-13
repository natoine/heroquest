<script lang="ts">
	import { t } from 'svelte-i18n';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';


	const user = $derived(page.data.user ?? null);

	async function handleLogout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		await invalidateAll();
		goto('/');
	}
</script>

<header class="site-header">
	<div class="container header-inner">
		<a href="/" class="logo" aria-label="HeroQuest — Home">
			<span class="logo-torch" aria-hidden="true">⚔️</span>
			<span class="logo-text">HeroQuest</span>
		</a>

		<nav class="nav" aria-label="Main navigation">
			<a href="/changelog" class="nav-link">{$t('nav.changelog')}</a>
		</nav>

		<div class="header-auth">
			{#if user}
				<a href="/account" class="username">🛡 {user.username}</a>
				<button class="btn-ghost" onclick={handleLogout}>{$t('auth.logout')}</button>
			{:else}
				<a href="/login" class="btn-ghost">{$t('auth.login')}</a>
				<a href="/register" class="btn btn-primary btn-xs">{$t('auth.register')}</a>
			{/if}
		</div>
	</div>
</header>

<style>
	.site-header {
		position: sticky;
		top: 0;
		z-index: 100;
		background: rgba(13, 7, 0, 0.92);
		border-bottom: 1px solid var(--color-border);
		backdrop-filter: blur(8px);
	}

	.header-inner {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding-block: var(--space-sm);
	}

	.logo {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-gold);
		text-decoration: none;
		flex-shrink: 0;
	}
	.logo:hover { color: var(--color-gold-light); }

	.logo-torch {
		font-size: 1.1rem;
		animation: flicker 2s ease-in-out infinite;
	}

	.nav {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-left: auto;
	}

	.nav-link {
		font-family: var(--font-display);
		font-size: 0.85rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		transition: color var(--transition);
	}
	.nav-link:hover { color: var(--color-text-accent); }

	.header-auth {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.username {
		font-family: var(--font-display);
		font-size: 0.85rem;
		color: var(--color-text-accent);
		text-decoration: none;
		transition: color var(--transition);
	}
	.username:hover { color: var(--color-gold-light); }

	.btn-ghost {
		background: none;
		border: none;
		cursor: pointer;
		font-family: var(--font-display);
		font-size: 0.85rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		transition: color var(--transition);
		text-decoration: none;
		padding: var(--space-xs) var(--space-sm);
	}
	.btn-ghost:hover { color: var(--color-text-accent); }

	.btn-xs {
		padding: var(--space-xs) var(--space-md);
		font-size: 0.8rem;
	}
</style>
