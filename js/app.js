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
  $("ePhone").value=g.phone||"";
}
async function saveEdit(){
  const id=$("eId").value, g=guests.find(x=>x.id===id); if(!g) return;
  const upd={fn:$("eFn").value.trim(),ln:$("eLn").value.trim(),tb:parseInt($("eTb").value),ti:$("eTi").value,zn:$("eZn").value,dt:$("eDt").value,nt:$("eNt").value.trim()};
  try{await DB.update(id,upd);Object.assign(g,upd);closeMod("editMod");notify(`✓ ${fn(g)} mis(e) à jour`);updateStats();renderList();renderAlpha();}
  catch(err){notify("Erreur modification","err");console.error(err);}
  phone:$("ePhone").value.trim()
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

  if(g.phone){
    // Numéro direct — international
    const phone = g.phone.replace(/[\s\-\(\)]/g,"");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,"_blank");
  } else {
    // Pas de numéro — ouvre WhatsApp sans destinataire
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");
    notify("⚠️ Pas de numéro — ajoutez le téléphone de l'invité","inf");
  }
  notify("💬 WhatsApp ouvert","wa");
}

function groupWA(){
  const msg=`Chers amis, chère famille,\n\nMerci infiniment d'avoir été présents à notre mariage. Votre amour a rendu cette nuit absolument magique. 🧡✨\n\nAvec tout notre amour,\n${COUPLE}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");
  notify("💬 Message groupé ouvert","wa");
}

// ══════════════════════════════════════
// PHOTO DES MARIÉS (base64)
// ══════════════════════════════════════
const COUPLE_PHOTO = "data:image/jpeg;base64,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";

// ══════════════════════════════════════
// GÉNÉRATION BILLET PDF LUXUEUX
// ══════════════════════════════════════
async function genPDF(id){
  const g=guests.find(x=>x.id===id); if(!g) return;
  notify("Génération du billet...","inf");
  try{
    // Générer QR Code
    const qrDiv=document.createElement("div");
    qrDiv.style.cssText="position:absolute;left:-9999px;top:-9999px;width:150px;height:150px;background:white;padding:5px";
    document.body.appendChild(qrDiv);
    new QRCode(qrDiv,{
      text:`https://mariage-beugueum-8494s-projects.vercel.app?inv=${g.id}`,
      width:140,height:140,
      colorDark:"#1A0E00",colorLight:"#FFFFFF",
      correctLevel:QRCode.CorrectLevel.H
    });
    await new Promise(r=>setTimeout(r,500));
    const qrCanvas=qrDiv.querySelector("canvas");
    const qrImg=qrCanvas?qrCanvas.toDataURL("image/png"):null;
    document.body.removeChild(qrDiv);

    // Setup PDF — format A5 portrait
    const {jsPDF}=window.jspdf;
    const doc=new jsPDF({orientation:"portrait",unit:"mm",format:[148,210]});
    const W=148, H=210;

    // ── FOND PRINCIPAL ──
    // Fond crème ivoire
    doc.setFillColor(253,246,238);
    doc.rect(0,0,W,H,"F");

    // Bordure extérieure dorée
    doc.setDrawColor(204,85,0);
    doc.setLineWidth(3);
    doc.rect(4,4,W-8,H-8,"S");

    // Bordure intérieure fine
    doc.setDrawColor(212,130,10);
    doc.setLineWidth(0.5);
    doc.rect(7,7,W-14,H-14,"S");

    // ── FOND TEXTURÉ HAUT ──
    doc.setFillColor(26,14,0);
    doc.rect(0,0,W,62,"F");

    // Overlay dégradé
    doc.setFillColor(204,85,0);
    doc.setGState(new doc.GState({opacity:0.15}));
    doc.rect(0,0,W,62,"F");
    doc.setGState(new doc.GState({opacity:1}));

    // ── ORNEMENTS COINS HAUT ──
    doc.setTextColor(204,85,0);
    doc.setFontSize(18);
    doc.text("✦",8,14);
    doc.text("✦",W-8,14,{align:"right"});

    // ── PHOTO MARIÉS EN OVALE ──
    // Fond blanc ovale
    doc.setFillColor(255,255,255);
    doc.setDrawColor(204,85,0);
    doc.setLineWidth(2);
    // Simuler ovale avec ellipse
    doc.ellipse(W/2, 36, 30, 28, "FD");

    // Photo dans ovale
    if(COUPLE_PHOTO){
      try{
        doc.addImage(COUPLE_PHOTO,"JPEG", W/2-27, 10, 54, 52, undefined, "FAST");
        // Re-dessiner bordure ovale par-dessus
        doc.setFillColor(0,0,0,0);
        doc.setDrawColor(204,85,0);
        doc.setLineWidth(2.5);
        doc.ellipse(W/2, 36, 30, 28, "S");
        // Anneau doré
        doc.setDrawColor(212,130,10);
        doc.setLineWidth(0.8);
        doc.ellipse(W/2, 36, 31.5, 29.5, "S");
      }catch(e){}
    }

    // ── NOMS DES MARIÉS ──
    doc.setTextColor(255,255,255);
    doc.setFontSize(22);
    doc.setFont("helvetica","bolditalic");
    doc.text("Vanina & Yvan",W/2,72,{align:"center"});

    // Ligne décorative sous les noms
    doc.setDrawColor(204,85,0);
    doc.setLineWidth(0.8);
    doc.line(W/2-35,76,W/2+35,76);
    doc.setDrawColor(212,130,10);
    doc.setLineWidth(0.3);
    doc.line(W/2-38,77.5,W/2+38,77.5);

    // ── TEXTE INVITATION ──
    doc.setTextColor(26,14,0);
    doc.setFontSize(7.5);
    doc.setFont("helvetica","italic");
    const invText = "Deux histoires, un seul chemin...";
    doc.text(invText,W/2,85,{align:"center"});

    doc.setFontSize(6.5);
    doc.setFont("helvetica","normal");
    doc.setTextColor(90,55,20);
    const lines = doc.splitTextToSize(
      "C'est avec un immense bonheur que nous vous invitons à être témoins de notre promesse de mariage",
      W-30
    );
    doc.text(lines,W/2,92,{align:"center"});

    // ── SÉPARATEUR ──
    doc.setTextColor(204,85,0);
    doc.setFontSize(10);
    doc.text("◆  ◆  ◆",W/2,103,{align:"center"});

    // ── DATE & HEURE ──
    // Boîte date
    doc.setFillColor(26,14,0);
    doc.roundRect(W/2-25,107,50,22,3,"F");
    doc.setDrawColor(204,85,0);
    doc.setLineWidth(0.8);
    doc.roundRect(W/2-25,107,50,22,3,"S");

    doc.setTextColor(204,85,0);
    doc.setFontSize(7);
    doc.setFont("helvetica","normal");
    doc.text("SAMEDI",W/2,114,{align:"center"});
    doc.setFontSize(16);
    doc.setFont("helvetica","bold");
    doc.setTextColor(232,114,42);
    doc.text("27",W/2,123,{align:"center"});

    doc.setFontSize(7);
    doc.setFont("helvetica","normal");
    doc.setTextColor(184,115,51);
    doc.text("JUIN 2026",W/2-35,117,{align:"left"});
    doc.text("17H00",W/2+35,117,{align:"right"});

    // ── LIEU ──
    doc.setTextColor(26,14,0);
    doc.setFontSize(7);
    doc.setFont("helvetica","bold");
    doc.text("LIEU DE LA CÉRÉMONIE",W/2,135,{align:"center"});

    doc.setFontSize(8);
    doc.setFont("helvetica","normal");
    doc.setTextColor(90,55,20);
    doc.text("Nyom Messassi, 600 Lots · Yaoundé",W/2,142,{align:"center"});
    doc.text("Cameroun",W/2,148,{align:"center"});

    // ── SÉPARATEUR ──
    doc.setDrawColor(204,85,0);
    doc.setLineWidth(0.4);
    doc.setLineDashPattern([2,3],0);
    doc.line(15,153,W-15,153);
    doc.setLineDashPattern([],0);

    // ── SECTION INVITÉ ──
    doc.setTextColor(204,85,0);
    doc.setFontSize(6.5);
    doc.setFont("helvetica","normal");
    doc.text("INVITÉ(E) D'HONNEUR",W/2,160,{align:"center"});

    doc.setTextColor(26,14,0);
    doc.setFontSize(13);
    doc.setFont("helvetica","bold");
    doc.text(`${g.ti} ${g.fn} ${g.ln}`,W/2,168,{align:"center"});

    // Table & Zone
    doc.setFillColor(204,85,0);
    doc.roundRect(W/2-30,171,60,12,2,"F");
    doc.setTextColor(255,255,255);
    doc.setFontSize(7);
    doc.setFont("helvetica","bold");
    doc.text(`TABLE N° ${g.tb}  ·  ${zlbl(g.zn).replace("✦ ","")}`,W/2,179,{align:"center"});

    // Diet si présent
    if(g.dt){
      doc.setTextColor(140,95,55);
      doc.setFontSize(6);
      doc.setFont("helvetica","italic");
      doc.text(`Menu : ${g.dt.replace(/[\u{1F000}-\u{FFFF}]/gu,"").trim()}`,W/2,186,{align:"center"});
    }

    // ── QR CODE ──
    if(qrImg){
      // Fond blanc QR
      doc.setFillColor(255,255,255);
      doc.setDrawColor(204,85,0);
      doc.setLineWidth(0.8);
      doc.roundRect(W/2-12,188,24,16,1,"FD");
      doc.addImage(qrImg,"PNG",W/2-11,189,22,14);
    }

    // ID invité
    doc.setTextColor(200,160,120);
    doc.setFontSize(5);
    doc.setFont("helvetica","normal");
    doc.text(g.id,W/2,205,{align:"center"});

    // ── ORNEMENTS BAS ──
    doc.setFillColor(26,14,0);
    doc.rect(0,H-10,W,10,"F");
    doc.setTextColor(204,85,0);
    doc.setFontSize(6);
    doc.text("✦  Billet nominatif non transférable  ✦",W/2,H-4,{align:"center"});

    // Sauvegarder
    doc.save(`invitation_${g.fn}_${g.ln}.pdf`);
    notify(`🎫 Invitation de ${fn(g)} générée !`);

  }catch(err){
    console.error(err);
    notify("Erreur génération billet","err");
  }
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