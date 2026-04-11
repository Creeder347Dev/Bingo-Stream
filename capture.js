// ===============================
// TOAST (POPUP BAS DE PAGE)
// ===============================
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.innerText = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}


// ===============================
// CAPTURE DE LA GRILLE + COPIE
// ===============================
async function captureGrid() {
  const element = document.getElementById("capture-area");

  if (!element) {
    console.error("Element capture-area introuvable");
    showToast("❌ Erreur interne");
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      logging: false
    });

    // conversion blob (fiable)
    const blob = await new Promise(resolve => canvas.toBlob(resolve));

    if (!blob) {
      showToast("❌ Erreur génération image");
      return;
    }

    try {
      // tentative copie presse-papier
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob
        })
      ]);

      showToast("✅ Grille copiée !");
    } catch (err) {
      console.error("Clipboard error:", err);

      // fallback téléchargement
      const link = document.createElement("a");
      link.download = "bingo.png";
      link.href = URL.createObjectURL(blob);
      link.click();

      showToast("⚠️ Téléchargement à la place");
    }

  } catch (err) {
    console.error("Capture error:", err);
    showToast("❌ Erreur capture");
  }
}
