// @ts-nocheck
import type { PageServerLoad } from './$types';
import type { GameSession } from '$lib/game/types';

export const load = async () => {
	// In Phase 1, sessions live in memory on the server.
	// This will later call the real session store.
	const openSessions: GameSession[] = [];

	return { openSessions };
};
;null as any as PageServerLoad;