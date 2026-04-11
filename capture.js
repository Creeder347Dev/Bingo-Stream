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
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob
          })
        ]);

        console.log("✅ Copié !");
      } catch (err) {
        console.error("Clipboard error:", err);
        alert("❌ Copie non supportée");
      }
    });

  } catch (err) {
    console.error("Capture error:", err);
  }
}
