// Testes das regras de segurança do Firestore, rodando no emulador local.
// Cada teste simula uma pessoa (visitante, estranho, pendente, morador, admin, dono) tentando ler ou gravar.
// Rodar: cd testes && npm test
import {test, before, after, beforeEach} from 'node:test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {initializeTestEnvironment, assertSucceeds, assertFails} from '@firebase/rules-unit-testing';
import {doc, getDoc, setDoc, updateDoc, deleteDoc, collection, collectionGroup, getDocs, writeBatch, query, where, limit} from 'firebase/firestore';

// Troca o hash real do dono por um e-mail de teste, para não depender do e-mail verdadeiro.
const EMAIL_DONO = 'dono@teste.dev';
const hashDono = createHash('sha256').update(EMAIL_DONO).digest('hex');
const regras = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8')
  .replace(/'[0-9a-f]{64}'/g, `'${hashDono}'`);

let env;
const agora = Date.now();
const google = (uid, email, extra = {}) => ({email, email_verified: true, firebase: {sign_in_provider: 'google.com'}, ...extra});
const como = (uid, email, extra) => env.authenticatedContext(uid, google(uid, email, extra)).firestore();
const visitante = () => env.unauthenticatedContext().firestore();

const condoBase = (nome, publico, criadoPor) => ({nome, eventoNome: 'Halloween', data: '2026-10-31', horaInicio: '18:30', horaFim: '21:00', avisos: '', portaria: null, centro: {lat: -23.55, lng: -46.63}, zoom: 17, publico, criadoPor, eventoAtual: 2026, criadoEm: agora, atualizadoEm: agora});
const casaBase = uid => ({rua: 'Rua A', numero: '12', familia: 'Família Teste', oferece: ['doces'], flags: ['pequenos'], horaInicio: '', horaFim: '', obs: 'Toque a campainha', lat: -23.55, lng: -46.63, uid, criadoEm: agora, atualizadoEm: agora});
const membro = (uid, papel, email, convite = '') => ({uid, papel, nome: uid, email, convite, criadoEm: agora, atualizadoEm: agora});

before(async () => {
  env = await initializeTestEnvironment({projectId: 'demo-rota', firestore: {rules: regras, host: '127.0.0.1', port: 8080}});
});
after(async () => { await env.cleanup(); });
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'condominios/VALE2'), condoBase('Vale', false, 'adminA'));
    await setDoc(doc(db, 'condominios/VALE2/membros/adminA'), membro('adminA', 'admin', 'a@x.com'));
    await setDoc(doc(db, 'condominios/VALE2/membros/morM'), membro('morM', 'morador', 'm@x.com'));
    await setDoc(doc(db, 'condominios/VALE2/membros/penP'), membro('penP', 'pendente', 'p@x.com'));
    await setDoc(doc(db, 'condominios/VALE2/convites/CONVITEVALIDO1'), {papel: 'morador', ativo: true, expiraEm: agora + 864e5, criadoPor: 'adminA', criadoEm: agora});
    await setDoc(doc(db, 'condominios/VALE2/convites/CONVITEVELHO01'), {papel: 'morador', ativo: true, expiraEm: agora - 1000, criadoPor: 'adminA', criadoEm: agora});
    await setDoc(doc(db, 'condominios/VALE2/convites/CONVITEOFF0001'), {papel: 'morador', ativo: false, expiraEm: agora + 864e5, criadoPor: 'adminA', criadoEm: agora});
    await setDoc(doc(db, 'condominios/VALE2/eventos/2026/casas/morM'), casaBase('morM'));
    await setDoc(doc(db, 'condominios/XUTR2'), condoBase('Outro', false, 'adminB'));
    await setDoc(doc(db, 'condominios/XUTR2/membros/adminB'), membro('adminB', 'admin', 'b@x.com'));
    await setDoc(doc(db, 'condominios/XUTR2/eventos/2026/casas/x1'), casaBase('adminB'));
    await setDoc(doc(db, 'condominios/ABERT'), condoBase('Aberto', true, 'adminB'));
    await setDoc(doc(db, 'condominios/ABERT/eventos/2026/casas/y1'), casaBase('adminB'));
  });
});

// ---------- visitante sem login ----------
test('visitante: lê dados básicos do condomínio pelo link', async () => { await assertSucceeds(getDoc(doc(visitante(), 'condominios/VALE2'))); });
test('visitante: NÃO lista todos os condomínios', async () => { await assertFails(getDocs(collection(visitante(), 'condominios'))); });
test('visitante: NÃO vê casas de condomínio fechado', async () => { await assertFails(getDocs(collection(visitante(), 'condominios/VALE2/eventos/2026/casas'))); });
test('visitante: vê casas de condomínio público', async () => { await assertSucceeds(getDocs(collection(visitante(), 'condominios/ABERT/eventos/2026/casas'))); });
test('visitante: NÃO grava casa nem em condomínio público', async () => { await assertFails(setDoc(doc(visitante(), 'condominios/ABERT/eventos/2026/casas/z'), casaBase('z'))); });
test('visitante: NÃO lê convites nem membros', async () => {
  await assertFails(getDocs(collection(visitante(), 'condominios/VALE2/convites')));
  await assertFails(getDocs(collection(visitante(), 'condominios/VALE2/membros')));
});
test('visitante: NÃO acessa caminhos antigos ou desconhecidos', async () => {
  await assertFails(getDocs(collection(visitante(), 'casas')));
  await assertFails(setDoc(doc(visitante(), 'qualquer/coisa'), {a: 1}));
});

