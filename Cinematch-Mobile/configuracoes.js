const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "index.html";
}

/* =========================
   CARREGAR USUÁRIO
========================= */
async function carregarUsuario() {
  const res = await fetch("https://tcc-cinematch.onrender.com/users/me", {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) return;

  const usuario = await res.json();

  document.getElementById("nomeAtual").textContent = usuario.nome;
  document.getElementById("emailAtual").textContent = usuario.email;

  if (usuario.foto) {
    document.getElementById("fotoPerfil").src = usuario.foto;
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
    const err = await res.json();
    alert(err.error || "Erro ao salvar");
  }
}

/* =========================
   EDITAR NOME
========================= */
async function editarNome() {
  const input = document.getElementById("nomeInput");

  if (input.hidden) {
    input.hidden = false;
    input.focus();
    return;
  }

  if (!input.value) return;

  await salvarBackend({ nome: input.value });
  document.getElementById("nomeAtual").textContent = input.value;
  input.hidden = true;
}

/* =========================
   EDITAR EMAIL
========================= */
async function editarEmail() {
  const input = document.getElementById("emailInput");

  if (input.hidden) {
    input.hidden = false;
    input.focus();
    return;
  }

  if (!input.value) return;

  await salvarBackend({ email: input.value });
  document.getElementById("emailAtual").textContent = input.value;
  input.hidden = true;
}

/* =========================
   EDITAR SENHA 
========================= */
async function editarSenha() {
  const input = document.getElementById("senhaInput");

  if (input.hidden) {
    input.hidden = false;
    input.focus();
    return;
  }

  if (!input.value || input.value.length < 6) {
    alert("Senha precisa ter no mínimo 6 caracteres");
    return;
  }

  await salvarBackend({ senha: input.value });

  alert("Senha alterada com sucesso!");
  input.value = "";
  input.hidden = true;
}

/* =========================
   FOTO (UPLOAD + BACKEND)
========================= */
const fotoInput = document.getElementById("fotoInput");

fotoInput.addEventListener("change", async () => {
  const file = fotoInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const uploadRes = await fetch("https://tcc-cinematch.onrender.com/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    if (!uploadRes.ok) throw new Error("Erro ao subir imagem");

    const { url } = await uploadRes.json();


    await salvarBackend({ foto: url });


    document.getElementById("fotoPerfil").src = url;

  } catch (err) {
    alert("Erro ao subir imagem");
    console.error(err);
  }
  window.editarFoto = function () {
    document.getElementById("fotoInput").click();
  };

});

/* =========================
   LOGOUT
========================= */
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}





