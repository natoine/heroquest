<script lang="ts">
	import { t } from 'svelte-i18n';
	import { HERO_STATS, type HeroClass } from '$lib/game/types';

	let { heroClass }: { heroClass: HeroClass } = $props();

	const stats = HERO_STATS[heroClass];

	const emoji: Record<HeroClass, string> = {
		barbarian: '🪓',
		dwarf:     '⛏️',
		elf:       '🏹',
		wizard:    '🔮'
	};
</script>

<article class="hero-card">
	<div class="hero-avatar" aria-hidden="true">{emoji[heroClass]}</div>
	<h3 class="hero-name">{$t(`landing.heroes.${heroClass}.name`)}</h3>
	<p class="hero-desc">{$t(`landing.heroes.${heroClass}.description`)}</p>

	<dl class="stats-grid">
		<div class="stat">
			<dt class="stat-label">{$t('hero.stats.move')}</dt>
			<dd class="stat-value">{stats.move}</dd>
		</div>
		<div class="stat">
			<dt class="stat-label">{$t('hero.stats.attack')}</dt>
			<dd class="stat-value">{stats.attack}</dd>
		</div>
		<div class="stat">
			<dt class="stat-label">{$t('hero.stats.defend')}</dt>
			<dd class="stat-value">{stats.defend}</dd>
		</div>
		<div class="stat">
			<dt class="stat-label">{$t('hero.stats.body')}</dt>
			<dd class="stat-value">{stats.body}</dd>
		</div>
		<div class="stat">
			<dt class="stat-label">{$t('hero.stats.mind')}</dt>
			<dd class="stat-value">{stats.mind}</dd>
		</div>
	</dl>
</article>

<style>
	.hero-card {
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-xl);
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: var(--space-sm);
		transition: border-color var(--transition), box-shadow var(--transition), transform var(--transition);
	}

	.hero-card:hover {
		border-color: var(--color-border-glow);
		box-shadow: 0 0 24px rgba(200, 125, 47, 0.15);
		transform: translateY(-3px);
	}

	.hero-avatar {
		font-size: 3rem;
		animation: drift 3s ease-in-out infinite;
	}

	.hero-name {
		font-size: 1.1rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.hero-desc {
		font-size: 0.85rem;
		color: var(--color-text-muted);
		line-height: 1.5;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: var(--space-xs);
		width: 100%;
		margin-top: var(--space-sm);
		border-top: 1px solid var(--color-border);
		padding-top: var(--space-md);
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}

	.stat-label {
		font-size: 0.6rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-text-muted);
	}

	.stat-value {
		font-family: var(--font-display);
		font-size: 1.1rem;
		color: var(--color-gold);
		font-weight: 700;
	}
</style>
