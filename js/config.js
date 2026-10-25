// Configuração do app. Tudo aqui é público (vai para o navegador), então não coloque segredos de verdade.
export default {
  // Nome que aparece no topo. A última palavra ganha destaque laranja.
  nomeApp: 'Rota Assombrada',

  // Donos da plataforma (criam condomínios): hash SHA-256 do e-mail Google em minúsculas, para o e-mail não ficar público.
  // Gere com: echo -n "email@exemplo.com" | shasum -a 256
  // A MESMA lista precisa estar em firestore.rules; esta aqui só decide o que aparece na tela.
  donosPlataforma: [
    'edc3e60dc481e945b137c839efaaf90135694890fc8967d6f013274d3c6a4dee'
  ],

  // Centro inicial do mapa [latitude, longitude] e zoom. Troque pelo seu condomínio.
  // Dica: abra o Google Maps, clique com o botão direito no condomínio e copie as coordenadas.
  centro: [-23.5505, -46.6333],
  zoom: 17,

  // Firebase (plano Spark, gratuito). Deixe `null` para rodar em modo local (dados só neste aparelho).
  // Esta chave é pública por natureza: quem protege os dados são as regras em firestore.rules.
  firebase: {
    apiKey: 'AIzaSyAKqra-wIMUB2ZxagKSg7I59m87cO7zVUA',
    authDomain: 'rota-assombrada.firebaseapp.com',
    projectId: 'rota-assombrada',
    storageBucket: 'rota-assombrada.firebasestorage.app',
    messagingSenderId: '990414708349',
    appId: '1:990414708349:web:990aa8e58be7c28e011b14',
    measurementId: 'G-V1JJFJ5VED'
  },

  // Contagem anônima de telas, ações e erros pelo Google Analytics do Firebase (grátis). false desliga.
  analytics: true,

  // App Check com reCAPTCHA v3 (gratuito): prova que o pedido veio deste site, e não de um robô.
  // É a "chave do site" do reCAPTCHA, pública por natureza. Vazio = App Check desligado.
  appCheckSiteKey: '',

  // Valores iniciais do evento (o organizador pode mudar pelo app).
  evento: {
    nome: 'Halloween do Condomínio',
    data: '2026-10-31',
    horaInicio: '18:30',
    horaFim: '21:00',
    whatsapp: '',
    avisos: ''
  }
};
