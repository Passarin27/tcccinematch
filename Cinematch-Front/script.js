const API_KEY = "1ed547b4243d008478f0754b4621dbe2";
const IMG_URL = "https://image.tmdb.org/t/p/w300";

/* =========================
   CONFIG
========================= */
const MIN_FILMES = 15;
let page = 1;
let favoritosCache = [];

/* =========================
   PROTEÇÃO
========================= */
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "index.html";
}

/* =========================
   TOPO
========================= */
const nomeTopo = document.getElementById("nomeTopo");
const fotoTopo = document.getElementById("fotoTopo");

/* =========================
   USUÁRIO
========================= */
async function carregarUsuario() {
  try {
    const res = await fetch("https://tcc-cinematch.onrender.com/users/me", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return;

    const usuario = await res.json();
    if (nomeTopo) nomeTopo.textContent = usuario.nome;
    if (fotoTopo && usuario.foto) fotoTopo.src = usuario.foto;

  } catch (err) {
    console.error("Erro usuário:", err);
  }
}

/* =========================
   FAVORITOS
========================= */
async function buscarFavoritos() {
  try {
    const res = await fetch("https://tcc-cinematch.onrender.com/filmes", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return [];

    const filmes = await res.json();
    favoritosCache = filmes.map(f => f.tmdb_id);

  } catch (err) {
    console.error("Erro favoritos:", err);
  }
}

/* =========================
   FILMES (COM GARANTIA DE 10)
========================= */
async function carregarFilmes() {
  const container = document.getElementById("lista-filmes");
  if (!container) return;

  let exibidos = 0;

  while (exibidos < MIN_FILMES) {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR&page=${page}`
    );

    const dados = await res.json();

    if (!dados.results || dados.results.length === 0) break;

    for (const filme of dados.results) {
      if (exibidos >= MIN_FILMES) break;
      if (!filme.poster_path) continue;
      if (favoritosCache.includes(filme.id)) continue;

      const div = document.createElement("div");
      div.classList.add("filme");

      div.innerHTML = `
        <img src="${IMG_URL + filme.poster_path}">
        <h3>${filme.title}</h3>
        <a href="detalhes.html?id=${filme.id}" class="btn">Ver detalhes</a>
      `;

      container.appendChild(div);
      exibidos++;
    }

    page++;
  }

  if (exibidos === 0) {
    container.innerHTML = "<p>Nenhuma recomendação disponível no momento.</p>";
  }
}

/* =========================
   INIT
========================= */
(async () => {
  await carregarUsuario();
  await buscarFavoritos();
  await carregarFilmes();
})();
