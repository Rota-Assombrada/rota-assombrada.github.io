// Testes das regras de segurança do Firestore, rodando no emulador local.
// Cada teste simula uma pessoa (visitante, estranho, pendente, morador, admin, dono) tentando ler ou gravar.
// Rodar: cd testes && npm test
import {test, before, after, beforeEach} from 'node:test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {initializeTestEnvironment, assertSucceeds, assertFails} from '@firebase/rules-unit-testing';
import {doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs} from 'firebase/firestore';

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

const condoBase = (nome, publico, criadoPor) => ({nome, eventoNome: 'Halloween', data: '2026-10-31', horaInicio: '18:30', horaFim: '21:00', whatsapp: '', avisos: '', portaria: null, centro: {lat: -23.55, lng: -46.63}, zoom: 17, publico, criadoPor, criadoEm: agora, atualizadoEm: agora});
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
    await setDoc(doc(db, 'condominios/vale'), condoBase('Vale', false, 'adminA'));
    await setDoc(doc(db, 'condominios/vale/membros/adminA'), membro('adminA', 'admin', 'a@x.com'));
    await setDoc(doc(db, 'condominios/vale/membros/morM'), membro('morM', 'morador', 'm@x.com'));
    await setDoc(doc(db, 'condominios/vale/membros/penP'), membro('penP', 'pendente', 'p@x.com'));
    await setDoc(doc(db, 'condominios/vale/convites/CONVITEVALIDO1'), {papel: 'morador', ativo: true, expiraEm: agora + 864e5, criadoPor: 'adminA', criadoEm: agora});
    await setDoc(doc(db, 'condominios/vale/convites/CONVITEVELHO01'), {papel: 'morador', ativo: true, expiraEm: agora - 1000, criadoPor: 'adminA', criadoEm: agora});
    await setDoc(doc(db, 'condominios/vale/convites/CONVITEOFF0001'), {papel: 'morador', ativo: false, expiraEm: agora + 864e5, criadoPor: 'adminA', criadoEm: agora});
    await setDoc(doc(db, 'condominios/vale/casas/morM'), casaBase('morM'));
    await setDoc(doc(db, 'condominios/outro'), condoBase('Outro', false, 'adminB'));
    await setDoc(doc(db, 'condominios/outro/membros/adminB'), membro('adminB', 'admin', 'b@x.com'));
    await setDoc(doc(db, 'condominios/outro/casas/x1'), casaBase('adminB'));
    await setDoc(doc(db, 'condominios/aberto'), condoBase('Aberto', true, 'adminB'));
    await setDoc(doc(db, 'condominios/aberto/casas/y1'), casaBase('adminB'));
  });
});

// ---------- visitante sem login ----------
test('visitante: lê dados básicos do condomínio pelo link', async () => { await assertSucceeds(getDoc(doc(visitante(), 'condominios/vale'))); });
test('visitante: NÃO lista todos os condomínios', async () => { await assertFails(getDocs(collection(visitante(), 'condominios'))); });
test('visitante: NÃO vê casas de condomínio fechado', async () => { await assertFails(getDocs(collection(visitante(), 'condominios/vale/casas'))); });
test('visitante: vê casas de condomínio público', async () => { await assertSucceeds(getDocs(collection(visitante(), 'condominios/aberto/casas'))); });
test('visitante: NÃO grava casa nem em condomínio público', async () => { await assertFails(setDoc(doc(visitante(), 'condominios/aberto/casas/z'), casaBase('z'))); });
test('visitante: NÃO lê convites nem membros', async () => {
  await assertFails(getDocs(collection(visitante(), 'condominios/vale/convites')));
  await assertFails(getDocs(collection(visitante(), 'condominios/vale/membros')));
});
test('visitante: NÃO acessa caminhos antigos ou desconhecidos', async () => {
  await assertFails(getDocs(collection(visitante(), 'casas')));
  await assertFails(setDoc(doc(visitante(), 'qualquer/coisa'), {a: 1}));
});

