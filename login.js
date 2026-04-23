async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const error = document.getElementById("error");

  error.innerText = "";

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      error.innerText = "Identifiants incorrects";
      return;
    }

    const data = await res.json();
    localStorage.setItem("token", data.token);

    window.location.href = "/editor.html";

  } catch {
    error.innerText = "Erreur serveur";
  }
}