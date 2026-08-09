import { randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { Cookies } from '@sveltejs/kit';
import { sql } from './db';

const derive = promisify(scrypt) as (p: string, s: string, k: number) => Promise<Buffer>;
const SESSION_DAYS = 30;

export async function hashPassword(password: string) {
	const salt = randomBytes(16).toString('hex');
	return `${salt}:${(await derive(password, salt, 64)).toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string) {
	const [salt, key] = stored.split(':');
	const hash = await derive(password, salt, 64);
	const expected = Buffer.from(key, 'hex');
	return hash.length === expected.length && timingSafeEqual(hash, expected);
}

export async function createSession(cookies: Cookies, userId: number) {
	const id = randomUUID();
	const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
	await sql`insert into sessions (id, user_id, expires_at) values (${id}, ${userId}, ${expires})`;
	cookies.set('session', id, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: !import.meta.env.DEV,
		expires
	});
}

export async function destroySession(cookies: Cookies) {
	const id = cookies.get('session');
	if (id) await sql`delete from sessions where id = ${id}`;
	cookies.delete('session', { path: '/' });
}

export async function sessionUser(id: string | undefined) {
	if (!id) return null;
	const [user] = await sql`
		select u.id, u.email, u.role, u.coins from sessions s
		join users u on u.id = s.user_id
		where s.id = ${id} and s.expires_at > now()`;
	return (user as App.Locals['user']) ?? null;
}