// ---------- estranho logado com Google ----------
test('estranho: NÃO vê casas de condomínio fechado', async () => { await assertFails(getDocs(collection(como('estr', 'e@x.com'), 'condominios/vale/casas'))); });
test('estranho: pode pedir acesso (pendente)', async () => {
  await assertSucceeds(setDoc(doc(como('estr', 'e@x.com'), 'condominios/vale/membros/estr'), membro('estr', 'pendente', 'e@x.com')));
});
test('estranho: NÃO entra como morador sem convite', async () => {
  await assertFails(setDoc(doc(como('estr', 'e@x.com'), 'condominios/vale/membros/estr'), membro('estr', 'morador', 'e@x.com')));
});
test('estranho: NÃO entra com convite inventado, expirado ou desativado', async () => {
  const db = como('estr', 'e@x.com');
  await assertFails(setDoc(doc(db, 'condominios/vale/membros/estr'), membro('estr', 'morador', 'e@x.com', 'INVENTADO0001')));
  await assertFails(setDoc(doc(db, 'condominios/vale/membros/estr'), membro('estr', 'morador', 'e@x.com', 'CONVITEVELHO01')));
  await assertFails(setDoc(doc(db, 'condominios/vale/membros/estr'), membro('estr', 'morador', 'e@x.com', 'CONVITEOFF0001')));
});
test('estranho: entra como morador com convite válido', async () => {
  await assertSucceeds(setDoc(doc(como('estr', 'e@x.com'), 'condominios/vale/membros/estr'), membro('estr', 'morador', 'e@x.com', 'CONVITEVALIDO1')));
});
test('estranho: NÃO se coloca como admin, nem com convite', async () => {
  await assertFails(setDoc(doc(como('estr', 'e@x.com'), 'condominios/vale/membros/estr'), membro('estr', 'admin', 'e@x.com', 'CONVITEVALIDO1')));
});
test('estranho: NÃO cria membro em nome de outra pessoa', async () => {
  await assertFails(setDoc(doc(como('estr', 'e@x.com'), 'condominios/vale/membros/fulano'), membro('fulano', 'pendente', 'e@x.com')));
});
test('estranho: NÃO usa e-mail diferente do login', async () => {
  await assertFails(setDoc(doc(como('estr', 'e@x.com'), 'condominios/vale/membros/estr'), membro('estr', 'pendente', 'outro@x.com')));
});
test('estranho: NÃO pede acesso a condomínio que não existe', async () => {
  await assertFails(setDoc(doc(como('estr', 'e@x.com'), 'condominios/fantasma/membros/estr'), membro('estr', 'pendente', 'e@x.com')));
});
test('estranho: NÃO cria condomínio', async () => {
  await assertFails(setDoc(doc(como('estr', 'e@x.com'), 'condominios/novo'), condoBase('Novo', false, 'estr')));
});

// ---------- pendente ----------
test('pendente: NÃO vê casas nem cadastra casa', async () => {
  const db = como('penP', 'p@x.com');
  await assertFails(getDocs(collection(db, 'condominios/vale/casas')));
  await assertFails(setDoc(doc(db, 'condominios/vale/casas/penP'), casaBase('penP')));
});
test('pendente: NÃO se aprova sozinho', async () => {
  await assertFails(updateDoc(doc(como('penP', 'p@x.com'), 'condominios/vale/membros/penP'), {papel: 'morador'}));
});
test('pendente: pode cancelar o próprio pedido', async () => {
  await assertSucceeds(deleteDoc(doc(como('penP', 'p@x.com'), 'condominios/vale/membros/penP')));
});

