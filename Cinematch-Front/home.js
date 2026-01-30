const API_KEY = "1ed547b4243d008478f0754b4621dbe2";
const IMG_URL = "https://image.tmdb.org/t/p/w300";

/* =========================
   PROTEÇÃO
========================= */
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "index.html";
}

/* =========================
   ESTADO
========================= */
let page = 1;
let carregando = false;
let favoritosCache = [];

/* =========================
   TOPO
========================= */
const nomeTopo = document.getElementById("nomeTopo");
const fotoTopo = document.getElementById("fotoTopo");

async function carregarUsuarioTopo() {
  const res = await fetch("https://tcc-cinematch.onrender.com/users/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) return;

  const usuario = await res.json();

  if (nomeTopo) nomeTopo.textContent = usuario.nome;
  if (fotoTopo && usuario.foto) fotoTopo.src = usuario.foto;
}

/* =========================
   FAVORITOS
========================= */
async function buscarFavoritos() {
  try {
    const res = await fetch("https://tcc-cinematch.onrender.com/filmes", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return;

    const filmes = await res.json();
    favoritosCache = filmes.map(f => String(f.tmdb_id));

  } catch (err) {
    console.error("Erro favoritos:", err);
  }
}

/* =========================
   CARREGAR FILMES
========================= */
async function carregarFilmes() {
  if (carregando) return;
  carregando = true;

  const container = document.getElementById("lista-filmes");
  if (!container) return;

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR&page=${page}`
    );

    const dados = await res.json();

    dados.results.forEach(filme => {
      if (!filme.poster_path) return;
      if (favoritosCache.includes(String(filme.id))) return;

      const card = document.createElement("div");
      card.classList.add("filme");

      card.innerHTML = `
        <img src="${IMG_URL + filme.poster_path}">
        <h3>${filme.title}</h3>
      `;

      card.addEventListener("click", () => {
        window.location.href = `detalhes.html?id=${filme.id}`;
      });

      container.appendChild(card);
    });

    page++;

  } catch (err) {
    console.error("Erro filmes:", err);
  }

  carregando = false;
}

/* =========================
   INIT
========================= */
(async () => {
  await buscarFavoritos();
  await carregarUsuarioTopo();
  carregarFilmes();
})();
