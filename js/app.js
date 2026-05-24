// ================================================
//  MARIAGE — Vanina & Yvan
//  app.js
//  Thème : Orange Brûlé
// ================================================
// ── PHOTO BACKGROUND ──
function showPhotoZone(){
  document.getElementById("photoZone").classList.add("visible");
}

function dragOver(e){
  e.preventDefault();
  document.getElementById("photoDrop").classList.add("drag");
}
function dragLeave(e){
  document.getElementById("photoDrop").classList.remove("drag");
}
function dropPhoto(e){
  e.preventDefault();
  document.getElementById("photoDrop").classList.remove("drag");
  const file=e.dataTransfer.files[0];
  if(file&&file.type.startsWith("image/")) loadPhoto(file);
}

function loadPhoto(file){
  if(!file) return;
  const reader=new FileReader();
  reader.onload=function(e){
    const url=e.target.result;
    // Apply to hero background
    const bg=document.getElementById("heroBg");
    bg.style.backgroundImage=`url('${url}')`;
    bg.classList.add("loaded");
    // Show overlay, hide plain texture/grid
    document.getElementById("heroOverlay").style.display="block";
    document.getElementById("heroTexture").style.opacity="0.3";
    document.getElementById("heroGrid").style.opacity="0.3";
    // Show preview
    const prev=document.getElementById("photoPreview");
    prev.src=url; prev.style.display="block";
    document.getElementById("photoRemove").style.display="block";
    document.querySelector(".photo-drop-icon").style.display="none";
    notify("📷 Photo ajoutée avec succès !");
  };
  reader.readAsDataURL(file);
}

function removePhoto(e){
  e.stopPropagation();
  const bg=document.getElementById("heroBg");
  bg.style.backgroundImage=""; bg.classList.remove("loaded");
  document.getElementById("heroOverlay").style.display="none";
  document.getElementById("heroTexture").style.opacity="1";
  document.getElementById("heroGrid").style.opacity="1";
  document.getElementById("photoPreview").style.display="none";
  document.getElementById("photoPreview").src="";
  document.getElementById("photoRemove").style.display="none";
  document.querySelector(".photo-drop-icon").style.display="block";
  document.getElementById("photoInput").value="";
  notify("Photo retirée","inf");
}

// Show photo zone button in nav area
document.addEventListener("DOMContentLoaded",function(){
  // Add photo button to nav
  const nav=document.getElementById("nav");
  const photoBtn=document.createElement("button");
  photoBtn.className="nav-admin-btn";
  photoBtn.style.cssText="margin-right:8px;border-color:rgba(204,85,0,.25);font-size:.58rem";
  photoBtn.textContent="📷 Photo";
  photoBtn.onclick=function(){
    const z=document.getElementById("photoZone");
    z.classList.toggle("visible");
  };
  nav.insertBefore(photoBtn,nav.querySelector(".nav-admin-btn"));
});
// ══════════════════════════════════════
// CONFIG
// ══════════════════════════════════════
const ADMIN_PWD   = "mariage2025";
const COUPLE      = "Sophia & Alexandre";
const VENUE       = "Château de Versailles, Paris";
const WDATE       = new Date("2025-06-14T17:00:00");

