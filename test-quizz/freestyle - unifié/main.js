// --- 1. BASE DE DONNÉES ---
const database = [
    {
        imageObjet: "./img/arc-mahito.png",
        choix: [
            "Le vent se lève",
            "Kiki la petite sorcière",
            "Le Garçon et le Héron",
        ],
        bonneReponse: "Le Garçon et le Héron",
        anecdote:
            "L'arc de Mahito est inspiré des arcs traditionnels japonais utilisés dans le kyūdō.",
        imageAnecdote: "./img/Arc-Mahito-ex.png",
    },
    // Tu pourras ajouter tes 21 autres objets ici
];

let currentIndex = 0;
let score = 0;

// --- 2. FONCTIONS DE NAVIGATION ---

// Fermer les règles et masquer l'interface complète
function closeRules() {
    const rulesScreen = document.getElementById("screen-rules");
    const interfaceMain = document.querySelector("main");

    // 1. On lance l'animation de sortie
    rulesScreen.classList.add("pop-out");

    // 2. On attend la fin de l'animation (300ms comme dans le CSS)
    setTimeout(() => {
        rulesScreen.style.display = "none";
        if (interfaceMain) interfaceMain.style.display = "none";

        // On retire la classe pour que la fenêtre puisse se ré-ouvrir proprement plus tard
        rulesScreen.classList.remove("pop-out");
    }, 300);
}

// Ouvrir une question (appelé par les icônes ou le volume)
function openQuestion(index) {
    currentIndex = index;
    const data = database[index];

    // 1. On affiche le <main> (le conteneur global)
    const interfaceContainer = document.querySelector("main");
    if (interfaceContainer) {
        interfaceContainer.style.display = "flex";
    }

    // 2. Mise à jour de l'image de l'objet
    const questionImg = document.getElementById("question-image");
    if (questionImg) {
        questionImg.style.backgroundImage = `url(${data.imageObjet})`;
    }

    // 3. Génération des boutons de réponse
    const container = document.getElementById("answers-list");
    if (container) {
        container.innerHTML = "";
        data.choix.forEach((choix) => {
            const btn = document.createElement("button");
            btn.classList.add("answer-btn");
            btn.innerText = choix;
            btn.onclick = () => showAnecdote();
            container.appendChild(btn);
        });
    }

    // 4. Affichage de la bonne section
    document.getElementById("screen-rules").style.display = "none";
    document.getElementById("screen-anecdote").style.display = "none";
    document.getElementById("screen-quiz").style.display = "block";
}

// Passer à l'écran anecdote
function showAnecdote() {
    const data = database[currentIndex];

    document.getElementById("screen-quiz").style.display = "none";

    // Mise à jour du texte et de l'image d'anecdote
    const anecdoteText = document.getElementById("anecdote-text");
    const anecdoteImg = document.getElementById("anecdote-image");

    if (anecdoteText) anecdoteText.innerText = data.anecdote;
    if (anecdoteImg)
        anecdoteImg.style.backgroundImage = `url(${data.imageAnecdote})`;

    document.getElementById("screen-anecdote").style.display = "block";
}

// Terminer la séquence et masquer l'interface
function finishSequence() {
    const anecdoteScreen = document.getElementById("screen-anecdote");
    const interfaceMain = document.querySelector("main");

    anecdoteScreen.classList.add("pop-out");

    setTimeout(() => {
        anecdoteScreen.style.display = "none";
        if (interfaceMain) interfaceMain.style.display = "none";

        anecdoteScreen.classList.remove("pop-out");
        updateScore();
    }, 300);
}

// Mettre à jour le compteur 0/22
function updateScore() {
    score++;
    const scoreElement = document.querySelector(".score-counter");
    if (scoreElement) {
        scoreElement.innerText = `${score}/22`;
    }
}

// --- 3. ÉCOUTEURS D'ÉVÉNEMENTS (TESTS) ---

// On cible l'icône de volume par sa classe
const volumeIcon = document.querySelector(".icon-left");

if (volumeIcon) {
    volumeIcon.style.cursor = "pointer"; // Pour confirmer visuellement que c'est cliquable

    volumeIcon.onclick = function () {
        console.log("Clic volume détecté !");
        openQuestion(0); // On force l'ouverture de la première question
    };
} else {
    console.error("L'icône .icon-left n'a pas été trouvée");
}

// Assure-toi que openQuestion force l'affichage du main
function openQuestion(index) {
    currentIndex = index;
    const data = database[index];

    // On force l'affichage du conteneur principal qui était en display:none
    const interfaceContainer = document.querySelector("main");
    if (interfaceContainer) {
        interfaceContainer.style.display = "flex";
    }

    // Mise à jour de l'image
    const questionImg = document.getElementById("question-image");
    if (questionImg) {
        questionImg.style.backgroundImage = `url(${data.imageObjet})`;
    }

    // Génération des boutons
    const container = document.getElementById("answers-list");
    if (container) {
        container.innerHTML = "";
        data.choix.forEach((choix) => {
            const btn = document.createElement("button");
            btn.classList.add("answer-btn");
            btn.innerText = choix;
            btn.onclick = () => showAnecdote();
            container.appendChild(btn);
        });
    }

    // On cache les règles et l'anecdote, on montre le quiz
    document.getElementById("screen-rules").style.display = "none";
    document.getElementById("screen-anecdote").style.display = "none";
    document.getElementById("screen-quiz").style.display = "block";
}
