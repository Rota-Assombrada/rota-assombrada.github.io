import CONFIG from './config.js?v=87';

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
  pessoa: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
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
  copiar: svg('<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),
  google: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z"/></svg>',
};
// Setas do modo caminhada, pelo "modifier" da manobra do roteador. A bússola aponta para a casa no mapa (norte para cima).
const SETA = {
  straight: svg('<path d="M12 20V4M6 10l6-6 6 6"/>'),
  left: svg('<path d="M17 21v-8a4 4 0 0 0-4-4H5"/><path d="M9 5L5 9l4 4"/>'),
  right: svg('<path d="M7 21v-8a4 4 0 0 1 4-4h8"/><path d="M15 5l4 4-4 4"/>'),
  'slight left': svg('<path d="M15 21v-7L8 7"/><path d="M8 13V7h6"/>'),
  'slight right': svg('<path d="M9 21v-7l7-7"/><path d="M16 13V7h-6"/>'),
  'sharp left': svg('<path d="M16 21V5L6 15"/><path d="M6 9v6h6"/>'),
  'sharp right': svg('<path d="M8 21V5l10 10"/><path d="M18 9v6h-6"/>'),
  uturn: svg('<path d="M8 21V9a5 5 0 0 1 10 0v6"/><path d="M14 11l4 4 4-4"/>'),
  arrive: svg('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
  festa: svg('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'),
  bussola: g => svg(`<circle cx="12" cy="12" r="9.5"/><g transform="rotate(${g} 12 12)"><path d="M12 4.5l3 7.5H9z" fill="currentColor"/><path d="M12 19.5L9 12h6z"/></g>`),
};
const PIN_SVG = `<svg viewBox="0 0 46 52" aria-hidden="true"><path d="M23 50c-2-6-6-9-6-9h12s-4 3-6 9z" fill="#2a0d00"/><path d="M22 6c2 1 3 4 3 7" stroke="#4f7a24" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M25 8c4-3 9-2 11 1-4 2-8 2-11-1z" fill="#6fa83a"/><ellipse class="corpo" cx="12" cy="26" rx="10" ry="16" fill="#ff8a1f"/><ellipse class="corpo" cx="34" cy="26" rx="10" ry="16" fill="#ff8a1f"/><ellipse class="corpo" cx="23" cy="26" rx="15" ry="17" fill="#ff8a1f"/></svg>`;
const PUMPKIN_BIG = `<div class="vazio-cena"><svg class="abobora-vazia" viewBox="0 0 120 112" aria-hidden="true"><ellipse cx="60" cy="106" rx="40" ry="5" fill="#000" opacity=".35"/><path d="M59 26c-1-9 2-16 8-20" stroke="#4f7a24" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M66 12c9-7 20-5 25 2-9 4-17 4-25-2z" fill="#6fa83a"/><path d="M70 14c-4 6-3 12 2 16" stroke="#6fa83a" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="33" cy="64" rx="25" ry="38" fill="#e86f0c"/><ellipse cx="87" cy="64" rx="25" ry="38" fill="#e86f0c"/><ellipse cx="60" cy="64" rx="31" ry="41" fill="#ff8a1f"/><ellipse cx="48" cy="44" rx="9" ry="16" fill="#ffb35c" opacity=".55"/><ellipse cx="22" cy="54" rx="5" ry="12" fill="#ffb35c" opacity=".35"/><path d="M44 26q-10 38 0 76M76 26q10 38 0 76" stroke="#c25400" stroke-width="2" fill="none" opacity=".45"/><g class="rosto" fill="#ffd84a"><path d="M30 52l13-14 9 18z"/><path d="M90 52l-13-14-9 18z"/><path d="M60 60l-6 9h12z"/><path d="M26 72q34 30 68 0l-8 3-5 8-7-6-6 8-6-8-6 8-6-8-7 6-5-8z"/></g></svg><span class="fantasminha"><svg viewBox="0 0 40 46" aria-hidden="true"><path d="M20 2C9 2 4 10 4 20v24l5-5 5 5 6-5 6 5 5-5 5 5V20C36 10 31 2 20 2z" fill="currentColor"/><circle cx="14" cy="18" r="3" fill="#1a1428"/><circle cx="26" cy="18" r="3" fill="#1a1428"/><ellipse cx="20" cy="27" rx="3" ry="4" fill="#1a1428"/></svg></span></div>`;

const OFERECE = [['doces','Doces e balas'],['chocolate','Chocolate'],['brincadeira','Brincadeira ou susto'],['decoracao','Casa decorada'],['lembrancinha','Lembrancinha']];
const FLAGS = [['pequenos','Amigável para pequenos'],['cachorro','Tem cachorro'],['alergia','Opção sem açúcar/alergia'],['assustadora','Bem assustadora']];
// Casas sem nome de família ganham um nome divertido, sempre o mesmo para a mesma casa (vem do id dela).
// Ao salvar sem nome, é esse que fica gravado.
const NOMES_DIVERTIDOS = ["Casa do Fantasma Cócegas", "Toca do Morcego Banguela", "Mansão da Abóbora Risonha", "Castelo do Drácula Dorminhoco", "Cripta do Esqueleto Dançarino", "Casa da Bruxa Distraída", "Covil do Lobisomem Fofinho", "Casa do Vampiro Vegetariano", "Toca da Aranha Tricoteira", "Mansão do Fantasma Tímido", "Casa da Múmia Enrolada", "Castelo do Morcego Cantor", "Casa do Zumbi Educado", "Toca do Gato Preto Sortudo", "Casa da Caveira Sorridente", "Mansão do Caldeirão Borbulhante", "Casa do Fantasminha Camarada", "Cripta do Conde Comilão", "Casa da Bruxinha Atrapalhada", "Toca do Lobinho Uivador", "Casa do Monstro Cheiroso", "Castelo da Abóbora Gigante", "Casa do Fantasma Soneca", "Toca do Morcego de Óculos", "Casa da Teia Brilhante", "Mansão do Esqueleto Tossidor", "Casa do Vampiro Banguela", "Toca da Coruja Curiosa", "Casa do Duende Travesso", "Cripta da Múmia Cansada", "Casa do Fantasma Gargalhada", "Castelo do Lobisomem Cabeludo", "Casa da Bruxa do Pirulito", "Toca do Morceguinho Feliz", "Casa do Ogro Dorminhoco", "Mansão da Vassoura Voadora", "Casa do Zumbi Dançarino", "Toca da Aranha Cabeluda", "Casa do Fantasma Sem Lençol", "Castelo do Conde Chocolate", "Casa da Abóbora Banguela", "Cripta do Esqueleto Piadista", "Casa do Monstrinho do Armário", "Toca do Gato de Botas Pretas", "Casa da Bruxa Gulosa", "Mansão do Fantasma Cantor", "Casa do Vampiro Assustado", "Toca do Lobisomem Penteado", "Casa da Caveira Cheirosa", "Castelo do Morcego Acrobata", "Casa do Fantasma Esquecido", "Toca do Sapo Enfeitiçado", "Casa da Poção Colorida", "Mansão do Drácula Desastrado", "Casa do Zumbi Preguiçoso", "Cripta da Abóbora Falante", "Casa do Morcego Doceiro", "Toca da Bruxa Sonolenta", "Casa do Esqueleto Saltitante", "Castelo do Fantasma Bagunceiro", "Casa da Múmia Dançarina", "Toca do Monstro Verde", "Casa do Lobisomem Envergonhado", "Mansão da Aranha Dançarina", "Casa do Vampiro Dentuço", "Toca da Coruja Sabichona", "Casa do Fantasma das Balas", "Castelo da Bruxa Risonha", "Casa do Caldeirão Mágico", "Cripta do Conde Bocejo", "Casa da Abóbora Brilhante", "Toca do Morcego Bagunceiro", "Casa do Esqueleto Friorento", "Mansão do Zumbi Comilão", "Casa da Bruxa do Chapéu Torto", "Toca do Gato Fantasma", "Casa do Fantasma Pipoqueiro", "Castelo do Lobisomem Dançarino", "Casa da Teia Grudenta", "Toca do Duende Doceiro", "Casa do Vampiro Dorminhoco", "Mansão da Caveira Dançarina", "Casa do Monstro Cosquento", "Cripta do Fantasma Assobiador", "Casa da Abóbora Sapeca", "Toca do Morcego Distraído", "Casa do Drácula Docinho", "Castelo da Múmia Mandona", "Casa do Zumbi Cantor", "Toca da Aranha Sorridente", "Casa do Fantasma Pirulito", "Mansão da Bruxa Bondosa", "Casa do Esqueleto Tagarela", "Toca do Lobisomem Dorminhoco", "Casa da Vassoura Preguiçosa", "Castelo do Vampiro Sapeca", "Casa do Morcego Chocolateiro", "Cripta da Abóbora Medrosa", "Casa do Fantasma Arrepio", "Toca do Monstrinho Guloso", "Casa da Bruxa Confeiteira", "Mansão do Conde Cócegas", "Casa do Zumbi Sorridente", "Toca da Caveira Tagarela", "Casa do Lobisomem Doceiro", "Castelo do Fantasma Dançarino", "Casa da Múmia Gulosa", "Toca do Morcego Soneca", "Casa do Esqueleto Comilão", "Mansão da Abóbora Dançarina", "Casa do Vampiro Cantor", "Cripta da Bruxa Esquecida", "Casa do Fantasma Travesso", "Toca do Gato Bruxo", "Casa do Monstro Bocejo", "Castelo da Aranha Doceira", "Casa do Drácula Sapeca", "Toca da Abóbora Risadinha", "Casa do Zumbi Distraído", "Mansão do Morcego Comilão"];
function nomeDivertido(id) { let x = 2166136261; for (const ch of String(id || 'casa')) { x ^= ch.charCodeAt(0); x = Math.imul(x, 16777619) >>> 0; } return NOMES_DIVERTIDOS[x % NOMES_DIVERTIDOS.length]; }
// Aviso e chips de sugestão embaixo do campo do nome: o primeiro é o nome que a casa ganha se ficar vazio.
let nomeAutoDaCasa = '', sugestoesNome = [];
function renderSugestoesNome(novas) {
  const aj = document.getElementById('ajuda-familia'), box = document.getElementById('chips-nome'); if (!aj || !box) return;
  aj.innerHTML = nomeAutoDaCasa ? `Se não preencher, a casa vai se chamar <b>${h(nomeAutoDaCasa)}</b>. Ou escolha uma ideia:` : 'Se não preencher, a casa ganha um nome divertido automático. Ou escolha uma ideia:';
  if (novas || !sugestoesNome.length) {
    const resto = NOMES_DIVERTIDOS.filter(n => n !== nomeAutoDaCasa).sort(() => Math.random() - .5).slice(0, nomeAutoDaCasa ? 3 : 4);
    sugestoesNome = nomeAutoDaCasa ? [nomeAutoDaCasa, ...resto] : resto;
  }
  box.innerHTML = sugestoesNome.map(n => `<button type="button" class="chip chip-nome" data-nome="${h(n)}">${h(n)}</button>`).join('') + '<button type="button" class="chip chip-nome chip-mais" data-mais-nomes>Outras ideias</button>';
}
const rotuloDe = (lista, k) => (lista.find(o => o[0] === k) || [k, k])[1];

/* ---------- métricas e erros (Google Analytics do Firebase) ---------- */
// Só contagens anônimas: nome da tela e da ação, nunca código de condomínio, convite, e-mail ou nome.
const metrica = {an: null, fila: [], erros: 0, vistos: new Set()};
function limparTexto(s) {
  return String(s || '').replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '[email]').replace(/https?:\/\/\S+/g, '[link]')
    .replace(/#[A-Za-z0-9/_-]+/g, '#[rota]').replace(/\b[A-Za-z0-9_-]{20,}\b/g, '[id]').replace(/\s+/g, ' ').trim().slice(0, 100);
}
function evento_(nome, params = {}) {
  // page_location é montado aqui mesmo (origem + nome da tela), então não passa pela limpeza.
  const limpo = Object.fromEntries(Object.entries(params).map(([k, v]) => [k, typeof v === 'number' || k === 'page_location' ? v : limparTexto(v)]));
  if (metrica.an) { try { metrica.an.logEvent(metrica.inst, nome, limpo); } catch {} } else if (metrica.fila.length < 30) metrica.fila.push([nome, limpo]);
}
function registrarErro(msg, fatal) {
  const d = limparTexto(msg); if (!d || metrica.vistos.has(d) || metrica.erros >= 10) return;
  metrica.vistos.add(d); metrica.erros++; evento_('exception', {description: d, fatal: fatal ? 1 : 0});
}
window.addEventListener('error', e => registrarErro((e.error && e.error.message) || e.message, true));
window.addEventListener('unhandledrejection', e => registrarErro((e.reason && (e.reason.code || e.reason.message)) || e.reason, false));
const consoleErro = console.error.bind(console);
console.error = (...a) => { consoleErro(...a); registrarErro(a.map(x => (x && (x.code || x.message)) || x).join(' '), false); };
let ultimaTela = '';
function contarTela(nome) { if (nome === ultimaTela) return; ultimaTela = nome; evento_('page_view', {page_title: nome, page_location: `${location.origin}/${nome}`}); }

/* ---------- avisos dentro do app (sininho) ---------- */
// Montados no próprio celular a partir do que ele já pode ver: nada novo é gravado no banco.
const IC_SINO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>';
function lerAvisos() { return cid ? ls.get(`hw.${cid}.avisos`, []) : []; }
function gravarAvisos(l) { if (cid) ls.set(`hw.${cid}.avisos`, l.slice(0, 30)); }
function notificar(id, texto, opts = {}) {
  if (!cid) return; const l = lerAvisos(); if (l.some(a => a.id === id)) return;
  l.unshift({id, texto: String(texto).slice(0, 200), acao: opts.acao || '', ts: Date.now(), lido: false}); gravarAvisos(l);
  renderSino(); toast(texto, 5000); SFX.plim();
  if (opts.festa) { SFX.festa(); explodir(innerWidth / 2, innerHeight / 3); }
  if (opts.falar && vozAuto) setTimeout(() => falaDracula(opts.falar), 700);
  try { if ('Notification' in window && Notification.permission === 'granted' && document.hidden) new Notification('Rota Assombrada', {body: texto, icon: 'img/icone-512.png', tag: id}); } catch {}
}
function renderSino() {
  const b = $('#btn-avisos'); if (!b) return; b.hidden = !cid;
  const n = lerAvisos().filter(a => !a.lido).length; const bolha = $('#bolha-avisos');
  bolha.hidden = !n; bolha.textContent = n > 9 ? '9+' : n; b.setAttribute('aria-label', n ? `Avisos: ${n} novos` : 'Avisos');
}
function abrirAvisos() {
  const l = lerAvisos(); const quando = ts => new Date(ts).toLocaleString('pt-BR', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'});
  const rotuloAcao = {participar: 'Cadastrar minha casa', organizador: 'Abrir o Admin', mapa: 'Ver o mapa'};
  const podeSistema = 'Notification' in window && Notification.permission === 'default';
  $('#folha-in').innerHTML = `<div class="avisos"><h3>Avisos</h3>
    ${l.length ? `<ul class="lista-avisos">${l.map(a => `<li class="${a.lido ? '' : 'novo'}"><p>${h(a.texto)}</p><span class="dica">${quando(a.ts)}</span>${a.acao ? `<button class="btn btn-p btn-fantasma" data-aviso-ir="${h(a.acao)}">${rotuloAcao[a.acao] || 'Abrir'}</button>` : ''}</li>`).join('')}</ul>` : '<p class="dica">Nenhum aviso por enquanto. Quando você for aprovado, ou alguém pedir para entrar, aparece aqui.</p>'}
    ${podeSistema ? `<div class="acoes"><button class="btn btn-primario" data-aviso-sistema>Avisar no celular também</button></div><p class="dica">Funciona com o app aberto ou em segundo plano. No iPhone, só com o site salvo na Tela de Início.</p>` : ''}
  </div>`;
  $('#folha').hidden = false;
  gravarAvisos(l.map(a => ({...a, lido: true}))); renderSino();
}
// Vigias: comparam o que mudou desde a última vez que este celular viu.
function vigiarPapel() {
  if (!cid || !usuario || !papelCarregado) return;
  const chave = `hw.${cid}.papelVisto.${usuario.uid}`; const visto = ls.get(chave, null); const nome = (condo && condo.nome) || 'o condomínio';
  if (visto === 'pendente' && (papel === 'morador' || papel === 'admin')) notificar(`aprovado-${usuario.uid}`, `Você foi aprovado em ${nome}! Já pode cadastrar sua casa.`, {acao: 'participar', festa: true, falar: 'Muahaha! Você foi aprovado! Agora cadastre sua casa e prepare os doces.'});
  if (visto === 'morador' && papel === 'admin') notificar(`admin-${usuario.uid}`, `Agora você é admin de ${nome}.`, {acao: 'organizador'});
  if ((visto === 'morador' || visto === 'admin') && papel === '') notificar(`saiu-${usuario.uid}-${Date.now()}`, `Você não faz mais parte de ${nome}.`);
  ls.set(chave, papel);
}
function vigiarPedidos() {
  if (!cid || !ehAdmin() || !membrosCarregados) return;
  const chave = `hw.${cid}.pedidosVistos`; const visto = ls.get(chave, null); const pend = membros.filter(m => m.papel === 'pendente');
  if (visto) pend.filter(m => !visto.includes(m.id)).forEach(m => notificar(`pedido-${m.id}`, `${m.nome || 'Alguém'} pediu para entrar no condomínio.`, {acao: 'organizador'}));
  ls.set(chave, pend.map(m => m.id));
}
function vigiarCasasAtribuidas() {
  if (!cid || !usuario || !casasCarregadas || !meuHashAqui) return;
  casas.filter(c => souResponsavel(c) && c.uid !== usuario.uid).forEach(c => notificar(`atrib-${ano}-${c.id}`, `Você foi adicionado como morador da casa ${nomeCasaTxt(c)}. Já pode editar os dados dela.`, {acao: 'participar'}));
}
function vigiarEvento() {
  if (!cid || !condo) return;
  const ca = `hw.${cid}.anoVisto`; const anoVisto = ls.get(ca, null); const atual = anoAtualDoCondo();
  if (anoVisto && atual > anoVisto) notificar(`ano-${atual}`, `Começou o Halloween de ${atual}! Cadastre sua casa de novo.`, {acao: 'participar', festa: true});
  ls.set(ca, atual);
  if (!ano || ano !== atual) return;
  const cv = `hw.${cid}.${ano}.avisoVisto`; const visto = ls.get(cv, null); const av = (eventoDoc && eventoDoc.avisos) || '';
  if (visto !== null && av && av !== visto) notificar(`recado-${ano}-${av.slice(0, 40)}`, `Recado do condomínio: ${av}`, {acao: 'mapa'});
  if (eventoDoc) ls.set(cv, av);
}

/* ---------- carregamentos: barra no topo, esqueletos e spinners ---------- */
let cargas = 0, barraTimer = null;
function atualizarBarra() {
  const b = document.getElementById('barra-carga'); if (!b) return;
  clearTimeout(barraTimer);
  if (cargas > 0) barraTimer = setTimeout(() => { b.hidden = false; }, 120); else b.hidden = true;
}
function carga(p) { cargas++; atualizarBarra(); return Promise.resolve(p).finally(() => { cargas = Math.max(0, cargas - 1); atualizarBarra(); }); }
const abertas = new Set();
function cargaInicio(nome) { if (abertas.has(nome)) return; abertas.add(nome); cargas++; atualizarBarra(); }
function cargaFim(nome) { if (!abertas.delete(nome)) return; cargas = Math.max(0, cargas - 1); atualizarBarra(); }
const SPIN = '<span class="spinner" aria-hidden="true"></span>';
const SKEL_ITEM = '<li class="skel-item" aria-hidden="true"><span class="skel skel-circ"></span><span class="skel-txt"><span class="skel skel-l1"></span><span class="skel skel-l2"></span></span></li>';
const skelLista = (n = 2) => SKEL_ITEM.repeat(n) + '<li class="sr" role="status">Carregando…</li>';
const SKEL_LINHA = '<li class="skel-item skel-linha" aria-hidden="true"><span class="skel-txt"><span class="skel skel-l1"></span><span class="skel skel-l2"></span></span><span class="skel skel-btn"></span></li>';

/* ---------- estado ---------- */
let cid = null;                 // código do condomínio aberto
let condo = null;               // dados do condomínio aberto
let condoCarregado = false;
let casas = [];
let evento = {nome: '', data: '', horaInicio: '', horaFim: '', avisos: '', portaria: null};
let usuario = null;             // {uid, nome, email, emailToken} quando logado com Google
let donoPlataforma = false;     // decidido pelo hash do e-mail; as regras do Firestore conferem de novo no servidor
let papel = '';                 // '' | 'pendente' | 'morador' | 'admin' no condomínio aberto
let papelCarregado = false;
let podeVerCasas = false;
let casasCarregadas = false, membrosCarregados = false, convitesCarregados = false, authPronto = false;
let atribuicoes = {};     // casaId -> {moradores: [{h, nome, email}]} (o admin lê todos)
let meuHashAqui = '';     // SHA-256 de "codigo:meu-email": acha as casas atribuídas a mim
const hashAtribuicao = (c, email) => sha256hex(`${c}:${String(email || '').trim().toLowerCase()}`);
async function atualizarMeuHash() { meuHashAqui = usuario && cid && crypto.subtle ? await hashAtribuicao(cid, usuario.email) : ''; }
const hashesDaCasa = c => [...new Set([...(Array.isArray(c && c.donoHashes) ? c.donoHashes : []), ...(c && c.donoHash ? [c.donoHash] : [])])];
const souResponsavel = c => !!c && !!meuHashAqui && hashesDaCasa(c).includes(meuHashAqui);
const minhaCasa = () => usuario ? (casaPorId(usuario.uid) || casas.find(souResponsavel) || null) : null;
let membros = [], convites = [];
// Convite do link: {cid, cod}. Fica guardado na aba do navegador até ser usado, para sobreviver ao vaivém do login do Google.
let conviteDaRota = (() => { try { const v = JSON.parse(sessionStorage.getItem('hw.convite') || 'null'); return v && v.cid && v.cod && Date.now() - (v.ts || 0) < 6 * 36e5 ? v : null; } catch { return null; } })();
let aceitandoConvite = false;
function guardarConvite(v) { conviteDaRota = v; try { v ? sessionStorage.setItem('hw.convite', JSON.stringify({...v, ts: Date.now()})) : sessionStorage.removeItem('hw.convite'); } catch {} }
const temConvite = () => !!(conviteDaRota && conviteDaRota.cid === cid);
let modo = null;                // null | 'casa' | 'portaria'
let modoVoltar = 'mapa';
let filtros = ls.get('hw.filtros', {});
let visitadas = new Set();
let partida = 'gps';            // 'gps' | 'portaria' | 'casa:<id>'
let partidaEscolhida = '';      // o que a pessoa tocou; sem escolha, a portaria (se marcada) é o padrão
let roteiro = null;             // {ordem:[ids], de:{lat,lng}}
let vozAuto = ls.get('hw.voz', true);
let autoChegada = ls.get('hw.autochegada', true);
let pinCasa = null;
let editandoId = null;
let criandoOutra = false;       // admin cadastrando casa de outra pessoa
let jaAbriuMinhaCasa = false;
let abaAtual = 'mapa';
let centrouCondo = false, ajustouPinos = false;
let posicao = null;             // {lat,lng,acc,heading,t}
let rumo = null;                // bússola em graus, se disponível
const casaPorId = id => casas.find(c => c.id === id);
const lsc = {get: (k, d) => ls.get(`hw.${cid}.${k}`, d), set: (k, v) => ls.set(`hw.${cid}.${k}`, v)};
// Coisas de um ano específico (casas visitadas, roteiro) ficam separadas por ano.
const lsa = {get: (k, d) => ls.get(`hw.${cid}.${ano}.${k}`, d), set: (k, v) => ls.set(`hw.${cid}.${ano}.${k}`, v)};
const ANO_HOJE = new Date().getFullYear();
let ano = null, anoEscolhido = null, eventoDoc = null, eventosAnos = [], casaAnoPassado = null, migrandoAnos = false;
const anoAtualDoCondo = () => (condo && condo.eventoAtual) || ANO_HOJE;
const ehAnoAtual = () => ano === anoAtualDoCondo();
const ehAdmin = () => donoPlataforma || papel === 'admin';
const ehMorador = () => donoPlataforma || papel === 'admin' || papel === 'morador';
const meuUid = () => usuario ? usuario.uid : null;
const CODIGO = /^[A-HJ-NP-Z2-9]{5}$/;   // 5 caracteres, sem I, O, 0 e 1
const ALFABETO_CODIGO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const normalizarCodigo = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const semAcento = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function prefixosBusca(...textos) {
  const set = new Set();
  semAcento(textos.join(' ')).split(/[^a-z0-9]+/).filter(w => w.length >= 2).forEach(w => { for (let i = 2; i <= Math.min(w.length, 15); i++) set.add(w.slice(0, i)); });
  return [...set].slice(0, 120);
}

/* ---------- Firebase (login Google + Firestore) ---------- */
const fb = {
  pronto: false,
  async init() {
    const [{initializeApp}, fs, auth] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'),
      import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js'),
    ]);
    const app = initializeApp(CONFIG.firebase);
    const emu = ['localhost', '127.0.0.1'].includes(location.hostname) && new URLSearchParams(location.search).has('emu');
    // App Check: cada pedido ao Firebase leva um atestado do reCAPTCHA de que veio deste site.
    if (CONFIG.appCheckSiteKey && !emu) {
      try {
        const ac = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-check.js');
        if (['localhost', '127.0.0.1'].includes(location.hostname)) self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
        ac.initializeAppCheck(app, {provider: new ac.ReCaptchaV3Provider(CONFIG.appCheckSiteKey), isTokenAutoRefreshEnabled: true});
      } catch (e) { console.error('App Check não iniciou', e); }
    }
    if (CONFIG.analytics && CONFIG.firebase.measurementId && !emu) {
      import('https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js').then(async an => {
        if (!(await an.isSupported())) return;
        an.setConsent({analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
        metrica.inst = an.initializeAnalytics(app, {config: {send_page_view: false, page_location: `${location.origin}/`, cookie_expires: 0, allow_google_signals: false, allow_ad_personalization_signals: false}});
        metrica.an = an; metrica.fila.splice(0).forEach(([n, p]) => evento_(n, p));
      }).catch(e => consoleErro('Analytics não iniciou', e));
    }
    this.fs = fs; this.db = fs.getFirestore(app); this.auth = auth; this.a = auth.getAuth(app); this.a.languageCode = 'pt';
    // Só em testes locais (localhost com ?emu): usa os emuladores do Firebase em vez da produção.
    if (emu) {
      fs.connectFirestoreEmulator(this.db, '127.0.0.1', 8080); auth.connectAuthEmulator(this.a, 'http://127.0.0.1:9099', {disableWarnings: true});
      window.__teste = {fb: this, estado: () => ({cid, papel, donoPlataforma, podeVerCasas, casas: casas.length, evento, editandoId, pinCasa, moradoresForm, marcador: marcadorCasa && marcadorCasa.getLatLng(), indice: indiceAtual && indiceAtual.size, membrosCarregados, fala: () => { const i = proximaParada(); return i >= 0 ? falaParada(i) : ''; }, trechos: rotaTrechos && rotaTrechos.map(x => x.ruas), trechosInfo: rotaTrechos && rotaTrechos.map(x => ({ruas: x.ruas, dist: Math.round(x.dist)})), ordem: roteiro && roteiro.ordem, mapa: mapa && {z: mapa.getZoom(), b: mapa.getBounds().toBBoxString()}, sincronizando: sincronizandoIndice, trecho, caminhando, modoSeguir, proxima: proximaParada()})};
    }
    this.pronto = true;
    auth.getRedirectResult(this.a).catch(e => console.error('Retorno do login falhou', e));
    cargaInicio('auth');
    auth.onAuthStateChanged(this.a, async u => {
      authPronto = true; cargaFim('auth');
      usuario = u ? {uid: u.uid, nome: u.displayName || '', email: (u.email || '').toLowerCase(), emailToken: u.email || ''} : null;
      donoPlataforma = usuario ? await ehDonoPlataforma(usuario.email) : false;
      tentarVoltarUltimo();
      renderConta(); renderInicio();
      if (cid) assinarMembro();
    });
  },
  condo: id => fb.fs.doc(fb.db, 'condominios', id),
  condos: () => fb.fs.collection(fb.db, 'condominios'),
  membro: (id, uid) => fb.fs.doc(fb.db, 'condominios', id, 'membros', uid),
  membros: id => fb.fs.collection(fb.db, 'condominios', id, 'membros'),
  convite: (id, cod) => fb.fs.doc(fb.db, 'condominios', id, 'convites', cod),
  convites: id => fb.fs.collection(fb.db, 'condominios', id, 'convites'),
  casa: (id, casaId) => fb.fs.doc(fb.db, 'condominios', id, 'eventos', String(ano), 'casas', casaId),
  casas: id => fb.fs.collection(fb.db, 'condominios', id, 'eventos', String(ano), 'casas'),
  casaAno: (id, a, casaId) => fb.fs.doc(fb.db, 'condominios', id, 'eventos', String(a), 'casas', casaId),
  casasAno: (id, a) => fb.fs.collection(fb.db, 'condominios', id, 'eventos', String(a), 'casas'),
  evento: (id, a) => fb.fs.doc(fb.db, 'condominios', id, 'eventos', String(a)),
  eventos: id => fb.fs.collection(fb.db, 'condominios', id, 'eventos'),
  casasAntigas: id => fb.fs.collection(fb.db, 'condominios', id, 'casas'),
  atribuicao: (id, casaId) => fb.fs.doc(fb.db, 'condominios', id, 'atribuicoes', casaId),
  atribuicoes: id => fb.fs.collection(fb.db, 'condominios', id, 'atribuicoes'),
  indice: (id, hsh) => fb.fs.doc(fb.db, 'condominios', id, 'emails', hsh),
  indices: id => fb.fs.collection(fb.db, 'condominios', id, 'emails'),
  busca: id => fb.fs.doc(fb.db, 'busca', id),
  buscas: () => fb.fs.collection(fb.db, 'busca'),
  criador: uid => fb.fs.doc(fb.db, 'criadores', uid),
  async entrar() {
    if (!this.pronto) return;
    const prov = new this.auth.GoogleAuthProvider(); prov.setCustomParameters({prompt: 'select_account'});
    try { await this.auth.signInWithPopup(this.a, prov); }
    catch (e) {
      if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) { try { history.replaceState(history.state, '', '/' + location.search + (location.hash || (cid ? '#' + cid : ''))); } catch {} return this.auth.signInWithRedirect(this.a, prov); }
      if (e && (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request')) return;
      console.error(e);
      toast(e && e.code === 'auth/unauthorized-domain' ? 'Este endereço ainda não foi autorizado no Firebase.' : e && e.code === 'auth/operation-not-allowed' ? 'O login com Google ainda não foi ligado no Firebase.' : 'Não consegui entrar agora. Tente de novo.', 5000);
    }
  },
  async sair() { if (this.pronto) await this.auth.signOut(this.a); },
};

const CAMPOS_CASA = ['rua', 'numero', 'familia', 'oferece', 'flags', 'horaInicio', 'horaFim', 'obs', 'lat', 'lng', 'uid', 'criadoEm', 'atualizadoEm'];
function limparCasa(c) {
  const s = (v, n) => String(v ?? '').trim().slice(0, n);
  const hora = v => /^[0-2]\d:[0-5]\d$/.test(v || '') ? v : '';
  return {rua: s(c.rua, 60), numero: s(c.numero, 20), familia: s(c.familia, 60),
    oferece: [...new Set((c.oferece || []).filter(k => OFERECE.some(o => o[0] === k)))],
    flags: [...new Set((c.flags || []).filter(k => FLAGS.some(o => o[0] === k)))],
    horaInicio: hora(c.horaInicio), horaFim: hora(c.horaFim), obs: s(c.obs, 240), donoHash: /^[0-9a-f]{64}$/.test(c.donoHash || '') ? c.donoHash : '',
    donoHashes: [...new Set((Array.isArray(c.donoHashes) ? c.donoHashes : []).filter(x => /^[0-9a-f]{64}$/.test(x)))].slice(0, 6),
    esgotado: !!c.esgotado,
    lat: +c.lat, lng: +c.lng, uid: s(c.uid, 128), criadoEm: +c.criadoEm || Date.now(), atualizadoEm: Date.now()};
}
async function sha256hex(txt) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
async function ehDonoPlataforma(email) {
  if (!email || !crypto.subtle) return false;
  return (CONFIG.donosPlataforma || []).includes(await sha256hex(email.toLowerCase()));
}
function codigoAleatorio(n = 12) {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'; const v = crypto.getRandomValues(new Uint8Array(n));
  return [...v].map(x => abc[x % abc.length]).join('');
}

/* ---------- assinaturas em tempo real ---------- */
const subs = {};
function parar(...nomes) { nomes.forEach(n => { if (subs[n]) { try { subs[n](); } catch {} delete subs[n]; } }); }
function abrirCondo(novo) {
  if (novo === cid && subs.condo) { tentarConvite(); return; }
  if (caminhando) sairCaminhada(true, true); caminhadaVista = false;
  parar('condo', 'membro', 'casas', 'casasAntigas', 'membros', 'convites', 'atribuicoes', 'evento', 'eventos');
  cid = novo; condo = null; condoCarregado = false; casas = []; casasCarregadas = false; cargaInicio('condo'); cargaInicio('casas'); papel = ''; papelCarregado = false; podeVerCasas = false; membros = []; convites = [];
  jaAbriuMinhaCasa = false; editandoId = null; criandoOutra = false; pinCasa = null; centrouCondo = false; ajustouPinos = false; modo = null;
  partidaEscolhida = lsc.get('partida', ''); partida = partidaEscolhida || 'gps'; ano = null; anoEscolhido = null; eventoDoc = null; eventosAnos = []; casaAnoPassado = null; migrandoAnos = false;
  visitadas = new Set(); roteiro = null; rotaLinha = null; rotaPernas = null; rotaTrechos = null; rotaChave = ''; trecho = null;
  ls.set('hw.ultimo', cid); checarPaginaPrevia(cid);
  vigiarCarga();
  mostrarCondo();
  subs.condo = fb.fs.onSnapshot(fb.condo(cid), snap => {
    // sem conexão o Firestore responde do cache vazio: "não existe" ali não quer dizer nada, continua esperando o servidor
    if (!snap.exists() && snap.metadata.fromCache) return;
    condoCarregado = true; cargaFim('condo');
    if (!snap.exists()) { condo = null; renderTudoCondo(); return; }
    condo = snap.data();
    const alvo = anoEscolhido || anoAtualDoCondo();
    if (alvo !== ano) trocarAno(alvo);
    montarEvento();
    if (ehAdmin()) passarParaAnos();
    lembrarRecente(cid, condo.nome);
    tentarConvite();
    if (!centrouCondo && condo.centro) { centrouCondo = true; mapa.setView([condo.centro.lat, condo.centro.lng], condo.zoom || 17); }
    renderTudoCondo(); caberPinos();
  }, e => { console.error(e); condoCarregado = true; cargaFim('condo'); cargaFim('casas'); casasCarregadas = true; toast('Não consegui abrir este condomínio.'); renderTudoCondo(); });
  subs.eventos = fb.fs.onSnapshot(fb.eventos(cid), s => { eventosAnos = s.docs.map(d => +d.id).filter(Boolean).sort((a, b) => b - a); renderSeletorAno(); }, e => console.error(e));
  assinarMembro();
}
function montarEvento() {
  const e = eventoDoc || {}; const c = condo || {};
  // Antes dos eventos por ano, nome, data e horário ficavam no condomínio: servem de reserva.
  evento = {nome: e.nome ?? (ano === anoAtualDoCondo() ? c.eventoNome : '') ?? '', data: e.data ?? (ano === anoAtualDoCondo() ? c.data : '') ?? '',
    horaInicio: e.horaInicio ?? c.horaInicio ?? '', horaFim: e.horaFim ?? c.horaFim ?? '', avisos: e.avisos ?? (ano === anoAtualDoCondo() ? c.avisos : '') ?? '', portaria: c.portaria || null};
  if (!evento.nome) evento.nome = `Halloween ${ano || ''}`.trim();
  if (!partidaEscolhida) partida = evento.portaria ? 'portaria' : 'gps';
}
function trocarAno(novo) {
  ano = novo; parar('casas', 'casasAntigas', 'evento');
  casas = []; casasCarregadas = false; podeVerCasas = false; cargaInicio('casas'); eventoDoc = null; casaAnoPassado = null;
  visitadas = new Set(lsa.get('visitadas', [])); roteiro = lsa.get('roteiro', null); rotaLinha = null; rotaPernas = null; rotaTrechos = null; rotaChave = ''; trecho = null;
  if (caminhando) sairCaminhada(true, true); caminhadaVista = false;
  jaAbriuMinhaCasa = false; editandoId = null; criandoOutra = false; pinCasa = null;
  subs.evento = fb.fs.onSnapshot(fb.evento(cid, ano), s => { eventoDoc = s.exists() ? s.data() : null; montarEvento(); renderTudoCondo(); vigiarEvento(); }, e => console.error(e));
  montarEvento(); renderSeletorAno();
  if (papelCarregado) assinarCasas();
  renderTudoCondo();
}
function renderSeletorAno() {
  const sel = $('#sel-ano'); if (!sel) return;
  const anos = [...new Set([...eventosAnos, ano, anoAtualDoCondo()].filter(Boolean))].sort((a, b) => b - a);
  sel.hidden = anos.length < 2;
  sel.innerHTML = anos.map(a => `<option value="${a}" ${a === ano ? 'selected' : ''}>${a}${a === anoAtualDoCondo() ? '' : ' (já passou)'}</option>`).join('');
}
// Condomínios de antes dos eventos por ano: o admin, ao abrir, leva as casas para o evento do ano.
async function passarParaAnos() {
  if (migrandoAnos || !cid || !condo) return; migrandoAnos = true;
  try {
    const antigas = await fb.fs.getDocs(fb.casasAntigas(cid));
    if (condo.eventoAtual && antigas.empty) return;
    const a = condo.eventoAtual || ANO_HOJE; const agora = Date.now();
    const b = fb.fs.writeBatch(fb.db);
    if (!condo.eventoAtual) {
      b.set(fb.evento(cid, a), {nome: String(condo.eventoNome || `Halloween ${a}`).slice(0, 80), data: String(condo.data || `${a}-10-31`).slice(0, 10), horaInicio: condo.horaInicio || '', horaFim: condo.horaFim || '', avisos: String(condo.avisos || '').slice(0, 160), criadoEm: agora, atualizadoEm: agora}, {merge: true});
      b.set(fb.condo(cid), {eventoAtual: a, atualizadoEm: agora}, {merge: true});
    }
    antigas.docs.forEach(d => b.set(fb.casaAno(cid, a, d.id), limparCasa(d.data())));
    await carga(b.commit());
    if (!antigas.empty) { const apagar = fb.fs.writeBatch(fb.db); antigas.docs.forEach(d => apagar.delete(d.ref)); await carga(apagar.commit()); toast(`Casas passadas para o Halloween de ${a}.`); }
    if (subs.casasAntigas) assinarCasas();
  } catch (e) { console.error('Não consegui passar para eventos por ano', e); migrandoAnos = false; }
}
function fecharCondo() {
  parar('condo', 'membro', 'casas', 'casasAntigas', 'membros', 'convites', 'atribuicoes', 'evento', 'eventos'); ['condo', 'casas', 'membros', 'convites'].forEach(cargaFim);
  cid = null; condo = null; casas = []; papel = ''; podeVerCasas = false; membros = []; convites = []; roteiro = null;
  $('#contagem').hidden = true; clearInterval(timerContagem); timerContagem = null;
  mostrarInicio();
}
function assinarMembro() {
  parar('membro');
  if (!cid) return;
  if (!usuario) { papel = ''; papelCarregado = true; aoMudarPapel(); return; }
  papelCarregado = false;
  // Espera o servidor confirmar (sem gravação pendente): as regras só enxergam o papel depois disso.
  subs.membro = fb.fs.onSnapshot(fb.membro(cid, usuario.uid), {includeMetadataChanges: true}, snap => {
    if (snap.metadata.hasPendingWrites || (!snap.exists() && snap.metadata.fromCache)) return;
    const novo = snap.exists() ? snap.data().papel : '';
    if (papelCarregado && novo === papel && !snap.metadata.fromCache) { if (!podeVerCasas && ehMorador()) assinarCasas(); return; }
    papel = novo; papelCarregado = true; aoMudarPapel(); vigiarPapel();
  },
    e => { console.error(e); papel = ''; papelCarregado = true; aoMudarPapel(); });
}
function aoMudarPapel() {
  // troca de conta ou de papel: esquece a lista de busca e as conferências (o admin vê e-mails completos, o morador não)
  diretorio = null; diretorioCid = null; carregandoDiretorio = null; geracaoDiretorio++; statusMorador.clear(); sincronizandoIndice = false;
  atualizarMeuHash().then(() => { atualizarParticipar(); renderPins(); vigiarCasasAtribuidas(); entrarNoIndice(); });
  assinarCasas();
  parar('membros', 'convites', 'atribuicoes', 'indice'); indiceAtual = null;
  membros = []; convites = []; atribuicoes = {}; membrosCarregados = false; convitesCarregados = false;
  if (ehAdmin() && cid) {
    subs.membros = fb.fs.onSnapshot(fb.membros(cid), s => { membrosCarregados = true; membros = s.docs.map(d => ({id: d.id, ...d.data()})); diretorio = null; calcularProtegidos().then(renderAdmin); renderAdmin(); vigiarPedidos(); sincronizarIndice(); }, e => { membrosCarregados = true; console.error(e); renderAdmin(); });
    subs.atribuicoes = fb.fs.onSnapshot(fb.atribuicoes(cid), s => { atribuicoes = Object.fromEntries(s.docs.map(d => [d.id, d.data()])); if (editandoId && moradoresDe === editandoId && !moradoresMexidos) carregarMoradores(); renderAdmin(); }, e => console.error(e));
    subs.indice = fb.fs.onSnapshot(fb.indices(cid), s => { indiceAtual = new Map(s.docs.map(d => [d.id, d.data()])); sincronizarIndice(); }, e => console.error(e));
    subs.convites = fb.fs.onSnapshot(fb.convites(cid), s => { convitesCarregados = true; convites = s.docs.map(d => ({id: d.id, ...d.data()})); renderAdmin(); }, e => { convitesCarregados = true; console.error(e); renderAdmin(); });
  }
  tentarConvite();
  if (ehAdmin() && condo) passarParaAnos();
  renderTudoCondo();
  if (abaAtual === 'organizador' && !ehAdmin()) irAba('mapa');
}
let tentativasCasas = 0, casasDoEvento = [], casasFormatoAtual = [];
function juntarCasas() {
  const m = new Map(casasFormatoAtual.map(c => [c.id, c])); casasDoEvento.forEach(c => m.set(c.id, c));
  casas = [...m.values()].map(c => (c.familia && String(c.familia).trim()) ? c : {...c, familia: nomeDivertido(c.id), nomeAuto: true});
}
function assinarCasas() {
  parar('casas', 'casasAntigas'); if (!cid || !ano) return;
  casasDoEvento = []; casasFormatoAtual = [];
  // Enquanto nenhum admin passar o condomínio para eventos por ano, as casas ainda moram no lugar antigo: mostra as duas.
  if (condo && !condo.eventoAtual && ano === anoAtualDoCondo()) {
    subs.casasAntigas = fb.fs.onSnapshot(fb.casasAntigas(cid), s => { casasFormatoAtual = s.docs.map(d => ({id: d.id, ...d.data()})); juntarCasas(); aoMudarDados(); }, () => { casasFormatoAtual = []; });
  }
  subs.casas = fb.fs.onSnapshot(fb.casas(cid), s => { if (s.empty && s.metadata.fromCache && !casasCarregadas) return; tentativasCasas = 0; podeVerCasas = true; casasCarregadas = true; cargaFim('casas'); casasDoEvento = s.docs.map(d => ({id: d.id, ...d.data()})); juntarCasas(); aoMudarDados(); vigiarCasasAtribuidas(); },
    e => {
      podeVerCasas = false; casas = []; casasDoEvento = []; parar('casas', 'casasAntigas');
      const vaiTentar = e.code !== 'permission-denied' || (ehMorador() && tentativasCasas < 4);
      if (!vaiTentar) { casasCarregadas = true; cargaFim('casas'); }
      aoMudarDados();
      if (e.code !== 'permission-denied') { console.error(e); setTimeout(() => { if (cid && !subs.casas) assinarCasas(); }, 5000); }
      else if (ehMorador() && tentativasCasas < 4) { tentativasCasas++; setTimeout(() => { if (cid && !subs.casas) assinarCasas(); }, 1200 * tentativasCasas); }
    });
}
function aoMudarDados() {
  if (roteiro && podeVerCasas && rotaChave !== chaveRoteiro()) { carregarRotaLinha(); if (!trecho) atualizarTrecho(false); }
  renderCabecalho(); renderPlacar(); renderPins(); renderRoteiro(); renderAcesso(); atualizarParticipar();
  if (abaAtual === 'organizador') renderAdmin();
  caberPinos(); restaurarCaminhada();
}
// A visão salva no admin pode deixar casas de fora: na primeira carga, se algum pino ficar fora da tela, afasta até caber todos.
function caberPinos() {
  if (ajustouPinos || !mapa || !casasCarregadas || !condoCarregado || (condo && condo.centro && !centrouCondo)) return;
  const tam = mapa.getSize(); if (!tam.x || !tam.y) return;
  ajustouPinos = true;
  const pts = casas.filter(c => typeof c.lat === 'number').map(c => [c.lat, c.lng]); if (evento.portaria) pts.push([evento.portaria.lat, evento.portaria.lng]);
  if (!pts.length || mapa.getBounds().pad(-0.06).contains(L.latLngBounds(pts))) return;
  mapa.fitBounds(pts, {padding: [40, 40], maxZoom: Math.max((condo && condo.zoom) || 17, 17)});
}

/* ---------- entrar no condomínio ---------- */
async function tentarConvite() {
  // Roda quando o papel OU o condomínio terminam de carregar (o que chegar por último), e só uma vez por convite.
  if (!temConvite() || aceitandoConvite || !usuario || !cid || !papelCarregado || !condo) return;
  const cod = conviteDaRota.cod; guardarConvite(null);
  const limparRota = () => { try { history.replaceState(null, '', aquiCom('#' + cid)); } catch {} ajustarEndereco(); };
  if (papel === 'admin' || papel === 'morador') { limparRota(); toast('Você já faz parte deste condomínio.'); return; }
  aceitandoConvite = true; renderAcesso(); atualizarParticipar();
  try {
    if (papel === 'pendente') await fb.fs.deleteDoc(fb.membro(cid, usuario.uid));
    await fb.fs.setDoc(fb.membro(cid, usuario.uid), {uid: usuario.uid, papel: 'morador', nome: usuario.nome.slice(0, 80), email: usuario.emailToken.slice(0, 160), convite: cod, criadoEm: Date.now(), atualizadoEm: Date.now()});
    SFX.festa(); toast('Convite aceito! Agora você pode cadastrar sua casa.', 4000); limparRota(); evento_('convite_aceito');
  } catch (e) {
    console.error(e); limparRota();
    toast('Este convite expirou ou foi desativado. Peça um novo ao admin.', 5000); evento_('convite_recusado');
  } finally { aceitandoConvite = false; renderAcesso(); atualizarParticipar(); }
}
async function pedirAcesso() {
  if (!usuario) { fb.entrar(); return; }
  await salvarSeguro(() => fb.fs.setDoc(fb.membro(cid, usuario.uid), {uid: usuario.uid, papel: 'pendente', nome: usuario.nome.slice(0, 80), email: usuario.emailToken.slice(0, 160), convite: '', criadoEm: Date.now(), atualizadoEm: Date.now()}), 'Pedido enviado! Um admin vai aprovar.');
}
// Dono da plataforma e quem criou o condomínio não podem perder o admin nem ser removidos por outros admins.
let protegidos = new Map();   // uid -> rótulo
async function calcularProtegidos() {
  const m = new Map(), donos = (CONFIG.donosPlataforma || []).map(x => String(x).toLowerCase());
  for (const x of membros) {
    if (x.email && crypto.subtle && donos.includes(await sha256hex(String(x.email).toLowerCase()))) m.set(x.id, 'Dono da plataforma');
    else if (condo && x.id === condo.criadoPor) m.set(x.id, 'Criou o condomínio');
  }
  protegidos = m;
}
// ---------- diretório de moradores ----------
// condominios/{cid}/emails/{sha256("cid:email")} = {uid, nome, mascara}. Só moradores aprovados leem, e o e-mail vai
// pela metade (cr•••@gmail.com). Cada um se registra ao entrar; o app do admin mantém o diretório igual à lista de membros.
const nomeCurto = n => String(n || '').trim().replace(/\s+/g, ' ').slice(0, 60);
function mascararEmail(e) { const [u, d] = String(e || '').toLowerCase().split('@'); return u && d ? `${u.slice(0, 2)}•••@${d}`.slice(0, 80) : ''; }
let indiceAtual = null, sincronizandoIndice = false;
async function entrarNoIndice() {
  if (!usuario || !cid || !meuHashAqui || !ehMorador()) return;
  const chave = 'hw.indice2.' + cid; if (ls.get(chave, '') === meuHashAqui) return;
  try { await fb.fs.setDoc(fb.indice(cid, meuHashAqui), {uid: usuario.uid, nome: nomeCurto(usuario.nome), mascara: mascararEmail(usuario.email), atualizadoEm: Date.now()}); ls.set(chave, meuHashAqui); } catch (e) { console.error(e); }
}
async function sincronizarIndice() {
  if (!ehAdmin() || !cid || !membrosCarregados || !indiceAtual || sincronizandoIndice || !crypto.subtle) return;
  sincronizandoIndice = true;
  try {
    const quer = new Map();
    for (const m of membros) if ((m.papel === 'morador' || m.papel === 'admin') && m.email) quer.set(await hashAtribuicao(cid, m.email), {uid: m.id, nome: nomeCurto(m.nome), mascara: mascararEmail(m.email)});
    const b = fb.fs.writeBatch(fb.db); let n = 0;
    quer.forEach((v, k) => { const a = indiceAtual.get(k); if (!a || a.uid !== v.uid || (a.nome || '') !== v.nome || (a.mascara || '') !== v.mascara) { b.set(fb.indice(cid, k), {...v, atualizadoEm: Date.now()}); n++; } });
    indiceAtual.forEach((_, k) => { if (!quer.has(k)) { b.delete(fb.indice(cid, k)); n++; } });
    // não segura a trava esperando o servidor: a mudança já aparece no snapshot local, e a próxima rodada não acha diferença
    if (n && n <= 450) b.commit().catch(e => console.error(e));
  } catch (e) { console.error(e); }
  finally { sincronizandoIndice = false; }
}
// Lista para a busca por nome: o admin usa os membros (com e-mail completo); o morador, o diretório.
let diretorio = null, diretorioCid = null, carregandoDiretorio = null, geracaoDiretorio = 0;
function carregarDiretorio() {
  if (diretorio && diretorioCid === cid) return Promise.resolve(diretorio);
  if (carregandoDiretorio) return carregandoDiretorio;
  const alvo = cid, ger = geracaoDiretorio;
  const tarefa = (async () => {
    let lista = [];
    if (ehAdmin() && membrosCarregados) lista = await Promise.all(membros.filter(m => (m.papel === 'morador' || m.papel === 'admin') && m.email)
      .map(async m => ({h: await hashAtribuicao(alvo, m.email), uid: m.id, nome: nomeCurto(m.nome), email: m.email.toLowerCase(), mascara: mascararEmail(m.email)})));
    else if (ehMorador()) { try { const snap = await fb.fs.getDocs(fb.indices(alvo)); lista = snap.docs.map(d => ({h: d.id, uid: d.data().uid, nome: d.data().nome || '', mascara: d.data().mascara || '', email: ''})); } catch (e) { console.error(e); } }
    if (ger !== geracaoDiretorio) return [];   // trocou de conta no meio: descarta
    if (alvo === cid) { diretorio = lista; diretorioCid = alvo; }
    return lista;
  })().finally(() => { if (carregandoDiretorio === tarefa) carregandoDiretorio = null; });
  carregandoDiretorio = tarefa; return tarefa;
}
// Confere um e-mail completo: {nome} se já é morador, false se não é, null se não deu para saber.
const statusMorador = new Map();
async function conferirMorador(email) {
  if (!cid || !email) return null;
  if (ehAdmin() && membrosCarregados) { const m = membros.find(x => (x.email || '').toLowerCase() === email && (x.papel === 'morador' || x.papel === 'admin')); return m ? {nome: nomeCurto(m.nome)} : false; }
  if (!ehMorador()) return null;
  try { const snap = await fb.fs.getDoc(fb.indice(cid, await hashAtribuicao(cid, email))); return snap.exists() ? {nome: snap.data().nome || ''} : false; } catch (e) { return null; }
}
async function statusDe(email) {
  const k = cid + '|' + email; if (statusMorador.has(k)) return statusMorador.get(k);
  const p = conferirMorador(email); statusMorador.set(k, p); const r = await p; if (r == null) statusMorador.delete(k); return r;
}
const textoStatus = r => r ? `${IC.check} ${r.nome ? h(r.nome.split(' ')[0]) + ' já' : 'Já'} está no condomínio` : r === false ? 'Ainda não entrou no condomínio' : '';
async function sairDoCondo() {
  if (!usuario || !cid) return;
  if (meuHashAqui) { try { await fb.fs.deleteDoc(fb.indice(cid, meuHashAqui)); } catch {} ls.set('hw.indice2.' + cid, ''); }
  await salvarSeguro(() => fb.fs.deleteDoc(fb.membro(cid, usuario.uid)), 'Você saiu deste condomínio.');
}
function salvarCondo(campos) { return fb.fs.setDoc(fb.condo(cid), {...campos, atualizadoEm: Date.now()}, {merge: true}); }
function lembrarRecente(id, nome) {
  const r = ls.get('hw.recentes', []).filter(x => x.cid !== id); r.unshift({cid: id, nome: String(nome || id).slice(0, 80)}); ls.set('hw.recentes', r.slice(0, 6));
}

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
const fmtM = m => m < 950 ? `${Math.max(10, Math.round(m / 10) * 10)} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`;
const falaM = m => m < 950 ? `${Math.max(10, Math.round(m / 10) * 10)} metros` : `${(m / 1000).toFixed(1).replace('.', ' vírgula ')} quilômetros`;

/* ---------- regras do evento ---------- */
const hm = s => { if (!s || !/^\d{1,2}:\d{2}$/.test(s)) return null; const [a, b] = s.split(':').map(Number); return a * 60 + b; };
function horario(c) { return {ini: c.horaInicio || evento.horaInicio || '', fim: c.horaFim || evento.horaFim || ''}; }
// Janela da casa no dia do evento (horário da casa ou do evento). Sem data cadastrada, vale só o horário de todo dia.
function janelaCasa(c) {
  const {ini, fim} = horario(c); const a = hm(ini), b = hm(fim);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(evento.data || '')) return null;
  const base = new Date(`${evento.data}T00:00:00`).getTime();
  const inicio = base + (a ?? 0) * 6e4; let fimMs = base + (b ?? 1439) * 6e4 + 59999; if (fimMs <= inicio) fimMs += 864e5;
  return {inicio, fim: fimMs, base};
}
function abertaAgora(c) {
  const j = janelaCasa(c);
  if (j) { const n = Date.now(); return n >= j.inicio && n <= j.fim; }
  const {ini, fim} = horario(c); const a = hm(ini), b = hm(fim); if (a == null || b == null) return true;
  const d = new Date(); const n = d.getHours() * 60 + d.getMinutes(); return b >= a ? (n >= a && n <= b) : (n >= a || n <= b);
}
// Texto do horário: "Aberta agora · até 23:59", "Abre 31/10 · 17:00–23:59", "Abre às 17:00" (no dia) ou "Já fechou".
function statusCasa(c) {
  const aberta = abertaAgora(c), {ini, fim} = horario(c), faixa = ini && fim ? `${ini}–${fim}` : '';
  if (aberta) return {aberta, texto: fim ? `Aberta agora · até ${fim}` : 'Aberta agora'};
  const j = janelaCasa(c), n = Date.now();
  if (j && n < j.base) return {aberta, texto: `Abre ${fmtData(evento.data)}${faixa ? ` · ${faixa}` : ''}`};
  if (j && n < j.inicio) return {aberta, texto: `Abre às ${ini || '00:00'}${fim ? ` · até ${fim}` : ''}`};
  if (j && n > j.fim) return {aberta, texto: `Já fechou${faixa ? ` · ${faixa}` : ''}`};
  return {aberta, texto: `Fora do horário${faixa ? ` · ${faixa}` : ''}`};
}
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
const podeEditar = c => !!c && (ehAdmin() || (ehMorador() && !!meuUid() && c.uid === meuUid()) || souResponsavel(c));

/* ---------- links para o app de mapas do celular ---------- */
// De onde sai a navegação até a casa c. Partida "GPS": sem origem, o app de mapas usa a posição atual do celular.
// Portaria ou casa escolhida: a primeira parada sai dela e as seguintes saem da casa anterior do roteiro.
function origemNav(c) {
  const tipo = roteiro && roteiro.partida ? roteiro.partida : partida;
  if (tipo === 'gps') return null;
  if (roteiro) {
    const i = roteiro.ordem.indexOf(c.id);
    for (let k = i - 1; k >= 0; k--) { const a = casaPorId(roteiro.ordem[k]); if (a) return a; }
    if (i >= 0) return roteiro.de;
  }
  const pp = pontoPartida(); return pp && !(pp.p.lat === c.lat && pp.p.lng === c.lng) ? pp.p : null;
}
const coord = p => `${(+p.lat).toFixed(6)},${(+p.lng).toFixed(6)}`;
function linksNav(c) {
  const d = coord(c); const nome = encodeURIComponent(nomeCasaTxt(c)); const o = origemNav(c);
  return {
    apple: `https://maps.apple.com/?${o ? `saddr=${coord(o)}&` : ''}daddr=${d}&dirflg=w&q=${nome}`,
    google: `https://www.google.com/maps/dir/?api=1${o ? `&origin=${coord(o)}` : ''}&destination=${d}&travelmode=walking`,
    waze: `https://waze.com/ul?ll=${d}&navigate=yes`,
  };
}
const linkPrincipal = c => linksNav(c).google;   // Google Maps é o recomendado, no iPhone também
// Rota completa no Google Maps, na ordem otimizada. O formato de caminho (/maps/dir/A/B/C/...) funcionava no navegador,
// mas o app do Google Maps no celular ignorava as paradas do meio. O formato oficial "?api=1&waypoints=" abre no app
// com todas as paradas, até 9 paradas + destino: 10 casas por link; acima disso, partes. Sem origin = sai de onde o celular está.
const CASAS_POR_LINK = 10;
function partesRotaGoogle() {
  if (!roteiro) return [];
  const ordem = roteiro.ordem.map((id, i) => ({c: casaPorId(id), n: i + 1})).filter(x => x.c && !visitadas.has(x.c.id));
  if (!ordem.length) return [];
  // Sai do início escolhido (ou da última casa visitada); com partida "GPS", da posição atual do celular.
  const tipo = roteiro.partida || partida; const feitas = roteiro.ordem.map(casaPorId).filter(c => c && visitadas.has(c.id));
  let o = tipo === 'gps' ? (posicao ? {lat: posicao.lat, lng: posicao.lng} : null) : (feitas.length ? feitas[feitas.length - 1] : roteiro.de);
  const partes = [];
  for (let k = 0; k < ordem.length; k += CASAS_POR_LINK) {
    const bloco = ordem.slice(k, k + CASAS_POR_LINK), dest = bloco[bloco.length - 1].c;
    const paradas = bloco.slice(0, -1).map(x => coord(x.c)).join('|');
    partes.push({url: `https://www.google.com/maps/dir/?api=1${o ? `&origin=${coord(o)}` : ''}&destination=${coord(dest)}${paradas ? `&waypoints=${encodeURIComponent(paradas)}` : ''}&travelmode=walking`,
      de: bloco[0].n, ate: bloco[bloco.length - 1].n, casas: bloco.length});
    o = dest;
  }
  return partes;
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
  mapa.attributionControl.addAttribution('Rotas a pé: <a href="https://routing.openstreetmap.de/about.html" target="_blank" rel="noopener">FOSSGIS/Valhalla</a>');
  camadaPins = L.layerGroup().addTo(mapa); camadaExtras = L.layerGroup().addTo(mapa);
  mapa.on('click', e => toqueMapa(e.latlng));
  setTimeout(() => mapa.invalidateSize(), 300);
}
// Casas no mesmo lugar (ex.: o mapa só conhecia a rua e pôs as duas no meio dela): espalha os pinos lado a lado
// para todos aparecerem. Devolve id -> deslocamento em pixels.
function espalharPinos(lista, raio = 8) {
  const grupos = [], dx = {};
  lista.forEach(c => { const g = grupos.find(gr => distM(gr[0], c) <= raio); if (g) g.push(c); else grupos.push([c]); });
  grupos.forEach(g => { if (g.length > 1) g.forEach((c, i) => { dx[c.id] = Math.round((i - (g.length - 1) / 2) * 34); }); });
  return dx;
}
function casasNoMesmoLugar(p, idIgnorar, raio = 6) { return casas.filter(c => c.id !== idIgnorar && typeof c.lat === 'number' && distM(p, c) <= raio); }
function iconePin(c, extra) {
  const cls = ['pin', visitadas.has(c.id) ? 'visitada' : '', c.esgotado ? 'esgotada' : abertaAgora(c) ? '' : 'fechada', extra.atual ? 'atual' : '', extra.ordem ? 'ordem' : ''].filter(Boolean).join(' ');
  return L.divIcon({className: 'pin-wrap', iconSize: [46, 52], iconAnchor: [23 - (extra.dx || 0), 50], html: `<div class="${cls}" data-ordem="${extra.ordem || ''}">${PIN_SVG}<span class="num">${h(c.numero)}</span></div>`});
}
function iconeMarcador(ic, cls = '') { return L.divIcon({className: 'marcador-wrap', iconSize: [44, 44], iconAnchor: [22, 22], html: `<div class="marcador ${cls}">${ic}</div>`}); }
function renderPins() {
  if (!mapa) return;
  camadaPins.clearLayers();
  const atualIdx = proximaParada(); const atualId = atualIdx >= 0 ? roteiro.ordem[atualIdx] : null;
  const ordemDe = {}; if (roteiro) roteiro.ordem.forEach((id, i) => { if (!visitadas.has(id)) ordemDe[id] = i + 1; });
  const vis = casas.filter(c => typeof c.lat === 'number' && filtrada(c));
  const desloc = espalharPinos(vis);
  vis.forEach(c => { const m = L.marker([c.lat, c.lng], {icon: iconePin(c, {atual: c.id === atualId, ordem: ordemDe[c.id], dx: desloc[c.id]}), title: nomeCasaTxt(c), zIndexOffset: c.id === atualId ? 1000 : 0}); m.on('click', () => { if (modo) return; abrirFolha(c.id); }); camadaPins.addLayer(m); });
  camadaExtras.clearLayers();
  if (evento.portaria) camadaExtras.addLayer(L.marker([evento.portaria.lat, evento.portaria.lng], {icon: iconeMarcador(IC.porta, 'portaria'), title: 'Portaria', interactive: false, zIndexOffset: -100}));
  const salva = editandoId && casaPorId(editandoId); const mudouPin = pinCasa && (!salva || salva.lat !== pinCasa.lat || salva.lng !== pinCasa.lng);
  if (pinCasa && (modo === 'casa' || (abaAtual === 'participar' && mudouPin))) camadaExtras.addLayer(L.marker([pinCasa.lat, pinCasa.lng], {icon: iconeMarcador(IC.casa, 'pin-temp'), interactive: false}));
  if (roteiro) {
    // Trecho da vez: o caminho ao vivo (de onde a pessoa está até a próxima casa) em destaque; os trechos já feitos ficam apagados.
    const iAtual = proximaParada(), iRef = iAtual < 0 ? Infinity : iAtual;
    const viva = iAtual >= 0 && trecho && trecho.pts && trecho.casaId === roteiro.ordem[iAtual] ? trecho.pts : null;
    if (rotaTrechos && rotaChave === chaveRoteiro()) {
      rotaTrechos.forEach((tr, i) => {
        if (viva && i === iAtual) return; const f = i < iRef ? .3 : 1;
        if (tr.ruas) { camadaExtras.addLayer(L.polyline(tr.pts, {color: '#06200a', weight: 9, opacity: .55 * f, interactive: false, lineJoin: 'round'})); camadaExtras.addLayer(L.polyline(tr.pts, {color: '#8df06a', weight: 5, opacity: .95 * f, interactive: false, lineJoin: 'round'})); }
        else { camadaExtras.addLayer(L.polyline(tr.pts, {color: '#06200a', weight: 7, opacity: .45 * f, interactive: false})); camadaExtras.addLayer(L.polyline(tr.pts, {color: '#8df06a', weight: 4, dashArray: '2 9', lineCap: 'round', opacity: .95 * f, interactive: false})); }
      });
      if (viva) { camadaExtras.addLayer(L.polyline(viva, {color: '#06200a', weight: 10, opacity: .6, interactive: false, lineJoin: 'round'})); camadaExtras.addLayer(L.polyline(viva, {color: '#8df06a', weight: 6, opacity: 1, interactive: false, lineJoin: 'round'})); }
    } else {
      const pts = [[roteiro.de.lat, roteiro.de.lng]].concat(roteiro.ordem.map(casaPorId).filter(Boolean).map(c => [c.lat, c.lng]));
      if (pts.length > 1) camadaExtras.addLayer(L.polyline(pts, {color: '#8df06a', weight: 3, dashArray: '6 8', opacity: .8, interactive: false}));
    }
  }
  const vazio = $('#mapa-vazio');
  const mc = $('#mapa-carregando'); if (mc) mc.hidden = casasCarregadas;
  if (!casasCarregadas) { vazio.innerHTML = ''; renderListaCasas(); return; }
  $('#btn-ir-participar').hidden = !casas.length; $('#btn-compartilhar').hidden = !condo;
  renderListaCasas();
  if (!casas.length) vazio.innerHTML = `<div class="cartao vazio vazio-casas">${PUMPKIN_BIG}<h3>Nenhuma abóbora acesa ainda</h3><p>As casas participantes aparecem aqui assim que os moradores se cadastram. Que tal começar pela sua?</p><button class="btn btn-primario" data-ir="participar">Cadastrar minha casa</button></div>`;
  else if (!vis.length) vazio.innerHTML = `<p class="vazio">Nenhuma casa passa nos filtros escolhidos.</p>`; else vazio.innerHTML = '';
}
function renderListaCasas() {
  const card = $('#card-lista-casas'); if (!card) return;
  if (!casasCarregadas || !casas.length) { card.hidden = true; return; }
  const lista = casas.filter(c => typeof c.lat === 'number' && filtrada(c));
  const comGps = posicao && Date.now() - posicao.t < 120000;
  lista.sort(comGps ? (a, b) => distM(posicao, a) - distM(posicao, b) : (a, b) => (a.rua || '').localeCompare(b.rua || '') || String(a.numero).localeCompare(String(b.numero), 'pt', {numeric: true}));
  card.hidden = false;
  $('#total-lista-casas').textContent = lista.length === casas.length ? casas.length : `${lista.length} de ${casas.length}`;
  $('#ordem-lista-casas').textContent = !lista.length ? 'Nenhuma casa passa nos filtros escolhidos.' : comGps ? 'Da mais perto para a mais longe de você. Toque para ver os detalhes.' : 'Por rua e número. Ligue o GPS para ver as mais perto primeiro.';
  $('#lista-casas-mapa').innerHTML = lista.map(c => {
    const aberta = abertaAgora(c); const vis = visitadas.has(c.id);
    const etqs = [statusCasa(c).texto].concat((c.oferece || []).map(k => rotuloDe(OFERECE, k)), (c.flags || []).filter(k => k === 'pequenos' || k === 'cachorro').map(k => rotuloDe(FLAGS, k)));
    return `<li><button type="button" class="casa-item ${vis ? 'visitada' : ''} ${aberta ? '' : 'fechada'}" data-ver-casa="${h(c.id)}">
      <span class="pin pin-lista ${c.esgotado ? 'esgotada' : aberta ? '' : 'fechada'} ${vis ? 'visitada' : ''}" aria-hidden="true">${PIN_SVG}<span class="num">${h(c.numero)}</span></span>
      <span class="res-txt"><b>${c.familia ? h(c.familia) : nomeCasa(c)}</b><span>${c.familia ? nomeCasa(c) : 'Casa participante'}${comGps ? ' · ' + fmtM(distM(posicao, c)) : ''}</span><span class="mini-etq">${etqs.map(h).join(' · ')}</span>${c.esgotado ? '<span class="balao-obs balao-ficha balao-esgotado"><span class="balao-quem">Aviso da casa</span><span class="mini-obs">Os doces acabaram! Obrigado pela visita.</span></span>' : c.obs ? `<span class="balao-obs balao-ficha"><span class="balao-quem">Recado da casa</span><span class="mini-obs">${h(c.obs)}</span></span>` : ''}</span>
      ${vis ? `<span class="casa-visitada" title="Visitada">${IC.check}</span>` : '<span class="res-seta" aria-hidden="true">›</span>'}
    </button></li>`;
  }).join('');
}
function verTodas() { const pts = casas.filter(c => typeof c.lat === 'number').map(c => [c.lat, c.lng]); if (posicao) pts.push([posicao.lat, posicao.lng]); if (evento.portaria) pts.push([evento.portaria.lat, evento.portaria.lng]); if (pts.length) mapa.fitBounds(pts, {padding: [40, 40], maxZoom: 18}); }

/* ---------- GPS ---------- */
let gpsWatch = null, gpsCentrado = false;
function ligarGPS(centrar) {
  const st = $('#gps-status');
  if (!('geolocation' in navigator)) { st.textContent = 'Este aparelho não tem GPS disponível.'; st.className = 'gps-status erro'; return; }
  if (gpsWatch != null) { if (centrar && posicao) mapa.setView([posicao.lat, posicao.lng], Math.max(mapa.getZoom(), 17)); return; }
  st.textContent = 'Procurando satélites…'; st.className = 'gps-status';
  setTimeout(renderGpsCartao, 0);
  gpsWatch = navigator.geolocation.watchPosition(p => {
    posicao = {lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy, heading: p.coords.heading, t: Date.now()};
    if (posicao.heading != null && !Number.isNaN(posicao.heading) && p.coords.speed > 0.7) rumo = posicao.heading;
    st.textContent = `GPS ativo · precisão ${Math.round(posicao.acc)} m`; st.className = 'gps-status ok';
    if (!marcadorEu) { marcadorEu = L.marker([posicao.lat, posicao.lng], {icon: L.divIcon({className: 'eu-wrap', iconSize: [26, 26], iconAnchor: [13, 13], html: '<div class="eu"><i></i><b></b></div>'}), interactive: false, zIndexOffset: 2000}).addTo(mapa); circuloAcc = L.circle([posicao.lat, posicao.lng], {radius: posicao.acc, color: '#8df06a', weight: 1, fillOpacity: .08, interactive: false}).addTo(mapa); }
    else { marcadorEu.setLatLng([posicao.lat, posicao.lng]); circuloAcc.setLatLng([posicao.lat, posicao.lng]).setRadius(posicao.acc); }
    atualizarRumoVisual();
    // No modo caminhada entra no zoom 18; se a pessoa aproximar ou afastar (entre 16 e 19), respeita enquanto segue.
    if (caminhando && modoSeguir) { const z = Math.min(19, Math.max(16, mapa.getZoom())); mapa.setView(centroDeslocado(posicao, z), z, {animate: !reduzMovimento}); gpsCentrado = true; }
    else if ((centrar && !gpsCentrado) || modoSeguir) { mapa.setView([posicao.lat, posicao.lng], Math.max(mapa.getZoom(), 17)); gpsCentrado = true; }
    gpsErro = null; atualizarBoasVindasGPS(); renderGpsCartao(); aoMoverGPS();
    if (Date.now() - (window.__listaT || 0) > 15000) { window.__listaT = Date.now(); renderListaCasas(); } renderPartida(); if (!$('#guia').hidden) renderGuia();
  }, e => { gpsErro = e.code; atualizarBoasVindasGPS(); renderGpsCartao(); st.textContent = e.code === 1 ? (IOS ? 'Localização bloqueada no iPhone. Veja como liberar logo acima do mapa.' : 'Localização bloqueada. Libere nas configurações do navegador para este site.') : e.code === 2 ? 'O GPS do celular parece desligado. Ligue a localização nas configurações.' : 'Não consegui pegar sua posição agora.'; st.className = 'gps-status erro'; gpsWatch = null; }, {enableHighAccuracy: true, maximumAge: 3000, timeout: 20000});
  ligarBussola();
}
let modoSeguir = false;
// "Acabaram os doces": a casa continua no mapa e na rota, só muda a cor da abóbora e aparece um aviso na lista.
async function alternarEsgotado(c) {
  const novo = !c.esgotado;
  const ok = await salvarSeguro(() => fb.fs.updateDoc(fb.casa(cid, c.id), {esgotado: novo, atualizadoEm: Date.now()}),
    novo ? 'Avisamos que os doces acabaram. Obrigado por participar!' : 'Oba! A casa voltou a ter doces.');
  if (ok) { SFX.plim(); evento_('esgotou', {estado: novo ? 1 : 0}); }
  return ok;
}
function htmlEsgotou(c) {
  return `<div class="esgotou-txt"><b>${c.esgotado ? 'Sua casa está sem doces' : 'Sua casa está no mapa'}</b><span>${c.esgotado ? 'A abóbora ficou roxa e a lista avisa as famílias.' : 'Se os doces acabarem, avise com um toque.'}</span></div>
    <button type="button" class="btn ${c.esgotado ? 'btn-sucesso' : 'btn-primario'}" data-esgotou="${h(c.id)}">${c.esgotado ? 'Voltei a ter doces' : 'Acabaram os doces'}</button>`;
}
function renderEsgotou() {
  const minha = usuario && cid && ehAnoAtual() ? minhaCasa() : null, m = momentosEvento(), agora = Date.now();
  const noDia = !!(m && agora >= m.dia.getTime() && agora <= m.fim.getTime() + 3 * 36e5);
  const bm = $('#esgotou-mapa'); bm.hidden = !(minha && noDia); if (!bm.hidden) bm.innerHTML = htmlEsgotou(minha);
  const bf = $('#esgotou-form'); bf.hidden = !(minha && editandoId === minha.id); if (!bf.hidden) bf.innerHTML = htmlEsgotou(minha);
}
function renderGpsCartao() {
  const c = $('#gps-cartao'); if (!c) return;
  if (posicao || !('geolocation' in navigator)) { c.hidden = true; return; }
  if (gpsErro === 1) c.innerHTML = `<b>A localização está bloqueada</b><p class="dica">${IOS ? 'No iPhone: abra Ajustes, Privacidade e Segurança, Serviços de Localização. Deixe ligado e, em <b>Sites do Safari</b>, escolha <b>Durante o Uso</b>. Depois, no Safari, toque em "aA" na barra de endereço, Ajustes do Site, Localização: Permitir. Recarregue a página.' : 'Toque no cadeado ao lado do endereço, Permissões, Localização: Permitir. Confira também se a localização do celular está ligada. Recarregue a página.'}</p><button class="btn btn-fantasma btn-p" data-ligar-gps>Tentar de novo</button>`;
  else if (gpsErro === 2 || gpsErro === 3) c.innerHTML = `<b>Não achei o GPS</b><p class="dica">Ligue a localização do celular${IOS ? ' em Ajustes, Privacidade e Segurança, Serviços de Localização' : ''} e tente de novo. Se abriu pelo WhatsApp, abra no ${IOS ? 'Safari' : 'Chrome'}.</p><button class="btn btn-primario btn-p" data-ligar-gps>Tentar de novo</button>`;
  else if (gpsWatch != null) c.innerHTML = `<p class="res-carregando gps-procurando">${SPIN}<span>Procurando satélites… Se o celular perguntar, toque em <b>Permitir</b>.</span></p>`;
  else c.innerHTML = `<b>Ligue o GPS para ver onde você está</b><p class="dica">O celular vai perguntar se pode usar sua localização: toque em <b>Permitir</b>.</p><button class="btn btn-primario" data-ligar-gps>${IC.alvo} Ligar GPS</button>`;
  // O Drácula acompanha o pedido do GPS (tocar nele faz o som dele, como no resto do cenário).
  c.innerHTML = `<div class="gps-linha"><div class="gps-txt">${c.innerHTML}</div><div class="gps-drac">${DRACULA}</div></div>`;
  c.hidden = false;
}
let gpsErro = null;
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
/* ---------- rotas a pé pelas ruas (Valhalla e OSRM do OpenStreetMap via FOSSGIS, gratuitos) ---------- */
const ROTEADOR = 'https://routing.openstreetmap.de/routed-foot';
async function osrm(servico, pts, params) {
  const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 8000);
  try {
    const coords = pts.map(p => `${(+p.lng).toFixed(6)},${(+p.lat).toFixed(6)}`).join(';');
    const r = await carga(fetch(`${ROTEADOR}/${servico}/v1/driving/${coords}?${params}`, {signal: ctl.signal, referrerPolicy: 'strict-origin'}));
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const d = await r.json(); if (d.code !== 'Ok') throw new Error(d.code); return d;
  } finally { clearTimeout(tm); }
}
// O OSRM a pé ignora ruas marcadas como particulares (quase todo condomínio) e encaixa a casa na rua pública mais perto, longe demais.
// O Valhalla, também da FOSSGIS, passa pelas ruas do condomínio. A resposta vira o formato do OSRM para o resto do código não mudar.
const ROTEADOR_V = 'https://valhalla1.openstreetmap.de';
const MANOBRA_V = {1: ['depart'], 2: ['depart', 'right'], 3: ['depart', 'left'], 4: ['arrive'], 5: ['arrive', 'right'], 6: ['arrive', 'left'], 7: ['new name', 'straight'], 8: ['continue', 'straight'], 9: ['turn', 'slight right'], 10: ['turn', 'right'], 11: ['turn', 'sharp right'], 12: ['turn', 'uturn'], 13: ['turn', 'uturn'], 14: ['turn', 'sharp left'], 15: ['turn', 'left'], 16: ['turn', 'slight left'], 17: ['continue', 'straight'], 18: ['turn', 'slight right'], 19: ['turn', 'slight left'], 20: ['turn', 'right'], 21: ['turn', 'left'], 22: ['continue', 'straight'], 23: ['fork', 'slight right'], 24: ['fork', 'slight left'], 25: ['merge', 'straight'], 26: ['roundabout'], 27: ['exit roundabout'], 37: ['merge', 'slight right'], 38: ['merge', 'slight left']};
// A forma do trecho vem como polyline com 6 casas decimais.
function decodificarLinha6(s) { const pts = []; let i = 0, lat = 0, lng = 0; while (i < s.length) { for (const k of [0, 1]) { let r = 0, sh = 0, b; do { b = s.charCodeAt(i++) - 63; r |= (b & 31) << sh; sh += 5; } while (b >= 32); const d = r & 1 ? ~(r >> 1) : r >> 1; if (k) lng += d; else lat += d; } pts.push([lat / 1e6, lng / 1e6]); } return pts; }
async function valhalla(pts) {
  const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 9000);
  try {
    const corpo = {locations: pts.map(p => ({lat: +(+p.lat).toFixed(6), lon: +(+p.lng).toFixed(6)})), costing: 'pedestrian', directions_options: {language: 'pt-BR', units: 'kilometers'}};
    const r = await carga(fetch(`${ROTEADOR_V}/route?json=${encodeURIComponent(JSON.stringify(corpo))}`, {signal: ctl.signal, referrerPolicy: 'strict-origin'}));
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const t = (await r.json()).trip; if (!t || t.status !== 0 || !t.legs) throw new Error('valhalla ' + (t && t.status_message));
    // "distance" do waypoint = quanto o ponto foi encaixado na rua, medido pelas pontas da forma de cada trecho
    const waypoints = pts.map(() => ({distance: 0}));
    const legs = t.legs.map((leg, i) => {
      const forma = decodificarLinha6(leg.shape || ''); if (forma.length < 2) throw new Error('trecho sem forma');
      [[i, forma[0]], [i + 1, forma[forma.length - 1]]].forEach(([k, q]) => { waypoints[k].distance = Math.max(waypoints[k].distance, distM(pts[k], {lat: q[0], lng: q[1]})); });
      const steps = (leg.maneuvers || []).map(m => { const [type, modifier] = MANOBRA_V[m.type] || ['continue', 'straight']; return {distance: (m.length || 0) * 1000, name: (m.street_names || [])[0] || '', maneuver: {type, modifier}, geometry: {coordinates: forma.slice(m.begin_shape_index, m.end_shape_index + 1).map(([la, lo]) => [lo, la])}}; });
      return {distance: (leg.summary.length || 0) * 1000, steps};
    });
    return {code: 'Ok', routes: [{distance: legs.reduce((t, l) => t + l.distance, 0), legs}], waypoints, largo: true};
  } finally { clearTimeout(tm); }
}
// Caminho pelas ruas: Valhalla em partes de até 10 pontos, um pedido por segundo (regra da FOSSGIS). Se falhar, OSRM.
async function rotaRuas(pts, params) {
  try {
    const legs = [], waypoints = [];
    for (let k = 0; k < pts.length - 1; k += 9) {
      if (k) await new Promise(ok => setTimeout(ok, 1000));
      const d = await valhalla(pts.slice(k, k + 10));
      d.routes[0].legs.forEach(l => legs.push(l)); d.waypoints.forEach((w, j) => { const q = waypoints[k + j]; waypoints[k + j] = q ? {distance: Math.max(q.distance, w.distance)} : w; });
    }
    return {code: 'Ok', routes: [{distance: legs.reduce((t, l) => t + l.distance, 0), legs}], waypoints, largo: true};
  } catch (e) { console.warn('Valhalla indisponível, tentando OSRM.', e); return osrm('route', pts, params); }
}
let rotaLinha = null, rotaPernas = null, rotaChave = '', rotaCarregando = false;
let rotaTrechos = null;   // [{pts:[[lat,lng]...], ruas:bool}] por trecho entre paradas
// Ruas de condomínio costumam estar marcadas como particulares no OpenStreetMap; o roteador a pé dá a volta por fora.
// Se o caminho pelas ruas for bem maior que a linha reta, ele não serve: usamos a linha direta.
// Com o Valhalla (que anda pelas ruas do condomínio) a folga é maior: em ruas que dão voltas, 120 m em linha reta viram 450 m a pé.
const plausivel = (m, a, b, largo) => { const r = distM(a, b); return typeof m === 'number' && m <= (largo ? Math.max(3.5 * r, r + 600) : Math.max(2.2 * r, r + 300)); };
// O roteador "encaixa" cada ponto na rua mais próxima; se o encaixe ficou longe, o ponto não está numa rua roteável (lotes fundos chegam a uns 50 m).
const ENCAIXE_MAX = 60;
const encaixeOk = w => !!w && typeof w.distance === 'number' && w.distance <= ENCAIXE_MAX;
let roteiroAberto = false;   // true enquanto a pessoa reabriu as opções para montar outro roteiro
let trecho = null, trechoBuscando = false, trechoT = 0;
const chaveRoteiro = () => roteiro ? roteiro.criado + ':' + roteiro.ordem.join(',') : '';
async function carregarRotaLinha() {
  if (!roteiro || rotaCarregando) return; const chave = chaveRoteiro(); if (chave === rotaChave && rotaTrechos) return;
  const pts = [roteiro.de].concat(roteiro.ordem.map(casaPorId).filter(Boolean));
  if (pts.length < 2 || pts.length > 90) return;
  rotaCarregando = true; renderRoteiro();
  try {
    const d = await rotaRuas(pts, 'overview=false&steps=true&geometries=geojson');
    if (chave !== chaveRoteiro()) return;
    const legs = d.routes[0].legs;
    rotaTrechos = legs.map((leg, i) => {
      const a = pts[i], b = pts[i + 1];
      const ok = encaixeOk(d.waypoints[i]) && encaixeOk(d.waypoints[i + 1]) && plausivel(leg.distance, a, b, d.largo) && leg.distance > 0;
      if (!ok) return {pts: [[a.lat, a.lng], [b.lat, b.lng]], ruas: false, dist: distM(a, b)};
      const linha = []; leg.steps.forEach(s => (s.geometry.coordinates || []).forEach(([lng, lat]) => linha.push([lat, lng])));
      linha.unshift([a.lat, a.lng]); linha.push([b.lat, b.lng]);
      return {pts: linha, ruas: true, dist: leg.distance};
    });
    rotaPernas = rotaTrechos.map(x => x.dist); rotaLinha = true; rotaChave = chave;
  } catch (e) { console.warn('Rota pelas ruas indisponível, usando linha reta.', e); rotaTrechos = null; rotaLinha = null; rotaPernas = null; rotaChave = chave; }
  finally { rotaCarregando = false; renderPins(); renderRoteiro(); }
}
const MANOBRA = {left: 'vire à esquerda', right: 'vire à direita', 'slight left': 'siga levemente à esquerda', 'slight right': 'siga levemente à direita', 'sharp left': 'vire bem à esquerda', 'sharp right': 'vire bem à direita', straight: 'siga em frente', uturn: 'faça o retorno'};
function textoInstrucao(passos, fmt) {
  if (!passos || !passos.length) return '';
  let i = 0; while (i < passos.length - 1 && passos[i].distance < 8) i++;
  const ini = passos[i]; const prox = passos.slice(i + 1).find(s => !['arrive', 'new name', 'continue', 'depart'].includes(s.maneuver.type));
  let txt = `Siga${ini.name ? ' pela ' + ini.name : ''} por ${fmt(ini.distance)}`;
  if (prox) txt += ` e ${MANOBRA[prox.maneuver.modifier] || 'siga'}${prox.name ? ' na ' + prox.name : ''}`; else txt += ' até chegar';
  return txt + '.';
}
async function atualizarTrecho(forcar) {
  if (!roteiro) return null; const idx = proximaParada(); if (idx < 0) return null; const c = casaPorId(roteiro.ordem[idx]); const de = origemAtual(idx);
  if (!forcar && trecho && trecho.casaId === c.id && distM(trecho.de, de) < 30) return trecho;
  if (trechoBuscando || (!forcar && Date.now() - trechoT < 15000 && trecho && trecho.casaId === c.id)) return trecho;
  trechoBuscando = true; trechoT = Date.now(); if (!$('#guia').hidden) renderGuia();
  try {
    const d = await rotaRuas([de, c], 'overview=false&steps=true&geometries=geojson');
    const r = d.routes[0];
    const ok = encaixeOk(d.waypoints[0]) && encaixeOk(d.waypoints[1]) && plausivel(r.distance, de, c, d.largo) && r.distance > 0;
    // pts: a linha do trecho para desenhar no mapa; ini: onde cada passo começa nela (para medir até a próxima manobra).
    if (ok) { const passos = r.legs[0].steps, pts = [[de.lat, de.lng]], ini = []; passos.forEach(s => { ini.push(pts.length); (s.geometry.coordinates || []).forEach(([lng, lat]) => pts.push([lat, lng])); }); pts.push([c.lat, c.lng]); trecho = {casaId: c.id, de, dist: r.distance, passos, pts, ini}; }
    else trecho = {casaId: c.id, de, reta: true};
  } catch (e) { console.warn('Trecho a pé indisponível.', e); if (!trecho || trecho.casaId !== c.id) trecho = null; }
  finally { trechoBuscando = false; }
  renderPins(); if (caminhando && modoSeguir && !posFresca()) posicionarCaminhada();
  if (!$('#guia').hidden) renderGuia();
  return trecho;
}
function rotaLinhaBounds() { if (!roteiro) return null; const pts = [[roteiro.de.lat, roteiro.de.lng]].concat(roteiro.ordem.map(casaPorId).filter(Boolean).map(c => [c.lat, c.lng])); return pts.length > 1 ? pts : null; }
const trechoDe = c => trecho && !trecho.reta && c && trecho.casaId === c.id ? trecho : null;