// ---------- morador ----------
test('morador: vê as casas do condomínio', async () => { await assertSucceeds(getDocs(collection(como('morM', 'm@x.com'), 'condominios/vale/casas'))); });
test('morador: edita a própria casa', async () => {
  await assertSucceeds(setDoc(doc(como('morM', 'm@x.com'), 'condominios/vale/casas/morM'), {...casaBase('morM'), obs: 'Nova obs'}));
});
test('morador: NÃO cria casa com id de outra pessoa', async () => {
  await assertFails(setDoc(doc(como('morM', 'm@x.com'), 'condominios/vale/casas/outra'), casaBase('morM')));
});
test('morador: NÃO passa a própria casa para outro dono', async () => {
  await assertFails(setDoc(doc(como('morM', 'm@x.com'), 'condominios/vale/casas/morM'), casaBase('adminA')));
});
test('morador: NÃO edita nem apaga casa alheia', async () => {
  await env.withSecurityRulesDisabled(ctx => setDoc(doc(ctx.firestore(), 'condominios/vale/casas/adminA'), casaBase('adminA')));
  const db = como('morM', 'm@x.com');
  await assertFails(setDoc(doc(db, 'condominios/vale/casas/adminA'), {...casaBase('adminA'), obs: 'hack'}));
  await assertFails(deleteDoc(doc(db, 'condominios/vale/casas/adminA')));
});
test('morador: dados inválidos são recusados', async () => {
  const db = como('morM', 'm@x.com'); const ref = doc(db, 'condominios/vale/casas/morM');
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
  await assertFails(getDocs(collection(db, 'condominios/vale/membros')));
  await assertFails(setDoc(doc(db, 'condominios/vale/convites/MEUCONVITE01'), {papel: 'morador', ativo: true, expiraEm: agora + 1e9, criadoPor: 'morM', criadoEm: agora}));
  await assertFails(setDoc(doc(db, 'condominios/vale'), {publico: true}, {merge: true}));
});
test('morador: NÃO se promove a admin', async () => {
  await assertFails(updateDoc(doc(como('morM', 'm@x.com'), 'condominios/vale/membros/morM'), {papel: 'admin'}));
});
test('morador: lê o próprio cadastro de membro', async () => {
  await assertSucceeds(getDoc(doc(como('morM', 'm@x.com'), 'condominios/vale/membros/morM')));
});
test('morador: NÃO lê o cadastro de outro membro', async () => {
  await assertFails(getDoc(doc(como('morM', 'm@x.com'), 'condominios/vale/membros/adminA')));
});
test('morador de um condomínio NÃO vê casas de outro', async () => {
  await assertFails(getDocs(collection(como('morM', 'm@x.com'), 'condominios/outro/casas')));
});

// ---------- login que não é Google ou e-mail não verificado ----------
test('login por senha (não Google) NÃO grava, mesmo sendo morador', async () => {
  const db = env.authenticatedContext('morM', {email: 'm@x.com', email_verified: true, firebase: {sign_in_provider: 'password'}}).firestore();
  await assertFails(setDoc(doc(db, 'condominios/vale/casas/morM'), casaBase('morM')));
});
test('login anônimo NÃO grava', async () => {
  const db = env.authenticatedContext('morM', {firebase: {sign_in_provider: 'anonymous'}}).firestore();
  await assertFails(setDoc(doc(db, 'condominios/vale/casas/morM'), casaBase('morM')));
});
test('e-mail não verificado NÃO grava', async () => {
  await assertFails(setDoc(doc(como('morM', 'm@x.com', {email_verified: false}), 'condominios/vale/casas/morM'), casaBase('morM')));
});

