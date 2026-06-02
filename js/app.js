// ================================================
//  MARIAGE — Vanina & Yvan
//  app.js — Connecté à Supabase
// ================================================
const SUPABASE_URL = "https://psxpjuvbdctmsfuudjbe.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzeHBqdXZiZGN0bXNmdXVkamJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NTQ5NDAsImV4cCI6MjA5NTIzMDk0MH0.U5m-XQAFlYvGnc6DMUwhrsT8N7QeAj0GbylAfz_IMi8";

// Client Supabase léger (sans librairie externe)
const DB = {
  async select() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/guests?order=ln.asc,fn.asc`, { headers: hdrs() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async insert(g) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/guests`, {
      method: "POST", headers: { ...hdrs(), "Prefer": "return=representation" }, body: JSON.stringify(g)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async update(id, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/guests?id=eq.${id}`, {
      method: "PATCH", headers: { ...hdrs(), "Prefer": "return=representation" }, body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async delete(id) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/guests?id=eq.${id}`, { method: "DELETE", headers: hdrs() });
    if (!res.ok) throw new Error(await res.text());
  }
};

function hdrs() {
  return { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };
}

// CONFIG
const ADMIN_PWD = "mariage2025";
const COUPLE    = "Vanina & Yvan";
const VENUE     = "Nyom Messassi au lieux dit 600 Lots · Yaoundé";
const WDATE     = new Date("2026-06-27T17:00:00");

// STATE
let guests  = [], curF = "all", curA = "all";
let scanOn  = false, qrScn = null, arrLog = [], nextNum = 1;

// UTILS
const $   = id => document.getElementById(id);
const fn  = g  => `${g.fn} ${g.ln}`;
const ts  = () => new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
function notify(msg, type="ok") {
  const n=$("notif"); n.textContent=msg; n.className=`notif n-${type} show`;
  clearTimeout(n._t); n._t=setTimeout(()=>n.classList.remove("show"),3800);
}
function openMod(id){$(id).classList.add("open")} 
function closeMod(id){$(id).classList.remove("open")}
function zlbl(z){return{vip:"✦ VIP",famille:"Famille",amis:"Amis",collegues:"Collègues"}[z]||z}
function zcls(z){return{vip:"z-vip",famille:"z-famille",amis:"z-amis",collegues:"z-collegues"}[z]||"z-amis"}

// CHARGEMENT DEPUIS SUPABASE
async function loadGuests() {
  try {
    showLoading(true);
    guests = await DB.select();
    if (guests.length === 0) { await seedGuests(); guests = await DB.select(); }
    nextNum = guests.length + 1;
    updateStats(); renderList(); renderAlpha();
    showLoading(false);
  } catch(err) { console.error(err); notify("Erreur de connexion à Supabase","err"); showLoading(false); }
}

function showLoading(show) {
  const el=$("loadingIndicator"); if(el) el.style.display=show?"flex":"none";
}

// SEED — invités par défaut si BDD vide
async function seedGuests() {
  const list = [
    {id:"INV-001",ti:"M.",fn:"Jean",ln:"Martin",tb:1,zn:"vip",dt:"",nt:"Père du marié",ar:false,at:null},
    {id:"INV-002",ti:"Mme",fn:"Claire",ln:"Martin",tb:1,zn:"vip",dt:"🥗 Végétarien",nt:"Mère du marié",ar:false,at:null},
    {id:"INV-003",ti:"M.",fn:"Pierre",ln:"Dubois",tb:1,zn:"famille",dt:"",nt:"Oncle de la mariée",ar:false,at:null},
    {id:"INV-004",ti:"Mme",fn:"Isabelle",ln:"Dubois",tb:1,zn:"famille",dt:"🚫 Sans gluten",nt:"",ar:false,at:null},
    {id:"INV-005",ti:"M.",fn:"Thomas",ln:"Bernard",tb:2,zn:"amis",dt:"",nt:"Meilleur ami du marié",ar:false,at:null},
    {id:"INV-006",ti:"Mme",fn:"Sophie",ln:"Bernard",tb:2,zn:"amis",dt:"🌱 Végane",nt:"",ar:false,at:null},
    {id:"INV-007",ti:"M.",fn:"Nicolas",ln:"Petit",tb:2,zn:"amis",dt:"🕌 Halal",nt:"Témoin",ar:false,at:null},
  {id:"INV-008",ti:"Mme",fn:"Lucie",ln:"Moreau",tb:2,zn:"amis",dt:"",nt:"",ar:false,at:null},
    {id:"INV-009",ti:"Dr",fn:"Henri",ln:"Leroy",tb:3,zn:"vip",dt:"",nt:"Parrain",ar:false,at:null},
    {id:"INV-010",ti:"Mme",fn:"Marie",ln:"Leroy",tb:3,zn:"vip",dt:"Vegetarien",nt:"",ar:false,at:null},
  ];
  for(const g of list){ try{ await DB.insert(g); }catch(e){} }
}

