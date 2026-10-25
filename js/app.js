import CONFIG from './config.js?v=7';

/* ---------- utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const h = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ls = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const novoId = () => 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const reduzMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
const IOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const svg = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const IC = {
  check: svg('<path d="M20 6L9 17l-5-5"/>'),
  x: svg('<path d="M18 6L6 18M6 6l12 12"/>'),
  navegar: svg('<path d="M3 11l19-9-9 19-2-8z"/>'),
  alvo: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>'),
  lixo: svg('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>'),
  editar: svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'),
  porta: svg('<path d="M4 21h16"/><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/><circle cx="14" cy="12" r="1" fill="currentColor"/>'),
  relogio: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  crianca: svg('<circle cx="12" cy="7" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/>'),
  cachorro: svg('<path d="M10 5h4l3 4v3a5 5 0 0 1-10 0V9z"/><path d="M8 9L5 6M16 9l3-3"/><circle cx="10" cy="11" r="1" fill="currentColor"/><circle cx="14" cy="11" r="1" fill="currentColor"/>'),
  doce: svg('<rect x="7" y="9" width="10" height="6" rx="3"/><path d="M7 12L3 9v6zM17 12l4-3v6z"/>'),
  susto: svg('<path d="M12 3C7 3 5 7 5 12v9l3-2 2 2 2-2 2 2 2-2 3 2v-9c0-5-2-9-7-9z"/><circle cx="9.5" cy="11" r="1.2" fill="currentColor"/><circle cx="14.5" cy="11" r="1.2" fill="currentColor"/>'),
  casa: svg('<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>'),
  ouvir: svg('<path d="M11 5L6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/>'),
  carregando: svg('<path d="M12 3a9 9 0 1 0 9 9"/>'),
  google: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z"/></svg>',
};
const PIN_SVG = `<svg viewBox="0 0 46 52" aria-hidden="true"><path d="M23 50c-2-6-6-9-6-9h12s-4 3-6 9z" fill="#2a0d00"/><path d="M22 6c2 1 3 4 3 7" stroke="#5a8a2a" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse class="corpo" cx="23" cy="26" rx="21" ry="17" fill="#ff8a1f"/><ellipse cx="12" cy="26" rx="7" ry="16" fill="#e86a00" opacity=".55"/><ellipse cx="34" cy="26" rx="7" ry="16" fill="#e86a00" opacity=".55"/><path d="M13 20l4 5h-8zM33 20l4 5h-8z" fill="#2a0d00"/><path d="M12 32q11 8 22 0l-3 2-3-2-3 2-3-2-3 2-3-2-2 2z" fill="#2a0d00"/></svg>`;
const PUMPKIN_BIG = `<div class="vazio-cena"><svg class="abobora-vazia" viewBox="0 0 120 112" aria-hidden="true"><ellipse cx="60" cy="106" rx="40" ry="5" fill="#000" opacity=".35"/><path d="M59 26c-1-9 2-16 8-20" stroke="#4f7a24" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M66 12c9-7 20-5 25 2-9 4-17 4-25-2z" fill="#6fa83a"/><path d="M70 14c-4 6-3 12 2 16" stroke="#6fa83a" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="33" cy="64" rx="25" ry="38" fill="#e86f0c"/><ellipse cx="87" cy="64" rx="25" ry="38" fill="#e86f0c"/><ellipse cx="60" cy="64" rx="31" ry="41" fill="#ff8a1f"/><ellipse cx="48" cy="44" rx="9" ry="16" fill="#ffb35c" opacity=".55"/><ellipse cx="22" cy="54" rx="5" ry="12" fill="#ffb35c" opacity=".35"/><path d="M44 26q-10 38 0 76M76 26q10 38 0 76" stroke="#c25400" stroke-width="2" fill="none" opacity=".45"/><g class="rosto" fill="#ffd84a"><path d="M30 52l13-14 9 18z"/><path d="M90 52l-13-14-9 18z"/><path d="M60 60l-6 9h12z"/><path d="M26 72q34 30 68 0l-8 3-5 8-7-6-6 8-6-8-6 8-6-8-7 6-5-8z"/></g></svg><span class="fantasminha"><svg viewBox="0 0 40 46" aria-hidden="true"><path d="M20 2C9 2 4 10 4 20v24l5-5 5 5 6-5 6 5 5-5 5 5V20C36 10 31 2 20 2z" fill="currentColor"/><circle cx="14" cy="18" r="3" fill="#1a1428"/><circle cx="26" cy="18" r="3" fill="#1a1428"/><ellipse cx="20" cy="27" rx="3" ry="4" fill="#1a1428"/></svg></span></div>`;

const OFERECE = [['doces','Doces e balas'],['chocolate','Chocolate'],['brincadeira','Brincadeira ou susto'],['decoracao','Casa decorada'],['lembrancinha','Lembrancinha']];
const FLAGS = [['pequenos','Amigável para pequenos'],['cachorro','Tem cachorro'],['alergia','Opção sem açúcar/alergia'],['assustadora','Bem assustadora']];
const rotuloDe = (lista, k) => (lista.find(o => o[0] === k) || [k, k])[1];

/* ---------- estado ---------- */
let casas = [];                 // [{id, rua, numero, familia, oferece, flags, horaInicio, horaFim, obs, lat, lng, uid, criadoEm}]
let evento = {...CONFIG.evento, portaria: null};
const uidLocal = ls.get('hw.uid', null) || (() => { const u = 'd' + Math.random().toString(36).slice(2, 12); ls.set('hw.uid', u); return u; })();
let usuario = null;             // {uid, nome, email} quando logado com Google
let organizador = false;        // decidido pelo e-mail (as regras do Firestore conferem de novo no servidor)
let jaAbriuMinhaCasa = false;
const meuUid = () => store.modo === 'nuvem' ? (usuario ? usuario.uid : null) : uidLocal;
let modo = null;                // null | 'casa' | 'portaria'
let modoVoltar = 'mapa';
let filtros = ls.get('hw.filtros', {});
let visitadas = new Set(ls.get('hw.visitadas', []));
let partida = ls.get('hw.partida', 'gps');   // 'gps' | 'portaria' | 'casa:<id>'
let roteiro = ls.get('hw.roteiro', null);    // {ordem:[ids], de:{lat,lng}}
let vozAuto = ls.get('hw.voz', true);
let autoChegada = ls.get('hw.autochegada', true);
let pinCasa = null;
let editandoId = null;
let abaAtual = ls.get('hw.aba', 'mapa');
let posicao = null;             // {lat,lng,acc,heading,t}
let rumo = null;                // bússola em graus, se disponível
const casaPorId = id => casas.find(c => c.id === id);

