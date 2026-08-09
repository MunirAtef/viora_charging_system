import { readFileSync } from 'node:fs';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);
await sql.unsafe(readFileSync(new URL('../schema.sql', import.meta.url), 'utf8'));
await sql.end();
console.log('schema pushed');
