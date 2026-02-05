const API_URL = "https://tcc-cinematch.onrender.com";
const MAX_GENEROS = 3;

/* =========================
   GÊNEROS
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

let selectedGenres = [];

/* =========================
   DROPDOWN GÊNEROS
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("genreInput");
  const dropdown = document.getElementById("genreDropdown");
  const selectedContainer = document.getElementById("selectedGenres");

  function renderDropdown() {
    dropdown.innerHTML = "";
    allGenres
      .filter(g => !selectedGenres.includes(g))
      .forEach(genre => {
        const div = document.createElement("div");
        div.className = "genre-option";
        div.textContent = genre;
        div.onclick = () => addGenre(genre);
        dropdown.appendChild(div);
      });
  }

  function renderSelected() {
    selectedContainer.innerHTML = "";
    selectedGenres.forEach(genre => {
      const tag = document.createElement("div");
      tag.className = "genre-tag";
      tag.innerHTML = `${genre} <span>×</span>`;
      tag.querySelector("span").onclick = () => removeGenre(genre);
      selectedContainer.appendChild(tag);
    });
  }

function addGenre(genre) {
  if (selectedGenres.includes(genre)) return;

  if (selectedGenres.length >= MAX_GENEROS) {
    showToast("Você pode escolher no máximo 3 gêneros.", "erro");
    return;
  }

  selectedGenres.push(genre);
  renderSelected();
  renderDropdown();
}

  function removeGenre(genre) {
    selectedGenres = selectedGenres.filter(g => g !== genre);
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
});

/* =========================
   LOGIN
========================= */
async function login() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  if (!email || !senha) {
    showToast("Preencha e-mail e senha.", "erro");
    return;
  }

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha })
  });

  if (!res.ok) {
    showToast("E-mail ou senha inválidos.", "erro");
    return;
  }

  const data = await res.json();
  localStorage.setItem("token", data.token);

  showToast("Login realizado com sucesso!", "sucesso");

  setTimeout(() => {
    window.location.href = "home.html";
  }, 1000);
}

/* =========================
   REGISTRO
========================= */
async function registrar() {
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  if (!nome || !email || !senha) {
    showToast("Preencha todos os campos.", "erro");
    return;
  }

  if (senha.length < 6) {
    showToast("A senha deve ter no mínimo 6 caracteres.", "erro");
    return;
  }

  if (selectedGenres.length === 0) {
    showToast("Escolha pelo menos um gênero.", "erro");
    return;
  }

   if (selectedGenres.length > 3) {
  showToast("Escolha no máximo 3 gêneros.", "erro");
  return;
}

  const normalizedGenres = selectedGenres.map(g =>
    g
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_")
  );

  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome,
      email,
      senha,
      preferences: normalizedGenres
    })
  });

  if (!res.ok) {
    showToast("Erro ao realizar cadastro. Tente novamente.", "erro");
    return;
  }

  showToast("Cadastro realizado com sucesso!", "sucesso");

  setTimeout(() => {
    window.location.href = "index.html";
  }, 1200);
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
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

