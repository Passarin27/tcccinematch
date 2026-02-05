document.addEventListener("DOMContentLoaded", () => {
  const btnAssistirDepois = document.getElementById("btn-assistir-depois");
  const btnJaAssistido = document.getElementById("btn-ja-assistido");

  const posterImg = document.getElementById("poster");
  const tituloEl = document.getElementById("titulo");
  const sinopseEl = document.getElementById("sinopse");
  const diretorEl = document.getElementById("diretor");
  const atoresEl = document.getElementById("atores");

  if (!btnAssistirDepois || !btnJaAssistido) {
    console.error("❌ Botões não encontrados no DOM");
    return;
  }

  const token = localStorage.getItem("token");
  const params = new URLSearchParams(window.location.search);
  const filmeId = params.get("id");

  if (!token || !filmeId) {
    console.error("❌ Token ou filmeId não encontrados");
    return;
  }

  const TMDB_TOKEN = "SEU_TOKEN_TMDB_AQUI";

  /* =========================
     CARREGAR DETALHES DO FILME
  ========================= */
  async function carregarDetalhes() {
    try {
      const [filmeRes, creditosRes] = await Promise.all([
        fetch(
          `https://api.themoviedb.org/3/movie/${filmeId}?language=pt-BR`,
          {
            headers: {
              Authorization: `Bearer ${TMDB_TOKEN}`
            }
          }
        ),
        fetch(
          `https://api.themoviedb.org/3/movie/${filmeId}/credits?language=pt-BR`,
          {
            headers: {
              Authorization: `Bearer ${TMDB_TOKEN}`
            }
          }
        )
      ]);

      const filme = await filmeRes.json();
      const creditos = await creditosRes.json();

      if (posterImg && filme.poster_path) {
        posterImg.src = `https://image.tmdb.org/t/p/w500${filme.poster_path}`;
      }

      if (tituloEl) tituloEl.textContent = filme.title;
      if (sinopseEl) sinopseEl.textContent = filme.overview || "Sem sinopse disponível.";

      const diretor = creditos.crew.find(p => p.job === "Director");
      if (diretorEl) diretorEl.textContent = diretor ? diretor.name : "-";

      const atores = creditos.cast
        .slice(0, 5)
        .map(a => a.name)
        .join(", ");

      if (atoresEl) atoresEl.textContent = atores || "-";

    } catch (err) {
      console.error("Erro ao carregar detalhes do filme:", err);
    }
  }

  /* =========================
     VERIFICAR STATUS
  ========================= */
  async function verificarStatus() {
    try {
      const res = await fetch(
        `https://tcc-cinematch.onrender.com/filmes/status/${filmeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) return;

      const status = await res.json();

      btnAssistirDepois.classList.toggle("ativo", status.assistirDepois);
      btnJaAssistido.classList.toggle("ativo", status.jaAssistido);

    } catch (err) {
      console.error("Erro ao verificar status:", err);
    }
  }

  /* =========================
     ASSISTIR DEPOIS
  ========================= */
  btnAssistirDepois.addEventListener("click", async () => {
    const ativo = btnAssistirDepois.classList.contains("ativo");

    try {
      const url = ativo
        ? `https://tcc-cinematch.onrender.com/filmes/assistir-depois/${filmeId}`
        : `https://tcc-cinematch.onrender.com/filmes/assistir-depois`;

      const res = await fetch(url, {
        method: ativo ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: ativo ? null : JSON.stringify({ tmdb_id: filmeId })
      });

      if (res.ok) {
        btnAssistirDepois.classList.toggle("ativo", !ativo);
      }

    } catch (err) {
      console.error("Erro Assistir Depois:", err);
    }
  });

  /* =========================
     JÁ ASSISTIDO
  ========================= */
  btnJaAssistido.addEventListener("click", async () => {
    const ativo = btnJaAssistido.classList.contains("ativo");

    try {
      const url = ativo
        ? `https://tcc-cinematch.onrender.com/filmes/ja-assistidos/${filmeId}`
        : `https://tcc-cinematch.onrender.com/filmes/ja-assistidos`;

      const res = await fetch(url, {
        method: ativo ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: ativo ? null : JSON.stringify({ tmdb_id: filmeId })
      });

      if (res.ok) {
        btnJaAssistido.classList.toggle("ativo", !ativo);
      }

    } catch (err) {
      console.error("Erro Já Assistido:", err);
    }
  });

  carregarDetalhes();
  verificarStatus();
});
