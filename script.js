/* ==========================================================
   🎴 YU-GI-OH! - PROJETO: COLEÇÃO DE CARTAS + VER ANIME
   ========================================================== */

/* ===============================
   🧩 SEÇÃO 1: ELEMENTOS DO DOM
   =============================== */
const input = document.getElementById("inputBusca");
const btnBuscar = document.getElementById("btnBuscar");
const btnLimpar = document.getElementById("btnLimpar");
const cardsContainer = document.getElementById("cards");
const favoritosContainer = document.getElementById("favoritos");
const placeholder = document.getElementById("placeholder");
const btnMostrarFavoritos = document.getElementById("btnMostrarFavoritos");
const favoritosSection = document.getElementById("favoritos-section");

// 🔸 Botão e container do anime
const btnVerAnime = document.getElementById("btnVerAnime");
const ygoTemporadasSection = document.getElementById("ygo-temporadas");

/* ===============================
   ❤️ SEÇÃO 2: FAVORITOS (LOCALSTORAGE)
   =============================== */
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

// Salva favoritos no localStorage
function salvarFavoritos() {
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

// Atualiza o container dos favoritos
function atualizarFavoritos() {
  favoritosContainer.innerHTML = "";

  favoritos.forEach(carta => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <img src="${carta.card_images[0].image_url}" alt="${carta.name}">
      <h3>${carta.name}</h3>
      <button class="btn-remover">❌ Remover</button>
    `;

    card.querySelector(".btn-remover").addEventListener("click", () => {
      favoritos = favoritos.filter(c => c.id !== carta.id);
      salvarFavoritos();
      atualizarFavoritos();
      verificarPlaceholder();
    });

    favoritosContainer.appendChild(card);
  });

  verificarPlaceholder();
}

// Mostra placeholder se não houver cartas nem favoritos
function verificarPlaceholder() {
  if (cardsContainer.children.length === 0 && favoritos.length === 0) {
    placeholder.style.display = "flex";
  } else {
    placeholder.style.display = "none";
  }
}

/* ===============================
   🔍 SEÇÃO 3: BUSCA DE CARTAS (API)
   =============================== */
// Exibe as cartas retornadas pela API
function exibirCartas(cartas) {
  cardsContainer.innerHTML = "";

  cartas.forEach(carta => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <img src="${carta.card_images[0].image_url}" alt="${carta.name}">
      <h3>${carta.name}</h3>
      <p>${carta.desc}</p>
      <button class="btn-favorito">❤️ Favorito</button>
    `;

    const btnFavorito = card.querySelector(".btn-favorito");
    btnFavorito.addEventListener("click", () => {
      if (!favoritos.find(c => c.id === carta.id)) {
        favoritos.push(carta);
      } else {
        favoritos = favoritos.filter(c => c.id !== carta.id);
      }
      salvarFavoritos();
      atualizarFavoritos();
    });

    cardsContainer.appendChild(card);
  });

  verificarPlaceholder();
}

// Busca carta por nome na API oficial do YGOPRODeck
async function buscarCarta(nome) {
  if (!nome) return;
  try {
    const response = await fetch(
      `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(nome)}`
    );
    const data = await response.json();

    if (!data.data) {
      cardsContainer.innerHTML = `<p class="aviso">⚠️ Nenhuma carta encontrada.</p>`;
      verificarPlaceholder();
      return;
    }

    exibirCartas(data.data);
  } catch (err) {
    cardsContainer.innerHTML = `<p class="aviso">⚠️ Erro ao buscar cartas.</p>`;
    console.error(err);
    verificarPlaceholder();
  }
}

/* ===============================
   🧠 SEÇÃO 4: EVENTOS DA INTERFACE
   =============================== */
btnBuscar.addEventListener("click", () => buscarCarta(input.value.trim()));

btnLimpar.addEventListener("click", () => {
  input.value = "";
  cardsContainer.innerHTML = "";
  verificarPlaceholder();
});

// Mostrar/ocultar favoritos
btnMostrarFavoritos.addEventListener("click", () => {
  if (favoritosSection.style.display === "none") {
    favoritosSection.style.display = "block";
  } else {
    favoritosSection.style.display = "none";
  }
});

// Inicialização de favoritos
atualizarFavoritos();
verificarPlaceholder();

/* ===============================
   🎥 SEÇÃO 5: VER ANIME (API RENDER)
   =============================== */
