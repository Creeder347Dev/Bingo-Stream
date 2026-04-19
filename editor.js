let config={phrases:[]};
const token=localStorage.getItem("token");
if(!token) location.href="/login.html";

async function load(){
 const r=await fetch("/api/config");
 config=await r.json();
 render();
}

function render(){
 const c=document.getElementById("phrases");
 c.innerHTML="";

 config.phrases.forEach((p,i)=>{
  const row=document.createElement("div");
  row.className="row";

  const inputText=document.createElement("textarea");
  inputText.value=p.text;
  inputText.oninput=()=>config.phrases[i].text=inputText.value;

  const toggle=document.createElement("label");
  toggle.className="switch";

  const input=document.createElement("input");
  input.type="checkbox";
  input.checked=p.forced;
  input.onchange=()=>config.phrases[i].forced=input.checked;

  const slider=document.createElement("span");
  slider.className="slider";

  toggle.appendChild(input);
  toggle.appendChild(slider);

  const del=document.createElement("button");
  del.innerHTML="&times;";
  del.onclick=()=>{
    if(confirm("Supprimer cette phrase ?")){
      config.phrases.splice(i,1);
      render();
    }
  };

  row.append(inputText,toggle,del);
  c.appendChild(row);
 });
}

function addPhrase(){
 config.phrases.push({text:"Nouvelle phrase",forced:false});
 render();
}

async function save(){
 await fetch("/api/config",{
  method:"POST",
  headers:{
   "Content-Type":"application/json",
   "Authorization":"Bearer "+token
  },
  body:JSON.stringify(config)
 });
}

load();
