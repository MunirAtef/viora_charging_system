import postgres from 'postgres';
import { building } from '$app/environment';
import { env } from '$env/dynamic/private';

if (!building && !env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

export const sql = postgres(env.DATABASE_URL ?? '');
