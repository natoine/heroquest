# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

## [0.4.0] — 2026-04-13

### Added
- Table `activity_log` dans SQLite (type, meta JSON, created_at unix)
- Helper `logActivity()` dans `src/lib/server/activity.ts` : ne lève jamais d'exception, loggue les erreurs en console
- Types : `ActivityType` (6 valeurs), `ActivityMeta`, `ActivityRow`
- Logs branchés sur toutes les routes : `account_created`, `login`, `account_deleted` (user & admin), `email_verification_sent`, `email_password_reset_sent`, `email_admin_access_sent`
- `GET /api/admin/activity` : liste paginée (30/page), triée par date décroissante
- `GET /api/admin/email-stats` : nombre d'emails par jour pour un mois donné (paramètres `year` et `month`), tous les jours remplis à 0 si absent
- Dashboard admin enrichi avec 3 onglets chargés en lazy :
  - **Utilisateurs** : tableau complet avec suppression + envoi de lien de réinitialisation
  - **Activité** : log paginé avec badges colorés par type d'événement
  - **Emails** : navigation mois par mois, tableau jour par jour avec visualisation en barres et total mensuel
- 13 tests unitaires couvrant `logActivity()` et la logique de remplissage des jours du mois

### Prompt log
- `2026-04-13 | Onglet activité + stats emails dans le dashboard admin | src/lib/server/db.ts, src/lib/server/activity.ts, src/routes/api/admin/activity/+server.ts, src/routes/api/admin/email-stats/+server.ts, src/routes/admin/dashboard/+page.svelte, src/routes/api/auth/register/+server.ts, src/routes/api/auth/login/+server.ts, src/routes/api/auth/forgot-password/+server.ts, src/routes/api/account/delete/+server.ts, src/routes/api/admin/users/[id]/+server.ts, src/routes/api/admin/users/[id]/send-reset/+server.ts, src/routes/api/admin/request-access/+server.ts, src/lib/server/__tests__/activity.test.ts, CHANGELOG.md`

## [0.3.0] — 2026-04-13

### Added
- Route `/admin` : formulaire email pour demander un accès (réponse toujours identique, ne révèle pas si l'email est admin)
- Route `/admin/login?token=xxx` : vérifie le JWT admin, pose le cookie `hq_admin` (httpOnly, 4j), redirige vers `/admin/dashboard`
- Route `/admin/dashboard` : protégée, affiche les stats utilisateurs (comptes créés / emails vérifiés)
- `POST /api/admin/request-access` : génère un JWT `{ role: 'admin' }` signé avec `JWT_SECRET` (validité 4j), envoie le lien par email ; token loggué en console en dev si SMTP absent
- Email `sendAdminAccessEmail` ajouté au service email
- Variable d'environnement `ADMIN_EMAIL` dans `.env` et `.env.example`
- Hook serveur mis à jour : vérifie le cookie `hq_admin` et positionne `locals.isAdmin`
- Tests unitaires : 4 tests JWT admin (génération, rôle invalide, expiré, falsifié)

### Prompt log
- `2026-04-13 | Route /admin magic-link (modèle petitsemprunts) | src/routes/admin/+page.svelte, src/routes/admin/login/+page.server.ts, src/routes/admin/dashboard/+page.svelte, src/routes/admin/dashboard/+page.server.ts, src/routes/api/admin/request-access/+server.ts, src/lib/server/email.ts, src/hooks.server.ts, src/app.d.ts, .env, .env.example`


## [0.2.1] — 2026-04-13

### Added
- Page compte utilisateur `/account` (protégée, redirige vers `/login` si non connecté)
- Redirection post-login vers `/account` au lieu de la page d'accueil
- Username dans la topbar cliquable → `/account`

### Prompt log
- `2026-04-13 | Page compte utilisateur + redirection post-login + username cliquable dans topbar | src/routes/account/+page.svelte, src/routes/account/+page.server.ts, src/routes/login/+page.svelte, src/lib/components/layout/Header.svelte, src/lib/i18n/en.json, src/lib/i18n/fr.json`


## [0.2.0] — 2026-04-13

### Added
- User authentication: registration, login, logout, email verification, forgot/reset password
- SQLite database (`data/heroquest.db`) with `better-sqlite3`; users table with all auth fields
- JWT tokens (7-day expiry) stored as httpOnly cookie `hq_token`
- Server hook (`hooks.server.ts`) injects `locals.user` on every request by verifying the JWT
- Auth API routes: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/verify-email`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`
- Email service (`nodemailer`) for verification (24 h) and password reset (1 h) links; dev fallback logs token to console
- Auth Svelte store (`$lib/stores/auth`) synced from SSR layout data
- Auth UI pages: `/register`, `/register/check-email`, `/login`, `/verify-email`, `/forgot-password`, `/reset-password`
- Shared UI components: `PasswordInput` (show/hide toggle), `AuthForm` (card shell)
- Header updated: shows username + logout when authenticated, sign up / log in otherwise
- Full i18n coverage for all auth strings (fr + en)
- Unit tests: JWT sign/verify (5), input validation (9) — total 30 tests passing

### Prompt log
- `2026-04-13 | Création de compte et connexion (modèle petitsemprunts) | package.json, src/lib/server/db.ts, src/lib/server/jwt.ts, src/lib/server/email.ts, src/lib/stores/auth.ts, src/hooks.server.ts, src/app.d.ts, src/routes/api/auth/**, src/routes/register/**, src/routes/login/+page.svelte, src/routes/verify-email/+page.svelte, src/routes/forgot-password/+page.svelte, src/routes/reset-password/+page.svelte, src/lib/components/ui/PasswordInput.svelte, src/lib/components/ui/AuthForm.svelte, src/lib/i18n/en.json, src/lib/i18n/fr.json, .env.example`

---

## [0.1.0] — 2026-04-13

### Added
- Initial project architecture with SvelteKit + TypeScript + Node.js adapter
- i18n from day 1 with `svelte-i18n` (French + English, auto-detected from browser/Accept-Language)
- Language switcher persisted via cookie
- Landing page with: hero section, hero class cards (Barbarian, Dwarf, Elf, Wizard), how-to-play steps, open sessions list (SSR)
- Global CSS design system: dark fantasy palette, responsive layout, torchlight animations
- Shared game types: `HeroClass`, `HeroStats`, `HERO_STATS`, `GameSession`
- `/changelog` route exposing this file publicly
- Unit tests for game types and i18n locale resolution
- `CLAUDE.md` standards compliance: i18n, mobile-first, changelog, tests

### Prompt log
- `2026-04-13 | Architecture + landing page initiale | package.json, svelte.config.js, vite.config.ts, tsconfig.json, src/app.html, src/app.css, src/lib/i18n/*, src/lib/game/types.ts, src/lib/components/**, src/routes/+layout.*, src/routes/+page.*, CHANGELOG.md`

---

[Unreleased]: https://github.com/natoine/heroquest/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/natoine/heroquest/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/natoine/heroquest/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/natoine/heroquest/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/natoine/heroquest/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/natoine/heroquest/releases/tag/v0.1.0
