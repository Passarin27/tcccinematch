const API_KEY = "1ed547b4243d008478f0754b4621dbe2";
const TMDB_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR&page=`;
const IMG_URL = "https://image.tmdb.org/t/p/w300";
const API = "https://tcc-cinematch.onrender.com";

const token = localStorage.getItem("token");
if (!token) window.location.href = "index.html";

let pagina = 1;
let filmesVisiveis = 0;
let listaFavoritosId = null;

/* =========================
   MAPA DE GÊNEROS
========================= */
const GENEROS = {
  28: "Ação",
  12: "Aventura",
  16: "Animação",
  35: "Comédia",
  80: "Crime",
  18: "Drama",
  10751: "Família",
  14: "Fantasia",
  27: "Terror",
  9648: "Mistério",
  10749: "Romance",
  878: "Ficção científica",
  53: "Suspense"
};

/* =========================
   USUÁRIO
========================= */
async function carregarUsuario() {
  const res = await fetch(`${API}/users/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const user = await res.json();
  if (user.foto) document.getElementById("fotoTopo").src = user.foto;
}

/* =========================
   GARANTIR LISTA FAVORITOS
========================= */
async function garantirListaFavoritos() {
  const res = await fetch(`${API}/listas`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const listas = await res.json();
  let favoritos = listas.find(l => l.nome === "Favoritos");

  if (!favoritos) {
    const criar = await fetch(`${API}/listas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ nome: "Favoritos" })
    });

    favoritos = await criar.json();
  }

  listaFavoritosId = favoritos.id;
}

/* =========================
   FAVORITOS 
========================= */
async function buscarFavoritos() {
  if (!listaFavoritosId) return [];

  const res = await fetch(`${API}/listas/${listaFavoritosId}/filmes`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) return [];

  const filmes = await res.json();
  return filmes.map(f => f.tmdb_id);
}

/* =========================
   RECOMENDAÇÕES
========================= */
async function mostrarRecomendacoes() {
  ativarTab(0);
  const conteudo = document.getElementById("conteudo");
  conteudo.innerHTML = "";
  filmesVisiveis = 0;

  const favoritos = await buscarFavoritos();

  while (filmesVisiveis < 10) {
    const res = await fetch(TMDB_URL + pagina);
    const data = await res.json();

    for (const filme of data.results) {
      if (!filme.poster_path) continue;
      if (favoritos.includes(filme.id)) continue;
      if (filmesVisiveis >= 10) break;

      const generoNome = GENEROS[filme.genre_ids?.[0]] || "—";
      const ano = filme.release_date
        ? filme.release_date.split("-")[0]
        : "—";

      const sinopse = filme.overview
        ? filme.overview.substring(0, 120) + "..."
        : "Sinopse não disponível.";

      const card = document.createElement("div");
      card.className = "filme-card";

      card.innerHTML = `
        <img src="${IMG_URL + filme.poster_path}">
        <div class="filme-info">
          <h3>${filme.title}</h3>
          <small>${ano} • ${generoNome}</small>
          <p class="sinopse">${sinopse}</p>
        </div>
        <span class="coracao" onclick="favoritar(this, ${filme.id}, '${filme.title}', '${filme.poster_path}')">❤</span>
      `;

      conteudo.appendChild(card);
      filmesVisiveis++;
    }

    pagina++;
  }
}

/* =========================
   FAVORITAR
========================= */
async function favoritar(el, id, titulo, poster) {
  el.classList.add("ativo");

  const resFilme = await fetch(`${API}/filmes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      tmdb_id: id,
      titulo,
      poster: IMG_URL + poster
    })
  });

  const filme = await resFilme.json();

  await fetch(`${API}/listas/${listaFavoritosId}/filmes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      filme_id: filme.id
    })
  });

  el.closest(".filme-card").remove();
  filmesVisiveis--;

  if (filmesVisiveis < 10) {
    mostrarRecomendacoes();
  }
}

/* =========================
   LISTAS + FILMES
========================= */

async function mostrarListas() {
  ativarTab(1);
  const conteudo = document.getElementById("conteudo");
  conteudo.innerHTML = "";

  const resListas = await fetch(`${API}/listas`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const listas = await resListas.json();

  if (!listas.length) {
    conteudo.innerHTML = "<p style='padding:16px'>Nenhuma lista encontrada</p>";
    return;
  }

  for (const lista of listas) {
    const tituloLista = document.createElement("h2");
    tituloLista.style.padding = "16px";
    tituloLista.textContent = lista.nome;
    conteudo.appendChild(tituloLista);

    const resFilmes = await fetch(`${API}/listas/${lista.id}/filmes`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const filmes = await resFilmes.json();

    if (!filmes.length) {
      const vazio = document.createElement("p");
      vazio.style.padding = "0 16px 16px";
      vazio.textContent = "Nenhum filme nesta lista";
      conteudo.appendChild(vazio);
      continue;
    }

    for (const filme of filmes) {
      // busca detalhes no TMDB
      const resTMDB = await fetch(
        `https://api.themoviedb.org/3/movie/${filme.tmdb_id}?api_key=${API_KEY}&language=pt-BR`
      );
      const detalhes = await resTMDB.json();

      const generoNome =
        detalhes.genres?.[0]?.name || "—";

      const ano = detalhes.release_date
        ? detalhes.release_date.split("-")[0]
        : "—";

      const sinopse = detalhes.overview
        ? detalhes.overview.substring(0, 120) + "..."
        : "Sinopse não disponível.";

      const card = document.createElement("div");
      card.className = "filme-card";

      card.innerHTML = `
        <img src="${filme.poster}">
        <div class="filme-info">
          <h3>${filme.titulo}</h3>
          <small>${ano} • ${generoNome}</small>
          <p class="sinopse">${sinopse}</p>
        </div>
        <span class="coracao ativo"
          onclick="removerFavorito(this, ${lista.id}, ${filme.id})">❤</span>
      `;

      conteudo.appendChild(card);
    }
  }
}

/* =========================
   REMOVER DOS FAVORITOS
========================= */
async function removerFavorito(el, listaId, filmeId) {
  await fetch(`${API}/listas/${listaId}/filmes/${filmeId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  el.closest(".filme-card").remove();
}


/* =========================
   AUX
========================= */
function ativarTab(i) {
  document.querySelectorAll(".tab").forEach((t, idx) => {
    t.classList.toggle("ativo", idx === i);
  });
}

function irConfig() {
  window.location.href = "../configuracoes.html";
}

/* =========================
   INIT
========================= */
(async () => {
  await carregarUsuario();
  await garantirListaFavoritos();
  await mostrarRecomendacoes();
})();
