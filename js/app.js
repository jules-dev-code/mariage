// ================================================
//  MARIAGE — Vanina & Yvan
//  app.js — Connecté à Supabase
// ================================================
const SUPABASE_URL = "https://psxpjuvbdctmsfuudjbe.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzeHBqdXZiZGN0bXNmdXVkamJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMjI5NTgsImV4cCI6MjA2MzU5ODk1OH0.r3A6TvAujn7wgD9HNWZ_eMECLqxqKzqIZJJf3Xhqe0o";

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
const VENUE     = "Château de Versailles, Paris";
const WDATE     = new Date("2025-06-14T17:00:00");

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