const YGO_API = "https://yugioh-api.onrender.com/api/episodios";
const modal = document.getElementById("ygo-modal");
const fechar = document.getElementById("ygo-fechar");
const video = document.getElementById("ygo-player");
const titulo = document.getElementById("ygo-titulo");

// Oculta a seção de anime ao iniciar
ygoTemporadasSection.style.display = "none";

// Alternar exibição do anime (botão “Ver Anime”)
btnVerAnime.addEventListener("click", () => {
  if (ygoTemporadasSection.style.display === "none") {
    ygoTemporadasSection.style.display = "block";
    btnVerAnime.textContent = "🎬 Ocultar Anime";
  } else {
    ygoTemporadasSection.style.display = "none";
    btnVerAnime.textContent = "🎥 Ver Anime";
  }
});

// Carregar episódios da API e agrupar por temporada
async function carregarEpisodios() {
  try {
    const res = await fetch(YGO_API);
    const episodios = await res.json();

    const temporadas = {};

    // Agrupa episódios por número de temporada
    episodios.forEach(ep => {
      if (!temporadas[ep.temporada]) temporadas[ep.temporada] = [];
      temporadas[ep.temporada].push(ep);
    });

    // Cria os blocos de temporadas dinamicamente
    Object.keys(temporadas)
      .sort((a, b) => a - b)
      .forEach(tempNum => {
        const temporadaDiv = document.createElement("div");
        temporadaDiv.classList.add("ygo-temporada");

        const tituloTemp = document.createElement("h2");
        tituloTemp.classList.add("ygo-temporada-titulo");
        tituloTemp.textContent = `Temporada ${tempNum}`;
        tituloTemp.addEventListener("click", () => {
          temporadaDiv.classList.toggle("ativa");
        });

        const episodiosDiv = document.createElement("div");
        episodiosDiv.classList.add("ygo-episodios");

        temporadas[tempNum].forEach(ep => {
          const epDiv = document.createElement("div");
          epDiv.classList.add("ygo-episodio");
          epDiv.innerHTML = `<h3>${ep.titulo}</h3>`;
          epDiv.addEventListener("click", () => abrirModal(ep.url, ep.titulo));
          episodiosDiv.appendChild(epDiv);
        });

        temporadaDiv.appendChild(tituloTemp);
        temporadaDiv.appendChild(episodiosDiv);
        ygoTemporadasSection.appendChild(temporadaDiv);
      });
  } catch (error) {
    ygoTemporadasSection.innerHTML = `<p style="color:red;">Erro ao carregar episódios: ${error.message}</p>`;
  }
}

// Abre o modal de vídeo
function abrirModal(url, nome) {
  video.src = url;
  titulo.textContent = nome;
  modal.classList.remove("hidden");
}

// Fecha o modal e pausa o vídeo
function fecharModal() {
  modal.classList.add("hidden");
  video.pause();
  video.src = "";
}

// Eventos do modal
fechar.addEventListener("click", fecharModal);
modal.addEventListener("click", e => {
  if (e.target === modal) fecharModal();
});

// Carrega episódios automaticamente
carregarEpisodios();


//Historia

document.addEventListener("DOMContentLoaded", function() {
  // Seleciona o cabeçalho
  const header = document.querySelector(".site-header");

  // Cria o botão "📜 História"
  const btnHistoria = document.createElement("button");
  btnHistoria.id = "btnHistoria";
  btnHistoria.textContent = "📜 História";
  btnHistoria.style.marginLeft = "5px";

  // Adiciona o botão ao cabeçalho (junto dos outros)
  if (header) {
    header.appendChild(btnHistoria);
  }

  // Pega a seção da história
  const historiaSecao = document.querySelector("#historia-yu-gi-oh");

  // Esconde a seção ao carregar
  if (historiaSecao) {
    historiaSecao.style.display = "none";
  }

  // Alterna visibilidade ao clicar no botão
  btnHistoria.addEventListener("click", () => {
    if (!historiaSecao) return;

    if (historiaSecao.style.display === "none") {
      historiaSecao.style.display = "block";
      btnHistoria.textContent = "❌ Fechar História";
    } else {
      historiaSecao.style.display = "none";
      btnHistoria.textContent = "📜 História";
    }
  });
});









/* ==========================================================
   🔚 FIM DO SCRIPT
   ========================================================== */
