// Promote a registered user to admin: npm run admin -- you@example.com
import postgres from 'postgres';

const email = process.argv[2]?.trim().toLowerCase();
if (!email) throw new Error('usage: npm run admin -- <email>');

const sql = postgres(process.env.DATABASE_URL);
const rows = await sql`update users set role = 'admin' where email = ${email} returning email`;
await sql.end();
console.log(rows.length ? `${rows[0].email} is now admin` : `no user with email ${email}`);