function tick() {
  const d=WDATE-new Date(); if(d<=0) return;
  if($("cdJ")) $("cdJ").textContent=String(Math.floor(d/86400000)).padStart(2,"0");
  if($("cdH")) $("cdH").textContent=String(Math.floor((d%86400000)/3600000)).padStart(2,"0");
  if($("cdM")) $("cdM").textContent=String(Math.floor((d%3600000)/60000)).padStart(2,"0");
  if($("cdS")) $("cdS").textContent=String(Math.floor((d%60000)/1000)).padStart(2,"0");
}
setInterval(tick,1000); tick();

(function(){
  const c=$("embers"); if(!c) return;
  for(let i=0;i<18;i++){
    const e=document.createElement("div"); e.className="ember";
    const s=Math.random()*6+2;
    e.style.cssText=`width:${s}px;height:${s}px;left:${Math.random()*100}%;animation-duration:${Math.random()*8+6}s;animation-delay:${Math.random()*6}s`;
    c.appendChild(e);
  }
})();

function openPwd(){$("pwdOverlay").classList.add("open");setTimeout(()=>$("pwdIn").focus(),100)}
function closePwd(){$("pwdOverlay").classList.remove("open");$("pwdIn").value=""}
function chkPwd(){
  if($("pwdIn").value===ADMIN_PWD){closePwd();openAdmin();}
  else{$("pwdIn").style.borderColor="#8B2020";$("pwdIn").value="";setTimeout(()=>$("pwdIn").style.borderColor="",1400);notify("Mot de passe incorrect","err");}
}
function openAdmin(){$("admin").classList.add("open");$("nav").style.display="none";window.scrollTo(0,0);loadGuests();$("photoZone").classList.add("visible");}
function closeAdmin(){if(scanOn)stopScan();$("admin").classList.remove("open");$("nav").style.display="flex";$("photoZone").classList.remove("visible");}

function updateStats(){
  const tot=guests.length, arr=guests.filter(g=>g.ar).length;
  const pen=tot-arr, vip=guests.filter(g=>g.zn==="vip").length;
  const pct=tot?Math.round(arr/tot*100):0;
  $("sT").textContent=tot;$("sA").textContent=arr;$("sP").textContent=pen;
  $("sPct").textContent=pct+"%";$("sV").textContent=vip;
  $("progF").style.width=pct+"%";
  $("progL").textContent=`${pen} invité${pen>1?"s":""} en attente`;
  $("progR").textContent=`${arr} / ${tot} présents`;
}

function renderAlpha(){
  const used=new Set(guests.map(g=>g.ln[0].toUpperCase()));
  $("alphaIdx").innerHTML=`<button class="alpha-btn active" onclick="setA('all',this)">Tous</button>`+
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(l=>`<button class="alpha-btn ${used.has(l)?"":"disabled"}" onclick="setA('${l}',this)">${l}</button>`).join("");
}
function setA(l,btn){curA=l;document.querySelectorAll(".alpha-btn").forEach(b=>b.classList.remove("active"));btn.classList.add("active");renderList();}
function setF(f,btn){curF=f;document.querySelectorAll(".ftab").forEach(b=>b.classList.remove("active"));btn.classList.add("active");renderList();}

