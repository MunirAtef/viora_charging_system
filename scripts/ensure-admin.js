// Makes sure someone can log in on a fresh database. Idempotent: creates the account if it is
// missing, otherwise only promotes it — an existing password is never overwritten.
// Run: node --env-file=.env scripts/ensure-admin.js
import postgres from 'postgres';
import { hashPassword } from '../src/lib/password.ts';

const email = (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? '';
if (!email || password.length < 8) {
	console.error('set ADMIN_EMAIL and an ADMIN_PASSWORD of 8+ characters');
	process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL);

const [created] = await sql`
	insert into users (name, email, password_hash, role)
	values (${process.env.ADMIN_NAME ?? 'Administrator'}, ${email}, ${await hashPassword(password)},
	        'admin')
	on conflict (email) do nothing
	returning id`;

if (!created) await sql`update users set role = 'admin' where email = ${email}`;

await sql.end();
console.log(created ? `admin created: ${email}` : `admin already exists, role ensured: ${email}`);
