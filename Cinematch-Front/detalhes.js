const btnAssistirDepois = document.getElementById("btn-assistir-depois");
const btnJaAssistido = document.getElementById("btn-ja-assistido");

/* =========================
   VERIFICAR STATUS
========================= */
async function verificarStatus() {
  const res = await fetch(
    `https://tcc-cinematch.onrender.com/filmes/status/${filmeId}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (!res.ok) return;

  const status = await res.json();

  if (status.assistirDepois) {
    btnAssistirDepois.classList.add("ativo");
  }

  if (status.jaAssistido) {
    btnJaAssistido.classList.add("ativo");
  }
}

/* =========================
   TOGGLE ASSISTIR DEPOIS
========================= */
btnAssistirDepois.addEventListener("click", async () => {
  const ativo = btnAssistirDepois.classList.contains("ativo");

  await fetch(
    `https://tcc-cinematch.onrender.com/listas/assistir-depois`,
    {
      method: ativo ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ tmdb_id: filmeId })
    }
  );

  btnAssistirDepois.classList.toggle("ativo", !ativo);
});

/* =========================
   TOGGLE JÁ ASSISTIDO
========================= */
btnJaAssistido.addEventListener("click", async () => {
  const ativo = btnJaAssistido.classList.contains("ativo");

  await fetch(
    `https://tcc-cinematch.onrender.com/listas/ja-assistidos`,
    {
      method: ativo ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ tmdb_id: filmeId })
    }
  );

  btnJaAssistido.classList.toggle("ativo", !ativo);
});

/* =========================
   INIT
========================= */
verificarStatus();