function renderList(){
  const q=$("srch").value.toLowerCase();
  let list=[...guests];
  if(curF==="arrived") list=list.filter(g=>g.ar);
  if(curF==="pending") list=list.filter(g=>!g.ar);
  if(curF==="vip")     list=list.filter(g=>g.zn==="vip");
  if(q) list=list.filter(g=>fn(g).toLowerCase().includes(q)||String(g.tb).includes(q)||g.zn.includes(q)||g.id.toLowerCase().includes(q));
  if(curA!=="all") list=list.filter(g=>g.ln[0].toUpperCase()===curA);
  list.sort((a,b)=>a.ln.localeCompare(b.ln)||a.fn.localeCompare(b.fn));
  if(!list.length){$("gList").innerHTML=`<div class="no-res">Aucun invité trouvé</div>`;return;}
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
  return `<div class="gc ${cls}" id="gc-${g.id}">
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
      ${g.ar?`<button class="abt ab-un" onclick="toggleArrival('${g.id}')">✕ Annuler</button>`
            :`<button class="abt ab-in" onclick="toggleArrival('${g.id}')">✓ Arrivé(e)</button>`}
      <button class="abt ab-wa"  onclick="sendWA('${g.id}')">💬 WhatsApp</button>
      <button class="abt ab-pdf" onclick="genPDF('${g.id}')">🎫 Billet PDF</button>
      <button class="abt ab-ed"  onclick="openEdit('${g.id}')">✎ Éditer</button>
      <button class="abt ab-del" onclick="delGuest('${g.id}')">✕ Suppr.</button>
    </div>
  </div>`;
}

async function toggleArrival(id){
  const g=guests.find(x=>x.id===id); if(!g) return;
  const newAr=!g.ar, newAt=newAr?ts():null;
  try{
    await DB.update(id,{ar:newAr,at:newAt}); g.ar=newAr; g.at=newAt;
    if(g.ar){arrLog.unshift(`${g.at} — ${g.ti} ${fn(g)} · Table ${g.tb}`);updateArrLog();notify(`✓ ${g.ti} ${fn(g)} — Arrivée à ${g.at}`);}
    else notify(`${fn(g)} — Arrivée annulée`,"err");
    updateStats(); renderList();
  }catch(err){notify("Erreur mise à jour","err");console.error(err);}
}

function updateArrLog(){
  $("arrLog").innerHTML=arrLog.length
    ?arrLog.map(e=>`<div style="padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04)">${e}</div>`).join("")
    :`<p style="font-style:italic">Aucune arrivée enregistrée</p>`;
}

async function addGuest(){
  const f=$("nFn").value.trim(),l=$("nLn").value.trim(),t=parseInt($("nTb").value);
  if(!f||!l||!t){notify("Remplissez prénom, nom et table","err");return;}
  const newId=`INV-${String(nextNum++).padStart(3,"0")}`;
  const newG={id:newId,ti:$("nTi").value,fn:f,ln:l,tb:t,zn:$("nZn").value,dt:$("nDt").value,nt:$("nNt").value.trim(),ar:false,at:null};
  try{
    await DB.insert(newG); guests.push(newG);
    notify(`✓ ${$("nTi").value} ${f} ${l} ajouté(e) — Table ${t}`);
    ["nFn","nLn","nTb","nNt"].forEach(id=>$(id).value="");
    updateStats(); renderList(); renderAlpha();
  }catch(err){notify("Erreur ajout","err");console.error(err);}
}

function openEdit(id){
  const g=guests.find(x=>x.id===id); if(!g) return;
  $("eId").value=id;$("eFn").value=g.fn;$("eLn").value=g.ln;
  $("eTb").value=g.tb;$("eTi").value=g.ti;$("eZn").value=g.zn;$("eDt").value=g.dt;$("eNt").value=g.nt;
  openMod("editMod");
}
async function saveEdit(){
  const id=$("eId").value, g=guests.find(x=>x.id===id); if(!g) return;
  const upd={fn:$("eFn").value.trim(),ln:$("eLn").value.trim(),tb:parseInt($("eTb").value),ti:$("eTi").value,zn:$("eZn").value,dt:$("eDt").value,nt:$("eNt").value.trim()};
  try{await DB.update(id,upd);Object.assign(g,upd);closeMod("editMod");notify(`✓ ${fn(g)} mis(e) à jour`);updateStats();renderList();renderAlpha();}
  catch(err){notify("Erreur modification","err");console.error(err);}
}

