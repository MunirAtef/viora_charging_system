import type { Lang } from '$lib/i18n';

declare global {
	namespace App {
		interface Locals {
			user: {
				id: number;
				email: string;
				role: 'user' | 'distributor' | 'admin';
				coins: number;
			} | null;
			lang: Lang;
		}
	}
}

export {};
