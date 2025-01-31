import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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

// Deixa a página invisível até confirmar se o usuário é admin
document.body.style.display = "none";

// Verifica se o usuário tem permissão para acessar a página admin
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userId = user.uid;
        const userRef = ref(db, `usuarios/${userId}`);

        try {
            const snapshot = await get(userRef);

            if (snapshot.exists() && snapshot.val().tipo === "admin") {
                document.body.style.display = "block"; // Exibe a página se for admin
                carregarArranchamentos(); // Carrega os dados
            } else {
                alert("Acesso negado! Você não tem permissão para acessar esta página.");
                window.location.replace("home.html");
            }
        } catch (error) {
            console.error("Erro ao buscar dados do usuário:", error);
            window.location.replace("home.html");
        }
    } else {
        window.location.replace("index.html"); // Redireciona para login se não estiver autenticado
    }
});

// Função para carregar os arranchamentos do Firebase
async function carregarArranchamentos() {
    try {
        const tabelaBody = document.getElementById("tabela-arrachamentos-body");

        if (!tabelaBody) {
            console.error("Elemento tabela-arrachamentos-body não encontrado no DOM.");
            return;
        }

        const dbRef = ref(db, "arrachamentos/");
        const snapshot = await get(dbRef);

        if (!snapshot.exists()) {
            tabelaBody.innerHTML = "<tr><td colspan='3'>Nenhum arranchamento encontrado.</td></tr>";
            return;
        }

        const arranchamentos = snapshot.val();
        tabelaBody.innerHTML = ""; // Limpa a tabela antes de preenchê-la

        Object.entries(arranchamentos).forEach(([nomeGuerra, detalhes]) => {
            const dias = detalhes.dias || {};

            Object.entries(dias).forEach(([data, refeicoes]) => {
                const linha = document.createElement("tr");
                linha.innerHTML = `
                    <td>${nomeGuerra}</td>
                    <td>${data}</td>
                    <td>${refeicoes.join(", ")}</td>
                `;
                tabelaBody.appendChild(linha);
            });
        });

        console.log("Dados carregados:", arranchamentos);
    } catch (error) {
        console.error("Erro ao carregar arranchamentos:", error);
        alert("Erro ao carregar os dados. Verifique o console para mais detalhes.");
    }
}