/* ---------- armazenamento: Firebase (nuvem) ou local ---------- */
const store = {
  modo: 'local', db: null, fb: null,
  async init() {
    if (CONFIG.firebase && CONFIG.firebase.apiKey) {
      try {
        const [{initializeApp}, fs, auth] = await Promise.all([
          import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js'),
          import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'),
          import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js'),
        ]);
        const app = initializeApp(CONFIG.firebase); this.fs = fs; this.db = fs.getFirestore(app);
        this.auth = auth; this.a = auth.getAuth(app); this.a.languageCode = 'pt'; this.modo = 'nuvem';
        auth.getRedirectResult(this.a).catch(e => console.error('Retorno do login falhou', e));
        auth.onAuthStateChanged(this.a, async u => {
          usuario = u ? {uid: u.uid, nome: u.displayName || '', email: (u.email || '').toLowerCase()} : null;
          organizador = usuario ? await ehOrganizador(usuario.email) : false;
          aoMudarLogin();
        });
        renderCabecalho();
        fs.onSnapshot(fs.collection(this.db, 'casas'), snap => { casas = snap.docs.map(d => ({id: d.id, ...d.data()})); aoMudarDados(); }, e => { console.error(e); toast('Sem conexão com o Firebase. Mostrando o que tenho.'); });
        fs.onSnapshot(fs.doc(this.db, 'config', 'evento'), snap => { if (snap.exists()) evento = {...CONFIG.evento, portaria: null, ...snap.data()}; aoMudarDados(); });
        return;
      } catch (e) { console.error('Firebase falhou, usando modo local', e); toast('Firebase indisponível; usando modo local.'); }
    }
    casas = ls.get('hw.casas', []); evento = {...CONFIG.evento, portaria: null, ...ls.get('hw.evento', {})}; aoMudarDados();
  },
  async salvarCasa(c) {
    if (this.modo === 'nuvem') { await this.fs.setDoc(this.fs.doc(this.db, 'casas', c.id), limparCasa(c)); return; }
    const i = casas.findIndex(x => x.id === c.id); if (i >= 0) casas[i] = c; else casas.push(c); ls.set('hw.casas', casas); aoMudarDados();
  },
  async excluirCasa(id) {
    if (this.modo === 'nuvem') { await this.fs.deleteDoc(this.fs.doc(this.db, 'casas', id)); return; }
    casas = casas.filter(c => c.id !== id); ls.set('hw.casas', casas); aoMudarDados();
  },
  async entrar() {
    if (this.modo !== 'nuvem') return;
    const prov = new this.auth.GoogleAuthProvider(); prov.setCustomParameters({prompt: 'select_account'});
    try { await this.auth.signInWithPopup(this.a, prov); }
    catch (e) {
      if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) return this.auth.signInWithRedirect(this.a, prov);
      if (e && (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request')) return;
      console.error(e); toast(e && e.code === 'auth/unauthorized-domain' ? 'Este endereço ainda não foi autorizado no Firebase.' : e && e.code === 'auth/operation-not-allowed' ? 'O login com Google ainda não foi ligado no Firebase.' : 'Não consegui entrar agora. Tente de novo.', 5000);
    }
  },
  async sair() { if (this.modo === 'nuvem') await this.auth.signOut(this.a); },
  async salvarEvento(ev) {
    if (this.modo === 'nuvem') { await this.fs.setDoc(this.fs.doc(this.db, 'config', 'evento'), ev, {merge: true}); return; }
    evento = {...evento, ...ev}; ls.set('hw.evento', evento); aoMudarDados();
  }
};
const CAMPOS_CASA = ['rua', 'numero', 'familia', 'oferece', 'flags', 'horaInicio', 'horaFim', 'obs', 'lat', 'lng', 'uid', 'criadoEm', 'atualizadoEm'];
function limparCasa(c) {
  const s = (v, n) => String(v ?? '').trim().slice(0, n);
  const hora = v => /^[0-2]\d:[0-5]\d$/.test(v || '') ? v : '';
  return {rua: s(c.rua, 60), numero: s(c.numero, 20), familia: s(c.familia, 60),
    oferece: [...new Set((c.oferece || []).filter(k => OFERECE.some(o => o[0] === k)))],
    flags: [...new Set((c.flags || []).filter(k => FLAGS.some(o => o[0] === k)))],
    horaInicio: hora(c.horaInicio), horaFim: hora(c.horaFim), obs: s(c.obs, 240),
    lat: +c.lat, lng: +c.lng, uid: s(c.uid, 128), criadoEm: +c.criadoEm || Date.now(), atualizadoEm: Date.now()};
}
async function ehOrganizador(email) {
  if (!email || !crypto.subtle) return false;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email.toLowerCase()));
  const hex = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  return (CONFIG.organizadores || []).includes(hex);
}
function aoMudarLogin() {
  renderConta(); renderOrganizadorVisivel(); atualizarParticipar(); renderPins(); renderPlacar();
  if (abaAtual === 'organizador') { if (organizador) renderOrganizador(); else irAba('mapa'); }
}
function aoMudarDados() { renderCabecalho(); renderPlacar(); renderPins(); renderRoteiro(); if (abaAtual === 'organizador') renderOrganizador(); if (abaAtual === 'participar') atualizarParticipar(); }

/* ---------- geometria ---------- */
const R = 6371000;
function distM(a, b) { const f1 = a.lat * Math.PI / 180, f2 = b.lat * Math.PI / 180, df = (b.lat - a.lat) * Math.PI / 180, dl = (b.lng - a.lng) * Math.PI / 180; const x = Math.sin(df / 2) ** 2 + Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); }
function rumoGraus(a, b) { const f1 = a.lat * Math.PI / 180, f2 = b.lat * Math.PI / 180, dl = (b.lng - a.lng) * Math.PI / 180; const y = Math.sin(dl) * Math.cos(f2), x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl); return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360; }
const CARDEAIS = ['norte', 'nordeste', 'leste', 'sudeste', 'sul', 'sudoeste', 'oeste', 'noroeste'];
function direcaoFala(de, para) {
  const b = rumoGraus(de, para);
  if (rumo != null) { const rel = ((b - rumo) + 540) % 360 - 180; const a = Math.abs(rel); if (a < 25) return 'bem à sua frente'; if (a > 155) return 'atrás de você'; if (a < 70) return rel > 0 ? 'à sua frente, um pouco à direita' : 'à sua frente, um pouco à esquerda'; if (a < 110) return rel > 0 ? 'à sua direita' : 'à sua esquerda'; return rel > 0 ? 'atrás, à direita' : 'atrás, à esquerda'; }
  return 'na direção ' + CARDEAIS[Math.round(b / 45) % 8];
}
const fmtM = m => m < 1000 ? `${Math.max(10, Math.round(m / 10) * 10)} m` : `${(m / 1000).toFixed(1)} km`;
const falaM = m => m < 1000 ? `${Math.max(10, Math.round(m / 10) * 10)} metros` : `${(m / 1000).toFixed(1).replace('.', ' vírgula ')} quilômetros`;

/* ---------- regras do evento ---------- */
const hm = s => { if (!s || !/^\d{1,2}:\d{2}$/.test(s)) return null; const [a, b] = s.split(':').map(Number); return a * 60 + b; };
function horario(c) { return {ini: c.horaInicio || evento.horaInicio || '', fim: c.horaFim || evento.horaFim || ''}; }
function abertaAgora(c) { const {ini, fim} = horario(c); const a = hm(ini), b = hm(fim); if (a == null || b == null) return true; const d = new Date(); const n = d.getHours() * 60 + d.getMinutes(); return b >= a ? (n >= a && n <= b) : (n >= a || n <= b); }
function nomeCasa(c) { return (c.rua ? `${h(c.rua)}, ` : 'Casa ') + h(c.numero); }
function nomeCasaTxt(c) { return (c.rua ? `${c.rua}, ` : 'Casa ') + c.numero; }
function nomeCasaFala(c) { return c.rua ? `casa ${c.numero} da ${c.rua}` : `casa ${c.numero}`; }
function listaFala(arr) { return arr.length <= 1 ? arr.join('') : arr.slice(0, -1).join(', ') + ' e ' + arr[arr.length - 1]; }
function filtrada(c) {
  if (filtros.abertas && !abertaAgora(c)) return false;
  if (filtros.pequenos && !(c.flags || []).includes('pequenos')) return false;
  if (filtros.brincadeira && !(c.oferece || []).includes('brincadeira')) return false;
  if (filtros.naoVisitadas && visitadas.has(c.id)) return false;
  return true;
}
const podeEditar = c => !!c && (organizador || store.modo === 'local' || (!!meuUid() && c.uid === meuUid()));

/* ---------- links para o app de mapas do celular ---------- */
function linksNav(c) {
  const d = `${c.lat},${c.lng}`; const nome = encodeURIComponent(nomeCasaTxt(c));
  return {
    apple: `https://maps.apple.com/?daddr=${d}&dirflg=w&q=${nome}`,
    google: `https://www.google.com/maps/dir/?api=1&destination=${d}&travelmode=walking`,
    waze: `https://waze.com/ul?ll=${d}&navigate=yes`,
  };
}
const linkPrincipal = c => { const l = linksNav(c); return IOS ? l.apple : l.google; };
function linkRotaCompleta() {
  if (!roteiro) return '';
  const pend = roteiro.ordem.map(casaPorId).filter(c => c && !visitadas.has(c.id)).slice(0, 10); if (!pend.length) return '';
  const origem = posicao ? `${posicao.lat},${posicao.lng}` : `${roteiro.de.lat},${roteiro.de.lng}`;
  const dest = pend[pend.length - 1]; const wps = pend.slice(0, -1).map(c => `${c.lat},${c.lng}`).join('|');
  return `https://www.google.com/maps/dir/?api=1&origin=${origem}&destination=${dest.lat},${dest.lng}${wps ? '&waypoints=' + encodeURIComponent(wps) : ''}&travelmode=walking`;
}