// ---------- estranho logado com Google ----------
test('estranho: NÃO vê casas de condomínio fechado', async () => { await assertFails(getDocs(collection(como('estr', 'e@x.com'), 'condominios/VALE2/eventos/2026/casas'))); });
test('estranho: pode pedir acesso (pendente)', async () => {
  await assertSucceeds(setDoc(doc(como('estr', 'e@x.com'), 'condominios/VALE2/membros/estr'), membro('estr', 'pendente', 'e@x.com')));
});
test('estranho: NÃO entra como morador sem convite', async () => {
  await assertFails(setDoc(doc(como('estr', 'e@x.com'), 'condominios/VALE2/membros/estr'), membro('estr', 'morador', 'e@x.com')));
});
test('estranho: NÃO entra com convite inventado, expirado ou desativado', async () => {
  const db = como('estr', 'e@x.com');
  await assertFails(setDoc(doc(db, 'condominios/VALE2/membros/estr'), membro('estr', 'morador', 'e@x.com', 'INVENTADO0001')));
  await assertFails(setDoc(doc(db, 'condominios/VALE2/membros/estr'), membro('estr', 'morador', 'e@x.com', 'CONVITEVELHO01')));
  await assertFails(setDoc(doc(db, 'condominios/VALE2/membros/estr'), membro('estr', 'morador', 'e@x.com', 'CONVITEOFF0001')));
});
test('estranho: entra como morador com convite válido', async () => {
  await assertSucceeds(setDoc(doc(como('estr', 'e@x.com'), 'condominios/VALE2/membros/estr'), membro('estr', 'morador', 'e@x.com', 'CONVITEVALIDO1')));
});
test('estranho: NÃO se coloca como admin, nem com convite', async () => {
  await assertFails(setDoc(doc(como('estr', 'e@x.com'), 'condominios/VALE2/membros/estr'), membro('estr', 'admin', 'e@x.com', 'CONVITEVALIDO1')));
});
test('estranho: NÃO cria membro em nome de outra pessoa', async () => {
  await assertFails(setDoc(doc(como('estr', 'e@x.com'), 'condominios/VALE2/membros/fulano'), membro('fulano', 'pendente', 'e@x.com')));
});
test('estranho: NÃO usa e-mail diferente do login', async () => {
  await assertFails(setDoc(doc(como('estr', 'e@x.com'), 'condominios/VALE2/membros/estr'), membro('estr', 'pendente', 'outro@x.com')));
});
test('estranho: NÃO pede acesso a condomínio que não existe', async () => {
  await assertFails(setDoc(doc(como('estr', 'e@x.com'), 'condominios/FANT4/membros/estr'), membro('estr', 'pendente', 'e@x.com')));
});

// ---------- pendente ----------
test('pendente: NÃO vê casas nem cadastra casa', async () => {
  const db = como('penP', 'p@x.com');
  await assertFails(getDocs(collection(db, 'condominios/VALE2/eventos/2026/casas')));
  await assertFails(setDoc(doc(db, 'condominios/VALE2/eventos/2026/casas/penP'), casaBase('penP')));
});
test('pendente: NÃO se aprova sozinho', async () => {
  await assertFails(updateDoc(doc(como('penP', 'p@x.com'), 'condominios/VALE2/membros/penP'), {papel: 'morador'}));
});
test('pendente: pode cancelar o próprio pedido', async () => {
  await assertSucceeds(deleteDoc(doc(como('penP', 'p@x.com'), 'condominios/VALE2/membros/penP')));
});

// ---------- morador ----------
test('morador: vê as casas do condomínio', async () => { await assertSucceeds(getDocs(collection(como('morM', 'm@x.com'), 'condominios/VALE2/eventos/2026/casas'))); });
test('morador: edita a própria casa', async () => {
  await assertSucceeds(setDoc(doc(como('morM', 'm@x.com'), 'condominios/VALE2/eventos/2026/casas/morM'), {...casaBase('morM'), obs: 'Nova obs'}));
});
test('morador: NÃO cria casa com id de outra pessoa', async () => {
  await assertFails(setDoc(doc(como('morM', 'm@x.com'), 'condominios/VALE2/eventos/2026/casas/outra'), casaBase('morM')));
});
test('morador: NÃO passa a própria casa para outro dono', async () => {
  await assertFails(setDoc(doc(como('morM', 'm@x.com'), 'condominios/VALE2/eventos/2026/casas/morM'), casaBase('adminA')));
});
test('morador: NÃO edita nem apaga casa alheia', async () => {
  await env.withSecurityRulesDisabled(ctx => setDoc(doc(ctx.firestore(), 'condominios/VALE2/eventos/2026/casas/adminA'), casaBase('adminA')));
  const db = como('morM', 'm@x.com');
  await assertFails(setDoc(doc(db, 'condominios/VALE2/eventos/2026/casas/adminA'), {...casaBase('adminA'), obs: 'hack'}));
  await assertFails(deleteDoc(doc(db, 'condominios/VALE2/eventos/2026/casas/adminA')));
});
test('morador: dados inválidos são recusados', async () => {
  const db = como('morM', 'm@x.com'); const ref = doc(db, 'condominios/VALE2/eventos/2026/casas/morM');
  await assertFails(setDoc(ref, {...casaBase('morM'), campoExtra: 'x'}));
  await assertFails(setDoc(ref, {...casaBase('morM'), obs: 'x'.repeat(241)}));
  await assertFails(setDoc(ref, {...casaBase('morM'), flags: ['inventada']}));
  await assertFails(setDoc(ref, {...casaBase('morM'), lat: 'perto'}));
  await assertFails(setDoc(ref, {...casaBase('morM'), lat: 999}));
  await assertFails(setDoc(ref, {...casaBase('morM'), numero: ''}));
  await assertFails(setDoc(ref, {...casaBase('morM'), horaInicio: '<script>'}));
  await assertFails(setDoc(ref, {...casaBase('morM'), familia: {nested: true}}));
});
test('morador: NÃO lê membros, NÃO cria convite, NÃO muda o condomínio', async () => {
  const db = como('morM', 'm@x.com');
  await assertFails(getDocs(collection(db, 'condominios/VALE2/membros')));
  await assertFails(setDoc(doc(db, 'condominios/VALE2/convites/MEUCONVITE01'), {papel: 'morador', ativo: true, expiraEm: agora + 1e9, criadoPor: 'morM', criadoEm: agora}));
  await assertFails(setDoc(doc(db, 'condominios/VALE2'), {publico: true}, {merge: true}));
});
test('morador: NÃO se promove a admin', async () => {
  await assertFails(updateDoc(doc(como('morM', 'm@x.com'), 'condominios/VALE2/membros/morM'), {papel: 'admin'}));
});
test('morador: lê o próprio cadastro de membro', async () => {
  await assertSucceeds(getDoc(doc(como('morM', 'm@x.com'), 'condominios/VALE2/membros/morM')));
});
test('morador: NÃO lê o cadastro de outro membro', async () => {
  await assertFails(getDoc(doc(como('morM', 'm@x.com'), 'condominios/VALE2/membros/adminA')));
});
test('morador de um condomínio NÃO vê casas de outro', async () => {
  await assertFails(getDocs(collection(como('morM', 'm@x.com'), 'condominios/XUTR2/eventos/2026/casas')));
});

