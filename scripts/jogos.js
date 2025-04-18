// Importa a chave da API de um arquivo separado para uso nas requisições
import apiKey from "./rapid-api-key.js"; // Importa a chave da API do arquivo rapidApiKey.js

// Obtém os elementos do DOM onde os dados dos jogos serão exibidos
const scoresDiv = document.getElementById("scores");
const loadingDiv = document.getElementById("loading");
const displayDate = document.getElementById("title-dia");
const displayTomorrow = document.getElementById("title-amanha");
const tomorrowScoresDiv = document.getElementById("scores-amanha"); // Contêiner para jogos de amanhã

// Função para formatar a data no formato YYYYMMDD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Meses são 0-indexados
  const day = String(date.getDate()).padStart(2, "0"); // Garante que o dia tenha 2 dígitos
  return `${year}${month}${day}`; // Retorna a data formatada
}

// Função para converter o horário do jogo para o formato brasileiro
function convertToBrazilTime(gameTime) {
  // Verifica se gameTime é uma string válida
  if (!gameTime || typeof gameTime !== "string") {
    return "Horário não disponível"; // Retorna um valor padrão se gameTime não for válido
  }

  gameTime = gameTime.trim().toLowerCase(); // Converte para minúsculas e remove espaços em branco

  const regex = /^(\d{1,2}):(\d{2})(p)$/; // Aceita apenas 'p'
  const match = gameTime.match(regex);

  if (!match) {
    throw new Error("Formato inválido. Use 'hh:mm p'.");
  }

  let hours = parseInt(match[1]);
  const minutes = match[2];

  if (hours < 12) {
    hours += 12; // Converte para 24 horas
  }

  hours = (hours + 1) % 24; // Adiciona 1 hora e evita overflow (24:00)
  const newHours = hours % 12 === 0 ? 12 : hours % 12;

  return `${newHours}:${minutes}pm`; // Saída sempre termina com 'pm'
}

// Função assíncrona para buscar os placares da NBA
async function fetchNBAScores() {
  const today = new Date(); // Obtém a data atual
  const gameDate = formatDate(today); // Formata a data

  // Valida se a data está correta
  if (!gameDate || typeof gameDate !== "string") {
    console.error("Erro: `gameDate` está em um formato inválido.", gameDate);
    return; // Sai da função se a data for inválida
  }

  // URL da API com a data dos jogos
  const url = `https://tank01-fantasy-stats.p.rapidapi.com/getNBAScoresOnly?gameDate=${gameDate}&topPerformers=true&lineups=true`;
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-host": "tank01-fantasy-stats.p.rapidapi.com",
      "x-rapidapi-key": `${apiKey}`, // Adiciona a chave da API nos headers
    },
  };

  try {
    const response = await fetch(url, options); // Realiza a requisição
    const data = await response.json(); // Converte a resposta para JSON
    loadingDiv.style.display = "none"; // Esconde o elemento de carregamento
    displayDate.innerHTML = `Jogos do dia ${today.toLocaleDateString()}`; // Exibe a data dos jogos

    // Chama a função para exibir os placares
    displayScores(data.body, scoresDiv);
    fetchNBASchedule(); // Chama a função para buscar jogos de amanhã
  } catch (error) {
    // Exibe mensagem de erro se a requisição falhar
    scoresDiv.innerHTML =
      "<p>Erro ao carregar os dados. Tente novamente mais tarde.</p>";
    console.error("Erro:", error);
  }
}

// Função assíncrona para buscar a programação dos jogos de amanhã
async function fetchNBASchedule() {
  const tomorrow = new Date(); // Obtém a data atual
  tomorrow.setDate(tomorrow.getDate() + 1); // Avança para o dia seguinte
  const tomorrowDate = formatDate(tomorrow); // Formata a data de amanhã
  displayTomorrow.innerHTML = `Jogos do dia ${tomorrow.toLocaleDateString()}`; // Exibe a data de amanhã

  // URL da API para buscar a programação dos jogos de amanhã
  const url = `https://tank01-fantasy-stats.p.rapidapi.com/getNBAGamesForDate?gameDate=${tomorrowDate}`;
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-host": "tank01-fantasy-stats.p.rapidapi.com",
      "x-rapidapi-key": `${apiKey}`, // Adiciona a chave da API nos headers
    },
  };

  try {
    const response = await fetch(url, options); // Realiza a requisição
    const data = await response.json(); // Converte a resposta para JSON
    displayScores(data.body, tomorrowScoresDiv); // Exibe os jogos de amanhã
  } catch (error) {
    // Exibe mensagem de erro se a requisição falhar
    tomorrowScoresDiv.innerHTML =
      "<p>Erro ao carregar a programação para amanhã. Tente novamente mais tarde.</p>";
    console.error("Erro ao carregar a programação:", error);
  }
}