function otimizar(de, lista, matriz) {
  const pts = [de, ...lista]; const n = pts.length; if (n < 2) return [];
  // Distância a pé da matriz quando existe; senão linha reta com um acréscimo pelas curvas das ruas.
  const dist = (a, b) => { const v = matriz && matriz[a] && matriz[a][b]; return plausivel(v, pts[a], pts[b]) ? v : distM(pts[a], pts[b]) * 1.3; };
  const resto = []; for (let i = 1; i < n; i++) resto.push(i);
  const ordem = [0]; let atual = 0;
  while (resto.length) { let bi = 0, bd = Infinity; resto.forEach((k, i) => { const d = dist(atual, k); if (d < bd) { bd = d; bi = i; } }); atual = resto[bi]; ordem.push(atual); resto.splice(bi, 1); }
  const c = (i, j) => dist(ordem[i], ordem[j]); let melhorou = true, iter = 0;
  while (melhorou && iter++ < 80) { melhorou = false; for (let i = 1; i < n - 1; i++) for (let j = i + 1; j < n; j++) { const antes = c(i - 1, i) + (j < n - 1 ? c(j, j + 1) : 0); const depois = c(i - 1, j) + (j < n - 1 ? c(i, j + 1) : 0); if (depois + 1e-6 < antes) { const seg = ordem.slice(i, j + 1).reverse(); ordem.splice(i, seg.length, ...seg); melhorou = true; } } }
  return ordem.slice(1).map(k => pts[k].id);
}
async function montarRoteiro() {
  if (partida === 'gps' && !posicao) { ligarGPS(true); toast('Ligando o GPS… toque de novo em alguns segundos, ou escolha a portaria.'); return; }
  const pp = pontoPartida(); if (!pp) { toast('Sem ponto de partida: ligue o GPS ou peça ao admin para marcar a portaria.'); return; }
  let lista = casas.filter(c => typeof c.lat === 'number' && 'casa:' + c.id !== partida);
  if ($('#opt-pular-visitadas').checked) lista = lista.filter(c => !visitadas.has(c.id));
  if ($('#opt-so-abertas').checked) lista = lista.filter(abertaAgora);
  if (!lista.length) { toast('Nenhuma casa para incluir com esses filtros.'); return; }
  const btn = $('#btn-montar'); btn.disabled = true; const txtBtn = btn.innerHTML; btn.innerHTML = `${SPIN} Calculando o caminho pelas ruas…`;
  let matriz = null;
  if (lista.length + 1 <= 80) {
    try {
      const tb = await osrm('table', [pp.p, ...lista], 'annotations=distance');
      // Pontos que não encaixaram numa rua pública ficam sem distância a pé (viram linha reta no cálculo).
      const ruim = (tb.sources || []).map(w => !encaixeOk(w));
      matriz = tb.distances.map((linha, a) => linha.map((v, b) => ruim[a] || ruim[b] ? null : v));
    } catch (e) { console.warn('Distâncias a pé indisponíveis, usando linha reta.', e); }
  }
  btn.disabled = false; btn.innerHTML = txtBtn;
  roteiroAberto = false;
  roteiro = {ordem: otimizar(pp.p, lista, matriz), de: pp.p, partida, criado: Date.now(), aPe: !!matriz}; lsa.set('roteiro', roteiro); anunciadoChegada = null; ultimaFalaDist = 0;
  rotaLinha = null; rotaPernas = null; rotaTrechos = null; trecho = null;
  SFX.sucesso(); renderRoteiro(); renderPins(); renderPlacar();
  // O mapa já se ajusta às casas, mas a tela vai para o botão do Modo caminhada, que segue a rota no próprio mapa.
  const pontos = [pp.p, ...roteiro.ordem.map(casaPorId).filter(Boolean)].map(c => [c.lat, c.lng]);
  if (pontos.length > 1) mapa.fitBounds(pontos, {padding: [60, 60], maxZoom: 18});
  const bn = $('#btn-caminhar'); bn.scrollIntoView({behavior: reduzMovimento ? 'auto' : 'smooth', block: 'center'});
  bn.classList.remove('chamar'); void bn.offsetWidth; bn.classList.add('chamar'); setTimeout(() => bn.classList.remove('chamar'), 3600);
  const n = roteiro.ordem.length; toast(`Roteiro com ${n} casa${n > 1 ? 's' : ''} pronto!`); evento_('roteiro_montado', {casas: n, a_pe: matriz ? 1 : 0});
  carregarRotaLinha(); await atualizarTrecho(true);
  // Fala curta: a dica do Modo caminhada sempre; a primeira casa, só com o guia por voz ligado.
  const idxFala = proximaParada();
  falar(`Roteiro pronto, ${n} casa${n > 1 ? 's' : ''}. Toque em Modo caminhada. ` + (vozAuto && idxFala >= 0 ? falaParada(idxFala) : ''));
  if (rotaLinhaBounds()) mapa.fitBounds(rotaLinhaBounds(), {padding: [60, 60], maxZoom: 18});
}
function proximaParada() { if (!roteiro) return -1; return roteiro.ordem.findIndex(id => !visitadas.has(id) && casaPorId(id)); }
function origemAtual(idx) { if (posicao && Date.now() - posicao.t < 60000) return {lat: posicao.lat, lng: posicao.lng}; for (let i = idx - 1; i >= 0; i--) { const c = casaPorId(roteiro.ordem[i]); if (c) return {lat: c.lat, lng: c.lng}; } return roteiro.de; }
// Fala curta: casa, família, distância e a próxima manobra. Só avisa o que muda a visita (cachorro, fechada); o resto fica na tela.
function falaParada(idx) {
  const c = casaPorId(roteiro.ordem[idx]); if (!c) return '';
  const de = origemAtual(idx); const tr = trechoDe(c); const d = tr ? tr.dist : distM(de, c);
  let s = `Casa ${c.numero}${c.familia ? ', ' + c.familia : ''}. ${falaM(d)}. `;
  s += tr ? `${instrucaoAtual(tr, posFresca() ? posicao : null).texto}. ` : `${maiuscula(direcaoFala(de, c))}. `;
  if ((c.flags || []).includes('cachorro')) s += 'Tem cachorro. ';
  if (!abertaAgora(c)) { const j = janelaCasa(c); s += j && Date.now() > j.fim ? 'Já fechou. ' : `Abre às ${horario(c).ini || 'hora do evento'}. `; }
  return s;
}
let anunciadoChegada = null, ultimaFalaDist = 0, ultimaFalaT = 0, ultimaFalaTexto = '';
function aoMoverGPS() {
  if (!roteiro || !posicao) return; const idx = proximaParada(); if (idx < 0) return; const c = casaPorId(roteiro.ordem[idx]); const d = distM(posicao, c);
  if (autoChegada && d <= 25 && anunciadoChegada !== c.id) { anunciadoChegada = c.id; SFX.plim(); if (!caminhando) toast(`Você chegou: ${nomeCasaTxt(c)}!`); if (vozAuto) falar(`Chegou! Casa ${c.numero}${c.familia ? ', ' + c.familia : ''}.`); return; }
  atualizarTrecho(false);
  const tr = trechoDe(c); const dRest = tr ? Math.max(d, tr.dist - distM(tr.de, posicao)) : d;
  // Fala a manobra quando ela muda (como um GPS) ou a cada 100 m / 40 s; antes falava a cada 60 m e era prolixo.
  const txt = tr ? instrucaoAtual(tr, posicao).texto : direcaoFala(posicao, c), passou = Date.now() - ultimaFalaT;
  if (vozAuto && d > 40 && !VOZ.falando && ((txt !== ultimaFalaTexto && passou > 10000) || (Math.abs(dRest - ultimaFalaDist) >= 100 && passou > 40000))) { ultimaFalaDist = dRest; ultimaFalaT = Date.now(); ultimaFalaTexto = txt; falar(tr ? `${falaM(dRest)}. ${txt}.` : `${falaM(d)}, ${txt}.`); }
}
function marcarVisitada(id, sim = true) { if (sim) visitadas.add(id); else visitadas.delete(id); lsa.set('visitadas', [...visitadas]); renderRoteiro(); renderPins(); renderPlacar(); }
async function cheguei() {
  const idx = proximaParada(); if (idx < 0) return; evento_('chegou_na_casa'); marcarVisitada(roteiro.ordem[idx], true); SFX.sucesso(); anunciadoChegada = null; ultimaFalaDist = 0; ultimaFalaTexto = ''; trecho = null;
  const b = $(caminhando ? '#cam-cheguei' : '#btn-cheguei'); const r = b.getBoundingClientRect(); explodir(r.left + r.width / 2, r.top + r.height / 2);
  const prox = proximaParada();
  if (prox < 0) { if (!caminhando) toast('Roteiro concluído! Feliz Halloween!'); if (vozAuto) falar('Última casa! Roteiro concluído. Feliz Halloween!'); }
  else { await atualizarTrecho(true); if (vozAuto) falar('Próxima: ' + falaParada(prox)); }
}
function pararNavegacao() {
  evento_('navegacao_parada'); sairCaminhada(false, true);
  roteiro = null; lsa.set('roteiro', null); trecho = null; rotaTrechos = null; rotaLinha = null; rotaPernas = null; rotaChave = ''; anunciadoChegada = null; modoSeguir = false;
  try { speechSynthesis.cancel(); } catch {} abaixarMusica(false);
  renderRoteiro(); renderPins(); renderPlacar(); SFX.pop(); toast('Navegação encerrada. As casas visitadas continuam marcadas.');
  $('#mapa').scrollIntoView({behavior: reduzMovimento ? 'auto' : 'smooth', block: 'start'});
}
async function pularParada() { const idx = proximaParada(); if (idx < 0) return; const id = roteiro.ordem.splice(idx, 1)[0]; roteiro.ordem.push(id); lsa.set('roteiro', roteiro); SFX.pop(); anunciadoChegada = null; trecho = null; renderRoteiro(); renderPins(); carregarRotaLinha(); const prox = proximaParada(); if (prox >= 0) { await atualizarTrecho(true); if (vozAuto) falar('Pulando. Próxima: ' + falaParada(prox)); } }

