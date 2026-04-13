import { describe, it, expect } from 'vitest';
import { HERO_STATS, type HeroClass } from '../types';

const HERO_CLASSES: HeroClass[] = ['barbarian', 'dwarf', 'elf', 'wizard'];

describe('HERO_STATS', () => {
	it('defines stats for all four hero classes', () => {
		for (const heroClass of HERO_CLASSES) {
			expect(HERO_STATS[heroClass]).toBeDefined();
		}
	});

	it.each(HERO_CLASSES)('%s has all required stat fields', (heroClass) => {
		const stats = HERO_STATS[heroClass];
		expect(stats.move).toBeGreaterThan(0);
		expect(stats.attack).toBeGreaterThan(0);
		expect(stats.defend).toBeGreaterThan(0);
		expect(stats.body).toBeGreaterThan(0);
		expect(stats.mind).toBeGreaterThan(0);
	});

	it('barbarian has the highest attack among all heroes', () => {
		const attacks = HERO_CLASSES.map((c) => HERO_STATS[c].attack);
		expect(HERO_STATS.barbarian.attack).toBe(Math.max(...attacks));
	});

	it('wizard has the highest mind points', () => {
		const minds = HERO_CLASSES.map((c) => HERO_STATS[c].mind);
		expect(HERO_STATS.wizard.mind).toBe(Math.max(...minds));
	});

	it('wizard has the lowest body points', () => {
		const bodies = HERO_CLASSES.map((c) => HERO_STATS[c].body);
		expect(HERO_STATS.wizard.body).toBe(Math.min(...bodies));
	});

	it('all stats are positive integers', () => {
		for (const heroClass of HERO_CLASSES) {
			const stats = HERO_STATS[heroClass];
			for (const [key, value] of Object.entries(stats)) {
				expect(value, `${heroClass}.${key} must be a positive integer`).toBeGreaterThan(0);
				expect(Number.isInteger(value), `${heroClass}.${key} must be an integer`).toBe(true);
			}
		}
	});
});
