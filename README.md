# Rota Assombrada

Mapa das casas participantes do Halloween do condomínio, com cadastro pelos moradores, roteiro otimizado e guia por voz. Tudo gratuito: GitHub Pages (site), Firebase Firestore no plano Spark (dados), OpenStreetMap + Leaflet (mapa) e o app de mapas do próprio celular (navegação).

## Como funciona

- **Mapa**: pins de abóbora nas casas, filtros, sua posição pelo GPS, camadas Noite / Ruas / Satélite.
- **Participar**: o morador marca a casa (GPS na porta ou toque no mapa), diz o que oferece e salva. Quem cadastrou pode editar.
- **Roteiro**: ordem mais curta a partir de onde você está (ou da portaria), lista com check de visitadas, botão **Navegar** que abre Apple Maps / Google Maps / Waze a pé, e guia por voz que avisa distância e chegada.
- **Organizar**: protegido por PIN. Edita o evento, marca a portaria, edita/exclui qualquer casa, exporta/importa backup.

## Publicar no GitHub Pages (grátis)

1. Crie um repositório no GitHub e envie estes arquivos (ou use o repositório já criado).
2. Em **Settings → Pages**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`.
3. O site fica em `https://brunotcouto.github.io/rota-assombrada/`.

O GPS só funciona em `https://`, e o GitHub Pages já entrega isso.

## Ligar o Firebase (grátis, ~5 minutos)

Sem isso o app funciona em **modo local** (cada celular vê só o que cadastrou). Com o Firebase, todo mundo vê as mesmas casas em tempo real.

1. Acesse <https://console.firebase.google.com> e clique em **Adicionar projeto** (pode desligar o Analytics).
2. **Build → Firestore Database → Criar banco de dados** → modo de produção → região `southamerica-east1` (São Paulo).
3. Na aba **Regras** do Firestore, cole o conteúdo de [`firestore.rules`](firestore.rules) e publique.
4. **Build → Authentication → Começar → Anônimo → Ativar**.
5. **Configurações do projeto (engrenagem) → Seus apps → ícone Web `</>`** → registre o app (sem Hosting) e copie o objeto `firebaseConfig`.
6. Cole o objeto em [`js/config.js`](js/config.js) no campo `firebase`, ajuste `centro` (coordenadas do condomínio), `pinOrganizador` e `nomeApp`, e envie para o GitHub.
7. Em **Authentication → Settings → Domínios autorizados**, adicione `brunotcouto.github.io`.

Limites do plano gratuito (50 mil leituras e 20 mil gravações por dia) são mais do que suficientes para um condomínio inteiro na noite do evento.

## Rodar local

Qualquer servidor estático serve, por exemplo:

```bash
python3 -m http.server 8080
```

Abra `http://localhost:8080`. O GPS funciona em `localhost` mesmo sem https.

## Estrutura

```
index.html        marcação da página
css/estilo.css    tema e animações
js/app.js         mapa, GPS, roteiro, voz, música e dados
js/config.js      nome, PIN, centro do mapa e configuração do Firebase
firestore.rules   regras de segurança do Firestore
```