// ---------- login que não é Google ou e-mail não verificado ----------
test('login por senha (não Google) NÃO grava, mesmo sendo morador', async () => {
  const db = env.authenticatedContext('morM', {email: 'm@x.com', email_verified: true, firebase: {sign_in_provider: 'password'}}).firestore();
  await assertFails(setDoc(doc(db, 'condominios/VALE2/eventos/2026/casas/morM'), casaBase('morM')));
});
test('login anônimo NÃO grava', async () => {
  const db = env.authenticatedContext('morM', {firebase: {sign_in_provider: 'anonymous'}}).firestore();
  await assertFails(setDoc(doc(db, 'condominios/VALE2/eventos/2026/casas/morM'), casaBase('morM')));
});
test('e-mail não verificado NÃO grava', async () => {
  await assertFails(setDoc(doc(como('morM', 'm@x.com', {email_verified: false}), 'condominios/VALE2/eventos/2026/casas/morM'), casaBase('morM')));
});

// ---------- admin do condomínio ----------
test('admin: lista membros e aprova pendente', async () => {
  const db = como('adminA', 'a@x.com');
  await assertSucceeds(getDocs(collection(db, 'condominios/VALE2/membros')));
  await assertSucceeds(updateDoc(doc(db, 'condominios/VALE2/membros/penP'), {papel: 'morador', atualizadoEm: agora}));
});
test('admin: NÃO dá papel inventado', async () => {
  await assertFails(updateDoc(doc(como('adminA', 'a@x.com'), 'condominios/VALE2/membros/morM'), {papel: 'superadmin'}));
});
test('admin: cria e desativa convite', async () => {
  const db = como('adminA', 'a@x.com');
  await assertSucceeds(setDoc(doc(db, 'condominios/VALE2/convites/NOVOCONVITE1'), {papel: 'morador', ativo: true, expiraEm: agora + 864e5, criadoPor: 'adminA', criadoEm: agora}));
  await assertSucceeds(updateDoc(doc(db, 'condominios/VALE2/convites/NOVOCONVITE1'), {ativo: false}));
});
test('admin: NÃO cria convite que dá papel de admin', async () => {
  await assertFails(setDoc(doc(como('adminA', 'a@x.com'), 'condominios/VALE2/convites/CONVITEADM01'), {papel: 'admin', ativo: true, expiraEm: agora + 864e5, criadoPor: 'adminA', criadoEm: agora}));
});
test('admin: edita o evento e torna o mapa público', async () => {
  await assertSucceeds(setDoc(doc(como('adminA', 'a@x.com'), 'condominios/VALE2'), {avisos: 'Levem lanterna', publico: true, atualizadoEm: agora}, {merge: true}));
});
test('admin: NÃO troca quem criou o condomínio nem adiciona campos', async () => {
  const db = como('adminA', 'a@x.com');
  await assertFails(setDoc(doc(db, 'condominios/VALE2'), {criadoPor: 'adminA2'}, {merge: true}));
  await assertFails(setDoc(doc(db, 'condominios/VALE2'), {segredo: 'x'}, {merge: true}));
});
test('admin: edita e exclui casa de morador', async () => {
  const db = como('adminA', 'a@x.com');
  await assertSucceeds(setDoc(doc(db, 'condominios/VALE2/eventos/2026/casas/morM'), {...casaBase('morM'), obs: 'corrigido'}));
  await assertSucceeds(deleteDoc(doc(db, 'condominios/VALE2/eventos/2026/casas/morM')));
});
test('admin de um condomínio NÃO mexe em outro', async () => {
  const db = como('adminA', 'a@x.com');
  await assertFails(getDocs(collection(db, 'condominios/XUTR2/eventos/2026/casas')));
  await assertFails(setDoc(doc(db, 'condominios/XUTR2/eventos/2026/casas/x1'), {...casaBase('adminB'), obs: 'hack'}));
  await assertFails(setDoc(doc(db, 'condominios/XUTR2'), {publico: true}, {merge: true}));
  await assertFails(setDoc(doc(db, 'condominios/XUTR2/membros/adminA'), membro('adminA', 'admin', 'a@x.com')));
});
test('admin: NÃO apaga condomínio', async () => {
  await assertFails(deleteDoc(doc(como('adminA', 'a@x.com'), 'condominios/VALE2')));
});

// ---------- dono da plataforma ----------
test('dono: cria condomínio e vira admin dele', async () => {
  const db = como('dono', EMAIL_DONO);
  await assertSucceeds(setDoc(doc(db, 'condominios/NEVC2'), condoBase('Novo', false, 'dono')));
  await assertSucceeds(setDoc(doc(db, 'condominios/NEVC2/membros/dono'), membro('dono', 'admin', EMAIL_DONO)));
});
test('dono: e-mail em maiúsculas também é reconhecido', async () => {
  await assertSucceeds(setDoc(doc(como('dono', EMAIL_DONO.toUpperCase()), 'condominios/NEVC3'), condoBase('Novo2', false, 'dono')));
});
test('dono: lista todos os condomínios', async () => { await assertSucceeds(getDocs(collection(como('dono', EMAIL_DONO), 'condominios'))); });
test('dono: NÃO cria condomínio com código inválido', async () => {
  await assertFails(setDoc(doc(como('dono', EMAIL_DONO), 'condominios/abc-1'), condoBase('X', false, 'dono')));
});
test('dono: NÃO cria condomínio em nome de outra pessoa', async () => {
  await assertFails(setDoc(doc(como('dono', EMAIL_DONO), 'condominios/NEVC4'), condoBase('Novo3', false, 'alguem')));
});
test('e-mail parecido com o do dono NÃO vira dono', async () => {
  await assertFails(setDoc(doc(como('falso', 'dono@teste.dev.evil.com'), 'condominios/FALS2'), condoBase('Falso', false, 'falso')));
});

