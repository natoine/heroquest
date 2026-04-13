// @ts-nocheck
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { PageServerLoad } from './$types';

export const load = async () => {
	const filePath = resolve('CHANGELOG.md');
	const content = await readFile(filePath, 'utf-8');
	return { content };
};
;null as any as PageServerLoad;