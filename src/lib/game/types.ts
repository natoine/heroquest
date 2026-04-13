// ============================================================
// HeroQuest — Shared game types
// Used by client, server, and tests.
// ============================================================

export type HeroClass = 'barbarian' | 'dwarf' | 'elf' | 'wizard';

export interface HeroStats {
	move: number;
	attack: number;
	defend: number;
	body: number;
	mind: number;
}

export const HERO_STATS: Record<HeroClass, HeroStats> = {
	barbarian: { move: 2, attack: 3, defend: 2, body: 8, mind: 2 },
	dwarf:     { move: 2, attack: 2, defend: 2, body: 7, mind: 3 },
	elf:       { move: 2, attack: 2, defend: 2, body: 6, mind: 4 },
	wizard:    { move: 2, attack: 1, defend: 2, body: 4, mind: 6 }
};

export type SessionStatus = 'waiting' | 'in_progress' | 'finished';

export interface GameSession {
	id: string;
	questName: string;
	playerCount: number;
	maxPlayers: number;
	status: SessionStatus;
	createdAt: number;
}
