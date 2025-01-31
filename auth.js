// Importa os módulos necessários do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
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

// Obtém os elementos HTML necessários
const loginCard = document.getElementById("login-card"); // Card de Login
const signupCard = document.getElementById("signup-card"); // Card de Registro
const showRegisterLink = document.getElementById("show-register"); // Link "Registre-se"
const showLoginLink = document.getElementById("show-login"); // Link "Voltar a Tela de Login"

// Evento para exibir a tela de registro e ocultar a tela de login
showRegisterLink.addEventListener("click", (e) => {
    e.preventDefault(); // Evita o comportamento padrão do link
    loginCard.classList.remove("active"); // Remove a classe ativa do card de login
    signupCard.classList.add("active"); // Adiciona a classe ativa ao card de registro
});

// Evento para exibir a tela de login e ocultar a tela de registro
showLoginLink.addEventListener("click", (e) => {
    e.preventDefault(); // Evita o comportamento padrão do link
    signupCard.classList.remove("active"); // Remove a classe ativa do card de registro
    loginCard.classList.add("active"); // Adiciona a classe ativa ao card de login
});

// Exibe a tela de login por padrão ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    loginCard.classList.add("active"); // Adiciona a classe ativa ao card de login
});

// Registro de Usuário
document.getElementById("signup-button").addEventListener("click", async (e) => {
    e.preventDefault();

    // Obtém os valores dos campos
    const graduacao = document.getElementById("signup-graduacao").value;
    let nomeGuerra = document.getElementById("signup-nomeGuerra").value.trim();
    const senha = document.getElementById("signup-password").value;
    const confirmSenha = document.getElementById("signup-confirm-password").value;

    // Validação: verifica se os campos estão preenchidos
    if (!graduacao || !nomeGuerra || !senha || !confirmSenha) {
        alert("Preencha todos os campos!");
        return;
    }

    // Validação: verifica se as senhas coincidem
    if (senha !== confirmSenha) {
        alert("As senhas não coincidem!");
        return;
    }

    // Formatar Nome de Guerra (primeira letra de cada palavra maiúscula)
    nomeGuerra = nomeGuerra
        .toLowerCase()
        .split(" ")
        .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
        .join(" ");

    // Criar um email fictício com base no nome de guerra
    const email = `${graduacao.toLowerCase()}_${nomeGuerra.replace(/\s+/g, "_")}@exemplo.com`;

    try {
        // Registra o usuário no Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        // Salvar informações no banco de dados Firebase
        await set(ref(db, "usuarios/" + user.uid), {
            graduacao: graduacao,
            nomeGuerra: nomeGuerra,
            tipo: "usuario"
        });

        alert("Registro realizado com sucesso!");
        document.getElementById("show-login").click(); // Voltar à tela de login
    } catch (error) {
        // Verifica se o erro é de "email já cadastrado"
        if (error.code === "auth/email-already-in-use") {
            alert("Usuário já cadastrado!");
        } else {
            alert("Erro ao registrar: " + error.message);
            console.error(error);
        }
    }
});

// Login de Usuário
document.getElementById("login-button").addEventListener("click", async (e) => {
    e.preventDefault();

    const nomeGuerra = document.getElementById("login-nomeGuerra").value.trim();
    const senha = document.getElementById("login-senha").value;

    // Validação: verifica se os campos estão preenchidos
    if (!nomeGuerra || !senha) {
        alert("Preencha todos os campos!");
        return;
    }

    // Criar o mesmo e-mail que foi salvo no Firebase durante o registro
    const email = `${nomeGuerra.replace(" ","_").replace(/\s+/g, "_")}@exemplo.com`;

    try {
        // Login com Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);
        alert("Login bem-sucedido!");
        console.log("Usuário logado:", userCredential.user);

        // Redireciona para a página principal
        window.location.href = "home.html";
    } catch (error) {
        console.error("Erro ao fazer login:", error.message);
        alert("Erro ao fazer login: " + error.message);
    }
});