// ---------- criação self-service (um condomínio por conta) ----------
const buscaBase = nome => ({nome, cidade: 'São Paulo', prefixos: ['va', 'val', 'vale'], publico: false, atualizadoEm: agora});
function loteCriacao(db, uid, email, cid, extra = {}) {
  const b = writeBatch(db);
  b.set(doc(db, 'condominios/' + cid), {...condoBase('Novo', false, uid), ...extra});
  b.set(doc(db, 'criadores/' + uid), {cid, criadoEm: agora});
  b.set(doc(db, `condominios/${cid}/membros/${uid}`), membro(uid, 'admin', email));
  b.set(doc(db, 'busca/' + cid), buscaBase('Novo'));
  b.set(doc(db, `condominios/${cid}/eventos/2026`), {nome: 'Halloween 2026', data: '2026-10-31', horaInicio: '', horaFim: '', avisos: '', criadoEm: agora, atualizadoEm: agora});
  return b.commit();
}
test('qualquer conta Google cria um condomínio e vira admin', async () => {
  await assertSucceeds(loteCriacao(como('nova', 'n@x.com'), 'nova', 'n@x.com', 'NEW22'));
});
test('a mesma conta NÃO cria um segundo condomínio', async () => {
  await assertSucceeds(loteCriacao(como('nova', 'n@x.com'), 'nova', 'n@x.com', 'NEW22'));
  await assertFails(loteCriacao(como('nova', 'n@x.com'), 'nova', 'n@x.com', 'NEW33'));
});
test('NÃO cria condomínio sem registrar o criador no mesmo lote', async () => {
  await assertFails(setDoc(doc(como('nova', 'n@x.com'), 'condominios/NEW44'), condoBase('Novo', false, 'nova')));
});
test('NÃO registra criador apontando para outro condomínio', async () => {
  const db = como('nova', 'n@x.com'); const b = writeBatch(db);
  b.set(doc(db, 'condominios/NEW55'), condoBase('Novo', false, 'nova'));
  b.set(doc(db, 'criadores/nova'), {cid: 'NEW66', criadoEm: agora});
  await assertFails(b.commit());
});
test('NÃO toma um condomínio que já existe', async () => {
  await assertFails(loteCriacao(como('nova', 'n@x.com'), 'nova', 'n@x.com', 'VALE2'));
});
test('NÃO vira admin de condomínio existente fingindo estar criando', async () => {
  await assertFails(setDoc(doc(como('nova', 'n@x.com'), 'condominios/VALE2/membros/nova'), membro('nova', 'admin', 'n@x.com')));
});
test('NÃO cria condomínio em nome de outra pessoa', async () => {
  await assertFails(loteCriacao(como('nova', 'n@x.com'), 'nova', 'n@x.com', 'NEW77', {criadoPor: 'outra'}));
});
test('NÃO cria condomínio com código fora do padrão', async () => {
  await assertFails(loteCriacao(como('nova', 'n@x.com'), 'nova', 'n@x.com', 'NEWO1'));
  await assertFails(loteCriacao(como('nova', 'n@x.com'), 'nova', 'n@x.com', 'NEW222'));
});
test('visitante e login anônimo NÃO criam condomínio', async () => {
  await assertFails(loteCriacao(visitante(), 'x', 'x@x.com', 'NEW88'));
  const anon = env.authenticatedContext('anon', {firebase: {sign_in_provider: 'anonymous'}}).firestore();
  await assertFails(loteCriacao(anon, 'anon', '', 'NEW99'));
});
test('cada um só lê o próprio registro de criador', async () => {
  await assertSucceeds(loteCriacao(como('nova', 'n@x.com'), 'nova', 'n@x.com', 'NEW22'));
  await assertSucceeds(getDoc(doc(como('nova', 'n@x.com'), 'criadores/nova')));
  await assertFails(getDoc(doc(como('estr', 'e@x.com'), 'criadores/nova')));
});

// ---------- busca ----------
test('busca: visitante pesquisa com limite pequeno', async () => {
  await env.withSecurityRulesDisabled(ctx => setDoc(doc(ctx.firestore(), 'busca/VALE2'), buscaBase('Vale')));
  await assertSucceeds(getDocs(query(collection(visitante(), 'busca'), where('prefixos', 'array-contains', 'val'), limit(10))));
});
test('busca: NÃO baixa a lista inteira sem limite', async () => {
  await assertFails(getDocs(collection(visitante(), 'busca')));
  await assertFails(getDocs(query(collection(visitante(), 'busca'), limit(500))));
});
test('busca: só admin do condomínio altera ou remove', async () => {
  await env.withSecurityRulesDisabled(ctx => setDoc(doc(ctx.firestore(), 'busca/VALE2'), buscaBase('Vale')));
  await assertFails(setDoc(doc(como('morM', 'm@x.com'), 'busca/VALE2'), buscaBase('Hackeado')));
  await assertFails(deleteDoc(doc(como('estr', 'e@x.com'), 'busca/VALE2')));
  await assertFails(setDoc(doc(como('adminA', 'a@x.com'), 'busca/XUTR2'), buscaBase('Hackeado')));
  await assertSucceeds(setDoc(doc(como('adminA', 'a@x.com'), 'busca/VALE2'), buscaBase('Vale Verde')));
  await assertSucceeds(deleteDoc(doc(como('adminA', 'a@x.com'), 'busca/VALE2')));
});
test('busca: NÃO aceita campos extras como telefone', async () => {
  await assertFails(setDoc(doc(como('adminA', 'a@x.com'), 'busca/VALE2'), {...buscaBase('Vale'), telefone: '11999999999'}));
});

// ---------- Meus eventos ----------
test('meus eventos: a pessoa lista as próprias participações', async () => {
  await assertSucceeds(getDocs(query(collectionGroup(como('morM', 'm@x.com'), 'membros'), where('uid', '==', 'morM'), limit(30))));
});
test('meus eventos: NÃO lista as participações de outra pessoa', async () => {
  await assertFails(getDocs(query(collectionGroup(como('morM', 'm@x.com'), 'membros'), where('uid', '==', 'adminA'), limit(30))));
  await assertFails(getDocs(collectionGroup(como('morM', 'm@x.com'), 'membros')));
});
test('meus eventos: visitante NÃO lista participações', async () => {
  await assertFails(getDocs(query(collectionGroup(visitante(), 'membros'), where('uid', '==', 'morM'))));
});

