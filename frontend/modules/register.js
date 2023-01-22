const regForm = document.body.querySelector('#reg-form');

regForm.addEventListener('submit', async (event) => {
	event.preventDefault();

	const fullName = document.querySelector('#full-name').value.trim();
	const newUserEmail = document.querySelector('#user-email').value.trim();
	const newUserPass = document.querySelector('#user-password').value.trim();
	const confirmPass = document.querySelector('#conf-password').value.trim();

	if (newUserPass != confirmPass) {
		return alert('Passwords do not match');
	}

	const newUser = JSON.stringify({
		full_name: fullName,
		email: newUserEmail,
		password: newUserPass,
	});

	try {
		const response = await fetch('http://localhost:5001/register', {
			method: 'POST',
			headers: { 'Content-type': 'application/json' },
			body: newUser,
		});

		if (response.ok) {
			registerForm.reset();

			alert('Registered successfuly');

			return window.location.assign(`./login.html`);
		}

		if (!response.ok || response.status >= 400) {
			const data = await response.json();
			alert(data.error);
		}
	} catch (error) {
		console.log(error);
	}
});