// ══════════════════════════════════════
// DONNÉES INVITÉS
// ══════════════════════════════════════
let guests = [
  {id:"INV-001",ti:"M.",    fn:"Jean",     ln:"Martin",    tb:1,  zn:"vip",      dt:"",                   nt:"Père du marié",         ar:false,at:null},
  {id:"INV-002",ti:"Mme",   fn:"Claire",   ln:"Martin",    tb:1,  zn:"vip",      dt:"🥗 Végétarien",      nt:"Mère du marié",         ar:false,at:null},
  {id:"INV-003",ti:"M.",    fn:"Pierre",   ln:"Dubois",    tb:1,  zn:"famille",  dt:"",                   nt:"Oncle de la mariée",    ar:false,at:null},
  {id:"INV-004",ti:"Mme",   fn:"Isabelle", ln:"Dubois",    tb:1,  zn:"famille",  dt:"🚫 Sans gluten",     nt:"",                      ar:false,at:null},
  {id:"INV-005",ti:"M.",    fn:"Thomas",   ln:"Bernard",   tb:2,  zn:"amis",     dt:"",                   nt:"Meilleur ami du marié", ar:false,at:null},
  {id:"INV-006",ti:"Mme",   fn:"Sophie",   ln:"Bernard",   tb:2,  zn:"amis",     dt:"🌱 Végane",          nt:"",                      ar:false,at:null},
  {id:"INV-007",ti:"M.",    fn:"Nicolas",  ln:"Petit",     tb:2,  zn:"amis",     dt:"🕌 Halal",           nt:"Témoin",                ar:false,at:null},
  {id:"INV-008",ti:"Mme",   fn:"Lucie",    ln:"Moreau",    tb:2,  zn:"amis",     dt:"",                   nt:"",                      ar:false,at:null},
  {id:"INV-009",ti:"Dr",    fn:"Henri",    ln:"Leroy",     tb:3,  zn:"vip",      dt:"",                   nt:"Parrain du marié",      ar:false,at:null},
  {id:"INV-010",ti:"Mme",   fn:"Marie",    ln:"Leroy",     tb:3,  zn:"vip",      dt:"🥗 Végétarien",      nt:"",                      ar:false,at:null},
  {id:"INV-011",ti:"M.",    fn:"Julien",   ln:"Simon",     tb:3,  zn:"famille",  dt:"",                   nt:"",                      ar:false,at:null},
  {id:"INV-012",ti:"Mme",   fn:"Aurélie",  ln:"Simon",     tb:3,  zn:"famille",  dt:"",                   nt:"",                      ar:false,at:null},
  {id:"INV-013",ti:"M.",    fn:"Fabrice",  ln:"Laurent",   tb:4,  zn:"amis",     dt:"",                   nt:"",                      ar:false,at:null},
  {id:"INV-014",ti:"Mme",   fn:"Céline",   ln:"Laurent",   tb:4,  zn:"amis",     dt:"🚫 Sans gluten",     nt:"Vient de Montréal",     ar:false,at:null},
  {id:"INV-015",ti:"M.",    fn:"Antoine",  ln:"Michel",    tb:4,  zn:"amis",     dt:"",                   nt:"",                      ar:false,at:null},
  {id:"INV-016",ti:"Mme",   fn:"Nathalie", ln:"Garcia",    tb:4,  zn:"collegues",dt:"🌱 Végane",          nt:"",                      ar:false,at:null},
  {id:"INV-017",ti:"M.",    fn:"David",    ln:"Roux",      tb:5,  zn:"collegues",dt:"",                   nt:"",                      ar:false,at:null},
  {id:"INV-018",ti:"Mme",   fn:"Sandrine", ln:"Roux",      tb:5,  zn:"collegues",dt:"",                   nt:"",                      ar:false,at:null},
  {id:"INV-019",ti:"M.",    fn:"Maxime",   ln:"Vincent",   tb:5,  zn:"amis",     dt:"🕌 Halal",           nt:"Ami d'enfance",         ar:false,at:null},
  {id:"INV-020",ti:"Mme",   fn:"Émilie",   ln:"Blanc",     tb:5,  zn:"vip",      dt:"",                   nt:"Marraine de la mariée", ar:false,at:null},
  {id:"INV-021",ti:"M.",    fn:"Raphaël",  ln:"Fontaine",  tb:6,  zn:"amis",     dt:"",                   nt:"",                      ar:false,at:null},
  {id:"INV-022",ti:"Mme",   fn:"Camille",  ln:"Fontaine",  tb:6,  zn:"amis",     dt:"🥗 Végétarien",      nt:"",                      ar:false,at:null},
  {id:"INV-023",ti:"M.",    fn:"Baptiste", ln:"Chevalier", tb:6,  zn:"amis",     dt:"",                   nt:"",                      ar:false,at:null},
  {id:"INV-024",ti:"Mme",   fn:"Anaïs",    ln:"Chevalier", tb:6,  zn:"famille",  dt:"🚫 Sans gluten",     nt:"Cousine de la mariée",  ar:false,at:null},
];
let nextN = 25;
let curF  = "all";
let curA  = "all";
let scanOn= false;
let qrScn = null;
let arrLog= [];

// ── utils ──
const $  = id => document.getElementById(id);
const fn = g  => `${g.fn} ${g.ln}`;
const ts = () => new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});

