import { redirect } from '@sveltejs/kit';
import { destroySession } from '$lib/server/auth';

export const actions = {
	default: async ({ cookies }) => {
		await destroySession(cookies);
		redirect(303, '/');
	}
};
