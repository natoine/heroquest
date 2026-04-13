# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

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

[Unreleased]: https://github.com/natoine/heroquest/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/natoine/heroquest/releases/tag/v0.1.0