/* ---------- mapa (Leaflet + OpenStreetMap) ---------- */
let mapa, camadaPins, camadaExtras, marcadorEu, linhaRota, circuloAcc;
function iniciarMapa() {
  mapa = L.map('mapa', {zoomControl: true, attributionControl: true}).setView(CONFIG.centro, CONFIG.zoom);
  const noite = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19, className: 'tiles-noite', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'});
  const ruas = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'});
  const satelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {maxZoom: 19, attribution: 'Imagens &copy; Esri'});
  noite.addTo(mapa);
  L.control.layers({'Noite': noite, 'Ruas': ruas, 'Satélite': satelite}, null, {position: 'topright'}).addTo(mapa);
  camadaPins = L.layerGroup().addTo(mapa); camadaExtras = L.layerGroup().addTo(mapa);
  mapa.on('click', e => toqueMapa(e.latlng));
  setTimeout(() => mapa.invalidateSize(), 300);
}
function iconePin(c, extra) {
  const cls = ['pin', visitadas.has(c.id) ? 'visitada' : '', abertaAgora(c) ? '' : 'fechada', extra.atual ? 'atual' : '', extra.ordem ? 'ordem' : ''].filter(Boolean).join(' ');
  return L.divIcon({className: 'pin-wrap', iconSize: [46, 52], iconAnchor: [23, 50], html: `<div class="${cls}" data-ordem="${extra.ordem || ''}">${PIN_SVG}<span class="num">${h(c.numero)}</span></div>`});
}
function iconeMarcador(ic, cls = '') { return L.divIcon({className: 'marcador-wrap', iconSize: [44, 44], iconAnchor: [22, 22], html: `<div class="marcador ${cls}">${ic}</div>`}); }
function renderPins() {
  if (!mapa) return;
  camadaPins.clearLayers();
  const atualIdx = proximaParada(); const atualId = atualIdx >= 0 ? roteiro.ordem[atualIdx] : null;
  const ordemDe = {}; if (roteiro) roteiro.ordem.forEach((id, i) => { if (!visitadas.has(id)) ordemDe[id] = i + 1; });
  const vis = casas.filter(c => typeof c.lat === 'number' && filtrada(c));
  vis.forEach(c => { const m = L.marker([c.lat, c.lng], {icon: iconePin(c, {atual: c.id === atualId, ordem: ordemDe[c.id]}), title: nomeCasaTxt(c), zIndexOffset: c.id === atualId ? 1000 : 0}); m.on('click', () => { if (modo) return; abrirFolha(c.id); }); camadaPins.addLayer(m); });
  camadaExtras.clearLayers();
  if (evento.portaria) camadaExtras.addLayer(L.marker([evento.portaria.lat, evento.portaria.lng], {icon: iconeMarcador(IC.porta), title: 'Portaria', interactive: false}));
  if (pinCasa) camadaExtras.addLayer(L.marker([pinCasa.lat, pinCasa.lng], {icon: iconeMarcador(IC.casa, 'pin-temp'), interactive: false}));
  if (roteiro) {
    const pts = [[roteiro.de.lat, roteiro.de.lng]].concat(roteiro.ordem.map(casaPorId).filter(Boolean).map(c => [c.lat, c.lng]));
    if (pts.length > 1) camadaExtras.addLayer(L.polyline(pts, {color: '#8df06a', weight: 3, dashArray: '6 8', opacity: .8}));
  }
  const vazio = $('#mapa-vazio');
  $('#btn-ir-participar').hidden = !casas.length;
  if (!casas.length) vazio.innerHTML = `<div class="cartao vazio vazio-casas">${PUMPKIN_BIG}<h3>Nenhuma abóbora acesa ainda</h3><p>As casas participantes aparecem aqui assim que os moradores se cadastram. Que tal começar pela sua?</p><button class="btn btn-primario" data-ir="participar">Cadastrar minha casa</button></div>`;
  else if (!vis.length) vazio.innerHTML = `<p class="vazio">Nenhuma casa passa nos filtros escolhidos.</p>`; else vazio.innerHTML = '';
}
function verTodas() { const pts = casas.filter(c => typeof c.lat === 'number').map(c => [c.lat, c.lng]); if (posicao) pts.push([posicao.lat, posicao.lng]); if (evento.portaria) pts.push([evento.portaria.lat, evento.portaria.lng]); if (pts.length) mapa.fitBounds(pts, {padding: [40, 40], maxZoom: 18}); }

/* ---------- GPS ---------- */
let gpsWatch = null, gpsCentrado = false;
function ligarGPS(centrar) {
  const st = $('#gps-status');
  if (!('geolocation' in navigator)) { st.textContent = 'Este aparelho não tem GPS disponível.'; st.className = 'gps-status erro'; return; }
  if (gpsWatch != null) { if (centrar && posicao) mapa.setView([posicao.lat, posicao.lng], Math.max(mapa.getZoom(), 17)); return; }
  st.textContent = 'Procurando satélites…'; st.className = 'gps-status';
  gpsWatch = navigator.geolocation.watchPosition(p => {
    posicao = {lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy, heading: p.coords.heading, t: Date.now()};
    if (posicao.heading != null && !Number.isNaN(posicao.heading) && p.coords.speed > 0.7) rumo = posicao.heading;
    st.textContent = `GPS ativo · precisão ${Math.round(posicao.acc)} m`; st.className = 'gps-status ok';
    if (!marcadorEu) { marcadorEu = L.marker([posicao.lat, posicao.lng], {icon: L.divIcon({className: 'eu-wrap', iconSize: [26, 26], iconAnchor: [13, 13], html: '<div class="eu"><i></i><b></b></div>'}), interactive: false, zIndexOffset: 2000}).addTo(mapa); circuloAcc = L.circle([posicao.lat, posicao.lng], {radius: posicao.acc, color: '#8df06a', weight: 1, fillOpacity: .08, interactive: false}).addTo(mapa); }
    else { marcadorEu.setLatLng([posicao.lat, posicao.lng]); circuloAcc.setLatLng([posicao.lat, posicao.lng]).setRadius(posicao.acc); }
    atualizarRumoVisual();
    if ((centrar && !gpsCentrado) || modoSeguir) { mapa.setView([posicao.lat, posicao.lng], Math.max(mapa.getZoom(), 17)); gpsCentrado = true; }
    aoMoverGPS(); renderPartida(); if (!$('#guia').hidden) renderGuia();
  }, e => { st.textContent = e.code === 1 ? 'Permissão de localização negada. Libere nas configurações do navegador.' : 'Não consegui pegar sua posição agora.'; st.className = 'gps-status erro'; gpsWatch = null; }, {enableHighAccuracy: true, maximumAge: 3000, timeout: 20000});
  ligarBussola();
}
let modoSeguir = false;
function atualizarRumoVisual() { if (!marcadorEu) return; const el = marcadorEu.getElement()?.querySelector('.eu'); if (!el) return; el.classList.toggle('com-rumo', rumo != null); if (rumo != null) el.style.setProperty('--rumo', rumo + 'deg'); }
let bussolaOk = false;
function ligarBussola() {
  if (bussolaOk) return;
  const ouvir = () => { window.addEventListener('deviceorientationabsolute', aoOrientar, true); window.addEventListener('deviceorientation', aoOrientar, true); bussolaOk = true; };
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') DeviceOrientationEvent.requestPermission().then(r => { if (r === 'granted') ouvir(); }).catch(() => {});
  else ouvir();
}
function aoOrientar(e) { let r = null; if (typeof e.webkitCompassHeading === 'number') r = e.webkitCompassHeading; else if (e.absolute && typeof e.alpha === 'number') r = (360 - e.alpha) % 360; if (r != null && !Number.isNaN(r)) { rumo = r; atualizarRumoVisual(); } }

