const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

async function carregarUsuarioTopo() {
    const res = await fetch("https://tcc-cinematch.onrender.com/users/me", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!res.ok) return;

    const usuario = await res.json();

    const nome = document.getElementById("nomeTopo");
    const foto = document.getElementById("fotoTopo");

    if (nome) nome.textContent = usuario.nome;
    if (foto && usuario.foto) foto.src = usuario.foto;
}


async function carregarListas() {
    const res = await fetch("https://tcc-cinematch.onrender.com/listas", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const listas = await res.json();
    const container = document.getElementById("listas");

    container.innerHTML = "";

    if (listas.length === 0) {
        container.innerHTML = "<p>Você ainda não tem listas.</p>";
        return;
    }

    for (const lista of listas) {
        const div = document.createElement("div");
        div.classList.add("config-bloco");

        div.innerHTML = `
      <h3>${lista.nome}</h3>
      <div id="lista-${lista.id}" style="display:flex;gap:15px;flex-wrap:wrap"></div>
    `;

        container.appendChild(div);

        carregarFilmesDaLista(lista.id);
    }
}

async function carregarFilmesDaLista(listaId) {
    const res = await fetch(`https://tcc-cinematch.onrender.com/listas/${listaId}/filmes`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const filmes = await res.json();
    const container = document.getElementById(`lista-${listaId}`);

    if (filmes.length === 0) {
        container.innerHTML = "<p>Lista vazia</p>";
        return;
    }

    filmes.forEach(filme => {
        const card = document.createElement("div");
        card.classList.add("filme");

        card.innerHTML = `
      <img src="${filme.poster}" style="width:140px;border-radius:8px">
      <h4 style="max-width:140px">${filme.titulo}</h4>
    `;

        card.onclick = () => {
            window.location.href = `detalhes.html?id=${filme.tmdb_id}&from=listas`;
        };

        container.appendChild(card);
    });
}
(async () => {
  await carregarUsuarioTopo();
  await carregarListas();
})();
