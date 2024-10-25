import apiKey from "../scripts/rapid-api-key.js";
const scoresDiv = document.getElementById("scores");
const loadingDiv = document.getElementById("loading");
const displayDate = document.getElementById("title-dia");
const displayTomorrow = document.getElementById("title-amanha");
const tomorrowScoresDiv = document.getElementById("scores-amanha"); // Contêiner para jogos de amanhã

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

async function fetchNBAScores() {
  const today = new Date();
  const gameDate = formatDate(today);

  if (!gameDate || typeof gameDate !== "string") {
    console.error("Erro: `gameDate` está em um formato inválido.", gameDate);
    return;
  }

  const url = `https://tank01-fantasy-stats.p.rapidapi.com/getNBAScoresOnly?gameDate=${gameDate}&topPerformers=true&lineups=true`;
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-host": "tank01-fantasy-stats.p.rapidapi.com",
      "x-rapidapi-key": `${apiKey}`,
    },
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    loadingDiv.style.display = "none";
    displayDate.innerHTML = `Jogos do dia ${today.toLocaleDateString()}`;

    displayScores(data.body, scoresDiv);
    fetchNBASchedule(); // Chama a função para buscar jogos de amanhã
  } catch (error) {
    scoresDiv.innerHTML =
      "<p>Erro ao carregar os dados. Tente novamente mais tarde.</p>";
    console.error("Erro:", error);
  }
}

async function fetchNBASchedule() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1); // Avança para o dia seguinte
  const tomorrowDate = formatDate(tomorrow);
  displayTomorrow.innerHTML = `Jogos do dia ${tomorrow.toLocaleDateString()}`;

  //   const url = `https://tank01-fantasy-stats.p.rapidapi.com/getNBAGamesForDate?gameDate=${tomorrowDate}`;

  const url = `https://tank01-fantasy-stats.p.rapidapi.com/getNBAGamesForDate?gameDate=${tomorrowDate}`;
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-host": "tank01-fantasy-stats.p.rapidapi.com",
      "x-rapidapi-key": `${apiKey}`,
    },
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    displayScores(data.body, tomorrowScoresDiv); // Exibe os jogos de amanhã
  } catch (error) {
    tomorrowScoresDiv.innerHTML =
      "<p>Erro ao carregar a programação para amanhã. Tente novamente mais tarde.</p>";
    console.error("Erro ao carregar a programação:", error);
  }
}

function displayScores(games, container) {
  if (!games || Object.keys(games).length === 0) {
    container.innerHTML = "<p>Nenhum jogo encontrado para esta data.</p>";
    return;
  }

  fetch(`../scripts/times.json`)
    .then((response) => response.json())
    .then((data) => {
      const teamsLogos = {};
      const teamColors = {};
      data.forEach((team) => {
        teamsLogos[team.Key] = team.WikipediaLogoUrl;
        if (team.PrimaryColor) {
          teamColors[team.Key] = `#${team.PrimaryColor}`;
        }
      });

      for (const gameID in games) {
        const game = games[gameID];
        const gameDiv = document.createElement("div");
        gameDiv.classList.add("game");

        const homeTeam = game.home || "Desconhecido";
        const awayTeam = game.away || "Desconhecido";
        const homePts = game.homePts || "0";
        const awayPts = game.awayPts || "0";
        const status = game.gameStatus || "Not Started Yet";

        let statusColor = "#ffffff";
        switch (status) {
          case "Aguardando Início":
            statusColor = "#ffffff";
            break;
          case "Live - In Progress":
            statusColor = "#ff0000";
            break;
          case "Finalizado":
            statusColor = "#00ff00";
            break;
        }

        gameDiv.innerHTML = `
        <div class="score">
          <div class="team-container">
            <div class="detail">
              <img src="${teamsLogos[awayTeam]}" alt="${awayTeam}" class="team-logo">
              <span class="team-name">${awayTeam}</span>
            </div>
            <span class="points">${awayPts}</span>
            <span style="font-size: 1.8vw;">VS</span>
            <span class="points">${homePts}</span>
            <div class="detail">
              <img src="${teamsLogos[homeTeam]}" alt="${homeTeam}" class="team-logo">
              <span class="team-name">${homeTeam}</span>
            </div>
          </div>
          <div class="status-container">
            <span style="color: ${statusColor}; font-weight: bold;">${status}</span>
          </div>
        </div>`;

        container.appendChild(gameDiv);

        const primaryColorHome = teamColors[homeTeam];
        const primaryColorAway = teamColors[awayTeam];

        gameDiv.addEventListener("mouseover", function () {
          gameDiv.style.cursor = "pointer";
          gameDiv.style.backgroundImage = `linear-gradient(90deg, rgba(${hexToRgb(
            primaryColorAway || "#575757"
          )}, 0.6), rgba(${hexToRgb(primaryColorHome || "#575757")}, 0.6))`;
          gameDiv.style.color = "#fff";
          gameDiv.style.transition =
            "background-image 1s ease-in, color 1s ease-in";
        });

        gameDiv.addEventListener("mouseleave", function () {
          gameDiv.style.backgroundImage = "";
          gameDiv.style.backgroundColor = "#575757d8";
          gameDiv.style.color = "#fff";
          gameDiv.style.transition =
            "background-color 1s ease-in, color 1s ease-in";
        });
      }
    });
}

function hexToRgb(hex) {
  const bigint = parseInt(hex.replace("#", ""), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r},${g},${b}`;
}

fetchNBAScores();
