const userLogin = document.querySelector('#user-login');

userLogin.addEventListener('submit', async (event) => {
	event.preventDefault();

	const userEmailInput = document.querySelector('#email-input').value.trim();
	const userPassInput = document.querySelector('#user-password').value.trim();

	try {
		const response = await fetch('http://localhost:5001/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: userEmailInput,
				password: userPassInput,
			}),
		});

		if (response.ok) {
			loginForm.reset();
			const authData = await response.json();

			localStorage.setItem('token', userData.token);

			return window.location.assign(`./groups.html`);
		}

		if (!response.ok || response.status >= 400) {
			return alert(authData?.error || response.statusText);
		}
	} catch (error) {
		alert(error.message);
	}
});