function notify(msg, type="ok"){
  const n=$("notif");
  n.textContent=msg;
  n.className=`notif n-${type} show`;
  clearTimeout(n._t);
  n._t=setTimeout(()=>n.classList.remove("show"),3800);
}
function openMod(id){$(id).classList.add("open")}
function closeMod(id){$(id).classList.remove("open")}

function zlbl(z){return{vip:"✦ VIP",famille:"Famille",amis:"Amis",collegues:"Collègues"}[z]||z}
function zcls(z){return{vip:"z-vip",famille:"z-famille",amis:"z-amis",collegues:"z-collegues"}[z]||"z-amis"}

// ── countdown ──
function tick(){
  const d=WDATE-new Date();
  if(d<=0){["cdJ","cdH","cdM","cdS"].forEach(i=>$(i).textContent="00");return}
  $(  "cdJ").textContent=String(Math.floor(d/86400000)).padStart(2,"0");
  $("cdH").textContent=String(Math.floor((d%86400000)/3600000)).padStart(2,"0");
  $("cdM").textContent=String(Math.floor((d%3600000)/60000)).padStart(2,"0");
  $("cdS").textContent=String(Math.floor((d%60000)/1000)).padStart(2,"0");
}
setInterval(tick,1000); tick();

// ── embers ──
(function(){
  const c=$("embers");
  for(let i=0;i<18;i++){
    const e=document.createElement("div");
    e.className="ember";
    const s=Math.random()*6+2;
    e.style.cssText=`width:${s}px;height:${s}px;left:${Math.random()*100}%;animation-duration:${Math.random()*8+6}s;animation-delay:${Math.random()*6}s`;
    c.appendChild(e);
  }
})();

// ── password ──
function openPwd(){$("pwdOverlay").classList.add("open");setTimeout(()=>$("pwdIn").focus(),100)}
function closePwd(){$("pwdOverlay").classList.remove("open");$("pwdIn").value=""}
function chkPwd(){
  if($("pwdIn").value===ADMIN_PWD){closePwd();openAdmin();}
  else{
    $("pwdIn").style.borderColor="#8B2020";
    $("pwdIn").value="";
    setTimeout(()=>$("pwdIn").style.borderColor="",1400);
    notify("Mot de passe incorrect","err");
  }
}

// ── admin ──
function openAdmin(){
  $("admin").classList.add("open");
  $("nav").style.display="none";
  window.scrollTo(0,0);
  updateStats(); renderList(); renderAlpha();
}
function closeAdmin(){
  if(scanOn)stopScan();
  $("admin").classList.remove("open");
  $("nav").style.display="flex";
}

// ── stats ──
function updateStats(){
  const tot=guests.length;
  const arr=guests.filter(g=>g.ar).length;
  const pen=tot-arr;
  const vip=guests.filter(g=>g.zn==="vip").length;
  const pct=tot?Math.round(arr/tot*100):0;
  $("sT").textContent=tot; $("sA").textContent=arr;
  $("sP").textContent=pen; $("sPct").textContent=pct+"%";
  $("sV").textContent=vip;
  $("progF").style.width=pct+"%";
  $("progL").textContent=`${pen} invité${pen>1?"s":""} en attente`;
  $("progR").textContent=`${arr} / ${tot} présents`;
}

// ── alphabet ──
function renderAlpha(){
  const used=new Set(guests.map(g=>g.ln[0].toUpperCase()));
  const alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  $("alphaIdx").innerHTML=
    `<button class="alpha-btn active" onclick="setA('all',this)">Tous</button>`+
    alpha.map(l=>`<button class="alpha-btn ${used.has(l)?'':'disabled'}" onclick="setA('${l}',this)">${l}</button>`).join("");
}
function setA(l,btn){
  curA=l;
  document.querySelectorAll(".alpha-btn").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  renderList();
}

// ── filter ──
function setF(f,btn){
  curF=f;
  document.querySelectorAll(".ftab").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  renderList();
}