/* ---------- modo caminhada: mapa em tela cheia seguindo a pessoa, instrução e botões juntos ---------- */
let caminhando = false, caminhadaVista = false, fimFestejado = false, bloqueioTela = null;
const posFresca = () => posicao && Date.now() - posicao.t < 60000 ? posicao : null;
// Tela acesa enquanto anda: o celular apagando no meio do caminho faz perder a instrução e o GPS.
async function manterTelaAcesa(on) {
  try { if (on && 'wakeLock' in navigator) { const b = await navigator.wakeLock.request('screen'); if (caminhando) bloqueioTela = b; else b.release(); } else if (!on && bloqueioTela) { const b = bloqueioTela; bloqueioTela = null; await b.release(); } } catch {}
}
// O navegador solta a tela acesa quando a página some (trocar de app); ao voltar, pede de novo.
document.addEventListener('visibilitychange', () => { if (!document.hidden && caminhando) manterTelaAcesa(true); });
// Centro do mapa um pouco ao norte da pessoa: a bolinha fica no terço de baixo e sobra mais mapa à frente.
function centroDeslocado(p, z) { const pt = mapa.project([p.lat, p.lng], z); pt.y -= mapa.getSize().y * 0.15; return mapa.unproject(pt, z); }
// Distância ao longo do caminho: projeta a posição no segmento mais próximo da linha (plano local em metros, basta num condomínio).
function acumulado(pts) { const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + distM({lat: pts[i - 1][0], lng: pts[i - 1][1]}, {lat: pts[i][0], lng: pts[i][1]})); return cum; }
function posNaLinha(pts, cum, p) {
  const kx = 111320 * Math.cos(p.lat * Math.PI / 180), ky = 110540; let melhor = Infinity, s = 0;
  for (let i = 1; i < pts.length; i++) {
    const ax = (pts[i - 1][1] - p.lng) * kx, ay = (pts[i - 1][0] - p.lat) * ky, dx = (pts[i][1] - pts[i - 1][1]) * kx, dy = (pts[i][0] - pts[i - 1][0]) * ky, l2 = dx * dx + dy * dy;
    const t = l2 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / l2)) : 0, qx = ax + t * dx, qy = ay + t * dy, d = qx * qx + qy * qy;
    if (d < melhor) { melhor = d; s = cum[i - 1] + t * (cum[i] - cum[i - 1]); }
  }
  return s;
}
const SEM_MANOBRA = ['arrive', 'new name', 'continue', 'depart'];
const maiuscula = t => t.charAt(0).toUpperCase() + t.slice(1);
// Mesma escolha de passos do texto falado (pula passos < 8 m; manobra = próxima que não é chegada/mudança de nome/seguir).
// Com GPS, mede a partir de onde a pessoa está na linha, então a distância diminui enquanto anda, entre uma busca e outra.
function instrucaoAtual(tr, p) {
  const ps = tr.passos || []; if (!ps.length) return {icone: 'arrive', texto: 'Siga até a casa', dist: tr.dist, resta: tr.dist};
  if (!tr.cum && tr.pts) tr.cum = acumulado(tr.pts);
  const cum = tr.cum, s = p && cum ? posNaLinha(tr.pts, cum, p) : 0, inicio = k => cum && tr.ini ? cum[tr.ini[k]] : ps.slice(0, k).reduce((t, x) => t + x.distance, 0);
  let i = 0; for (let k = 1; k < ps.length; k++) if (inicio(k) <= s + 2) i = k;
  while (i < ps.length - 1 && ps[i].distance < 8) i++;
  const k = ps.findIndex((x, j) => j > i && !SEM_MANOBRA.includes(x.maneuver.type)), prox = k >= 0 ? ps[k] : null, ini = ps[i];
  const fim = cum ? cum[cum.length - 1] : tr.dist, mod = prox && prox.maneuver.modifier;
  const texto = prox ? `${maiuscula(MANOBRA[mod] || 'siga em frente')}${prox.name ? ' na ' + prox.name : ''}` : `Siga${ini.name ? ' pela ' + ini.name : ''} até a casa`;
  return {icone: prox ? (SETA[mod] ? mod : 'straight') : 'arrive', texto, dist: Math.max(0, (prox ? inicio(k) : fim) - s), resta: Math.max(0, tr.dist - s)};
}
const minutosAPe = m => Math.max(1, Math.round(m / 70));
// Só troca o conteúdo quando muda: o aviso para leitor de tela não repete e a seta não pisca a cada GPS.
function poeTexto(el, t) { if (el.textContent !== t) el.textContent = t; }
function poeHtml(el, k, html) { if (el.dataset.k !== k) { el.dataset.k = k; el.innerHTML = html; } }
function renderRecentrar() { $('#cam-recentrar').hidden = !caminhando || modoSeguir; }
function renderCaminhada() {
  renderRecentrar(); if (!caminhando) return;
  const idx = roteiro ? proximaParada() : -1, fim = idx < 0; let k, seta, instr, meta, parada = '', chegou = false;
  if (fim) { k = 'fim'; seta = SETA.festa; instr = 'Roteiro concluído!'; meta = 'Sacola cheia? Feliz Halloween!'; parada = roteiro ? `${roteiro.ordem.length} paradas feitas` : ''; if (!fimFestejado) { fimFestejado = true; SFX.festa(); } }
  else {
    fimFestejado = false;
    const c = casaPorId(roteiro.ordem[idx]), tr = trechoDe(c), de = origemAtual(idx);
    parada = `Parada ${idx + 1} de ${roteiro.ordem.length} · Casa ${c.numero}${c.familia ? ' · ' + c.familia : ''}`;
    if (anunciadoChegada === c.id) { chegou = true; k = 'arrive'; seta = SETA.arrive; instr = 'Você chegou!'; meta = 'Pegue os doces e toque em Cheguei'; }
    else if (tr) { const ia = instrucaoAtual(tr, posFresca()); k = ia.icone; seta = SETA[ia.icone]; instr = ia.texto; meta = `${fmtM(ia.dist)} · ~${minutosAPe(ia.resta)} min`; }
    else if (trechoBuscando && !(trecho && trecho.casaId === c.id)) { k = 'busca'; seta = SPIN; instr = 'Procurando o caminho pelas ruas…'; meta = `${fmtM(distM(de, c))} em linha reta`; }
    else { const g = Math.round(rumoGraus(de, c) / 5) * 5 % 360, d = distM(de, c); k = 'bussola' + g; seta = SETA.bussola(g); instr = `Siga ${fmtM(d)} ${direcaoFala(de, c)}`; meta = `Sem caminho pelas ruas · ~${minutosAPe(d * 1.3)} min`; }
    $('#cam-pular').disabled = roteiro.ordem.filter(id => !visitadas.has(id) && casaPorId(id)).length < 2;
    const partes = partesRotaGoogle(); if (partes.length) $('#cam-google').href = partes[0].url;
  }
  poeHtml($('#cam-seta'), k, seta); $('#cam-seta').classList.toggle('chegou', chegou || fim); poeTexto($('#cam-instrucao'), instr); poeTexto($('#cam-meta'), meta); poeTexto($('#cam-parada'), parada);
  const b = $('#cam-cheguei'); b.classList.toggle('chegou', chegou); b.classList.toggle('pulsar', chegou && !reduzMovimento);
  ['#cam-cheguei', '#cam-pular', '#cam-ouvir', '#cam-google'].forEach(s => { $(s).hidden = fim; }); $('#cam-fim-sair').hidden = !fim; $('#cam-base').classList.toggle('fim', fim);
  medirCaminhada();
}
// Altura real das barras: os botões do mapa, a atribuição e os avisos ficam fora de baixo delas.
function medirCaminhada() {
  if (!caminhando) return; const t = $('#cam-topo').getBoundingClientRect(), b = $('#cam-base').getBoundingClientRect(), st = document.body.style;
  st.setProperty('--cam-topo-h', Math.round(t.bottom) + 'px'); st.setProperty('--cam-base-h', Math.round(innerHeight - b.top) + 'px');
}
// Com GPS, segue a pessoa; sem GPS, mostra o trecho inteiro até a próxima casa entre as duas barras.
function posicionarCaminhada() {
  if (!caminhando || !mapa) return; const p = posFresca(); if (p) { mapa.setView(centroDeslocado(p, 18), 18, {animate: false}); return; }
  const idx = proximaParada(); if (idx < 0) return; const c = casaPorId(roteiro.ordem[idx]), de = origemAtual(idx);
  const pts = trecho && trecho.casaId === c.id && trecho.pts ? trecho.pts : [[de.lat, de.lng], [c.lat, c.lng]];
  const th = $('#cam-topo').getBoundingClientRect().bottom, bh = innerHeight - $('#cam-base').getBoundingClientRect().top;
  mapa.fitBounds(pts, {paddingTopLeft: [20, th + 20], paddingBottomRight: [20, bh + 20], maxZoom: 18, animate: false});
}
function recentrarCaminhada() { modoSeguir = true; $('#btn-centrar').setAttribute('aria-pressed', 'true'); renderRecentrar(); ligarGPS(false); posicionarCaminhada(); }
function entrarCaminhada(restaurando) {
  if (!roteiro || !mapa || proximaParada() < 0) return;
  if (abaAtual !== 'mapa') irAba('mapa'); fecharFolha();
  caminhando = true; caminhadaVista = true; lsa.set('caminhando', true); document.body.classList.add('caminhando');
  $('#cam-topo').hidden = false; $('#cam-base').hidden = false;
  modoSeguir = true; $('#btn-centrar').setAttribute('aria-pressed', 'true');
  // GPS sem centralizar aqui: a animação de zoom do ligarGPS(true) terminaria depois e desfaria o zoom 18 posicionado abaixo.
  ligarGPS(false); manterTelaAcesa(true); renderPins(); renderCaminhada();
  // O mapa muda de tamanho com a troca de layout: o Leaflet precisa medir de novo antes de posicionar.
  setTimeout(() => { if (!caminhando) return; mapa.invalidateSize(); medirCaminhada(); posicionarCaminhada(); }, 60);
  atualizarTrecho(true);
  if (!restaurando) { SFX.plim(); evento_('modo_caminhada'); }
}
function sairCaminhada(manter, semRolar) {
  if (!caminhando) return;
  caminhando = false; if (!manter) lsa.set('caminhando', false); document.body.classList.remove('caminhando');
  $('#cam-topo').hidden = true; $('#cam-base').hidden = true; $('#cam-recentrar').hidden = true;
  modoSeguir = false; $('#btn-centrar').setAttribute('aria-pressed', 'false'); manterTelaAcesa(false); fimFestejado = false;
  if (mapa) { mapa.invalidateSize(); setTimeout(() => mapa.invalidateSize(), 60); }
  if (!semRolar && !manter && !$('#guia').hidden) $('#guia').scrollIntoView({behavior: 'auto', block: 'start'});
  renderPins();
}
// Recarregou a página no meio do caminho: volta para o modo caminhada sozinho (uma vez por condomínio aberto).
function restaurarCaminhada() {
  if (caminhadaVista || caminhando || !roteiro || !mapa || !casasCarregadas || !podeVerCasas || $('#mapa-bloco').hidden) return;
  caminhadaVista = true; if (lsa.get('caminhando', false) && proximaParada() >= 0) entrarCaminhada(true);
}

