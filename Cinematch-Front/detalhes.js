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
  const filmeResp = await fetch(
    `https://api.themoviedb.org/3/movie/${filmeId}?api_key=${API_KEY}&language=pt-BR`
  );
  const filme = await filmeResp.json();

  const botaoVoltar = document.querySelector(".voltar");
  botaoVoltar.href = from === "listas" ? "listas.html" : "home.html";

  const creditosResp = await fetch(
    `https://api.themoviedb.org/3/movie/${filmeId}/credits?api_key=${API_KEY}&language=pt-BR`
  );
  const creditos = await creditosResp.json();

  const diretor = creditos.crew.find(p => p.job === "Director");
  const atores = creditos.cast.slice(0, 3).map(a => a.name).join(", ");
  const generos = filme.genres.map(g => g.name).join(", ");

  document.getElementById("poster").src = IMG_URL + filme.poster_path;
  document.getElementById("titulo").textContent = filme.title;
  document.getElementById("sinopse").textContent =
    filme.overview || "Sinopse não disponível.";
  document.getElementById("generos").textContent = "Gênero: " + generos;
  document.getElementById("diretor").textContent = diretor?.name || "Não informado";
  document.getElementById("atores").textContent = atores;

  verificarFavorito();
}

/* =========================
   VERIFICA FAVORITO
========================= */
async function verificarFavorito() {
  const res = await fetch("https://tcc-cinematch.onrender.com/filmes", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const filmes = await res.json();
  const jaFavorito = filmes.find(f => f.tmdb_id == filmeId);

  if (jaFavorito) {
    document.getElementById("favorito").classList.add("ativo");
  }
}

/* =========================
   LISTA FAVORITOS
========================= */
async function obterListaFavoritos() {
  const res = await fetch("https://tcc-cinematch.onrender.com/listas", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const listas = await res.json();
  let favoritos = listas.find(l => l.nome === "Favoritos");

  if (!favoritos) {
    favoritos = await fetch("https://tcc-cinematch.onrender.com/listas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ nome: "Favoritos" })
    }).then(r => r.json());
  }

  return favoritos.id;
}

/* =========================
   TOGGLE FAVORITO
========================= */
async function toggleFavorito() {
  const coracao = document.getElementById("favorito");

  const filmesResp = await fetch("https://tcc-cinematch.onrender.com/filmes", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const filmes = await filmesResp.json();

  let filme = filmes.find(f => f.tmdb_id == filmeId);

  //  DESFAVORITAR
  if (coracao.classList.contains("ativo")) {
    coracao.classList.remove("ativo");

    if (!filme) return;

    const listaId = await obterListaFavoritos();

    await fetch(
      `https://tcc-cinematch.onrender.com/listas/${listaId}/filmes/${filme.id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return;
  }

  //  FAVORITAR
  coracao.classList.add("ativo");

  if (!filme) {
    filme = await fetch("https://tcc-cinematch.onrender.com/filmes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        tmdb_id: filmeId,
        titulo: document.getElementById("titulo").textContent,
        poster: document.getElementById("poster").src
      })
    }).then(r => r.json());
  }

  const listaId = await obterListaFavoritos();

 
  await fetch(`https://tcc-cinematch.onrender.com/listas/${listaId}/filmes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      filmeId: filme.id 
    })
  });
}

carregarDetalhes();
