import apiKey from "../scripts/rapid-api-key.js"; // Importa a chave da API de um arquivo externo

// Espera o carregamento completo do DOM antes de executar o script
document.addEventListener("DOMContentLoaded", function () {
  // Função para obter os parâmetros da URL
  function getQueryParams() {
    const params = new URLSearchParams(window.location.search); // Cria um objeto URLSearchParams para trabalhar com os parâmetros da URL
    return {
      PlayerID: params.get("PlayerID"), // Obtém o ID do jogador a partir dos parâmetros da URL
      FirstName: params.get("FirstName"), // Obtém o primeiro nome do jogador
      LastName: params.get("LastName"), // Obtém o sobrenome do jogador
      Jersey: params.get("Jersey"), // Obtém o número da camisa do jogador
      Position: params.get("Position"), // Obtém a posição do jogador
      PrimaryColor: params.get("PrimaryColor"), // Obtém a cor primária do time
      SecondaryColor: params.get("SecondaryColor"), // Obtém a cor secundária do time
      Logo: params.get("Logo"), // Obtém o logo do time
    };
  }

  const playerDetails = getQueryParams(); // Obtém os detalhes do jogador a partir da URL

  // Obtém elementos do DOM onde as informações do jogador serão exibidas
  const playerInfoDiv = document.getElementById("playerInfo"); // Elemento para exibir as informações do jogador
  const imagesContainer = document.getElementById("imagesContainer"); // Elemento para exibir imagens (não utilizado no código atual)

  // Função para buscar as estatísticas do jogador da API
  function fetchPlayerStats(firstName, lastName) {
    const playerName = `${firstName} ${lastName}`; // Concatena o primeiro e o último nome do jogador
    fetch(
      `https://tank01-fantasy-stats.p.rapidapi.com/getNBAPlayerInfo?playerName=${encodeURIComponent(
        playerName
      )}&statsToGet=totals`, // URL da API com o nome do jogador
      {
        method: "GET", // Método da requisição
        headers: {
          "x-rapidapi-host": "tank01-fantasy-stats.p.rapidapi.com", // Cabeçalho da requisição com o host da API
          "x-rapidapi-key": `${apiKey}`, // Cabeçalho da requisição com a chave da API (não deve ser exposta em produção)
        },
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro na requisição à API"); // Lança um erro se a resposta não for ok
        }
        return response.json(); // Retorna a resposta como JSON
      })
      .then((data) => {
        if (data.body && data.body.length > 0) {
          displayPlayerStats(data.body[0]); // Exibe as estatísticas do primeiro jogador encontrado
        } else {
          playerInfoDiv.innerHTML += `<p>Jogador não encontrado.</p>`; // Mensagem informando que o jogador não foi encontrado
        }
      })
      .catch((error) => {
        console.error("Erro:", error); // Registra o erro no console
        playerInfoDiv.innerHTML += `<p>Erro ao obter estatísticas do jogador.</p>`; // Mensagem de erro na interface
      });
  }

  // Função para formatar a data no formato DD/MM/YYYY
  function formatDate(dateString) {
    const year = dateString.slice(0, 4); // Obtém o ano da string de data
    const month = dateString.slice(4, 6); // Obtém o mês da string de data
    const day = dateString.slice(6, 8); // Obtém o dia da string de data
    return `${day}/${month}/${year}`; // Retorna a data formatada
  }

  // Função para formatar a data de nascimento
  function formatBDay(date) {
    // Divide a data em partes
    const parts = date.split("/");

    // Verifica se a data está no formato D/M/YYYY
    if (parts[0].length <= 2 && parts[1].length <= 2) {
      const day = parts[1].padStart(2, "0"); // Adiciona zero à esquerda no dia
      const month = parts[0].padStart(2, "0"); // Adiciona zero à esquerda no mês
      const year = parts[2];
      return `${day}/${month}/${year}`; // Retorna a data formatada
    }
    // Se estiver no formato DD/MM/YYYY
    else if (parts[0].length > 2 && parts[1].length > 2) {
      const day = parts[1]; // Troca o dia pelo mês
      const month = parts[0]; // Troca o mês pelo dia
      const year = parts[2];
      return `${day}/${month}/${year}`; // Retorna a data formatada
    }

    return date; // Retorna a data original se não se encaixar nos formatos esperados
  }

  // Função para formatar o peso de libras (lbs) para quilogramas (kg)
  function formatWeight(lbs) {
    const kg = (lbs * 0.453592).toFixed(2); // Converte libras para quilogramas e arredonda para duas casas decimais
    return `${lbs} lbs (${kg} kg)`; // Retorna o peso formatado
  }

  // Função para formatar a altura de pés e polegadas para metros
  function formatHeight(feetInches) {
    const [feet, inches] = feetInches.split("-").map(Number); // Separa pés e polegadas e converte para número
    const totalInches = feet * 12 + inches; // Calcula a altura total em polegadas
    const meters = (totalInches * 0.0254).toFixed(2); // Converte polegadas para metros
    return `${totalInches} in (${meters} m)`; // Retorna a altura formatada
  }

  // Função para formatar informações do último jogo jogado
  function formatLastGamePlayed(lastGamePlayed) {
    const [dateString, teamsString] = lastGamePlayed.split("_"); // Divide a string em data e equipes
    const formattedDate = formatDate(dateString); // Usa a função formatDate para formatar a data
    const [homeTeam, awayTeam] = teamsString.split("@"); // Separa as equipes jogadas
    return {
      formattedDate, // Retorna a data formatada
      homeTeam, // Retorna o time da casa
      awayTeam, // Retorna o time visitante
    };
  }

  // Função para exibir todas as estatísticas e informações do jogador
  function displayPlayerStats(data) {
    if (data) {
      document.title = `${data.longName}`; // Define o título da página como o nome completo do jogador
      const stats = data.stats || {}; // Obtém as estatísticas do jogador ou define como um objeto vazio
      const injury = data.injury || {}; // Obtém informações sobre lesões ou define como um objeto vazio

      const lastGameInfo = formatLastGamePlayed(data.lastGamePlayed); // Formata as informações do último jogo
      const birthDate = formatDate(data.bDay); // Formata a data de nascimento

      // HTML para exibir informações do jogador
      const playerHTML = `
        <h2>${data.longName} - ${data.team}</h2> <!-- Nome do jogador e time -->
        <div class="img-container">
          <img src="${data.nbaComHeadshot}" alt="${data.espnName} Headshot" style="width: auto; height: 30vh;"> <!-- Foto do jogador -->
          <img class="team-logo" src="${playerDetails.Logo}" alt="${data.longName}"> <!-- Logo do time -->
        </div>
        <p>Data de Nascimento: ${formatBDay(data.bDay)}</p> <!-- Data de nascimento do jogador -->
        <p>Altura: ${formatHeight(data.height)}</p> <!-- Altura do jogador -->
        <p>Peso: ${formatWeight(data.weight)}</p> <!-- Peso do jogador -->
        <p>Experiência: ${data.exp === "R" ? "Rookie" : `${data.exp} anos`}</p> <!-- Experiência do jogador -->
        <p>Último Jogo: ${lastGameInfo.formattedDate} - ${lastGameInfo.homeTeam} vs ${lastGameInfo.awayTeam}</p> <!-- Informações do último jogo -->
        <p>Link ESPN: <a href="${data.espnLink}" target="_blank">${data.espnLink}</a></p> <!-- Link para ESPN -->
        <p>Link NBA: <a href="${data.nbaComLink}" target="_blank">${data.nbaComLink}</a></p> <!-- Link para NBA.com -->
        <p>Posição: ${data.pos}</p> <!-- Posição do jogador -->
        <p>ID do Jogador na ESPN: ${data.espnID}</p> <!-- ID do jogador na ESPN -->
        <p>ID do Jogador na NBA.com: ${data.nbaComID}</p> <!-- ID do jogador na NBA.com -->
        <p>Lesão: ${injury.injury ? injury.injury : "Nenhuma"}</p> <!-- Informações sobre lesões -->
        <h3>Estatísticas:</h3> <!-- Título para estatísticas -->
        <ul>
          <li>Jogos: ${stats.gp || 0}</li> <!-- Jogos jogados -->
          <li>Pontos: ${stats.points || 0}</li> <!-- Pontos marcados -->
          <li>Assistências: ${stats.assists || 0}</li> <!-- Assistências feitas -->
          <li>Rebotes: ${stats.rebounds || 0}</li> <!-- Rebotes -->
          <li>Roubos: ${stats.steals || 0}</li> <!-- Roubos -->
          <li>Tocos: ${stats.blocks || 0}</li> <!-- Tocos -->
          <li>Faltas: ${stats.fouls || 0}</li> <!-- Faltas cometidas -->
        </ul>
      `;

      playerInfoDiv.innerHTML = playerHTML; // Insere o HTML no elemento playerInfoDiv

      // Chama a função fetchPlayerStats para buscar as estatísticas do jogador
      fetchPlayerStats(playerDetails.FirstName, playerDetails.LastName);
    } else {
      playerInfoDiv.innerHTML += `<p>Dados do jogador estão ausentes.</p>`; // Mensagem se os dados do jogador estiverem ausentes
    }
  }

  // Chama a função displayPlayerStats com os detalhes do jogador obtidos da URL
  displayPlayerStats(playerDetails);
});
