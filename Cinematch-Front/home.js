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
   CARREGAR FILMES (PAGINADO)
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

    let adicionados = 0;

    dados.results.forEach(filme => {
      if (!filme.poster_path) return;
      if (favoritosCache.includes(filme.id)) return;

      const div = document.createElement("div");
      div.classList.add("filme");

      div.innerHTML = `
        <img src="${IMG_URL + filme.poster_path}">
        <h3>${filme.title}</h3>
        <a href="detalhes.html?id=${filme.id}" class="btn">Ver detalhes</a>
      `;

      container.appendChild(div);
      adicionados++;
    });

    // se não sobrou filme útil, busca próxima página
    if (adicionados < 5) {
      page++;
      carregando = false;
      carregarFilmes();
      return;
    }

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
  await carregarUsuario();
  await buscarFavoritos();
  carregarFilmes();
})();
