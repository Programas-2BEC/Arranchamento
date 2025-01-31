// Importa Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA01wXFd_9UEDo8JNPmRDhgWVMLe1PSv-I",
    authDomain: "bec-214c1.firebaseapp.com",
    databaseURL: "https://bec-214c1-default-rtdb.firebaseio.com",
    projectId: "bec-214c1",
    storageBucket: "bec-214c1.firebasestorage.app",
    messagingSenderId: "156145970714",
    appId: "1:156145970714:web:c1a1d3ff9204c01c7beba3",
    measurementId: "G-97L5Z8YB45"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Elementos DOM
const diasContainer = document.getElementById("dias-semana");
const periodosContainer = document.getElementById("periodos-container");
const previewLista = document.getElementById("lista-preview");
const enviarButton = document.getElementById("enviar");
const userInfo = document.getElementById("user-name");
const logoutButton = document.getElementById("logout-button");

let nomeGuerraUsuario = null;
let selecoes = {};

// Aguarda o carregamento do usuário autenticado
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userId = user.uid;
        const userRef = ref(db, `usuarios/${userId}`);

        try {
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                const dadosUsuario = snapshot.val();
                nomeGuerraUsuario = `${dadosUsuario.graduacao} ${dadosUsuario.nomeGuerra}`;
                document.getElementById("user-name").textContent = nomeGuerraUsuario;
                console.log("Usuário autenticado:", nomeGuerraUsuario);
            } else {
                console.error("Erro: Usuário não encontrado no banco de dados!");
            }
        } catch (error) {
            console.error("Erro ao buscar dados do usuário:", error);
        }
    } else {
        console.warn("Nenhum usuário autenticado! Redirecionando para login...");
        window.location.replace("index.html");
    }
});

// Logout
logoutButton.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
});

// Obtém os próximos dias da semana
const hoje = new Date();
const semana = Array.from({ length: 7 }, (_, i) => {
    const dia = new Date(hoje);
    dia.setDate(hoje.getDate() + i);
    return {
        nome: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"][dia.getDay()],
        data: dia.toISOString().split("T")[0],
        display: dia.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
    };
});

// Renderiza os botões dos dias
semana.forEach(({ nome, data, display }, index) => {
    const button = document.createElement("button");
    button.textContent = `${nome} (${display})`;
    button.dataset.data = data;
    if (index === 0) button.classList.add("active");
    button.addEventListener("click", () => selecionarDia(button));
    diasContainer.appendChild(button);
    selecoes[data] = [];
});

// Inicializa os períodos do primeiro dia
atualizarPeriodos(semana[0].data);

// Seleciona um dia e carrega os períodos correspondentes
function selecionarDia(button) {
    salvarSelecoes(document.querySelector("#dias-semana button.active").dataset.data);
    document.querySelectorAll("#dias-semana button").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    atualizarPeriodos(button.dataset.data);
}

// Atualiza os períodos para o dia selecionado
function atualizarPeriodos(data) {
    periodosContainer.innerHTML = "";
    const periodos = ["Café da Manhã", "Almoço", "Janta", "Ceia"];
    
    periodos.forEach(periodo => {
        const label = document.createElement("label");
        label.innerHTML = `
            <input type="checkbox" data-data="${data}" value="${periodo}" ${
                selecoes[data] && selecoes[data].includes(periodo) ? "checked" : ""
            }>
            ${periodo}
        `;
        label.querySelector("input").addEventListener("change", atualizarPrevia);
        periodosContainer.appendChild(label);
    });
}

// Salva os períodos selecionados
function salvarSelecoes(data) {
    const checkboxes = periodosContainer.querySelectorAll("input:checked");
    selecoes[data] = Array.from(checkboxes).map(checkbox => checkbox.value);
}

// Atualiza a prévia dos arranchamentos
function atualizarPrevia() {
    salvarSelecoes(document.querySelector("#dias-semana button.active").dataset.data);
    previewLista.innerHTML = "";
    
    Object.keys(selecoes).forEach(data => {
        if (selecoes[data].length > 0) {
            const li = document.createElement("li");
            li.textContent = `${data}: ${selecoes[data].join(", ")}`;
            previewLista.appendChild(li);
        }
    });

    // Ativa ou desativa o botão "Enviar" dependendo se há seleções
    enviarButton.disabled = Object.keys(selecoes).every(data => selecoes[data].length === 0);
}

// Envio dos dados para o Firebase
enviarButton.addEventListener("click", async () => {
    if (!nomeGuerraUsuario) {
        alert("Erro: Usuário não autenticado!");
        return;
    }

    try {
        await set(ref(db, `arrachamentos/${nomeGuerraUsuario}`), { dias: selecoes });

        alert("Arranchamento salvo com sucesso!");
        console.log("Dados enviados:", { nomeGuerra: nomeGuerraUsuario, selecoes });

        // Limpa a seleção após o envio
        previewLista.innerHTML = "";
        Object.keys(selecoes).forEach(data => selecoes[data] = []);
        atualizarPeriodos(semana[0].data);
    } catch (error) {
        console.error("Erro ao enviar arranchamento:", error);
        alert("Erro ao enviar os dados. Verifique o console para mais detalhes.");
    }
});

// Carrega os arranchamentos do usuário logado no Firebase
async function carregarArranchamentos(nomeGuerra) {
    try {
        const snapshot = await get(ref(db, `arrachamentos/${nomeGuerra}`));
        if (snapshot.exists()) {
            selecoes = snapshot.val().dias || {};
            console.log("Arranchamentos carregados:", selecoes);
            atualizarPeriodos(semana[0].data);
        } else {
            console.log("Nenhum arranchamento encontrado.");
        }
    } catch (error) {
        console.error("Erro ao carregar arranchamentos:", error);
    }
}
