document.addEventListener("DOMContentLoaded", function () {
  const teamsList = document.getElementById("teamsList");
  teamsList.innerHTML = "<p>Carregando times...</p>";

  // Fazendo a requisição para obter os times
  fetch(`./scripts/times.json`)
    .then((response) => response.json())
    .then((data) => {
      teamsList.innerHTML = "";

      if (data.length === 0) {
        teamsList.innerHTML = "<p>Nenhum time encontrado.</p>";
      } else {
        data.forEach((team) => {
          const teamItem = document.createElement("div");
          teamItem.className = "team-item";
          teamItem.innerHTML = `
                    <img class="team-logo" src="${team.WikipediaLogoUrl}" alt="${team.FullName}">
                    <p><strong>Conferência:</strong> ${team.Conference}</p>
                    <p><strong>Divisão:</strong> ${team.Division}</p>
                    <p><strong>Nome Completo:</strong> ${team.City} ${team.Name}</p>
                    <p><strong>Abreviação:</strong> ${team.Key}</p>
                `;

          // Chama a API de jogadores
          fetch(`./scripts/roster.json`)
            .then((response) => response.json())
            .then((data) => {
              // Acessa os jogadores pelo código do time
              const players = data[team.Key]; // Usa o Key do time para acessar os jogadores

              // Verifica se players é um array
              if (Array.isArray(players)) {
                const playersList = document.createElement("div");
                playersList.className = "players-list";

                // Define a cor primária do time
                const primaryColor = `#${team.PrimaryColor}` || "#333"; // Padrão caso não exista
                const secondaryColor = `#${team.SecondaryColor}`;
                const tertiaryColor = `#${team.TertiaryColor}`;

                players.forEach((player) => {
                  const playerItem = document.createElement("a");
                  playerItem.className = "player-item";
                  playerItem.innerHTML = `
                                <h5>${player.FirstName} ${player.LastName}</h5>
                                
                            `;
                  const normalizedPrimaryColor = primaryColor
                    .toUpperCase()
                    .replace("#", "");
                  const normalizedSecondaryColor = secondaryColor
                    .toUpperCase()
                    .replace("#", "");
                  const normalizedTertiaryColor = tertiaryColor
                    .toUpperCase()
                    .replace("#", "");

                  // Adiciona os eventos de hover para mudar a cor ao passar o mouse
                  playerItem.addEventListener("mouseover", function () {
                    playerItem.style.cursor = "pointer";
                    playerItem.style.backgroundColor = `#${normalizedPrimaryColor}`;

                    if (normalizedPrimaryColor === "#000000")
                      playerItem.style.color = "#000000"; // Texto preto
                    else playerItem.style.color = "#ffffff";

                    playerItem.style.transition = "0.5s";
                  });

                  teamItem.addEventListener("mouseover", function () {
                    teamItem.style.cursor = "pointer";
                    const primaryColorWithOpacity = `${normalizedPrimaryColor}99`; // 60% de opacidade
                    const secondaryColorWithOpacity = `${normalizedSecondaryColor}99`; // 60% de opacidade
                    teamItem.style.backgroundImage = `linear-gradient(#${primaryColorWithOpacity}, #${secondaryColorWithOpacity})`;
                    playersList.style.backgroundColor = `#${normalizedPrimaryColor}99`;
                    teamItem.style.color = "#fffff"; // Texto preto
                    teamItem.style.transition =
                      "background-image 1s ease-in, color 1s ease-in"; // Transição suave
                  });

                  teamItem.addEventListener("mouseleave", function () {
                    teamItem.style.cursor = "pointer";
                    teamItem.style.backgroundImage = ""; // Remove o gradiente
                    teamItem.style.backgroundColor = "#575757d8"; // Cor padrão de fundo
                    playersList.style.backgroundColor = "#575757d8";
                    teamItem.style.color = "#fffff"; // Texto padrão
                    teamItem.style.transition =
                      "background-color 1s ease-in, color 1s ease-in"; // Transição suave
                  });

                  // Adiciona evento de clique ao nome do jogador
                  playerItem.addEventListener("click", function () {
                    // Redireciona para a página Jogadores.html passando as informações do jogador pela URL
                    const playerDetailsUrl = `Jogadores.html?PlayerID=${player.PlayerID}&FirstName=${player.FirstName}&LastName=${player.LastName}&Jersey=${player.Jersey}&Position=${player.Position}&PrimaryColor=${team.PrimaryColor}&SecondaryColor=${team.SecondaryColor}&Logo=${team.WikipediaLogoUrl}`;
                    window.location.href = playerDetailsUrl;
                  });

                  playerItem.addEventListener("mouseout", function () {
                    playerItem.style.backgroundColor = "";
                    playerItem.style.transition = `0.5s`;
                    playerItem.style.color = "#ffffff"; // Texto padrão ou branco para cores escuras
                  });

                  playersList.appendChild(playerItem);
                });

                teamItem.appendChild(playersList);
              } else {
                console.error("Dados de jogadores não são um array:", players);
                teamItem.innerHTML +=
                  "<p>Erro ao carregar os jogadores para este time.</p>";
              }

              teamsList.appendChild(teamItem);
            })
            .catch((error) => {
              console.error("Erro ao carregar jogadores:", error);
              teamItem.innerHTML +=
                "<p>Erro ao carregar jogadores. Tente novamente mais tarde.</p>";
            });
        });
      }
    });
});