// ── render list ──
function renderList(){
  const q=$("srch").value.toLowerCase();
  let list=[...guests];
  if(curF==="arrived") list=list.filter(g=>g.ar);
  if(curF==="pending") list=list.filter(g=>!g.ar);
  if(curF==="vip")     list=list.filter(g=>g.zn==="vip");
  if(q) list=list.filter(g=>fn(g).toLowerCase().includes(q)||String(g.tb).includes(q)||g.zn.includes(q)||g.id.toLowerCase().includes(q));
  if(curA!=="all") list=list.filter(g=>g.ln[0].toUpperCase()===curA);
  list.sort((a,b)=>a.ln.localeCompare(b.ln)||a.fn.localeCompare(b.fn));

  if(!list.length){$("gList").innerHTML=`<div class="no-res">Aucun invité trouvé</div>`;return}

  // group by letter
  const grps={};
  list.forEach(g=>{const l=g.ln[0].toUpperCase();if(!grps[l])grps[l]=[];grps[l].push(g);});

  $("gList").innerHTML=Object.entries(grps).sort().map(([l,gs])=>`
    <div class="letter-section" id="sec-${l}">
      <div class="letter-header">${l}</div>
      ${gs.map(gCard).join("")}
    </div>`).join("");
}

function gCard(g){
  const cls=g.zn==="vip"?"vip-card":g.ar?"arrived":"";
  return `
  <div class="gc ${cls}" id="gc-${g.id}">
    <div>
      <div class="gc-name">${g.ti} ${g.fn} <strong>${g.ln}</strong></div>
      <div class="gc-meta">
        <span class="gc-table">Table N° ${g.tb}</span>
        <span class="gc-zone ${zcls(g.zn)}">${zlbl(g.zn)}</span>
        ${g.dt?`<span class="gc-diet">${g.dt.split(" ")[0]}</span>`:""}
        ${g.ar?`<span style="color:var(--success);font-family:'Cinzel',serif;font-size:.58rem;letter-spacing:.12em">✓ ARRIVÉ(E)</span>`:""}
      </div>
      ${g.ar&&g.at?`<div class="gc-time">Arrivé(e) à ${g.at}</div>`:""}
      ${g.nt?`<div class="gc-note">📝 ${g.nt}</div>`:""}
    </div>
    <div class="gc-actions">
      ${g.ar
        ?`<button class="abt ab-un"  onclick="toggle('${g.id}')">✕ Annuler</button>`
        :`<button class="abt ab-in"  onclick="toggle('${g.id}')">✓ Arrivé(e)</button>`}
      <button class="abt ab-wa"  onclick="sendWA('${g.id}')">💬 WhatsApp</button>
      <button class="abt ab-pdf" onclick="genPDF('${g.id}')">🎫 Billet PDF</button>
      <button class="abt ab-ed"  onclick="openEdit('${g.id}')">✎ Éditer</button>
      <button class="abt ab-del" onclick="delGuest('${g.id}')">✕ Suppr.</button>
    </div>
  </div>`;
}

// ── check-in ──
function toggle(id){
  const g=guests.find(x=>x.id===id); if(!g) return;
  g.ar=!g.ar; g.at=g.ar?ts():null;
  if(g.ar){
    const e=`${g.at} — ${g.ti} ${fn(g)} · Table ${g.tb}`;
    arrLog.unshift(e); updateArrLog();
    notify(`✓ ${g.ti} ${fn(g)} — Arrivée enregistrée à ${g.at}`);
  } else {
    notify(`${fn(g)} — Arrivée annulée`,"err");
  }
  updateStats(); renderList(); renderAlpha();
}

function updateArrLog(){
  $("arrLog").innerHTML=arrLog.length
    ?arrLog.map(e=>`<div style="padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04)">${e}</div>`).join("")
    :`<p style="font-style:italic">Aucune arrivée enregistrée</p>`;
}

// ── add guest ──
function addGuest(){
  const f=$("nFn").value.trim(), l=$("nLn").value.trim(), t=parseInt($("nTb").value);
  if(!f||!l||!t){notify("Remplissez prénom, nom et table","err");return}
  const newId=`INV-${String(nextN++).padStart(3,"0")}`;
  guests.push({id:newId,ti:$("nTi").value,fn:f,ln:l,tb:t,zn:$("nZn").value,dt:$("nDt").value,nt:$("nNt").value.trim(),ar:false,at:null});
  notify(`✓ ${$("nTi").value} ${f} ${l} ajouté(e) — Table ${t}`);
  ["nFn","nLn","nTb","nNt"].forEach(id=>$(id).value="");
  updateStats(); renderList(); renderAlpha();
}

