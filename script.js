// ===============================
// RÉFÉRENCES DOM
// ===============================
const grid = document.getElementById("grid");
const statusEl = document.getElementById("status");

let cells = [];
let config = null;


// ===============================
// CHARGEMENT CONFIG JSON
// ===============================
async function loadConfig() {
  try {
    const response = await fetch("./config.json?v=" + Date.now());
    config = await response.json();

    console.log("CONFIG LOADED:", config);
  } catch (e) {
    console.error("Erreur chargement config:", e);
  }
}


// ===============================
// GÉNÉRATION DE LA GRILLE
// ===============================
function generateGrid() {
  grid.innerHTML = "";
  cells = [];

  const size = config.gridSize;
  const total = size * size;

  // ===============================
  // FIX FORCED + SAFE DATA
  // ===============================

  // Normalisation
  const phrases = config.phrases.map(p =>
    typeof p === "string"
      ? { text: p, forced: false }
      : { text: p.text, forced: !!p.forced }
  );

  let forced = phrases.filter(p => p.forced);
  let normal = phrases.filter(p => !p.forced);

  // Duplication SAFE (pas infinie)
  while (normal.length < total) {
    normal.push(...phrases.filter(p => !p.forced));
  }

  // Shuffle
  const shuffle = arr => arr.sort(() => Math.random() - 0.5);

  forced = shuffle(forced);
  normal = shuffle(normal);

  // Construction finale
  let selected = [
    ...forced.slice(0, total),
    ...normal.slice(0, total - forced.length)
  ];

  selected = shuffle(selected);

  // ===============================
  // GRID
  // ===============================
  grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

  selected.forEach(item => {
    const div = document.createElement("div");
    div.className = "cell";

    const span = document.createElement("span");

    // 🔥 IMPORTANT FIX
    span.innerText = item.text || item;

    div.appendChild(span);

    div.onclick = () => {
      div.classList.toggle("checked");
      checkBingo(size);
    };

    grid.appendChild(div);
    cells.push(div);
  });

  setUniformTextSize();
}


// ===============================
// TEXTE UNIFORME
// ===============================
function setUniformTextSize() {
  let minSize = 10;
  let maxSize = 40; // limite safe
  let bestSize = minSize;

  while (minSize <= maxSize) {
    let mid = Math.floor((minSize + maxSize) / 2);
    let fits = true;

    cells.forEach(cell => {
      const span = cell.querySelector("span");
      span.style.fontSize = mid + "px";

      if (
        span.scrollHeight > cell.clientHeight ||
        span.scrollWidth > cell.clientWidth
      ) {
        fits = false;
      }
    });

    if (fits) {
      bestSize = mid;
      minSize = mid + 1;
    } else {
      maxSize = mid - 1;
    }
  }

  cells.forEach(cell => {
    cell.querySelector("span").style.fontSize = bestSize + "px";
  });
}

window.addEventListener("resize", setUniformTextSize);


// ===============================
// VÉRIFICATION BINGO
// ===============================
function checkBingo(size) {
  let win = false;

  // Lignes
  for (let i = 0; i < size; i++) {
    if (cells.slice(i * size, i * size + size).every(c => c.classList.contains("checked"))) {
      win = true;
    }
  }

  // Colonnes
  for (let i = 0; i < size; i++) {
    if (Array.from({ length: size }, (_, j) => cells[i + j * size]).every(c => c.classList.contains("checked"))) {
      win = true;
    }
  }

  // Diagonales
  if (Array.from({ length: size }, (_, i) => cells[i * (size + 1)]).every(c => c.classList.contains("checked"))) {
    win = true;
  }

  if (Array.from({ length: size }, (_, i) => cells[(i + 1) * (size - 1)]).every(c => c.classList.contains("checked"))) {
    win = true;
  }

  if (win) {
    statusEl.innerText = "🔥 BINGO !!! 🔥";
    statusEl.classList.add("bingo-win");
  } else {
    statusEl.innerText = "";
    statusEl.classList.remove("bingo-win");
  }
}


// ===============================
// RESET
// ===============================
function resetGrid() {
  generateGrid();
  statusEl.innerText = "";
  statusEl.classList.remove("bingo-win");
}


// ===============================
// INIT
// ===============================
(async function init() {
  await loadConfig();
  generateGrid();
})();
