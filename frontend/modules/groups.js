import { renderGroups } from './renderGroups.js';

const accessToken = localStorage.getItem('accessToken');

document.getElementById('ifAuthed').style.display = 'none';

try {
	const response = await fetch('http://localhost:5001/accounts', {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`,
		},
	});

	const result = await response.json();

	if (!response.ok || response.status >= 400) {
		alert(result?.error || response.statusText);
	} else {
		document.getElementById('ifAuthed').style.display = 'inline';
		document.getElementById('ifNotAuthed').style.display = 'none';

		renderGroups(result);
	}
} catch (error) {
	console.error(error);
}

const addToGroup = document.querySelector('form#joinGroupForm');
addToGroup.addEventListener('submit', async (event) => {
	event.preventDefault();

	const groupId = document.querySelector('#groupId').value.trim();

	try {
		const response = await fetch('http://localhost:5001/accounts', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			body: JSON.stringify({ groupId: groupId }),
		});

		const result = await response.json();

		if (!response.ok || response.status >= 400) {
			return alert(result?.error || response.statusText);
		} else {
			location.reload();
		}
	} catch (error) {
		return alert(error.message);
	}
});
