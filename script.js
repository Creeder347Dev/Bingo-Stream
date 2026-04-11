const grid = document.getElementById("grid");
const statusEl = document.getElementById("status");

let cells = [];
let config = null;

async function loadConfig() {
  const response = await fetch("config.json");
  config = await response.json();
}

function generateGrid() {
  grid.innerHTML = "";
  cells = [];

  const size = config.gridSize;
  const total = size * size;

  const shuffled = [...config.phrases].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, total);

  grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

  selected.forEach(text => {
    const div = document.createElement("div");
    div.className = "cell";

    const span = document.createElement("span");
    span.innerText = text;

    div.appendChild(span);

    div.onclick = () => {
      div.classList.toggle("checked");
    };

    grid.appendChild(div);
    cells.push(div);
  });
}

function resetGrid() {
  generateGrid();
  statusEl.innerText = "";
}

(async function init() {
  await loadConfig();
  generateGrid();
})();
