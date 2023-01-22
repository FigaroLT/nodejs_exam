const userLogin = document.querySelector("#user-login");

userLogin.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userEmailInput = document.querySelector("#email-input").value.trim();
  const userPassInput = document.querySelector("#user-password").value.trim();

  const user = JSON.stringify({
    email: userEmailInput,
    password: userPassInput,
  });

  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-type", "application/json");

    const response = await fetch("http://localhost:5001/login", {
      method: "POST",
      headers: myHeaders,
      body: user,
    });

    const authData = await response.json();

    if (response.ok) {
      loginForm.reset();

      localStorage.setItem("token", userData.token);

      return window.location.assign(`./groups.html`);
    }

    if (!response.ok || response.status >= 400) {
      return alert(authData?.error || response.statusText);
    }
  } catch (error) {
    alert(error.message);
  }
});
