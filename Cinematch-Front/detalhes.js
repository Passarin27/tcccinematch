const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "index.html";
}

const API_KEY = "1ed547b4243d008478f0754b4621dbe2";
const IMG_URL = "https://image.tmdb.org/t/p/w400";

const params = new URLSearchParams(window.location.search);
const filmeId = params.get("id");
const from = params.get("from");

/* =========================
   CARREGAR DETALHES
========================= */
async function carregarDetalhes() {
  try {
    const filmeResp = await fetch(
      `https://api.themoviedb.org/3/movie/${filmeId}?api_key=${API_KEY}&language=pt-BR`
    );
    const filme = await filmeResp.json();

    const creditosResp = await fetch(
      `https://api.themoviedb.org/3/movie/${filmeId}/credits?api_key=${API_KEY}&language=pt-BR`
    );
    const creditos = await creditosResp.json();

    const diretor = creditos.crew.find(p => p.job === "Director");
    const atores = creditos.cast.slice(0, 3).map(a => a.name).join(", ");
    const generos = filme.genres.map(g => g.name).join(", ");

    const botaoVoltar = document.querySelector(".voltar");
    if (botaoVoltar) {
      botaoVoltar.href = from === "listas" ? "listas.html" : "home.html";
    }

    document.getElementById("poster").src =
      filme.poster_path
        ? IMG_URL + filme.poster_path
        : "placeholder.png";

    document.getElementById("titulo").textContent = filme.title;
    document.getElementById("sinopse").textContent =
      filme.overview || "Sinopse não disponível.";
    document.getElementById("generos").textContent = "Gêneros: " + generos;
    document.getElementById("diretor").textContent =
      diretor?.name || "Não informado";
    document.getElementById("atores").textContent =
      atores || "Não informado";

  } catch (err) {
    console.error("❌ Erro ao carregar detalhes:", err);
    alert("Erro ao carregar detalhes do filme");
  }
}

carregarDetalhes();
