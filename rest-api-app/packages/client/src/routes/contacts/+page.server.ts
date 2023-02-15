import type { Contact, GetContactResponse } from '@grpc-vs-rest/api-types';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

/** Handles loading data for the page. */
export const load = (async ({ fetch, url, params }) => {
	const res = (await (await fetch(`${url.searchParams.get('url')}`)).json()) as GetContactResponse;

	if (res) {
		return res;
	}

	throw error(404, 'Not found');
}) satisfies PageServerLoad;

/** Handles saving updated contact information. */
export const actions = {
	default: async ({ fetch, request, params }) => {
		const data = await request.formData();

		const contact: Partial<Contact> = {};
		contact.firstName = String(data.get('firstName'));
		contact.lastName = String(data.get('lastName'));
		contact.email = String(data.get('email'));

		const contactUrl = String(data.get('url'));

		await fetch(`${contactUrl}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(contact)
		});

		throw redirect(303, '/');
	}
} satisfies Actions;
