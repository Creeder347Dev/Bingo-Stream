// ===== TOAST =====
function showToast(msg){
  let t = document.getElementById("toast");

  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    document.body.appendChild(t);

    Object.assign(t.style, {
      position: "fixed",
      bottom: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(0,0,0,0.85)",
      color: "#fff",
      padding: "10px 16px",
      borderRadius: "8px",
      fontSize: "14px",
      zIndex: 9999,
      opacity: 0,
      transition: "opacity 0.3s"
    });
  }

  t.textContent = msg;
  t.style.opacity = 1;

  setTimeout(() => {
    t.style.opacity = 0;
  }, 2000);
}


// ===== CAPTURE + COPY =====
async function captureGrid(){
  const el = document.getElementById("capture-area");

  if (!el) {
    showToast("Zone introuvable");
    return;
  }

  try {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: null
    });

    // ===== 1. TENTATIVE MODERNE (Chrome / Edge) =====
    try {
      const blob = await new Promise(resolve =>
        canvas.toBlob(resolve, "image/png")
      );

      if (blob && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob })
        ]);

        showToast("Image copiée !");
        return;
      }

    } catch (err) {
      console.warn("Clipboard API échouée:", err);
    }

    // ===== 2. FALLBACK FIREFOX (hack image sélectionnée) =====
    try {
      const dataUrl = canvas.toDataURL("image/png");

      const img = document.createElement("img");
      img.src = dataUrl;
      img.style.position = "fixed";
      img.style.left = "-9999px";

      const div = document.createElement("div");
      div.contentEditable = true;
      div.style.position = "fixed";
      div.style.left = "-9999px";
      div.appendChild(img);

      document.body.appendChild(div);

      const range = document.createRange();
      range.selectNode(img);

      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      const success = document.execCommand("copy");

      selection.removeAllRanges();
      document.body.removeChild(div);

      if (success) {
        showToast("Image copiée !");
        return;
      } else {
        throw new Error("execCommand échoué");
      }

    } catch (err) {
      console.error("Fallback Firefox échoué:", err);
    }

    // ===== 3. DERNIER RECOURS =====
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "bingo.png";
    link.click();

    showToast("Image téléchargée");

  } catch (err) {
    console.error(err);
    showToast("Erreur capture");
  }
}


// ===== EXPORT GLOBAL =====
window.captureGrid = captureGrid;