/* ---------- roteiro ---------- */
function pontoPartida() {
  if (partida === 'portaria' && evento.portaria) return {p: evento.portaria, nome: 'a portaria'};
  if (partida.startsWith('casa:')) { const c = casaPorId(partida.slice(5)); if (c) return {p: {lat: c.lat, lng: c.lng}, nome: nomeCasaFala(c)}; }
  if (posicao) return {p: {lat: posicao.lat, lng: posicao.lng}, nome: 'onde você está'};
  if (evento.portaria) return {p: evento.portaria, nome: 'a portaria'};
  return null;
}
function otimizar(de, lista) {
  if (!lista.length) return [];
  const resto = lista.slice(); const ordem = []; let atual = de;
  while (resto.length) { let bi = 0, bd = Infinity; resto.forEach((c, i) => { const d = distM(atual, c); if (d < bd) { bd = d; bi = i; } }); atual = resto[bi]; ordem.push(atual); resto.splice(bi, 1); }
  const pts = [de, ...ordem]; const n = pts.length; let melhorou = true, iter = 0; const custo = (i, j) => distM(pts[i], pts[j]);
  while (melhorou && iter++ < 80) { melhorou = false; for (let i = 1; i < n - 1; i++) for (let j = i + 1; j < n; j++) { const antes = custo(i - 1, i) + (j < n - 1 ? custo(j, j + 1) : 0); const depois = custo(i - 1, j) + (j < n - 1 ? custo(i, j + 1) : 0); if (depois + 1e-6 < antes) { const seg = pts.slice(i, j + 1).reverse(); pts.splice(i, seg.length, ...seg); melhorou = true; } } }
  return pts.slice(1).map(c => c.id);
}
function montarRoteiro() {
  if (partida === 'gps' && !posicao) { ligarGPS(true); toast('Ligando o GPS… toque de novo em alguns segundos, ou escolha a portaria.'); return; }
  const pp = pontoPartida(); if (!pp) { toast('Sem ponto de partida: ligue o GPS ou peça ao organizador para marcar a portaria.'); return; }
  let lista = casas.filter(c => typeof c.lat === 'number' && 'casa:' + c.id !== partida);
  if ($('#opt-pular-visitadas').checked) lista = lista.filter(c => !visitadas.has(c.id));
  if ($('#opt-so-abertas').checked) lista = lista.filter(abertaAgora);
  if (!lista.length) { toast('Nenhuma casa para incluir com esses filtros.'); return; }
  roteiro = {ordem: otimizar(pp.p, lista), de: pp.p, criado: Date.now()}; ls.set('hw.roteiro', roteiro); anunciadoChegada = null; ultimaFalaDist = 0;
  SFX.sucesso(); renderRoteiro(); renderPins(); renderPlacar();
  const n = roteiro.ordem.length; toast(`Roteiro com ${n} casa${n > 1 ? 's' : ''} pronto!`);
  if (vozAuto) { const idx = proximaParada(); falar(`Roteiro montado com ${n} casa${n > 1 ? 's' : ''}, saindo de ${pp.nome}. ` + (idx >= 0 ? falaParada(idx) : '')); }
  $('#guia')?.scrollIntoView({behavior: reduzMovimento ? 'auto' : 'smooth', block: 'start'});
}
function proximaParada() { if (!roteiro) return -1; return roteiro.ordem.findIndex(id => !visitadas.has(id) && casaPorId(id)); }
function origemAtual(idx) { if (posicao && Date.now() - posicao.t < 60000) return {lat: posicao.lat, lng: posicao.lng}; for (let i = idx - 1; i >= 0; i--) { const c = casaPorId(roteiro.ordem[i]); if (c) return {lat: c.lat, lng: c.lng}; } return roteiro.de; }
function falaParada(idx) {
  const c = casaPorId(roteiro.ordem[idx]); if (!c) return '';
  const de = origemAtual(idx); const d = distM(de, c);
  const ofer = (c.oferece || []).map(k => rotuloDe(OFERECE, k).toLowerCase());
  const avisos = (c.flags || []).filter(k => k !== 'pequenos').map(k => ({cachorro: 'tem cachorro', alergia: 'tem opção sem açúcar', assustadora: 'é bem assustadora'}[k])).filter(Boolean);
  let s = `Parada ${idx + 1} de ${roteiro.ordem.length}: ${nomeCasaFala(c)}${c.familia ? ', ' + c.familia : ''}. Fica a uns ${falaM(d)}, ${direcaoFala(de, c)}. `;
  if (ofer.length) s += `Oferece ${listaFala(ofer)}. `;
  if (avisos.length) s += `Atenção: ${listaFala(avisos)}. `;
  if ((c.flags || []).includes('pequenos')) s += 'Boa para os pequenos. ';
  if (!abertaAgora(c)) s += `Essa casa abre às ${horario(c).ini}. `;
  if (c.obs) s += c.obs.replace(/\s+/g, ' ').trim() + (/[.!?]$/.test(c.obs.trim()) ? ' ' : '. ');
  return s;
}
let anunciadoChegada = null, ultimaFalaDist = 0, ultimaFalaT = 0;
function aoMoverGPS() {
  if (!roteiro || !posicao) return; const idx = proximaParada(); if (idx < 0) return; const c = casaPorId(roteiro.ordem[idx]); const d = distM(posicao, c);
  if (autoChegada && d <= 25 && anunciadoChegada !== c.id) { anunciadoChegada = c.id; SFX.plim(); toast(`Você chegou: ${nomeCasaTxt(c)}!`); if (vozAuto) falar(`Chegou! ${nomeCasaFala(c)}${c.familia ? ', ' + c.familia : ''}. Pegue os doces e toque em Cheguei para a próxima.`); return; }
  if (vozAuto && d > 40 && Math.abs(d - ultimaFalaDist) >= 60 && Date.now() - ultimaFalaT > 25000 && !VOZ.falando) { ultimaFalaDist = d; ultimaFalaT = Date.now(); falar(`Faltam ${falaM(d)}, ${direcaoFala(posicao, c)}.`); }
}
function marcarVisitada(id, sim = true) { if (sim) visitadas.add(id); else visitadas.delete(id); ls.set('hw.visitadas', [...visitadas]); renderRoteiro(); renderPins(); renderPlacar(); }
function cheguei() {
  const idx = proximaParada(); if (idx < 0) return; marcarVisitada(roteiro.ordem[idx], true); SFX.sucesso(); anunciadoChegada = null; ultimaFalaDist = 0;
  const b = $('#btn-cheguei'); const r = b.getBoundingClientRect(); explodir(r.left + r.width / 2, r.top + r.height / 2);
  const prox = proximaParada();
  if (prox < 0) { toast('Roteiro concluído! Feliz Halloween!'); if (vozAuto) falar('Última casa visitada. Roteiro concluído! Feliz Halloween, e cuidado com os fantasmas no caminho de volta.'); }
  else if (vozAuto) falar('Boa! ' + falaParada(prox));
}
function pularParada() { const idx = proximaParada(); if (idx < 0) return; const id = roteiro.ordem.splice(idx, 1)[0]; roteiro.ordem.push(id); ls.set('hw.roteiro', roteiro); SFX.pop(); anunciadoChegada = null; renderRoteiro(); renderPins(); const prox = proximaParada(); if (prox >= 0 && vozAuto) falar('Pulando. ' + falaParada(prox)); }

/* ---------- voz ---------- */
const VOZ = {falando: false};
function temVoz() { return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window; }
function vozPT() { try { const vs = speechSynthesis.getVoices(); return vs.find(v => /pt[-_]BR/i.test(v.lang) && /Google|Luciana|Francisca|Natural/i.test(v.name)) || vs.find(v => /pt[-_]BR/i.test(v.lang)) || vs.find(v => /^pt/i.test(v.lang)) || null; } catch { return null; } }
function falar(texto) {
  if (!temVoz()) { toast('Este navegador não tem voz. Leia a parada na tela.'); return; }
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(texto); u.lang = 'pt-BR'; const v = vozPT(); if (v) u.voice = v; u.rate = 1;
    u.onstart = () => { VOZ.falando = true; abaixarMusica(true); $('#painel-roteiro').classList.add('falando'); };
    u.onend = u.onerror = () => { VOZ.falando = false; abaixarMusica(false); $('#painel-roteiro').classList.remove('falando'); };
    speechSynthesis.speak(u); } catch { toast('Não consegui falar agora.'); }
}
if (temVoz()) { try { speechSynthesis.getVoices(); speechSynthesis.addEventListener('voiceschanged', () => {}); } catch {} }

