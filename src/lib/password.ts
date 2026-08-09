import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

// Kept free of SvelteKit imports so deploy scripts hash exactly the way the app does —
// a drift here would mean accounts that can never log in.
const derive = promisify(scrypt) as (p: string, s: string, k: number) => Promise<Buffer>;

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