// ---------- admin do condomínio ----------
test('admin: lista membros e aprova pendente', async () => {
  const db = como('adminA', 'a@x.com');
  await assertSucceeds(getDocs(collection(db, 'condominios/vale/membros')));
  await assertSucceeds(updateDoc(doc(db, 'condominios/vale/membros/penP'), {papel: 'morador', atualizadoEm: agora}));
});
test('admin: NÃO dá papel inventado', async () => {
  await assertFails(updateDoc(doc(como('adminA', 'a@x.com'), 'condominios/vale/membros/morM'), {papel: 'superadmin'}));
});
test('admin: cria e desativa convite', async () => {
  const db = como('adminA', 'a@x.com');
  await assertSucceeds(setDoc(doc(db, 'condominios/vale/convites/NOVOCONVITE1'), {papel: 'morador', ativo: true, expiraEm: agora + 864e5, criadoPor: 'adminA', criadoEm: agora}));
  await assertSucceeds(updateDoc(doc(db, 'condominios/vale/convites/NOVOCONVITE1'), {ativo: false}));
});
test('admin: NÃO cria convite que dá papel de admin', async () => {
  await assertFails(setDoc(doc(como('adminA', 'a@x.com'), 'condominios/vale/convites/CONVITEADM01'), {papel: 'admin', ativo: true, expiraEm: agora + 864e5, criadoPor: 'adminA', criadoEm: agora}));
});
test('admin: edita o evento e torna o mapa público', async () => {
  await assertSucceeds(setDoc(doc(como('adminA', 'a@x.com'), 'condominios/vale'), {avisos: 'Levem lanterna', publico: true, atualizadoEm: agora}, {merge: true}));
});
test('admin: NÃO troca quem criou o condomínio nem adiciona campos', async () => {
  const db = como('adminA', 'a@x.com');
  await assertFails(setDoc(doc(db, 'condominios/vale'), {criadoPor: 'adminA2'}, {merge: true}));
  await assertFails(setDoc(doc(db, 'condominios/vale'), {segredo: 'x'}, {merge: true}));
});
test('admin: edita e exclui casa de morador', async () => {
  const db = como('adminA', 'a@x.com');
  await assertSucceeds(setDoc(doc(db, 'condominios/vale/casas/morM'), {...casaBase('morM'), obs: 'corrigido'}));
  await assertSucceeds(deleteDoc(doc(db, 'condominios/vale/casas/morM')));
});
test('admin de um condomínio NÃO mexe em outro', async () => {
  const db = como('adminA', 'a@x.com');
  await assertFails(getDocs(collection(db, 'condominios/outro/casas')));
  await assertFails(setDoc(doc(db, 'condominios/outro/casas/x1'), {...casaBase('adminB'), obs: 'hack'}));
  await assertFails(setDoc(doc(db, 'condominios/outro'), {publico: true}, {merge: true}));
  await assertFails(setDoc(doc(db, 'condominios/outro/membros/adminA'), membro('adminA', 'admin', 'a@x.com')));
});
test('admin: NÃO cria nem apaga condomínio', async () => {
  const db = como('adminA', 'a@x.com');
  await assertFails(setDoc(doc(db, 'condominios/meu-novo'), condoBase('Meu', false, 'adminA')));
  await assertFails(deleteDoc(doc(db, 'condominios/vale')));
});

// ---------- dono da plataforma ----------
test('dono: cria condomínio e vira admin dele', async () => {
  const db = como('dono', EMAIL_DONO);
  await assertSucceeds(setDoc(doc(db, 'condominios/novo-condo'), condoBase('Novo', false, 'dono')));
  await assertSucceeds(setDoc(doc(db, 'condominios/novo-condo/membros/dono'), membro('dono', 'admin', EMAIL_DONO)));
});
test('dono: e-mail em maiúsculas também é reconhecido', async () => {
  await assertSucceeds(setDoc(doc(como('dono', EMAIL_DONO.toUpperCase()), 'condominios/novo2'), condoBase('Novo2', false, 'dono')));
});
test('dono: lista todos os condomínios', async () => { await assertSucceeds(getDocs(collection(como('dono', EMAIL_DONO), 'condominios'))); });
test('dono: NÃO cria condomínio com código inválido', async () => {
  await assertFails(setDoc(doc(como('dono', EMAIL_DONO), 'condominios/Código Inválido'), condoBase('X', false, 'dono')));
});
test('dono: NÃO cria condomínio em nome de outra pessoa', async () => {
  await assertFails(setDoc(doc(como('dono', EMAIL_DONO), 'condominios/novo3'), condoBase('Novo3', false, 'alguem')));
});
test('e-mail parecido com o do dono NÃO vira dono', async () => {
  await assertFails(setDoc(doc(como('falso', 'dono@teste.dev.evil.com'), 'condominios/falso'), condoBase('Falso', false, 'falso')));
});
