<!-- Shared layout shell for all auth pages -->
<script lang="ts">
	let { title, children }: { title: string; children: import('svelte').Snippet } = $props();
</script>

<div class="auth-page">
	<div class="auth-card">
		<a href="/" class="auth-logo" aria-label="HeroQuest home">
			<span aria-hidden="true">⚔️</span> HeroQuest
		</a>
		<h1 class="auth-title">{title}</h1>
		{@render children()}
	</div>
</div>

<style>
	.auth-page {
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-md);
		background:
			radial-gradient(ellipse 60% 50% at 50% 0%, rgba(200, 125, 47, 0.07) 0%, transparent 70%),
			var(--color-bg);
	}

	.auth-card {
		width: 100%;
		max-width: 420px;
		background: var(--color-bg-raised);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-2xl);
		box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
	}

	.auth-logo {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-family: var(--font-display);
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--color-gold);
		text-decoration: none;
		margin-bottom: var(--space-xl);
	}
	.auth-logo:hover { color: var(--color-gold-light); }

	.auth-title {
		font-size: 1.5rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-bottom: var(--space-xl);
	}

	/* Form styles shared by children via :global */
	:global(.auth-card .form-group) {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		margin-bottom: var(--space-md);
	}

	:global(.auth-card label) {
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
		font-family: var(--font-display);
	}

	:global(.auth-card .form-input) {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text);
		font-family: var(--font-body);
		font-size: 1rem;
		transition: border-color var(--transition), box-shadow var(--transition);
		outline: none;
	}

	:global(.auth-card .form-input:focus) {
		border-color: var(--color-border-glow);
		box-shadow: 0 0 0 2px rgba(200, 125, 47, 0.2);
	}

	:global(.auth-card .error-msg) {
		background: rgba(139, 26, 26, 0.2);
		border: 1px solid var(--color-red);
		border-radius: var(--radius-sm);
		padding: var(--space-sm) var(--space-md);
		font-size: 0.875rem;
		color: #ff8080;
		margin-bottom: var(--space-md);
	}

	:global(.auth-card .success-msg) {
		background: rgba(26, 90, 26, 0.2);
		border: 1px solid #2d7a2d;
		border-radius: var(--radius-sm);
		padding: var(--space-sm) var(--space-md);
		font-size: 0.875rem;
		color: #80cc80;
		margin-bottom: var(--space-md);
	}

	:global(.auth-card .form-footer) {
		margin-top: var(--space-lg);
		text-align: center;
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	:global(.auth-card .form-footer a) {
		color: var(--color-text-accent);
	}

	:global(.auth-card .btn-full) {
		width: 100%;
		margin-top: var(--space-sm);
	}
</style>
