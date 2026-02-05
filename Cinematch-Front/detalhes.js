const params = new URLSearchParams(window.location.search);
const tmdbId = params.get("id");

const token = localStorage.getItem("token");
if (!token || !tmdbId) {
  window.location.href = "home.html";
}

const API_KEY = "1ed547b4243d008478f0754b4621dbe2";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

const poster = document.getElementById("poster");
const titulo = document.getElementById("titulo");
const sinopse = document.getElementById("sinopse");
const diretor = document.getElementById("diretor");
const atores = document.getElementById("atores");

const btnAssistirDepois = document.getElementById("btn-assistir-depois");
const btnJaAssistido = document.getElementById("btn-ja-assistido");

let detalhesCarregados = false;

/* =========================
   CARREGAR DETALHES (TMDB)
========================= */
async function carregarDetalhes() {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${API_KEY}&language=pt-BR&append_to_response=credits`
    );

    if (!res.ok) throw new Error("Erro ao buscar TMDB");

    const filme = await res.json();

    // 🛡️ PROTEÇÕES CONTRA NULL
    poster.src = filme.poster_path
      ? IMG_URL + filme.poster_path
      : "https://via.placeholder.com/300x450?text=Sem+Imagem";

    titulo.textContent = filme.title || "Título não informado";
    sinopse.textContent = filme.overview || "Sem sinopse disponível";

    const crew = filme.credits?.crew || [];
    const cast = filme.credits?.cast || [];

    const diretorObj = crew.find(p => p.job === "Director");
    diretor.textContent = diretorObj?.name || "Não informado";

    atores.textContent = cast.length
      ? cast.slice(0, 5).map(a => a.name).join(", ")
      : "Não informado";

    detalhesCarregados = true;
  } catch (err) {
    console.error("Erro detalhes:", err);
    alert("Erro ao carregar detalhes do filme");
  }
}

/* =========================
   STATUS (BACKEND)
========================= */
async function carregarStatus() {
  try {
    const res = await fetch(
      `https://tcc-cinematch.onrender.com/filmes/status/${tmdbId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!res.ok) return;

    const status = await res.json();

    if (status.assistirDepois) btnAssistirDepois.classList.add("ativo");
    if (status.jaAssistido) btnJaAssistido.classList.add("ativo");

  } catch (err) {
    console.error("Erro status:", err);
  }
}

/* =========================
   BOTÕES
========================= */
btnAssistirDepois.addEventListener("click", async () => {
  if (!detalhesCarregados) return alert("Filme ainda carregando...");

  try {
    const res = await fetch(
      "https://tcc-cinematch.onrender.com/filmes/assistir-depois",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ tmdb_id: Number(tmdbId) })
      }
    );

    if (!res.ok) throw new Error("Erro ao salvar");

    btnAssistirDepois.classList.add("ativo");
    btnJaAssistido.classList.remove("ativo");
  } catch (err) {
    alert("Erro ao salvar filme");
    console.error(err);
  }
});

btnJaAssistido.addEventListener("click", async () => {
  if (!detalhesCarregados) return alert("Filme ainda carregando...");

  try {
    const res = await fetch(
      "https://tcc-cinematch.onrender.com/filmes/ja-assistidos",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ tmdb_id: Number(tmdbId) })
      }
    );

    if (!res.ok) throw new Error("Erro ao salvar");

    btnJaAssistido.classList.add("ativo");
    btnAssistirDepois.classList.remove("ativo");
  } catch (err) {
    alert("Erro ao salvar filme");
    console.error(err);
  }
});

/* =========================
   INIT
========================= */
(async () => {
  await carregarDetalhes();
  await carregarStatus();
})();
