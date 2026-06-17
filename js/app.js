// ================================================
//  MARIAGE — Vanina & Yvan
//  app.js — Version complète avec Supabase
// ================================================

// ── SUPABASE CONFIG ──
const SUPABASE_URL = "https://psxpjuvbdctmsfuudjbe.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzeHBqdXZiZGN0bXNmdXVkamJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NTQ5NDAsImV4cCI6MjA5NTIzMDk0MH0.U5m-XQAFlYvGnc6DMUwhrsT8N7QeAj0GbylAfz_IMi8";
const SITE_URL    = "https://mariage-beugueum-8494s-projects.vercel.app";

// ── PHOTO MARIÉS (base64) ──
const COUPLE_PHOTO = "/images/couple.jpg";
// ── CLIENT SUPABASE ──
const DB = {
  async select() {
    const res = await fetch(SUPABASE_URL+"/rest/v1/guests?order=ln.asc,fn.asc", { headers: hdrs() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async insert(g) {
    const res = await fetch(SUPABASE_URL+"/rest/v1/guests", {
      method:"POST", headers:{...hdrs(),"Prefer":"return=representation"}, body:JSON.stringify(g)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async update(id, data) {
    const res = await fetch(SUPABASE_URL+"/rest/v1/guests?id=eq."+id, {
      method:"PATCH", headers:{...hdrs(),"Prefer":"return=representation"}, body:JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async delete(id) {
    const res = await fetch(SUPABASE_URL+"/rest/v1/guests?id=eq."+id, {
      method:"DELETE", headers:hdrs()
    });
    if (!res.ok) throw new Error(await res.text());
  }
};

function hdrs() {
  return {
    "apikey": SUPABASE_KEY,
    "Authorization": "Bearer "+SUPABASE_KEY,
    "Content-Type": "application/json"
  };
}

// ── CONFIG MARIAGE ──
const ADMIN_PWD = "mariage2025";
const COUPLE    = "Vanina & Yvan";
const VENUE     = "Nyom Messassi au lieux dit 600 Lots, Yaoundé";
const WDATE     = new Date("2026-06-27T17:00:00");

// ── STATE ──
let guests  = [];
let curF    = "all";
let curA    = "all";
let scanOn  = false;
let qrScn   = null;
let arrLog  = [];
let nextNum = 1;

// ── UTILS ──
const $   = id => document.getElementById(id);
const fn  = g  => g.fn+" "+g.ln;
const ts  = () => new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});

function notify(msg, type) {
  type = type || "ok";
  const n = $("notif");
  n.textContent = msg;
  n.className = "notif " + type + " show"; // ← sans le "n-"
  clearTimeout(n._t);
  n._t = setTimeout(function(){ n.classList.remove("show"); }, 3800);
}

function openMod(id)  { $(id).classList.add("open"); }
function closeMod(id) { $(id).classList.remove("open"); }

function zlbl(z) {
  var m = {vip:"VIP",famille:"Famille",amis:"Amis",collegues:"Collegues"};
  return m[z] || z;
}
function zcls(z) {
  var m = {vip:"z-vip",famille:"z-famille",amis:"z-amis",collegues:"z-collegues"};
  return m[z] || "z-amis";
}

// ── CHARGEMENT SUPABASE ──
async function loadGuests() {
  try {
    showLoading(true);
    guests = await DB.select();
    if (guests.length === 0) {
      await seedGuests();
      guests = await DB.select();
    }
    nextNum = guests.length + 1;
    updateStats();
    renderList();
    renderAlpha();
    showLoading(false);
  } catch(err) {
    console.error(err);
    notify("Erreur connexion Supabase","err");
    showLoading(false);
  }
}

function showLoading(show) {
  var el = $("loadingIndicator");
  if (el) el.style.display = show ? "flex" : "none";
}

// ── SEED DONNÉES PAR DÉFAUT ──
async function seedGuests() {
  var list = [
    {id:"INV-001",ti:"M.",fn:"Jean",ln:"Martin",tb:1,zn:"vip",dt:"",nt:"Pere du marie",phone:"",ar:false,at:null},
    {id:"INV-002",ti:"Mme",fn:"Claire",ln:"Martin",tb:1,zn:"vip",dt:"Vegetarien",nt:"Mere du marie",phone:"",ar:false,at:null},
    {id:"INV-003",ti:"M.",fn:"Pierre",ln:"Dubois",tb:1,zn:"famille",dt:"",nt:"Oncle de la mariee",phone:"",ar:false,at:null},
    {id:"INV-004",ti:"Mme",fn:"Isabelle",ln:"Dubois",tb:1,zn:"famille",dt:"Sans gluten",nt:"",phone:"",ar:false,at:null},
    {id:"INV-005",ti:"M.",fn:"Thomas",ln:"Bernard",tb:2,zn:"amis",dt:"",nt:"Meilleur ami du marie",phone:"",ar:false,at:null},
    {id:"INV-006",ti:"Mme",fn:"Sophie",ln:"Bernard",tb:2,zn:"amis",dt:"Vegane",nt:"",phone:"",ar:false,at:null},
    {id:"INV-007",ti:"M.",fn:"Nicolas",ln:"Petit",tb:2,zn:"amis",dt:"Halal",nt:"Temoin",phone:"",ar:false,at:null},
    {id:"INV-008",ti:"Mme",fn:"Lucie",ln:"Moreau",tb:2,zn:"amis",dt:"",nt:"",phone:"",ar:false,at:null},
    {id:"INV-009",ti:"Dr",fn:"Henri",ln:"Leroy",tb:3,zn:"vip",dt:"",nt:"Parrain du marie",phone:"",ar:false,at:null},
    {id:"INV-010",ti:"Mme",fn:"Marie",ln:"Leroy",tb:3,zn:"vip",dt:"Vegetarien",nt:"",phone:"",ar:false,at:null}
  ];
  for (var i=0; i<list.length; i++) {
    try { await DB.insert(list[i]); } catch(e) {}
  }
}

// ── COUNTDOWN ──
function tick() {
  var d = WDATE - new Date();
  if (d <= 0) return;
  if ($("cdJ")) $("cdJ").textContent = String(Math.floor(d/86400000)).padStart(2,"0");
  if ($("cdH")) $("cdH").textContent = String(Math.floor((d%86400000)/3600000)).padStart(2,"0");
  if ($("cdM")) $("cdM").textContent = String(Math.floor((d%3600000)/60000)).padStart(2,"0");
  if ($("cdS")) $("cdS").textContent = String(Math.floor((d%60000)/1000)).padStart(2,"0");
}
setInterval(tick, 1000);
tick();

// ── EMBERS ANIMATION ──
(function(){
  var c = $("embers");
  if (!c) return;
  for (var i=0; i<18; i++) {
    var e = document.createElement("div");
    e.className = "ember";
    var s = Math.random()*6+2;
    e.style.cssText = "width:"+s+"px;height:"+s+"px;left:"+(Math.random()*100)+"%;animation-duration:"+(Math.random()*8+6)+"s;animation-delay:"+(Math.random()*6)+"s";
    c.appendChild(e);
  }
})();

// ── MOT DE PASSE & ADMIN ──
function openPwd() {
  $("pwdOverlay").classList.add("open");
  setTimeout(function(){ $("pwdIn").focus(); }, 100);
}
function closePwd() {
  $("pwdOverlay").classList.remove("open");
  $("pwdIn").value = "";
}
function chkPwd() {
  if ($("pwdIn").value === ADMIN_PWD) {
    closePwd();
    openAdmin();
  } else {
    $("pwdIn").style.borderColor = "#8B2020";
    $("pwdIn").value = "";
    setTimeout(function(){ $("pwdIn").style.borderColor = ""; }, 1400);
    notify("Mot de passe incorrect","err");
  }
}
function openAdmin() {
  $("admin").classList.add("open");
  $("nav").style.display = "none";
  window.scrollTo(0,0);
  loadGuests();
}
function closeAdmin() {
  if (scanOn) stopScan();
  $("admin").classList.remove("open");
  $("nav").style.display = "flex";
}

// ── STATS ──
function updateStats() {
  var tot = guests.length;
  var arr = guests.filter(function(g){ return g.ar; }).length;
  var pen = tot - arr;
  var vip = guests.filter(function(g){ return g.zn==="vip"; }).length;
  var pct = tot ? Math.round(arr/tot*100) : 0;
  $("sT").textContent  = tot;
  $("sA").textContent  = arr;
  $("sP").textContent  = pen;
  $("sPct").textContent = pct+"%";
  $("sV").textContent  = vip;
  $("progF").style.width = pct+"%";
  $("progL").textContent = pen+" invite"+(pen>1?"s":"")+" en attente";
  $("progR").textContent = arr+" / "+tot+" presents";
}

// ── ALPHABET ──
function renderAlpha() {
  var used = new Set(guests.map(function(g){ return g.ln[0].toUpperCase(); }));
  var html = '<button class="alpha-btn active" onclick="setA(\'all\',this)">Tous</button>';
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(function(l){
    html += '<button class="alpha-btn '+(used.has(l)?'':'disabled')+'" onclick="setA(\''+l+'\',this)">'+l+'</button>';
  });
  $("alphaIdx").innerHTML = html;
}
function setA(l, btn) {
  curA = l;
  document.querySelectorAll(".alpha-btn").forEach(function(b){ b.classList.remove("active"); });
  btn.classList.add("active");
  renderList();
}
function setF(f, btn) {
  curF = f;
  document.querySelectorAll(".ftab").forEach(function(b){ b.classList.remove("active"); });
  btn.classList.add("active");
  renderList();
}

// ── LISTE INVITÉS ──
function renderList() {
  var q = $("srch").value.toLowerCase();
  var list = guests.slice();
  if (curF==="arrived") list = list.filter(function(g){ return g.ar; });
  if (curF==="pending")  list = list.filter(function(g){ return !g.ar; });
  if (curF==="vip")      list = list.filter(function(g){ return g.zn==="vip"; });
  if (q) list = list.filter(function(g){
    return fn(g).toLowerCase().includes(q) || String(g.tb).includes(q) || g.zn.includes(q) || g.id.toLowerCase().includes(q);
  });
  if (curA!=="all") list = list.filter(function(g){ return g.ln[0].toUpperCase()===curA; });
  list.sort(function(a,b){ return a.ln.localeCompare(b.ln)||a.fn.localeCompare(b.fn); });

  if (!list.length) {
    $("gList").innerHTML = '<div class="no-res">Aucun invite trouve</div>';
    return;
  }
  var grps = {};
  list.forEach(function(g){
    var l = g.ln[0].toUpperCase();
    if (!grps[l]) grps[l] = [];
    grps[l].push(g);
  });
  var html = "";
  Object.keys(grps).sort().forEach(function(l){
    html += '<div class="letter-section" id="sec-'+l+'">';
    html += '<div class="letter-header">'+l+'</div>';
    grps[l].forEach(function(g){ html += gCard(g); });
    html += '</div>';
  });
  $("gList").innerHTML = html;
}

function gCard(g) {
  var cls = g.zn==="vip" ? "vip-card" : g.ar ? "arrived" : "";
  var actions = g.ar
    ? '<button class="abt ab-un" onclick="toggleArrival(\''+g.id+'\')">X Annuler</button>'
    : '<button class="abt ab-in" onclick="toggleArrival(\''+g.id+'\')">OK Arrive(e)</button>';
  var phone_icon = g.phone ? '<span style="color:#4DC96A;font-size:.6rem;">M</span>' : "";
  return '<div class="gc '+cls+'" id="gc-'+g.id+'">'+
    '<div>'+
      '<div class="gc-name">'+g.ti+' '+g.fn+' <strong>'+g.ln+'</strong></div>'+
      '<div class="gc-meta">'+
        '<span class="gc-table">Table N '+g.tb+'</span>'+
        '<span class="gc-zone '+zcls(g.zn)+'">'+zlbl(g.zn)+'</span>'+
        (g.dt?'<span class="gc-diet">'+g.dt.split(" ")[0]+'</span>':"")+
        phone_icon+
        (g.ar?'<span style="color:var(--success);font-family:Cinzel,serif;font-size:.58rem;">OK ARRIVE(E)</span>':"")+
      '</div>'+
      (g.ar&&g.at?'<div class="gc-time">Arrive(e) a '+g.at+'</div>':"")+
      (g.nt?'<div class="gc-note">Note: '+g.nt+'</div>':"")+
    '</div>'+
    '<div class="gc-actions">'+
      actions+
      '<button class="abt ab-wa" onclick="sendWA(\''+g.id+'\')">WhatsApp</button>'+
      '<button class="abt ab-pdf" onclick="genPDF(\''+g.id+'\')">Billet PDF</button>'+
      '<button class="abt ab-ed" onclick="openEdit(\''+g.id+'\')">Editer</button>'+
      '<button class="abt ab-del" onclick="delGuest(\''+g.id+'\')">Suppr.</button>'+
    '</div>'+
  '</div>';
}

// ── CHECK-IN ──
async function toggleArrival(id) {
  var g = guests.find(function(x){ return x.id===id; });
  if (!g) return;
  var newAr = !g.ar;
  var newAt = newAr ? ts() : null;
  try {
    await DB.update(id, {ar:newAr, at:newAt});
    g.ar = newAr;
    g.at = newAt;
    if (g.ar) {
      arrLog.unshift(g.at+" — "+g.ti+" "+fn(g)+" · Table "+g.tb);
      updateArrLog();
      notify("OK "+g.ti+" "+fn(g)+" — Arrivee a "+g.at);
    } else {
      notify(fn(g)+" — Arrivee annulee","err");
    }
    updateStats();
    renderList();
  } catch(err) {
    notify("Erreur mise a jour","err");
    console.error(err);
  }
}

function updateArrLog() {
  $("arrLog").innerHTML = arrLog.length
    ? arrLog.map(function(e){ return '<div style="padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04)">'+e+'</div>'; }).join("")
    : '<p style="font-style:italic">Aucune arrivee enregistree</p>';
}

// ── AJOUTER INVITÉ ──
async function addGuest() {
  var f = $("nFn").value.trim();
  var l = $("nLn").value.trim();
  var t = parseInt($("nTb").value);
  if (!f||!l||!t) { notify("Remplissez prenom, nom et table","err"); return; }
  var newId = "INV-"+String(nextNum++).padStart(3,"0");
  var newG = {
    id:newId, ti:$("nTi").value, fn:f, ln:l, tb:t,
    zn:$("nZn").value, dt:$("nDt").value,
    nt:$("nNt").value.trim(),
    phone:$("nPhone").value.trim(),
    ar:false, at:null
  };
  try {
    await DB.insert(newG);
    guests.push(newG);
    notify("OK "+$("nTi").value+" "+f+" "+l+" ajoute(e) — Table "+t);
    ["nFn","nLn","nTb","nNt","nPhone"].forEach(function(id){ $(id).value=""; });
    updateStats(); renderList(); renderAlpha();
  } catch(err) {
    notify("Erreur ajout","err");
    console.error(err);
  }
}

// ── ÉDITER INVITÉ ──
function openEdit(id) {
  var g = guests.find(function(x){ return x.id===id; });
  if (!g) return;
  $("eId").value    = id;
  $("eFn").value    = g.fn;
  $("eLn").value    = g.ln;
  $("eTb").value    = g.tb;
  $("eTi").value    = g.ti;
  $("eZn").value    = g.zn;
  $("eDt").value    = g.dt;
  $("eNt").value    = g.nt;
  $("ePhone").value = g.phone || "";
  openMod("editMod");
}

async function saveEdit() {
  var id = $("eId").value;
  var g = guests.find(function(x){ return x.id===id; });
  if (!g) return;
  var upd = {
    fn:$("eFn").value.trim(), ln:$("eLn").value.trim(),
    tb:parseInt($("eTb").value), ti:$("eTi").value,
    zn:$("eZn").value, dt:$("eDt").value,
    nt:$("eNt").value.trim(), phone:$("ePhone").value.trim()
  };
  try {
    await DB.update(id, upd);
    Object.assign(g, upd);
    closeMod("editMod");
    notify("OK "+fn(g)+" mis(e) a jour");
    updateStats(); renderList(); renderAlpha();
  } catch(err) {
    notify("Erreur modification","err");
    console.error(err);
  }
}

// ── SUPPRIMER INVITÉ ──
async function delGuest(id) {
  var g = guests.find(function(x){ return x.id===id; });
  if (!g || !confirm("Supprimer "+fn(g)+" ?")) return;
  try {
    await DB.delete(id);
    guests = guests.filter(function(x){ return x.id!==id; });
    notify(fn(g)+" supprime(e)","err");
    updateStats(); renderList(); renderAlpha();
  } catch(err) {
    notify("Erreur suppression","err");
    console.error(err);
  }
}

// ── WHATSAPP DIRECT ──
function sendWA(id) {
  var g = guests.find(function(x){ return x.id===id; });
  if (!g) return;
  var msg = g.ar
    ? "Cher(e) "+g.ti+" "+fn(g)+",\n\nNous tenions a vous remercier chaleureusement d'avoir partage ce moment si precieux avec nous. Votre presence a rendu cette soiree inoubliable.\n\nAvec tout notre amour,\n"+COUPLE
    : "Bonjour "+g.ti+" "+fn(g)+" !\n\nNous vous attendons avec impatience ce soir.\n\nLieu : "+VENUE+"\nTable N "+g.tb+" — Zone "+zlbl(g.zn)+"\nAccueil des 16h30\n\n"+COUPLE;
  if (g.phone) {
    var phone = g.phone.replace(/[\s\-\(\)]/g,"");
    window.open("https://wa.me/"+phone+"?text="+encodeURIComponent(msg),"_blank");
  } else {
    window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
    notify("Pas de numero — ajoutez le telephone de l'invite","inf");
  }
  notify("WhatsApp ouvert","wa");
}

function groupWA() {
  var msg = "Chers amis, chere famille,\n\nMerci infiniment d'avoir ete presents a notre mariage. Votre amour a rendu cette nuit absolument magique.\n\nAvec tout notre amour,\n"+COUPLE;
  window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
  notify("Message groupe ouvert","wa");
}

// ── BILLET PDF LUXUEUX ──
/**
 * genPDF v2 — Invitation Royale 2 pages A5
 * Page 1 : Billet nominatif (photo + infos invité + QR confirmation)
 * Page 2 : Programme + Code vestimentaire + Infos utiles + QR localisation
 *
 * Dépendances globales : jspdf.jsPDF, QRCode
 * Variables globales   : guests, COUPLE_PHOTO, SITE_URL, zlbl(), notify()
 */

// ── BILLET PDF LUXUEUX ──
/**
 * genPDF v3 — Invitation Royale 2 pages A5 (espacements corrigés)
 */

// ── BILLET PDF LUXUEUX ──
/**
 * genPDF v4 — Invitation Royale 2 pages A5
 * Espacements harmonisés (~1 à 1.15cm = ~160-180px entre sections qui se touchaient)
 */

async function genPDF(id) {
  const g = guests.find(x => x.id === id);
  if (!g) return;
  notify("Génération du billet...", "inf");

  const gold  = "#C9A84C";
  const goldL = "#F0CC70";
  const goldD = "#7A5C1E";
  const black = "#0D0A04";
  const white = "#FFFFFF";
  const cream = "#F5EDD3";

  const W = 2362, H = 3307;
  const CM = 159; // 1cm en pixels à cette résolution

  function makeCanvas() {
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    return c;
  }

  function loadImage(src) {
    return new Promise((res, rej) => {
      const i = new Image();
      i.crossOrigin = "anonymous";
      i.onload  = () => res(i);
      i.onerror = () => rej(new Error("Impossible de charger : " + src));
      i.src = src;
    });
  }

  function makeQR(text, size = 400) {
    return new Promise(res => {
      const div = document.createElement("div");
      div.style.cssText = "position:absolute;left:-99999px;top:-99999px;";
      document.body.appendChild(div);
      new QRCode(div, { text, width: size, height: size });
      setTimeout(() => {
        const url = div.querySelector("canvas").toDataURL("image/png");
        document.body.removeChild(div);
        res(url);
      }, 500);
    });
  }

  function C(ctx) {
    return {
      bg(color) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, W, H);
      },
      rect(x, y, w, h, fill, stroke, sw = 3, r = 0) {
        ctx.beginPath();
        if (r) {
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
          ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
          ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
          ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
        } else {
          ctx.rect(x, y, w, h);
        }
        ctx.closePath();
        if (fill)   { ctx.fillStyle = fill;   ctx.fill(); }
        if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.stroke(); }
      },
      txt(str, x, y, font, color, align = "left", maxW) {
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        maxW ? ctx.fillText(str, x, y, maxW) : ctx.fillText(str, x, y);
      },
      line(x1, y1, x2, y2, color, w = 2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = color; ctx.lineWidth = w; ctx.stroke();
      },
      deco(cx, y, halfW, color = gold) {
        this.line(cx - halfW, y, cx - 22, y, color, 2);
        this.line(cx + 22, y, cx + halfW, y, color, 2);
        ctx.save();
        ctx.translate(cx, y); ctx.rotate(Math.PI / 4);
        ctx.fillStyle = color;
        ctx.fillRect(-9, -9, 18, 18);
        ctx.restore();
      },
      grad(x, y, w, h, stops) {
        const g2 = ctx.createLinearGradient(x, y, x, y + h);
        stops.forEach(([p, c]) => g2.addColorStop(p, c));
        ctx.fillStyle = g2;
        ctx.fillRect(x, y, w, h);
      },
      shadow(color, blur) {
        ctx.shadowColor = color; ctx.shadowBlur = blur;
      },
      noShadow() {
        ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
      },
      corner(x, y, size, fx, fy) {
        ctx.save();
        ctx.translate(x, y); ctx.scale(fx ? -1 : 1, fy ? -1 : 1);
        ctx.strokeStyle = gold; ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, size); ctx.lineTo(0, 0); ctx.lineTo(size, 0);
        ctx.stroke();
        ctx.strokeStyle = goldD; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, size * 0.65); ctx.lineTo(0, size * 0.15);
        ctx.quadraticCurveTo(0, 0, size * 0.15, 0);
        ctx.lineTo(size * 0.65, 0);
        ctx.stroke();
        ctx.fillStyle = goldL;
        ctx.beginPath();
        ctx.arc(size * 0.12, size * 0.12, size * 0.07, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      },
      borders(margin1 = 28, margin2 = 52) {
        this.rect(margin1, margin1, W - margin1 * 2, H - margin1 * 2, null, gold, 6, 20);
        this.rect(margin2, margin2, W - margin2 * 2, H - margin2 * 2, null, goldD, 2, 12);
      }
    };
  }

  const margin1 = 28;

  /* ════════════════ PAGE 1 ════════════════ */
  async function drawPage1() {
    const canvas = makeCanvas();
    const ctx = canvas.getContext("2d");
    const D = C(ctx);
    const CX = W / 2;

    D.bg(black);

    // ── Couronne + Monogramme VY — AU-DESSUS de la photo (zone propre, pas de chevauchement) ──
    let y = 95;
    ctx.save();
    D.shadow(gold, 30);
    ctx.font = `${Math.floor(W * 0.04)}px serif`;
    ctx.fillStyle = goldL;
    ctx.textAlign = "center";
    ctx.fillText("♛", CX, y);
    D.noShadow();
    ctx.restore();

    y += CM * 0.85; // ~135px sous la couronne
    ctx.save();
    D.shadow(goldL, 45);
    ctx.font = `bold ${Math.floor(W * 0.085)}px Georgia, serif`;
    ctx.fillStyle = gold;
    ctx.fillText("VY", CX, y);
    D.noShadow();
    ctx.restore();

    // La photo démarre clairement APRÈS le monogramme, avec 1cm de marge
    const photoTop = y + CM * 0.6;
    const photoH = Math.floor(H * 0.36);
    const coupleImg = await loadImage(COUPLE_PHOTO + "?v=" + Date.now());
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, photoTop, W, photoH);
    ctx.clip();

    const sc = Math.max(W / coupleImg.width, photoH / coupleImg.height);
    const pw = coupleImg.width * sc, ph = coupleImg.height * sc;
    ctx.drawImage(coupleImg, (W - pw) / 2, photoTop, pw, ph);

    const halo = ctx.createRadialGradient(CX, photoTop + photoH * 0.3, 0, CX, photoTop + photoH * 0.3, W * 0.55);
    halo.addColorStop(0,   "rgba(160,80,0,0.45)");
    halo.addColorStop(0.5, "rgba(80,30,0,0.18)");
    halo.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = halo; ctx.fillRect(0, photoTop, W, photoH);

    D.grad(0, photoTop + photoH * 0.55, W, photoH * 0.45, [
      [0, "rgba(0,0,0,0)"],
      [0.6, "rgba(5,3,0,0.7)"],
      [1, "rgba(10,6,0,0.98)"]
    ]);
    ctx.restore();

    const photoBottom = photoTop + photoH;

    // Texture subtile sous la photo
    ctx.save();
    ctx.globalAlpha = 0.03;
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 8; col++) {
        ctx.strokeStyle = gold; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(col * 300 + 150, photoBottom + row * 300 + 150, 80, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // ── Nom des mariés (en bas de la photo, sur le dégradé) ──
    y = photoBottom - 65;
    ctx.save();
    D.shadow("rgba(0,0,0,0.8)", 20);
    D.txt("VANINA & YVAN", CX, y, `bold ${Math.floor(W * 0.062)}px Georgia, serif`, white, "center", W - 120);
    D.noShadow();
    ctx.restore();
    y += 48;
    D.txt("INVITATION ROYALE", CX, y, `${Math.floor(W * 0.024)}px Georgia, serif`, gold, "center");

    // ── Section infos — démarre 1cm après la photo ──
    y = photoBottom + CM * 0.9;

    const ticketId = "VIP-INV-" + String(g.id).padStart(3, "0");
    D.rect(CX - 220, y - 38, 440, 62, null, gold, 2, 6);
    D.txt("❖ " + ticketId + " ❖", CX, y, `${Math.floor(W * 0.022)}px Georgia, serif`, gold, "center");

    y += CM * 0.55;
    D.txt("INVITÉ D'HONNEUR", CX, y, `bold ${Math.floor(W * 0.023)}px Georgia, serif`, gold, "center");
    y += 26;
    D.deco(CX, y, 320);

    y += CM * 0.45;
    const guestName = ((g.ti || "") + " " + g.fn + " " + g.ln).trim().toUpperCase();
    ctx.save();
    D.shadow(gold, 12);
    let nameFont = Math.floor(W * 0.05);
    ctx.font = `bold ${nameFont}px Georgia, serif`;
    if (ctx.measureText(guestName).width > W - 160) {
      nameFont = Math.floor(W * 0.038);
    }
    D.txt(guestName, CX, y, `bold ${nameFont}px Georgia, serif`, white, "center", W - 140);
    D.noShadow();
    ctx.restore();

    y += 48;
    D.deco(CX, y, 320);

    // Texte invitation
    y += CM * 0.5;
    ctx.save();
    ctx.font = `italic ${Math.floor(W * 0.0225)}px Georgia, serif`;
    ctx.fillStyle = cream;
    ctx.textAlign = "center";
    const lines = [
      "C'est avec un immense bonheur que nous vous",
      "invitons à être témoins de notre promesse de mariage."
    ];
    lines.forEach((l, i) => ctx.fillText(l, CX, y + i * 44, W - 160));
    ctx.restore();
    y += lines.length * 44 + 10;

    y += CM * 0.4;
    D.deco(CX, y, 300);

    // ── Date ──
    y += CM * 0.6;
    const dateLeftX = CX - 180;
    const dateRightX = CX + 180;

    D.txt("SAMEDI", dateLeftX, y, `${Math.floor(W * 0.0225)}px Georgia, serif`, gold, "center");
    D.txt("27", dateLeftX, y + 88, `bold ${Math.floor(W * 0.085)}px Georgia, serif`, gold, "center");

    D.line(CX, y - 15, CX, y + 95, goldD, 2);

    D.txt("DÉCEMBRE", dateRightX, y + 18, `${Math.floor(W * 0.0225)}px Georgia, serif`, gold, "center");
    D.txt("2026", dateRightX, y + 70, `bold ${Math.floor(W * 0.047)}px Georgia, serif`, gold, "center");

    y += 130;
    y += CM * 0.4;
    D.deco(CX, y, 300);

    // ── Lieu ──
    y += CM * 0.55;
    ctx.save();
    ctx.font = `${Math.floor(W * 0.034)}px serif`;
    ctx.fillStyle = gold;
    ctx.textAlign = "left";
    ctx.fillText("📍", 130, y);
    ctx.restore();
    D.txt("LIEU DE LA CÉRÉMONIE", 215, y - 20, `bold ${Math.floor(W * 0.0225)}px Georgia, serif`, gold, "left");
    D.txt("Nyom Messassi, 600 Lots", 215, y + 16, `${Math.floor(W * 0.0205)}px Georgia, serif`, cream, "left");
    D.txt("Yaoundé, Cameroun", 215, y + 50, `${Math.floor(W * 0.0205)}px Georgia, serif`, cream, "left");

    y += 80;
    y += CM * 0.4;
    D.deco(CX, y, 300);

    // ── Table / Zone / Menu ──
    y += CM * 0.6;
    const col1 = CX - 560, col2 = CX, col3 = CX + 560;

    function iconBlock(icon, label, value, cx) {
      ctx.save();
      ctx.font = `${Math.floor(W * 0.036)}px serif`;
      ctx.fillStyle = gold; ctx.textAlign = "center";
      ctx.fillText(icon, cx, y);
      ctx.restore();
      D.txt(label, cx, y + 46, `${Math.floor(W * 0.019)}px Georgia, serif`, cream, "center");
      D.txt(value, cx, y + 90, `bold ${Math.floor(W * 0.032)}px Georgia, serif`, gold, "center", 340);
    }
    iconBlock("🪑", "TABLE", String(g.tb || "01").padStart(2, "0"), col1);
    D.line(col1 + 250, y - 28, col1 + 250, y + 95, goldD, 2);
    iconBlock("👥", "ZONE", zlbl(g.zn).toUpperCase(), col2);
    D.line(col2 + 250, y - 28, col2 + 250, y + 95, goldD, 2);
    iconBlock("🍽️", "MENU", (g.dt || "STANDARD").toUpperCase(), col3);

    // Espace garanti 1.15cm avant la ligne déco + le cadre QR (c'était le souci signalé)
    y += 95;
    y += CM * 1.15;
    D.deco(CX, y, 320);

    // ── QR code — avec marge de sécurité par rapport à la couronne au-dessus ──
    y += CM * 0.55;
    const qrURL = await makeQR(SITE_URL + "?inv=" + g.id, 400);
    const qrImg = await loadImage(qrURL);
    const qrSize = 320;
    const qrX = CX - qrSize / 2;

    D.rect(qrX - 26, y - 42, qrSize + 52, qrSize + 92, "rgba(20,14,2,0.85)", gold, 4, 16);
    ctx.save();
    ctx.font = `${Math.floor(W * 0.032)}px serif`;
    ctx.fillStyle = goldL; ctx.textAlign = "center";
    D.shadow(gold, 14);
    ctx.fillText("♛", CX, y - 10);
    D.noShadow();
    ctx.restore();
    ctx.drawImage(qrImg, qrX, y, qrSize, qrSize);

    y += qrSize + 48;
    D.txt("SCANNEZ POUR CONFIRMER VOTRE PRÉSENCE", CX, y,
      `${Math.floor(W * 0.017)}px Georgia, serif`, goldD, "center");

    // ── Citation ──
    y += CM * 0.55;
    D.deco(CX, y, 280);
    y += CM * 0.45;
    ctx.save();
    ctx.font = `italic bold ${Math.floor(W * 0.028)}px Georgia, serif`;
    ctx.fillStyle = gold; ctx.textAlign = "center";
    D.shadow(gold, 8);
    ctx.fillText("L'amour unit nos cœurs, la foi guide nos pas.", CX, y, W - 140);
    D.noShadow();
    ctx.restore();

    // ── Bandeau bas ──
    D.txt("BILLET NOMINATIF • NON TRANSFÉRABLE", CX, H - 70,
      `${Math.floor(W * 0.016)}px Georgia, serif`, goldD, "center");

    D.borders(margin1, 52);
    const cs = 120;
    D.corner(margin1 + 8, margin1 + 8, cs, false, false);
    D.corner(W - margin1 - 8, margin1 + 8, cs, true, false);
    D.corner(margin1 + 8, H - margin1 - 8, cs, false, true);
    D.corner(W - margin1 - 8, H - margin1 - 8, cs, true, true);

    return canvas;
  }

  /* ════════════════ PAGE 2 ════════════════ */
  async function drawPage2() {
    const canvas = makeCanvas();
    const ctx = canvas.getContext("2d");
    const D = C(ctx);
    const CX = W / 2;

    D.bg(black);

    ctx.save();
    ctx.globalAlpha = 0.03;
    for (let row = 0; row < 14; row++) {
      for (let col = 0; col < 9; col++) {
        ctx.strokeStyle = gold; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(col * 280 + 140, row * 280 + 140, 70, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    let y = 85;
    ctx.save();
    ctx.font = `${Math.floor(W * 0.036)}px serif`;
    ctx.fillStyle = goldL; ctx.textAlign = "center";
    D.shadow(gold, 16);
    ctx.fillText("♛", CX, y);
    D.noShadow();
    ctx.restore();

    // Espace garanti 1.15cm entre couronne et VY (c'était trop serré avant)
    y += CM * 1.15;
    ctx.save();
    D.shadow(gold, 32);
    ctx.font = `bold ${Math.floor(W * 0.09)}px Georgia, serif`;
    ctx.fillStyle = gold; ctx.textAlign = "center";
    ctx.fillText("VY", CX, y);
    D.noShadow();
    ctx.restore();

    // Espace garanti 1cm entre VY et VANINA & YVAN (c'était le souci signalé)
    y += CM * 0.5;
    D.deco(CX, y, 380);
    y += CM * 0.65;
    D.txt("VANINA & YVAN", CX, y, `bold ${Math.floor(W * 0.047)}px Georgia, serif`, gold, "center");
    y += 28;
    D.deco(CX, y, 420);

    y += CM * 0.55;
    D.txt("PROGRAMME DU MARIAGE", CX, y,
      `${Math.floor(W * 0.032)}px Georgia, serif`, white, "center");
    y += 26;
    D.deco(CX, y, 450, goldD);

    const programme = [
      { heure: "14h00", titre: "Accueil des Invités",    detail: "Installation et rafraîchissements",  icon: "👥" },
      { heure: "15h00", titre: "Cérémonie Religieuse",   detail: "Union bénie devant Dieu",             icon: "⛪" },
      { heure: "17h00", titre: "Séance Photo",            detail: "Avec les mariés et invités",          icon: "📸" },
      { heure: "18h00", titre: "Cocktail",                detail: "Moment de convivialité",              icon: "🥂" },
      { heure: "19h30", titre: "Dîner de Gala",           detail: "Repas servi avec élégance",           icon: "🍽️" },
      { heure: "21h00", titre: "Ouverture du Bal",        detail: "Première danse des mariés",           icon: "💃" },
      { heure: "22h00", titre: "Animations & Festivités", detail: "Ambiance assurée",                    icon: "🎵" },
      { heure: "00h00", titre: "Clôture Officielle",      detail: "Fin de cette journée inoubliable",    icon: "🎆" },
    ];

    y += CM * 0.5;
    const progStartY = y;
    const rowH = 132;
    const lineX = 300;

    D.line(lineX, progStartY, lineX, progStartY + programme.length * rowH - 30, goldD, 3);

    programme.forEach((item, i) => {
      const py = progStartY + i * rowH + 48;
      D.rect(lineX - 30, py - 30, 60, 60, black, gold, 3, 30);
      ctx.save();
      ctx.font = `${Math.floor(W * 0.022)}px serif`;
      ctx.fillStyle = gold; ctx.textAlign = "center";
      ctx.fillText(item.icon, lineX, py + 8);
      ctx.restore();

      D.txt(item.heure, lineX - 52, py + 6,
        `bold ${Math.floor(W * 0.026)}px Georgia, serif`, gold, "right");

      D.txt(item.titre.toUpperCase(), lineX + 55, py - 8,
        `bold ${Math.floor(W * 0.024)}px Georgia, serif`, gold, "left", W - lineX - 105);
      D.txt(item.detail, lineX + 55, py + 30,
        `italic ${Math.floor(W * 0.0185)}px Georgia, serif`, cream, "left", W - lineX - 105);
    });

    y = progStartY + programme.length * rowH + 20;
    y += CM * 0.3;
    D.deco(CX, y, 430, goldD);

    // ── Code vestimentaire ──
    y += CM * 0.55;
    D.txt("Code Vestimentaire", CX, y,
      `italic bold ${Math.floor(W * 0.028)}px Georgia, serif`, gold, "center");
    y += 28;
    D.deco(CX, y, 350, goldD);

    y += CM * 0.7;
    ctx.save();
    ctx.font = `${Math.floor(W * 0.055)}px serif`;
    ctx.fillStyle = gold; ctx.textAlign = "center";
    ctx.fillText("🤵", CX - 420, y);
    ctx.fillText("👗", CX + 420, y);
    ctx.restore();

    D.line(CX, y - 55, CX, y + 120, goldD, 2);

    D.txt("HOMMES", CX - 420, y + 55, `bold ${Math.floor(W * 0.02)}px Georgia, serif`, gold, "center");
    D.txt("Costume sombre recommandé", CX - 420, y + 88, `${Math.floor(W * 0.0165)}px Georgia, serif`, cream, "center", 320);

    D.txt("FEMMES", CX + 420, y + 55, `bold ${Math.floor(W * 0.02)}px Georgia, serif`, gold, "center");
    D.txt("Tenue de soirée élégante", CX + 420, y + 88, `${Math.floor(W * 0.0165)}px Georgia, serif`, cream, "center", 320);

    y += 145;
    y += CM * 0.35;
    D.deco(CX, y, 380, goldD);

    // ── Infos utiles ──
    y += CM * 0.55;
    D.txt("Informations Utiles", CX, y,
      `italic bold ${Math.floor(W * 0.028)}px Georgia, serif`, gold, "center");
    y += 28;
    D.deco(CX, y, 350, goldD);

    y += CM * 0.55;
    const infoItems = [
      { icon: "📍", lines: ["Nyom Messassi, 600 Lots", "Yaoundé, Cameroun"] },
      { icon: "📞", lines: ["+237 6 12 34 56 78", "+237 6 98 76 54 32"] },
      { icon: "✉️", lines: ["beugueum@gmail.com"] },
    ];

    infoItems.forEach(item => {
      ctx.save();
      ctx.font = `${Math.floor(W * 0.03)}px serif`;
      ctx.fillStyle = gold; ctx.textAlign = "left";
      ctx.fillText(item.icon, 150, y + 8);
      ctx.restore();
      item.lines.forEach((l, li) => {
        D.txt(l, 250, y + li * 40, `${Math.floor(W * 0.0205)}px Georgia, serif`, cream, "left");
      });
      y += item.lines.length * 40 + 32;
    });

    y += CM * 0.3;
    D.deco(CX, y, 380, goldD);

    // ── QR localisation ──
    y += CM * 0.5;
    const qrLocURL = await makeQR("https://maps.google.com/?q=Nyom+Messassi+Yaounde+Cameroun", 400);
    const qrLocImg = await loadImage(qrLocURL);
    const qrS = 290;
    const qrLX = CX - qrS / 2;

    D.rect(qrLX - 26, y - 38, qrS + 52, qrS + 88, "rgba(20,14,2,0.85)", gold, 4, 16);
    D.txt("SCANNEZ POUR LOCALISER LE LIEU", CX, y - 8,
      `${Math.floor(W * 0.017)}px Georgia, serif`, goldD, "center");
    ctx.drawImage(qrLocImg, qrLX, y, qrS, qrS);

    y += qrS + 50;
    y += CM * 0.3;
    D.deco(CX, y, 320, goldD);

    // ── Citation finale ──
    y += CM * 0.5;
    ctx.save();
    ctx.font = `italic bold ${Math.floor(W * 0.026)}px Georgia, serif`;
    ctx.fillStyle = gold; ctx.textAlign = "center";
    D.shadow(gold, 8);
    ctx.fillText("Merci de partager avec nous ce moment unique.", CX, y, W - 140);
    D.noShadow();
    ctx.restore();

    D.borders(margin1, 52);
    const cs = 120;
    D.corner(margin1 + 8, margin1 + 8, cs, false, false);
    D.corner(W - margin1 - 8, margin1 + 8, cs, true, false);
    D.corner(margin1 + 8, H - margin1 - 8, cs, false, true);
    D.corner(W - margin1 - 8, H - margin1 - 8, cs, true, true);

    return canvas;
  }

  try {
    const [c1, c2] = await Promise.all([drawPage1(), drawPage2()]);

    const img1 = c1.toDataURL("image/jpeg", 0.97);
    const img2 = c2.toDataURL("image/jpeg", 0.97);

    const pdf = new jspdf.jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [148, 210]
    });

    pdf.addImage(img1, "JPEG", 0, 0, 148, 210);
    pdf.addPage([148, 210], "portrait");
    pdf.addImage(img2, "JPEG", 0, 0, 148, 210);

    pdf.save(`Invitation_${g.fn}_${g.ln}.pdf`);
    notify("Invitation générée !");

  } catch (err) {
    console.error(err);
    notify("Erreur génération billet : " + err.message, "err");
  }
}

// ── QR SCANNER ──
function toggleScan() { scanOn ? stopScan() : startScan(); }

function startScan() {
  if (!qrScn) qrScn = new Html5Qrcode("qr-reader");
  qrScn.start(
    {facingMode:"environment"},
    {fps:10, qrbox:{width:200,height:200}},
    onScan,
    function(){}
  ).then(function(){
    scanOn = true;
    $("scanTxt").textContent = "Arreter le scanner";
  }).catch(function(e){
    notify("Camera inaccessible : "+e,"err");
  });
}

function stopScan() {
  if (qrScn && scanOn) {
    qrScn.stop().then(function(){
      scanOn = false;
      $("scanTxt").textContent = "Demarrer le scanner";
    });
  }
}

function onScan(decoded) {
  try {
    var invId = decoded.includes("inv=")
      ? new URLSearchParams(decoded.split("?")[1]).get("inv")
      : decoded;
    var g = guests.find(function(x){ return x.id===invId; });
    if (!g) {
      $("scanNm").textContent = "Invite introuvable";
      $("scanDt").textContent = "QR non reconnu";
      $("scanAct").innerHTML  = "";
      $("scanRes").style.display = "block";
      notify("QR non reconnu","err");
      return;
    }
    $("scanRes").style.display = "block";
    $("scanNm").textContent = g.ti+" "+g.fn+" "+g.ln;
    $("scanDt").textContent = "Table N "+g.tb+" · "+zlbl(g.zn)+" · "+(g.ar?"Deja enregistre":"En attente");
    $("scanAct").innerHTML = g.ar
      ? '<button class="btn btn-ghost" style="width:100%;padding:10px;margin-top:8px" onclick="toggleArrival(\''+g.id+'\')">Annuler arrivee</button>'
      : '<button class="btn btn-burn" style="width:100%;padding:10px;margin-top:8px" onclick="toggleArrival(\''+g.id+'\')">Confirmer l arrivee</button>';
    notify(g.ar ? fn(g)+" — deja enregistre" : "OK "+fn(g)+" — Table "+g.tb, g.ar?"inf":"ok");
  } catch(e) {
    notify("Erreur lecture QR","err");
  }
}

// ── EXPORT CSV ──
function exportCSV() {
  var h = ["ID","Civilite","Prenom","Nom","Table","Zone","Regime","Note","Telephone","Arrive","Heure"];
  var r = guests.map(function(g){
    return [g.id,g.ti,g.fn,g.ln,g.tb,g.zn,g.dt||"Standard",g.nt||"",g.phone||"",g.ar?"OUI":"NON",g.at||""];
  });
  var csv = [h].concat(r).map(function(row){
    return row.map(function(c){ return '"'+String(c).replace(/"/g,'""')+'"'; }).join(",");
  }).join("\n");
  var a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8,\uFEFF"+encodeURIComponent(csv);
  a.download = "invites_mariage_"+new Date().toISOString().slice(0,10)+".csv";
  a.click();
  notify("CSV telecharge","inf");
}

// ── IMPRESSION ──
function printList() {
  var sorted = guests.slice().sort(function(a,b){ return a.ln.localeCompare(b.ln); });
  var arr = guests.filter(function(g){ return g.ar; }).length;
  var w = window.open("","_blank");
  var rows = sorted.map(function(g){
    return "<tr><td><strong>"+g.ti+" "+g.fn+" "+g.ln+"</strong></td><td>"+g.tb+"</td><td>"+zlbl(g.zn)+"</td><td>"+(g.phone||"—")+"</td><td class='"+( g.ar?"ok":"wait")+"'>"+(g.ar?"Arrive":"En attente")+"</td><td>"+(g.at||"—")+"</td></tr>";
  }).join("");
  w.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Liste — '+COUPLE+'</title>'+
    '<style>body{font-family:Georgia,serif;max-width:900px;margin:40px auto;color:#1A0E00}'+
    'h1{color:#CC5500;text-align:center}table{width:100%;border-collapse:collapse;font-size:.85rem}'+
    'th{color:#CC5500;padding:10px 8px;border-bottom:2px solid #CC5500;text-align:left}'+
    'td{padding:9px 8px;border-bottom:1px solid #F0E8DE}.ok{color:#4A7C59;font-weight:bold}.wait{color:#999}'+
    '@media print{button{display:none}}</style></head><body>'+
    '<h1>'+COUPLE+'</h1>'+
    '<table><thead><tr><th>Nom</th><th>Table</th><th>Zone</th><th>Tel</th><th>Statut</th><th>Heure</th></tr></thead>'+
    '<tbody>'+rows+'</tbody></table>'+
    '<script>window.onload=function(){window.print();}<\/script></body></html>');
  w.document.close();
  notify("Impression lancee","inf");
}

// ── PHOTO HERO ──
function dragOver(e)  { e.preventDefault(); $("photoDrop").classList.add("drag"); }
function dragLeave(e) { $("photoDrop").classList.remove("drag"); }
function dropPhoto(e) {
  e.preventDefault();
  $("photoDrop").classList.remove("drag");
  var f = e.dataTransfer.files[0];
  if (f && f.type.startsWith("image/")) loadPhoto(f);
}
function loadPhoto(file) {
  if (!file) return;
  var r = new FileReader();
  r.onload = function(ev) {
    var url = ev.target.result;
    var bg  = $("heroBg");
    bg.style.backgroundImage = "url('"+url+"')";
    bg.classList.add("loaded");
    $("heroOverlay").style.display = "block";
    $("heroTexture").style.opacity = "0.3";
    $("heroGrid").style.opacity    = "0.3";
    $("photoPreview").src           = url;
    $("photoPreview").style.display = "block";
    $("photoRemove").style.display  = "block";
    document.querySelector(".photo-drop-icon").style.display = "none";
    notify("Photo ajoutee !");
  };
  r.readAsDataURL(file);
}
function removePhoto(e) {
  e.stopPropagation();
  var bg = $("heroBg");
  bg.style.backgroundImage = "";
  bg.classList.remove("loaded");
  $("heroOverlay").style.display  = "none";
  $("heroTexture").style.opacity  = "1";
  $("heroGrid").style.opacity     = "1";
  $("photoPreview").style.display = "none";
  $("photoPreview").src           = "";
  $("photoRemove").style.display  = "none";
  document.querySelector(".photo-drop-icon").style.display = "block";
  $("photoInput").value = "";
  notify("Photo retiree","inf");
}

// ── SCROLL NAV EFFECT ──
window.addEventListener("scroll", function(){
  var nav = $("nav");
  if (nav) nav.style.borderBottomColor = window.scrollY>60 ? "rgba(204,85,0,.35)" : "rgba(204,85,0,.18)";
});

// ── INITIALISATION ──
document.addEventListener("DOMContentLoaded", function(){
  // Indicateur de chargement
  var d = document.createElement("div");
  d.id = "loadingIndicator";
  d.style.cssText = "display:none;position:fixed;inset:0;background:rgba(10,5,0,.85);z-index:9999;align-items:center;justify-content:center;flex-direction:column;gap:15px";
  d.innerHTML = '<div style="width:40px;height:40px;border:3px solid rgba(204,85,0,.3);border-top-color:#CC5500;border-radius:50%;animation:spin 1s linear infinite"></div>'+
    '<div style="font-family:Cinzel,serif;font-size:.7rem;letter-spacing:.2em;color:rgba(255,255,255,.5)">CHARGEMENT...</div>'+
    '<style>@keyframes spin{to{transform:rotate(360deg)}}</style>';
  document.body.appendChild(d);

  // Auto check-in via URL QR scan
  var params = new URLSearchParams(window.location.search);
  var invId  = params.get("inv");
  if (invId) {
    setTimeout(async function(){
      var g = guests.find(function(x){ return x.id===invId; });
      if (!g) { alert("Invite introuvable : "+invId); return; }
      var msg = g.ar
        ? "OK "+g.ti+" "+g.fn+" "+g.ln+" — Deja enregistre(e)\nTable N "+g.tb+" · "+zlbl(g.zn)
        : "Invite trouve !\n\n"+g.ti+" "+g.fn+" "+g.ln+"\nTable N "+g.tb+" · "+zlbl(g.zn)+"\n\nConfirmer l'arrivee ?";
      if (g.ar) {
        alert(msg);
      } else {
        if (confirm(msg)) {
          await toggleArrival(invId);
          alert("OK Arrivee confirmee pour "+g.fn+" "+g.ln+" !");
        }
      }
    }, 2500);
  }
});