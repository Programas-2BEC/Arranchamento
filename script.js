// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDRCikmAmHNQvyD4Mk6Q6izTwmAK41CxuQ",
    authDomain: "arranchamento-2bec.firebaseapp.com",
    databaseURL: "https://arranchamento-2bec-default-rtdb.firebaseio.com",
    projectId: "arranchamento-2bec",
    storageBucket: "arranchamento-2bec.firebasestorage.app",
    messagingSenderId: "358113980416",
    appId: "1:358113980416:web:5782e6e35198116360e8e5",
    measurementId: "G-415P8ZB55G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const diasContainer = document.getElementById("dias-semana");
const periodosContainer = document.getElementById("periodos-container");
const previewLista = document.getElementById("lista-preview");
const nomeGuerraInput = document.getElementById("nome-guerra");
const enviarButton = document.getElementById("enviar");

// Objeto para armazenar as seleções de cada dia
const selecoes = {};

// Obter a data atual e calcular os próximos dias até domingo
const hoje = new Date();
const diaAtual = hoje.getDay();
const diasRestantes = diaAtual === 0 ? 0 : 8 - diaAtual;
const semana = Array.from({ length: diasRestantes }, (_, i) => {
    const dia = new Date(hoje);
    dia.setDate(hoje.getDate() + i);
    return {
        nome: diasSemana[dia.getDay()],
        data: dia.toISOString().split("T")[0],
        display: dia.toLocaleDateString("pt-BR", { day: "numeric", month: "numeric" })
    };
});

// Renderizar os botões dos dias
semana.forEach(({ nome, data, display }, index) => {
    const button = document.createElement("button");
    button.textContent = `${nome} (${display})`;
    button.dataset.data = data;
    if (index === 0) button.classList.add("active");
    button.addEventListener("click", () => selecionarDia(button));
    diasContainer.appendChild(button);

    // Inicializar seleções para cada dia
    selecoes[data] = [];
});

nomeGuerraInput.addEventListener("input", () => {
    enviarButton.disabled = nomeGuerraInput.value.trim() === "";
});

atualizarPeriodos(semana[0].data);

function selecionarDia(button) {
    salvarSelecoes(document.querySelector("#dias-semana button.active").dataset.data);
    document.querySelectorAll("#dias-semana button").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    atualizarPeriodos(button.dataset.data);
}

function atualizarPeriodos(data) {
    periodosContainer.innerHTML = "";
    const periodos = ["Café da Manhã", "Almoço", "Janta", "Ceia"];
    periodos.forEach(periodo => {
        const label = document.createElement("label");
        label.innerHTML = `
            <input type="checkbox" data-data="${data}" value="${periodo}" ${
            selecoes[data].includes(periodo) ? "checked" : ""
        }>
            ${periodo}
        `;
        label.querySelector("input").addEventListener("change", atualizarPrevia);
        periodosContainer.appendChild(label);
    });
}

function salvarSelecoes(data) {
    const checkboxes = periodosContainer.querySelectorAll("input:checked");
    selecoes[data] = Array.from(checkboxes).map(checkbox => checkbox.value);
}

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
}


enviarButton.addEventListener("click", async () => {
    const nomeGuerra = nomeGuerraInput.value.trim();
    if (!nomeGuerra) {
        alert("Por favor, preencha o Nome de Guerra.");
        return;
    }

    try {
        // Referência ao caminho onde os dados serão armazenados
        set(ref(db,'arrachamentos/' + nomeGuerra),{
            dias : selecoes
        });
        
        alert('Dados enviados com sucesso!');
        console.log('Dados enviados:', { nomeDeGuerra: nomeGuerra, selecoes });
    } catch (error) {
        console.error('Erro ao enviar dados:', error);
        alert('Erro ao enviar os dados. Verifique o console para mais detalhes.');
    }
});