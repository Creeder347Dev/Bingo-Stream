let config = { phrases: [] };
let token = null;

async function login() {
  const password = document.getElementById("password").value;

  const res = await fetch("/api/login", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ password })
  });

  if (!res.ok) return alert("Erreur");

  const data = await res.json();
  token = data.token;

  loadConfig();
}

async function loadConfig() {
  const res = await fetch("/api/config");
  config = await res.json();
  render();
}

function render() {
  const container = document.getElementById("phrases");
  container.innerHTML = "";

  config.phrases.forEach((text, i) => {
    const input = document.createElement("input");
    input.value = text;
    input.oninput = () => config.phrases[i] = input.value;
    container.appendChild(input);
  });
}

function addPhrase() {
  config.phrases.push("Nouvelle phrase");
  render();
}

async function save() {
  if (!token) return;

  await fetch("/api/config", {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":"Bearer "+token
    },
    body: JSON.stringify({ phrases: config.phrases })
  });
}

async function resetBingo() {
  if (!token) return;

  await fetch("/api/reset", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token
    }
  });
}
