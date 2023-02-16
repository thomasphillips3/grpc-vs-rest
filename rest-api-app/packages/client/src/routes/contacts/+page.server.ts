import type { Contact, ContactResource, GetContactResponse } from '@grpc-vs-rest/api-types';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

/** Handles loading data for the page. */
export const load = (async ({ fetch, url, params }) => {
	if (!url.searchParams.get('url')) {
		return {
			resource: {
				uri: '',
				firstName: '',
				lastName: '',
				email: '',
				_links: {
					create: {
						href: `${url.searchParams.get('createUrl')}`,
						type: 'POST'
					}
				}
			} as ContactResource
		};
	}

	const res = (await (await fetch(`${url.searchParams.get('url')}`)).json()) as GetContactResponse;

	if (res) {
		return res;
	}

	throw error(404, 'Not found');
}) satisfies PageServerLoad;

/** Handles saving updated contact information. */
export const actions = {
	update: async ({ fetch, request, params }) => {
		const data = await request.formData();

		const contact: Partial<Contact> = {};
		contact.firstName = String(data.get('firstName'));
		contact.lastName = String(data.get('lastName'));
		contact.email = String(data.get('email'));

		let contactUrl = String(data.get('url') || '');
		const isNew = !contactUrl;
		if (isNew) {
			contactUrl = String(data.get('createUrl'));
		}

		await fetch(`${contactUrl}`, {
			method: isNew ? 'POST' : 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(contact)
		});

		throw redirect(303, '/');
	},
	delete: async ({ fetch, request, params }) => {
		const data = await request.formData();
		const deleteUrl = String(data.get('deleteUrl'));

		await fetch(`${deleteUrl}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		throw redirect(303, '/');
	}
} satisfies Actions;
