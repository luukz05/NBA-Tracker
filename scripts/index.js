// Importa a chave da API do arquivo externo para mantê-la segura e reutilizável em diferentes requisições
import apiKey from "./scripts/rapid-api-key.js";

// Define a URL para as principais notícias da NBA usando o RapidAPI
const urlTopNews =
  "https://tank01-fantasy-stats.p.rapidapi.com/getNBANews?topNews=true";

// Define as opções da requisição, incluindo o método GET e os cabeçalhos com a chave e o host da API
const options = {
  method: "GET",
  headers: {
    "x-rapidapi-key": `${apiKey}`, // Define a chave da API
    "x-rapidapi-host": "tank01-fantasy-stats.p.rapidapi.com", // Define o host da API
  },
};

// URL para obter notícias recentes da NBA
const urlNews =
  "https://tank01-fantasy-stats.p.rapidapi.com/getNBANews?topNews=false&recentNews=true";

try {
  // Faz a requisição para a API de notícias recentes
  const response = await fetch(urlNews, options); // Envia a requisição
  const result = await response.json(); // Converte a resposta em JSON
  const headlines = result.body; // Extrai o corpo das notícias

  // Verifica se o retorno é um array de manchetes
  if (Array.isArray(headlines)) {
    headlines.forEach((data) => {
      const newsHeadline = document.createElement("div"); // Cria um elemento div para exibir cada notícia
      newsHeadline.class = "news-headlineee"; // Define uma classe para estilização
      newsHeadline.style = // Define o estilo inline do elemento
        "background: #575757d8;width:60%;display:flex;justify-content:center; align-items:center;flex-direction:column;padding:1rem;margin-top:10px;border-radius:16px;";
      newsHeadline.href = data.link; // Adiciona o link da notícia
      newsHeadline.target = "_blank"; // Abre o link em uma nova aba

      // Define o conteúdo HTML da notícia com título e imagem
      newsHeadline.innerHTML = `
        <p class="news-content">${data.title}</p>
        <img src="${data.image}" alt="Imagem da notícia" class="headline-img">
        <a href="${data.link}" target="_blank" class="saiba-mais-link">Saiba mais</a>
      `;
      newsHeadline.style.backgroundImage =
        "linear-gradient(rgba(0,0,0,0.65), rgba(15,10,45,0.65))";

      // Adiciona o elemento de notícia ao contêiner principal da página
      document.getElementById("news-container").appendChild(newsHeadline);
    });
  }
} catch (error) {
  // Captura e exibe erros caso a requisição falhe
  console.error(error);
}

// Função para buscar e exibir as principais notícias da NBA
async function fetchTopNews() {
  try {
    const response = await fetch(urlTopNews, options); // Envia a requisição para as principais notícias
    const result = await response.json(); // Converte a resposta em JSON

    // Exibe o JSON completo formatado para visualização
    console.log(JSON.stringify(result, null, 2));

    const noticias = result.body; // Extrai o array de notícias

    // Verifica se 'noticias' é um array
    if (Array.isArray(noticias)) {
      noticias.forEach((noticia) => {
        console.log(noticia); // Exibe cada notícia no console

        const newsCard = document.createElement("a"); // Cria um link para cada notícia
        newsCard.classList.add("top-news-link"); // Define a classe para estilização
        newsCard.href = noticia.link; // Adiciona o link da notícia
        newsCard.target = "_blank"; // Abre o link em uma nova aba

        // Define o conteúdo HTML do link com o título da notícia
        newsCard.innerHTML = `
          <div class="top-news-content">
            ${noticia.title}
          </div>
        `;

        // Adiciona o card de notícias ao contêiner principal da página
        document.getElementById("newsWrapper").appendChild(newsCard);
      });
    } else {
      // Caso o retorno não seja um array, exibe uma mensagem de erro no console
      console.error("A propriedade body não é um array:", data);
    }
  } catch (error) {
    // Captura e exibe erros caso a requisição falhe
    console.error("Erro ao buscar notícias:", error);
  }
}

// Chama a função para buscar as principais notícias ao carregar o script
fetchTopNews();
