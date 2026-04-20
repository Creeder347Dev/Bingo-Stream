const grid = document.getElementById("grid");
let config = { phrases: [] };

const GRID_DURATION = 24 * 60 * 60 * 1000;

let bingoAlreadyShown = false;

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

    // ===============================
    // 🔥 MODIF UNIQUE : FORCED
    // ===============================

    const phrases = config.phrases.map(p =>
      typeof p === "string" ? { text: p, forced: false } : p
    );

    const forced = phrases.filter(p => p.forced);
    let normal = phrases.filter(p => !p.forced);

    while (normal.length < 25) {
      normal = normal.concat(normal);
    }

    const shuffledForced = shuffle([...forced]);
    const shuffledNormal = shuffle([...normal]);

    selected = [
      ...shuffledForced.slice(0, 25),
      ...shuffledNormal.slice(0, 25 - forced.length)
    ];

    selected = shuffle(selected);

    // ===============================

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

    if (checked.includes(index)) div.classList.add("checked");

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

      checkWin();
    };

    grid.appendChild(div);
  });

  checkWin();
}

function resetGrid() {
  localStorage.removeItem("bingoState");
  bingoAlreadyShown = false;
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
  setTimeout(() => toast.classList.remove("show"), 2000);
}

function showBingo() {
  if (bingoAlreadyShown) return;

  bingoAlreadyShown = true;

  const el = document.getElementById("bingoMessage");
  el.classList.add("show");

  setTimeout(() => {
    el.classList.remove("show");
  }, 2500);
}

function checkWin() {
  const cells = document.querySelectorAll(".cell");
  const size = 5;

  cells.forEach(c => c.classList.remove("win"));

  let hasWin = false;

  for (let r = 0; r < size; r++) {
    let win = true;
    let row = [];

    for (let c = 0; c < size; c++) {
      const i = r * size + c;
      row.push(cells[i]);
      if (!cells[i].classList.contains("checked")) win = false;
    }

    if (win) {
      hasWin = true;
      row.forEach(cell => cell.classList.add("win"));
    }
  }

  for (let c = 0; c < size; c++) {
    let win = true;
    let col = [];

    for (let r = 0; r < size; r++) {
      const i = r * size + c;
      col.push(cells[i]);
      if (!cells[i].classList.contains("checked")) win = false;
    }

    if (win) {
      hasWin = true;
      col.forEach(cell => cell.classList.add("win"));
    }
  }

  let win1 = true;
  let win2 = true;

  for (let i = 0; i < size; i++) {
    if (!cells[i * size + i].classList.contains("checked")) win1 = false;
    if (!cells[i * size + (size - 1 - i)].classList.contains("checked")) win2 = false;
  }

  if (win1) {
    hasWin = true;
    for (let i = 0; i < size; i++) {
      cells[i * size + i].classList.add("win");
    }
  }

  if (win2) {
    hasWin = true;
    for (let i = 0; i < size; i++) {
      cells[i * size + (size - 1 - i)].classList.add("win");
    }
  }

  if (hasWin) showBingo();
}

loadConfig();
