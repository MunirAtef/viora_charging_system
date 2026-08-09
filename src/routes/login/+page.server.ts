import { fail, redirect } from '@sveltejs/kit';
import { sql } from '$lib/server/db';
import { createSession, verifyPassword } from '$lib/server/auth';
import { t } from '$lib/i18n';

export function load({ locals }) {
	if (locals.user) redirect(303, '/account');
}

export const actions = {
	default: async ({ request, cookies, url, locals }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '')
			.trim()
			.toLowerCase();
		const password = String(form.get('password') ?? '');

		const [user] = await sql`select id, password_hash from users where email = ${email}`;
		// same message either way — don't leak which emails exist
		if (!user || !(await verifyPassword(password, user.password_hash)))
			return fail(401, { email, message: t(locals.lang).errors.badCredentials });

		await createSession(cookies, user.id);
		redirect(303, url.searchParams.get('next') ?? '/account');
	}
};