// Função para exibir os placares dos jogos
function displayScores(games, container) {
  // Verifica se existem jogos
  if (!games || Object.keys(games).length === 0) {
    container.innerHTML = "<p>Nenhum jogo encontrado para esta data.</p>"; // Mensagem caso não haja jogos
    return; // Sai da função
  }

  // Busca os logotipos dos times a partir de um arquivo JSON
  fetch(`./scripts/times.json`)
    .then((response) => response.json()) // Converte a resposta para JSON
    .then((data) => {
      const teamsLogos = {}; // Objeto para armazenar os logotipos dos times
      const teamColors = {}; // Objeto para armazenar as cores dos times
      data.forEach((team) => {
        teamsLogos[team.Key] = team.WikipediaLogoUrl; // Armazena o logotipo do time
        if (team.PrimaryColor) {
          teamColors[team.Key] = `#${team.PrimaryColor}`; // Armazena a cor primária do time
        }
      });

      // Itera sobre cada jogo encontrado
      for (const gameID in games) {
        const game = games[gameID]; // Obtém os dados do jogo
        const gameDiv = document.createElement("div"); // Cria um novo elemento para o jogo
        gameDiv.classList.add("game"); // Adiciona a classe "game" ao elemento

        // Obtém informações dos times e pontos
        const homeTeam = game.home || "Desconhecido"; // Time da casa
        const awayTeam = game.away || "Desconhecido"; // Time visitante
        const homePts = game.homePts || "0"; // Pontos do time da casa
        const awayPts = game.awayPts || "0"; // Pontos do time visitante
        const status = game.gameStatus || "Não Iniciado"; // Status do jogo
        const time = convertToBrazilTime(game.gameTime); // Converte o horário do jogo

        // Define a cor do status do jogo
        let statusColor = "#ffffff"; // Cor padrão
        switch (status) {
          case "Aguardando Início":
            statusColor = "#ffffff"; // Cor para "Aguardando Início"
            break;
          case "Live - In Progress":
            statusColor = "#ff0000"; // Cor para "Live - In Progress"
            break;
          case "Finalizado":
            statusColor = "#00ff00"; // Cor para "Finalizado"
            break;
        }

        // Monta a estrutura HTML do jogo
        gameDiv.innerHTML = `
        <div class="score">
          <div class="team-container">
            <div class="detail">
              <img src="${teamsLogos[awayTeam]}" alt="${awayTeam}" class="team-logo"> <!-- Logotipo do time visitante -->
              <span class="team-name">${awayTeam}</span> <!-- Nome do time visitante -->
            </div>
            <span class="points">${awayPts}</span> <!-- Pontos do time visitante -->
            <div style="display:flex;justify-content:center;align-items:center;flex-direction:column; gap:2vh;">
              <span style="font-size: .5vw;">${time}</span> <!-- Horário formatado -->
              <span style="font-size: 1.8vw;">VS</span> <!-- Versus -->
            </div>
            <span class="points">${homePts}</span> <!-- Pontos do time da casa -->

            <div class="detail">
              <img src="${teamsLogos[homeTeam]}" alt="${homeTeam}" class="team-logo"> <!-- Logotipo do time da casa -->
              <span class="team-name">${homeTeam}</span> <!-- Nome do time da casa -->
            </div>
          </div>
          <div class="status-container">
            <span style="color: ${statusColor}; font-weight: bold;">${status}</span> <!-- Status do jogo -->
          </div>
        </div>`;

        // Adiciona o elemento do jogo ao contêiner
        container.appendChild(gameDiv);

        const primaryColorHome = teamColors[homeTeam]; // Cor primária do time da casa
        const primaryColorAway = teamColors[awayTeam]; // Cor primária do time visitante

        // Adiciona efeito de mouse sobre o jogo
        gameDiv.addEventListener("mouseover", function () {
          gameDiv.style.cursor = "pointer"; // Muda o cursor ao passar o mouse
          // Aplica um gradiente de fundo baseado nas cores dos times
          gameDiv.style.backgroundImage = `linear-gradient(90deg, rgba(${hexToRgb(
            primaryColorAway || "#575757"
          )}, 0.6), rgba(${hexToRgb(primaryColorHome || "#575757")}, 0.6))`;
          gameDiv.style.color = "#fff"; // Altera a cor do texto
          gameDiv.style.transition =
            "background-image 1s ease-in, color 1s ease-in"; // Efeito de transição suave
        });

        // Remove o efeito ao sair com o mouse
        gameDiv.addEventListener("mouseleave", function () {
          gameDiv.style.backgroundImage = ""; // Remove o gradiente de fundo
          gameDiv.style.color = ""; // Restaura a cor do texto
        });
      }
    })
    .catch((error) => {
      console.error("Erro ao buscar logotipos dos times:", error); // Mensagem de erro se falhar
    });
}

// Função para converter cor hexadecimal em RGB
function hexToRgb(hex) {
  let r = 0,
    g = 0,
    b = 0;

  // Remove o símbolo '#' se presente
  hex = hex.replace(/^#/, "");

  // Converte para RGB
  if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16); // Obtém o valor vermelho
    g = parseInt(hex.substring(2, 4), 16); // Obtém o valor verde
    b = parseInt(hex.substring(4, 6), 16); // Obtém o valor azul
  }

  return [r, g, b]; // Retorna o valor RGB
}

// Chama a função para buscar os placares da NBA ao carregar a página
fetchNBAScores();
