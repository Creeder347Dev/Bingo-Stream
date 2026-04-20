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
  // 🔥 FIX FORCED (SEULE MODIF)
  // ===============================

  // Séparer forcé / normal (compatible string + objet)
  const forced = config.phrases.filter(p => typeof p === "object" && p.forced);
  let normal = config.phrases.filter(p => !(typeof p === "object" && p.forced));

  // Duplication uniquement des normales si besoin
  while (normal.length < total) {
    normal = normal.concat(normal);
  }

  // Mélange
  const shuffle = arr => arr.sort(() => Math.random() - 0.5);

  const mixedForced = shuffle([...forced]);
  const mixedNormal = shuffle([...normal]);

  // Construction finale
  let selected = [
    ...mixedForced.slice(0, total),
    ...mixedNormal.slice(0, total - forced.length)
  ];

  selected = shuffle(selected);

  // ===============================
  // GRID (inchangé)
  // ===============================
  grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

  selected.forEach(text => {
    const div = document.createElement("div");
    div.className = "cell";

    const span = document.createElement("span");

    // 🔥 compatible string + objet
    span.innerText = text.text || text;

    div.appendChild(span);

    // Interaction clic
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
// TEXTE UNIFORME (INCHANGÉ)
// ===============================
function setUniformTextSize() {
  let minSize = 8;
  let maxSize = 200;
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
// VÉRIFICATION BINGO (INCHANGÉ)
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
// RESET (INCHANGÉ)
// ===============================
function resetGrid() {
  generateGrid();
  statusEl.innerText = "";
  statusEl.classList.remove("bingo-win");
}


// ===============================
// INIT (INCHANGÉ)
// ===============================
(async function init() {
  await loadConfig();
  generateGrid();
})();
