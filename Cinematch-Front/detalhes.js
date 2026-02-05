document.addEventListener("DOMContentLoaded", () => {
  const btnAssistirDepois = document.getElementById("btn-assistir-depois");
  const btnJaAssistido = document.getElementById("btn-ja-assistido");

  const posterImg = document.getElementById("poster");
  const tituloEl = document.getElementById("titulo");
  const sinopseEl = document.getElementById("sinopse");

  const token = localStorage.getItem("token");
  const params = new URLSearchParams(window.location.search);
  const filmeId = params.get("id");

  if (!token || !filmeId) {
    console.error("❌ Token ou filmeId não encontrados");
    return;
  }

  /* =========================
     CARREGAR DETALHES (BACKEND)
  ========================= */
  async function carregarDetalhes() {
    try {
      const res = await fetch(
        `https://tcc-cinematch.onrender.com/filmes/detalhes/${filmeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) throw new Error("Erro ao buscar detalhes");

      const filme = await res.json();

      posterImg.src = `https://image.tmdb.org/t/p/w500${filme.poster_path}`;
      tituloEl.textContent = filme.title;
      sinopseEl.textContent =
        filme.overview || "Sem sinopse disponível.";

    } catch (err) {
      console.error("Erro detalhes:", err);
    }
  }

  /* =========================
     STATUS DO FILME
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
      console.error("Erro status:", err);
    }
  }

  /* =========================
     ASSISTIR DEPOIS
  ========================= */
  btnAssistirDepois.addEventListener("click", async () => {
    try {
      const res = await fetch(
        `https://tcc-cinematch.onrender.com/filmes/assistir-depois`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ tmdb_id: filmeId })
        }
      );

      if (res.ok) {
        btnAssistirDepois.classList.add("ativo");
        btnJaAssistido.classList.remove("ativo");
      }

    } catch (err) {
      console.error("Erro assistir depois:", err);
    }
  });

  /* =========================
     JÁ ASSISTIDO
  ========================= */
  btnJaAssistido.addEventListener("click", async () => {
    try {
      const res = await fetch(
        `https://tcc-cinematch.onrender.com/filmes/ja-assistidos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ tmdb_id: filmeId })
        }
      );

      if (res.ok) {
        btnJaAssistido.classList.add("ativo");
        btnAssistirDepois.classList.remove("ativo");
      }

    } catch (err) {
      console.error("Erro já assistido:", err);
    }
  });

  carregarDetalhes();
  verificarStatus();
});
