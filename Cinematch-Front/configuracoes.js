const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "index.html";
}

/* =========================
   GÊNEROS (UI)
========================= */
const allGenres = [
  "Ação",
  "Drama",
  "Comédia",
  "Terror",
  "Ficção Científica",
  "Romance",
  "Animação",
  "Fantasia",
  "Suspense"
];

let selectedGenres = []; // sempre NORMALIZADO (minúsculo)

/* =========================
   NORMALIZAR
========================= */
function normalizarGenero(genero) {
  return genero
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function formatarGenero(genero) {
  return genero
    .replace(/_/g, " ")
    .replace(/\b\w/g, l => l.toUpperCase());
}

/* =========================
   CARREGAR USUÁRIO
========================= */
async function carregarUsuario() {
  const res = await fetch("https://tcc-cinematch.onrender.com/users/me", {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    showToast("Erro ao carregar dados do usuário.", "erro");
    return;
  }

  const usuario = await res.json();

  document.getElementById("nomeAtual").textContent = usuario.nome;
  document.getElementById("emailAtual").textContent = usuario.email;

  if (usuario.foto) {
    document.getElementById("fotoPerfil").src = usuario.foto;
  }

  if (Array.isArray(usuario.preferences)) {
    selectedGenres = usuario.preferences;
    document.getElementById("generosAtuais").textContent =
      selectedGenres.map(formatarGenero).join(", ");
  }
}

carregarUsuario();

/* =========================
   SALVAR BACKEND
========================= */
async function salvarBackend(dados) {
  const res = await fetch("https://tcc-cinematch.onrender.com/users/me", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(dados)
  });

  if (!res.ok) {
    showToast("Erro ao salvar alterações.", "erro");
    return false;
  }

  return true;
}

/* =========================
   EDITAR GÊNEROS
========================= */
function editarPreferencias() {
  const container = document.getElementById("generoContainer");
  const btn = event.target;

  if (container.hidden) {
    container.hidden = false;
    btn.textContent = "Salvar gêneros";
    return;
  }

  if (!selectedGenres.length) {
    showToast("Selecione pelo menos um gênero.", "erro");
    return;
  }

  salvarBackend({ preferences: selectedGenres });
  document.getElementById("generosAtuais").textContent =
    selectedGenres.map(formatarGenero).join(", ");

  container.hidden = true;
  btn.textContent = "Editar gêneros favoritos";

  showToast("Preferências atualizadas!", "sucesso");
}

/* =========================
   DROPDOWN
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("genreInput");
  const dropdown = document.getElementById("genreDropdown");
  const selectedContainer = document.getElementById("selectedGenres");

  function renderDropdown() {
    dropdown.innerHTML = "";
    allGenres.forEach(nome => {
      const valor = normalizarGenero(nome);
      if (!selectedGenres.includes(valor)) {
        const div = document.createElement("div");
        div.className = "genre-option";
        div.textContent = nome;
        div.onclick = () => addGenre(valor);
        dropdown.appendChild(div);
      }
    });
  }

  function renderSelected() {
    selectedContainer.innerHTML = "";
    selectedGenres.forEach(g => {
      const tag = document.createElement("div");
      tag.className = "genre-tag";
      tag.innerHTML = `${formatarGenero(g)} <span>×</span>`;
      tag.querySelector("span").onclick = () => removeGenre(g);
      selectedContainer.appendChild(tag);
    });
  }

  function addGenre(g) {
    selectedGenres.push(g);
    renderSelected();
    renderDropdown();
    dropdown.style.display = "none";
  }

  function removeGenre(g) {
    selectedGenres = selectedGenres.filter(x => x !== g);
    renderSelected();
    renderDropdown();
  }

  input.addEventListener("click", () => {
    dropdown.style.display =
      dropdown.style.display === "block" ? "none" : "block";
    renderDropdown();
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".genre-select")) {
      dropdown.style.display = "none";
    }
  });

  renderSelected();
});

/* =========================
   LOGOUT
========================= */
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

/* =========================
   TOAST
========================= */
function showToast(mensagem, tipo = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;
  toast.textContent = mensagem;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