/* ---------- áudio: música procedural + efeitos ---------- */
const AUDIO = {ctx: null, master: null, musicaGain: null, tocando: false, timer: null, proxBatida: 0, passo: 0, ruido: null};
function ctxAudio() {
  if (AUDIO.ctx) { if (AUDIO.ctx.state === 'suspended') AUDIO.ctx.resume(); return AUDIO.ctx; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
  const ctx = new AC(); AUDIO.ctx = ctx; AUDIO.master = ctx.createGain(); AUDIO.master.gain.value = .9; AUDIO.master.connect(ctx.destination);
  AUDIO.musicaGain = ctx.createGain(); AUDIO.musicaGain.gain.value = 0; AUDIO.musicaGain.connect(AUDIO.master); return ctx;
}
const nota = n => 440 * Math.pow(2, (n - 69) / 12);
const BAIXO = [40, 40, 43, 40, 38, 38, 43, 47], ACORDES = [[52, 55, 59], [48, 52, 55], [50, 54, 57], [47, 51, 54]];
const MELODIA = [64, 67, 71, 70, 67, 64, 63, 64, 71, 74, 76, 74, 71, 67, 63, 64, 64, 67, 71, 74, 76, 79, 76, 74, 71, 70, 71, 67, 64, 63, 64, -1];
const BPM = 96, BATIDA = 60 / BPM;
function tocarTom(t, freq, dur, tipo, ganho, destino, o = {}) {
  const ctx = AUDIO.ctx; const osc = ctx.createOscillator(); const g = ctx.createGain(); osc.type = tipo; osc.frequency.setValueAtTime(freq, t);
  if (o.para) osc.frequency.exponentialRampToValueAtTime(o.para, t + dur);
  if (o.vibrato) { const lfo = ctx.createOscillator(); const lg = ctx.createGain(); lfo.frequency.value = o.vibrato; lg.gain.value = freq * .012; lfo.connect(lg); lg.connect(osc.frequency); lfo.start(t); lfo.stop(t + dur + .05); }
  let saida = osc; if (o.filtro) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.filtro; osc.connect(f); saida = f; }
  saida.connect(g); g.connect(destino); const a = o.ataque ?? .02;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(ganho, t + a); g.gain.setValueAtTime(ganho, t + Math.max(a, dur * .6)); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  osc.start(t); osc.stop(t + dur + .02);
}
function agendarMusica() {
  const ctx = AUDIO.ctx; if (!ctx || !AUDIO.tocando) return;
  while (AUDIO.proxBatida < ctx.currentTime + .4) {
    const t = AUDIO.proxBatida, p = AUDIO.passo, dest = AUDIO.musicaGain;
    tocarTom(t, nota(BAIXO[p % 8]), BATIDA * .95, 'triangle', .22, dest, {filtro: 420, ataque: .01});
    if (p % 2 === 0) ACORDES[Math.floor(p / 2) % 4].forEach(n => { tocarTom(t, nota(n) * 1.003, BATIDA * 1.9, 'sawtooth', .035, dest, {filtro: 900, ataque: .08}); tocarTom(t, nota(n) * .997, BATIDA * 1.9, 'square', .018, dest, {filtro: 700, ataque: .08}); });
    for (let k = 0; k < 2; k++) { const m = MELODIA[(p * 2 + k) % MELODIA.length]; if (m > 0) tocarTom(t + k * BATIDA / 2, nota(m), BATIDA * .55, 'sine', .11, dest, {vibrato: 5.5, ataque: .05}); }
    if (p % 16 === 15) tocarTom(t, nota(88), BATIDA * 2, 'sine', .08, dest, {ataque: .005});
    AUDIO.proxBatida += BATIDA; AUDIO.passo++;
  }
}
function ligarVento() {
  const ctx = AUDIO.ctx; if (AUDIO.ruido) return;
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = buf.getChannelData(0); let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b0 = .997 * b0 + .029 * w; b1 = .985 * b1 + .032 * w; b2 = .95 * b2 + .05 * w; d[i] = (b0 + b1 + b2) * .35; }
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 500; bp.Q.value = .8;
  const lfo = ctx.createOscillator(); const lg = ctx.createGain(); lfo.frequency.value = .11; lg.gain.value = 300; lfo.connect(lg); lg.connect(bp.frequency); lfo.start();
  const g = ctx.createGain(); g.gain.value = .07; src.connect(bp); bp.connect(g); g.connect(AUDIO.musicaGain); src.start(); AUDIO.ruido = src;
}
function alternarMusica(forcar) {
  const ctx = ctxAudio(); if (!ctx) { toast('Seu navegador não permite áudio aqui.'); return; }
  const ligar = forcar ?? !AUDIO.tocando; AUDIO.tocando = ligar; ls.set('hw.musica', ligar);
  const b = $('#btn-musica'); b.setAttribute('aria-pressed', String(ligar)); b.setAttribute('aria-label', ligar ? 'Desligar música de fundo' : 'Ligar música de fundo');
  if (ligar) { ligarVento(); AUDIO.proxBatida = ctx.currentTime + .05; AUDIO.passo = 0; AUDIO.musicaGain.gain.cancelScheduledValues(ctx.currentTime); AUDIO.musicaGain.gain.setTargetAtTime(.55, ctx.currentTime, .4); clearInterval(AUDIO.timer); AUDIO.timer = setInterval(agendarMusica, 120); agendarMusica(); toast('Música ligada. Boo!'); }
  else { AUDIO.musicaGain.gain.setTargetAtTime(0, ctx.currentTime, .3); clearInterval(AUDIO.timer); }
}
function abaixarMusica(sim) { if (!AUDIO.ctx || !AUDIO.tocando) return; AUDIO.musicaGain.gain.setTargetAtTime(sim ? .12 : .55, AUDIO.ctx.currentTime, .25); }
const SFX = {
  pop() { const c = ctxAudio(); if (!c) return; tocarTom(c.currentTime, 520, .09, 'sine', .25, AUDIO.master, {para: 180, ataque: .005}); },
  plim() { const c = ctxAudio(); if (!c) return; tocarTom(c.currentTime, 880, .25, 'sine', .18, AUDIO.master, {ataque: .005}); tocarTom(c.currentTime + .08, 1320, .3, 'sine', .14, AUDIO.master, {ataque: .005}); },
  sucesso() { const c = ctxAudio(); if (!c) return; [523, 659, 784, 1047].forEach((f, i) => tocarTom(c.currentTime + i * .09, f, .3, 'triangle', .18, AUDIO.master, {ataque: .005})); },
  boo() { const c = ctxAudio(); if (!c) return; tocarTom(c.currentTime, 220, .5, 'sawtooth', .14, AUDIO.master, {para: 70, filtro: 600, ataque: .03}); tocarTom(c.currentTime, 330, .5, 'sine', .12, AUDIO.master, {para: 110, vibrato: 7, ataque: .03}); },
  plop() { const c = ctxAudio(); if (!c) return; tocarTom(c.currentTime, 180, .14, 'sine', .25, AUDIO.master, {para: 420, ataque: .003}); },
};
function explodir(x, y, cores = ['#ff8a1f', '#8df06a', '#9b6bff', '#fff3c4']) {
  if (reduzMovimento) return;
  for (let i = 0; i < 12; i++) { const p = document.createElement('span'); p.className = 'particula'; p.style.background = cores[i % cores.length]; p.style.left = x + 'px'; p.style.top = y + 'px'; const ang = Math.random() * Math.PI * 2, d = 50 + Math.random() * 70; document.body.appendChild(p);
    p.animate([{transform: 'translate(-50%,-50%) scale(1)', opacity: 1}, {transform: `translate(${Math.cos(ang) * d - 5}px,${Math.sin(ang) * d + 30 - 5}px) scale(.2)`, opacity: 0}], {duration: 600 + Math.random() * 300, easing: 'cubic-bezier(.2,.8,.3,1)'}).onfinish = () => p.remove(); }
}

