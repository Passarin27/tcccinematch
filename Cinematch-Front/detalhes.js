const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "index.html";
}

const API_KEY = "1ed547b4243d008478f0754b4621dbe2";
const IMG_URL = "https://image.tmdb.org/t/p/w400";
const API_URL = "https://tcc-cinematch.onrender.com";

const params = new URLSearchParams(window.location.search);
const filmeId = params.get("id");
const from = params.get("from");

let salvandoFavorito = false;

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
  document.getElementById("diretor").textContent =
    diretor?.name || "Não informado";
  document.getElementById("atores").textContent = atores;

  verificarFavorito();
}

/* =========================
   VERIFICAR FAVORITO
========================= */
async function verificarFavorito() {
  const res = await fetch(`${API_URL}/filmes`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const filmes = await res.json();
  const jaFavorito = filmes.find(
    f => String(f.tmdb_id) === String(filmeId)
  );

  if (jaFavorito) {
    document.getElementById("favorito").classList.add("ativo");
  }
}

/* =========================
   OBTER / CRIAR LISTA FAVORITOS
========================= */
async function obterListaFavoritos() {
  const res = await fetch(`${API_URL}/listas`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const listas = await res.json();
  let favoritos = listas.find(l => l.nome === "Favoritos");

  if (!favoritos) {
    favoritos = await fetch(`${API_URL}/listas`, {
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
   TOGGLE FAVORITO (CORRIGIDO)
========================= */
async function toggleFavorito() {
  if (salvandoFavorito) return;
  salvandoFavorito = true;

  const coracao = document.getElementById("favorito");

  try {
    const filmes = await fetch(`${API_URL}/filmes`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json());

    let filme = filmes.find(
      f => String(f.tmdb_id) === String(filmeId)
    );

    /* ===== DESFAVORITAR ===== */
    if (coracao.classList.contains("ativo")) {
      coracao.classList.remove("ativo");

      if (filme) {
        const listaId = await obterListaFavoritos();

        await fetch(
          `${API_URL}/listas/${listaId}/filmes/${filme.id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }

      return;
    }

    /* ===== FAVORITAR ===== */
    coracao.classList.add("ativo");

    // garante que o filme existe
    if (!filme) {
      filme = await fetch(`${API_URL}/filmes`, {
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

    await fetch(`${API_URL}/listas/${listaId}/filmes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        filme_id: filme.id
      })
    });

  } catch (err) {
    console.error("Erro ao favoritar:", err);
  } finally {
    salvandoFavorito = false;
  }
}

carregarDetalhes();