// ---------- dono atualiza condomínio do formato antigo ----------
test('dono: migra condomínio de código antigo para o novo', async () => {
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'condominios/csa1'), {...condoBase('Antigo', true, 'dono'), whatsapp: '11999999999'});
    await setDoc(doc(db, 'condominios/csa1/membros/morM'), membro('morM', 'morador', 'm@x.com'));
    await setDoc(doc(db, 'condominios/csa1/casas/morM'), casaBase('morM'));
  });
  const db = como('dono', EMAIL_DONO);
  await assertSucceeds(getDocs(collection(db, 'condominios/csa1/casas')));
  await assertSucceeds(getDocs(collection(db, 'condominios/csa1/membros')));
  const b = writeBatch(db);
  b.set(doc(db, 'condominios/MGR22'), condoBase('Antigo', true, 'dono'));
  b.set(doc(db, 'busca/MGR22'), buscaBase('Antigo'));
  b.set(doc(db, 'condominios/MGR22/membros/morM'), membro('morM', 'morador', 'm@x.com'));
  b.set(doc(db, 'condominios/MGR22/eventos/2026/casas/morM'), casaBase('morM'));
  await assertSucceeds(b.commit());
  const apagar = writeBatch(db);
  apagar.delete(doc(db, 'condominios/csa1/membros/morM')); apagar.delete(doc(db, 'condominios/csa1/casas/morM')); apagar.delete(doc(db, 'condominios/csa1'));
  await assertSucceeds(apagar.commit());
});
test('admin comum NÃO apaga condomínio antigo nem cria com código antigo', async () => {
  await env.withSecurityRulesDisabled(ctx => setDoc(doc(ctx.firestore(), 'condominios/csa1'), condoBase('Antigo', true, 'adminA')));
  await env.withSecurityRulesDisabled(ctx => setDoc(doc(ctx.firestore(), 'condominios/csa1/membros/adminA'), membro('adminA', 'admin', 'a@x.com')));
  await assertFails(deleteDoc(doc(como('adminA', 'a@x.com'), 'condominios/csa1')));
  await assertFails(setDoc(doc(como('adminA', 'a@x.com'), 'condominios/csa1'), {avisos: 'x'}, {merge: true}));
});

// ---------- eventos por ano ----------
const eventoBase = (nome = 'Halloween 2027') => ({nome, data: '2027-10-31', horaInicio: '18:30', horaFim: '21:00', avisos: '', criadoEm: agora, atualizadoEm: agora});
test('evento: qualquer pessoa lê os dados do evento', async () => {
  await env.withSecurityRulesDisabled(ctx => setDoc(doc(ctx.firestore(), 'condominios/VALE2/eventos/2026'), eventoBase('Halloween 2026')));
  await assertSucceeds(getDoc(doc(visitante(), 'condominios/VALE2/eventos/2026')));
});
test('evento: admin começa o ano seguinte', async () => {
  await assertSucceeds(setDoc(doc(como('adminA', 'a@x.com'), 'condominios/VALE2/eventos/2027'), eventoBase()));
  await assertSucceeds(setDoc(doc(como('adminA', 'a@x.com'), 'condominios/VALE2'), {eventoAtual: 2027}, {merge: true}));
});
test('evento: morador e estranho NÃO criam evento', async () => {
  await assertFails(setDoc(doc(como('morM', 'm@x.com'), 'condominios/VALE2/eventos/2027'), eventoBase()));
  await assertFails(setDoc(doc(como('estr', 'e@x.com'), 'condominios/VALE2/eventos/2027'), eventoBase()));
});
test('evento: admin de outro condomínio NÃO cria evento aqui', async () => {
  await assertFails(setDoc(doc(como('adminA', 'a@x.com'), 'condominios/XUTR2/eventos/2027'), eventoBase()));
});
test('evento: ano inválido ou campo extra são recusados', async () => {
  const db = como('adminA', 'a@x.com');
  await assertFails(setDoc(doc(db, 'condominios/VALE2/eventos/1999'), eventoBase()));
  await assertFails(setDoc(doc(db, 'condominios/VALE2/eventos/abcd'), eventoBase()));
  await assertFails(setDoc(doc(db, 'condominios/VALE2/eventos/2027'), {...eventoBase(), telefone: '1199'}));
  await assertFails(setDoc(doc(db, 'condominios/VALE2'), {eventoAtual: 1999}, {merge: true}));
});
test('evento: casa de um ano não mexe na casa de outro', async () => {
  await assertSucceeds(setDoc(doc(como('morM', 'm@x.com'), 'condominios/VALE2/eventos/2027/casas/morM'), casaBase('morM')));
  await assertFails(setDoc(doc(como('morM', 'm@x.com'), 'condominios/VALE2/eventos/2027/casas/adminA'), casaBase('morM')));
});
test('formato antigo: ninguém cria casa fora de um evento', async () => {
  await assertFails(setDoc(doc(como('morM', 'm@x.com'), 'condominios/VALE2/casas/morM'), casaBase('morM')));
  await assertFails(setDoc(doc(como('adminA', 'a@x.com'), 'condominios/VALE2/casas/x9'), casaBase('adminA')));
});
test('formato antigo: admin lê e limpa as casas antigas ao migrar', async () => {
  await env.withSecurityRulesDisabled(ctx => setDoc(doc(ctx.firestore(), 'condominios/VALE2/casas/velha'), casaBase('morM')));
  const db = como('adminA', 'a@x.com');
  await assertSucceeds(getDocs(collection(db, 'condominios/VALE2/casas')));
  await assertSucceeds(setDoc(doc(db, 'condominios/VALE2/eventos/2026/casas/velha'), casaBase('morM')));
  await assertSucceeds(deleteDoc(doc(db, 'condominios/VALE2/casas/velha')));
  await assertFails(deleteDoc(doc(como('morM', 'm@x.com'), 'condominios/VALE2/casas/velha')));
});