async function delGuest(id){
  const g=guests.find(x=>x.id===id); if(!g||!confirm(`Supprimer ${fn(g)} ?`)) return;
  try{await DB.delete(id);guests=guests.filter(x=>x.id!==id);notify(`${fn(g)} supprimé(e)`,"err");updateStats();renderList();renderAlpha();}
  catch(err){notify("Erreur suppression","err");console.error(err);}
}

function sendWA(id){
  const g=guests.find(x=>x.id===id); if(!g) return;
  const msg=g.ar
    ?`Cher(e) ${g.ti} ${fn(g)},\n\nNous tenions à vous remercier chaleureusement d'avoir partagé ce moment si précieux avec nous. Votre présence a rendu cette soirée inoubliable. 🧡\n\nAvec tout notre amour,\n${COUPLE}`
    :`Bonjour ${g.ti} ${fn(g)} ! 🧡\n\nNous vous attendons avec impatience ce soir.\n\n📍 ${VENUE}\n🪑 Table N° ${g.tb} — Zone ${zlbl(g.zn)}\n⏰ Accueil dès 16h30\n\n${COUPLE}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");
  notify("💬 WhatsApp ouvert","wa");
}

function groupWA(){
  const msg=`Chers amis, chère famille,\n\nMerci infiniment d'avoir été présents à notre mariage. Votre amour a rendu cette nuit absolument magique. 🧡✨\n\nAvec tout notre amour,\n${COUPLE}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");
  notify("💬 Message groupé ouvert","wa");
}

async function genPDF(id){
  const g=guests.find(x=>x.id===id); if(!g) return;
  notify("Génération du billet...","inf");
  try{
    const qrDiv=document.createElement("div");
    qrDiv.style.cssText="position:absolute;left:-9999px;top:-9999px;width:128px;height:128px";
    document.body.appendChild(qrDiv);
new QRCode(qrDiv,{text:`https://mariage-beugueum-8494s-projects.vercel.app?inv=${g.id}`,width:128,height:128,colorDark:"#1A0E00",colorLight:"#FDF6EE",correctLevel:QRCode.CorrectLevel.H});
await new Promise
    const qrImg=qrDiv.querySelector("canvas")?.toDataURL();
    document.body.removeChild(qrDiv);
    const {jsPDF}=window.jspdf;
    const doc=new jsPDF({orientation:"landscape",unit:"mm",format:[148,105]});
    doc.setFillColor(26,14,0);doc.rect(0,0,148,105,"F");
    doc.setFillColor(204,85,0);doc.rect(0,0,148,3,"F");doc.rect(0,102,148,3,"F");doc.rect(0,3,3,99,"F");
    doc.setTextColor(204,85,0);doc.setFontSize(7);doc.setFont("helvetica","normal");doc.text("INVITATION · MARIAGE PRIVE",14,14);
    doc.setTextColor(255,255,255);doc.setFontSize(16);doc.setFont("helvetica","bold");doc.text(COUPLE,14,26);
    doc.setTextColor(184,115,51);doc.setFontSize(7.5);doc.setFont("helvetica","normal");doc.text("27 Juin 2026  ·  Nyom Messassi  ·  Yaounde",14,34);
    doc.setDrawColor(204,85,0);doc.setLineWidth(0.4);doc.line(14,39,98,39);
    doc.setTextColor(155,116,86);doc.setFontSize(6.5);doc.text("INVITE(E)",14,47);
    doc.setTextColor(255,255,255);doc.setFontSize(13);doc.setFont("helvetica","bold");doc.text(`${g.ti} ${g.fn} ${g.ln}`,14,56);
    doc.setTextColor(204,85,0);doc.setFontSize(6.5);doc.setFont("helvetica","normal");doc.text("VOTRE TABLE",14,67);
    doc.setFontSize(28);doc.setFont("helvetica","bold");doc.setTextColor(232,114,42);doc.text(`N deg ${g.tb}`,14,82);
    doc.setFontSize(8);doc.setFont("helvetica","normal");doc.setTextColor(184,115,51);doc.text(`Zone : ${zlbl(g.zn).replace("✦ ","")}`,14,90);
    if(g.dt){doc.setTextColor(140,95,55);doc.setFontSize(7);doc.text(`Menu : ${g.dt}`,14,97);}
    doc.setTextColor(50,30,10);doc.setFontSize(5.5);doc.text(g.id,14,101);
    doc.setDrawColor(204,85,0);doc.setLineWidth(0.4);doc.setLineDashPattern([2,2],0);doc.line(107,8,107,97);doc.setLineDashPattern([],0);
    const rx=107+(148-107)/2;
    doc.setTextColor(204,85,0);doc.setFontSize(6.5);doc.setFont("helvetica","normal");doc.text("SCANNER A L ENTREE",rx,15,{align:"center"});
    if(qrImg) doc.addImage(qrImg,"PNG",rx-20,20,40,40);
    doc.setTextColor(120,80,40);doc.setFontSize(6);doc.text("Presentez ce billet a votre arrivee",rx,66,{align:"center"});
    doc.setTextColor(80,55,30);doc.text("Billet nominatif non transferable",rx,100,{align:"center"});
    doc.save(`billet_${g.fn}_${g.ln}.pdf`);
    notify(`Billet de ${fn(g)} telecharge`);
  }catch(err){console.error(err);notify("Erreur generation billet","err");}
}

