const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "index.html";
}

/* =========================
   CARREGAR USUÁRIO (BACKEND)
========================= */
async function carregarUsuario() {
  try {
    const res = await fetch("https://tcc-cinematch.onrender.com/users/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) return;

    const usuario = await res.json();

    document.getElementById("nomeAtual").textContent = usuario.nome;
    document.getElementById("emailAtual").textContent = usuario.email;

    if (usuario.foto) {
      document.getElementById("fotoPerfil").src = usuario.foto;
    }

  } catch (err) {
    console.error("Erro ao carregar usuário", err);
  }
}

carregarUsuario();

/* =========================
   FUNÇÃO AUXILIAR BACKEND
========================= */
async function salvarBackend(dados) {
  await fetch("https://tcc-cinematch.onrender.com/users/me", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(dados)
  });
}

/* =========================
   EDIÇÕES (TOGGLE)
========================= */
async function editarNome() {
  const input = document.getElementById("nomeInput");

  if (input.hidden) {
    input.hidden = false;
    input.focus();
    return;
  }

  const nome = input.value;
  if (!nome) return;

  await salvarBackend({ nome });

  document.getElementById("nomeAtual").textContent = nome;
  localStorage.setItem("nomeUsuario", nome);

  input.hidden = true;
}

async function editarEmail() {
  const input = document.getElementById("emailInput");

  if (input.hidden) {
    input.hidden = false;
    input.focus();
    return;
  }

  const email = input.value;
  if (!email) return;

  await salvarBackend({ email });

  document.getElementById("emailAtual").textContent = email;
  localStorage.setItem("emailUsuario", email);

  input.hidden = true;
}

function editarSenha() {
  document.getElementById("senhaInput").hidden = false;
}

function editarFoto() {
  document.getElementById("fotoInput").click();
}

/* =========================
   LOGOUT
========================= */
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}
