<script lang="ts">
	import { t } from 'svelte-i18n';
	import type { PageData } from './$types';
	import HeroCard from '$lib/components/ui/HeroCard.svelte';
	import type { HeroClass } from '$lib/game/types';

	let { data }: { data: PageData } = $props();

	const heroClasses: HeroClass[] = ['barbarian', 'dwarf', 'elf', 'wizard'];
</script>

<svelte:head>
	<title>{$t('meta.title')}</title>
	<meta name="description" content={$t('meta.description')} />
</svelte:head>

<!-- ═══════════════════════════════════════════════════════════
     HERO SECTION
     ═══════════════════════════════════════════════════════════ -->
<section class="hero-section" aria-labelledby="hero-title">
	<div class="hero-bg" aria-hidden="true">
		<div class="torch torch-left"></div>
		<div class="torch torch-right"></div>
		<div class="dungeon-grid" aria-hidden="true"></div>
	</div>

	<div class="container hero-content">
		<h1 id="hero-title" class="hero-title">{$t('landing.hero.title')}</h1>
		<p class="hero-tagline">{$t('landing.hero.tagline')}</p>

		<div class="hero-actions">
			<a href="/lobby" class="btn btn-primary">
				<span>⚔️</span>
				{$t('landing.hero.cta')}
			</a>
			<a href="#how-to-play" class="btn btn-secondary">
				{$t('landing.hero.secondary')}
			</a>
		</div>
	</div>
</section>

<!-- ═══════════════════════════════════════════════════════════
     HERO CLASSES
     ═══════════════════════════════════════════════════════════ -->
