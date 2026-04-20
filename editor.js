// ===============================
// AUTH
// ===============================
const token = localStorage.getItem("token");
if (!token) location.href = "/login.html";

// ===============================
// DATA
// ===============================
let config = { phrases: [] };

// ===============================
// LOAD
// ===============================
async function load() {
  const res = await fetch("/api/config", {
    headers: {
      Authorization: "Bearer " + token
    }
  });

  const text = await res.text();
  console.log("API:", text);

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

    // TEXT
    const input = document.createElement("textarea");
    input.value = p.text;
    input.oninput = () => config.phrases[i].text = input.value;

    // TOGGLE (SLIDER)
    const toggle = document.createElement("label");
    toggle.className = "switch";

    const inputToggle = document.createElement("input");
    inputToggle.type = "checkbox";
    inputToggle.checked = p.forced;
    inputToggle.onchange = () => {
      config.phrases[i].forced = inputToggle.checked;
    };

    const slider = document.createElement("span");
    slider.className = "slider";

    toggle.appendChild(inputToggle);
    toggle.appendChild(slider);

    // DELETE
    const del = document.createElement("button");
    del.innerText = "🗑";
    del.onclick = () => {
      config.phrases.splice(i, 1);
      render();
    };

    row.appendChild(input);
    row.appendChild(toggle);
    row.appendChild(del);

    container.appendChild(row);
  });
}

// ===============================
// ADD
// ===============================
function addPhrase() {
  config.phrases.push({ text: "Nouvelle phrase", forced: false });
  render();
}

// ===============================
// SAVE
// ===============================
async function save() {
  await fetch("/api/config", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(config)
  });

  alert("Sauvegardé !");
}

// ===============================
// INIT
// ===============================
load();