/* ---------- render ---------- */
function toast(msg, ms = 2800) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(t._t); t._t = setTimeout(() => { t.hidden = true; }, ms); }
function fmtData(s) { if (!/^\d{4}-\d{2}-\d{2}$/.test(s || '')) return ''; const [, m, d] = s.split('-'); return `${d}/${m}`; }
function renderCabecalho() {
  const partes = [evento.nome || 'Halloween']; if (evento.data) partes.push(fmtData(evento.data)); if (evento.horaInicio && evento.horaFim) partes.push(`${evento.horaInicio}–${evento.horaFim}`);
  $('#sub-evento').textContent = partes.join(' · ') + (evento.avisos ? ` · ${evento.avisos}` : '');
  const av = $('#aviso-dados'); av.hidden = store.modo === 'nuvem'; av.textContent = 'Modo local: as casas ficam só neste aparelho até o organizador ligar o Firebase.';
}
function renderPlacar() {
  const total = casas.length, abertas = casas.filter(abertaAgora).length, vis = casas.filter(c => visitadas.has(c.id)).length;
  $('#placar').innerHTML = `<span class="pill">${IC.casa}<b>${total}</b> casa${total === 1 ? '' : 's'}</span><span class="pill ok">${IC.relogio}<b>${abertas}</b> aberta${abertas === 1 ? '' : 's'} agora</span><span class="pill">${IC.check}<b>${vis}</b> visitada${vis === 1 ? '' : 's'}</span>`;
  const bolha = $('#bolha-roteiro'); const rest = roteiro ? roteiro.ordem.filter(id => !visitadas.has(id) && casaPorId(id)).length : 0; bolha.hidden = !rest; bolha.textContent = rest;
}
function renderFiltros() {
  const defs = [['abertas', IC.relogio, 'Abertas agora'], ['pequenos', IC.crianca, 'Para pequenos'], ['brincadeira', IC.susto, 'Com brincadeira'], ['naoVisitadas', IC.check, 'Não visitadas']];
  $('#filtros').innerHTML = defs.map(([k, ic, r]) => `<button class="chip" data-filtro="${k}" aria-pressed="${!!filtros[k]}">${ic}${r}</button>`).join('');
}
function renderModo() { const av = $('#aviso-modo'); const textos = {casa: 'Toque no mapa exatamente onde fica a casa. Dê zoom para acertar.', portaria: 'Toque no mapa onde fica a portaria.'}; av.hidden = !modo; if (modo) $('#aviso-texto').textContent = textos[modo]; $('#mapa').classList.toggle('marcando', !!modo); }
function cartaoCasa(c, idx) {
  const aberta = abertaAgora(c); const {ini, fim} = horario(c);
  const etq = [`<span class="etq ${aberta ? 'aberta' : 'fechada'}">${IC.relogio}${aberta ? 'Aberta agora' : 'Fora do horário'}${ini && fim ? ` · ${ini}–${fim}` : ''}</span>`]
    .concat((c.oferece || []).map(k => `<span class="etq">${IC.doce}${h(rotuloDe(OFERECE, k))}</span>`))
    .concat((c.flags || []).map(k => `<span class="etq ${k === 'cachorro' || k === 'assustadora' ? 'alerta' : ''}">${k === 'cachorro' ? IC.cachorro : k === 'pequenos' ? IC.crianca : IC.susto}${h(rotuloDe(FLAGS, k))}</span>`));
  const dist = posicao ? `<span class="etq">${IC.navegar}${fmtM(distM(posicao, c))} de você</span>` : '';
  return `<div class="casa-titulo"><div class="num-grande">${h(c.numero)}</div><div><h3>${c.familia ? h(c.familia) : nomeCasa(c)}</h3><div class="end">${c.familia ? nomeCasa(c) : 'Casa participante'}${idx != null ? ` · parada ${idx + 1}` : ''}</div></div></div><div class="etiquetas">${etq.join('')}${dist}</div>${c.obs ? `<p class="obs">“${h(c.obs)}”</p>` : ''}`;
}
function abrirFolha(id) {
  const c = casaPorId(id); if (!c) return; const vis = visitadas.has(id); const l = linksNav(c);
  $('#folha-in').innerHTML = cartaoCasa(c) + `<div class="acoes">
    <a class="btn btn-primario btn-grande" href="${linkPrincipal(c)}" target="_blank" rel="noopener">${IC.navegar} Navegar até aqui (${IOS ? 'Apple Maps' : 'Google Maps'})</a>
    <button class="btn ${vis ? 'btn-fantasma' : 'btn-sucesso'}" data-acao="visitar" data-id="${h(id)}">${IC.check} ${vis ? 'Desmarcar visita' : 'Marcar como visitada'}</button>
    <button class="btn btn-fantasma" data-acao="ouvir" data-id="${h(id)}">${IC.ouvir} Ouvir</button>
    ${podeEditar(c) ? `<button class="btn btn-fantasma" data-acao="editar" data-id="${h(id)}">${IC.editar} Editar</button>` : ''}
  </div><div class="nav-extra">${IOS ? `<a href="${l.google}" target="_blank" rel="noopener">Google Maps</a>` : `<a href="${l.apple}" target="_blank" rel="noopener">Apple Maps</a>`}<a href="${l.waze}" target="_blank" rel="noopener">Waze</a></div>`;
  $('#folha').hidden = false; SFX.plop();
}
function fecharFolha() { $('#folha').hidden = true; }
function renderPartida() {
  const ops = [['gps', IC.alvo, posicao ? 'Onde estou agora (GPS)' : 'Onde estou (GPS)', posicao ? `Precisão ${Math.round(posicao.acc)} m` : 'Liga o GPS do celular']];
  if (evento.portaria) ops.push(['portaria', IC.porta, 'Portaria', 'Ponto de encontro do condomínio']);
  const sel = partida.startsWith('casa:') ? partida : '';
  $('#partida').innerHTML = ops.map(([k, ic, t, s]) => `<button type="button" class="opcao" role="radio" aria-checked="${partida === k}" data-partida="${k}">${ic}<span>${t}<small>${s}</small></span></button>`).join('') +
    (casas.length ? `<label class="opcao" role="radio" aria-checked="${!!sel}" style="cursor:default">${IC.casa}<span style="flex:1">A partir de uma casa<select id="sel-casa" aria-label="Escolher casa de partida" style="margin-top:6px"><option value="">Escolher…</option>${casas.map(c => `<option value="casa:${h(c.id)}" ${sel === 'casa:' + c.id ? 'selected' : ''}>${nomeCasa(c)}${c.familia ? ' · ' + h(c.familia) : ''}</option>`).join('')}</select></span></label>` : '');
}
function renderGuia() {
  const idx = proximaParada(); const guia = $('#guia');
  if (idx >= 0) {
    const c = casaPorId(roteiro.ordem[idx]); const de = origemAtual(idx); const d = distM(de, c);
    $('#guia-n').textContent = `${idx + 1} de ${roteiro.ordem.length}`; $('#guia-dist').textContent = `${fmtM(d)} · ${direcaoFala(de, c)}`;
    $('#guia-casa').innerHTML = cartaoCasa(c); $('#btn-cheguei').disabled = false; $('#btn-pular').disabled = roteiro.ordem.filter(id => !visitadas.has(id)).length < 2; $('#btn-falar').disabled = false;
    const nav = $('#btn-navegar'); nav.href = linkPrincipal(c); nav.removeAttribute('aria-disabled'); nav.innerHTML = `${IC.navegar} Navegar no ${IOS ? 'Apple Maps' : 'Google Maps'}`;
    const l = linksNav(c); $('#nav-extra').innerHTML = (IOS ? `<a href="${l.google}" target="_blank" rel="noopener">Google Maps</a>` : `<a href="${l.apple}" target="_blank" rel="noopener">Apple Maps</a>`) + `<a href="${l.waze}" target="_blank" rel="noopener">Waze</a>`;
  } else {
    $('#guia-n').textContent = 'final'; $('#guia-dist').textContent = ''; $('#guia-casa').innerHTML = `<div class="vazio">${PUMPKIN_BIG}<h3>Roteiro concluído!</h3><p>Sacola cheia? Feliz Halloween!</p></div>`;
    $('#btn-cheguei').disabled = true; $('#btn-pular').disabled = true; $('#btn-falar').disabled = true; const nav = $('#btn-navegar'); nav.setAttribute('aria-disabled', 'true'); nav.removeAttribute('href'); $('#nav-extra').innerHTML = '';
  }
  guia.hidden = false;
}
function renderRoteiro() {
  renderPartida();
  const guia = $('#guia'), lista = $('#lista-roteiro'), tot = $('#roteiro-total'); $('#opt-voz').checked = vozAuto; $('#opt-auto-chegada').checked = autoChegada;
  $('#voz-status').textContent = temVoz() ? 'A voz fala em português, avisa a distância pelo GPS e abaixa a música enquanto guia.' : 'Este navegador não oferece voz; o guia fica só na tela.';
  $('#roteiro-acoes').hidden = !visitadas.size && !roteiro;
  if (!roteiro || !roteiro.ordem.some(id => casaPorId(id))) { guia.hidden = true; lista.innerHTML = ''; tot.textContent = ''; $('#btn-rota-google').hidden = true; return; }
  renderGuia();
  const idx = proximaParada(); let totalM = 0, ant = roteiro.de;
  lista.innerHTML = roteiro.ordem.map((id, i) => { const c = casaPorId(id); if (!c) return ''; const feita = visitadas.has(id); const d = distM(ant, c); totalM += d; ant = c;
    return `<li class="${feita ? 'feita' : ''} ${i === idx ? 'atual' : ''}"><span class="ordem">${i + 1}</span><div class="info"><b>${nomeCasa(c)}${c.familia ? ' · ' + h(c.familia) : ''}</b><span>${(c.oferece || []).map(k => rotuloDe(OFERECE, k)).join(', ') || 'Sem detalhes'} · ${fmtM(d)}</span></div><button class="btn btn-icone vis" data-visitar="${h(id)}" aria-pressed="${feita}" aria-label="${feita ? 'Desmarcar' : 'Marcar visitada'}: ${h(nomeCasaTxt(c))}">${IC.check}</button><button class="btn btn-icone" data-ver="${h(id)}" aria-label="Ver detalhes">${IC.casa}</button></li>`; }).join('');
  tot.textContent = `Percurso total em linha reta: cerca de ${fmtM(totalM)}.`;
  const lr = linkRotaCompleta(); const br = $('#btn-rota-google'); br.hidden = !lr; if (lr) br.href = lr;
}
function renderParticipar() {
  $('#f-oferece').innerHTML = OFERECE.map(([k, r]) => `<button type="button" class="chip" data-multi="oferece" data-k="${k}" aria-pressed="false">${IC.doce}${r}</button>`).join('');
  $('#f-flags').innerHTML = FLAGS.map(([k, r]) => `<button type="button" class="chip" data-multi="flags" data-k="${k}" aria-pressed="false">${k === 'cachorro' ? IC.cachorro : k === 'pequenos' ? IC.crianca : IC.susto}${r}</button>`).join('');
  atualizarForm();
}
function atualizarForm() {
  $('#btn-enviar-txt').textContent = editandoId ? 'Salvar alterações' : 'Salvar casa no mapa';
  $('#participar-titulo').textContent = editandoId ? 'Editar casa' : 'Cadastrar minha casa';
  $('#btn-cancelar-edicao').hidden = !editandoId;
  const ep = $('#estado-pin'); ep.className = 'estado-pin ' + (pinCasa ? 'ok' : ''); ep.innerHTML = pinCasa ? `${IC.check} Casa marcada no mapa` : `${IC.x} Ainda não marcada`;
}
function lerForm() { const pega = sel => $$(sel + ' .chip[aria-pressed="true"]').map(b => b.dataset.k); return {rua: $('#f-rua').value.trim().slice(0, 60), numero: $('#f-numero').value.trim().slice(0, 20), familia: $('#f-familia').value.trim().slice(0, 60), oferece: pega('#f-oferece'), flags: pega('#f-flags'), horaInicio: $('#f-hi').value, horaFim: $('#f-hf').value, obs: $('#f-obs').value.trim().slice(0, 240), lat: pinCasa?.lat, lng: pinCasa?.lng}; }
function preencherForm(c) {
  $('#f-rua').value = c.rua || ''; $('#f-numero').value = c.numero || ''; $('#f-familia').value = c.familia || ''; $('#f-hi').value = c.horaInicio || ''; $('#f-hf').value = c.horaFim || ''; $('#f-obs').value = c.obs || '';
  $$('#f-oferece .chip').forEach(b => b.setAttribute('aria-pressed', String((c.oferece || []).includes(b.dataset.k))));
  $$('#f-flags .chip').forEach(b => b.setAttribute('aria-pressed', String((c.flags || []).includes(b.dataset.k))));
  pinCasa = typeof c.lat === 'number' ? {lat: c.lat, lng: c.lng} : null; atualizarForm(); renderPins();
}
function limparForm() { editandoId = null; pinCasa = null; preencherForm({}); $('#form-erro').hidden = true; }
function renderOrganizador() {
  if (!organizador) return;
  $('#c-nome').value = evento.nome || ''; $('#c-data').value = evento.data || ''; $('#c-zap').value = evento.whatsapp || ''; $('#c-hi').value = evento.horaInicio || ''; $('#c-hf').value = evento.horaFim || ''; $('#c-avisos').value = evento.avisos || '';
  $('#portaria-status').textContent = evento.portaria ? 'Portaria marcada no mapa.' : 'Portaria ainda não marcada: ela vira o ponto de partida de quem está sem GPS.';
  $('#total-casas').textContent = casas.length;
  $('#lista-casas').innerHTML = casas.length ? casas.slice().sort((a, b) => (a.rua || '').localeCompare(b.rua || '') || String(a.numero).localeCompare(String(b.numero), 'pt', {numeric: true})).map(c => `<li><div class="info"><b>${nomeCasa(c)}${c.familia ? ' · ' + h(c.familia) : ''}</b><span>${(c.oferece || []).map(k => rotuloDe(OFERECE, k)).join(', ') || 'Sem detalhes'}</span></div><div class="acoes"><button class="btn btn-p btn-fantasma" data-editar="${h(c.id)}">${IC.editar} Editar</button><button class="btn btn-p btn-fantasma" data-excluir="${h(c.id)}">${IC.lixo} Excluir</button></div></li>`).join('') : '<li><div class="info"><span>Nenhuma casa ainda.</span></div></li>';
}
function renderOrganizadorVisivel() { $('#aba-organizador').hidden = !organizador; }
function renderConta() {
  const b = $('#btn-conta'); const nuvem = store.modo === 'nuvem'; b.hidden = !nuvem; if (!nuvem) return;
  if (usuario) { const ini = (usuario.nome || usuario.email || '?').trim().charAt(0).toUpperCase(); b.innerHTML = `<span class="avatar">${h(ini)}</span>`; b.setAttribute('aria-label', `Conectado como ${usuario.nome || usuario.email}. Toque para sair.`); b.title = 'Sair'; b.classList.add('logado'); }
  else { b.innerHTML = `${IC.google}<span>Entrar</span>`; b.setAttribute('aria-label', 'Entrar com Google'); b.title = 'Entrar com Google'; b.classList.remove('logado'); }
}
function atualizarParticipar() {
  const precisaLogin = store.modo === 'nuvem' && !usuario;
  $('#gate-login').hidden = !precisaLogin; $('#form-casa').hidden = precisaLogin;
  if (precisaLogin) { $('#participar-intro').textContent = 'Para colocar sua casa no mapa, entre com sua conta Google. Assim só você consegue mexer nela.'; return; }
  $('#participar-intro').textContent = organizador ? 'Você é organizador: pode cadastrar e editar qualquer casa.' : 'Marque a casa no mapa (ou use o GPS na porta) e conte o que vai rolar.';
  if (store.modo === 'nuvem' && !editandoId && !jaAbriuMinhaCasa) { const minha = casaPorId(usuario.uid); if (minha) { jaAbriuMinhaCasa = true; editandoId = minha.id; preencherForm(minha); } }
}
function irAba(nome) {
  if (nome === 'organizador' && !organizador) nome = 'mapa';
  abaAtual = nome; ls.set('hw.aba', nome);
  ['mapa', 'roteiro', 'participar', 'organizador'].forEach(a => { const p = $('#painel-' + a); p.hidden = a !== nome; if (a === nome) { p.style.animation = 'none'; void p.offsetWidth; p.style.animation = ''; } $('#aba-' + a).setAttribute('aria-current', a === nome ? 'page' : 'false'); });
  if (nome === 'mapa') setTimeout(() => mapa && mapa.invalidateSize(), 50);
  if (nome === 'roteiro') renderRoteiro(); if (nome === 'organizador') renderOrganizador(); if (nome === 'participar') atualizarParticipar();
  window.scrollTo({top: 0, behavior: 'auto'});
}