// ── edit ──
function openEdit(id){
  const g=guests.find(x=>x.id===id); if(!g) return;
  $("eId").value=id; $("eFn").value=g.fn; $("eLn").value=g.ln;
  $("eTb").value=g.tb; $("eTi").value=g.ti; $("eZn").value=g.zn;
  $("eDt").value=g.dt; $("eNt").value=g.nt;
  openMod("editMod");
}
function saveEdit(){
  const id=$("eId").value, g=guests.find(x=>x.id===id); if(!g) return;
  g.fn=$("eFn").value.trim(); g.ln=$("eLn").value.trim();
  g.tb=parseInt($("eTb").value); g.ti=$("eTi").value;
  g.zn=$("eZn").value; g.dt=$("eDt").value; g.nt=$("eNt").value.trim();
  closeMod("editMod");
  notify(`✓ ${fn(g)} mis(e) à jour`);
  updateStats(); renderList(); renderAlpha();
}

// ── delete ──
function delGuest(id){
  const g=guests.find(x=>x.id===id);
  if(!g||!confirm(`Supprimer ${fn(g)} ?`)) return;
  guests=guests.filter(x=>x.id!==id);
  notify(`${fn(g)} supprimé(e)`,"err");
  updateStats(); renderList(); renderAlpha();
}

// ── whatsapp ──
function sendWA(id){
  const g=guests.find(x=>x.id===id); if(!g) return;
  const msg=g.ar
    ?`Cher(e) ${g.ti} ${fn(g)},\n\nNous tenions à vous remercier chaleureusement d'avoir partagé ce moment si précieux avec nous. Votre présence a rendu cette soirée inoubliable. 🧡\n\nAvec tout notre amour,\n${COUPLE}`
    :`Bonjour ${g.ti} ${fn(g)} ! 🧡\n\nNous vous attendons avec impatience ce soir.\n\n📍 ${VENUE}\n🪑 Table N° ${g.tb} — Zone ${zlbl(g.zn)}\n⏰ Accueil dès 16h30\n\n${COUPLE}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");
  notify("💬 WhatsApp ouvert — message pré-rédigé","wa");
}
function groupWA(){
  const msg=`Chers amis, chère famille,\n\nMerci infiniment d'avoir été présents à notre mariage ce soir. Votre amour a rendu cette nuit absolument magique. 🧡✨\n\nAvec tout notre amour,\n${COUPLE}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");
  notify("💬 Message de remerciements groupé ouvert","wa");
}

