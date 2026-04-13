<script lang="ts">
	import type { PageData } from './$types';
	import type { AdminUser } from './+page.server';
	import type { ActivityType } from '$lib/server/activity';

	let { data }: { data: PageData } = $props();

	// ── Tabs ────────────────────────────────────────────────────
	type Tab = 'users' | 'activity' | 'emails';
	let activeTab = $state<Tab>('users');

	function setTab(t: Tab) {
		activeTab = t;
		if (t === 'activity' && activities.length === 0) loadActivity(1);
		if (t === 'emails'   && emailDays.length === 0)  loadEmailStats();
	}

	// ── Helpers ─────────────────────────────────────────────────
	function fmt(ts: number | null): string {
		if (!ts) return '—';
		return new Date(ts * 1000).toLocaleString('fr-FR', {
			day: '2-digit', month: '2-digit', year: 'numeric',
			hour: '2-digit', minute: '2-digit'
		});
	}

	// ════════════════════════════════════════════════════════════
	// TAB: USERS
	// ════════════════════════════════════════════════════════════
	let deletedIds  = $state(new Set<number>());
	const users     = $derived(data.users.filter((u: AdminUser) => !deletedIds.has(u.id)));

	let feedback    = $state<Record<number, { type: 'ok' | 'err'; msg: string }>>({});
	let deletingId  = $state<number | null>(null);
	let confirmId   = $state<number | null>(null);
	let sendingResetId = $state<number | null>(null);

	function setFeedback(id: number, type: 'ok' | 'err', msg: string) {
		feedback = { ...feedback, [id]: { type, msg } };
		setTimeout(() => { const { [id]: _, ...rest } = feedback; feedback = rest; }, 3500);
	}

	async function deleteUser(id: number) {
		deletingId = id; confirmId = null;
		try {
			const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
			if (res.ok) deletedIds = new Set([...deletedIds, id]);
			else setFeedback(id, 'err', 'Erreur lors de la suppression.');
		} finally { deletingId = null; }
	}

	async function sendReset(id: number) {
		sendingResetId = id;
		try {
			const res = await fetch(`/api/admin/users/${id}/send-reset`, { method: 'POST' });
			setFeedback(id, res.ok ? 'ok' : 'err', res.ok ? 'Lien envoyé.' : 'Erreur d\'envoi.');
		} finally { sendingResetId = null; }
	}

	// ════════════════════════════════════════════════════════════
	// TAB: ACTIVITY
	// ════════════════════════════════════════════════════════════
	interface ActivityItem { id: number; type: ActivityType; meta: string; created_at: number }

	let activities     = $state<ActivityItem[]>([]);
	let activityPage   = $state(1);
	let activityPages  = $state(1);
	let activityTotal  = $state(0);
	let activityLoading = $state(false);

	async function loadActivity(page: number) {
		activityLoading = true;
		try {
			const res  = await fetch(`/api/admin/activity?page=${page}`);
			const json = await res.json();
			activities    = json.items;
			activityPage  = json.page;
			activityPages = json.pages;
			activityTotal = json.total;
		} finally { activityLoading = false; }
	}

	const ACTIVITY_LABELS: Record<ActivityType, { label: string; color: string }> = {
		account_created:          { label: 'Compte créé',        color: '#4a9a5a' },
		account_deleted:          { label: 'Compte supprimé',    color: '#c0392b' },
		login:                    { label: 'Connexion',           color: '#2980b9' },
		email_verification_sent:  { label: 'Email vérification', color: '#8e44ad' },
		email_password_reset_sent:{ label: 'Email reset MDP',    color: '#e67e22' },
		email_admin_access_sent:  { label: 'Email accès admin',  color: '#c0392b' }
	};

	function activityDetail(item: ActivityItem): string {
		try {
			const meta = JSON.parse(item.meta) as Record<string, string>;
			if (item.type === 'account_created')   return `${meta.username} (${meta.email})`;
			if (item.type === 'account_deleted')   return `${meta.username} (${meta.email}) — par ${meta.deleted_by}`;
			if (item.type === 'login')             return `${meta.username ?? ''} (${meta.email})`;
			if (item.type.startsWith('email_'))    return `→ ${meta.to}${meta.sent_by === 'admin' ? ' (admin)' : ''}`;
		} catch { /* ignore */ }
		return '—';
	}

	// ════════════════════════════════════════════════════════════
	// TAB: EMAIL STATS
	// ════════════════════════════════════════════════════════════
	interface DayStat { date: string; count: number }

	const MONTH_NAMES = ['Janvier','Février','Mars','Avril','Mai','Juin',
	                     'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

	let emailDays    = $state<DayStat[]>([]);
	let emailYear    = $state(new Date().getFullYear());
	let emailMonth   = $state(new Date().getMonth() + 1);
	let emailLoading = $state(false);

	async function loadEmailStats() {
		emailLoading = true;
		try {
			const res  = await fetch(`/api/admin/email-stats?year=${emailYear}&month=${emailMonth}`);
			const json = await res.json();
			emailDays = json.days;
		} finally { emailLoading = false; }
	}

	async function prevMonth() {
		if (emailMonth === 1) { emailMonth = 12; emailYear--; } else { emailMonth--; }
		await loadEmailStats();
	}
	async function nextMonth() {
		if (emailMonth === 12) { emailMonth = 1; emailYear++; } else { emailMonth++; }
		await loadEmailStats();
	}

	const emailTotal = $derived(emailDays.reduce((s, d) => s + d.count, 0));
	const emailMax   = $derived(Math.max(1, ...emailDays.map((d) => d.count)));
</script>

<svelte:head>
	<title>Admin Dashboard — HeroQuest</title>
</svelte:head>

<div class="container admin-page">

	<!-- Header -->
	<div class="admin-header">
		<span class="admin-icon" aria-hidden="true">🏰</span>
		<div>
			<p class="admin-label">Panneau d'administration</p>
			<h1 class="admin-title">HeroQuest Admin</h1>
		</div>
	</div>

	<!-- Stats summary -->
	<div class="stats-grid">
		<div class="stat-card">
			<p class="stat-value">{data.stats.totalUsers}</p>
			<p class="stat-label">Comptes</p>
		</div>
		<div class="stat-card">
			<p class="stat-value">{data.stats.verifiedUsers}</p>
			<p class="stat-label">Vérifiés</p>
		</div>
		<div class="stat-card">
			<p class="stat-value">{data.stats.totalUsers - data.stats.verifiedUsers}</p>
			<p class="stat-label">En attente</p>
		</div>
	</div>

	<!-- Tabs -->
	<div class="tabs" role="tablist">
		<button role="tab" aria-selected={activeTab === 'users'}    class:active={activeTab === 'users'}    onclick={() => setTab('users')}>   👥 Utilisateurs</button>
		<button role="tab" aria-selected={activeTab === 'activity'} class:active={activeTab === 'activity'} onclick={() => setTab('activity')}>📋 Activité</button>
		<button role="tab" aria-selected={activeTab === 'emails'}   class:active={activeTab === 'emails'}   onclick={() => setTab('emails')}>  📧 Emails</button>
	</div>

	<!-- ══ TAB: USERS ══════════════════════════════════════════ -->
	{#if activeTab === 'users'}
	<div class="tab-panel" role="tabpanel">
		<div class="table-wrapper">
			<table class="data-table">
				<thead><tr>
					<th>Email</th>
					<th>Username</th>
					<th>Statut</th>
					<th>Créé le</th>
					<th>Dernière connexion</th>
					<th>Actions</th>
				</tr></thead>
				<tbody>
					{#each users as user (user.id)}
					<tr class:unverified={!user.is_verified}>
						<td class="cell-email">{user.email}</td>
						<td>{user.username ?? '—'}</td>
						<td>
							<span class="badge" class:badge-ok={user.is_verified} class:badge-warn={!user.is_verified}>
								{user.is_verified ? 'Vérifié' : 'En attente'}
							</span>
						</td>
						<td class="cell-date">{fmt(user.created_at)}</td>
						<td class="cell-date">{fmt(user.last_login_at)}</td>
						<td class="cell-actions">
							{#if feedback[user.id]}
								<span class="inline-feedback" class:feedback-ok={feedback[user.id].type === 'ok'} class:feedback-err={feedback[user.id].type === 'err'}>{feedback[user.id].msg}</span>
							{:else if confirmId === user.id}
								<span class="confirm-text">Confirmer ?</span>
								<button class="btn-action btn-danger" onclick={() => deleteUser(user.id)} disabled={deletingId === user.id}>Oui</button>
								<button class="btn-action btn-cancel" onclick={() => confirmId = null}>Non</button>
							{:else}
								<button class="btn-action btn-reset" onclick={() => sendReset(user.id)} disabled={sendingResetId === user.id} title="Envoyer un lien de réinitialisation">
									{sendingResetId === user.id ? '…' : '🔑 Reset'}
								</button>
								<button class="btn-action btn-danger" onclick={() => confirmId = user.id} title="Supprimer ce compte">🗑 Supprimer</button>
							{/if}
						</td>
					</tr>
					{/each}
					{#if users.length === 0}
					<tr><td colspan="6" class="empty-row">Aucun utilisateur.</td></tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
	{/if}

	<!-- ══ TAB: ACTIVITY ═══════════════════════════════════════ -->
	{#if activeTab === 'activity'}
	<div class="tab-panel" role="tabpanel">
		{#if activityLoading}
			<p class="loading-msg">Chargement…</p>
		{:else}
			<div class="table-wrapper">
				<table class="data-table">
					<thead><tr>
						<th>Date</th>
						<th>Événement</th>
						<th>Détail</th>
					</tr></thead>
					<tbody>
						{#each activities as item (item.id)}
						<tr>
							<td class="cell-date">{fmt(item.created_at)}</td>
							<td>
								<span class="badge-event" style="--c:{ACTIVITY_LABELS[item.type]?.color ?? '#888'}">
									{ACTIVITY_LABELS[item.type]?.label ?? item.type}
								</span>
							</td>
							<td class="cell-detail">{activityDetail(item)}</td>
						</tr>
						{/each}
						{#if activities.length === 0}
						<tr><td colspan="3" class="empty-row">Aucune activité.</td></tr>
						{/if}
					</tbody>
				</table>
			</div>

			<!-- Pagination -->
			{#if activityPages > 1}
			<div class="pagination">
				<button class="btn-page" onclick={() => loadActivity(activityPage - 1)} disabled={activityPage <= 1}>←</button>
				<span class="page-info">{activityPage} / {activityPages} <span class="page-total">({activityTotal} entrées)</span></span>
				<button class="btn-page" onclick={() => loadActivity(activityPage + 1)} disabled={activityPage >= activityPages}>→</button>
			</div>
			{/if}
		{/if}
	</div>
	{/if}

	<!-- ══ TAB: EMAIL STATS ════════════════════════════════════ -->
	{#if activeTab === 'emails'}
	<div class="tab-panel" role="tabpanel">
		<div class="month-nav">
			<button class="btn-page" onclick={prevMonth} disabled={emailLoading}>←</button>
			<span class="month-label">{MONTH_NAMES[emailMonth - 1]} {emailYear}</span>
			<button class="btn-page" onclick={nextMonth} disabled={emailLoading}>→</button>
		</div>

		{#if emailLoading}
			<p class="loading-msg">Chargement…</p>
		{:else}
			<div class="table-wrapper">
				<table class="data-table email-table">
					<thead><tr>
						<th>Date</th>
						<th>Envois</th>
						<th>Visualisation</th>
					</tr></thead>
					<tbody>
						{#each emailDays as day (day.date)}
						<tr class:day-zero={day.count === 0}>
							<td class="cell-date">{day.date}</td>
							<td class="cell-count">{day.count > 0 ? day.count : '—'}</td>
							<td class="cell-bar">
								{#if day.count > 0}
								<div class="bar" style="width:{Math.round((day.count / emailMax) * 100)}%"></div>
								{/if}
							</td>
						</tr>
						{/each}
					</tbody>
					<tfoot>
						<tr>
							<td colspan="2" class="foot-total">Total : <strong>{emailTotal}</strong> mail{emailTotal > 1 ? 's' : ''}</td>
							<td></td>
						</tr>
					</tfoot>
				</table>
			</div>
		{/if}
	</div>
	{/if}

</div>

<style>
	.admin-page { padding-block: var(--space-3xl); }

	/* ── Header ──────────────────────────────────────────────── */
	.admin-header {
		display: flex; align-items: center; gap: var(--space-xl);
		margin-bottom: var(--space-xl);
		padding: var(--space-xl) var(--space-2xl);
		background: var(--color-bg-raised);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}
	.admin-icon { font-size: 2.5rem; flex-shrink: 0; }
	.admin-label {
		font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em;
		color: var(--color-text-muted); font-family: var(--font-display);
		margin-bottom: var(--space-xs);
	}
	.admin-title { font-size: clamp(1.5rem, 4vw, 2rem); text-transform: uppercase; letter-spacing: 0.06em; }

	/* ── Stats ───────────────────────────────────────────────── */
	.stats-grid {
		display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: var(--space-md); margin-bottom: var(--space-xl);
	}
	.stat-card {
		background: var(--color-bg-card); border: 1px solid var(--color-border);
		border-radius: var(--radius-lg); padding: var(--space-lg); text-align: center;
	}
	.stat-value { font-family: var(--font-display); font-size: 2rem; color: var(--color-gold); font-weight: 700; line-height: 1; margin-bottom: var(--space-xs); }
	.stat-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-muted); font-family: var(--font-display); }

	/* ── Tabs ─────────────────────────────────────────────────── */
	.tabs {
		display: flex; gap: 2px; margin-bottom: var(--space-lg);
		border-bottom: 1px solid var(--color-border);
	}
	.tabs button {
		padding: var(--space-sm) var(--space-lg);
		background: none; border: none; border-bottom: 2px solid transparent;
		cursor: pointer; font-family: var(--font-display); font-size: 0.85rem;
		text-transform: uppercase; letter-spacing: 0.05em;
		color: var(--color-text-muted); transition: all var(--transition);
		margin-bottom: -1px;
	}
	.tabs button:hover { color: var(--color-text); }
	.tabs button.active { color: var(--color-gold); border-bottom-color: var(--color-gold); }

	/* ── Table shared ─────────────────────────────────────────── */
	.table-wrapper { overflow-x: auto; border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
	.data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
	.data-table thead { background: var(--color-bg-raised); border-bottom: 1px solid var(--color-border); }
	.data-table th {
		padding: var(--space-sm) var(--space-md); text-align: left;
		font-family: var(--font-display); font-size: 0.75rem;
		text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-muted); white-space: nowrap;
	}
	.data-table td { padding: var(--space-sm) var(--space-md); border-bottom: 1px solid rgba(74,46,16,0.3); vertical-align: middle; }
	.data-table tr:last-child td { border-bottom: none; }
	.data-table tr:hover td { background: rgba(255,255,255,0.02); }
	.data-table tfoot td { border-top: 1px solid var(--color-border); background: var(--color-bg-raised); }

	.cell-email { font-family: var(--font-ui); max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.cell-date  { white-space: nowrap; color: var(--color-text-muted); font-family: var(--font-ui); font-size: 0.8rem; }
	.cell-detail { color: var(--color-text-muted); font-size: 0.82rem; font-family: var(--font-ui); }

	.unverified { opacity: 0.6; }
	.empty-row  { text-align: center; color: var(--color-text-muted); padding: var(--space-xl); font-style: italic; }
	.loading-msg { text-align: center; color: var(--color-text-muted); padding: var(--space-2xl); font-style: italic; }

	/* ── User badges ──────────────────────────────────────────── */
	.badge {
		display: inline-block; padding: 2px 8px; border-radius: 999px;
		font-size: 0.72rem; font-family: var(--font-display); letter-spacing: 0.04em; text-transform: uppercase;
	}
	.badge-ok   { background: rgba(26,90,26,.25);    color: #80cc80; border: 1px solid #2d7a2d; }
	.badge-warn { background: rgba(139,100,26,.25);  color: #ccaa60; border: 1px solid #8b641a; }

	/* ── User actions ─────────────────────────────────────────── */
	.cell-actions { white-space: nowrap; display: flex; align-items: center; gap: var(--space-xs); flex-wrap: wrap; }
	.btn-action {
		padding: 3px 10px; border-radius: var(--radius-sm); font-family: var(--font-display);
		font-size: 0.72rem; letter-spacing: 0.04em; text-transform: uppercase;
		cursor: pointer; border: 1px solid transparent; transition: all var(--transition);
	}
	.btn-action:disabled { opacity: 0.5; cursor: not-allowed; }
	.btn-reset  { background: rgba(200,125,47,.15); border-color: var(--color-border-glow); color: var(--color-text-accent); }
	.btn-reset:hover:not(:disabled) { background: rgba(200,125,47,.3); }
	.btn-danger { background: rgba(139,26,26,.2);   border-color: var(--color-red);         color: #ff8080; }
	.btn-danger:hover:not(:disabled) { background: rgba(139,26,26,.4); }
	.btn-cancel { background: rgba(255,255,255,.05); border-color: var(--color-border);      color: var(--color-text-muted); }
	.btn-cancel:hover { color: var(--color-text); }
	.confirm-text    { font-size: 0.75rem; color: #ff8080; font-family: var(--font-display); }
	.inline-feedback { font-size: 0.75rem; font-family: var(--font-display); }
	.feedback-ok { color: #80cc80; }
	.feedback-err { color: #ff8080; }

	/* ── Activity badge ───────────────────────────────────────── */
	.badge-event {
		display: inline-block; padding: 2px 8px; border-radius: 999px;
		font-size: 0.72rem; font-family: var(--font-display); letter-spacing: 0.04em; text-transform: uppercase;
		background: color-mix(in srgb, var(--c) 20%, transparent);
		color: var(--c);
		border: 1px solid color-mix(in srgb, var(--c) 40%, transparent);
	}

	/* ── Pagination ───────────────────────────────────────────── */
	.pagination { display: flex; align-items: center; justify-content: center; gap: var(--space-lg); margin-top: var(--space-lg); }
	.page-info  { font-family: var(--font-display); font-size: 0.85rem; color: var(--color-text-muted); }
	.page-total { font-size: 0.75rem; }
	.btn-page {
		padding: var(--space-xs) var(--space-md); background: var(--color-bg-card);
		border: 1px solid var(--color-border); border-radius: var(--radius-sm);
		color: var(--color-text-accent); cursor: pointer; font-family: var(--font-display);
		font-size: 0.9rem; transition: all var(--transition);
	}
	.btn-page:hover:not(:disabled) { border-color: var(--color-border-glow); }
	.btn-page:disabled { opacity: 0.4; cursor: not-allowed; }

	/* ── Month nav ────────────────────────────────────────────── */
	.month-nav { display: flex; align-items: center; justify-content: center; gap: var(--space-xl); margin-bottom: var(--space-lg); }
	.month-label { font-family: var(--font-display); font-size: 1.1rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-accent); min-width: 180px; text-align: center; }

	/* ── Email stats table ────────────────────────────────────── */
	.day-zero td { opacity: 0.4; }
	.cell-count { font-family: var(--font-display); color: var(--color-gold); text-align: right; padding-right: var(--space-lg); }
	.cell-bar   { width: 99%; }
	.bar        { height: 12px; background: linear-gradient(90deg, var(--color-gold), var(--color-gold-light)); border-radius: 999px; min-width: 4px; transition: width 300ms ease; }
	.foot-total { padding: var(--space-sm) var(--space-md); color: var(--color-text-muted); font-size: 0.85rem; }
	.foot-total strong { color: var(--color-gold); }
</style>