/* ---------- toque no mapa ---------- */
async function toqueMapa(ll) {
  if (!modo) return; const p = {lat: +ll.lat.toFixed(6), lng: +ll.lng.toFixed(6)}; SFX.plop();
  if (modo === 'casa') { pinCasa = p; modo = null; renderModo(); renderPins(); atualizarForm(); irAba('participar'); toast('Casa marcada! Agora é só salvar.'); return; }
  if (modo === 'portaria') { modo = null; renderModo(); await salvarSeguro(() => store.salvarEvento({portaria: p}), 'Portaria marcada!'); irAba('organizador'); }
}
async function salvarSeguro(fn, msg) {
  const tela = document.createElement('div'); tela.className = 'salvando'; tela.innerHTML = `${IC.carregando}<div>Gravando no caldeirão…</div>`; document.body.appendChild(tela);
  try { await fn(); toast(msg); SFX.sucesso(); return true; }
  catch (e) { console.error(e); toast(e && /permission/i.test(String(e.message || e.code)) ? 'Sem permissão para isso. Só o dono da casa ou um organizador pode mexer.' : 'Não consegui salvar agora. Tente de novo.', 5000); return false; }
  finally { tela.remove(); }
}

/* ---------- eventos ---------- */
function ligarEventos() {
  document.addEventListener('pointerdown', e => { const b = e.target.closest('.btn, .aba, .chip, .opcao'); if (!b) return; ctxAudio(); SFX.pop(); if (!reduzMovimento && b.classList.contains('btn')) { b.classList.remove('tremendo'); void b.offsetWidth; b.classList.add('tremendo'); } }, {passive: true});
  document.addEventListener('click', e => { const b = e.target.closest('.btn-primario, .btn-sucesso'); if (b && !b.disabled) { const r = b.getBoundingClientRect(); explodir(e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2); } });
  $('#btn-musica').addEventListener('click', () => alternarMusica());
  $$('.aba').forEach(b => b.addEventListener('click', () => irAba(b.dataset.aba)));
  $('#filtros').addEventListener('click', e => { const c = e.target.closest('.chip'); if (!c) return; filtros[c.dataset.filtro] = !filtros[c.dataset.filtro]; ls.set('hw.filtros', filtros); renderFiltros(); renderPins(); });
  $('#aviso-cancelar').addEventListener('click', () => { modo = null; renderModo(); if (modoVoltar !== 'mapa') irAba(modoVoltar); modoVoltar = 'mapa'; });
  $('#btn-centrar').addEventListener('click', () => { modoSeguir = !modoSeguir; $('#btn-centrar').setAttribute('aria-pressed', String(modoSeguir)); ligarGPS(true); if (modoSeguir) toast('Seguindo você no mapa.'); });
  mapa.on('dragstart', () => { modoSeguir = false; $('#btn-centrar').setAttribute('aria-pressed', 'false'); });
  $('#btn-ver-todas').addEventListener('click', verTodas);
  $('#btn-ir-roteiro').addEventListener('click', () => irAba('roteiro'));
  $('#btn-ir-participar').addEventListener('click', () => irAba('participar'));
  $('#mapa-vazio').addEventListener('click', e => { const b = e.target.closest('[data-ir]'); if (b) irAba(b.dataset.ir); });
  $('#folha').addEventListener('click', e => { if (e.target === e.currentTarget) fecharFolha(); const b = e.target.closest('[data-acao]'); if (!b) return; const id = b.dataset.id; const a = b.dataset.acao;
    if (a === 'visitar') { const v = !visitadas.has(id); marcarVisitada(id, v); if (v) SFX.sucesso(); fecharFolha(); if (v && roteiro && vozAuto && roteiro.ordem.includes(id)) { const p = proximaParada(); if (p >= 0) falar('Boa! ' + falaParada(p)); } }
    if (a === 'ouvir') { const c = casaPorId(id); if (!c) return; const i = roteiro ? roteiro.ordem.indexOf(id) : -1; falar(i >= 0 ? falaParada(i) : `${nomeCasaFala(c)}${c.familia ? ', ' + c.familia : ''}. ${posicao ? 'Fica a uns ' + falaM(distM(posicao, c)) + ', ' + direcaoFala(posicao, c) + '. ' : ''}${(c.oferece || []).length ? 'Oferece ' + listaFala((c.oferece || []).map(k => rotuloDe(OFERECE, k).toLowerCase())) + '.' : ''} ${c.obs || ''}`); }
    if (a === 'editar') { const c = casaPorId(id); fecharFolha(); editandoId = id; preencherForm(c); irAba('participar'); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { fecharFolha(); if (modo) { modo = null; renderModo(); } } });

  // roteiro
  $('#partida').addEventListener('click', e => { const b = e.target.closest('[data-partida]'); if (!b) return; partida = b.dataset.partida; ls.set('hw.partida', partida); if (partida === 'gps') ligarGPS(false); renderPartida(); });
  $('#partida').addEventListener('change', e => { if (e.target.id === 'sel-casa' && e.target.value) { partida = e.target.value; ls.set('hw.partida', partida); renderPartida(); } });
  $('#btn-montar').addEventListener('click', montarRoteiro);
  $('#btn-cheguei').addEventListener('click', cheguei);
  $('#btn-pular').addEventListener('click', pularParada);
  $('#btn-falar').addEventListener('click', () => { const i = proximaParada(); if (i >= 0) falar(falaParada(i)); });
  $('#opt-voz').addEventListener('change', e => { vozAuto = e.target.checked; ls.set('hw.voz', vozAuto); if (vozAuto) falar('Guia por voz ligado. Vamos caçar doces!'); else { try { speechSynthesis.cancel(); } catch {} } });
  $('#opt-auto-chegada').addEventListener('change', e => { autoChegada = e.target.checked; ls.set('hw.autochegada', autoChegada); if (autoChegada) ligarGPS(false); });
  $('#lista-roteiro').addEventListener('click', e => { const v = e.target.closest('[data-visitar]'); if (v) { const id = v.dataset.visitar; const sim = !visitadas.has(id); marcarVisitada(id, sim); if (sim) SFX.sucesso(); return; } const ver = e.target.closest('[data-ver]'); if (ver) abrirFolha(ver.dataset.ver); });
  $('#btn-limpar-visitas').addEventListener('click', () => { visitadas = new Set(); ls.set('hw.visitadas', []); renderRoteiro(); renderPins(); renderPlacar(); toast('Casas visitadas zeradas.'); });

  // participar
  $('#form-casa').addEventListener('click', e => { const c = e.target.closest('.chip[data-multi]'); if (c) c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true')); });
  $('#btn-marcar-casa').addEventListener('click', () => { modo = 'casa'; modoVoltar = 'participar'; irAba('mapa'); renderModo(); if (pinCasa) mapa.setView([pinCasa.lat, pinCasa.lng], 18); else if (posicao) mapa.setView([posicao.lat, posicao.lng], 18); $('#mapa').scrollIntoView({behavior: 'smooth', block: 'center'}); });
  $('#btn-usar-gps').addEventListener('click', () => {
    if (!('geolocation' in navigator)) { toast('Sem GPS neste aparelho. Marque no mapa.'); return; }
    toast('Pegando sua posição…'); navigator.geolocation.getCurrentPosition(p => { pinCasa = {lat: +p.coords.latitude.toFixed(6), lng: +p.coords.longitude.toFixed(6)}; atualizarForm(); renderPins(); SFX.plim(); toast(`Posição marcada (precisão ${Math.round(p.coords.accuracy)} m). Se não estiver na porta de casa, ajuste no mapa.`, 4000); }, () => toast('Não consegui pegar o GPS. Marque no mapa.'), {enableHighAccuracy: true, timeout: 15000, maximumAge: 0});
  });
  $('#btn-cancelar-edicao').addEventListener('click', limparForm);
  $('#form-casa').addEventListener('submit', async e => {
    e.preventDefault(); const d = lerForm(); const erro = $('#form-erro');
    if (!d.numero) { erro.textContent = 'Informe o número ou lote da casa.'; erro.hidden = false; $('#f-numero').focus(); return; }
    if (typeof d.lat !== 'number') { erro.textContent = 'Marque a casa no mapa (ou use o GPS) antes de salvar.'; erro.hidden = false; return; }
    erro.hidden = true;
    if (store.modo === 'nuvem' && !usuario) { toast('Entre com Google para salvar sua casa.'); store.entrar(); return; }
    const antiga = editandoId ? casaPorId(editandoId) : null;
    if (antiga && !podeEditar(antiga)) { toast('Só quem cadastrou ou o organizador pode editar esta casa.'); return; }
    const novoIdCasa = store.modo === 'nuvem' && !organizador ? usuario.uid : novoId();
    const casa = {id: editandoId || novoIdCasa, ...d, uid: antiga ? antiga.uid : meuUid(), criadoEm: antiga ? antiga.criadoEm : Date.now(), atualizadoEm: Date.now()};
    const ok = await salvarSeguro(() => store.salvarCasa(casa), editandoId ? 'Casa atualizada!' : 'Casa no mapa! Boa caçada.');
    if (ok) { limparForm(); irAba('mapa'); mapa.setView([casa.lat, casa.lng], 18); }
  });

  // organizador
  $('#btn-conta').addEventListener('click', async () => {
    if (!usuario) { store.entrar(); return; }
    const b = $('#btn-conta');
    if (b.dataset.confirma) { delete b.dataset.confirma; editandoId = null; jaAbriuMinhaCasa = false; limparForm(); await store.sair(); toast('Você saiu. Até a próxima assombração!'); return; }
    b.dataset.confirma = '1'; b.innerHTML = '<span>Sair?</span>'; SFX.boo(); setTimeout(() => { if (b.dataset.confirma) { delete b.dataset.confirma; renderConta(); } }, 3500);
  });
  $('#btn-entrar-google').addEventListener('click', () => store.entrar());
  $('#btn-salvar-config').addEventListener('click', () => salvarSeguro(() => store.salvarEvento({nome: $('#c-nome').value.trim().slice(0, 80), data: $('#c-data').value, whatsapp: $('#c-zap').value.trim().slice(0, 30), horaInicio: $('#c-hi').value, horaFim: $('#c-hf').value, avisos: $('#c-avisos').value.trim().slice(0, 160)}), 'Evento salvo!'));
  $('#btn-marcar-portaria').addEventListener('click', () => { modo = 'portaria'; modoVoltar = 'organizador'; irAba('mapa'); renderModo(); });
  $('#lista-casas').addEventListener('click', e => {
    const ed = e.target.closest('[data-editar]'); if (ed) { editandoId = ed.dataset.editar; preencherForm(casaPorId(editandoId)); irAba('participar'); return; }
    const ex = e.target.closest('[data-excluir]'); if (!ex) return;
    if (ex.dataset.confirma) { salvarSeguro(() => store.excluirCasa(ex.dataset.excluir), 'Casa excluída.'); return; }
    ex.dataset.confirma = '1'; ex.className = 'btn btn-p btn-perigo'; ex.innerHTML = `${IC.lixo} Confirmar exclusão`; SFX.boo();
    setTimeout(() => { if (ex.isConnected) { delete ex.dataset.confirma; ex.className = 'btn btn-p btn-fantasma'; ex.innerHTML = `${IC.lixo} Excluir`; } }, 4000);
  });
  $('#btn-exportar').addEventListener('click', () => { const blob = new Blob([JSON.stringify({evento, casas}, null, 2)], {type: 'application/json'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `halloween-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); });
  $('#c-importar').addEventListener('change', async e => {
    const f = e.target.files[0]; if (!f) return; const msg = $('#import-msg');
    try { const d = JSON.parse(await f.text()); const lista = Array.isArray(d.casas) ? d.casas : []; let n = 0; for (const c of lista) { if (c && typeof c.lat === 'number' && typeof c.lng === 'number' && c.numero != null) { await store.salvarCasa({...c, id: /^[A-Za-z0-9_-]{1,128}$/.test(c.id || '') ? c.id : novoId(), uid: c.uid || meuUid()}); n++; } } if (d.evento) { const {nome, data, horaInicio, horaFim, whatsapp, avisos, portaria} = d.evento; await store.salvarEvento({nome: String(nome || '').slice(0, 80), data: String(data || '').slice(0, 10), horaInicio: horaInicio || '', horaFim: horaFim || '', whatsapp: String(whatsapp || '').slice(0, 30), avisos: String(avisos || '').slice(0, 160), portaria: portaria && typeof portaria.lat === 'number' ? {lat: portaria.lat, lng: portaria.lng} : null}); } msg.textContent = `${n} casa${n === 1 ? '' : 's'} importada${n === 1 ? '' : 's'}.`; msg.className = 'ok-msg'; SFX.sucesso(); }
    catch (err) { console.error(err); msg.textContent = 'Arquivo inválido.'; msg.className = 'erro-msg'; }
    e.target.value = '';
  });
  setInterval(renderPlacar, 60000);
}

/* ---------- início ---------- */
function aplicarNome() { const partes = String(CONFIG.nomeApp || 'Rota Assombrada').trim().split(' '); const ult = partes.pop(); $('.titulo').innerHTML = `${h(partes.join(' '))} <span>${h(ult)}</span>`; document.title = CONFIG.nomeApp || 'Rota Assombrada'; }
async function iniciar() {
  aplicarNome(); iniciarMapa(); ligarEventos(); renderFiltros(); renderParticipar(); renderModo(); renderCabecalho(); renderPlacar(); renderRoteiro();
  renderOrganizadorVisivel(); irAba(abaAtual);
  await store.init();
  renderConta(); atualizarParticipar(); if (store.modo === 'local') { organizador = true; renderOrganizadorVisivel(); }
  if (casas.length) verTodas();
  if (partida === 'gps' || autoChegada) ligarGPS(!casas.length);
  if (ls.get('hw.musica', false)) toast('Toque no alto-falante para religar a música.', 3500);
}
iniciar();
