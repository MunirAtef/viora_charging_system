import { fail, redirect } from '@sveltejs/kit';
import { sql } from '$lib/server/db';
import { createSession, hashPassword } from '$lib/server/auth';
import { t } from '$lib/i18n';

export function load({ locals }) {
	if (locals.user) redirect(303, '/account');
}

export const actions = {
	default: async ({ request, cookies, url, locals }) => {
		const e = t(locals.lang).errors;
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const email = String(form.get('email') ?? '')
			.trim()
			.toLowerCase();
		const password = String(form.get('password') ?? '');

		if (name.length < 2 || name.length > 60) return fail(400, { email, message: e.badName });

		if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
			return fail(400, { email, name, message: e.badEmail });
		if (password.length < 8) return fail(400, { email, name, message: e.shortPassword });

		const [existing] = await sql`select 1 from users where email = ${email}`;
		if (existing) return fail(409, { email, name, message: e.emailTaken });

		const [user] = await sql`
			insert into users (name, email, password_hash)
			values (${name}, ${email}, ${await hashPassword(password)})
			returning id`;
		await createSession(cookies, user.id);
		redirect(303, url.searchParams.get('next') ?? '/account');
	}
};
