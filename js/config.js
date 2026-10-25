// Configuração do app. Tudo aqui é público (vai para o navegador), então não coloque segredos de verdade.
export default {
  // Nome que aparece no topo. A última palavra ganha destaque laranja.
  nomeApp: 'Rota Assombrada',

  // PIN para abrir a área do organizador (evento, portaria, editar/excluir casas).
  pinOrganizador: '3110',

  // Centro inicial do mapa [latitude, longitude] e zoom. Troque pelo seu condomínio.
  // Dica: abra o Google Maps, clique com o botão direito no condomínio e copie as coordenadas.
  centro: [-23.5505, -46.6333],
  zoom: 17,

  // Firebase (plano Spark, gratuito). Deixe `null` para rodar em modo local (dados só neste aparelho).
  // Para ligar: console.firebase.google.com → criar projeto → Firestore (modo produção) → Authentication → Anônimo →
  // Configurações do projeto → "Seus apps" → Web → copie o objeto firebaseConfig e cole aqui.
  firebase: null,
  // firebase: {
  //   apiKey: '...',
  //   authDomain: 'seu-projeto.firebaseapp.com',
  //   projectId: 'seu-projeto',
  //   storageBucket: 'seu-projeto.appspot.com',
  //   messagingSenderId: '...',
  //   appId: '...'
  // },

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
