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

const condoBase = (nome, publico, criadoPor) => ({nome, eventoNome: 'Halloween', data: '2026-10-31', horaInicio: '18:30', horaFim: '21:00', avisos: '', portaria: null, centro: {lat: -23.55, lng: -46.63}, zoom: 17, publico, criadoPor, criadoEm: agora, atualizadoEm: agora});
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
    await setDoc(doc(db, 'condominios/VALE2/casas/morM'), casaBase('morM'));
    await setDoc(doc(db, 'condominios/XUTR2'), condoBase('Outro', false, 'adminB'));
    await setDoc(doc(db, 'condominios/XUTR2/membros/adminB'), membro('adminB', 'admin', 'b@x.com'));
    await setDoc(doc(db, 'condominios/XUTR2/casas/x1'), casaBase('adminB'));
    await setDoc(doc(db, 'condominios/ABERT'), condoBase('Aberto', true, 'adminB'));
    await setDoc(doc(db, 'condominios/ABERT/casas/y1'), casaBase('adminB'));
  });
});

// ---------- visitante sem login ----------
test('visitante: lê dados básicos do condomínio pelo link', async () => { await assertSucceeds(getDoc(doc(visitante(), 'condominios/VALE2'))); });
test('visitante: NÃO lista todos os condomínios', async () => { await assertFails(getDocs(collection(visitante(), 'condominios'))); });
test('visitante: NÃO vê casas de condomínio fechado', async () => { await assertFails(getDocs(collection(visitante(), 'condominios/VALE2/casas'))); });
test('visitante: vê casas de condomínio público', async () => { await assertSucceeds(getDocs(collection(visitante(), 'condominios/ABERT/casas'))); });
test('visitante: NÃO grava casa nem em condomínio público', async () => { await assertFails(setDoc(doc(visitante(), 'condominios/ABERT/casas/z'), casaBase('z'))); });
test('visitante: NÃO lê convites nem membros', async () => {
  await assertFails(getDocs(collection(visitante(), 'condominios/VALE2/convites')));
  await assertFails(getDocs(collection(visitante(), 'condominios/VALE2/membros')));
});
test('visitante: NÃO acessa caminhos antigos ou desconhecidos', async () => {
  await assertFails(getDocs(collection(visitante(), 'casas')));
  await assertFails(setDoc(doc(visitante(), 'qualquer/coisa'), {a: 1}));
});

// ---------- estranho logado com Google ----------
test('estranho: NÃO vê casas de condomínio fechado', async () => { await assertFails(getDocs(collection(como('estr', 'e@x.com'), 'condominios/VALE2/casas'))); });
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
  await assertFails(getDocs(collection(db, 'condominios/VALE2/casas')));
  await assertFails(setDoc(doc(db, 'condominios/VALE2/casas/penP'), casaBase('penP')));
});
test('pendente: NÃO se aprova sozinho', async () => {
  await assertFails(updateDoc(doc(como('penP', 'p@x.com'), 'condominios/VALE2/membros/penP'), {papel: 'morador'}));
});
test('pendente: pode cancelar o próprio pedido', async () => {
  await assertSucceeds(deleteDoc(doc(como('penP', 'p@x.com'), 'condominios/VALE2/membros/penP')));
});

// ---------- morador ----------
test('morador: vê as casas do condomínio', async () => { await assertSucceeds(getDocs(collection(como('morM', 'm@x.com'), 'condominios/VALE2/casas'))); });
test('morador: edita a própria casa', async () => {
  await assertSucceeds(setDoc(doc(como('morM', 'm@x.com'), 'condominios/VALE2/casas/morM'), {...casaBase('morM'), obs: 'Nova obs'}));
});
test('morador: NÃO cria casa com id de outra pessoa', async () => {
  await assertFails(setDoc(doc(como('morM', 'm@x.com'), 'condominios/VALE2/casas/outra'), casaBase('morM')));
});
test('morador: NÃO passa a própria casa para outro dono', async () => {
  await assertFails(setDoc(doc(como('morM', 'm@x.com'), 'condominios/VALE2/casas/morM'), casaBase('adminA')));
});
test('morador: NÃO edita nem apaga casa alheia', async () => {
  await env.withSecurityRulesDisabled(ctx => setDoc(doc(ctx.firestore(), 'condominios/VALE2/casas/adminA'), casaBase('adminA')));
  const db = como('morM', 'm@x.com');
  await assertFails(setDoc(doc(db, 'condominios/VALE2/casas/adminA'), {...casaBase('adminA'), obs: 'hack'}));
  await assertFails(deleteDoc(doc(db, 'condominios/VALE2/casas/adminA')));
});
test('morador: dados inválidos são recusados', async () => {
  const db = como('morM', 'm@x.com'); const ref = doc(db, 'condominios/VALE2/casas/morM');
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
  await assertFails(getDocs(collection(como('morM', 'm@x.com'), 'condominios/XUTR2/casas')));
});

// ---------- login que não é Google ou e-mail não verificado ----------
test('login por senha (não Google) NÃO grava, mesmo sendo morador', async () => {
  const db = env.authenticatedContext('morM', {email: 'm@x.com', email_verified: true, firebase: {sign_in_provider: 'password'}}).firestore();
  await assertFails(setDoc(doc(db, 'condominios/VALE2/casas/morM'), casaBase('morM')));
});
test('login anônimo NÃO grava', async () => {
  const db = env.authenticatedContext('morM', {firebase: {sign_in_provider: 'anonymous'}}).firestore();
  await assertFails(setDoc(doc(db, 'condominios/VALE2/casas/morM'), casaBase('morM')));
});
test('e-mail não verificado NÃO grava', async () => {
  await assertFails(setDoc(doc(como('morM', 'm@x.com', {email_verified: false}), 'condominios/VALE2/casas/morM'), casaBase('morM')));
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
  await assertSucceeds(setDoc(doc(db, 'condominios/VALE2/casas/morM'), {...casaBase('morM'), obs: 'corrigido'}));
  await assertSucceeds(deleteDoc(doc(db, 'condominios/VALE2/casas/morM')));
});
test('admin de um condomínio NÃO mexe em outro', async () => {
  const db = como('adminA', 'a@x.com');
  await assertFails(getDocs(collection(db, 'condominios/XUTR2/casas')));
  await assertFails(setDoc(doc(db, 'condominios/XUTR2/casas/x1'), {...casaBase('adminB'), obs: 'hack'}));
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
  b.set(doc(db, 'condominios/MGR22/casas/morM'), casaBase('morM'));
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
