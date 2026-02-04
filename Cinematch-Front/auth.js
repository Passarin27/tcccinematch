const API_URL = "https://tcc-cinematch.onrender.com";

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

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha })
  });

  if (!res.ok) {
    alert("Email ou senha inválidos");
    return;
  }

  const data = await res.json();
  localStorage.setItem("token", data.token);
  window.location.href = "home.html";
}

/* =========================
   REGISTRO
========================= */
async function registrar() {
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome,
      email,
      senha,
      preferences: selectedGenres
    })
  });

  if (!res.ok) {
    alert("Erro ao cadastrar");
    return;
  }

  alert("Cadastro realizado com sucesso");
  window.location.href = "index.html";
}
