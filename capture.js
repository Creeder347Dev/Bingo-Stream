function showToast(msg){
const t=document.getElementById("toast");
t.innerText=msg;
t.classList.remove("show");
void t.offsetWidth;
t.classList.add("show");
setTimeout(()=>t.classList.remove("show"),2000);
}

async function captureGrid(){
const el=document.getElementById("capture-area");
const canvas=await html2canvas(el,{backgroundColor:null,scale:2});
const blob=await new Promise(r=>canvas.toBlob(r));

try{
await navigator.clipboard.write([new ClipboardItem({"image/png":blob})]);
showToast("✅ Copié !");
}catch{
const link=document.createElement("a");
link.download="bingo.png";
link.href=URL.createObjectURL(blob);
link.click();
showToast("📥 Téléchargé");
}
}
