const params = new URLSearchParams(window.location.search);
const tmdbId = params.get("id");

const token = localStorage.getItem("token");
if (!token || !tmdbId) {
  window.location.href = "home.html";
}

const IMG_URL = "https://image.tmdb.org/t/p/w300";

const poster = document.getElementById("poster");
const titulo = document.getElementById("titulo");
const sinopse = document.getElementById("sinopse");
const diretor = document.getElementById("diretor");
const atores = document.getElementById("atores");

const btnAssistirDepois = document.getElementById("btn-assistir-depois");
const btnJaAssistido = document.getElementById("btn-ja-assistido");

/* =========================
   CARREGAR DETALHES
========================= */
async function carregarDetalhes() {
  try {
    const res = await fetch(
      `https://tcc-cinematch.onrender.com/filmes/detalhes/${tmdbId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!res.ok) throw new Error("Erro ao buscar detalhes");

    const filme = await res.json();

    poster.src = IMG_URL + filme.poster_path;
    titulo.textContent = filme.title;
    sinopse.textContent = filme.overview || "Sem sinopse disponível";

    // créditos
    const crew = filme.credits?.crew || [];
    const cast = filme.credits?.cast || [];

    const diretorObj = crew.find(p => p.job === "Director");
    diretor.textContent = diretorObj ? diretorObj.name : "Não informado";

    atores.textContent = cast.slice(0, 5).map(a => a.name).join(", ");

  } catch (err) {
    console.error("Erro detalhes:", err);
  }
}

/* =========================
   STATUS
========================= */
async function carregarStatus() {
  const res = await fetch(
    `https://tcc-cinematch.onrender.com/filmes/status/${tmdbId}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (!res.ok) return;

  const status = await res.json();

  if (status.assistirDepois) btnAssistirDepois.classList.add("ativo");
  if (status.jaAssistido) btnJaAssistido.classList.add("ativo");
}

/* =========================
   BOTÕES
========================= */
btnAssistirDepois.addEventListener("click", async () => {
  await fetch(
    "https://tcc-cinematch.onrender.com/filmes/assistir-depois",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ tmdb_id: tmdbId })
    }
  );
});

btnJaAssistido.addEventListener("click", async () => {
  await fetch(
    "https://tcc-cinematch.onrender.com/filmes/ja-assistidos",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ tmdb_id: tmdbId })
    }
  );
});

/* =========================
   INIT
========================= */
(async () => {
  await carregarDetalhes();
  await carregarStatus();
})();
