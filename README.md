# Rota Assombrada

Mapa das casas participantes do Halloween de condomínios, com cadastro pelos moradores, roteiro otimizado e guia por voz. Site: <https://rota-assombrada.github.io>

Tudo gratuito: GitHub Pages (site), Firebase Auth com Google e Firestore no plano Spark (login e dados), OpenStreetMap + Leaflet (mapa) e o app de mapas do próprio celular (navegação).

## Como funciona

- Cada condomínio tem um link próprio: `https://rota-assombrada.github.io/#codigo-do-condominio`.
- **Mapa**: pins de abóbora nas casas, filtros, posição pelo GPS, camadas Noite / Ruas / Satélite.
- **Participar**: o morador entra com Google, marca a casa (GPS na porta ou toque no mapa) e diz o que oferece.
- **Roteiro** (embaixo do mapa): ordem mais curta andando pelas ruas, linha seguindo as ruas, próxima curva na tela e na voz, botão Navegar (Apple Maps, Google Maps, Waze) e aviso de chegada pelo GPS. As rotas a pé vêm do roteador gratuito do OpenStreetMap mantido pela FOSSGIS (`routing.openstreetmap.de`); ele recebe só coordenadas, nunca nomes. Se não responder, o app usa linha reta.
- **Admin**: link do condomínio, convites, aprovação de pedidos, papéis, evento, portaria, privacidade e casas.

## Arquitetura

Não existe servidor próprio. O site é só arquivos estáticos no GitHub Pages; o backend é o Firebase:

1. **Login (Firebase Auth + Google)**: o Google confere quem é a pessoa e o Firebase entrega ao navegador um token assinado com `uid`, e-mail e se o e-mail é verificado. Ninguém consegue forjar esse token.
2. **Banco (Firestore)**: guarda condomínios, membros, convites e casas.
3. **Autorização (`firestore.rules`)**: roda nos servidores do Google a cada leitura e gravação, olhando o token e os dados. É aqui que a segurança vale; o código do navegador é público e pode ser alterado à vontade sem ganhar acesso a nada.

```
condominios/{codigo}                 nome, evento, centro do mapa, portaria, público ou fechado
condominios/{codigo}/membros/{uid}   papel: admin | morador | pendente
condominios/{codigo}/convites/{cod}  convite de morador, com validade
condominios/{codigo}/casas/{id}      casas (a do morador tem o id da conta dele)
```

## Papéis

| Papel | Pode |
|---|---|
| Visitante | Ver o mapa só se o condomínio for público |
| Pendente | Pediu para entrar; espera aprovação |
| Morador | Ver o mapa e cadastrar/editar só a própria casa |
| Admin do condomínio | Tudo naquele condomínio: evento, convites, aprovar, promover, editar qualquer casa |
| Dono da plataforma | Criar condomínios; é admin de todos |

O dono da plataforma é reconhecido pelo **hash SHA-256 do e-mail Google**, listado em `firestore.rules` (vale de verdade) e em `js/config.js` (só para a tela). O e-mail em si não é publicado. Para gerar o hash:

```bash
echo -n "email@exemplo.com" | shasum -a 256
```

Admins de cada condomínio são definidos no próprio app, pela aba Admin, sem mexer em código.

## Segurança

- Gravar exige login com Google e e-mail verificado. Login anônimo ou por senha é recusado.
- Entrar como morador só com convite válido (ativo e no prazo); sem convite, o pedido fica pendente.
- Ninguém se promove: só admin muda papéis. Convites só criam moradores.
- Um condomínio não enxerga nem altera outro.
- Todo campo é validado no servidor: lista de campos permitidos, tipos, tamanhos e valores.
- No navegador, textos de usuários são escapados antes de ir para a tela, e há Content-Security-Policy limitando de onde vêm scripts e conexões.
- Testes automáticos das regras em [`testes/regras.test.mjs`](testes/regras.test.mjs) simulam cada papel tentando o que não pode.

Rodar os testes (precisa de Java):

```bash
cd testes && npm install && npm test
```

Publicar mudanças nas regras:

```bash
firebase deploy --only firestore:rules
```

## Configuração do Firebase (uma vez)

1. Authentication → Sign-in method → **Google** → Ativar.
2. Authentication → Settings → **Authorized domains** → adicionar `rota-assombrada.github.io`.
3. Firestore e regras já são publicados com `firebase deploy --only firestore:rules`.

## Rodar local

```bash
python3 -m http.server 8080
```

Abra `http://localhost:8080`. O GPS e o login funcionam em `localhost`.
