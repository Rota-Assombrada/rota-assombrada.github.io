// Gera páginas estáticas de prévia (Open Graph) para o WhatsApp e outras redes.
// O WhatsApp não roda o app e ignora o "#" do link, então cada condomínio da busca pública ganha:
//   c/{codigo}/index.html          -> prévia com o nome do condomínio, leva ao app
//   c/{codigo}/convite/index.html  -> prévia de convite (só moradores); o código do convite fica no "#"
// Usa só dados que já são públicos (coleção "busca": nome e cidade). Roda no GitHub Actions de hora em hora.
import {readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, existsSync, copyFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

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

// ---------- capas com o nome do condomínio (Chrome sem janela) ----------
const MODELO = readFileSync(new URL('./capa-modelo.html', import.meta.url), 'utf8');
const CHROME = [process.env.CHROME_BIN, 'google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
  .filter(Boolean).find(b => { try { return spawnSync(b, ['--version'], {stdio: 'ignore'}).status === 0; } catch { return false; } });
function paraJpg(png, jpg) {
  for (const [cmd, args] of [['magick', [png, '-quality', '86', jpg]], ['convert', [png, '-quality', '86', jpg]], ['sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '86', png, '--out', jpg]]]) {
    try { if (spawnSync(cmd, args, {stdio: 'ignore'}).status === 0 && existsSync(jpg)) return true; } catch {}
  }
  return false;
}
// Desenha a capa só quando o texto muda (a versão fica num arquivo ao lado), para não gerar commit toda hora.
function capa(pasta, valores) {
  const html = MODELO.replace('{{SELO}}', valores.selo ? `<div class="selo">${h(valores.selo)}</div>` : '').replace('{{NOME}}', h(valores.nome))
    .replace('{{CLASSE_NOME}}', valores.nome.length > 34 ? 'longo' : '').replace('{{SUB}}', h(valores.sub)).replace('{{CHIP}}', h(valores.chip))
    .replace('{{ALERTA}}', valores.alerta ? `<div class="alerta"><svg viewBox="0 0 24 24"><path d="M12 2 1 21h22z" fill="#fff"/><path d="M12 9v5" stroke="#e8102b" stroke-width="2.6" stroke-linecap="round"/><circle cx="12" cy="17.6" r="1.5" fill="#e8102b"/></svg>${h(valores.alerta)}</div>` : '');
  const versao = createHash('sha256').update(html).digest('hex').slice(0, 10);
  const jpg = join(pasta, 'capa.jpg'), arqVersao = join(pasta, 'capa.versao');
  if (existsSync(jpg) && existsSync(arqVersao) && readFileSync(arqVersao, 'utf8').trim() === versao) return `capa.jpg?v=${versao}`;
  if (!CHROME) return null;
  const tmp = join(tmpdir(), `capa-${versao}`); mkdirSync(tmp, {recursive: true});
  writeFileSync(join(tmp, 'capa.html'), html);
  const png = join(tmp, 'capa.png');
  spawnSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-sandbox', `--user-data-dir=${join(tmp, 'perfil')}`, '--virtual-time-budget=5000', '--window-size=1200,630', `--screenshot=${png}`, `file://${join(tmp, 'capa.html')}`], {stdio: 'ignore', timeout: 60000});
  if (!existsSync(png)) return null;
  if (!paraJpg(png, jpg)) return null;
  writeFileSync(arqVersao, versao + '\n');
  return `capa.jpg?v=${versao}`;
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
<meta property="og:image" content="${imagem}">
<meta property="og:image:secure_url" content="${imagem}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${h(alt)}">
<meta property="og:locale" content="pt_BR">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${h(titulo)}">
<meta name="twitter:description" content="${h(descricao)}">
<meta name="twitter:image" content="${imagem}">
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

// Textos das capas, um por tipo de link. As genéricas (sem nome) ficam em img/ e são geradas com --genericas.
const CAPA_CONVITE = nome => ({selo: 'CONVITE', nome, sub: 'Cadastro aprovado automaticamente', chip: 'Entre e cadastre sua casa', alerta: 'NÃO COMPARTILHE · SÓ MORADORES'});
const IMG_SITE = `${BASE}img/preview.jpg?v=2`, IMG_CONVITE = `${BASE}img/preview-convite.jpg?v=2`;
function paginaCondo({cid, nome, cidade}, img) {
  const titulo = `${nome} · Rota Assombrada`;
  const descricao = `O mapa do Halloween de ${nome}${cidade ? ` (${cidade})` : ''}: veja as casas que dão doces, monte o roteiro e cadastre a sua.`;
  return pagina({titulo, descricao, url: `${BASE}c/${cid}/`, imagem: img ? `${BASE}c/${cid}/${img}` : IMG_SITE, alt: `Mapa do Halloween de ${nome}`,
    destino: `var d=${JSON.stringify(BASE + '#' + cid)};document.getElementById('ir').href=d;location.replace(d);`});
}
function paginaConvite({cid, nome}, img) {
  const titulo = `Convite: ${nome} · Rota Assombrada`;
  const descricao = `Convite para o mapa do Halloween de ${nome}: seu cadastro é aprovado automaticamente. Não compartilhe: é só para moradores do condomínio.`;
  return pagina({titulo, descricao, url: `${BASE}c/${cid}/convite/`, imagem: img ? `${BASE}c/${cid}/convite/${img}` : IMG_CONVITE, alt: `Convite para o mapa do Halloween de ${nome}`,
    destino: `var c=location.hash.slice(1),d=${JSON.stringify(BASE + '#' + cid)}+(/^[A-Za-z0-9]{8,40}$/.test(c)?'/convite/'+c:'');document.getElementById('ir').href=d;location.replace(d);`});
}

const raiz = new URL('../', import.meta.url).pathname;
// node scripts/gerar-previas.mjs --genericas  -> redesenha img/preview.jpg (site) e img/preview-convite.jpg (convite sem nome)
if (process.argv.includes('--genericas')) {
  for (const [arq, v] of [['preview.jpg', {nome: '', sub: 'O mapa das casas que dão doces no seu condomínio', chip: 'Ache seu condomínio e monte o roteiro'}],
    ['preview-convite.jpg', CAPA_CONVITE('Convite do seu condomínio')]]) {
    const d = join(tmpdir(), `generica-${arq}`); rmSync(d, {recursive: true, force: true}); mkdirSync(d, {recursive: true});
    if (!capa(d, v)) { console.error('Sem Chrome para desenhar', arq); process.exit(1); }
    copyFileSync(join(d, 'capa.jpg'), `${raiz}img/${arq}`); console.log('ok', arq);
  }
  process.exit(0);
}
const itens = await listarBusca();
const pastaC = `${raiz}c`;
mkdirSync(pastaC, {recursive: true});
const manter = new Set(itens.map(i => i.cid));
for (const nome of existsSync(pastaC) ? readdirSync(pastaC) : []) if (CODIGO.test(nome) && !manter.has(nome)) rmSync(`${pastaC}/${nome}`, {recursive: true, force: true});
for (const it of itens) {
  mkdirSync(`${pastaC}/${it.cid}/convite`, {recursive: true});
  const imgCondo = capa(`${pastaC}/${it.cid}`, {nome: it.nome, sub: 'O mapa das casas que dão doces no Halloween', chip: 'Veja as casas e monte o roteiro'});
  const imgConvite = capa(`${pastaC}/${it.cid}/convite`, CAPA_CONVITE(it.nome));
  writeFileSync(`${pastaC}/${it.cid}/index.html`, paginaCondo(it, imgCondo));
  writeFileSync(`${pastaC}/${it.cid}/convite/index.html`, paginaConvite(it, imgConvite));
}
console.log(`Prévias geradas para ${itens.length} condomínio(s): ${itens.map(i => i.cid).join(', ') || 'nenhum'}${CHROME ? '' : ' (sem Chrome: capas genéricas)'}`);