<section class="section heroes-section" aria-labelledby="heroes-title">
	<div class="container">
		<h2 id="heroes-title" class="section-title">{$t('landing.heroes.title')}</h2>
		<p class="section-subtitle">{$t('landing.heroes.subtitle')}</p>

		<div class="heroes-grid">
			{#each heroClasses as heroClass}
				<HeroCard {heroClass} />
			{/each}
		</div>
	</div>
</section>

<!-- ═══════════════════════════════════════════════════════════
     HOW TO PLAY
     ═══════════════════════════════════════════════════════════ -->
<section class="section how-section" id="how-to-play" aria-labelledby="how-title">
	<div class="container">
		<h2 id="how-title" class="section-title">{$t('landing.howToPlay.title')}</h2>
		<p class="section-subtitle">{$t('landing.howToPlay.subtitle')}</p>

		<ol class="steps-list" role="list">
			<li class="step-item">
				<div class="step-icon" aria-hidden="true">🏰</div>
				<div class="step-body">
					<h3 class="step-title">{$t('landing.howToPlay.steps.lobby.title')}</h3>
					<p class="step-desc">{$t('landing.howToPlay.steps.lobby.description')}</p>
				</div>
			</li>
			<li class="step-item">
				<div class="step-icon" aria-hidden="true">🦸</div>
				<div class="step-body">
					<h3 class="step-title">{$t('landing.howToPlay.steps.hero.title')}</h3>
					<p class="step-desc">{$t('landing.howToPlay.steps.hero.description')}</p>
				</div>
			</li>
			<li class="step-item">
				<div class="step-icon" aria-hidden="true">🐉</div>
				<div class="step-body">
					<h3 class="step-title">{$t('landing.howToPlay.steps.quest.title')}</h3>
					<p class="step-desc">{$t('landing.howToPlay.steps.quest.description')}</p>
				</div>
			</li>
		</ol>
	</div>
</section>

<!-- ═══════════════════════════════════════════════════════════
     OPEN SESSIONS (SSR)
     ═══════════════════════════════════════════════════════════ -->
<section class="section sessions-section" aria-labelledby="sessions-title">
	<div class="container">
		<h2 id="sessions-title" class="section-title">{$t('landing.sessions.title')}</h2>
		<p class="section-subtitle">{$t('landing.sessions.subtitle')}</p>

		{#if data.openSessions.length === 0}
			<p class="sessions-empty">{$t('landing.sessions.empty')}</p>
		{:else}
			<ul class="sessions-list" role="list">
				{#each data.openSessions as session (session.id)}
					<li class="session-item">
						<span class="session-quest">{session.questName}</span>
						<span class="session-players">
							{session.playerCount}/{session.maxPlayers}
							{$t('landing.sessions.waiting')}
						</span>
						<a href="/lobby/{session.id}" class="btn btn-secondary btn-sm">
							{$t('landing.sessions.join')}
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>

<style>
	/* ── Hero section ─────────────────────────────────────────── */
	.hero-section {
		position: relative;
		min-height: 90dvh;
		display: flex;
		align-items: center;
		overflow: hidden;
	}

	.hero-bg {
		position: absolute;
		inset: 0;
		z-index: 0;
	}

	/* Dungeon stone grid pattern */
	.dungeon-grid {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgba(74, 46, 16, 0.15) 1px, transparent 1px),
			linear-gradient(90deg, rgba(74, 46, 16, 0.15) 1px, transparent 1px);
		background-size: 48px 48px;
		mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
	}

	/* Torches */
	.torch {
		position: absolute;
		top: 20%;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: radial-gradient(circle, #f0a830 0%, #c87d2f 40%, transparent 70%);
		box-shadow: 0 0 30px 15px rgba(200, 125, 47, 0.4), 0 0 60px 30px rgba(200, 125, 47, 0.2);
		animation: flicker 2s ease-in-out infinite;
	}

	.torch-left  { left: 8%; }
	.torch-right { right: 8%; }

	@media (min-width: 640px) {
		.torch-left  { left: 12%; }
		.torch-right { right: 12%; }
	}

	/* Radial vignette */
	.hero-section::after {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(
			ellipse 70% 60% at 50% 50%,
			transparent 0%,
			rgba(13, 7, 0, 0.7) 100%
		);
		z-index: 1;
		pointer-events: none;
	}

	.hero-content {
		position: relative;
		z-index: 2;
		text-align: center;
		padding-block: var(--space-3xl);
	}

	.hero-title {
		font-size: clamp(3rem, 10vw, 7rem);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		text-shadow: 0 0 40px rgba(200, 125, 47, 0.6), 0 2px 4px rgba(0,0,0,0.8);
		animation: drift 4s ease-in-out infinite;
	}

	.hero-tagline {
		margin-top: var(--space-md);
		font-size: clamp(1rem, 2.5vw, 1.35rem);
		color: var(--color-text);
		max-width: 560px;
		margin-inline: auto;
		text-shadow: 0 1px 3px rgba(0,0,0,0.8);
	}

	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-md);
		justify-content: center;
		margin-top: var(--space-xl);
	}

	/* ── Generic sections ────────────────────────────────────── */
	.section {
		padding-block: var(--space-3xl);
	}

	.section-title {
		text-align: center;
		font-size: clamp(1.5rem, 4vw, 2.25rem);
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.section-subtitle {
		text-align: center;
		color: var(--color-text-muted);
		margin-top: var(--space-sm);
		font-size: 1rem;
	}

	/* ── Heroes grid ─────────────────────────────────────────── */
	.heroes-section {
		background: var(--color-bg-raised);
		border-block: 1px solid var(--color-border);
	}

	.heroes-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-lg);
		margin-top: var(--space-2xl);
	}

	@media (min-width: 480px) {
		.heroes-grid { grid-template-columns: repeat(2, 1fr); }
	}

	@media (min-width: 900px) {
		.heroes-grid { grid-template-columns: repeat(4, 1fr); }
	}

	/* ── How to play ─────────────────────────────────────────── */
	.steps-list {
		list-style: none;
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-xl);
		margin-top: var(--space-2xl);
		counter-reset: steps;
	}

	@media (min-width: 640px) {
		.steps-list { grid-template-columns: repeat(3, 1fr); }
	}

	.step-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: var(--space-md);
		padding: var(--space-xl);
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		transition: border-color var(--transition), box-shadow var(--transition);
	}

	.step-item:hover {
		border-color: var(--color-border-glow);
		box-shadow: 0 0 20px rgba(200, 125, 47, 0.1);
	}

	.step-icon {
		font-size: 2.5rem;
		animation: drift 3s ease-in-out infinite;
	}

	.step-title {
		font-size: 1.1rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.step-desc {
		font-size: 0.9rem;
		color: var(--color-text-muted);
		line-height: 1.6;
	}

	/* ── Sessions ────────────────────────────────────────────── */
	.sessions-section {
		background: var(--color-bg-raised);
		border-top: 1px solid var(--color-border);
	}

	.sessions-empty {
		text-align: center;
		color: var(--color-text-muted);
		margin-top: var(--space-2xl);
		font-style: italic;
	}

	.sessions-list {
		list-style: none;
		margin-top: var(--space-xl);
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.session-item {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md) var(--space-lg);
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		flex-wrap: wrap;
	}

	.session-quest {
		font-family: var(--font-display);
		font-size: 0.9rem;
		color: var(--color-text-accent);
		flex: 1;
	}

	.session-players {
		font-size: 0.85rem;
		color: var(--color-text-muted);
	}

	.btn-sm {
		padding: var(--space-xs) var(--space-md);
		font-size: 0.8rem;
	}
</style>