// ---------- casa atribuída a um e-mail ----------
const hashDe = (cid, email) => createHash('sha256').update(`${cid}:${email.toLowerCase()}`).digest('hex');
async function casaAtribuida(email) {
  await env.withSecurityRulesDisabled(ctx => setDoc(doc(ctx.firestore(), 'condominios/VALE2/eventos/2026/casas/x77'), {...casaBase('adminA'), donoHash: hashDe('VALE2', email)}));
}
test('atribuição: admin cria casa atribuída a um e-mail e guarda o e-mail na lista só de admins', async () => {
  const db = como('adminA', 'a@x.com');
  await assertSucceeds(setDoc(doc(db, 'condominios/VALE2/eventos/2026/casas/x77'), {...casaBase('adminA'), donoHash: hashDe('VALE2', 'ana@x.com')}));
  await assertSucceeds(setDoc(doc(db, 'condominios/VALE2/atribuicoes/x77'), {email: 'ana@x.com', ano: 2026, atualizadoEm: agora}));
  await assertSucceeds(getDoc(doc(db, 'condominios/VALE2/atribuicoes/x77')));
});
test('atribuição: o e-mail fica escondido de moradores e visitantes', async () => {
  await env.withSecurityRulesDisabled(ctx => setDoc(doc(ctx.firestore(), 'condominios/VALE2/atribuicoes/x77'), {email: 'ana@x.com', ano: 2026, atualizadoEm: agora}));
  await assertFails(getDoc(doc(como('morM', 'm@x.com'), 'condominios/VALE2/atribuicoes/x77')));
  await assertFails(getDocs(collection(visitante(), 'condominios/VALE2/atribuicoes')));
  await assertFails(setDoc(doc(como('morM', 'm@x.com'), 'condominios/VALE2/atribuicoes/x77'), {email: 'eu@x.com', ano: 2026, atualizadoEm: agora}));
});
test('atribuição: quem entra com o e-mail edita a casa, sem trocar quem cadastrou', async () => {
  await casaAtribuida('ana@x.com');
  const db = como('ana', 'Ana@X.com');
  await assertSucceeds(setDoc(doc(db, 'condominios/VALE2/eventos/2026/casas/x77'), {...casaBase('adminA'), donoHash: hashDe('VALE2', 'ana@x.com'), obs: 'editado pela Ana'}));
  await assertFails(setDoc(doc(db, 'condominios/VALE2/eventos/2026/casas/x77'), {...casaBase('ana'), donoHash: hashDe('VALE2', 'ana@x.com')}));
});
test('atribuição: formato antigo passa para a lista de moradores', async () => {
  await casaAtribuida('ana@x.com');
  await assertSucceeds(setDoc(doc(como('ana', 'ana@x.com'), 'condominios/VALE2/eventos/2026/casas/x77'), {...casaBase('adminA'), donoHash: '', donoHashes: [hashDe('VALE2', 'ana@x.com'), hashDe('VALE2', 'bia@x.com')]}));
});