function toggleScan(){scanOn?stopScan():startScan()}
function startScan(){
  if(!qrScn) qrScn=new Html5Qrcode("qr-reader");
  qrScn.start({facingMode:"environment"},{fps:10,qrbox:{width:200,height:200}},onScan,()=>{})
    .then(()=>{scanOn=true;$("scanTxt").textContent="Arreter le scanner";})
    .catch(e=>notify("Camera inaccessible : "+e,"err"));
}
function stopScan(){if(qrScn&&scanOn)qrScn.stop().then(()=>{scanOn=false;$("scanTxt").textContent="Demarrer le scanner";})}
function onScan(decoded){
  try{
    let data; try{data=JSON.parse(decoded);}catch{data={id:decoded};}
    const g=guests.find(x=>x.id===data.id||x.id===decoded);
    if(!g){$("scanNm").textContent="Invite introuvable";$("scanDt").textContent="QR non reconnu";$("scanAct").innerHTML="";$("scanRes").style.display="block";notify("QR non reconnu","err");return;}
    $("scanRes").style.display="block";
    $("scanNm").textContent=`${g.ti} ${g.fn} ${g.ln}`;
    $("scanDt").textContent=`Table N°${g.tb} · ${zlbl(g.zn)} · ${g.ar?"Deja enregistre":"En attente"}`;
    $("scanAct").innerHTML=g.ar
      ?`<button class="btn btn-ghost" style="width:100%;padding:10px;margin-top:8px" onclick="toggleArrival('${g.id}')">Annuler</button>`
      :`<button class="btn btn-burn" style="width:100%;padding:10px;margin-top:8px" onclick="toggleArrival('${g.id}')">Confirmer l arrivee</button>`;
    notify(g.ar?`${fn(g)} — deja enregistre`:`${fn(g)} — Table ${g.tb}`,g.ar?"inf":"ok");
  }catch(e){notify("Erreur lecture QR","err");}
}

