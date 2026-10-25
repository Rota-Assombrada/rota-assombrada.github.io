// Gera páginas estáticas de prévia (Open Graph) para o WhatsApp e outras redes.
// O WhatsApp não roda o app e ignora o "#" do link, então cada condomínio da busca pública ganha:
//   c/{codigo}/index.html          -> prévia com o nome do condomínio, leva ao app
//   c/{codigo}/convite/index.html  -> prévia de convite (só moradores); o código do convite fica no "#"
// Usa só dados que já são públicos (coleção "busca": nome e cidade). Roda no GitHub Actions de hora em hora.
import {readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, existsSync} from 'node:fs';

const BASE = 'https://rota-assombrada.github.io/';
const config = readFileSync(new URL('../js/config.js', import.meta.url), 'utf8');
const apiKey = config.match(/apiKey:\s*'([^']+)'/)[1];
const projeto = config.match(/projectId:\s*'([^']+)'/)[1];
const CODIGO = /^[A-HJ-NP-Z2-9]{5}$/;
const h = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

async function listarBusca() {
  const itens = []; let token = '';
  do {
    const u = new URL(`https://firestore.googleapis.com/v1/projects/${projeto}/databases/(default)/documents/busca`);
    u.searchParams.set('pageSize', '20'); u.searchParams.set('key', apiKey);
    u.searchParams.append('mask.fieldPaths', 'nome'); u.searchParams.append('mask.fieldPaths', 'cidade');
    if (token) u.searchParams.set('pageToken', token);
    const r = await fetch(u); if (!r.ok) throw new Error(`Firestore ${r.status}: ${await r.text()}`);
    const d = await r.json();
    for (const doc of d.documents || []) {
      const cid = doc.name.split('/').pop(); const f = doc.fields || {};
      if (CODIGO.test(cid)) itens.push({cid, nome: f.nome?.stringValue || cid, cidade: f.cidade?.stringValue || ''});
    }
    token = d.nextPageToken || '';
  } while (token);
  return itens;
}

function pagina({titulo, descricao, url, imagem, alt, destino}) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${h(titulo)}</title>
<meta name="description" content="${h(descricao)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Rota Assombrada">
<meta property="og:title" content="${h(titulo)}">
<meta property="og:description" content="${h(descricao)}">
<meta property="og:url" content="${h(url)}">
<meta property="og:image" content="${BASE}img/${imagem}">
<meta property="og:image:secure_url" content="${BASE}img/${imagem}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${h(alt)}">
<meta property="og:locale" content="pt_BR">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${h(titulo)}">
<meta name="twitter:description" content="${h(descricao)}">
<meta name="twitter:image" content="${BASE}img/${imagem}">
<meta name="robots" content="noindex">
<link rel="icon" type="image/png" href="${BASE}img/favicon-32.png">
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0d0a16;color:#f7f1ff;font:700 18px system-ui,sans-serif;text-align:center;padding:24px}a{color:#ff8a1f}</style>
</head>
<body>
<p>Abrindo a Rota Assombrada… <a id="ir" href="${BASE}">toque aqui se não abrir</a></p>
<script>${destino}</script>
</body>
</html>
`;
}

const IMG_SITE = 'preview.jpg', IMG_CONVITE = 'preview-convite.jpg';
function paginaCondo({cid, nome, cidade}) {
  const titulo = `${nome} · Rota Assombrada`;
  const descricao = `O mapa do Halloween de ${nome}${cidade ? ` (${cidade})` : ''}: veja as casas que dão doces, monte o roteiro e cadastre a sua.`;
  return pagina({titulo, descricao, url: `${BASE}c/${cid}/`, imagem: IMG_SITE, alt: `Mapa do Halloween de ${nome}`,
    destino: `var d=${JSON.stringify(BASE + '#' + cid)};document.getElementById('ir').href=d;location.replace(d);`});
}
function paginaConvite({cid, nome}) {
  const titulo = `Convite: ${nome} · Rota Assombrada`;
  const descricao = `Convite com entrada automática no mapa do Halloween de ${nome}. Compartilhe só com moradores do condomínio.`;
  return pagina({titulo, descricao, url: `${BASE}c/${cid}/convite/`, imagem: IMG_CONVITE, alt: `Convite para o mapa do Halloween de ${nome}`,
    destino: `var c=location.hash.slice(1),d=${JSON.stringify(BASE + '#' + cid)}+(/^[A-Za-z0-9]{8,40}$/.test(c)?'/convite/'+c:'');document.getElementById('ir').href=d;location.replace(d);`});
}

const raiz = new URL('../', import.meta.url).pathname;
const itens = await listarBusca();
const pastaC = `${raiz}c`;
mkdirSync(pastaC, {recursive: true});
const manter = new Set(itens.map(i => i.cid));
for (const nome of existsSync(pastaC) ? readdirSync(pastaC) : []) if (CODIGO.test(nome) && !manter.has(nome)) rmSync(`${pastaC}/${nome}`, {recursive: true, force: true});
for (const it of itens) {
  mkdirSync(`${pastaC}/${it.cid}/convite`, {recursive: true});
  writeFileSync(`${pastaC}/${it.cid}/index.html`, paginaCondo(it));
  writeFileSync(`${pastaC}/${it.cid}/convite/index.html`, paginaConvite(it));
}
console.log(`Prévias geradas para ${itens.length} condomínio(s): ${itens.map(i => i.cid).join(', ') || 'nenhum'}`);
