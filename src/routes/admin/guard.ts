import { redirect } from '@sveltejs/kit';

export const guard = (locals: App.Locals) => {
	if (!locals.user) redirect(303, '/login?next=/admin');
	if (locals.user.role !== 'admin') redirect(303, '/account');
	return locals.user;
};