// ---------- vários moradores na mesma casa ----------
const casaComMoradores = (uid, emails) => ({...casaBase(uid), donoHashes: emails.map(e => hashDe('VALE2', e))});
test('moradores: quem cadastrou adiciona outros moradores e guarda os e-mails no mesmo lote', async () => {
  const db = como('morM', 'm@x.com'); const b = writeBatch(db);
  b.set(doc(db, 'condominios/VALE2/eventos/2026/casas/morM'), casaComMoradores('morM', ['bia@x.com', 'cris@x.com']));
  b.set(doc(db, 'condominios/VALE2/atribuicoes/morM'), {emails: ['bia@x.com', 'cris@x.com'], ano: 2026, atualizadoEm: agora});
  await assertSucceeds(b.commit());
  await assertSucceeds(getDoc(doc(db, 'condominios/VALE2/atribuicoes/morM')));
});
test('moradores: casa nova já nasce com moradores (lote com a casa e os e-mails)', async () => {
  await env.withSecurityRulesDisabled(ctx => setDoc(doc(ctx.firestore(), 'condominios/VALE2/membros/novaN'), membro('novaN', 'morador', 'n@x.com')));
  const db = como('novaN', 'n@x.com'); const b = writeBatch(db);
  b.set(doc(db, 'condominios/VALE2/eventos/2026/casas/novaN'), casaComMoradores('novaN', ['bia@x.com']));
  b.set(doc(db, 'condominios/VALE2/atribuicoes/novaN'), {emails: ['bia@x.com'], ano: 2026, atualizadoEm: agora});
  await assertSucceeds(b.commit());
});
test('moradores: quem está na lista edita, vê os e-mails e cuida da lista, mas não troca quem cadastrou', async () => {
  await env.withSecurityRulesDisabled(async ctx => {
    const d = ctx.firestore();
    await setDoc(doc(d, 'condominios/VALE2/eventos/2026/casas/morM'), casaComMoradores('morM', ['bia@x.com']));
    await setDoc(doc(d, 'condominios/VALE2/atribuicoes/morM'), {emails: ['bia@x.com'], ano: 2026, atualizadoEm: agora});
  });
  const db = como('bia', 'bia@x.com');
  await assertSucceeds(getDoc(doc(db, 'condominios/VALE2/atribuicoes/morM')));
  await assertSucceeds(setDoc(doc(db, 'condominios/VALE2/eventos/2026/casas/morM'), {...casaComMoradores('morM', ['bia@x.com', 'davi@x.com']), obs: 'Bia mexeu'}));
  await assertSucceeds(setDoc(doc(db, 'condominios/VALE2/atribuicoes/morM'), {emails: ['bia@x.com', 'davi@x.com'], ano: 2026, atualizadoEm: agora}));
  await assertFails(setDoc(doc(db, 'condominios/VALE2/eventos/2026/casas/morM'), casaComMoradores('bia', ['bia@x.com'])));
});
test('moradores: quem não está na lista NÃO lê os e-mails nem mexe na casa', async () => {
  await env.withSecurityRulesDisabled(async ctx => {
    const d = ctx.firestore();
    await setDoc(doc(d, 'condominios/VALE2/eventos/2026/casas/morM'), casaComMoradores('morM', ['bia@x.com']));
    await setDoc(doc(d, 'condominios/VALE2/atribuicoes/morM'), {emails: ['bia@x.com'], ano: 2026, atualizadoEm: agora});
  });
  const db = como('cris', 'cris@x.com');
  await assertFails(getDoc(doc(db, 'condominios/VALE2/atribuicoes/morM')));
  await assertFails(setDoc(doc(db, 'condominios/VALE2/atribuicoes/morM'), {emails: ['cris@x.com'], ano: 2026, atualizadoEm: agora}));
  await assertFails(setDoc(doc(db, 'condominios/VALE2/eventos/2026/casas/morM'), casaComMoradores('morM', ['cris@x.com'])));
  await assertFails(getDoc(doc(como('penP', 'p@x.com'), 'condominios/VALE2/atribuicoes/morM')));
});
test('moradores: quem cadastrou NÃO se coloca na lista de outra casa', async () => {
  await env.withSecurityRulesDisabled(ctx => setDoc(doc(ctx.firestore(), 'condominios/VALE2/eventos/2026/casas/x80'), casaBase('adminA')));
  const db = como('morM', 'm@x.com'); const b = writeBatch(db);
  b.set(doc(db, 'condominios/VALE2/eventos/2026/casas/x80'), casaComMoradores('adminA', ['m@x.com']));
  b.set(doc(db, 'condominios/VALE2/atribuicoes/x80'), {emails: ['m@x.com'], ano: 2026, atualizadoEm: agora});
  await assertFails(b.commit());
});
test('moradores: tirado da lista perde o acesso', async () => {
  await env.withSecurityRulesDisabled(ctx => setDoc(doc(ctx.firestore(), 'condominios/VALE2/eventos/2026/casas/morM'), casaComMoradores('morM', ['cris@x.com'])));
  await assertFails(setDoc(doc(como('bia', 'bia@x.com'), 'condominios/VALE2/eventos/2026/casas/morM'), casaComMoradores('morM', ['bia@x.com'])));
});
test('moradores: no máximo 6 e no formato certo', async () => {
  const db = como('morM', 'm@x.com');
  await assertFails(setDoc(doc(db, 'condominios/VALE2/eventos/2026/casas/morM'), casaComMoradores('morM', ['a@x.com', 'b@x.com', 'c@x.com', 'd@x.com', 'e@x.com', 'f@x.com', 'g@x.com'])));
  await assertFails(setDoc(doc(db, 'condominios/VALE2/eventos/2026/casas/morM'), {...casaBase('morM'), donoHashes: ['bia@x.com']}));
  await assertFails(setDoc(doc(db, 'condominios/VALE2/atribuicoes/morM'), {emails: ['nao-e-email'], ano: 2026, atualizadoEm: agora}));
  await assertFails(setDoc(doc(db, 'condominios/VALE2/atribuicoes/morM'), {emails: ['a@x.com'], ano: 2026, extra: 1, atualizadoEm: agora}));
});
test('atribuição: o responsável pode tirar a casa do mapa', async () => {
  await casaAtribuida('ana@x.com');
  await assertSucceeds(deleteDoc(doc(como('ana', 'ana@x.com'), 'condominios/VALE2/eventos/2026/casas/x77')));
});
test('atribuição: outro e-mail NÃO edita nem apaga', async () => {
  await casaAtribuida('ana@x.com');
  const db = como('bia', 'bia@x.com');
  await assertFails(setDoc(doc(db, 'condominios/VALE2/eventos/2026/casas/x77'), {...casaBase('bia'), donoHash: hashDe('VALE2', 'ana@x.com')}));
  await assertFails(deleteDoc(doc(db, 'condominios/VALE2/eventos/2026/casas/x77')));
});
test('atribuição: o responsável NÃO passa a casa para outro e-mail nem para outra conta', async () => {
  await casaAtribuida('ana@x.com');
  const db = como('ana', 'ana@x.com');
  await assertFails(setDoc(doc(db, 'condominios/VALE2/eventos/2026/casas/x77'), {...casaBase('ana'), donoHash: hashDe('VALE2', 'bia@x.com')}));
  await assertFails(setDoc(doc(db, 'condominios/VALE2/eventos/2026/casas/x77'), {...casaBase('bia'), donoHash: hashDe('VALE2', 'ana@x.com')}));
});
test('atribuição: hash de outro condomínio NÃO vale aqui', async () => {
  await env.withSecurityRulesDisabled(ctx => setDoc(doc(ctx.firestore(), 'condominios/VALE2/eventos/2026/casas/x78'), {...casaBase('adminA'), donoHash: hashDe('XUTR2', 'ana@x.com')}));
  await assertFails(setDoc(doc(como('ana', 'ana@x.com'), 'condominios/VALE2/eventos/2026/casas/x78'), {...casaBase('ana'), donoHash: hashDe('XUTR2', 'ana@x.com')}));
});
test('atribuição: morador NÃO se atribui a casa de outro nem muda o hash da própria', async () => {
  await assertFails(setDoc(doc(como('morM', 'm@x.com'), 'condominios/VALE2/eventos/2026/casas/morM'), {...casaBase('morM'), donoHash: hashDe('VALE2', 'outro@x.com')}));
});
test('atribuição: hash fora do formato é recusado', async () => {
  await assertFails(setDoc(doc(como('adminA', 'a@x.com'), 'condominios/VALE2/eventos/2026/casas/x79'), {...casaBase('adminA'), donoHash: 'ana@x.com'}));
});