// ── PDF ticket ──
async function genPDF(id){
  const g=guests.find(x=>x.id===id); if(!g) return;
  notify("Génération du billet...","inf");
  try{
    // Generate QR
    const qrDiv=document.createElement("div");
    qrDiv.style.cssText="position:absolute;left:-9999px;top:-9999px;width:128px;height:128px";
    document.body.appendChild(qrDiv);
    new QRCode(qrDiv,{text:JSON.stringify({id:g.id,name:fn(g),table:g.tb,zone:g.zn}),width:128,height:128,colorDark:"#1A0E00",colorLight:"#FDF6EE",correctLevel:QRCode.CorrectLevel.H});
    await new Promise(r=>setTimeout(r,400));
    const qrCanvas=qrDiv.querySelector("canvas");
    const qrImg=qrCanvas?qrCanvas.toDataURL():null;
    document.body.removeChild(qrDiv);

    const {jsPDF}=window.jspdf;
    const doc=new jsPDF({orientation:"landscape",unit:"mm",format:[148,105]});

    // bg
    doc.setFillColor(26,14,0); doc.rect(0,0,148,105,"F");
    // orange bars
    doc.setFillColor(204,85,0); doc.rect(0,0,148,3,"F"); doc.rect(0,102,148,3,"F");
    // left accent line
    doc.setFillColor(204,85,0); doc.rect(0,3,3,99,"F");

    // couple
    doc.setTextColor(204,85,0); doc.setFontSize(7); doc.setFont("helvetica","normal");
    doc.text("INVITATION MARIAGE",14,14);
    doc.setTextColor(255,255,255); doc.setFontSize(16); doc.setFont("helvetica","bold");
    doc.text(COUPLE,14,26);
    doc.setTextColor(184,115,51); doc.setFontSize(7.5); doc.setFont("helvetica","normal");
    doc.text("14 Juin 2025  ·  Château de Versailles  ·  Paris",14,34);

    // divider
    doc.setDrawColor(204,85,0); doc.setLineWidth(0.4); doc.line(14,39,98,39);

    // guest name
    doc.setTextColor(180,115,51); doc.setFontSize(7); doc.text("INVITÉ(E)",14,47);
    doc.setTextColor(255,255,255); doc.setFontSize(13); doc.setFont("helvetica","bold");
    doc.text(`${g.ti} ${g.fn} ${g.ln}`,14,56);

    // table
    doc.setTextColor(204,85,0); doc.setFontSize(7); doc.setFont("helvetica","normal");
    doc.text("TABLE",14,67);
    doc.setFontSize(24); doc.setFont("helvetica","bold"); doc.setTextColor(232,114,42);
    doc.text(`N°${g.tb}`,14,80);

    // zone
    doc.setFontSize(8); doc.setFont("helvetica","normal"); doc.setTextColor(184,115,51);
    doc.text(`Zone : ${zlbl(g.zn).replace("✦ ","")}`,14,88);

    // diet
    if(g.dt){ doc.setTextColor(140,95,55); doc.setFontSize(7); doc.text(`Menu : ${g.dt.replace(/\p{Emoji}/gu,"").trim()}`,14,95); }

    // ID bottom
    doc.setTextColor(50,30,10); doc.setFontSize(6); doc.text(g.id,14,100);

    // dashed separator
    doc.setDrawColor(204,85,0); doc.setLineWidth(0.4); doc.setLineDashPattern([2,2],0);
    doc.line(107,8,107,97); doc.setLineDashPattern([],0);

    // QR section
    doc.setTextColor(204,85,0); doc.setFontSize(6.5); doc.setFont("helvetica","normal");
    doc.text("SCAN À L'ENTRÉE",127,15,{align:"center"});
    if(qrImg) doc.addImage(qrImg,"PNG",107,18,40,40);
    doc.setTextColor(120,80,40); doc.setFontSize(6);
    doc.text("Présentez ce billet",127,64,{align:"center"});
    doc.text("à votre arrivée",127,69,{align:"center"});
    doc.setTextColor(204,85,0); doc.setFontSize(10); doc.setFont("helvetica","bold");
    doc.text("✦",127,83,{align:"center"});
    doc.setFontSize(6); doc.setFont("helvetica","normal"); doc.setTextColor(80,55,30);
    doc.text("Élégance Nuptiale",127,90,{align:"center"});

    doc.save(`billet_${g.fn}_${g.ln}.pdf`);
    notify(`🎫 Billet de ${fn(g)} téléchargé`);
  } catch(e){ console.error(e); notify("Erreur génération billet","err"); }
}

// ── QR Scanner ──
function toggleScan(){scanOn?stopScan():startScan()}
function startScan(){
  if(!qrScn) qrScn=new Html5Qrcode("qr-reader");
  qrScn.start({facingMode:"environment"},{fps:10,qrbox:{width:200,height:200}},onScan,()=>{}).then(()=>{
    scanOn=true; $("scanTxt").textContent="⏹ Arrêter le scanner";
  }).catch(e=>notify("Caméra inaccessible : "+e,"err"));
}
function stopScan(){
  if(qrScn&&scanOn) qrScn.stop().then(()=>{scanOn=false;$("scanTxt").textContent="▶ Démarrer le scanner";});
}
function onScan(decoded){
  try{
    let data; try{data=JSON.parse(decoded)}catch{data={id:decoded}};
    const g=guests.find(x=>x.id===data.id||x.id===decoded);
    if(!g){
      $("scanNm").textContent="Invité introuvable";
      $("scanDt").textContent="QR code non reconnu dans la liste";
      $("scanAct").innerHTML="";
      $("scanRes").style.display="block";
      notify("QR Code non reconnu","err"); return;
    }
    $("scanRes").style.display="block";
    $("scanNm").textContent=`${g.ti} ${g.fn} ${g.ln}`;
    $("scanDt").textContent=`Table N°${g.tb} · ${zlbl(g.zn)} · ${g.ar?"✓ Déjà enregistré(e)":"En attente"}`;
    $("scanAct").innerHTML=g.ar
      ?`<button class="btn btn-ghost" style="width:100%;padding:10px;margin-top:8px" onclick="toggle('${g.id}')">✕ Annuler l'arrivée</button>`
      :`<button class="btn btn-burn" style="width:100%;padding:10px;margin-top:8px" onclick="toggle('${g.id}')">✓ Confirmer l'arrivée</button>`;
    notify(g.ar?`${fn(g)} — déjà enregistré(e)`:`✓ ${fn(g)} identifié(e) — Table ${g.tb}`,g.ar?"inf":"ok");
  }catch(e){notify("Erreur lecture QR","err");}
}

