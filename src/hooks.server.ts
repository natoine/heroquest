import { verifyToken } from '$lib/server/jwt';
import db, { type UserRow } from '$lib/server/db';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('hq_token');

	if (token) {
		const payload = verifyToken(token);
		if (payload) {
			const user = db
				.prepare('SELECT id, email, username FROM users WHERE id = ? AND is_verified = 1')
				.get(payload.userId) as Pick<UserRow, 'id' | 'email' | 'username'> | undefined;

			if (user) {
				event.locals.user = { id: user.id, email: user.email, username: user.username };
			}
		}
	}

	return resolve(event);
};
