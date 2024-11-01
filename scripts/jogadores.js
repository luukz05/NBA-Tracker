import apiKey from "../scripts/rapid-api-key.js";

// Espera o carregamento completo do DOM antes de executar o script
document.addEventListener("DOMContentLoaded", function () {
  // Função para obter os parâmetros da URL
  function getQueryParams() {
    const params = new URLSearchParams(window.location.search); // Cria um objeto URLSearchParams para trabalhar com os parâmetros da URL
    return {
      PlayerID: params.get("PlayerID"), // Obtém o ID do jogador
      FirstName: params.get("FirstName"), // Obtém o primeiro nome do jogador
      LastName: params.get("LastName"), // Obtém o sobrenome do jogador
      Jersey: params.get("Jersey"), // Obtém o número da camisa
      Position: params.get("Position"), // Obtém a posição do jogador
      PrimaryColor: params.get("PrimaryColor"), // Cor primária do time
      SecondaryColor: params.get("SecondaryColor"), // Cor secundária do time
      Logo: params.get("Logo"), // Logo do time
    };
  }

  const playerDetails = getQueryParams(); // Obtém os detalhes do jogador a partir da URL

  // Obtém elementos do DOM onde as informações do jogador serão exibidas
  const playerInfoDiv = document.getElementById("playerInfo");
  const imagesContainer = document.getElementById("imagesContainer");

  // Função para buscar as estatísticas do jogador da API
  function fetchPlayerStats(firstName, lastName) {
    const playerName = `${firstName} ${lastName}`; // Concatena o primeiro e o último nome
    fetch(
      `https://tank01-fantasy-stats.p.rapidapi.com/getNBAPlayerInfo?playerName=${encodeURIComponent(
        playerName
      )}&statsToGet=totals`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-host": "tank01-fantasy-stats.p.rapidapi.com",
          "x-rapidapi-key": `${apiKey}`, // Não exponha esta chave em produção
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
          displayPlayerStats(data.body[0]); // Acessa o primeiro objeto do array no corpo da resposta
        } else {
          playerInfoDiv.innerHTML += `<p>Jogador não encontrado.</p>`; // Mensagem se nenhum jogador foi encontrado
        }
      })
      .catch((error) => {
        console.error("Erro:", error); // Registra o erro no console
        playerInfoDiv.innerHTML += `<p>Erro ao obter estatísticas do jogador.</p>`; // Mensagem de erro na interface
      });
  }

  // Função para formatar a data
  function formatDate(dateString) {
    const year = dateString.slice(0, 4); // Obtém o ano
    const month = dateString.slice(4, 6); // Obtém o mês
    const day = dateString.slice(6, 8); // Obtém o dia
    return `${day}/${month}/${year}`; // Retorna a data no formato DD/MM/YYYY
  }

  function formatBDay(date) {
    // Divide a data em partes
    const parts = date.split("/");

    // Verifica se a data está no primeiro formato (D/M/YYYY)
    if (parts[0].length <= 2 && parts[1].length <= 2) {
      const day = parts[1].padStart(2, "0"); // Adiciona zero à esquerda no dia
      const month = parts[0].padStart(2, "0"); // Adiciona zero à esquerda no mês
      const year = parts[2];
      return `${day}/${month}/${year}`; // Retorna a data formatada
    }
    // Se estiver no segundo formato (DD/MM/YYYY)
    else if (parts[0].length > 2 && parts[1].length > 2) {
      const day = parts[1]; // Troca o dia pelo mês
      const month = parts[0]; // Troca o mês pelo dia
      const year = parts[2];
      return `${day}/${month}/${year}`; // Retorna a data formatada
    }

    return date; // Retorna a data original se não se encaixar nos formatos esperados
  }

  // Função para formatar o peso de lbs para kg
  function formatWeight(lbs) {
    const kg = (lbs * 0.453592).toFixed(2); // Converte lbs para kg e arredonda para duas casas decimais
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
    const [dateString, teamsString] = lastGamePlayed.split("_");
    const formattedDate = formatDate(dateString); // Usa a função formatDate para formatar a data
    const [homeTeam, awayTeam] = teamsString.split("@");
    return {
      formattedDate,
      homeTeam,
      awayTeam,
    };
  }

  // Função para exibir todas as estatísticas e informações do jogador
  function displayPlayerStats(data) {
    if (data) {
      document.title = `${data.longName}`; // Define o título da página como o nome do jogador
      const stats = data.stats || {}; // Obtém as estatísticas do jogador ou define como um objeto vazio
      const injury = data.injury || {}; // Obtém informações sobre lesões ou define como um objeto vazio

      const lastGameInfo = formatLastGamePlayed(data.lastGamePlayed);
      const birthDate = formatDate(data.bDay); // Formata a data de nascimento

      // HTML para exibir informações do jogador
      const playerHTML = `
        <h2>${data.longName} - ${data.team}</h2>
        <div class="img-container">
          <img src="${data.nbaComHeadshot}" alt="${data.espnName} Headshot" style="width: 80vw; height: auto;">
          <img class="team-logo" src="${playerDetails.Logo}" alt="${data.longName}">
        </div>
        <p>Data de Nascimento: ${formatBDay(data.bDay)}</p>
        <p>Altura: ${formatHeight(data.height)}</p>
        <p>Peso: ${formatWeight(data.weight)}</p>
        <p>Experiência: ${data.exp === "R" ? "Rookie" : `${data.exp} anos`}</p>
        <p>Último Jogo: ${lastGameInfo.formattedDate} - ${lastGameInfo.homeTeam} vs ${lastGameInfo.awayTeam}</p>
        <a href="${data.espnLink}" target="_blank">Perfil do Jogador na ESPN</a>
        <a href="${data.nbaComLink}" target="_blank">Perfil do Jogador na NBA
        </a>
        <p>Posição: ${data.pos}</p>
        <p>ID do Jogador na ESPN: ${data.espnID} </p>
        <p>ID do Jogador na NBA.com: ${data.nbaComID}</p>
        <p style="word-wrap: break-all;">Lesão: ${injury.description || "Nenhuma lesão recente"} </p>
        <p>Data da Lesão: ${
          injury.injDate ? formatDate(injury.injDate) : "N/A"
        }</p>
        <p>Previsão de Retorno: ${
          injury.injReturnDate ? formatDate(injury.injReturnDate) : "N/A"
        }</p>
      `;
      playerInfoDiv.innerHTML = playerHTML; // Atualiza o conteúdo da div com as informações do jogador
    } else {
      playerInfoDiv.innerHTML += `<p>Não foram encontradas estatísticas para o jogador.</p>`; // Mensagem se não houver dados para o jogador
    }

    // Aplica o gradiente ao fundo do container com as cores primária e secundária
    playerInfoDiv.style.backgroundImage = `linear-gradient(rgba(${parseInt(
      playerDetails.PrimaryColor.slice(0, 2),
      16
    )}, ${parseInt(playerDetails.PrimaryColor.slice(2, 4), 16)}, ${parseInt(
      playerDetails.PrimaryColor.slice(4, 6),
      16
    )}, 0.6), rgba(${parseInt(playerDetails.SecondaryColor.slice(0, 2), 16)}, ${parseInt(
      playerDetails.SecondaryColor.slice(2, 4),
      16
    )}, ${parseInt(playerDetails.SecondaryColor.slice(4, 6), 16)}, 0.6))`;
  }

  // Chama a função para buscar as estatísticas do jogador usando os parâmetros da URL
  fetchPlayerStats(playerDetails.FirstName, playerDetails.LastName);
});