/* ---------- voz ---------- */
const VOZ = {falando: false};
function temVoz() { return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window; }
function vozPT() { try { const vs = speechSynthesis.getVoices(); return vs.find(v => /pt[-_]BR/i.test(v.lang) && /Google|Luciana|Francisca|Natural/i.test(v.name)) || vs.find(v => /pt[-_]BR/i.test(v.lang)) || vs.find(v => /^pt/i.test(v.lang)) || null; } catch { return null; } }
function falar(texto) {
  if (!temVoz()) { toast('Este navegador não tem voz. Leia a parada na tela.'); return; }
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(texto); u.lang = 'pt-BR'; const v = vozPT(); if (v) u.voice = v; u.rate = 1;
    u.onstart = () => { VOZ.falando = true; abaixarMusica(true); $('#guia').classList.add('falando'); };
    u.onend = u.onerror = () => { VOZ.falando = false; abaixarMusica(false); $('#guia').classList.remove('falando'); };
    speechSynthesis.speak(u); } catch { toast('Não consegui falar agora.'); }
}
if (temVoz()) { try { speechSynthesis.getVoices(); speechSynthesis.addEventListener('voiceschanged', () => {}); } catch {} }

/* ---------- áudio: música procedural + efeitos ---------- */
const AUDIO = {ctx: null, master: null, musicaGain: null, tocando: false, timer: null, proxBatida: 0, passo: 0, ruido: null};
function destravarAudioIOS() {
  try { if (navigator.audioSession && navigator.audioSession.type !== 'playback') navigator.audioSession.type = 'playback'; } catch {}
  if (AUDIO.tag) return;
  // Um áudio silencioso em loop coloca a página na categoria "mídia": no iPhone o som sai mesmo com a chave do silencioso.
  const sr = 8000, n = sr / 2, buf = new ArrayBuffer(44 + n), v = new DataView(buf); const w = (o, s) => [...s].forEach((ch, i) => v.setUint8(o + i, ch.charCodeAt(0)));
  w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); w(36, 'data'); v.setUint32(40, n, true);
  for (let i = 0; i < n; i++) v.setUint8(44 + i, 128);
  try { const a = new Audio(URL.createObjectURL(new Blob([buf], {type: 'audio/wav'}))); a.loop = true; a.setAttribute('playsinline', ''); a.setAttribute('x-webkit-airplay', 'deny'); const p = a.play(); if (p) p.catch(() => {}); AUDIO.tag = a; } catch {}
}
function ctxAudio() {
  destravarAudioIOS();
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
function mostrarDicaMusica() {
  const d = $('#dica-musica'); if (!d || AUDIO.tocando) return;
  d.hidden = false; clearTimeout(d._t); d._t = setTimeout(() => { d.hidden = true; }, 9000);
}
function alternarMusica(forcar) {
  const dm = $('#dica-musica'); if (dm) dm.hidden = true;
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

/* ---------- sons extras para crianças ---------- */
Object.assign(SFX, {
  boing() { const c = ctxAudio(); if (!c) return; tocarTom(c.currentTime, 160, .35, 'sine', .28, AUDIO.master, {para: 520, ataque: .005}); tocarTom(c.currentTime + .12, 520, .25, 'sine', .14, AUDIO.master, {para: 260, ataque: .005}); },
  tique() { const c = ctxAudio(); if (!c) return; tocarTom(c.currentTime, 1200, .05, 'square', .06, AUDIO.master, {filtro: 2400, ataque: .002}); },
  fantasma() { const c = ctxAudio(); if (!c) return; tocarTom(c.currentTime, 420, 1.1, 'sine', .16, AUDIO.master, {para: 260, vibrato: 6, ataque: .12}); tocarTom(c.currentTime + .05, 630, 1.0, 'sine', .07, AUDIO.master, {para: 390, vibrato: 6.5, ataque: .15}); },
  risada() { const c = ctxAudio(); if (!c) return; [0, 1, 2, 3, 4].forEach(i => tocarTom(c.currentTime + i * .13, 760 - i * 60, .11, 'sawtooth', .1, AUDIO.master, {para: 980 - i * 70, filtro: 2600, ataque: .005})); },
  morcego() { const c = ctxAudio(); if (!c) return; [0, .09, .18].forEach(d => tocarTom(c.currentTime + d, 2600, .06, 'triangle', .08, AUDIO.master, {para: 3600, ataque: .002})); },
  lua() { const c = ctxAudio(); if (!c) return; [659, 784, 988, 1319].forEach((f, i) => tocarTom(c.currentTime + i * .12, f, .9, 'sine', .08, AUDIO.master, {ataque: .01})); },
  aranha() { const c = ctxAudio(); if (!c) return; for (let i = 0; i < 6; i++) tocarTom(c.currentTime + i * .045, 300 + Math.random() * 400, .04, 'square', .05, AUDIO.master, {filtro: 1800, ataque: .002}); },
  festa() { SFX.sucesso(); setTimeout(() => SFX.risada(), 380); },
  dracula() { SFX.risada(); const frases = ['Muahahaha!', 'Eu quero doces! Muahaha!', 'Boa noite, pequenos mortais!', 'Doces ou travessuras?']; setTimeout(() => falaDracula(frases[Math.floor(Math.random() * frases.length)]), 550); },
});
function somDoBotao(b) {
  if (b.classList.contains('btn-primario')) return SFX.boing();
  if (b.classList.contains('btn-sucesso')) return SFX.plim();
  if (b.classList.contains('btn-perigo')) return SFX.boo();
  if (b.classList.contains('aba') || b.classList.contains('chip') || b.classList.contains('opcao')) return SFX.tique();
  return SFX.pop();
}
const ASSUSTAVEIS = [['.dracula', 'dracula'], ['.fantasma', 'fantasma'], ['.morcego', 'morcego'], ['.lua', 'lua'], ['.aranha', 'aranha'], ['.abobora-logo', 'risada'], ['.abobora-vazia', 'risada'], ['.fantasminha', 'fantasma']];
function tocarCenario(x, y, alvo) {
  for (const [sel, som] of ASSUSTAVEIS) {
    const el = alvo && alvo.closest(sel) || $$(sel).find(e => { const r = e.getBoundingClientRect(); return r.width && x >= r.left - 8 && x <= r.right + 8 && y >= r.top - 8 && y <= r.bottom + 8; });
    if (!el) continue;
    SFX[som]();
    if (!reduzMovimento) { el.classList.remove('assustado'); void el.getBoundingClientRect(); el.classList.add('assustado'); setTimeout(() => el.classList.remove('assustado'), 900); explodir(x, y); }
    return true;
  }
  return false;
}

/* ---------- render ---------- */
function toast(msg, ms = 2800) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(t._t); t._t = setTimeout(() => { t.hidden = true; }, ms); }
function fmtData(s) { if (!/^\d{4}-\d{2}-\d{2}$/.test(s || '')) return ''; const [, m, d] = s.split('-'); return `${d}/${m}`; }
function renderPlacar() {
  if (cid && !casasCarregadas) { $('#placar').innerHTML = '<span class="skel skel-pill"></span><span class="skel skel-pill"></span><span class="skel skel-pill"></span>'; return; }
  const total = casas.length, abertas = casas.filter(abertaAgora).length, vis = casas.filter(c => visitadas.has(c.id)).length;
  $('#placar').innerHTML = `<span class="pill">${IC.casa}<b>${total}</b> casa${total === 1 ? '' : 's'}</span><span class="pill ok">${IC.relogio}<b>${abertas}</b> aberta${abertas === 1 ? '' : 's'} agora</span><span class="pill">${IC.check}<b>${vis}</b> visitada${vis === 1 ? '' : 's'}</span>`;

}
function renderFiltros() {
  const defs = [['abertas', IC.relogio, 'Abertas agora'], ['pequenos', IC.crianca, 'Para pequenos'], ['brincadeira', IC.susto, 'Com brincadeira'], ['naoVisitadas', IC.check, 'Não visitadas']];
  $('#filtros').innerHTML = defs.map(([k, ic, r]) => `<button class="chip" data-filtro="${k}" aria-pressed="${!!filtros[k]}">${ic}${r}</button>`).join('');
}
function renderModo() { const av = $('#aviso-modo'); const textos = {casa: 'Toque no mapa exatamente onde fica a casa. Dê zoom para acertar.', portaria: 'Toque no mapa onde fica a portaria.'}; av.hidden = !modo; if (modo) $('#aviso-texto').textContent = textos[modo]; $('#mapa').classList.toggle('marcando', !!modo); }
function cartaoCasa(c, idx) {
  const st = statusCasa(c), aberta = st.aberta;
  const etq = [`<span class="etq ${aberta ? 'aberta' : 'fechada'}">${IC.relogio}${h(st.texto)}</span>`]
    .concat((c.oferece || []).map(k => `<span class="etq">${IC.doce}${h(rotuloDe(OFERECE, k))}</span>`))
    .concat((c.flags || []).map(k => `<span class="etq ${k === 'cachorro' || k === 'assustadora' ? 'alerta' : ''}">${k === 'cachorro' ? IC.cachorro : k === 'pequenos' ? IC.crianca : IC.susto}${h(rotuloDe(FLAGS, k))}</span>`));
  const dist = posicao ? `<span class="etq">${IC.navegar}${fmtM(distM(posicao, c))} de você</span>` : '';
  return `<div class="casa-titulo"><div class="num-grande">${h(c.numero)}</div><div><h3>${c.familia ? h(c.familia) : nomeCasa(c)}</h3><div class="end">${c.familia ? nomeCasa(c) : 'Casa participante'}${idx != null ? ` · parada ${idx + 1}` : ''}</div></div></div><div class="etiquetas">${etq.join('')}${dist}</div>${c.esgotado ? '<div class="balao-obs balao-ficha balao-esgotado"><span class="balao-quem">Aviso da casa</span><span class="balao-txt">Os doces acabaram! Obrigado pela visita.</span></div>' : c.obs ? `<div class="balao-obs balao-ficha"><span class="balao-quem">Recado da casa</span><span class="balao-txt">${h(c.obs)}</span></div>` : ''}`;
}
function abrirFolha(id) {
  const c = casaPorId(id); if (!c) return; const vis = visitadas.has(id); const l = linksNav(c);
  $('#folha-in').innerHTML = cartaoCasa(c) + `<div class="acoes acoes-folha">
    <a class="btn btn-primario btn-grande" href="${linkPrincipal(c)}" target="_blank" rel="noopener">${IC.navegar} Navegar no Google Maps <small class="recomendado">recomendado</small></a>
    <button class="btn ${vis ? 'btn-fantasma' : 'btn-sucesso'}" data-acao="visitar" data-id="${h(id)}">${IC.check} ${vis ? 'Desmarcar visita' : 'Marcar como visitada'}</button>
    <button class="btn btn-fantasma" data-acao="ouvir" data-id="${h(id)}">${IC.ouvir} Ouvir</button>
    ${podeEditar(c) ? `<button class="btn btn-fantasma" data-acao="editar" data-id="${h(id)}">${IC.editar} Editar</button><button class="btn ${c.esgotado ? 'btn-sucesso' : 'btn-fantasma'} btn-esgotou" data-acao="esgotou" data-id="${h(id)}">${IC.doce} ${c.esgotado ? 'Voltei a ter doces' : 'Acabaram os doces'}</button>` : ''}
  </div><div class="nav-extra"><span class="rotulo">Ou use</span><a href="${l.apple}" target="_blank" rel="noopener">Apple Maps</a><a href="${l.waze}" target="_blank" rel="noopener">Waze</a></div>`;
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
    const c = casaPorId(roteiro.ordem[idx]); const de = origemAtual(idx); const tr = trechoDe(c); const d = tr ? tr.dist : distM(de, c);
    $('#guia-n').textContent = `${idx + 1} de ${roteiro.ordem.length}`; $('#guia-dist').textContent = tr ? `${fmtM(d)} a pé` : `${fmtM(d)} · ${direcaoFala(de, c)}`;
    const gi = $('#guia-instrucao'); if (tr) gi.textContent = textoInstrucao(tr.passos, fmtM); else gi.innerHTML = trechoBuscando ? `${SPIN} Procurando o caminho pelas ruas…` : ''; gi.hidden = !gi.innerHTML;
    $('#guia-casa').innerHTML = cartaoCasa(c); $('#btn-caminhar').hidden = false; $('#btn-cheguei').disabled = false; $('#btn-pular').disabled = roteiro.ordem.filter(id => !visitadas.has(id)).length < 2; $('#btn-falar').disabled = false;
    // Botão principal: todas as casas que faltam, na ordem otimizada (em partes se forem muitas). Embaixo, só a próxima.
    const partes = partesRotaGoogle(), faltam = partes.reduce((t, x) => t + x.casas, 0);
    const nav = $('#btn-navegar'); nav.removeAttribute('aria-disabled');
    if (faltam > 1) { nav.href = partes[0].url; nav.innerHTML = `<span class="nav-linha">${IC.navegar} Rota completa no Google Maps</span><small class="recomendado">${partes.length > 1 ? `parte 1 de ${partes.length} · casas ${partes[0].de} a ${partes[0].ate}` : `${faltam} casas em ordem`}</small>`; }
    else { nav.href = linkPrincipal(c); nav.innerHTML = `<span class="nav-linha">${IC.navegar} Navegar no Google Maps</span><small class="recomendado">última casa</small>`; }
    $('#partes-google').innerHTML = partes.length > 1 ? `<p class="dica">O Google Maps aceita até ${CASAS_POR_LINK} casas por vez. Terminou uma parte? Abra a próxima.</p>` + partes.slice(1).map((x, k) => `<a class="btn btn-fantasma" href="${x.url}" target="_blank" rel="noopener">${IC.navegar} Parte ${k + 2} · casas ${x.de} a ${x.ate}</a>`).join('') : '';
    $('#partes-google').hidden = partes.length < 2;
    const l = linksNav(c); $('#nav-extra').innerHTML = faltam > 1 ? `<span class="rotulo">Só a próxima casa</span><a href="${l.google}" target="_blank" rel="noopener">Google Maps</a><a href="${l.apple}" target="_blank" rel="noopener">Apple Maps</a><a href="${l.waze}" target="_blank" rel="noopener">Waze</a>`
      : `<span class="rotulo">Ou use</span><a href="${l.apple}" target="_blank" rel="noopener">Apple Maps</a><a href="${l.waze}" target="_blank" rel="noopener">Waze</a>`;
  } else {
    $('#guia-n').textContent = 'final'; $('#guia-dist').textContent = ''; $('#guia-instrucao').hidden = true; $('#guia-casa').innerHTML = `<div class="vazio">${PUMPKIN_BIG}<h3>Roteiro concluído!</h3><p>Sacola cheia? Feliz Halloween!</p></div>`;
    $('#btn-caminhar').hidden = true; $('#btn-cheguei').disabled = true; $('#btn-pular').disabled = true; $('#btn-falar').disabled = true; $('#btn-parar').textContent = 'Fechar roteiro'; const nav = $('#btn-navegar'); nav.setAttribute('aria-disabled', 'true'); nav.removeAttribute('href'); $('#nav-extra').innerHTML = ''; $('#partes-google').hidden = true;
  }
  guia.hidden = false;
  if (caminhando) renderCaminhada();
}
function renderRoteiro() {
  renderPartida();
  const guia = $('#guia'), lista = $('#lista-roteiro'), tot = $('#roteiro-total'); $('#opt-voz').checked = vozAuto; $('#opt-auto-chegada').checked = autoChegada;
  $('#voz-status').textContent = temVoz() ? 'A voz fala em português, avisa a distância pelo GPS e abaixa a música enquanto guia.' : 'Este navegador não oferece voz; o guia fica só na tela.';
  $('#roteiro-acoes').hidden = !visitadas.size && !roteiro;
  const temRoteiro = !!roteiro && roteiro.ordem.some(id => casaPorId(id));
  $('#acoes-refazer').hidden = !temRoteiro || !$('#card-partida').hidden && !temRoteiro;
  if (!temRoteiro) { $('#card-partida').hidden = false; $('#acoes-refazer').hidden = true; guia.hidden = true; lista.innerHTML = ''; tot.textContent = ''; $('#btn-rota-google').hidden = true; return; }
  if (!roteiroAberto) { $('#card-partida').hidden = true; $('#acoes-refazer').hidden = false; }
  renderGuia();
  const idx = proximaParada(); let totalM = 0, ant = roteiro.de;
  const pernas = rotaPernas && rotaChave === chaveRoteiro() ? rotaPernas : null; let k = 0;
  lista.innerHTML = roteiro.ordem.map((id, i) => { const c = casaPorId(id); if (!c) return ''; const feita = visitadas.has(id); const d = pernas ? pernas[k] : distM(ant, c); k++; totalM += d; ant = c;
    return `<li class="${feita ? 'feita' : ''} ${i === idx ? 'atual' : ''}"><span class="ordem">${i + 1}</span><div class="info"><b>${nomeCasa(c)}${c.familia ? ' · ' + h(c.familia) : ''}</b><span>${(c.oferece || []).map(k => rotuloDe(OFERECE, k)).join(', ') || 'Sem detalhes'} · ${fmtM(d)}</span></div><button class="btn btn-icone vis" data-visitar="${h(id)}" aria-pressed="${feita}" aria-label="${feita ? 'Desmarcar' : 'Marcar visitada'}: ${h(nomeCasaTxt(c))}">${IC.check}</button><button class="btn btn-icone" data-ver="${h(id)}" aria-label="Ver detalhes">${IC.casa}</button></li>`; }).join('');
  const temReta = rotaTrechos && rotaChave === chaveRoteiro() && rotaTrechos.some(x => !x.ruas);
  const tudoReto = temReta && rotaTrechos.every(x => !x.ruas);
  if (pernas) tot.textContent = (tudoReto ? `Percurso total: cerca de ${fmtM(totalM)} em linha reta.` : `Percurso total a pé: cerca de ${fmtM(totalM)}.`) + (temReta ? ' A linha pontilhada é caminho direto, porque as ruas internas do condomínio não aparecem como públicas no mapa. Siga pelas ruas do condomínio na direção indicada.' : ''); else if (rotaCarregando) tot.innerHTML = `${SPIN} Calculando o caminho pelas ruas…`; else tot.textContent = `Percurso total em linha reta: cerca de ${fmtM(totalM)}.`;
  $('#btn-rota-google').hidden = true;   // a rota completa agora é o botão principal do guia
}
function renderParticipar() {
  $('#f-oferece').innerHTML = OFERECE.map(([k, r]) => `<button type="button" class="chip" data-multi="oferece" data-k="${k}" aria-pressed="false">${IC.doce}${r}</button>`).join('');
  $('#f-flags').innerHTML = FLAGS.map(([k, r]) => `<button type="button" class="chip" data-multi="flags" data-k="${k}" aria-pressed="false">${k === 'cachorro' ? IC.cachorro : k === 'pequenos' ? IC.crianca : IC.susto}${r}</button>`).join('');
  atualizarForm();
}
// Seletor de horário: -15 / +15 minutos nos botões e a lista do celular ao tocar na hora.
const OPC_HORAS = Array.from({length: 96}, (_, i) => `${String(i / 4 | 0).padStart(2, '0')}:${String(i % 4 * 15).padStart(2, '0')}`);
const fmtHm = m => `${String((m / 60 | 0) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
function renderHora(box) {
  const inp = $('#' + box.dataset.hora), sel = box.querySelector('select'); if (!sel || document.activeElement === sel) return;
  const v = inp.value, ops = [...(box.dataset.vazio ? [''] : []), ...OPC_HORAS];
  if (v && !ops.includes(v)) { ops.push(v); ops.sort(); }
  sel.innerHTML = ops.map(o => `<option value="${o}">${o || '--:--'}</option>`).join(''); sel.value = v;
}
function renderHoras() { $$('.hora-sel').forEach(renderHora); }
function montarSeletoresHora() {
  $$('.hora-sel').forEach(box => {
    const inp = $('#' + box.dataset.hora), rot = box.dataset.rotulo || 'Horário';
    box.innerHTML = `<button type="button" class="hora-btn" data-passo="-15" aria-label="${rot}: 15 minutos mais cedo">−</button><select class="hora-val" aria-label="${rot}"></select><button type="button" class="hora-btn" data-passo="15" aria-label="${rot}: 15 minutos mais tarde">+</button>`;
    box.querySelector('select').addEventListener('change', e => { inp.value = e.target.value; });
    box.querySelectorAll('.hora-btn').forEach(b => {
      const passo = () => { const m = hm(inp.value); inp.value = m == null ? (box.dataset.padrao || '18:00') : fmtHm(((Math.round((m + +b.dataset.passo) / 15) * 15) % 1440 + 1440) % 1440); renderHora(box); };
      // segurar o botão anda rápido; um toque anda 15 minutos
      let t1, t2, porToque = false; const parar = () => { clearTimeout(t1); clearInterval(t2); };
      b.addEventListener('pointerdown', e => { porToque = true; passo(); t1 = setTimeout(() => { t2 = setInterval(passo, 110); }, 420); try { b.setPointerCapture(e.pointerId); } catch {} });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => b.addEventListener(ev, parar));
      b.addEventListener('click', () => { if (porToque) { porToque = false; return; } passo(); });   // teclado
    });
    renderHora(box);
  });
}
function mostrarHorasCasa() {
  const todo = $('#f-hora-evento').checked; $('#f-horas').hidden = todo;
  $('#f-hora-evento-txt').textContent = evento.horaInicio && evento.horaFim ? `Das ${evento.horaInicio} às ${evento.horaFim}, o mesmo horário do evento.` : 'Segue o horário que o admin definir para o evento.';
  renderHoras();
}
// ---------- sugestão de rua enquanto digita ----------
// Ruas das casas já cadastradas (na hora, sem internet) + Photon, o buscador do OpenStreetMap feito para sugerir enquanto
// digita (o Nominatim não permite isso). Só pergunta depois de uma pausa, a partir de 3 letras, perto do condomínio,
// e guarda as respostas. Recebe só o texto da rua e a área do mapa; nunca nome ou e-mail.
let sugestoesRua = [];
const photonCache = new Map();
async function ruasPhoton(termo) {
  const centro = (condo && condo.centro) || null; if (!centro || termo.length < 3) return [];
  const k = cid + '|' + semAcento(termo).toLowerCase(); if (photonCache.has(k)) return photonCache.get(k);
  const d = 0.012, lat = +centro.lat, lng = +centro.lng;
  const q = new URLSearchParams({q: termo, lat: lat.toFixed(5), lon: lng.toFixed(5), limit: '8', layer: 'street', bbox: [lng - d, lat - d, lng + d, lat + d].map(x => x.toFixed(5)).join(',')});
  try {
    const r = await fetch(`https://photon.komoot.io/api/?${q}`, {referrerPolicy: 'strict-origin'});
    const nomes = r.ok ? [...new Set(((await r.json()).features || []).map(f => f.properties && f.properties.name).filter(Boolean).map(n => String(n).slice(0, 60)))] : [];
    photonCache.set(k, nomes); return nomes;
  } catch (e) { return []; }
}
function fecharSugestoesRua() { $('#sugestoes-rua').hidden = true; $('#f-rua').setAttribute('aria-expanded', 'false'); sugestoesRua = []; }
async function sugerirRuas(comInternet) {
  const termo = $('#f-rua').value.trim(); if (termo.length < 2) { fecharSugestoesRua(); return; }
  const q = semAcento(termo).toLowerCase(), daqui = casas.map(c => c.rua).filter(Boolean);
  const uso = new Map(); daqui.forEach(n => uso.set(n, (uso.get(n) || 0) + 1));   // as ruas mais usadas aparecem primeiro
  const pega = n => { const t = semAcento(n).toLowerCase(); return (t.split(/[\s.]+/).some(p => p.startsWith(q)) || t.includes(q)) && t !== q; };
  const desenhar = doMapa => {
    if ($('#f-rua').value.trim() !== termo || document.activeElement !== $('#f-rua')) return;
    const todas = [...new Map([...daqui, ...doMapa].map(n => [semAcento(n).toLowerCase(), n])).values()];
    sugestoesRua = todas.filter(pega).sort((a, b) => (uso.get(b) || 0) - (uso.get(a) || 0) || a.localeCompare(b, 'pt')).slice(0, 6);
    const ul = $('#sugestoes-rua');
    ul.innerHTML = sugestoesRua.map((n, i) => `<li role="option"><button type="button" data-rua="${i}"><span class="morador-ic">${IC.casa}</span><span class="morador-txt"><b>${h(n)}</b><small>${uso.get(n) ? `${uso.get(n)} casa${uso.get(n) > 1 ? 's' : ''} já cadastrada${uso.get(n) > 1 ? 's' : ''} nesta rua` : 'Rua do mapa perto do condomínio'}</small></span></button></li>`).join('');
    ul.hidden = !sugestoesRua.length; $('#f-rua').setAttribute('aria-expanded', String(!!sugestoesRua.length));
  };
  desenhar([]);   // primeiro as ruas do condomínio, na hora
  if (comInternet) desenhar(await ruasPhoton(termo));
}
function escolherRua(i) {
  const n = sugestoesRua[i]; if (!n) return;
  $('#f-rua').value = n; fecharSugestoesRua(); SFX.plim();
  // com número já preenchido, a abóbora vai para o endereço; senão, o foco segue para o número
  if ($('#f-numero').value.trim()) $('#f-rua').dispatchEvent(new Event('change')); else $('#f-numero').focus();
}
// ---------- moradores da casa (até 6 pessoas cuidam da mesma casa) ----------
// Cada morador: {h, nome, email}. h é o SHA-256 de "codigo:email" (é ele que dá acesso); o e-mail fica vazio quando a
// pessoa foi escolhida no diretório, que só tem o e-mail pela metade.
const emailValido = e => /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(e);
let moradoresForm = [], moradoresProntos = false, moradoresDe = null, moradoresMexidos = false, atribuicaoExiste = false;
async function pessoasDe(d) {
  if (!d) return [];
  const lista = (Array.isArray(d.moradores) ? d.moradores : []).filter(p => p && /^[0-9a-f]{64}$/.test(p.h || '')).map(p => ({h: p.h, nome: nomeCurto(p.nome), email: String(p.email || '').toLowerCase()}));
  for (const e of [...(Array.isArray(d.emails) ? d.emails : []), ...(d.email ? [d.email] : [])].map(x => String(x).toLowerCase())) {
    const hsh = await hashAtribuicao(cid, e); if (!lista.some(p => p.h === hsh)) lista.push({h: hsh, nome: '', email: e});
  }
  return lista.slice(0, 6);
}
const rotulosAtribuicao = d => !d ? [] : [...(Array.isArray(d.moradores) ? d.moradores.map(p => p.nome || p.email || 'morador') : []), ...(Array.isArray(d.emails) ? d.emails : []), ...(d.email ? [d.email] : [])];
async function carregarMoradores() {
  const id = editandoId, c = id && casaPorId(id);
  moradoresDe = id; moradoresMexidos = false; moradoresProntos = false; moradoresForm = []; atribuicaoExiste = false;
  if (!c) { moradoresProntos = true; renderMoradores(); return; }   // casa nova: lista começa vazia
  renderMoradores();
  let dados;   // undefined = não deu para ler (sem permissão ou sem rede): não mexe na lista ao salvar
  if (ehAdmin() && atribuicoes[id]) dados = atribuicoes[id];
  else if (podeEditar(c)) { try { const snap = await fb.fs.getDoc(fb.atribuicao(cid, id)); dados = snap.exists() ? snap.data() : null; } catch (e) { console.error(e); } }
  if (editandoId !== id || dados === undefined) { if (editandoId === id) renderMoradores(); return; }
  atribuicaoExiste = !!dados;
  const pessoas = await pessoasDe(dados);
  if (editandoId !== id) return;
  // moradores que estão na casa mas sem nome guardado (formato antigo): o nome vem do diretório, se der
  hashesDaCasa(c).forEach(x => { if (!pessoas.some(p => p.h === x)) pessoas.push({h: x, nome: '', email: ''}); });
  moradoresForm = pessoas.slice(0, 6); moradoresProntos = true; renderMoradores();
  if (!diretorio || diretorioCid !== cid) carregarDiretorio().then(() => { if (editandoId === id) renderMoradores(); });
}
function noDiretorio(hsh) { return diretorio && diretorioCid === cid ? diretorio.find(x => x.h === hsh) || null : null; }
function renderMoradores() {
  const box = $('#campo-moradores'), c = editandoId && casaPorId(editandoId);
  const pode = !!usuario && (c ? podeEditar(c) : (ehMorador() || ehAdmin()));
  box.hidden = !pode; if (!pode) return;
  let criador = '';
  if (!c || c.uid === meuUid()) criador = 'Você (cadastrou a casa)';
  else { const m = membros.find(x => x.id === c.uid); const d = diretorio && diretorio.find(x => x.uid === c.uid); criador = m ? `${h(m.nome || 'Um morador')}${m.email ? ` · ${h(m.email)}` : ''}` : d ? h(d.nome || 'Um morador') : (ehAdmin() && membrosCarregados ? 'Quem cadastrou não está mais no condomínio' : 'Quem cadastrou a casa'); }
  const itens = [`<li class="morador-criador"><span class="morador-ic">${IC.casa}</span><span class="morador-txt"><b>${criador}</b><small>Conta que cadastrou</small></span></li>`];
  if (!moradoresProntos && c) itens.push(`<li><span class="res-carregando">${SPIN} Carregando moradores…</span></li>`);
  moradoresForm.forEach(p => {
    const d = noDiretorio(p.h), eu = p.h === meuHashAqui;
    const nome = p.nome || (d && d.nome) || p.email || 'Morador';
    const sub = eu ? 'Você' : p.email && nome !== p.email ? h(p.email) : d ? h(d.email || d.mascara) : '';
    const st = eu ? '' : d ? `<small class="status-morador ok">${IC.check} Já está no condomínio</small>` : p.email ? `<small class="status-morador" data-status-de="${h(p.email)}"></small>` : '';
    itens.push(`<li><span class="morador-ic">${IC.pessoa}</span><span class="morador-txt"><b>${h(nome)}</b>${sub ? `<small>${sub}</small>` : ''}${st}</span><button type="button" class="btn-x" data-tirar-morador="${h(p.h)}" aria-label="Tirar ${h(nome)} da casa">${IC.x}</button></li>`);
  });
  $('#lista-moradores').innerHTML = itens.join('');
  $$('#lista-moradores [data-status-de]').forEach(async el => { const r = await statusDe(el.dataset.statusDe); if (!el.isConnected) return; el.innerHTML = textoStatus(r); el.className = 'status-morador ' + (r ? 'ok' : r === false ? 'fora' : ''); });
  const cheio = moradoresForm.length >= 6;
  $('#f-email-morador').disabled = !moradoresProntos || cheio; $('#btn-add-morador').disabled = !moradoresProntos || cheio;
  $('#f-email-morador').placeholder = cheio ? 'Limite de 6 moradores' : 'Nome ou e-mail do Google';
}
// Busca por nome ou e-mail com lista para tocar; e-mail completo de quem ainda não entrou também vale.
let timerBusca = null, sugestoes = [];
const semAcentoMin = t => semAcento(String(t || '')).toLowerCase();
function fecharSugestoes() { $('#sugestoes-morador').hidden = true; $('#f-email-morador').setAttribute('aria-expanded', 'false'); sugestoes = []; }
function aoDigitarMorador() {
  const termo = $('#f-email-morador').value.trim().toLowerCase(), st = $('#conferindo-morador');
  clearTimeout(timerBusca);
  if (termo.length < 2) { fecharSugestoes(); st.hidden = true; return; }
  timerBusca = setTimeout(async () => {
    const lista = await carregarDiretorio(); if ($('#f-email-morador').value.trim().toLowerCase() !== termo) return;
    const c = editandoId && casaPorId(editandoId), criador = c ? c.uid : meuUid(), q = semAcentoMin(termo);
    sugestoes = lista.filter(x => x.uid !== criador && !moradoresForm.some(p => p.h === x.h)
      && (semAcentoMin(x.nome).split(' ').some(pal => pal.startsWith(q)) || semAcentoMin(x.nome).includes(q) || (x.email || '').startsWith(termo) || (x.mascara || '').replace('•••', '').startsWith(termo)))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt')).slice(0, 6);
    const ul = $('#sugestoes-morador');
    ul.innerHTML = sugestoes.map((x, i) => `<li role="option"><button type="button" data-sugestao="${i}"><span class="morador-ic">${IC.pessoa}</span><span class="morador-txt"><b>${h(x.nome || 'Morador')}</b><small>${h(x.email || x.mascara)}</small></span></button></li>`).join('');
    ul.hidden = !sugestoes.length; $('#f-email-morador').setAttribute('aria-expanded', String(!!sugestoes.length));
    // sem ninguém na lista: se for e-mail completo, confere; senão, explica
    if (sugestoes.length) { st.hidden = true; return; }
    st.hidden = false; st.className = 'status-morador';
    if (!emailValido(termo)) { st.innerHTML = 'Ninguém com esse nome no condomínio. Se a pessoa ainda não entrou, digite o e-mail do Google dela.'; return; }
    st.innerHTML = `${SPIN} Procurando no condomínio…`;
    const r = await statusDe(termo); if ($('#f-email-morador').value.trim().toLowerCase() !== termo) return;
    if (r == null) { st.hidden = true; return; }
    st.className = 'status-morador ' + (r ? 'ok' : 'fora');
    st.innerHTML = r ? textoStatus(r) + '. Toque em Adicionar.' : 'Ainda não entrou no condomínio. Pode adicionar: quando a pessoa entrar com este e-mail do Google, já consegue editar a casa.';
  }, 200);
}
function incluirPessoa(p, silencioso) {
  if (moradoresForm.some(x => x.h === p.h)) { toast('Essa pessoa já está na lista.'); return false; }
  if (moradoresForm.length >= 6) { toast('Limite de 6 moradores por casa.'); return false; }
  moradoresForm = [...moradoresForm, p]; moradoresMexidos = true;
  $('#f-email-morador').value = ''; $('#conferindo-morador').hidden = true; fecharSugestoes(); SFX.plim(); renderMoradores();
  if (!silencioso) toast('Adicionado! Agora toque em Salvar para valer.');
  return true;
}
function escolherSugestao(i) { const x = sugestoes[i]; if (x) incluirPessoa({h: x.h, nome: x.nome, email: x.email || ''}); }
async function adicionarMorador(aoSalvar) {
  const inp = $('#f-email-morador'), e = inp.value.trim().toLowerCase().slice(0, 160);
  if (!e) { inp.focus(); return false; }
  if (!aoSalvar && sugestoes.length) { escolherSugestao(0); return true; }
  if (!emailValido(e)) { toast('Toque no nome da pessoa na lista, ou digite o e-mail do Google completo.'); inp.focus(); return false; }
  const hsh = await hashAtribuicao(cid, e), c = editandoId && casaPorId(editandoId);
  if ((!c || c.uid === meuUid()) && hsh === meuHashAqui) { toast('Você já cuida desta casa.'); inp.value = ''; return true; }
  const d = noDiretorio(hsh);
  return incluirPessoa({h: hsh, nome: d ? d.nome : '', email: e}, aoSalvar) || moradoresForm.some(x => x.h === hsh);
}
// Recado curto (até 140) para caber inteiro no balão da lista. Recados antigos maiores continuam valendo.
const MAX_RECADO = 140;
function contarRecado() {
  const n = [...$('#f-obs').value].length, el = $('#f-obs-cont');
  el.textContent = n > MAX_RECADO ? `${n} letras: recados antigos podem ficar assim, mas ao editar o limite é ${MAX_RECADO}` : `${n} de ${MAX_RECADO} letras`;
  el.classList.toggle('quase', n >= MAX_RECADO - 15);
}
function lerForm() { const pega = sel => $$(sel + ' .chip[aria-pressed="true"]').map(b => b.dataset.k); return {rua: $('#f-rua').value.trim().slice(0, 60), numero: $('#f-numero').value.trim().slice(0, 20), familia: $('#f-familia').value.trim().slice(0, 60), oferece: pega('#f-oferece'), flags: pega('#f-flags'), horaInicio: $('#f-hora-evento').checked ? '' : $('#f-hi').value, horaFim: $('#f-hora-evento').checked ? '' : $('#f-hf').value, obs: $('#f-obs').value.trim().slice(0, 240), lat: pinCasa?.lat, lng: pinCasa?.lng}; }
let versaoForm = 0;
function preencherForm(c) {
  versaoForm++;
  const idDica = editandoId || (!criandoOutra && usuario ? usuario.uid : '');
  nomeAutoDaCasa = idDica ? nomeDivertido(idDica) : '';
  $('#f-familia').placeholder = 'Família Souza';
  renderSugestoesNome(true);
  $('#f-rua').value = c.rua || ''; $('#f-numero').value = c.numero || ''; $('#f-familia').value = c.familia || ''; $('#f-hora-evento').checked = !(c.horaInicio || c.horaFim); $('#f-hi').value = c.horaInicio || evento.horaInicio || '18:00'; $('#f-hf').value = c.horaFim || evento.horaFim || '21:00'; mostrarHorasCasa(); $('#f-obs').value = c.obs || '';
  $$('#f-oferece .chip').forEach(b => b.setAttribute('aria-pressed', String((c.oferece || []).includes(b.dataset.k))));
  $$('#f-flags .chip').forEach(b => b.setAttribute('aria-pressed', String((c.flags || []).includes(b.dataset.k))));
  pinCasa = typeof c.lat === 'number' ? {lat: c.lat, lng: c.lng} : null; atualizarForm(); renderPins(); atualizarMapaCasa(!!pinCasa); travarMapaCasa(true); confirmouLonge = '';
  carregarMoradores(); contarRecado();
}
/* ---------- mapa do cadastro e endereço automático ---------- */
let mapaCasa = null, marcadorCasa = null, confirmouLonge = '';
function iconeCasaPin() { return L.divIcon({className: 'pin-wrap', iconSize: [46, 52], iconAnchor: [23, 50], html: `<div class="pin pin-arrastar">${PIN_SVG}<span class="num">${h(($('#f-numero') && $('#f-numero').value.trim()) || '?')}</span></div>`}); }
function iniciarMapaCasa() {
  if (mapaCasa || !$('#mapa-casa') || $('#form-casa').hidden) return;
  const centro = pinCasa || (condo && condo.centro) || posicao || {lat: CONFIG.centro[0], lng: CONFIG.centro[1]};
  mapaCasa = L.map('mapa-casa', {zoomControl: true}).setView([centro.lat, centro.lng], pinCasa ? 18 : Math.max((condo && condo.zoom) || 17, 17));
  const noite = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19, className: 'tiles-noite', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'});
  const satelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {maxZoom: 19, attribution: 'Imagens &copy; Esri'});
  noite.addTo(mapaCasa); L.control.layers({'Noite': noite, 'Satélite': satelite}, null, {position: 'topright'}).addTo(mapaCasa);
  if (evento.portaria) L.marker([evento.portaria.lat, evento.portaria.lng], {icon: iconeMarcador(IC.porta, 'portaria'), interactive: false}).addTo(mapaCasa);
  mapaCasa.on('click', e => { if (mapaCasaTravado) { const av = $('#aviso-trava'); av.classList.remove('pisca'); void av.offsetWidth; av.classList.add('pisca'); return; } definirPinCasa(e.latlng, false); });
  atualizarMapaCasa(); travarMapaCasa(true);
}
function atualizarMapaCasa(centrar) {
  if (!mapaCasa) return;
  setTimeout(() => mapaCasa.invalidateSize(), 60);
  if (!pinCasa) { if (marcadorCasa) { marcadorCasa.remove(); marcadorCasa = null; } return; }
  if (!marcadorCasa) {
    marcadorCasa = L.marker([pinCasa.lat, pinCasa.lng], {icon: iconeCasaPin(), draggable: true, autoPan: true, zIndexOffset: 1000}).addTo(mapaCasa);
    marcadorCasa.on('dragend', () => { const ll = marcadorCasa.getLatLng(); definirPinCasa(ll, false, true); });
    if (mapaCasaTravado) marcadorCasa.dragging.disable();
  } else { marcadorCasa.setLatLng([pinCasa.lat, pinCasa.lng]); marcadorCasa.setIcon(iconeCasaPin()); }
  if (centrar) mapaCasa.setView([pinCasa.lat, pinCasa.lng], Math.max(mapaCasa.getZoom(), 18));
}
function definirPinCasa(ll, centrar, arrastou) {
  pinCasa = {lat: +(+ll.lat).toFixed(6), lng: +(+ll.lng).toFixed(6)};
  atualizarForm(); atualizarMapaCasa(centrar); SFX.plop();
  if (!arrastou && !centrar) { const d = $('#dica-mapa-casa'); d.textContent = 'Abóbora no lugar! Se precisar, arraste para ajustar.'; }
}
const geoCache = new Map(); let geoFila = Promise.resolve(), ultimoGeo = 0, geoBuscando = false;
// Nominatim (OpenStreetMap): no máximo 1 consulta por segundo. "exato" só quando achou a casa/prédio; senão é o meio da rua.
function geocodificar(rua, num) {
  const chave = `${cid}|${semAcento(rua)}|${String(num || '').trim()}`;
  if (geoCache.has(chave)) return Promise.resolve(geoCache.get(chave));
  const tarefa = geoFila.then(async () => {
    if (geoCache.has(chave)) return geoCache.get(chave);
    const espera = 1100 - (Date.now() - ultimoGeo); if (espera > 0) await new Promise(r => setTimeout(r, espera)); ultimoGeo = Date.now();
    // limit 5 + geometria: quando o mapa só conhece a rua, juntamos os pedaços dela para medir a distância até a rua inteira.
    const q = new URLSearchParams({format: 'jsonv2', limit: '5', countrycodes: 'br', 'accept-language': 'pt-BR', polygon_geojson: '1', polygon_threshold: '0.00005', q: [num ? `${rua}, ${num}` : rua, condo && condo.cidade].filter(Boolean).join(', ')});
    const c = (condo && condo.centro) || null;
    if (c) { q.set('viewbox', `${c.lng - 0.03},${c.lat + 0.03},${c.lng + 0.03},${c.lat - 0.03}`); q.set('bounded', '1'); }
    const r = await carga(fetch(`https://nominatim.openstreetmap.org/search?${q}`, {headers: {Accept: 'application/json'}, referrerPolicy: 'strict-origin'}));
    const lista = r.ok ? await r.json() : [];
    const a = lista[0]; const exato = !!a && (['house', 'building', 'apartments'].includes(a.type) || ['building', 'house'].includes(a.addresstype));
    const nomeRua = a && (a.name || '');
    const linhas = exato ? [] : lista.filter(x => (x.name || '') === nomeRua && x.geojson && /LineString/.test(x.geojson.type))
      .flatMap(x => x.geojson.type === 'LineString' ? [x.geojson.coordinates] : x.geojson.coordinates).map(l => l.map(([lng, lat]) => ({lat, lng})));
    const res = a ? {lat: +a.lat, lng: +a.lon, exato, linhas} : null;
    geoCache.set(chave, res); return res;
  });
  geoFila = tarefa.catch(() => {}); return tarefa;
}
// Distância da abóbora até o endereço: até a casa, quando o mapa conhece o número; senão, até a linha da rua (o trecho mais perto).
function distPontoSegmento(p, a, b) {
  const kx = 111320 * Math.cos(p.lat * Math.PI / 180), ky = 110540;
  const ax = (a.lng - p.lng) * kx, ay = (a.lat - p.lat) * ky, bx = (b.lng - p.lng) * kx, by = (b.lat - p.lat) * ky;
  const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy; let tt = L ? -(ax * dx + ay * dy) / L : 0; tt = Math.max(0, Math.min(1, tt));
  return Math.hypot(ax + tt * dx, ay + tt * dy);
}
function distanciaAoEndereco(g, p) {
  if (!g) return 0;
  if (g.exato || !g.linhas || !g.linhas.length) return distM(g, p);
  let m = Infinity; g.linhas.forEach(l => { for (let i = 0; i < l.length - 1; i++) m = Math.min(m, distPontoSegmento(p, l[i], l[i + 1])); });
  return Number.isFinite(m) ? m : distM(g, p);
}
const limiteEndereco = g => !g ? Infinity : g.exato ? 120 : (g.linhas && g.linhas.length ? 80 : 350);
async function acharPeloEndereco(automatico) {
  const rua = $('#f-rua').value.trim(), num = $('#f-numero').value.trim(); const dica = $('#dica-mapa-casa');
  if (!rua) { if (!automatico) { dica.textContent = 'Escreva a rua primeiro.'; $('#f-rua').focus(); } return; }
  if (geoBuscando) return;
  geoBuscando = true; const btn = $('#btn-achar-endereco'); const txt = btn.innerHTML; btn.disabled = true; btn.innerHTML = `${SPIN} Procurando…`;
  const v = versaoForm;
  try {
    const g = await geocodificar(rua, num);
    if (v !== versaoForm) return;   // o formulário mudou de casa enquanto buscava: ignora a resposta
    if (!g) { dica.textContent = 'Não achei esse endereço no mapa. Destrave o mapa e toque onde fica a casa.'; if (!automatico) SFX.boo(); return; }
    definirPinCasa(g, true, true); travarMapaCasa(true);
    dica.textContent = g.exato ? 'Achei o endereço! Se a abóbora não estiver em cima da casa, destrave o mapa e arraste.' : 'Achei a rua, mas não o número. Destrave o mapa e arraste a abóbora até a sua casa.';
    SFX.plim();
  } catch (e) { console.error(e); dica.textContent = 'A busca de endereço não respondeu. Destrave o mapa e toque onde fica a casa.'; }
  finally { geoBuscando = false; btn.disabled = false; btn.innerHTML = txt; }
}
// Trava do mapa do cadastro: travado, tocar ou arrastar não muda a posição (e a página rola sem mexer no mapa).
let mapaCasaTravado = true;
function travarMapaCasa(travar) {
  mapaCasaTravado = travar;
  if (mapaCasa) {
    ['dragging', 'touchZoom', 'doubleClickZoom', 'scrollWheelZoom', 'boxZoom', 'keyboard'].forEach(k => { if (mapaCasa[k]) mapaCasa[k][travar ? 'disable' : 'enable'](); });
    if (marcadorCasa && marcadorCasa.dragging) marcadorCasa.dragging[travar ? 'disable' : 'enable']();
    mapaCasa.getContainer().classList.toggle('travado', travar);
  }
  const b = $('#btn-trava-mapa'); if (b) { b.innerHTML = travar ? `${svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>')} Destravar para ajustar` : `${svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>')} Pronto, travar posição`; b.classList.toggle('btn-sucesso', !travar); b.classList.toggle('btn-fantasma', travar); }
  const av = $('#aviso-trava'); if (av) av.hidden = !travar;
}
function limparForm() { editandoId = null; pinCasa = null; preencherForm({}); $('#form-erro').hidden = true; }
async function salvarSeguro(fn, msg) {
  const tela = document.createElement('div'); tela.className = 'salvando'; tela.innerHTML = `${IC.carregando}<div>Gravando no caldeirão…</div>`; document.body.appendChild(tela);
  try { await carga(fn()); toast(msg); SFX.sucesso(); return true; }
  catch (e) { console.error(e); toast(e && /permission/i.test(String(e.message || e.code)) ? 'Sem permissão para isso. Só o dono da casa ou um organizador pode mexer.' : 'Não consegui salvar agora. Tente de novo.', 5000); return false; }
  finally { tela.remove(); }
}
/* ---------- plaquinhas A4 com QR code (visitantes e moradores com convite) ---------- */
// O QR é desenhado no próprio celular pela biblioteca qrcode-generator (cdnjs, com conferência de integridade).
let qrLib = null;
function carregarQR() {
  if (window.qrcode) return Promise.resolve(window.qrcode);
  if (!qrLib) qrLib = new Promise((ok, erro) => {
    const sc = document.createElement('script');
    sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';
    sc.integrity = 'sha384-mZT2gIty7ZDdOGkxfP6joZcYdMW1Jvj9dRlfpTmaJAKKXTqzygtB22k7FLe+KZC1'; sc.crossOrigin = 'anonymous'; sc.referrerPolicy = 'no-referrer';
    sc.onload = () => window.qrcode ? ok(window.qrcode) : erro(new Error('qr')); sc.onerror = () => { qrLib = null; erro(new Error('qr')); };
    document.head.appendChild(sc);
  });
  return qrLib;
}
async function svgQR(texto) { const f = await carregarQR(); const q = f(0, 'H'); q.addData(texto); q.make(); return q.createSvgTag({cellSize: 8, margin: 3, scalable: true}); }
const PL_BAT = "<svg viewBox=\"0 0 34 18\" fill=\"#7b5cc0\"><path d=\"M0 10C3 2 8 2 12 8c1-4 4-4 5 0 1-4 4-4 5 0 4-6 9-6 12 2-6-1-10 1-14 6-1-3-5-3-6 0-4-5-8-7-14-6z\"/></svg>";
const PL_FANT = "<svg viewBox=\"0 0 40 46\"><path d=\"M20 2C9 2 4 10 4 20v24l5-5 5 5 6-5 6 5 5-5 5 5V20C36 10 31 2 20 2z\" fill=\"#fff\"/><circle cx=\"14\" cy=\"18\" r=\"3\" fill=\"#1a1428\"/><circle cx=\"26\" cy=\"18\" r=\"3\" fill=\"#1a1428\"/><ellipse cx=\"20\" cy=\"27\" rx=\"3\" ry=\"4\" fill=\"#1a1428\"/></svg>";
const PL_DRAC = "<svg class=\"pl-drac-svg\" viewBox=\"0 0 160 170\" aria-hidden=\"true\"><ellipse cx=\"80\" cy=\"164\" rx=\"46\" ry=\"5\" fill=\"#000\" opacity=\".35\"/><g class=\"capa\"><path d=\"M18 74 L80 58 L142 74 L150 162 L10 162 Z\" fill=\"#1a0f2e\"/><path d=\"M30 80 L80 66 L130 80 L136 160 L24 160 Z\" fill=\"#b3123b\"/></g><path d=\"M44 100 L80 88 L116 100 L118 160 L42 160 Z\" fill=\"#1a0f2e\"/><path d=\"M66 96 L80 108 L94 96 L94 160 L66 160 Z\" fill=\"#f4f1fb\"/><path d=\"M74 104 l6 10 6-10 z\" fill=\"#b3123b\"/><path d=\"M26 64 L56 84 L46 50 Z M134 64 L104 84 L114 50 Z\" fill=\"#b3123b\"/><path d=\"M24 62 L54 82 L44 46 Z M136 62 L106 82 L116 46 Z\" fill=\"#2a1846\"/><ellipse cx=\"80\" cy=\"56\" rx=\"30\" ry=\"34\" fill=\"#dcd6f0\"/><path d=\"M50 50 Q50 18 80 18 Q110 18 110 50 Q100 34 80 44 Q60 34 50 50 Z\" fill=\"#14091f\"/><path d=\"M48 54 l-6 -2 6 10z M112 54 l6 -2 -6 10z\" fill=\"#dcd6f0\"/><g class=\"olhos\"><ellipse cx=\"68\" cy=\"56\" rx=\"6\" ry=\"7\" fill=\"#fff\"/><ellipse cx=\"92\" cy=\"56\" rx=\"6\" ry=\"7\" fill=\"#fff\"/><circle cx=\"69\" cy=\"57\" r=\"3.4\" fill=\"#b3123b\"/><circle cx=\"93\" cy=\"57\" r=\"3.4\" fill=\"#b3123b\"/><circle cx=\"70\" cy=\"55.5\" r=\"1.1\" fill=\"#fff\"/><circle cx=\"94\" cy=\"55.5\" r=\"1.1\" fill=\"#fff\"/></g><path d=\"M60 46 l14 4 M100 46 l-14 4\" stroke=\"#14091f\" stroke-width=\"3\" stroke-linecap=\"round\"/><ellipse cx=\"62\" cy=\"68\" rx=\"5\" ry=\"3\" fill=\"#ff8fb0\" opacity=\".45\"/><ellipse cx=\"98\" cy=\"68\" rx=\"5\" ry=\"3\" fill=\"#ff8fb0\" opacity=\".45\"/><g class=\"boca\"><path d=\"M68 72 Q80 82 92 72 Q80 78 68 72 Z\" fill=\"#4a0d1e\"/><path d=\"M72 73.5 l2.2 6 2.2-5.4 z M83.6 74.1 l2.2 5.4 2.2-6 z\" fill=\"#fff\"/></g></svg>";
const PL_ABO = "<svg  viewBox=\"0 0 120 112\" aria-hidden=\"true\"><ellipse cx=\"60\" cy=\"106\" rx=\"40\" ry=\"5\" fill=\"#000\" opacity=\".35\"/><path d=\"M59 26c-1-9 2-16 8-20\" stroke=\"#4f7a24\" stroke-width=\"7\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M66 12c9-7 20-5 25 2-9 4-17 4-25-2z\" fill=\"#6fa83a\"/><path d=\"M70 14c-4 6-3 12 2 16\" stroke=\"#6fa83a\" stroke-width=\"2.5\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"33\" cy=\"64\" rx=\"25\" ry=\"38\" fill=\"#e86f0c\"/><ellipse cx=\"87\" cy=\"64\" rx=\"25\" ry=\"38\" fill=\"#e86f0c\"/><ellipse cx=\"60\" cy=\"64\" rx=\"31\" ry=\"41\" fill=\"#ff8a1f\"/><ellipse cx=\"48\" cy=\"44\" rx=\"9\" ry=\"16\" fill=\"#ffb35c\" opacity=\".55\"/><ellipse cx=\"22\" cy=\"54\" rx=\"5\" ry=\"12\" fill=\"#ffb35c\" opacity=\".35\"/><path d=\"M44 26q-10 38 0 76M76 26q10 38 0 76\" stroke=\"#c25400\" stroke-width=\"2\" fill=\"none\" opacity=\".45\"/><g class=\"rosto\" fill=\"#ffd84a\"><path d=\"M30 52l13-14 9 18z\"/><path d=\"M90 52l-13-14-9 18z\"/><path d=\"M60 60l-6 9h12z\"/><path d=\"M26 72q34 30 68 0l-8 3-5 8-7-6-6 8-6-8-6 8-6-8-7 6-5-8z\"/></g></svg>";
// Convite da plaquinha: aproveita um válido até depois do evento; senão cria um que vale até 7 dias após o Halloween.
async function conviteParaPlaca() {
  const agora = Date.now(), m = momentosEvento(), ate = Math.max((m ? m.fim.getTime() : agora) + 7 * 864e5, agora + 30 * 864e5);
  const bom = convites.filter(c => c.ativo && c.expiraEm >= (m ? m.fim.getTime() : agora + 864e5)).sort((a, b) => b.expiraEm - a.expiraEm)[0];
  if (bom) return bom.id;
  const cod = codigoAleatorio(12);
  await fb.fs.setDoc(fb.convite(cid, cod), {papel: 'morador', ativo: true, expiraEm: ate, criadoPor: usuario.uid, criadoEm: agora});
  return cod;
}
function quandoPlaca() {
  const partes = [];
  if (/^\d{4}-\d{2}-\d{2}$/.test(evento.data || '')) { const [, mm, dd] = evento.data.split('-'); partes.push(`${+dd} de ${['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'][+mm - 1]}`); }
  const hh = t => { const [a, b] = String(t).split(':'); return b === '00' ? `${+a}h` : `${+a}h${b}`; };
  if (evento.horaInicio && evento.horaFim) partes.push(`das ${hh(evento.horaInicio)} às ${hh(evento.horaFim)}`);
  if (evento.avisos) partes.push(evento.avisos.slice(0, 40));
  return partes;
}
// A plaquinha é desenhada num canvas A4 a 300 dpi e vira PNG: sai igual em qualquer celular e impressora
// (a impressão do navegador transformava os brilhos em retângulos e cortava as bordas).
const PX_MM = 2480 / 210, PT = 0.3528 * PX_MM;
function imagemSvg(svg) {
  const vb = (svg.match(/viewBox="([^"]+)"/) || [])[1] || '0 0 100 100'; const [, , w, hh] = vb.split(/\s+/).map(Number);
  const src = svg.replace(/<svg([^>]*)>/, (m, a) => `<svg${a.replace(/\s(width|height|class)="[^"]*"/g, '')} xmlns="http://www.w3.org/2000/svg" width="${w * 10}" height="${hh * 10}">`);
  return new Promise((ok, erro) => { const im = new Image(); im.onload = () => ok({im, r: hh / w}); im.onerror = erro; im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(src); });
}
function caixaArredondada(g, x, y, w, hh, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + hh, r); g.arcTo(x + w, y + hh, x, y + hh, r); g.arcTo(x, y + hh, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function linhasDeTexto(g, texto, larg) { const ps = texto.split(' '), ls = []; let l = ''; ps.forEach(p => { const t = l ? l + ' ' + p : p; if (g.measureText(t).width > larg && l) { ls.push(l); l = p; } else l = t; }); if (l) ls.push(l); return ls; }
// texto centralizado com partes coloridas: [[texto, cor], ...]
function textoColorido(g, partes, cx, y) { const tot = partes.reduce((t, [x]) => t + g.measureText(x).width, 0); let x = cx - tot / 2; g.textAlign = 'left'; partes.forEach(([t, c]) => { g.fillStyle = c; g.fillText(t, x, y); x += g.measureText(t).width; }); g.textAlign = 'center'; }
async function desenharPlaca(tipo, link) {
  const W = 2480, H = 3508, mm = v => v * PX_MM, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  await Promise.all(['900 40px Nunito', '800 40px Nunito', '700 40px Nunito', '40px Creepster'].map(f => document.fonts.load(f).catch(() => {})));
  const [bat, fant, drac, abo] = await Promise.all([PL_BAT, PL_FANT, PL_DRAC, PL_ABO].map(imagemSvg));
  const qr = (await carregarQR())(0, 'H'); qr.addData(link); qr.make();
  const mor = tipo === 'moradores', cx = W / 2, laranja = '#ff8a1f', claro = '#f7f1ff', suave = '#e7defa';
  // fundo, estrelas e lua
  const bg = g.createRadialGradient(cx, mm(320), mm(20), cx, mm(320), mm(330)); bg.addColorStop(0, '#3a1d5e'); bg.addColorStop(.55, '#15102a'); bg.addColorStop(1, '#0d0a16'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  let sem = 7; const rnd = () => (sem = (sem * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(255,255,255,${.35 + rnd() * .6})`; g.beginPath(); g.arc(rnd() * W, rnd() * H * .55, 2 + rnd() * 5, 0, 7); g.fill(); }
  g.save(); g.shadowColor = 'rgba(255,243,196,.45)'; g.shadowBlur = mm(14); const lua = g.createRadialGradient(mm(172), mm(24), mm(2), mm(178), mm(30), mm(18)); lua.addColorStop(0, '#fffbe6'); lua.addColorStop(.6, '#fff3c4'); lua.addColorStop(1, '#e9d58b'); g.fillStyle = lua; g.beginPath(); g.arc(mm(178), mm(30), mm(17), 0, 7); g.fill(); g.restore();
  [[22, 20, 16], [60, 10, 11], [140, 26, 12]].forEach(([x, y, w]) => g.drawImage(bat.im, mm(x), mm(y), mm(w), mm(w) * bat.r));
  [[12, 268, 13], [186, 270, 11]].forEach(([x, y, w]) => { g.globalAlpha = .9; g.drawImage(fant.im, mm(x), mm(y), mm(w), mm(w) * fant.r); g.globalAlpha = 1; });
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  // faixa
  const faixa = mor ? 'MORADOR, PARTICIPE!' : 'BEM-VINDOS, CAÇADORES DE DOCES!';
  g.font = `900 ${15 * PT}px Nunito`; const fw = g.measureText(faixa).width + mm(16), fh = mm(12);
  g.save(); g.translate(cx, mm(26)); g.rotate(-2 * Math.PI / 180);
  g.fillStyle = mor ? '#b84a00' : '#3f8f2a'; caixaArredondada(g, -fw / 2, -fh / 2 + mm(1.5), fw, fh, mm(3)); g.fill();
  g.fillStyle = mor ? laranja : '#8df06a'; caixaArredondada(g, -fw / 2, -fh / 2, fw, fh, mm(3)); g.fill();
  g.fillStyle = mor ? '#1c0b00' : '#06200a'; g.fillText(faixa, 0, mm(2.2)); g.restore();
  // marca
  g.font = `${60 * PT}px Creepster, Impact, sans-serif`; g.save(); g.fillStyle = '#4a1d00';
  const marca = [['Rota ', claro], ['Assombrada', laranja]]; textoColorido(g, marca.map(([t]) => [t, '#4a1d00']), cx, mm(57) + mm(1)); g.restore(); textoColorido(g, marca, cx, mm(57));
  // título, condomínio e quando
  g.font = `900 ${27 * PT}px Nunito`;
  textoColorido(g, mor ? [['Sua casa vai ', claro], ['dar doces', laranja], ['?', claro]] : [['Ache as casas que ', claro], ['dão doces', laranja], ['!', claro]], cx, mm(76));
  g.font = `800 ${14 * PT}px Nunito`; g.fillStyle = suave; g.fillText(condo.nome, cx, mm(88));
  g.font = `900 ${13 * PT}px Nunito`; const chips = quandoPlaca(), cw = chips.map(t => g.measureText(t).width + mm(10)), gap = mm(3), totc = cw.reduce((a, b) => a + b, 0) + gap * (chips.length - 1);
  let xc = cx - totc / 2; chips.forEach((t, i) => { caixaArredondada(g, xc, mm(93), cw[i], mm(10), mm(5)); g.fillStyle = 'rgba(106,63,216,.3)'; g.fill(); g.lineWidth = mm(.5); g.strokeStyle = '#6a3fd8'; g.stroke(); g.fillStyle = claro; g.fillText(t, xc + cw[i] / 2, mm(100)); xc += cw[i] + gap; });
  // QR com moldura laranja, Drácula e abóbora dos lados
  const qs = mm(92), qx = cx - qs / 2, qy = mm(110);
  caixaArredondada(g, qx - mm(2), qy - mm(2), qs + mm(4), qs + mm(4), mm(7)); g.fillStyle = laranja; g.fill();
  caixaArredondada(g, qx, qy, qs, qs, mm(5)); g.fillStyle = '#fff'; g.fill();
  const n = qr.getModuleCount(), cel = (qs - mm(10)) / n; g.fillStyle = '#1a1428';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) g.fillRect(Math.round(qx + mm(5) + c * cel), Math.round(qy + mm(5) + r * cel), Math.ceil(cel), Math.ceil(cel));
  const dw = mm(36); g.drawImage(drac.im, qx - dw - mm(8), qy + qs / 2 - dw * drac.r / 2, dw, dw * drac.r);
  const aw = mm(34); g.drawImage(abo.im, qx + qs + mm(8), qy + qs - aw * abo.r, aw, aw * abo.r);
  // instrução e passos
  g.fillStyle = claro; g.font = `900 ${18 * PT}px Nunito`; g.fillText(mor ? 'Coloque sua casa no mapa em 1 minuto' : 'Aponte a câmera do celular para o código', cx, mm(218));
  g.fillStyle = suave; g.font = `700 ${12 * PT}px Nunito`; g.fillText(mor ? 'Entrada aprovada na hora: é só escanear e entrar com o Google.' : 'O mapa abre na hora. Não precisa instalar nada.', cx, mm(226));
  const passos = mor ? ['Aponte a câmera e abra o convite', 'Entre com sua conta Google', 'Toque em "Participar" e marque sua casa'] : ['Aponte a câmera e abra o mapa', 'Veja as abóboras: cada uma é uma casa com doces', 'Toque em "Montar roteiro" e siga pelo Google Maps'];
  const px0 = mm(16), pg = mm(4), pw = (W - 2 * px0 - 2 * pg) / 3, py = mm(232), ph = mm(30);
  passos.forEach((t, i) => {
    const x = px0 + i * (pw + pg); caixaArredondada(g, x, py, pw, ph, mm(4)); g.fillStyle = 'rgba(28,21,48,.9)'; g.fill(); g.lineWidth = mm(.4); g.strokeStyle = '#3b2f5c'; g.stroke();
    g.fillStyle = laranja; g.beginPath(); g.arc(x + pw / 2, py + mm(7.5), mm(4.5), 0, 7); g.fill(); g.fillStyle = '#1c0b00'; g.font = `900 ${13 * PT}px Nunito`; g.fillText(String(i + 1), x + pw / 2, py + mm(9.3));
    g.fillStyle = suave; g.font = `800 ${11.5 * PT}px Nunito`; linhasDeTexto(g, t, pw - mm(6)).slice(0, 3).forEach((l, k) => g.fillText(l, x + pw / 2, py + mm(17.5) + k * mm(5)));
  });
  if (mor) { const alerta = 'Só para moradores · não compartilhe este código'; g.font = `900 ${12 * PT}px Nunito`; const aw2 = g.measureText(alerta).width + mm(14); caixaArredondada(g, cx - aw2 / 2, mm(266), aw2, mm(10), mm(5)); g.fillStyle = '#e8102b'; g.fill(); g.lineWidth = mm(.6); g.strokeStyle = '#fff'; g.stroke(); g.fillStyle = '#fff'; g.fillText(alerta, cx, mm(273)); }
  // rodapé
  g.fillStyle = '#fff3c4'; g.font = `800 ${(mor ? 10 : 12) * PT}px Nunito`; g.fillText(link.replace(/^https?:\/\//, '').replace(/\/$/, ''), cx, mm(mor ? 284 : 280));
  g.font = `800 ${10 * PT}px Nunito`; textoColorido(g, [['Feito com travessuras por ', 'rgba(231,222,250,.75)'], ['Bruno Couto', laranja]], cx, mm(290));
  return new Promise(ok => cv.toBlob(ok, 'image/png'));
}
async function imprimirPlaca(tipo) {
  if (!cid || !condo || !ehAdmin()) return;
  const b = $(tipo === 'moradores' ? '#btn-placa-moradores' : '#btn-placa-visitantes'); const txt = b.innerHTML; b.disabled = true; b.innerHTML = `${SPIN} Desenhando…`;
  try {
    let link = linkCondo(); if (tipo === 'moradores') link = linkConvite(await conviteParaPlaca());
    const blob = await desenharPlaca(tipo, link); const url = URL.createObjectURL(blob);
    const nome = `plaquinha-${tipo}-${cid}.png`, arquivo = new File([blob], nome, {type: 'image/png'});
    const podeCompartilhar = !!(navigator.canShare && navigator.canShare({files: [arquivo]}));
    $('#folha-in').innerHTML = `<div class="placa-pronta"><h3>Plaquinha ${tipo === 'moradores' ? 'de moradores' : 'de visitantes'} pronta!</h3>
      <img src="${url}" alt="Prévia da plaquinha">
      <div class="acoes">${podeCompartilhar ? '<button class="btn btn-primario" data-placa="compartilhar">Compartilhar</button>' : ''}<a class="btn ${podeCompartilhar ? 'btn-fantasma' : 'btn-primario'}" href="${url}" download="${nome}">Salvar imagem</a></div>
      <p class="dica">Imagem A4 em alta resolução. Para imprimir, abra a imagem e escolha "Ajustar à página".</p></div>`;
    $('#folha-in').onclick = async e => { if (!e.target.closest('[data-placa="compartilhar"]')) return; try { await navigator.share({files: [arquivo], title: 'Plaquinha da Rota Assombrada'}); } catch {} };
    $('#folha').hidden = false; SFX.plim(); evento_('placa', {tipo});
  } catch (e) { console.error(e); toast('Não consegui desenhar a plaquinha. Confira a internet e tente de novo.'); }
  finally { b.disabled = false; b.innerHTML = txt; }
}
// margem da folha muda conforme o que vai imprimir: lista (12 mm) ou plaquinha (sem margem, fundo até a borda)
function paginaImpressao(mm) { let st = document.getElementById('estilo-pagina'); if (!st) { st = document.createElement('style'); st.id = 'estilo-pagina'; document.head.appendChild(st); } st.textContent = `@page{size:A4;margin:${mm}mm}`; }

/* ---------- PDF da lista com mapa (impressão do próprio celular: "Salvar como PDF") ---------- */
// O mapa vira uma imagem: os quadradinhos do OpenStreetMap (estilo claro, gasta menos tinta) num canvas, com as abóboras numeradas.
function carregarImagem(url) { return new Promise((ok, erro) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => ok(i); i.onerror = erro; i.src = url; }); }
async function mapaEstatico(pontos, W, H) {
  const X = (lng, z) => (lng + 180) / 360 * 256 * 2 ** z;
  const Y = (lat, z) => { const r = lat * Math.PI / 180; return (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * 256 * 2 ** z; };
  const pad = 50; let z = 18, xs, ys;
  for (; z >= 3; z--) { xs = pontos.map(p => X(p.lng, z)); ys = pontos.map(p => Y(p.lat, z)); if (Math.max(...xs) - Math.min(...xs) <= W - 2 * pad && Math.max(...ys) - Math.min(...ys) <= H - 2 * pad) break; }
  const ox = (Math.max(...xs) + Math.min(...xs)) / 2 - W / 2, oy = (Math.max(...ys) + Math.min(...ys)) / 2 - H / 2;
  const esc = 2, cv = document.createElement('canvas'); cv.width = W * esc; cv.height = H * esc; const g = cv.getContext('2d'); g.scale(esc, esc);
  g.fillStyle = '#eef0f2'; g.fillRect(0, 0, W, H);
  const pedidos = [];
  for (let tx = Math.floor(ox / 256); tx <= Math.floor((ox + W) / 256); tx++) for (let ty = Math.floor(oy / 256); ty <= Math.floor((oy + H) / 256); ty++)
    pedidos.push(carregarImagem(`https://tile.openstreetmap.org/${z}/${tx}/${ty}.png`).then(img => g.drawImage(img, tx * 256 - ox, ty * 256 - oy)).catch(() => {}));
  await Promise.all(pedidos);
  pontos.forEach(p => {
    const x = X(p.lng, z) - ox + (p.dx || 0), y = Y(p.lat, z) - oy;
    g.beginPath(); g.arc(x, y, p.tipo === 'portaria' ? 14 : 17, 0, Math.PI * 2);
    g.fillStyle = p.tipo === 'portaria' ? '#fff3c4' : '#ff8a1f'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#3a1d00'; g.stroke();
    const t = String(p.rotulo).slice(0, 4); g.fillStyle = '#1c0b00'; g.font = `900 ${t.length > 3 ? 11 : 14}px Nunito, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, x, y + 0.5);
  });
  g.font = '600 11px Arial, sans-serif'; g.textAlign = 'right'; g.textBaseline = 'bottom';
  const cred = '© colaboradores do OpenStreetMap'; const lw = g.measureText(cred).width;
  g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(W - lw - 12, H - 18, lw + 12, 18); g.fillStyle = '#333'; g.fillText(cred, W - 6, H - 4);
  return cv.toDataURL('image/png');
}
async function imprimirLista() {
  if (!cid || !condo || !casas.length) { toast('Ainda não tem casas para imprimir.'); return; }
  const b = $('#btn-imprimir'); const txt = b.innerHTML; b.disabled = true; b.innerHTML = `${SPIN} Preparando…`;
  try {
    const lista = casas.filter(c => typeof c.lat === 'number').slice().sort((a, c) => (a.rua || '').localeCompare(c.rua || '', 'pt') || String(a.numero).localeCompare(String(c.numero), 'pt', {numeric: true}));
    const desloc = espalharPinos(lista);
    const pontos = lista.map(c => ({lat: c.lat, lng: c.lng, rotulo: c.numero, dx: desloc[c.id] || 0}));
    if (evento.portaria) pontos.push({lat: evento.portaria.lat, lng: evento.portaria.lng, rotulo: 'P', tipo: 'portaria'});
    let img = ''; try { img = await mapaEstatico(pontos, 1000, 620); } catch (e) { console.error(e); }
    const partes = [evento.nome, evento.data ? fmtData(evento.data) + (ano ? `/${ano}` : '') : '', evento.horaInicio && evento.horaFim ? `${evento.horaInicio} às ${evento.horaFim}` : ''].filter(Boolean);
    const linhas = lista.map(c => { const {ini, fim} = horario(c); return `<tr><td class="imp-num">${h(c.numero)}</td><td>${h(c.rua || '')}</td><td>${h(c.familia || '')}</td><td>${ini && fim ? `${h(ini)}–${h(fim)}` : ''}</td><td>${(c.oferece || []).map(k => h(rotuloDe(OFERECE, k))).join(', ')}</td><td>${(c.flags || []).map(k => h(rotuloDe(FLAGS, k))).join(', ')}${c.obs ? `${(c.flags || []).length ? '. ' : ''}${h(c.obs)}` : ''}</td></tr>`; }).join('');
    let el = $('#impressao'); if (!el) { el = document.createElement('div'); el.id = 'impressao'; document.body.appendChild(el); }
    el.className = ''; paginaImpressao(12);
    el.innerHTML = `<div class="imp-topo"><div class="imp-marca">Rota <span>Assombrada</span></div><div class="imp-link">${h(linkCondo().replace(/^https?:\/\//, ''))}</div></div>
      <h1>${h(condo.nome)}</h1><p class="imp-sub">${h(partes.join(' · '))}${evento.avisos ? ` · ${h(evento.avisos)}` : ''}</p>
      ${img ? `<img class="imp-mapa" src="${img}" alt="Mapa das casas participantes">` : ''}
      <p class="imp-legenda"><span class="imp-bola"></span> casa participante (número da casa)${evento.portaria ? ' &nbsp; <span class="imp-bola imp-p"></span> portaria' : ''}</p>
      <h2>${lista.length} casa${lista.length > 1 ? 's' : ''} participante${lista.length > 1 ? 's' : ''}</h2>
      <table><thead><tr><th>Nº</th><th>Rua</th><th>Família</th><th>Horário</th><th>Oferece</th><th>Avisos</th></tr></thead><tbody>${linhas}</tbody></table>
      <p class="imp-rodape">Gerado em ${new Date().toLocaleString('pt-BR', {dateStyle: 'short', timeStyle: 'short'})} · Feito com travessuras por Bruno Couto</p>`;
    // espera a imagem do mapa ficar pronta antes de abrir a impressão
    const im = el.querySelector('img'); if (im && !im.complete) await new Promise(ok => { im.onload = im.onerror = ok; });
    // O Safari do iPhone só deixa imprimir logo depois de um toque: depois de baixar o mapa o toque já "venceu" e ele ignora.
    // Por isso a impressão abre num segundo toque, na folha de "pronto".
    const arquivo = img ? new File([Uint8Array.from(atob(img.split(',')[1]), ch => ch.charCodeAt(0))], `mapa-halloween-${cid}.png`, {type: 'image/png'}) : null;
    const podeCompartilhar = !!(arquivo && navigator.canShare && navigator.canShare({files: [arquivo]}));
    $('#folha-in').innerHTML = `<div class="placa-pronta"><h3>Lista com mapa pronta!</h3>${img ? `<img src="${img}" alt="Prévia do mapa">` : ''}
      <div class="acoes acoes-pdf"><button class="btn btn-primario" data-lista="imprimir">Abrir PDF</button>${podeCompartilhar ? '<button class="btn btn-fantasma" data-lista="mapa">Compartilhar só o mapa</button>' : ''}</div>
      <p class="dica">No iPhone: toque em <b>Abrir PDF</b>, depois no botão de compartilhar e em <b>Salvar em Arquivos</b> ou <b>Imprimir</b>. Se nada abrir, abra o site pelo Safari em vez do ícone da tela de início.</p></div>`;
    $('#folha-in').onclick = async e => {
      const x = e.target.closest('[data-lista]'); if (!x) return;
      if (x.dataset.lista === 'imprimir') { paginaImpressao(12); document.body.classList.add('imprimindo'); evento_('pdf_lista', {casas: lista.length}); window.print(); return; }
      try { await navigator.share({files: [arquivo], title: 'Mapa do Halloween'}); } catch {}
    };
    $('#folha').hidden = false; SFX.plim();
  } catch (e) { console.error(e); toast('Não consegui montar a lista. Confira a internet e tente de novo.'); }
  finally { b.disabled = false; b.innerHTML = txt; }
}
window.addEventListener('afterprint', () => { document.body.classList.remove('imprimindo'); });

/* ---------- contagem regressiva para o Halloween ---------- */
// Usa a data e o horário do evento no relógio do celular. Antes do dia: dias, horas, minutos e segundos.
// No dia: quanto falta para começar. Durante: "está acontecendo". Depois: até o ano que vem.
function momentosEvento() {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(evento.data || '')) return null;
  const ini = new Date(`${evento.data}T${hm(evento.horaInicio) != null ? evento.horaInicio : '00:00'}:00`);
  let fim = new Date(`${evento.data}T${hm(evento.horaFim) != null ? evento.horaFim : '23:59'}:00`);
  if (fim <= ini) fim = new Date(fim.getTime() + 864e5);
  return {dia: new Date(`${evento.data}T00:00:00`), ini, fim};
}
const doisDig = n => String(n).padStart(2, '0');
let timerContagem = null;
function renderContagem() {
  const box = $('#contagem'); const m = cid && condo ? momentosEvento() : null;
  if (!m || !ehAnoAtual() || abaAtual !== 'mapa') { box.hidden = true; clearInterval(timerContagem); timerContagem = null; return; }   // só na tela principal (Mapa)
  const agora = Date.now(); let html = '';
  if (agora < m.dia.getTime()) {
    const t = Math.floor((m.ini.getTime() - agora) / 1000);
    const d = Math.floor(t / 86400), hh = Math.floor(t % 86400 / 3600), mm = Math.floor(t % 3600 / 60), ss = t % 60;
    html = `<span class="cd-rotulo">Faltam para o Halloween</span><div class="cd-caixas">${[[d, d === 1 ? 'dia' : 'dias'], [doisDig(hh), 'horas'], [doisDig(mm), 'min'], [doisDig(ss), 'seg']].map(([v, r]) => `<span class="cd-caixa"><b>${v}</b><small>${r}</small></span>`).join('')}</div>`;
  } else if (agora < m.ini.getTime()) {
    const t = Math.floor((m.ini.getTime() - agora) / 1000), hh = Math.floor(t / 3600), mm = Math.floor(t % 3600 / 60), ss = t % 60;
    html = `<span class="cd-rotulo">Hoje é dia!</span><span class="cd-frase">Começa às <b>${h(evento.horaInicio)}</b>. Faltam <b>${hh ? hh + 'h ' : ''}${doisDig(mm)}min ${doisDig(ss)}s</b></span>`;
  } else if (agora < m.fim.getTime()) {
    html = `<span class="cd-rotulo cd-agora">Está acontecendo agora!</span><span class="cd-frase">Até <b>${h(evento.horaFim || '23:59')}</b>. Bons doces e travessuras!</span>`;
  } else {
    html = `<span class="cd-rotulo">O Halloween de ${h(String(ano || ''))} acabou</span><span class="cd-frase">Até o ano que vem!</span>`;
  }
  box.innerHTML = html; box.hidden = false;
  box.classList.toggle('cd-dia', agora >= m.dia.getTime() && agora < m.fim.getTime());
  if (!timerContagem) timerContagem = setInterval(renderContagem, 1000);
}
function renderCabecalho() {
  if (!cid) { $('#sub-evento').textContent = 'Mapa e roteiro do Halloween do seu condomínio.'; return; }
  $('#linha-condo').hidden = false;
  if (!condoCarregado) $('#nome-condo').innerHTML = '<span class="skel skel-inline" aria-label="Carregando"></span>'; else $('#nome-condo').textContent = condo ? condo.nome : 'Condomínio não encontrado';
  if (!condoCarregado) { $('#sub-evento').innerHTML = '<span class="skel skel-inline skel-largo"></span>'; return; }
  const pp = $('#pill-papel'); const rotulo = donoPlataforma ? 'Dono' : {admin: 'Admin', morador: 'Morador', pendente: 'Aguardando'}[papel] || '';
  pp.hidden = !rotulo; pp.textContent = rotulo; pp.className = 'pill papel ' + (papel || (donoPlataforma ? 'admin' : ''));
  const partes = []; if (evento.nome) partes.push(evento.nome); if (evento.data) partes.push(fmtData(evento.data) + (ano && ano !== ANO_HOJE ? `/${ano}` : '')); if (evento.horaInicio && evento.horaFim) partes.push(`${evento.horaInicio}–${evento.horaFim}`);
  $('#sub-evento').textContent = partes.join(' · ') + (evento.avisos ? (partes.length ? ' · ' : '') + evento.avisos : '');
}
function renderConta() {
  if (!$('#folha').hidden && $('#folha-in [data-criar]') && !$('#form-criar') && usuario) abrirCriarCondo();
  const b = $('#btn-conta'); delete b.dataset.confirma;
  if (!authPronto) { b.innerHTML = `${SPIN}<span>Carregando perfil…</span>`; b.setAttribute('aria-label', 'Carregando perfil'); b.title = 'Carregando perfil'; b.classList.remove('logado'); b.classList.add('carregando'); return; }
  b.classList.remove('carregando');
  if (usuario) { const ini = (usuario.nome || usuario.email || '?').trim().charAt(0).toUpperCase(); b.innerHTML = `<span class="avatar">${h(ini)}</span>`; b.setAttribute('aria-label', `Conectado como ${usuario.nome || usuario.email}. Toque para sair.`); b.title = 'Sair'; b.classList.add('logado'); }
  else { b.innerHTML = `${IC.google}<span>Entrar</span>`; b.setAttribute('aria-label', 'Entrar com Google'); b.title = 'Entrar com Google'; b.classList.remove('logado'); }
}
function cartaoAviso(titulo, texto, botoes = '') { return `${PUMPKIN_BIG}<h3>${titulo}</h3><p>${texto}</p>${botoes ? `<div class="acoes acoes-centro">${botoes}</div>` : ''}`; }
function renderAcesso() {
  const ac = $('#acesso'), bloco = $('#mapa-bloco'); if (!cid) return;
  let html = '';
  if (!condoCarregado || (condo && !podeVerCasas && (!papelCarregado || !casasCarregadas))) html = `<div class="skel-cartao" aria-hidden="true"><span class="skel skel-circ grande"></span><span class="skel skel-l1" style="width:60%"></span><span class="skel skel-l2" style="width:80%"></span><span class="skel skel-btn largo"></span></div><p class="res-carregando">${SPIN} Abrindo o portão do condomínio…</p>`;
  else if (condoCarregado && !condo) html = cartaoAviso('Condomínio não encontrado', 'Confira o link com quem te mandou. O código pode ter mudado.', `<button class="btn btn-primario" data-acao-acesso="inicio">Ver outros condomínios</button>`);
  else if (condo && !podeVerCasas && papelCarregado) {
    if (usuario && (aceitandoConvite || (temConvite() && !papelCarregado))) html = cartaoAviso('Aceitando seu convite…', 'Só um instante: estamos colocando você no condomínio.', '');
    else if (!usuario) html = cartaoAviso('Mapa só para moradores', temConvite() ? 'Você recebeu um convite! Entre com Google para aceitar.' : `O mapa de ${h(condo.nome)} é fechado. Entre com Google para pedir acesso.`, `<button class="btn btn-google" data-acao-acesso="entrar">${IC.google} Entrar com Google</button>`);
    else if (papel === 'pendente') html = cartaoAviso('Pedido enviado', 'Um admin do condomínio precisa aprovar sua entrada. Assim que aprovar, o mapa aparece aqui sozinho.', `<button class="btn btn-fantasma" data-acao-acesso="cancelar">Cancelar pedido</button>`);
    else html = cartaoAviso('Você ainda não faz parte', `Peça para entrar em ${h(condo.nome)}. Se alguém te mandou um link de convite, abra por ele e a entrada é automática.`, `<button class="btn btn-primario" data-acao-acesso="pedir">Pedir para entrar</button>`);
  }
  ac.innerHTML = html; ac.hidden = !html;
  const mostraMapa = !html && !!condo;
  const estava = !bloco.hidden; bloco.hidden = !mostraMapa;
  if (mostraMapa && !estava) setTimeout(() => { mapa.invalidateSize(); caberPinos(); }, 50);
}
function atualizarParticipar() {
  if (!cid) return;
  const gate = $('#gate'), form = $('#form-casa');
  let html = '';
  if (!authPronto) html = `<p class="res-carregando">${SPIN} Conferindo seu login…</p><span class="skel skel-campo"></span><span class="skel skel-btn largo"></span>`;
  else if (!usuario) html = `${temConvite() ? '<p class="ok-msg">Você recebeu um convite! Entre com Google e o cadastro é aprovado na hora.</p>' : ''}<button type="button" class="btn btn-google btn-grande" data-acao-acesso="entrar">${IC.google} Entrar com Google</button><p class="dica">Usamos o login só para saber que a casa é sua. Seu e-mail não aparece no mapa.</p>`;
  else if (aceitandoConvite || (temConvite() && !ehMorador())) html = `<p class="res-carregando">${SPIN} Aceitando seu convite…</p><span class="skel skel-campo"></span><span class="skel skel-btn largo"></span>`;
  else if (!papelCarregado) html = `<p class="res-carregando">${SPIN} Conferindo seu acesso…</p><span class="skel skel-campo"></span><span class="skel skel-campo"></span><span class="skel skel-btn largo"></span>`;
  else if (!ehMorador() && papel === 'pendente') html = `<p>Seu pedido está com o admin. Assim que aprovar, você cadastra a casa aqui.</p>`;
  else if (!ehMorador() && !minhaCasa()) html = `<button type="button" class="btn btn-primario btn-grande" data-acao-acesso="pedir">Pedir para entrar no condomínio</button><p class="dica">Só moradores aprovados colocam casas no mapa.</p>`;
  else if (!ehAnoAtual() && !ehAdmin()) html = `<p>Este é o Halloween de ${ano}, que já passou. Para cadastrar sua casa, volte para ${anoAtualDoCondo()}.</p><button type="button" class="btn btn-primario" data-ano-atual>Ir para ${anoAtualDoCondo()}</button>`;
  gate.innerHTML = html; gate.hidden = !html; form.hidden = !!html;
  if (!html && abaAtual === 'participar') setTimeout(() => { iniciarMapaCasa(); atualizarMapaCasa(); }, 80);
  $('#participar-intro').textContent = html ? (usuario ? '' : 'Para colocar sua casa no mapa, entre com sua conta Google. Assim só você consegue mexer nela.')
    : criandoOutra ? 'Ela fica sob sua responsabilidade de admin.'
    : 'Marque a casa no mapa (ou use o GPS na porta) e conte o que vai rolar.';
  // Quem já tem casa sempre vê a própria casa aqui (nunca um formulário vazio, que sobrescreveria a casa ao salvar).
  if (!html && !editandoId && !criandoOutra) { const minha = minhaCasa(); if (minha) { jaAbriuMinhaCasa = true; editandoId = minha.id; preencherForm(minha); } }
  verificarCasaAnoPassado();
  atualizarForm();
  $('#sair-condo').hidden = !(usuario && papelCarregado && papel === 'morador');
}
async function verificarCasaAnoPassado() {
  const box = $('#repetir-casa');
  const mostrar = () => { box.hidden = !(casaAnoPassado && casaAnoPassado.dados && casaAnoPassado.ano === ano - 1 && !editandoId && !criandoOutra && ehAnoAtual() && casasCarregadas && !minhaCasa()); if (!box.hidden) $('#btn-repetir').textContent = `Repetir minha casa de ${ano - 1}`; };
  if (!usuario || !cid || !ano || !ehMorador()) { box.hidden = true; return; }
  if (casaAnoPassado && casaAnoPassado.ano === ano - 1 && casaAnoPassado.cid === cid) return mostrar();
  casaAnoPassado = {ano: ano - 1, cid, dados: null};
  try { const s = await fb.fs.getDoc(fb.casaAno(cid, ano - 1, usuario.uid)); casaAnoPassado.dados = s.exists() ? s.data() : null; if (!casaAnoPassado.dados) casaAnoPassado = {ano: ano - 1, cid, vazio: true}; } catch (e) { casaAnoPassado = {ano: ano - 1, cid, vazio: true}; }
  if (casaAnoPassado.vazio) { box.hidden = true; return; }
  mostrar();
}
function atualizarForm() {
  const minha = editandoId && usuario && (editandoId === usuario.uid || souResponsavel(casaPorId(editandoId)));
  const casaEd = editandoId && casaPorId(editandoId);
  renderMoradores();
  // nome automático da casa aberta no formulário (muda se trocar de casa ou de conta)
  const idNome = editandoId || (!criandoOutra && usuario ? usuario.uid : ''), autoNovo = idNome ? nomeDivertido(idNome) : '';
  if (autoNovo !== nomeAutoDaCasa || !$('#chips-nome').children.length) { nomeAutoDaCasa = autoNovo; renderSugestoesNome(true); }
  $('#btn-enviar-txt').textContent = editandoId ? 'Salvar alterações' : 'Salvar casa no mapa';
  $('#participar-titulo').textContent = minha ? 'Minha casa' : editandoId ? 'Casa de outra família' : criandoOutra ? 'Nova casa (admin)' : 'Cadastrar minha casa';
  // Faixa laranja: deixa claro que não é a sua casa e oferece o caminho de volta.
  const outra = !!((editandoId && !minha) || criandoOutra), fx = $('#faixa-edicao');
  fx.hidden = !outra; $('#painel-participar .cartao').classList.toggle('editando-outra', outra);
  if (outra) fx.innerHTML = `${IC.editar}<div><b>${criandoOutra ? 'Cadastrando a casa de outra família' : `Editando ${casaEd ? h(casaEd.familia || nomeCasaTxt(casaEd)) : 'outra casa'}`}</b><span>Isso não mexe na sua casa.</span></div><button type="button" class="btn btn-p btn-fantasma" data-sair-edicao>${minhaCasa() ? 'Voltar para a minha casa' : 'Cancelar'}</button>`;
  $('#aba-participar span').textContent = minhaCasa() ? 'Minha casa' : 'Participar';
  $('#btn-ir-participar').textContent = minhaCasa() ? 'Editar minha casa' : 'Cadastrar minha casa';
  mostrarHorasCasa(); renderEsgotou();
  $('#btn-cancelar-edicao').hidden = !(editandoId && !minha) && !criandoOutra;
  $('#btn-excluir-minha').hidden = !editandoId || !casaPorId(editandoId);
  $('#btn-excluir-minha').textContent = minha ? 'Tirar minha casa do mapa' : 'Excluir esta casa';
  const ep = $('#estado-pin'); ep.className = 'estado-pin ' + (pinCasa ? 'ok' : ''); ep.innerHTML = pinCasa ? `${IC.check} Casa marcada no mapa` : `${IC.x} Ainda não marcada`;
}
// Links com prévia própria no WhatsApp: /c/CODIGO/ mostra o nome do condomínio e /c/CODIGO/convite/#código avisa que é só para moradores.
// Condomínios fora da busca (ou recém-criados) usam as páginas genéricas /c/#CODIGO e /convite/#CODIGO/código.
const BASE_SITE = `${location.origin}${location.pathname.replace(/[^/]*$/, '')}`;
const paginaPrevia = {};
async function checarPaginaPrevia(id) {
  if (!id || id in paginaPrevia) return;
  paginaPrevia[id] = false;
  try { const r = await fetch(`${BASE_SITE}c/${id}/`, {method: 'HEAD', cache: 'no-store'}); paginaPrevia[id] = r.ok; } catch {}
  if (paginaPrevia[id] && id === cid) { if (abaAtual === 'organizador') renderAdmin(); ajustarEndereco(); }
}
// Na barra do navegador, o condomínio aparece como /c/CODIGO/ (a página com prévia do nome no WhatsApp), para quem
// copiar o endereço de lá. O app continua na raiz; a rota mesmo fica no "#". Convite e início ficam na raiz.
function ajustarEndereco() {
  try {
    // Barra limpa: /c/CODIGO/ para o condomínio (é o link com prévia do nome), / para o início. Convite e
    // condomínio sem página de prévia continuam com o "#", que é onde a rota mora.
    const r = lerRota();
    const url = r.c && !r.convite && paginaPrevia[r.c] ? `/c/${r.c}/${location.search}`
      : !r.c && !r.convite ? `/${location.search}` : `/${location.search}${location.hash}`;
    if (location.pathname + location.search + location.hash !== url) history.replaceState(history.state, '', url);
  } catch {}
}
function linkCondo() { return paginaPrevia[cid] ? `${BASE_SITE}c/${cid}/` : `${BASE_SITE}c/#${cid}`; }
function linkConvite(cod) { return paginaPrevia[cid] ? `${BASE_SITE}c/${cid}/convite/#${cod}` : `${BASE_SITE}convite/#${cid}/${cod}`; }
function campoLivre(sel) { const el = $(sel); return el && document.activeElement !== el; }
// Casas de um membro: a que ele criou ou em que foi colocado como morador (pelo e-mail ou pelo hash do e-mail).
const hashDeEmail = new Map();
function casasDoMembro(m) {
  const email = String(m.email || '').trim().toLowerCase();
  if (email && cid && crypto.subtle && !hashDeEmail.has(cid + ':' + email)) { hashDeEmail.set(cid + ':' + email, ''); hashAtribuicao(cid, email).then(x => { hashDeEmail.set(cid + ':' + email, x); renderAdmin(); }); }
  const hm = hashDeEmail.get(cid + ':' + email) || '';
  return casas.filter(c => c.uid === m.id || (hm && hashesDaCasa(c).includes(hm)) || (email && rotulosAtribuicao(atribuicoes[c.id]).concat(((atribuicoes[c.id] || {}).moradores || []).map(p => p.email || '')).some(x => String(x).toLowerCase() === email)));
}
// Busca nas listas de membros e de casas (sem acento, em qualquer parte do texto).
function filtrarAdmin() {
  [['#busca-membros', '#lista-membros'], ['#busca-casas', '#lista-casas']].forEach(([i, l]) => {
    const q = semAcento(($(i) || {}).value || '').trim(); let vistos = 0;
    $$(l + ' > li[data-busca]').forEach(li => { const ok = !q || q.split(/\s+/).every(t => li.dataset.busca.includes(t)); li.hidden = !ok; if (ok) vistos++; });
    const vazio = $(l + ' > .li-nada'); if (vazio) vazio.remove();
    if (q && !vistos) $(l).insertAdjacentHTML('afterbegin', '<li class="li-nada"><div class="info"><span>Nada encontrado com essa busca.</span></div></li>');
  });
}
function renderAdmin() {
  if (!ehAdmin() || !cid || !condo) return;
  $('#link-condo').textContent = linkCondo();
  $('#btn-zap-link').href = `https://wa.me/?text=${encodeURIComponent(`Mapa do Halloween de ${condo.nome}: ${linkCondo()}`)}`;
  const set = (sel, v) => { if (campoLivre(sel)) $(sel).value = v || ''; };
  set('#c-nome', condo.nome); set('#c-evento', evento.nome); set('#c-data', evento.data); set('#c-cidade', condo.cidade); set('#c-hi', evento.horaInicio); set('#c-hf', evento.horaFim); set('#c-avisos', evento.avisos); renderHoras();
  $('#titulo-evento').textContent = `Evento de ${ano}`;
  const prox = anoAtualDoCondo() + 1; const bn = $('#btn-novo-ano');
  $('#ano-status').textContent = ehAnoAtual() ? `O evento em andamento é o de ${ano}. Quando quiser preparar o próximo, comece o de ${prox}: as casas de ${ano} ficam guardadas.` : `Você está vendo ${ano}, que já passou. O evento em andamento é o de ${anoAtualDoCondo()}.`;
  bn.hidden = !ehAnoAtual(); if (!bn.dataset.confirma) bn.textContent = `Começar o Halloween de ${prox}`;
  if (campoLivre('#c-publico')) $('#c-publico').checked = !!condo.publico;
  if (campoLivre('#c-listado')) $('#c-listado').checked = condo.listado !== false;
  $('#codigo-condo').textContent = cid;
  $('#portaria-status').textContent = condo.portaria ? 'Portaria marcada no mapa.' : 'Portaria ainda não marcada. Ela vira o ponto de partida de quem está sem GPS.';
  const pend = membros.filter(m => m.papel === 'pendente'), ativos = membros.filter(m => m.papel !== 'pendente');
  $('#total-pendentes').textContent = pend.length; const bolha = $('#bolha-admin'); bolha.hidden = !pend.length; bolha.textContent = pend.length;
  if (!membrosCarregados) { $('#lista-pendentes').innerHTML = SKEL_LINHA; $('#lista-membros').innerHTML = SKEL_LINHA.repeat(2); }
  if (!convitesCarregados) $('#lista-convites').innerHTML = SKEL_LINHA;
  if (membrosCarregados) $('#lista-pendentes').innerHTML = pend.length ? pend.map(m => `<li><div class="info"><b>${h(m.nome || 'Sem nome')}</b><span>${h(m.email)}</span></div><div class="acoes"><button class="btn btn-p btn-sucesso" data-aprovar="${h(m.id)}">${IC.check} Aprovar</button><button class="btn btn-p btn-fantasma" data-recusar="${h(m.id)}">${IC.x} Recusar</button></div></li>`).join('') : '<li><div class="info"><span>Nenhum pedido agora.</span></div></li>';
  const agora = Date.now();
  const cs = convites.slice().sort((a, b) => b.criadoEm - a.criadoEm);
  if (convitesCarregados) $('#lista-convites').innerHTML = cs.length ? cs.map(c => { const vale = c.ativo && c.expiraEm > agora; const ate = new Date(c.expiraEm).toLocaleDateString('pt-BR');
    return `<li><div class="info"><b class="mono">${h(c.id)}</b><span>${vale ? `Válido até ${ate}` : c.ativo ? 'Expirado' : 'Desativado'}</span></div><div class="acoes">${vale ? `<button class="btn btn-p btn-fantasma" data-copiar-convite="${h(c.id)}">${IC.copiar} Copiar</button><a class="btn btn-p btn-sucesso" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(`Convite para o mapa do Halloween de ${condo.nome} (só para moradores, não repasse): ${linkConvite(c.id)}`)}">WhatsApp</a><button class="btn btn-p btn-fantasma" data-desativar="${h(c.id)}">Desativar</button>` : `<button class="btn btn-p btn-fantasma" data-apagar-convite="${h(c.id)}">${IC.lixo} Apagar</button>`}</div></li>`; }).join('') : '<li><div class="info"><span>Nenhum convite ainda.</span></div></li>';
  $('#total-membros').textContent = ativos.length;
  const quando = ts => ts ? new Date(ts).toLocaleString('pt-BR', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'}).replace(', ', ' às ') : '';
  if (membrosCarregados) $('#lista-membros').innerHTML = ativos.length ? ativos.sort((a, b) => (a.papel === 'admin' ? 0 : 1) - (b.papel === 'admin' ? 0 : 1) || (a.nome || '').localeCompare(b.nome || '')).map(m => { const sou = usuario && m.id === usuario.uid;
    const prot = protegidos.get(m.id), trava = prot && !donoPlataforma;   // as regras do servidor também barram
    const suas = casasDoMembro(m);
    const busca = [m.nome, m.email, ...suas.map(c => `${c.rua} ${c.numero} ${c.familia || ''}`)].join(' ');
    const editar = suas.map(c => `<button class="btn btn-p btn-fantasma btn-linha" data-editar="${h(c.id)}">${IC.editar} Editar casa${suas.length > 1 ? ' ' + h(c.numero) : ''}</button>`).join('');
    const papel = sou || trava ? '' : `<button class="btn btn-p btn-fantasma" data-papel="${h(m.id)}" data-novo="${m.papel === 'admin' ? 'morador' : 'admin'}">${m.papel === 'admin' ? 'Tirar admin' : 'Tornar admin'}</button><button class="btn btn-p btn-fantasma" data-remover="${h(m.id)}">${IC.lixo} Remover</button>`;
    return `<li data-busca="${h(semAcento(busca))}"><div class="info"><b>${h(m.nome || 'Sem nome')}${sou ? ' (você)' : ''}</b><span>${h(m.email)} · ${m.papel === 'admin' ? 'Admin' : 'Morador'}${prot ? ` · <span class="etq-protegido">${prot}</span>` : ''}</span>${suas.length ? `<span class="quando-casa">${IC.casa} ${suas.map(c => nomeCasa(c)).join(' · ')}</span>` : ''}${m.criadoEm ? `<span class="quando-casa">${IC.relogio} Entrou em ${h(quando(+m.criadoEm))}</span>` : ''}</div>${editar || papel ? `<div class="acoes">${editar}${papel}</div>` : ''}</li>`; }).join('') : '<li><div class="info"><span>Ninguém ainda.</span></div></li>';
  $('#total-casas').textContent = casas.length;
  const dono = uid => { const m = membros.find(x => x.id === uid); return m ? m.nome || m.email : ''; };
  const porEndereco = (a, b) => (a.rua || '').localeCompare(b.rua || '') || String(a.numero).localeCompare(String(b.numero), 'pt', {numeric: true});
  const ordem = ls.get('hw.ordemCasas', 'novas'); $('#ordem-casas').value = ordem;
  $('#lista-casas').innerHTML = (casas.length ? casas.slice().sort(ordem === 'endereco' ? porEndereco : (a, b) => (+b.criadoEm || 0) - (+a.criadoEm || 0) || porEndereco(a, b)).map(c => `<li data-busca="${h(semAcento([c.rua, c.numero, c.familia, dono(c.uid), ...rotulosAtribuicao(atribuicoes[c.id])].join(' ')))}"><div class="info"><b>${nomeCasa(c)}${c.familia ? ' · ' + h(c.familia) : ''}</b><span>${h([dono(c.uid) || 'Cadastrada por admin', ...(rotulosAtribuicao(atribuicoes[c.id]).length ? [`+ ${rotulosAtribuicao(atribuicoes[c.id]).join(', ')}`] : [])].join(' '))}</span>${c.criadoEm ? `<span class="quando-casa">${IC.relogio} Cadastrada em ${h(quando(+c.criadoEm))}</span>` : ''}</div><div class="acoes"><button class="btn btn-p btn-fantasma" data-editar="${h(c.id)}">${IC.editar} Editar</button><button class="btn btn-p btn-fantasma" data-excluir="${h(c.id)}">${IC.lixo} Excluir</button></div></li>`).join('') : '<li><div class="info"><span>Nenhuma casa ainda.</span></div></li>')
    + `<li class="li-acao"><button class="btn btn-p btn-primario" id="btn-casa-outra">${IC.casa} Cadastrar casa de outra família</button></li>`;
  filtrarAdmin();
}
async function conferirEnderecos() {
  const alvo = $('#conferencia'); const btn = $('#btn-conferir'); const lista = casas.filter(c => c.rua && c.numero && typeof c.lat === 'number');
  if (!lista.length) { alvo.innerHTML = '<p class="dica">Nenhuma casa com rua e número para conferir.</p>'; return; }
  btn.disabled = true; const problemas = [];
  for (let i = 0; i < lista.length; i++) {
    const c = lista[i]; alvo.innerHTML = `<p class="res-carregando">${SPIN} Conferindo ${i + 1} de ${lista.length}: ${nomeCasa(c)}…</p>`;
    let g = null; try { g = await geocodificar(c.rua, c.numero); } catch {}
    if (g) { const d = distanciaAoEndereco(g, c); if (d > limiteEndereco(g)) problemas.push({c, g, d}); }
  }
  btn.disabled = false;
  // casas empilhadas no mesmo ponto (aparecem lado a lado no mapa, mas a posição de pelo menos uma está errada)
  const empilhadas = []; lista.forEach((c, i) => lista.slice(i + 1).forEach(o => { if (distM(c, o) <= 6) empilhadas.push([c, o]); }));
  const htmlEmp = empilhadas.length ? `<p class="erro-msg">${empilhadas.length === 1 ? 'Duas casas estão' : `${empilhadas.length} pares de casas estão`} no mesmo lugar do mapa:</p><ul class="lista-casas">${empilhadas.map(([a, b]) => `<li><div class="info"><b>${nomeCasa(a)} e ${nomeCasa(b)}</b><span>Mesmo ponto no mapa. Ajuste a abóbora de cada uma no telhado certo.</span></div><div class="acoes"><button class="btn btn-p btn-fantasma" data-editar="${h(a.id)}">${IC.editar} ${h(a.numero)}</button><button class="btn btn-p btn-fantasma" data-editar="${h(b.id)}">${IC.editar} ${h(b.numero)}</button></div></li>`).join('')}</ul>` : '';
  alvo.innerHTML = htmlEmp + (problemas.length ? `<p class="erro-msg">${problemas.length} casa${problemas.length > 1 ? 's estão' : ' está'} longe do endereço:</p><ul class="lista-casas">${problemas.map(({c, g, d}) => `<li><div class="info"><b>${nomeCasa(c)}${c.familia ? ' · ' + h(c.familia) : ''}</b><span>Abóbora a ${fmtM(d)} ${g.exato ? 'do endereço' : `da ${h(c.rua)}`}${g.exato ? '' : ' (o mapa só conhece a rua, não o número)'}</span></div><div class="acoes"><button class="btn btn-p btn-primario" data-corrigir="${h(c.id)}" data-lat="${g.lat}" data-lng="${g.lng}">Usar o endereço</button><button class="btn btn-p btn-fantasma" data-editar="${h(c.id)}">${IC.editar} Ajustar</button></div></li>`).join('')}</ul>`
    : empilhadas.length ? '' : '<p class="ok-msg">Tudo certo: todas as casas estão perto do endereço cadastrado.</p>');
}
function mostrarInicio() {
  if (caminhando) sairCaminhada(true, true);
  contarTela('inicio'); setTimeout(renderSino, 0);
  $('#painel-inicio').hidden = false; ['mapa', 'participar', 'organizador'].forEach(a => { $('#painel-' + a).hidden = true; });
  $('#abas').hidden = true; $('#linha-condo').hidden = true; $('#placar').innerHTML = ''; abaAtual = 'inicio';
  renderCabecalho(); renderInicio(); window.scrollTo({top: 0});
}
function mostrarCondo() { $('#painel-inicio').hidden = true; $('#abas').hidden = false; renderTudoCondo(); renderGpsCartao(); renderSino(); irAba(ls.get('hw.aba', 'mapa') === 'organizador' ? 'mapa' : ls.get('hw.aba', 'mapa')); }
let listaCondosCarregada = false;
function cartaoCondo(id, nome, extra = '') {
  if (!CODIGO.test(id)) return `<li><div class="resultado"><span class="res-ic">${IC.casa}</span><span class="res-txt"><b>${h(nome)}</b><span>código antigo ${h(id)}: não abre na versão nova</span></span><button class="btn btn-p btn-primario" data-migrar="${h(id)}">Atualizar código</button></div></li>`;
  return `<li><a class="resultado" href="#${h(id)}"><span class="res-ic">${IC.casa}</span><span class="res-txt"><b>${h(nome)}</b><span>${extra ? h(extra) + ' · ' : ''}código ${h(id)}</span></span><span class="res-seta" aria-hidden="true">›</span></a></li>`; }
async function renderInicio() {
  if (cid) return;
  $('#inicio-abobora').innerHTML = PUMPKIN_BIG;
  $('#aviso-recaptcha').hidden = !CONFIG.appCheckSiteKey;
  const meus = await carregarMeusEventos();
  const rec = ls.get('hw.recentes', []).filter(r => CODIGO.test(r.cid) && !meus.some(m => m.cid === r.cid));
  $('#card-recentes').hidden = !rec.length;
  $('#lista-recentes').innerHTML = rec.map(r => cartaoCondo(r.cid, r.nome)).join('');
  $('#card-plataforma').hidden = !donoPlataforma;
  if (donoPlataforma && !listaCondosCarregada) {
    listaCondosCarregada = true;
    $('#lista-condos').innerHTML = skelLista(3);
    try { const s = await carga(fb.fs.getDocs(fb.condos())); $('#lista-condos').innerHTML = s.docs.length ? s.docs.map(d => cartaoCondo(d.id, d.data().nome, [d.data().cidade, d.data().publico ? 'público' : 'fechado'].filter(Boolean).join(' · '))).join('') : '<li class="res-info">Nenhum condomínio ainda.</li>'; }
    catch (e) { console.error(e); listaCondosCarregada = false; $('#lista-condos').innerHTML = '<li class="res-info">Não consegui carregar a lista.</li>'; }
  }
}
let meusSeq = 0;
async function carregarMeusEventos() {
  const card = $('#card-meus'), lista = $('#lista-meus'); const seq = ++meusSeq;
  if (!usuario || !fb.pronto) { card.hidden = true; return []; }
  try {
    if (card.hidden || !lista.children.length) { card.hidden = false; lista.innerHTML = skelLista(2); }
    const s = await carga(fb.fs.getDocs(fb.fs.query(fb.fs.collectionGroup(fb.db, 'membros'), fb.fs.where('uid', '==', usuario.uid), fb.fs.limit(30))));
    const itens = await Promise.all(s.docs.map(async d => {
      const id = d.ref.parent.parent.id; let nome = id, cidade = '';
      try { const c = await fb.fs.getDoc(fb.condo(id)); if (!c.exists()) return null; nome = c.data().nome; cidade = c.data().cidade || ''; } catch { return null; }
      return {cid: id, nome, cidade, papel: d.data().papel};
    }));
    if (seq !== meusSeq) return [];
    const meus = itens.filter(Boolean);
    const rotulo = {admin: 'você é admin', morador: 'você é morador', pendente: 'esperando aprovação'};
    lista.innerHTML = meus.map(m => cartaoCondo(m.cid, m.nome, [m.cidade, rotulo[m.papel]].filter(Boolean).join(' · '))).join('');
    card.hidden = !meus.length; return meus;
  } catch (e) { console.error(e); card.hidden = true; return []; }
}

/* ---------- dono: atualizar condomínio do formato antigo para o código novo ---------- */
async function migrarCondo(antigo) {
  if (!donoPlataforma) return;
  const ok = await salvarSeguro(async () => {
    const snap = await fb.fs.getDoc(fb.condo(antigo)); if (!snap.exists()) throw new Error('não existe');
    const d = snap.data();
    let novo = null;
    for (let i = 0; i < 6 && !novo; i++) { const v = crypto.getRandomValues(new Uint8Array(5)); const c = [...v].map(x => ALFABETO_CODIGO[x % 32]).join(''); const ex = await fb.fs.getDoc(fb.condo(c)); if (!ex.exists()) novo = c; }
    if (!novo) throw new Error('sem código');
    const [membrosS, casasS, convitesS] = await Promise.all([fb.fs.getDocs(fb.membros(antigo)), fb.fs.getDocs(fb.casasAntigas(antigo)), fb.fs.getDocs(fb.convites(antigo))]);
    const agora = Date.now(); const s = (v, n) => String(v ?? '').slice(0, n);
    const hora = v => /^[0-2]\d:[0-5]\d$/.test(v || '') ? v : '';
    const centro = d.centro && typeof d.centro.lat === 'number' ? {lat: d.centro.lat, lng: d.centro.lng} : {lat: CONFIG.centro[0], lng: CONFIG.centro[1]};
    const portaria = d.portaria && typeof d.portaria.lat === 'number' ? {lat: d.portaria.lat, lng: d.portaria.lng} : null;
    const nome = s(d.nome || antigo, 80), cidade = s(d.cidade, 60), publico = !!d.publico;
    const b = fb.fs.writeBatch(fb.db);
    b.set(fb.condo(novo), {nome, cidade, portaria, centro, zoom: Math.max(3, Math.min(20, Math.round(d.zoom || 17))), publico, listado: true, eventoAtual: ANO_HOJE, criadoPor: usuario.uid, criadoEm: d.criadoEm || agora, atualizadoEm: agora});
    b.set(fb.evento(novo, ANO_HOJE), {nome: s(d.eventoNome || `Halloween ${ANO_HOJE}`, 80), data: s(d.data || `${ANO_HOJE}-10-31`, 10), horaInicio: hora(d.horaInicio), horaFim: hora(d.horaFim), avisos: s(d.avisos, 160), criadoEm: agora, atualizadoEm: agora});
    b.set(fb.busca(novo), {nome, cidade, prefixos: prefixosBusca(nome, cidade), publico, atualizadoEm: agora});
    membrosS.docs.forEach(m => { const x = m.data(); b.set(fb.membro(novo, m.id), {uid: m.id, papel: ['admin', 'morador', 'pendente'].includes(x.papel) ? x.papel : 'pendente', nome: s(x.nome, 80), email: s(x.email, 160), convite: s(x.convite, 40), criadoEm: x.criadoEm || agora, atualizadoEm: agora}); });
    if (!membrosS.docs.some(m => m.id === usuario.uid)) b.set(fb.membro(novo, usuario.uid), {uid: usuario.uid, papel: 'admin', nome: usuario.nome.slice(0, 80), email: usuario.emailToken.slice(0, 160), convite: '', criadoEm: agora, atualizadoEm: agora});
    casasS.docs.forEach(c => b.set(fb.casaAno(novo, ANO_HOJE, c.id), limparCasa({...c.data(), donoHash: '', uid: c.data().uid || usuario.uid})));
    convitesS.docs.forEach(c => { const x = c.data(); if (/^[A-Za-z0-9]{8,40}$/.test(c.id)) b.set(fb.convite(novo, c.id), {papel: 'morador', ativo: !!x.ativo, expiraEm: +x.expiraEm || agora, criadoPor: s(x.criadoPor || usuario.uid, 128), criadoEm: +x.criadoEm || agora}); });
    await b.commit();
    const apagar = fb.fs.writeBatch(fb.db);
    [...membrosS.docs, ...casasS.docs, ...convitesS.docs].forEach(x => apagar.delete(x.ref)); apagar.delete(fb.condo(antigo));
    await apagar.commit();
    ls.set('hw.recentes', ls.get('hw.recentes', []).filter(r => r.cid !== antigo));
    migrado = novo;
  }, 'Código atualizado!');
  if (ok && migrado) { listaCondosCarregada = false; const n = migrado; migrado = null; location.hash = n; }
}
let migrado = null;

let buscaTimer = null, buscaSeq = 0;
async function buscarCondos(txt) {
  const el = $('#resultados'); const palavras = semAcento(txt).split(/[^a-z0-9]+/).filter(w => w.length >= 2);
  if (!palavras.length) { el.innerHTML = ''; return; }
  const termo = palavras.reduce((a, b) => b.length > a.length ? b : a).slice(0, 15); const seq = ++buscaSeq;
  el.innerHTML = `<li class="res-info res-carregando">${SPIN} Procurando nas sombras…</li>` + SKEL_ITEM.repeat(2);
  const lento = setTimeout(() => { if (seq === buscaSeq) el.innerHTML = '<li class="res-info">Está demorando… Confira a internet. Se tiver o código, use o campo abaixo.</li>'; }, 8000);
  try {
    const s = await carga(fb.fs.getDocs(fb.fs.query(fb.buscas(), fb.fs.where('prefixos', 'array-contains', termo), fb.fs.limit(20))));
    if (seq !== buscaSeq) return;
    const achados = s.docs.map(d => ({id: d.id, ...d.data()})).filter(d => palavras.every(w => (d.prefixos || []).some(p => p === w.slice(0, 15) || p.startsWith(w.slice(0, 15)))));
    el.innerHTML = achados.length ? achados.slice(0, 10).map(d => cartaoCondo(d.id, d.nome, d.cidade)).join('')
      : `<li class="res-info">Não achei nenhum condomínio com "${h(txt)}". Confira o nome ou peça o código ao organizador.</li>`;
    if (achados.length) SFX.plim();
  } catch (e) { console.error(e); if (seq === buscaSeq) el.innerHTML = '<li class="res-info">A busca não respondeu. Tente de novo.</li>'; }
  finally { clearTimeout(lento); }
}

/* ---------- criar condomínio (self-service) ---------- */
function abrirCriarCondo() {
  const corpo = !usuario
    ? `<p>Para criar o condomínio do seu evento, entre com sua conta Google. Você vira o admin dele.</p><div class="acoes"><button class="btn btn-google btn-grande" data-acao-acesso="entrar">${IC.google} Entrar com Google</button></div>`
    : `<form id="form-criar" novalidate>
        <div class="campo"><label for="n-nome">Nome do condomínio</label><input type="text" id="n-nome" maxlength="80" placeholder="Condomínio Vale Verde" autocomplete="off"></div>
        <div class="campo"><label for="n-cidade">Cidade</label><input type="text" id="n-cidade" maxlength="60" placeholder="São Paulo" autocomplete="off"></div>
        <p class="dica">O condomínio começa fechado: só moradores convidados ou aprovados veem as casas. Cada conta cria um condomínio.</p>
        <p class="erro-msg" id="criar-erro" hidden></p>
        <div class="acoes"><button class="btn btn-primario btn-grande" type="submit">Criar condomínio</button></div>
      </form>`;
  $('#folha-in').innerHTML = `<div class="boas-vindas" data-criar><h3>Organizar um condomínio</h3>${corpo}</div>`;
  $('#folha').hidden = false;
}
async function criarCondo(nome, cidade) {
  const err = $('#criar-erro'); const falha = m => { if (err) { err.textContent = m; err.hidden = false; } SFX.boo(); };
  if (!usuario) { fb.entrar(); return; }
  if (!nome) return falha('Dê um nome ao condomínio.');
  if (!donoPlataforma) {
    try { const c = await fb.fs.getDoc(fb.criador(usuario.uid)); if (c.exists()) { const id = c.data().cid; return falha(`Você já criou um condomínio (código ${id}). Abra ele pela busca ou pelo código.`); } } catch (e) { console.error(e); }
  }
  let cod = null;
  for (let i = 0; i < 6 && !cod; i++) { const v = crypto.getRandomValues(new Uint8Array(5)); const c = [...v].map(x => ALFABETO_CODIGO[x % 32]).join(''); try { const ex = await fb.fs.getDoc(fb.condo(c)); if (!ex.exists()) cod = c; } catch (e) { console.error(e); } }
  if (!cod) return falha('Não consegui gerar um código agora. Tente de novo.');
  const centro = posicao ? {lat: +posicao.lat.toFixed(6), lng: +posicao.lng.toFixed(6)} : {lat: CONFIG.centro[0], lng: CONFIG.centro[1]};
  const ok = await salvarSeguro(() => {
    const b = fb.fs.writeBatch(fb.db); const agora = Date.now();
    b.set(fb.condo(cod), {nome, cidade, portaria: null, centro, zoom: Math.round(CONFIG.zoom || 17), publico: false, listado: true, eventoAtual: ANO_HOJE, criadoPor: usuario.uid, criadoEm: agora, atualizadoEm: agora});
    b.set(fb.evento(cod, ANO_HOJE), {nome: `Halloween ${ANO_HOJE}`, data: `${ANO_HOJE}-10-31`, horaInicio: CONFIG.evento.horaInicio || '', horaFim: CONFIG.evento.horaFim || '', avisos: '', criadoEm: agora, atualizadoEm: agora});
    if (!donoPlataforma) b.set(fb.criador(usuario.uid), {cid: cod, criadoEm: agora});
    b.set(fb.membro(cod, usuario.uid), {uid: usuario.uid, papel: 'admin', nome: usuario.nome.slice(0, 80), email: usuario.emailToken.slice(0, 160), convite: '', criadoEm: agora, atualizadoEm: agora});
    b.set(fb.busca(cod), {nome, cidade, prefixos: prefixosBusca(nome, cidade), publico: false, atualizadoEm: agora});
    return b.commit();
  }, 'Condomínio criado!');
  if (!ok) return;
  listaCondosCarregada = false; SFX.festa(); evento_('condominio_criado');
  $('#folha-in').innerHTML = `<div class="boas-vindas">${PUMPKIN_BIG}<h3>${h(nome)} está no mapa!</h3><p>Este é o código do seu condomínio:</p><div class="codigo-grande">${cod}</div>
    <p class="dica">Ajuste o início do mapa e gere convites na aba Admin.</p><div class="acoes"><a class="btn btn-primario btn-grande" href="#${cod}" data-fechar-folha>Abrir meu condomínio</a></div></div>`;
  ls.set('hw.aba', 'organizador');
}
function renderTudoCondo() {
  if (!cid) return;
  renderCabecalho(); renderPlacar(); renderContagem(); renderEsgotou(); renderAcesso(); renderPins(); renderRoteiro(); atualizarParticipar();
  $('#aba-organizador').hidden = !ehAdmin();
  if (abaAtual === 'organizador') renderAdmin();
}
// Tocar em "Participar" sempre leva à SUA casa; editar a casa de outra família só acontece pelos botões "Editar".
function voltarParaMinhaCasa() {
  const c = editandoId && casaPorId(editandoId);
  const minhaEd = editandoId && usuario && (editandoId === usuario.uid || (c && souResponsavel(c)));
  if (criandoOutra || (editandoId && !minhaEd)) { criandoOutra = false; limparForm(); jaAbriuMinhaCasa = false; }
}
function irAba(nome) {
  if (!cid) return;
  if (nome === 'organizador' && !ehAdmin()) nome = 'mapa';
  if (caminhando && nome !== 'mapa' && nome !== 'roteiro') sairCaminhada();
  // O roteiro mora embaixo do mapa: "ir ao roteiro" abre o mapa e rola até ele.
  const rolarRoteiro = nome === 'roteiro'; if (rolarRoteiro) nome = 'mapa';
  abaAtual = nome; ls.set('hw.aba', nome); contarTela(nome === 'organizador' ? 'admin' : nome);
  if (rolarRoteiro) setTimeout(() => $(roteiro ? '#guia' : '#card-partida').scrollIntoView({behavior: reduzMovimento ? 'auto' : 'smooth', block: 'start'}), 120);
  ['mapa', 'participar', 'organizador'].forEach(a => { const p = $('#painel-' + a); p.hidden = a !== nome; if (a === nome) { p.style.animation = 'none'; void p.offsetWidth; p.style.animation = ''; } $('#aba-' + a).setAttribute('aria-current', a === nome ? 'page' : 'false'); });
  if (nome === 'mapa') { setTimeout(() => { if (mapa) { mapa.invalidateSize(); caberPinos(); } }, 50); renderPins(); }
  renderContagem();
  if (nome === 'mapa') renderRoteiro(); if (nome === 'organizador') renderAdmin(); if (nome === 'participar') { atualizarParticipar(); setTimeout(() => { iniciarMapaCasa(); atualizarMapaCasa(); }, 80); }
  if (!rolarRoteiro) window.scrollTo({top: 0, behavior: 'auto'});
}
function abrirCompartilhar() {
  if (!cid || !condo) return;
  const link = linkCondo(); const texto = `Mapa do Halloween de ${condo.nome}! Veja as casas que dão doces e cadastre a sua: ${link}`;
  const fechado = !condo.publico;
  $('#folha-in').innerHTML = `<div class="boas-vindas">${PUMPKIN_BIG}<h3>Chame os vizinhos!</h3>
    <p>Mande o link no grupo do condomínio. O código é:</p><div class="codigo-grande">${h(cid)}</div><div class="codigo-link">${h(link)}</div>
    <div class="acoes">${navigator.share ? `<button class="btn btn-primario btn-grande" data-comp="nativo">Compartilhar</button>` : ''}
      <a class="btn btn-sucesso" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(texto)}">Enviar no WhatsApp</a>
      <button class="btn btn-fantasma" data-comp="copiar">Copiar link</button></div>
    <p class="dica">${fechado ? 'O mapa deste condomínio é fechado: quem abrir o link pede para entrar e um admin aprova.' : 'Quem abrir o link já vê o mapa e pode pedir para cadastrar a casa.'}${ehAdmin() ? ' Para alguém entrar sem precisar de aprovação, gere um convite na aba Admin.' : ''}</p></div>`;
  $('#folha-in').dataset.textoComp = texto; $('#folha-in').dataset.linkComp = link;
  $('#folha').hidden = false; SFX.plim();
}
async function copiar(txt) { try { await navigator.clipboard.writeText(txt); toast('Copiado!'); SFX.plim(); } catch { toast(txt, 6000); } }

/* ---------- toque no mapa ---------- */
async function toqueMapa(ll) {
  if (!modo) return; const p = {lat: +ll.lat.toFixed(6), lng: +ll.lng.toFixed(6)}; SFX.plop();
  if (modo === 'casa') { pinCasa = p; modo = null; renderModo(); renderPins(); atualizarForm(); irAba('participar'); toast('Casa marcada! Agora é só salvar.'); return; }
  if (modo === 'portaria') { modo = null; renderModo(); await salvarSeguro(() => salvarCondo({portaria: p}), 'Portaria marcada!'); irAba('organizador'); }
}

/* ---------- eventos ---------- */
function ligarEventos() {
  document.addEventListener('pointerdown', e => {
    ctxAudio();
    const b = e.target.closest('.btn, .aba, .chip, .opcao');
    if (b) { somDoBotao(b); if (!reduzMovimento && b.classList.contains('btn')) { b.classList.remove('tremendo'); void b.offsetWidth; b.classList.add('tremendo'); } return; }
    if (e.target.closest('.dracula')) { tocarCenario(e.clientX, e.clientY, e.target); return; }
    if (e.target.closest('input, textarea, select, label, a, .leaflet-container, .folha-in')) return;
    tocarCenario(e.clientX, e.clientY, e.target);
  }, {passive: true});
  document.addEventListener('click', e => { const nav = e.target.closest('a[href*="google.com/maps"], a[href*="maps.apple.com"], a[href*="waze.com"]'); if (nav) evento_('navegar', {app: nav.href.includes('google') ? 'google' : nav.href.includes('apple') ? 'apple' : 'waze'}); });
  document.addEventListener('click', e => { const b = e.target.closest('.btn-primario, .btn-sucesso'); if (b && !b.disabled) { const r = b.getBoundingClientRect(); explodir(e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2); } });
  window.addEventListener('hashchange', aplicarRota);

  $('#btn-musica').addEventListener('click', () => alternarMusica());
  $('#btn-avisos').addEventListener('click', abrirAvisos);
  document.addEventListener('click', async e => {
    const ir = e.target.closest('[data-aviso-ir]'); if (ir) { fecharFolha(); if (ir.dataset.avisoIr === 'participar') voltarParaMinhaCasa(); irAba(ir.dataset.avisoIr); return; }
    if (e.target.closest('[data-aviso-sistema]')) { try { const r = await Notification.requestPermission(); toast(r === 'granted' ? 'Pronto! O celular também vai avisar.' : 'Tudo bem, os avisos ficam só no sininho.'); if (r === 'granted') abrirAvisos(); } catch { toast('Este navegador não deixa avisar fora do app.'); } }
  });
  $('#btn-conta').addEventListener('click', async () => {
    if (!usuario) { fb.entrar(); return; }
    const b = $('#btn-conta');
    if (b.dataset.confirma) { editandoId = null; criandoOutra = false; jaAbriuMinhaCasa = false; limparForm(); await fb.sair(); toast('Você saiu. Até a próxima assombração!'); return; }
    b.dataset.confirma = '1'; b.innerHTML = '<span>Sair?</span>'; setTimeout(() => { if (b.dataset.confirma) renderConta(); }, 3500);
  });
  $('#btn-condo').addEventListener('click', () => { location.hash = 'inicio'; });
  $('#sel-ano').addEventListener('change', e => { const a = +e.target.value; anoEscolhido = a === anoAtualDoCondo() ? null : a; trocarAno(a); toast(a === anoAtualDoCondo() ? `Halloween de ${a}` : `Vendo o Halloween de ${a}, que já passou.`); });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-acao-acesso]'); if (!b) return; const a = b.dataset.acaoAcesso;
    if (a === 'entrar') fb.entrar(); if (a === 'pedir') pedirAcesso(); if (a === 'cancelar') sairDoCondo(); if (a === 'inicio') location.hash = 'inicio';
  });
  montarSeletoresHora();
  $$('.aba').forEach(b => b.addEventListener('click', () => { if (b.dataset.aba === 'participar') voltarParaMinhaCasa(); irAba(b.dataset.aba); }));
  $('#filtros').addEventListener('click', e => { const c = e.target.closest('.chip'); if (!c) return; filtros[c.dataset.filtro] = !filtros[c.dataset.filtro]; ls.set('hw.filtros', filtros); renderFiltros(); renderPins(); });
  $('#aviso-cancelar').addEventListener('click', () => { modo = null; renderModo(); if (modoVoltar !== 'mapa') irAba(modoVoltar); modoVoltar = 'mapa'; });
  $('#btn-centrar').addEventListener('click', () => { if (caminhando && !modoSeguir) { recentrarCaminhada(); return; } modoSeguir = !modoSeguir; $('#btn-centrar').setAttribute('aria-pressed', String(modoSeguir)); ligarGPS(true); renderRecentrar(); if (modoSeguir) toast('Seguindo você no mapa.'); });
  mapa.on('dragstart', () => { ajustouPinos = true; modoSeguir = false; $('#btn-centrar').setAttribute('aria-pressed', 'false'); renderRecentrar(); });
  // modo caminhada
  $('#btn-caminhar').addEventListener('click', () => entrarCaminhada());
  $('#cam-cheguei').addEventListener('click', cheguei);
  $('#cam-pular').addEventListener('click', pularParada);
  $('#cam-ouvir').addEventListener('click', () => { const i = proximaParada(); if (i >= 0) falar(falaParada(i)); });
  $('#cam-sair').addEventListener('click', () => sairCaminhada());
  $('#cam-fim-sair').addEventListener('click', () => sairCaminhada());
  $('#cam-recentrar').addEventListener('click', recentrarCaminhada);
  addEventListener('resize', () => { if (!caminhando) return; mapa.invalidateSize(); medirCaminhada(); });
  $('#btn-ver-todas').addEventListener('click', verTodas);
  document.addEventListener('click', e => { if (e.target.closest('[data-ligar-gps]')) { gpsErro = null; if (gpsWatch != null) { try { navigator.geolocation.clearWatch(gpsWatch); } catch {} gpsWatch = null; } ligarGPS(true); } });
  $('#btn-refazer').addEventListener('click', () => { roteiroAberto = true; $('#card-partida').hidden = false; $('#acoes-refazer').hidden = true; $('#card-partida').scrollIntoView({behavior: reduzMovimento ? 'auto' : 'smooth', block: 'start'}); });
  $('#btn-ir-participar').addEventListener('click', () => { voltarParaMinhaCasa(); irAba('participar'); });
  $('#btn-compartilhar').addEventListener('click', abrirCompartilhar);
  $('#lista-casas-mapa').addEventListener('click', e => {
    const b = e.target.closest('[data-ver-casa]'); if (!b) return; const c = casaPorId(b.dataset.verCasa); if (!c) return;
    mapa.setView([c.lat, c.lng], Math.max(mapa.getZoom(), 18)); abrirFolha(c.id);
  });
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-comp]'); if (!b) return; const f = $('#folha-in');
    if (b.dataset.comp === 'copiar') copiar(f.dataset.linkComp);
    if (b.dataset.comp === 'nativo') { try { await navigator.share({title: `Rota Assombrada: ${condo.nome}`, text: f.dataset.textoComp.replace(f.dataset.linkComp, '').trim(), url: f.dataset.linkComp}); } catch (err) { if (err && err.name !== 'AbortError') copiar(f.dataset.linkComp); } }
  });
  $('#mapa-vazio').addEventListener('click', e => { const b = e.target.closest('[data-ir]'); if (b) irAba(b.dataset.ir); });
  $('#folha').addEventListener('click', e => { if (e.target === e.currentTarget) fecharFolha(); const b = e.target.closest('[data-acao]'); if (!b) return; const id = b.dataset.id; const a = b.dataset.acao;
    if (a === 'visitar') { const v = !visitadas.has(id); marcarVisitada(id, v); if (v) SFX.sucesso(); fecharFolha(); if (v && roteiro && vozAuto && roteiro.ordem.includes(id)) { const p = proximaParada(); if (p >= 0) falar('Boa! ' + falaParada(p)); } }
    if (a === 'ouvir') { const c = casaPorId(id); if (!c) return; const i = roteiro ? roteiro.ordem.indexOf(id) : -1; falar(i >= 0 ? falaParada(i) : `${nomeCasaFala(c)}${c.familia ? ', ' + c.familia : ''}. ${posicao ? 'Fica a uns ' + falaM(distM(posicao, c)) + ', ' + direcaoFala(posicao, c) + '. ' : ''}${(c.oferece || []).length ? 'Oferece ' + listaFala((c.oferece || []).map(k => rotuloDe(OFERECE, k).toLowerCase())) + '.' : ''} ${c.obs || ''}`); }
    if (a === 'esgotou') { const c = casaPorId(id); if (c) alternarEsgotado(c).then(() => abrirFolha(id)); return; }
    if (a === 'editar') { const c = casaPorId(id); fecharFolha(); editandoId = id; criandoOutra = false; preencherForm(c); irAba('participar'); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { fecharFolha(); if (modo) { modo = null; renderModo(); } } });

  // início
  $('#i-busca').addEventListener('input', e => { clearTimeout(buscaTimer); const v = e.target.value; buscaTimer = setTimeout(() => buscarCondos(v), 350); });
  $('#i-busca').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); clearTimeout(buscaTimer); buscarCondos(e.target.value); } });
  $('#form-ir-condo').addEventListener('submit', e => {
    e.preventDefault(); const raw = $('#i-codigo').value.trim(); const m = raw.match(/#([A-Za-z0-9]{5})(?:\/convite\/([A-Za-z0-9]{8,40}))?/);
    const cod = normalizarCodigo(m ? m[1] : raw); const err = $('#inicio-erro');
    if (!CODIGO.test(cod)) { err.textContent = 'O código tem 5 letras e números, como K7QPX.'; err.hidden = false; SFX.boo(); return; }
    err.hidden = true; location.hash = m && m[2] ? `${cod}/convite/${m[2]}` : cod;
  });
  $('#i-codigo').addEventListener('input', e => { const v = normalizarCodigo(e.target.value); if (v.length <= 5) e.target.value = v; });
  $('#btn-sou-org').addEventListener('click', abrirCriarCondo);
  document.addEventListener('click', e => { const b = e.target.closest('[data-migrar]'); if (b) { b.disabled = true; b.textContent = 'Atualizando…'; migrarCondo(b.dataset.migrar).finally(() => { b.disabled = false; b.textContent = 'Atualizar código'; }); } });
  document.addEventListener('submit', e => { if (e.target.id !== 'form-criar') return; e.preventDefault(); criarCondo($('#n-nome').value.trim().slice(0, 80), $('#n-cidade').value.trim().slice(0, 60)); });
  document.addEventListener('click', e => { if (e.target.closest('[data-fechar-folha]')) fecharFolha(); });

  // roteiro
  $('#partida').addEventListener('click', e => { const b = e.target.closest('[data-partida]'); if (!b) return; partida = partidaEscolhida = b.dataset.partida; lsc.set('partida', partida); if (partida === 'gps') ligarGPS(false); renderPartida(); });
  $('#partida').addEventListener('change', e => { if (e.target.id === 'sel-casa' && e.target.value) { partida = partidaEscolhida = e.target.value; lsc.set('partida', partida); renderPartida(); } });
  $('#btn-montar').addEventListener('click', montarRoteiro);
  $('#btn-cheguei').addEventListener('click', cheguei);
  $('#btn-parar').addEventListener('click', () => {
    const b = $('#btn-parar');
    if (!b.dataset.confirma) { b.dataset.confirma = '1'; b.textContent = 'Toque de novo para parar'; b.classList.add('confirmar'); setTimeout(() => { delete b.dataset.confirma; b.textContent = 'Parar navegação'; b.classList.remove('confirmar'); }, 3500); return; }
    delete b.dataset.confirma; b.textContent = 'Parar navegação'; b.classList.remove('confirmar'); pararNavegacao();
  });
  $('#btn-pular').addEventListener('click', pularParada);
  ['#busca-membros', '#busca-casas'].forEach(i => $(i).addEventListener('input', filtrarAdmin));
  $('#ordem-casas').addEventListener('change', e => { ls.set('hw.ordemCasas', e.target.value); renderAdmin(); });
  $('#btn-falar').addEventListener('click', () => { const i = proximaParada(); if (i >= 0) falar(falaParada(i)); });
  $('#opt-voz').addEventListener('change', e => { vozAuto = e.target.checked; ls.set('hw.voz', vozAuto); if (vozAuto) falar('Guia por voz ligado. Vamos caçar doces!'); else { try { speechSynthesis.cancel(); } catch {} } });
  $('#opt-auto-chegada').addEventListener('change', e => { autoChegada = e.target.checked; ls.set('hw.autochegada', autoChegada); if (autoChegada) ligarGPS(false); });
  $('#lista-roteiro').addEventListener('click', e => { const v = e.target.closest('[data-visitar]'); if (v) { const id = v.dataset.visitar; const sim = !visitadas.has(id); marcarVisitada(id, sim); if (sim) SFX.sucesso(); return; } const ver = e.target.closest('[data-ver]'); if (ver) abrirFolha(ver.dataset.ver); });
  $('#btn-limpar-visitas').addEventListener('click', () => { visitadas = new Set(); lsa.set('visitadas', []); renderRoteiro(); renderPins(); renderPlacar(); toast('Casas visitadas zeradas.'); });

  // participar
  $('#form-casa').addEventListener('click', e => { const c = e.target.closest('.chip[data-multi]'); if (c) c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true')); });
  $('#btn-usar-gps').addEventListener('click', () => {
    if (!('geolocation' in navigator)) { toast('Sem GPS neste aparelho. Marque no mapa.'); return; }
    toast('Pegando sua posição…'); navigator.geolocation.getCurrentPosition(p => { definirPinCasa({lat: p.coords.latitude, lng: p.coords.longitude}, true); toast(`Posição marcada (precisão ${Math.round(p.coords.accuracy)} m). Se não estiver na porta de casa, arraste a abóbora.`, 4000); }, () => toast('Não consegui pegar o GPS. Toque no mapa onde fica a casa.'), {enableHighAccuracy: true, timeout: 15000, maximumAge: 0});
  });
  $('#btn-achar-endereco').addEventListener('click', () => acharPeloEndereco(false));
  let timerRua = null;
  $('#f-rua').addEventListener('input', () => { sugerirRuas(false); clearTimeout(timerRua); timerRua = setTimeout(() => sugerirRuas(true), 350); });
  $('#f-rua').addEventListener('focus', () => { if ($('#f-rua').value.trim().length >= 2) sugerirRuas(true); });
  $('#f-rua').addEventListener('blur', () => setTimeout(fecharSugestoesRua, 200));
  $('#f-rua').addEventListener('keydown', e => { if (e.key === 'Enter' && sugestoesRua.length) { e.preventDefault(); escolherRua(0); } if (e.key === 'Escape') fecharSugestoesRua(); });
  $('#sugestoes-rua').addEventListener('pointerdown', e => e.preventDefault());
  $('#sugestoes-rua').addEventListener('click', e => { const b = e.target.closest('[data-rua]'); if (b) escolherRua(+b.dataset.rua); });
  ['#f-rua', '#f-numero'].forEach(sel => $(sel).addEventListener('change', () => { if ($('#f-rua').value.trim() && $('#f-numero').value.trim()) acharPeloEndereco(true); if (marcadorCasa) marcadorCasa.setIcon(iconeCasaPin()); }));
  $('#btn-trava-mapa').addEventListener('click', () => { travarMapaCasa(!mapaCasaTravado); if (!mapaCasaTravado) $('#dica-mapa-casa').textContent = 'Mapa destravado: toque onde fica a casa ou arraste a abóbora. Depois toque em "Pronto, travar posição".'; });
  $('#btn-repetir').addEventListener('click', () => { if (!casaAnoPassado || !casaAnoPassado.dados) return; const {uid, criadoEm, atualizadoEm, ...dados} = casaAnoPassado.dados; preencherForm(dados); $('#repetir-casa').hidden = true; SFX.plim(); toast('Casa do ano passado copiada. Confira os horários e salve.', 4000); });
  document.addEventListener('click', e => { if (e.target.closest('[data-ano-atual]')) { anoEscolhido = null; trocarAno(anoAtualDoCondo()); } });
  const sairEdicao = () => { const deOutra = criandoOutra || editandoId; criandoOutra = false; limparForm(); jaAbriuMinhaCasa = false; atualizarParticipar(); window.scrollTo({top: 0}); if (deOutra && minhaCasa()) toast('De volta à sua casa.'); };
  $('#btn-cancelar-edicao').addEventListener('click', sairEdicao);
  $('#btn-imprimir').addEventListener('click', imprimirLista);
  ['#esgotou-mapa', '#esgotou-form'].forEach(sel => $(sel).addEventListener('click', async e => {
    const b = e.target.closest('[data-esgotou]'); if (!b) return; const c = casaPorId(b.dataset.esgotou); if (!c) return;
    b.disabled = true; await alternarEsgotado(c); b.disabled = false;
  }));
  $('#btn-placa-visitantes').addEventListener('click', () => imprimirPlaca('visitantes'));
  $('#btn-placa-moradores').addEventListener('click', () => imprimirPlaca('moradores'));
  // Sair do condomínio (morador): tira a casa da pessoa do mapa e o nome dela da lista. Dois toques para confirmar.
  $('#btn-sair-condo').addEventListener('click', async () => {
    const b = $('#btn-sair-condo');
    if (!b.dataset.confirma) { b.dataset.confirma = '1'; b.className = 'btn btn-p btn-perigo'; b.textContent = 'Toque de novo para sair'; setTimeout(() => { if (b.isConnected) { delete b.dataset.confirma; b.className = 'btn btn-p btn-fantasma'; b.textContent = 'Sair deste condomínio'; } }, 4000); return; }
    delete b.dataset.confirma; b.className = 'btn btn-p btn-fantasma'; b.textContent = 'Sair deste condomínio';
    if (usuario && casaPorId(usuario.uid)) { try { await fb.fs.deleteDoc(fb.casa(cid, usuario.uid)); } catch (e) { console.error(e); } }
    limparForm(); await sairDoCondo();
  });
  $('#btn-add-morador').addEventListener('click', () => adicionarMorador());
  $('#f-email-morador').addEventListener('input', aoDigitarMorador);
  $('#f-email-morador').addEventListener('focus', () => { if (ehMorador()) carregarDiretorio(); if ($('#f-email-morador').value.trim().length >= 2) aoDigitarMorador(); });
  $('#f-email-morador').addEventListener('blur', () => setTimeout(fecharSugestoes, 200));
  $('#f-email-morador').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); adicionarMorador(); } if (e.key === 'Escape') fecharSugestoes(); });
  $('#sugestoes-morador').addEventListener('pointerdown', e => e.preventDefault());   // não perde o foco antes do toque
  $('#sugestoes-morador').addEventListener('click', e => { const b = e.target.closest('[data-sugestao]'); if (b) escolherSugestao(+b.dataset.sugestao); });
  $('#lista-moradores').addEventListener('click', e => { const b = e.target.closest('[data-tirar-morador]'); if (!b) return; moradoresForm = moradoresForm.filter(x => x.h !== b.dataset.tirarMorador); moradoresMexidos = true; renderMoradores(); toast('Tirado da lista. Salve a casa para valer.'); });
  $('#faixa-edicao').addEventListener('click', e => { if (e.target.closest('[data-sair-edicao]')) sairEdicao(); });
  $('#f-obs').addEventListener('input', contarRecado);
  $('#chips-nome').addEventListener('click', e => {
    if (e.target.closest('[data-mais-nomes]')) { renderSugestoesNome(true); SFX.plop(); return; }
    const b = e.target.closest('[data-nome]'); if (!b) return;
    $('#f-familia').value = b.dataset.nome; SFX.plim(); $$('#chips-nome .chip').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  });
  $('#f-hora-evento').addEventListener('change', e => { if (!e.target.checked) { if (hm($('#f-hi').value) == null) $('#f-hi').value = evento.horaInicio || '18:00'; if (hm($('#f-hf').value) == null) $('#f-hf').value = evento.horaFim || '21:00'; } mostrarHorasCasa(); });
  $('#btn-excluir-minha').addEventListener('click', async () => {
    const b = $('#btn-excluir-minha'); if (!editandoId) return;
    if (!b.dataset.confirma) { b.dataset.confirma = '1'; b.className = 'btn btn-perigo'; b.textContent = 'Toque de novo para confirmar'; setTimeout(() => { delete b.dataset.confirma; b.className = 'btn btn-fantasma'; atualizarForm(); }, 4000); return; }
    const id = editandoId; const ok = await salvarSeguro(() => fb.fs.deleteDoc(fb.casa(cid, id)), 'Casa tirada do mapa.');
    if (ok) { delete b.dataset.confirma; b.className = 'btn btn-fantasma'; criandoOutra = false; limparForm(); jaAbriuMinhaCasa = true; atualizarParticipar(); }
  });
  $('#form-casa').addEventListener('submit', async e => {
    e.preventDefault(); const d = lerForm(); const erro = $('#form-erro');
    if (!d.numero) { erro.textContent = 'Informe o número ou lote da casa.'; erro.hidden = false; $('#f-numero').focus(); return; }
    if (typeof d.lat !== 'number') { erro.textContent = 'Marque a casa no mapa (ou use o GPS) antes de salvar.'; erro.hidden = false; return; }
    if (d.rua) {
      let g = null; try { g = await geocodificar(d.rua, d.numero); } catch {}
      const longe = g ? distanciaAoEndereco(g, d) : 0; const chaveLonge = `${d.lat},${d.lng}|${d.rua}|${d.numero}`;
      if (g && longe > limiteEndereco(g) && confirmouLonge !== chaveLonge) {
        confirmouLonge = chaveLonge; SFX.boo();
        erro.textContent = `A abóbora está a ${fmtM(longe)} ${g.exato ? 'do endereço' : 'da rua'} "${g.exato ? `${d.rua}, ${d.numero}` : d.rua}". Confira no mapa. Se estiver certo mesmo, toque em Salvar de novo; para usar o endereço, toque em "Achar pelo endereço".`;
        erro.hidden = false; $('#mapa-casa').scrollIntoView({behavior: reduzMovimento ? 'auto' : 'smooth', block: 'center'}); return;
      }
    }
    // Mesmo lugar de outra casa: quase sempre é porque o mapa só achou a rua. Pede para ajustar (segundo toque salva assim mesmo).
    const juntas = casasNoMesmoLugar(d, editandoId || (criandoOutra ? null : usuario && usuario.uid));
    const chaveJunto = `${d.lat},${d.lng}|junto`;
    if (juntas.length && confirmouLonge !== chaveJunto) {
      confirmouLonge = chaveJunto; SFX.boo();
      erro.textContent = `A abóbora está no mesmo lugar da casa ${juntas.map(nomeCasaTxt).join(' e ')}. Destrave o mapa e arraste até o telhado certo. Se estiver certo mesmo, toque em Salvar de novo.`;
      erro.hidden = false; $('#mapa-casa').scrollIntoView({behavior: reduzMovimento ? 'auto' : 'smooth', block: 'center'}); return;
    }
    erro.hidden = true;
    if (!usuario) { toast('Entre com Google para salvar sua casa.'); fb.entrar(); return; }
    const antiga = editandoId ? casaPorId(editandoId) : null;
    if (antiga && !podeEditar(antiga)) { toast('Só quem cadastrou ou um admin pode editar esta casa.'); return; }
    if (!editandoId && !criandoOutra && casaPorId(usuario.uid)) { toast('Você já tem uma casa no mapa. Abrindo ela para editar.'); editandoId = usuario.uid; preencherForm(casaPorId(usuario.uid)); return; }
    const id = editandoId || (criandoOutra && ehAdmin() ? novoId() : usuario.uid);
    if (!d.familia) d.familia = nomeDivertido(id);   // sem nome: ganha o nome divertido desta casa
    // Moradores: a casa guarda só o SHA-256 de "codigo:email"; os e-mails ficam em atribuicoes/, que só os moradores da casa e os admins leem.
    // Se a lista não carregou (sem rede), mantém os moradores que já estavam.
    // E-mail digitado sem tocar em "Adicionar" entra junto ao salvar. Nome digitado sem escolher na lista: avisa.
    if ($('#f-email-morador').value.trim()) { if (!moradoresProntos) { toast('Espere a lista de moradores carregar e salve de novo.'); return; } await adicionarMorador(true); if ($('#f-email-morador').value.trim()) return; }
    // A casa guarda só os hashes; nomes e e-mails ficam em atribuicoes/, que só os moradores da casa e os admins leem.
    // Se a lista não carregou (sem rede), mantém os moradores que já estavam.
    let donoHashes = antiga ? hashesDaCasa(antiga) : [], gravar = false;
    if (moradoresProntos && moradoresDe === editandoId) { donoHashes = [...new Set(moradoresForm.map(p => p.h))].slice(0, 6); gravar = true; }
    const pessoas = moradoresForm.map(p => ({h: p.h, ...(p.nome ? {nome: p.nome} : {}), ...(p.email ? {email: p.email} : {})}));
    const casa = {...d, uid: antiga ? antiga.uid : usuario.uid, donoHash: '', donoHashes, esgotado: antiga ? !!antiga.esgotado : false, criadoEm: antiga ? antiga.criadoEm : Date.now()};
    const ok = await salvarSeguro(() => {
      const b = fb.fs.writeBatch(fb.db);
      b.set(fb.casa(cid, id), limparCasa(casa));
      if (gravar && pessoas.length) b.set(fb.atribuicao(cid, id), {moradores: pessoas, ano, atualizadoEm: Date.now()});
      else if (gravar && atribuicaoExiste) b.delete(fb.atribuicao(cid, id));
      return b.commit();
    }, pessoas.length ? `Casa salva com ${pessoas.length + 1} moradores.` : editandoId ? 'Casa atualizada!' : 'Casa no mapa! Bons doces e travessuras!');
    if (ok) evento_('casa_salva', {nova: editandoId ? 0 : 1, moradores: pessoas.length});
    if (ok && moradoresMexidos && pessoas.some(p => !noDiretorio(p.h))) setTimeout(() => toast('Quem ainda não entrou no condomínio precisa entrar com o mesmo e-mail do Google para editar a casa.', 6000), 3000);
    if (ok) { const eraOutra = criandoOutra || (editandoId && editandoId !== usuario.uid && !souResponsavel(antiga)); criandoOutra = false; limparForm(); jaAbriuMinhaCasa = !eraOutra ? false : jaAbriuMinhaCasa; irAba(eraOutra ? 'organizador' : 'mapa'); if (!eraOutra) mapa.setView([casa.lat, casa.lng], 18); }
  });

  // admin
  $('#btn-copiar-link').addEventListener('click', () => copiar(linkCondo()));
  $('#btn-salvar-config').addEventListener('click', () => {
    const nome = $('#c-nome').value.trim().slice(0, 80) || condo.nome, cidade = $('#c-cidade').value.trim().slice(0, 60);
    const publico = $('#c-publico').checked, listado = $('#c-listado').checked;
    salvarSeguro(() => {
      const b = fb.fs.writeBatch(fb.db); const agora = Date.now();
      b.set(fb.condo(cid), {nome, cidade, publico, listado, eventoAtual: anoAtualDoCondo(), atualizadoEm: agora}, {merge: true});
      b.set(fb.evento(cid, ano), {nome: $('#c-evento').value.trim().slice(0, 80), data: $('#c-data').value, horaInicio: $('#c-hi').value, horaFim: $('#c-hf').value, avisos: $('#c-avisos').value.trim().slice(0, 160), ...(eventoDoc ? {} : {criadoEm: agora}), atualizadoEm: agora}, {merge: true});
      if (listado) b.set(fb.busca(cid), {nome, cidade, prefixos: prefixosBusca(nome, cidade), publico, atualizadoEm: agora}); else b.delete(fb.busca(cid));
      return b.commit();
    }, 'Evento salvo!');
  });
  $('#btn-novo-ano').addEventListener('click', async () => {
    const b = $('#btn-novo-ano'); const prox = anoAtualDoCondo() + 1;
    if (!b.dataset.confirma) { b.dataset.confirma = '1'; b.textContent = `Toque de novo para começar ${prox}`; setTimeout(() => { delete b.dataset.confirma; renderAdmin(); }, 4000); return; }
    delete b.dataset.confirma;
    const base = evento.nome && /\d{4}/.test(evento.nome) ? evento.nome.replace(/\d{4}/, String(prox)) : `Halloween ${prox}`;
    const ok = await salvarSeguro(() => {
      const lote = fb.fs.writeBatch(fb.db); const agora = Date.now();
      lote.set(fb.evento(cid, prox), {nome: base.slice(0, 80), data: `${prox}-10-31`, horaInicio: evento.horaInicio || '', horaFim: evento.horaFim || '', avisos: '', criadoEm: agora, atualizadoEm: agora});
      lote.set(fb.condo(cid), {eventoAtual: prox, atualizadoEm: agora}, {merge: true});
      return lote.commit();
    }, `Halloween de ${prox} começou! As casas de ${prox - 1} continuam guardadas.`);
    if (ok) { anoEscolhido = null; SFX.festa(); }
  });

  $('#btn-marcar-portaria').addEventListener('click', () => { modo = 'portaria'; modoVoltar = 'organizador'; irAba('mapa'); renderModo(); if (evento.portaria) mapa.setView([evento.portaria.lat, evento.portaria.lng], Math.max(mapa.getZoom(), 17)); setTimeout(() => $('#mapa').scrollIntoView({behavior: 'smooth', block: 'center'}), 80); });
  $('#btn-centro-mapa').addEventListener('click', () => { irAba('mapa'); const c = mapa.getCenter(); salvarSeguro(() => salvarCondo({centro: {lat: +c.lat.toFixed(6), lng: +c.lng.toFixed(6)}, zoom: Math.max(3, Math.min(20, Math.round(mapa.getZoom())))}), 'Pronto! O mapa abre assim para todo mundo.'); });
  $('#btn-novo-convite').addEventListener('click', async () => {
    const cod = codigoAleatorio(12);
    const ok = await salvarSeguro(() => fb.fs.setDoc(fb.convite(cid, cod), {papel: 'morador', ativo: true, expiraEm: Date.now() + 30 * 864e5, criadoPor: usuario.uid, criadoEm: Date.now()}), 'Convite criado!');
    if (ok) copiar(linkConvite(cod));
  });
  $('#painel-organizador').addEventListener('click', async e => {
    const q = (attr) => e.target.closest(`[${attr}]`);
    let b;
    if ((b = q('data-aprovar'))) { const id = b.dataset.aprovar; await salvarSeguro(() => fb.fs.updateDoc(fb.membro(cid, id), {papel: 'morador', atualizadoEm: Date.now()}), 'Aprovado! Já pode cadastrar a casa.'); return; }
    if ((b = q('data-recusar'))) { const id = b.dataset.recusar; await salvarSeguro(() => fb.fs.deleteDoc(fb.membro(cid, id)), 'Pedido recusado.'); return; }
    if ((b = q('data-papel'))) { const id = b.dataset.papel, novo = b.dataset.novo; await salvarSeguro(() => fb.fs.updateDoc(fb.membro(cid, id), {papel: novo, atualizadoEm: Date.now()}), novo === 'admin' ? 'Agora é admin.' : 'Agora é morador.'); return; }
    if ((b = q('data-remover'))) { if (!b.dataset.confirma) { b.dataset.confirma = '1'; b.className = 'btn btn-p btn-perigo'; b.textContent = 'Confirmar'; setTimeout(() => { if (b.isConnected) renderAdmin(); }, 4000); return; } const id = b.dataset.remover; await salvarSeguro(() => fb.fs.deleteDoc(fb.membro(cid, id)), 'Removido do condomínio.'); return; }
    if ((b = q('data-copiar-convite'))) { copiar(linkConvite(b.dataset.copiarConvite)); return; }
    if ((b = q('data-desativar'))) { const id = b.dataset.desativar; await salvarSeguro(() => fb.fs.updateDoc(fb.convite(cid, id), {ativo: false}), 'Convite desativado.'); return; }
    if ((b = q('data-apagar-convite'))) { const id = b.dataset.apagarConvite; await salvarSeguro(() => fb.fs.deleteDoc(fb.convite(cid, id)), 'Convite apagado.'); return; }
    if ((b = q('data-editar'))) { editandoId = b.dataset.editar; criandoOutra = false; preencherForm(casaPorId(editandoId)); irAba('participar'); return; }
    if (e.target.closest('#btn-casa-outra')) { criandoOutra = true; editandoId = null; limparForm(); criandoOutra = true; irAba('participar'); return; }
    if ((b = q('data-excluir'))) { if (!b.dataset.confirma) { b.dataset.confirma = '1'; b.className = 'btn btn-p btn-perigo'; b.textContent = 'Confirmar exclusão'; setTimeout(() => { if (b.isConnected) renderAdmin(); }, 4000); return; } const id = b.dataset.excluir; await salvarSeguro(() => fb.fs.deleteDoc(fb.casa(cid, id)), 'Casa excluída.'); return; }
  });
  $('#btn-conferir').addEventListener('click', conferirEnderecos);
  $('#conferencia').addEventListener('click', async e => {
    const b = e.target.closest('[data-corrigir]'); if (!b) return; const c = casaPorId(b.dataset.corrigir); if (!c) return;
    const ok = await salvarSeguro(() => fb.fs.setDoc(fb.casa(cid, c.id), limparCasa({...c, lat: +b.dataset.lat, lng: +b.dataset.lng})), `Casa ${nomeCasaTxt(c)} foi para o endereço.`);
    if (ok) { b.closest('li').remove(); if (!$('#conferencia li')) $('#conferencia').innerHTML = '<p class="ok-msg">Todas as casas conferidas estão no endereço.</p>'; }
  });
  $('#btn-exportar').addEventListener('click', () => { const blob = new Blob([JSON.stringify({condominio: cid, ano, evento, casas}, null, 2)], {type: 'application/json'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `rota-assombrada-${cid}-${ano}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); });
  $('#c-importar').addEventListener('change', async e => {
    const f = e.target.files[0]; if (!f) return; const msg = $('#import-msg');
    try {
      const d = JSON.parse(await f.text()); const lista = Array.isArray(d.casas) ? d.casas : []; let n = 0;
      for (const c of lista) { if (c && typeof c.lat === 'number' && typeof c.lng === 'number' && c.numero != null) { const id = /^[A-Za-z0-9_-]{1,128}$/.test(c.id || '') ? c.id : novoId(); await fb.fs.setDoc(fb.casa(cid, id), limparCasa({...c, uid: c.uid || usuario.uid})); n++; } }
      msg.textContent = `${n} casa${n === 1 ? '' : 's'} importada${n === 1 ? '' : 's'}.`; msg.className = 'ok-msg'; SFX.sucesso();
    } catch (err) { console.error(err); msg.textContent = 'Não consegui importar. Confira se o arquivo é um backup deste app.'; msg.className = 'erro-msg'; }
    e.target.value = '';
  });
  setInterval(renderPlacar, 60000);
}

/* ---------- boas-vindas: som e GPS antes de pedir permissão ---------- */
async function estadoPermissaoGPS() {
  if (!('geolocation' in navigator)) return 'indisponivel';
  try { const s = await navigator.permissions.query({name: 'geolocation'}); return s.state; } catch { return 'prompt'; }
}
const DRACULA = `<svg class="dracula" viewBox="0 0 160 170" aria-hidden="true"><ellipse cx="80" cy="164" rx="46" ry="5" fill="#000" opacity=".35"/><g class="capa"><path d="M18 74 L80 58 L142 74 L150 162 L10 162 Z" fill="#1a0f2e"/><path d="M30 80 L80 66 L130 80 L136 160 L24 160 Z" fill="#b3123b"/></g><path d="M44 100 L80 88 L116 100 L118 160 L42 160 Z" fill="#1a0f2e"/><path d="M66 96 L80 108 L94 96 L94 160 L66 160 Z" fill="#f4f1fb"/><path d="M74 104 l6 10 6-10 z" fill="#b3123b"/><path d="M26 64 L56 84 L46 50 Z M134 64 L104 84 L114 50 Z" fill="#b3123b"/><path d="M24 62 L54 82 L44 46 Z M136 62 L106 82 L116 46 Z" fill="#2a1846"/><ellipse cx="80" cy="56" rx="30" ry="34" fill="#dcd6f0"/><path d="M50 50 Q50 18 80 18 Q110 18 110 50 Q100 34 80 44 Q60 34 50 50 Z" fill="#14091f"/><path d="M48 54 l-6 -2 6 10z M112 54 l6 -2 -6 10z" fill="#dcd6f0"/><g class="olhos"><ellipse cx="68" cy="56" rx="6" ry="7" fill="#fff"/><ellipse cx="92" cy="56" rx="6" ry="7" fill="#fff"/><circle cx="69" cy="57" r="3.4" fill="#b3123b"/><circle cx="93" cy="57" r="3.4" fill="#b3123b"/><circle cx="70" cy="55.5" r="1.1" fill="#fff"/><circle cx="94" cy="55.5" r="1.1" fill="#fff"/></g><path d="M60 46 l14 4 M100 46 l-14 4" stroke="#14091f" stroke-width="3" stroke-linecap="round"/><ellipse cx="62" cy="68" rx="5" ry="3" fill="#ff8fb0" opacity=".45"/><ellipse cx="98" cy="68" rx="5" ry="3" fill="#ff8fb0" opacity=".45"/><g class="boca"><path d="M68 72 Q80 82 92 72 Q80 78 68 72 Z" fill="#4a0d1e"/><path d="M72 73.5 l2.2 6 2.2-5.4 z M83.6 74.1 l2.2 5.4 2.2-6 z" fill="#fff"/></g></svg>`;
function falaDracula(texto, depois) {
  const d = $('#folha-in .dracula') || $('.dracula'); if (d) d.classList.add('falando');
  const fim = () => { $$('.dracula.falando').forEach(x => x.classList.remove('falando')); if (depois) depois(); };
  if (!temVoz()) { setTimeout(fim, 1500); return; }
  try {
    speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(texto); u.lang = 'pt-BR'; const v = vozPT(); if (v) u.voice = v;
    u.pitch = 0.35; u.rate = 0.85; u.onstart = () => abaixarMusica(true); u.onend = u.onerror = () => { abaixarMusica(false); fim(); };
    speechSynthesis.speak(u);
  } catch { fim(); }
}
const IC_SOM = svg('<path d="M11 5L6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14"/>');
const IC_GPS = svg('<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>');
function abrirBoasVindas(perm) {
  const passoGPS = perm === 'granted' ? '<p class="ok-msg">GPS já liberado. Tudo certo!</p>'
    : perm === 'denied' ? `<p class="erro-msg">A localização está bloqueada para este site.</p><p class="dica">${IOS ? 'No iPhone: Ajustes, Privacidade, Serviços de Localização, ligue e permita para o navegador. Depois toque no "aA" da barra de endereço, Ajustes do Site, Localização: Permitir.' : 'No Android: toque no cadeado ao lado do endereço, Permissões, Localização: Permitir. Confira também se a localização do celular está ligada.'}</p>`
    : perm === 'indisponivel' ? '<p class="dica">Este aparelho não tem GPS. Você ainda pode usar o mapa e o roteiro saindo da portaria.</p>'
    : `<p class="dica">Ligue a localização do celular. Ao tocar no botão abaixo, o celular vai perguntar se o site pode usar sua localização: toque em <b>Permitir</b>.</p><button class="btn btn-primario" data-bv="gps">${IC_GPS} Ligar GPS</button>`;
  $('#folha-in').innerHTML = `<div class="boas-vindas">
    <div class="drac-cena">${DRACULA}<div class="balao" id="bv-balao">Bem-vindos, pequenos mortais! Eu sou o Conde Drácula e vou guiar vocês na caçada aos doces.</div></div>
    <h3>Antes da caçada começar</h3>
    <p>Dois ajustes rápidos para o Conde guiar você pelas casas.</p>
    <div class="passo" id="bv-som"><span class="passo-ic">${IC_SOM}</span><div><b>Ligue o som</b>
      <p class="dica">Tire o celular do silencioso e aumente o volume. O guia fala o caminho e os botões fazem barulhos divertidos.</p></div>
      <div class="acoes-bv"><button class="btn btn-sucesso" data-bv="som">${IC_SOM} Testar som</button><button class="btn btn-primario" data-bv="musica" id="bv-musica">${svg('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>')} ${AUDIO.tocando ? 'Desligar música' : 'Ligar música'}</button></div><p class="dica" id="bv-som-resp" hidden>Ouviu a risada? Se não, aumente o volume e toque de novo.</p></div>
    <div class="passo" id="bv-gps"><span class="passo-ic">${IC_GPS}</span><div><b>Ligue o GPS</b>
      <p class="dica">Ele mostra onde você está no mapa e avisa quando chegar em cada casa.</p><div id="bv-gps-corpo">${passoGPS}</div></div></div>
    <div class="acoes"><button class="btn btn-primario btn-grande" data-bv="fim">Vamos lá!</button></div>
  </div>`;
  $('#folha').hidden = false;
}
function atualizarBoasVindasGPS() {
  const c = $('#bv-gps-corpo'); if (!c || $('#folha').hidden) return;
  if (posicao) c.innerHTML = `<p class="ok-msg">GPS ligado! Precisão de ${Math.round(posicao.acc)} m.</p>`;
  else if (gpsErro === 1) c.innerHTML = `<p class="erro-msg">A permissão foi negada.</p><p class="dica">${IOS ? 'Toque no "aA" da barra de endereço, Ajustes do Site, Localização: Permitir. Depois recarregue a página.' : 'Toque no cadeado ao lado do endereço, Permissões, Localização: Permitir. Depois recarregue a página.'}</p>`;
  else if (gpsErro === 2) c.innerHTML = '<p class="erro-msg">O GPS do celular parece desligado.</p><p class="dica">Ligue a localização nas configurações do celular e toque em Ligar GPS de novo.</p><button class="btn btn-primario" data-bv="gps">Ligar GPS</button>';
  else if (gpsErro != null) c.innerHTML = `<p class="erro-msg">Não consegui achar sua localização.</p><p class="dica">Confira se a localização do celular está ligada. Se você abriu o link pelo WhatsApp ou Instagram, abra no ${IOS ? 'Safari' : 'Chrome'}, que funciona melhor. Dá para seguir sem GPS e usar a portaria como ponto de partida.</p><button class="btn btn-primario" data-bv="gps">Tentar de novo</button>`;
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-bv]'); if (!b) return; const a = b.dataset.bv;
  if (a === 'som') {
    ctxAudio(); const balao = $('#bv-balao');
    if (balao) balao.textContent = 'Muahaha! Se você me ouviu, o som está perfeito!';
    falaDracula('Muahahaha! Bem-vindos à Rota Assombrada! Se você está me ouvindo, o som está perfeito.', () => SFX.risada());
    $('#bv-som-resp').hidden = false; $('#bv-som-resp').textContent = 'Ouviu o Drácula? Se não, tire do silencioso, aumente o volume e toque de novo.';
  }
  if (a === 'musica') { alternarMusica(); const m = $('#bv-musica'); if (m) m.lastChild.textContent = AUDIO.tocando ? ' Desligar música' : ' Ligar música'; }
  if (a === 'gps') {
    gpsErro = null; b.disabled = true; b.textContent = 'Procurando satélites…';
    if (gpsWatch != null) { try { navigator.geolocation.clearWatch(gpsWatch); } catch {} gpsWatch = null; }
    ligarGPS(true);
    setTimeout(() => { if (!posicao && gpsErro == null) { gpsErro = 3; atualizarBoasVindasGPS(); } }, 20000);
  }
  if (a === 'fim') { ls.set('hw.boasvindas', true); fecharFolha(); SFX.festa(); setTimeout(mostrarDicaMusica, 2500); if (vozAuto) setTimeout(() => falaDracula('Bons doces e travessuras, pequenos monstrinhos! Muahaha!'), 500); }
});
function lerRota() {
  let s = location.hash.replace(/^#\/?/, ''); try { s = decodeURIComponent(s); } catch {}
  // sem "#", vale o caminho limpo /c/CODIGO/ que o app mostra na barra
  if (!s) { const m = location.pathname.match(/^\/c\/([A-Za-z0-9]{5})\/?$/); if (m) s = m[1]; }
  const [c, tipo, codConvite] = s.split('/');
  const cod = normalizarCodigo(c);
  return {c: c && c.toLowerCase() !== 'inicio' && CODIGO.test(cod) ? cod : null, inicio: (c || '').toLowerCase() === 'inicio', convite: tipo === 'convite' && /^[A-Za-z0-9]{8,40}$/.test(codConvite || '') ? codConvite : null};
}
// Endereço atual com outro "#". Precisa ser completo: com <base href="/">, um "#x" solto apontaria para a raiz e recarregaria a página.
const aquiCom = hash => location.href.split('#')[0] + hash;
let voltarUltimo = null;
function tentarVoltarUltimo() {
  if (!authPronto || !voltarUltimo) return;
  const u = voltarUltimo; voltarUltimo = null; const r = lerRota();
  if (usuario && !cid && !r.c && !r.inicio) location.replace(aquiCom('#' + u));
}
function aplicarRota() {
  const r = lerRota();
  if (r.convite && r.c) guardarConvite({cid: r.c, cod: r.convite});
  if (!r.c) {
    const ultimo = ls.get('hw.ultimo', null);
    // Endereço sem condomínio: abre o início. Só quem está logado volta direto para o último condomínio que abriu.
    if (!r.inicio && ultimo && CODIGO.test(ultimo)) voltarUltimo = ultimo;
    fecharCondo(); ajustarEndereco(); tentarVoltarUltimo(); return;
  }
  abrirCondo(r.c); ajustarEndereco();
}

/* ---------- aviso de versão nova ---------- */
// O GitHub Pages guarda a página por alguns minutos; quem está com o app aberto não vê as novidades.
// A cada 5 min (e ao voltar para a aba) confere a versão publicada e oferece "Atualizar".
const VERSAO_APP = +((document.querySelector('script[src*="app.js?v="]') || {}).src || '').replace(/.*v=(\d+).*/, '$1') || 0;
let avisouVersao = false;
// Recarregar "/" não basta: a CDN do GitHub Pages guarda "/" e "/index.html" separados, por até 10 min cada, e ignora a query.
// O checador lê /index.html; se o reload trouxer o "/" velho, o aviso volta. Então abrimos o próprio /index.html (o que o checador
// acabou de ver novo), com um número único para o cache do celular não interferir; ajustarEndereco() limpa a URL depois.
function recarregarNovo() { const q = new URLSearchParams(location.search); q.set('r', Date.now()); location.replace(`/index.html?${q}${location.hash || (cid ? '#' + cid : '')}`); }
if (new URLSearchParams(location.search).has('r')) { const q = new URLSearchParams(location.search); q.delete('r'); history.replaceState(history.state, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash); }
async function conferirVersao() {
  if (avisouVersao || !VERSAO_APP || location.hostname === 'localhost') return;
  try {
    const t = await (await fetch(`/index.html?v=${Date.now()}`, {cache: 'no-store'})).text();
    const nova = +(t.match(/app\.js\?v=(\d+)/) || [])[1] || 0;
    if (nova > VERSAO_APP) {
      avisouVersao = true;
      const b = document.createElement('button'); b.type = 'button'; b.className = 'aviso-versao'; b.innerHTML = `${IC.check} Tem novidade no app! Toque para atualizar`;
      b.addEventListener('click', () => recarregarNovo()); document.body.appendChild(b);
    }
  } catch {}
}
setInterval(conferirVersao, 5 * 60 * 1000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) conferirVersao(); });
setTimeout(conferirVersao, 20000);

/* ---------- carga travada ---------- */
// Às vezes (rede ruim, Safari voltando do fundo) a conexão em tempo real fica muda e a tela não sai do "carregando".
// Aos 10 s reabre a conexão do Firestore; aos 20 s oferece recarregar e mostra em que etapa parou (a etapa vai anônima para as métricas).
let vigiaCarga = 0;
function etapaTravada() {
  if (!fb.pronto) return 'firebase';
  if (!authPronto) return 'login';
  if (!cid) return '';
  if (!condoCarregado) return 'condomínio';
  if (!papelCarregado) return 'acesso';
  if (condo && !casasCarregadas) return 'casas';
  return '';
}
function vigiarCarga() {
  const minha = ++vigiaCarga;
  setTimeout(async () => {
    if (minha !== vigiaCarga) return; const etapa = etapaTravada(); if (!etapa) return;
    evento_('carga_lenta', {etapa});
    if (fb.pronto && etapa !== 'login') { try { await fb.fs.disableNetwork(fb.db); await fb.fs.enableNetwork(fb.db); } catch (e) { console.error(e); } }
    setTimeout(() => {
      if (minha !== vigiaCarga) return; const ainda = etapaTravada(); if (!ainda || document.querySelector('.aviso-carga')) return;
      evento_('carga_travada', {etapa: ainda});
      const b = document.createElement('button'); b.type = 'button'; b.className = 'aviso-versao aviso-carga';
      b.innerHTML = `${IC.carregando}<span>Está demorando… Toque para recarregar<small>Parou em: ${h(ainda)}</small></span>`;
      b.addEventListener('click', () => recarregarNovo()); document.body.appendChild(b);
      const t = setInterval(() => { if (!etapaTravada()) { clearInterval(t); b.remove(); } }, 1000);
    }, 10000);
  }, 10000);
}

/* ---------- tela de abertura ---------- */
// Fica na frente até o login e o condomínio carregarem (no mínimo um instante, no máximo 8 s). Tocar nela fecha.
const splashInicio = Date.now();
(function vigiarSplash() {
  const sp = document.getElementById('splash'); if (!sp) return;
  // veio de uma página /c/CODIGO/ que já mostrava este splash: continua sem recomeçar animação nem tempo mínimo
  let continua = false; try { continua = Date.now() - +(sessionStorage.getItem('hw.splash') || 0) < 15000; sessionStorage.removeItem('hw.splash'); } catch {}
  if (continua) sp.classList.add('continua');
  const frases = ['Acordando o Drácula…', 'Soltando os morcegos…', 'Acendendo as abóboras…', 'Chamando os fantasmas…', 'Contando os doces…'];
  let i = 0; const tf = setInterval(() => { const t = document.getElementById('splash-txt'); if (t) t.textContent = frases[++i % frases.length]; }, 1100);
  const sair = () => { clearInterval(tf); clearInterval(tv); window.__splashMs = Date.now() - splashInicio; sp.classList.add('saindo'); setTimeout(() => sp.remove(), 500); };
  sp.addEventListener('click', sair);
  const pronto = () => authPronto && (!cid || (condoCarregado && papelCarregado));
  const tv = setInterval(() => { const t = Date.now() - splashInicio; if ((pronto() && t > (continua ? 0 : 1200)) || t > 8000) sair(); }, 120);
})();

/* ---------- início ---------- */
async function iniciar() {
  iniciarMapa(); ligarEventos(); renderFiltros(); renderParticipar(); renderModo(); renderConta(); cargaInicio('app');
  vigiarCarga();
  if (!CONFIG.firebase || !CONFIG.firebase.apiKey) { toast('Configure o Firebase em js/config.js.', 8000); return; }
  try { await fb.init(); } catch (e) { console.error(e); cargaFim('app'); authPronto = true; renderConta(); toast('Não consegui conectar. Confira sua internet e recarregue.', 8000); return; }
  cargaFim('app');
  aplicarRota();
  const perm = await estadoPermissaoGPS();
  if (perm === 'granted') ligarGPS(false);
  if (!ls.get('hw.boasvindas', false)) setTimeout(() => abrirBoasVindas(perm), 600);
  if (ls.get('hw.boasvindas', false)) setTimeout(mostrarDicaMusica, 1200);
}
iniciar();
