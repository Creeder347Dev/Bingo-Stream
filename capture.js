// ===============================
// TOAST (POPUP BAS DE PAGE)
// ===============================
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}


// ===============================
// CAPTURE DE LA GRILLE UNIQUEMENT
// ===============================
async function captureGrid() {
  const element = document.getElementById("capture-area");

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2
    });

    canvas.toBlob(async (blob) => {
      if (!blob) {
        showToast("❌ Erreur génération image");
        return;
      }

      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob
          })
        ]);

        showToast("✅ Grille copiée !");
      } catch (err) {
        console.error("Clipboard error:", err);
        showToast("❌ Copie non supportée");
      }
    });

  } catch (err) {
    console.error("Capture error:", err);
    showToast("❌ Erreur capture");
  }
}
