let config = { phrases: [] };
let token = null;

async function login() {
  const password = document.getElementById("password").value;

  const res = await fetch("/api/login", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ password })
  });

  if (!res.ok) return alert("❌ mauvais mot de passe");

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
    const div = document.createElement("div");
    div.className = "row";

    const input = document.createElement("input");
    input.value = text;
    input.oninput = () => config.phrases[i] = input.value;

    const del = document.createElement("button");
    del.innerText = "❌";
    del.onclick = () => {
      config.phrases.splice(i,1);
      render();
    };

    div.appendChild(input);
    div.appendChild(del);
    container.appendChild(div);
  });
}

function addPhrase() {
  config.phrases.push("Nouvelle phrase");
  render();
}

async function save() {
  if (!token) return alert("login requis");

  await fetch("/api/config", {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":"Bearer "+token
    },
    body: JSON.stringify({ phrases: config.phrases })
  });

  alert("✅ sauvegardé !");
}