function exportCSV(){
  const h=["ID","Civilite","Prenom","Nom","Table","Zone","Regime","Note","Arrive","Heure"];
  const r=guests.map(g=>[g.id,g.ti,g.fn,g.ln,g.tb,g.zn,g.dt||"Standard",g.nt||"",g.ar?"OUI":"NON",g.at||""]);
  const csv=[h,...r].map(row=>row.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
  const a=document.createElement("a");
  a.href="data:text/csv;charset=utf-8,\uFEFF"+encodeURIComponent(csv);
  a.download=`invites_mariage_${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); notify("CSV telecharge","inf");
}

function printList(){
  const sorted=[...guests].sort((a,b)=>a.ln.localeCompare(b.ln));
  const arr=guests.filter(g=>g.ar).length;
  const w=window.open("","_blank");
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Liste — ${COUPLE}</title>
  <style>body{font-family:Georgia,serif;max-width:820px;margin:40px auto;color:#1A0E00}h1{color:#CC5500;text-align:center}
  table{width:100%;border-collapse:collapse;font-size:.87rem}th{color:#CC5500;padding:10px 8px;border-bottom:2px solid #CC5500;text-align:left}
  td{padding:9px 8px;border-bottom:1px solid #F0E8DE}.ok{color:#4A7C59;font-weight:bold}.wait{color:#999}
  @media print{button{display:none}}</style></head><body>
  <h1>${COUPLE}</h1>
  <table><thead><tr><th>Nom</th><th>Table</th><th>Zone</th><th>Statut</th><th>Heure</th></tr></thead><tbody>
  ${sorted.map(g=>`<tr><td><strong>${g.ti} ${g.fn} ${g.ln}</strong></td><td>${g.tb}</td><td>${zlbl(g.zn).replace("✦ ","")}</td><td class="${g.ar?"ok":"wait"}">${g.ar?"Arrive":"En attente"}</td><td>${g.at||"—"}</td></tr>`).join("")}
  </tbody></table><script>window.onload=()=>window.print()<\/script></body></html>`);
  w.document.close(); notify("Impression lancee","inf");
}

function dragOver(e){e.preventDefault();$("photoDrop").classList.add("drag")}
function dragLeave(e){$("photoDrop").classList.remove("drag")}
function dropPhoto(e){e.preventDefault();$("photoDrop").classList.remove("drag");const f=e.dataTransfer.files[0];if(f&&f.type.startsWith("image/"))loadPhoto(f);}
function loadPhoto(file){
  if(!file) return;
  const r=new FileReader();
  r.onload=function(e){
    const url=e.target.result;
    const bg=$("heroBg"); bg.style.backgroundImage=`url('${url}')`;bg.classList.add("loaded");
    $("heroOverlay").style.display="block";$("heroTexture").style.opacity="0.3";$("heroGrid").style.opacity="0.3";
    $("photoPreview").src=url;$("photoPreview").style.display="block";$("photoRemove").style.display="block";
    document.querySelector(".photo-drop-icon").style.display="none";
    notify("Photo ajoutee !");
  };
  r.readAsDataURL(file);
}
function removePhoto(e){
  e.stopPropagation();
  const bg=$("heroBg");bg.style.backgroundImage="";bg.classList.remove("loaded");
  $("heroOverlay").style.display="none";$("heroTexture").style.opacity="1";$("heroGrid").style.opacity="1";
  $("photoPreview").style.display="none";$("photoPreview").src="";$("photoRemove").style.display="none";
  document.querySelector(".photo-drop-icon").style.display="block";$("photoInput").value="";
  notify("Photo retiree","inf");
}

window.addEventListener("scroll",()=>{
  const nav=$("nav");
  if(nav) nav.style.borderBottomColor=window.scrollY>60?"rgba(204,85,0,.35)":"rgba(204,85,0,.18)";
});

document.addEventListener("DOMContentLoaded",function(){
  const d=document.createElement("div");
  d.id="loadingIndicator";
  d.style.cssText="display:none;position:fixed;inset:0;background:rgba(10,5,0,.85);z-index:9999;align-items:center;justify-content:center;flex-direction:column;gap:15px";
  d.innerHTML=`<div style="width:40px;height:40px;border:3px solid rgba(204,85,0,.3);border-top-color:#CC5500;border-radius:50%;animation:spin 1s linear infinite"></div><div style="font-family:'Cinzel',serif;font-size:.7rem;letter-spacing:.2em;color:rgba(255,255,255,.5)">CHARGEMENT...</div><style>@keyframes spin{to{transform:rotate(360deg)}}</style>`;
  document.body.appendChild(d);
});