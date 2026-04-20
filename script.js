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
  // 🔥 SEULE MODIF : GESTION FORCED
  // ===============================

  const isForced = (p) => typeof p === "object" && p.forced;

  const forced = config.phrases.filter(isForced);
  let normal = config.phrases.filter(p => !isForced(p));

  // Duplication uniquement des normales (comme ton système d'origine)
  while (normal.length < total) {
    normal = normal.concat(normal);
  }

  const shuffle = arr => arr.sort(() => Math.random() - 0.5);

  const shuffledForced = shuffle([...forced]);
  const shuffledNormal = shuffle([...normal]);

  // On garantit que les forced sont inclus
  let selected = [
    ...shuffledForced.slice(0, total),
    ...shuffledNormal.slice(0, total - forced.length)
  ];

  // Mélange final pour garder un rendu aléatoire
  selected = shuffle(selected);

  // ===============================
  // GRID (INCHANGÉ)
  // ===============================
  grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

  selected.forEach(text => {
    const div = document.createElement("div");
    div.className = "cell";

    const span = document.createElement("span");

    // compatible string + objet
    span.innerText = (typeof text === "object") ? text.text : text;

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
// TEXTE UNIFORME (IMPORTANT)
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
