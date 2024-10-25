// script.js

const url =
  "https://tank01-fantasy-stats.p.rapidapi.com/getNBANews?topNews=true";
const options = {
  method: "GET",
  headers: {
    "x-rapidapi-key": "36401f18c1mshbe63e7a864a0c0cp171490jsn90e42c6bf31e",
    "x-rapidapi-host": "tank01-fantasy-stats.p.rapidapi.com",
  },
};

async function fetchNews() {
  try {
    const response = await fetch(url, options);
    const result = await response.json();

    // Exibir todas as informações do JSON
    console.log(JSON.stringify(result, null, 2)); // Exibe a estrutura formatada

    // Acesse o array de notícias através da propriedade body
    const noticias = result.body;

    // Verifique se 'noticias' é um array
    if (Array.isArray(noticias)) {
      noticias.forEach((noticia) => {
        console.log(noticia); // Exibe cada notícia individualmente

        const newsCard = document.createElement("a");
        newsCard.classList.add("top-news-link");
        newsCard.href = noticia.link; // Adicionando o href diretamente ao elemento
        newsCard.target = "_blank"; // Para abrir em nova aba

        newsCard.innerHTML = `
                    <div class="top-news-content">
                        ${noticia.title}
                    </div>
                `;

        // Adiciona o card de notícias ao contêiner
        document.getElementById("newsWrapper").appendChild(newsCard);
      });
    } else {
      console.error("A propriedade body não é um array:", noticias);
    }
  } catch (error) {
    console.error("Erro ao buscar notícias:", error);
  }
}

// Chama a função para buscar as notícias
fetchNews();