// ---------- índice de e-mails (conferir se alguém já é morador) ----------
const idx = (cid, email) => `condominios/${cid}/emails/${hashDe(cid, email)}`;
test('índice: morador registra o próprio e-mail e outro morador confere pelo e-mail exato', async () => {
  await assertSucceeds(setDoc(doc(como('morM', 'm@x.com'), idx('VALE2', 'm@x.com')), {uid: 'morM', nome: 'Mara', atualizadoEm: agora}));
  const snap = await assertSucceeds(getDoc(doc(como('adminA', 'a@x.com'), idx('VALE2', 'm@x.com'))));
  if (!snap.exists()) throw new Error('deveria achar');
});
test('índice: moradores aprovados listam o diretório para buscar por nome', async () => {
  await assertSucceeds(getDocs(collection(como('morM', 'm@x.com'), 'condominios/VALE2/emails')));
  await assertSucceeds(getDocs(collection(como('adminA', 'a@x.com'), 'condominios/VALE2/emails')));
  await assertFails(getDocs(collection(como('penP', 'p@x.com'), 'condominios/VALE2/emails')));
  await assertFails(getDocs(collection(visitante(), 'condominios/VALE2/emails')));
  await assertFails(getDocs(collection(como('adminB', 'b@x.com'), 'condominios/VALE2/emails')));
});
test('índice: o e-mail completo NÃO entra no diretório, só pela metade', async () => {
  const db = como('morM', 'm@x.com');
  await assertSucceeds(setDoc(doc(db, idx('VALE2', 'm@x.com')), {uid: 'morM', nome: 'Mara Lima', mascara: 'm•••@x.com', atualizadoEm: agora}));
  await assertFails(setDoc(doc(db, idx('VALE2', 'm@x.com')), {uid: 'morM', nome: 'Mara Lima', mascara: 'm@x.com', atualizadoEm: agora}));
  await assertFails(setDoc(doc(db, idx('VALE2', 'm@x.com')), {uid: 'morM', nome: 'Mara Lima', mascara: 'mara.lima•••@x.com', atualizadoEm: agora}));
});
test('moradores: adicionar pelo diretório (só o hash e o nome, sem o e-mail)', async () => {
  const db = como('morM', 'm@x.com'); const b = writeBatch(db);
  b.set(doc(db, 'condominios/VALE2/eventos/2026/casas/morM'), casaComMoradores('morM', ['bia@x.com', 'cris@x.com']));
  b.set(doc(db, 'condominios/VALE2/atribuicoes/morM'), {moradores: [{h: hashDe('VALE2', 'bia@x.com'), nome: 'Bia'}, {h: hashDe('VALE2', 'cris@x.com'), nome: '', email: 'cris@x.com'}], ano: 2026, atualizadoEm: agora});
  await assertSucceeds(b.commit());
  await assertFails(setDoc(doc(db, 'condominios/VALE2/atribuicoes/morM'), {moradores: [{h: 'nao-e-hash', nome: 'X'}], ano: 2026, atualizadoEm: agora}));
  await assertFails(setDoc(doc(db, 'condominios/VALE2/atribuicoes/morM'), {moradores: [{h: hashDe('VALE2', 'bia@x.com'), extra: 1}], ano: 2026, atualizadoEm: agora}));
});
test('índice: pendente, visitante e outro condomínio NÃO consultam', async () => {
  await env.withSecurityRulesDisabled(ctx => setDoc(doc(ctx.firestore(), idx('VALE2', 'm@x.com')), {uid: 'morM', nome: 'Mara', atualizadoEm: agora}));
  await assertFails(getDoc(doc(como('penP', 'p@x.com'), idx('VALE2', 'm@x.com'))));
  await assertFails(getDoc(doc(visitante(), idx('VALE2', 'm@x.com'))));
  await assertFails(getDoc(doc(como('adminB', 'b@x.com'), idx('VALE2', 'm@x.com'))));
});
test('índice: ninguém registra e-mail de outra pessoa nem entra sem ser morador', async () => {
  await assertFails(setDoc(doc(como('morM', 'm@x.com'), idx('VALE2', 'outro@x.com')), {uid: 'morM', nome: 'X', atualizadoEm: agora}));
  await assertFails(setDoc(doc(como('morM', 'm@x.com'), idx('VALE2', 'm@x.com')), {uid: 'outro', nome: 'X', atualizadoEm: agora}));
  await assertFails(setDoc(doc(como('penP', 'p@x.com'), idx('VALE2', 'p@x.com')), {uid: 'penP', nome: 'P', atualizadoEm: agora}));
  await assertFails(setDoc(doc(como('morM', 'm@x.com'), idx('VALE2', 'm@x.com')), {uid: 'morM', nome: 'Mara', email: 'm@x.com', atualizadoEm: agora}));
});
test('índice: admin mantém o índice; a pessoa apaga o próprio', async () => {
  await assertSucceeds(setDoc(doc(como('adminA', 'a@x.com'), idx('VALE2', 'm@x.com')), {uid: 'morM', nome: 'Mara', atualizadoEm: agora}));
  await assertFails(deleteDoc(doc(como('penP', 'p@x.com'), idx('VALE2', 'm@x.com'))));
  await assertSucceeds(deleteDoc(doc(como('morM', 'm@x.com'), idx('VALE2', 'm@x.com'))));
});

// ---------- admins protegidos (dono da plataforma e quem criou o condomínio) ----------
async function comOutroAdmin() {
  await env.withSecurityRulesDisabled(async ctx => { const d = ctx.firestore();
    await setDoc(doc(d, 'condominios/VALE2/membros/adminC'), membro('adminC', 'admin', 'c@x.com'));
    await setDoc(doc(d, 'condominios/VALE2/membros/donoD'), membro('donoD', 'admin', EMAIL_DONO)); });
}
test('protegidos: outro admin NÃO tira o admin nem remove quem criou o condomínio', async () => {
  await comOutroAdmin(); const db = como('adminC', 'c@x.com');
  await assertFails(updateDoc(doc(db, 'condominios/VALE2/membros/adminA'), {papel: 'morador'}));
  await assertFails(deleteDoc(doc(db, 'condominios/VALE2/membros/adminA')));
  await assertFails(updateDoc(doc(db, 'condominios/VALE2/membros/adminA'), {email: 'outro@x.com'}));
});
test('protegidos: outro admin NÃO mexe no dono da plataforma', async () => {
  await comOutroAdmin(); const db = como('adminC', 'c@x.com');
  await assertFails(updateDoc(doc(db, 'condominios/VALE2/membros/donoD'), {papel: 'morador'}));
  await assertFails(deleteDoc(doc(db, 'condominios/VALE2/membros/donoD')));
});
test('protegidos: quem criou ainda tira admin e remove outros admins', async () => {
  await comOutroAdmin(); const db = como('adminA', 'a@x.com');
  await assertSucceeds(updateDoc(doc(db, 'condominios/VALE2/membros/adminC'), {papel: 'morador'}));
  await assertSucceeds(deleteDoc(doc(db, 'condominios/VALE2/membros/adminC')));
});
test('protegidos: o dono da plataforma pode tudo e cada um pode sair sozinho', async () => {
  await comOutroAdmin();
  await assertSucceeds(updateDoc(doc(como('donoD', EMAIL_DONO), 'condominios/VALE2/membros/adminA'), {papel: 'morador'}));
  await assertSucceeds(deleteDoc(doc(como('donoD', EMAIL_DONO), 'condominios/VALE2/membros/donoD')));
});