// ── export CSV ──
function exportCSV(){
  const h=["ID","Civilité","Prénom","Nom","Table","Zone","Régime","Note","Arrivé","Heure"];
  const r=guests.map(g=>[g.id,g.ti,g.fn,g.ln,g.tb,g.zn,g.dt||"Standard",g.nt||"",g.ar?"OUI":"NON",g.at||""]);
  const csv=[h,...r].map(row=>row.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
  const a=document.createElement("a");
  a.href="data:text/csv;charset=utf-8,\uFEFF"+encodeURIComponent(csv);
  a.download=`invites_mariage_${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); notify("↓ Export CSV téléchargé","inf");
}

// ── print ──
function printList(){
  const sorted=[...guests].sort((a,b)=>a.ln.localeCompare(b.ln));
  const arr=guests.filter(g=>g.ar).length;
  const w=window.open("","_blank");
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Liste invités — ${COUPLE}</title>
  <style>body{font-family:Georgia,serif;max-width:820px;margin:40px auto;color:#1A0E00}h1{color:#CC5500;text-align:center;font-size:1.8rem}h2{text-align:center;font-weight:300;color:#888;margin-bottom:25px}
  .s{display:flex;gap:20px;justify-content:center;margin-bottom:25px;padding:15px;background:#FDF6EE;border:1px solid #CC5500}
  .sn{font-size:1.5rem;color:#CC5500;font-weight:bold;display:block}.sl{font-size:.7rem;color:#888;text-transform:uppercase;letter-spacing:.1em}
  table{width:100%;border-collapse:collapse;font-size:.87rem}th{font-size:.62rem;letter-spacing:.15em;text-transform:uppercase;color:#CC5500;padding:10px 8px;border-bottom:2px solid #CC5500;text-align:left}
  td{padding:9px 8px;border-bottom:1px solid #F0E8DE}tr:nth-child(even) td{background:#FDFAF5}
  .ok{color:#4A7C59;font-weight:bold}.wait{color:#999}
  @media print{button{display:none}}</style></head><body>
  <h1>${COUPLE}</h1><h2>Liste des invités — 14 Juin 2025 · ${VENUE}</h2>
  <div class="s"><div><span class="sn">${guests.length}</span><span class="sl">Total</span></div><div><span class="sn">${arr}</span><span class="sl">Arrivés</span></div><div><span class="sn">${guests.length-arr}</span><span class="sl">En attente</span></div></div>
  <table><thead><tr><th>Nom</th><th>Table</th><th>Zone</th><th>Régime</th><th>Note</th><th>Statut</th><th>Heure</th></tr></thead><tbody>
  ${sorted.map(g=>`<tr><td><strong>${g.ti} ${g.fn} ${g.ln}</strong></td><td>${g.tb}</td><td>${zlbl(g.zn).replace("✦ ","")}</td><td>${g.dt||"—"}</td><td>${g.nt||"—"}</td><td class="${g.ar?"ok":"wait"}">${g.ar?"✓ Arrivé":"En attente"}</td><td>${g.at||"—"}</td></tr>`).join("")}
  </tbody></table><p style="text-align:center;color:#CCC;font-size:.75rem;margin-top:30px">Imprimé le ${new Date().toLocaleDateString("fr-FR")} à ${ts()}</p>
  <script>window.onload=()=>window.print()<\/script></body></html>`);
  w.document.close();
  notify("🖨 Liste prête à imprimer","inf");
}

// ── nav scroll effect ──
window.addEventListener("scroll",()=>{
  document.getElementById("nav").style.borderBottomColor=
    window.scrollY>60?"rgba(204,85,0,.35)":"rgba(204,85,0,.18)";
});
