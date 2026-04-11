const grid = document.getElementById("grid");
const statusEl = document.getElementById("status");

let cells = [];
let config = null;

async function loadConfig() {
  const response = await fetch("config.json");
  config = await response.json();
}
function setUniformTextSize() {
  let size = 8;
  let fits;

  do {
    size++;
    fits = true;

    cells.forEach(cell => {
      const span = cell.querySelector("span");
      span.style.fontSize = size + "px";

      if (
        span.scrollHeight > cell.clientHeight ||
        span.scrollWidth > cell.clientWidth
      ) {
        fits = false;
      }
    });

  } while (fits && size < 40);

  const finalSize = size - 1;

  cells.forEach(cell => {
    cell.querySelector("span").style.fontSize = finalSize + "px";
  });
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
