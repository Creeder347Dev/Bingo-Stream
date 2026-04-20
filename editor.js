// ===============================
// AUTH CHECK
// ===============================
const token = localStorage.getItem("token");
if (!token) location.href = "/login.html";

// ===============================
// LOAD CONFIG
// ===============================
let config = { phrases: [] };

async function load() {
  const res = await fetch("/api/config", {
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  const text = await res.text();
  console.log("API RESPONSE:", text);

  config = JSON.parse(text);
  render();
}

// ===============================
// RENDER
// ===============================
function render() {
  const container = document.getElementById("phrases");
  container.innerHTML = "";

  config.phrases.forEach((p, i) => {
    const row = document.createElement("div");
    row.className = "row";

    const input = document.createElement("textarea");
    input.value = p.text;
    input.oninput = () => config.phrases[i].text = input.value;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = p.forced;
    checkbox.onchange = () => config.phrases[i].forced = checkbox.checked;

    const del = document.createElement("button");
    del.innerText = "🗑";
    del.onclick = () => {
      config.phrases.splice(i, 1);
      render();
    };

    row.append(input, checkbox, del);
    container.appendChild(row);
  });
}

// ===============================
// SAVE
// ===============================
async function save() {
  await fetch("/api/config", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(config)
  });

  alert("Sauvegardé !");
}

// ===============================
// INIT
// ===============================
load();
