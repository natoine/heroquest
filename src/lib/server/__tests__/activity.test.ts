import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import Database from 'better-sqlite3';

// vi.mock is hoisted above imports, so we cannot reference local variables in the factory.
// We use vi.doMock (not hoisted) + dynamic import instead.

vi.mock('$env/static/private', () => ({
	JWT_SECRET: 'test_secret_32_chars_minimum_ok!',
	ADMIN_EMAIL: 'admin@test.com',
	NODE_ENV: 'test',
	SMTP_HOST: 'localhost',
	SMTP_PORT: '1025',
	SMTP_USER: '',
	SMTP_PASS: '',
	SMTP_FROM: 'test@test.com',
	APP_URL: 'http://localhost:5173'
}));

// ── In-memory DB ──────────────────────────────────────────────────────────────
const memDb = new Database(':memory:');
memDb.exec(`
  CREATE TABLE activity_log (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    type       TEXT    NOT NULL,
    meta       TEXT    NOT NULL DEFAULT '{}',
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
`);

vi.doMock('../db', () => ({ default: memDb }));

// ── Types / helpers needed before dynamic import ──────────────────────────────
type ActivityRow = { id: number; type: string; meta: string; created_at: number };

function allRows(): ActivityRow[] {
	return memDb.prepare('SELECT * FROM activity_log ORDER BY id ASC').all() as ActivityRow[];
}

// ── Dynamic import so the mock is registered before module evaluation ─────────
let logActivity: (type: string, meta?: Record<string, unknown>) => void;

beforeAll(async () => {
	const mod = await import('../activity');
	logActivity = mod.logActivity;
});

beforeEach(() => {
	memDb.prepare('DELETE FROM activity_log').run();
});

// ── logActivity ───────────────────────────────────────────────────────────────

describe('logActivity', () => {
	it('inserts a row with the correct type', () => {
		logActivity('login');
		const rows = allRows();
		expect(rows).toHaveLength(1);
		expect(rows[0].type).toBe('login');
	});

	it('stores meta as JSON string', () => {
		logActivity('account_created', { email: 'test@example.com' });
		const rows = allRows();
		expect(rows[0].meta).toBe('{"email":"test@example.com"}');
	});

	it('defaults meta to empty JSON object when omitted', () => {
		logActivity('account_deleted');
		const rows = allRows();
		expect(rows[0].meta).toBe('{}');
	});

	it('inserts multiple rows in order', () => {
		logActivity('login');
		logActivity('email_verification_sent', { to: 'a@b.com' });
		logActivity('email_password_reset_sent', { to: 'a@b.com', sent_by: 'admin' });
		const rows = allRows();
		expect(rows).toHaveLength(3);
		expect(rows[0].type).toBe('login');
		expect(rows[1].type).toBe('email_verification_sent');
		expect(rows[2].type).toBe('email_password_reset_sent');
	});

	it('stores created_at as a unix timestamp (seconds)', () => {
		const before = Math.floor(Date.now() / 1000) - 1;
		logActivity('login');
		const after = Math.floor(Date.now() / 1000) + 1;
		const rows = allRows();
		expect(rows[0].created_at).toBeGreaterThanOrEqual(before);
		expect(rows[0].created_at).toBeLessThanOrEqual(after);
	});

	it('never throws when the database call fails', () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		memDb.exec('DROP TABLE activity_log');
		expect(() => logActivity('login')).not.toThrow();
		expect(spy).toHaveBeenCalledWith(
			'[activity] Failed to log:',
			'login',
			expect.any(Error)
		);
		spy.mockRestore();
		// Restore the table so subsequent tests work
		memDb.exec(`
      CREATE TABLE activity_log (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        type       TEXT    NOT NULL,
        meta       TEXT    NOT NULL DEFAULT '{}',
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);
	});
});

// ── Email-stats date-filling logic ────────────────────────────────────────────
// Pure utility mirroring the logic in /api/admin/email-stats/+server.ts.

function fillMonthDays(
	rows: { day: string; count: number }[],
	year: number,
	month: number
): { date: string; count: number }[] {
	const daysInMonth = new Date(year, month, 0).getDate();
	const map = Object.fromEntries(rows.map((r) => [r.day, r.count]));
	return Array.from({ length: daysInMonth }, (_, i) => {
		const d = String(i + 1).padStart(2, '0');
		const mo = String(month).padStart(2, '0');
		const key = `${year}-${mo}-${d}`;
		return { date: key, count: map[key] ?? 0 };
	});
}

describe('fillMonthDays', () => {
	it('returns 31 entries for January', () => {
		expect(fillMonthDays([], 2026, 1)).toHaveLength(31);
	});

	it('returns 28 entries for February on a non-leap year', () => {
		expect(fillMonthDays([], 2025, 2)).toHaveLength(28);
	});

	it('returns 29 entries for February on a leap year', () => {
		expect(fillMonthDays([], 2024, 2)).toHaveLength(29);
	});

	it('returns 30 entries for April', () => {
		expect(fillMonthDays([], 2026, 4)).toHaveLength(30);
	});

	it('fills in 0 for days not present in rows', () => {
		const result = fillMonthDays([{ day: '2026-04-05', count: 3 }], 2026, 4);
		expect(result.find((d) => d.date === '2026-04-05')?.count).toBe(3);
		expect(result.find((d) => d.date === '2026-04-01')?.count).toBe(0);
	});

	it('uses the count from rows when a day is present', () => {
		const rows = [
			{ day: '2026-01-10', count: 7 },
			{ day: '2026-01-20', count: 12 }
		];
		const result = fillMonthDays(rows, 2026, 1);
		expect(result[9].count).toBe(7); // index 9 → day 10
		expect(result[19].count).toBe(12); // index 19 → day 20
	});

	it('formats dates as YYYY-MM-DD', () => {
		const result = fillMonthDays([], 2026, 3);
		expect(result[0].date).toBe('2026-03-01');
		expect(result[30].date).toBe('2026-03-31');
	});
});
