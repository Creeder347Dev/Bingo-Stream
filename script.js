const grid = document.getElementById("grid");
let config = { phrases: [] };

const GRID_DURATION = 24 * 60 * 60 * 1000;

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

async function loadConfig() {
  const res = await fetch("/api/config");
  config = await res.json();
  generateGrid();
}

function generateGrid() {
  grid.innerHTML = "";

  const now = Date.now();
  let saved = JSON.parse(localStorage.getItem("bingoState"));

  let selected;
  let checked = [];

  if (saved && (now - saved.timestamp < GRID_DURATION)) {
    selected = saved.grid;
    checked = saved.checked || [];
  } else {
    const shuffled = shuffle([...config.phrases]);
    selected = shuffled.slice(0, 25);

    saved = {
      grid: selected,
      checked: [],
      timestamp: now
    };

    localStorage.setItem("bingoState", JSON.stringify(saved));
  }

  selected.forEach((text, index) => {
    const div = document.createElement("div");
    div.className = "cell";
    div.innerHTML = `<span>${text.text || text}</span>`;

    if (checked.includes(index)) {
      div.classList.add("checked");
    }

    div.onclick = () => {
      div.classList.toggle("checked");

      let state = JSON.parse(localStorage.getItem("bingoState"));
      if (!state) return;

      if (div.classList.contains("checked")) {
        if (!state.checked.includes(index)) state.checked.push(index);
      } else {
        state.checked = state.checked.filter(i => i !== index);
      }

      localStorage.setItem("bingoState", JSON.stringify(state));
    };

    grid.appendChild(div);
  });
}

function resetGrid() {
  localStorage.removeItem("bingoState");
  generateGrid();
}

function copyGrid() {
  const cells = document.querySelectorAll(".cell span");

  let text = "🎯 Bingo du chat 🎯\n\n";

  cells.forEach((cell, i) => {
    const checked = cell.parentElement.classList.contains("checked") ? "✅" : "⬜";
    text += `${checked} ${cell.innerText}\n`;

    if ((i + 1) % 5 === 0) text += "\n";
  });

  navigator.clipboard.writeText(text);
  showToast("Grille copiée !");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

loadConfig();
