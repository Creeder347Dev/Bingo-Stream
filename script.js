const grid = document.getElementById("grid");
let config = { phrases: [] };

async function loadConfig() {
  const res = await fetch("/api/config");
  config = await res.json();
  generateGrid();
}

function generateGrid() {
  grid.innerHTML = "";
  const phrases = config.phrases.slice(0,25);

  phrases.forEach(text=>{
    const div = document.createElement("div");
    div.className="cell";
    div.innerText=text;
    div.onclick=()=>div.classList.toggle("checked");
    grid.appendChild(div);
  });
}

function resetGrid() {
  generateGrid();
}

// websocket auto refresh
const ws = new WebSocket((location.protocol === "https:" ? "wss://" : "ws://") + location.host);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "update") {
    loadConfig();
  }
};

loadConfig();
