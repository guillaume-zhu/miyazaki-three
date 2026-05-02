// fonction du son:
function playSound(file, vol = 1.0) {
    let audio = new Audio(file);
    audio.volume = vol;
    audio.play();
}

let currentData = null;
let currentFilmTmdb = null;
let score = 0;

// --- Fermeture du HUD ---
export function closeHUD() {
    const interfaceMain = document.querySelector("main");
    // On cherche l'écran actuellement visible
    const quizScreen = document.getElementById("screen-quiz");
    const anecdoteScreen = document.getElementById("screen-anecdote");

    const activeScreen =
        quizScreen.style.display === "block" ? quizScreen : anecdoteScreen;

    if (activeScreen) {
        activeScreen.classList.add("pop-out");
        setTimeout(() => {
            activeScreen.style.display = "none";
            activeScreen.classList.remove("pop-out");
            if (interfaceMain) interfaceMain.style.display = "none";
        }, 300);
    }
}

// --- Fermer l'écran des règles ---
window.closeRules = function () {
    const rulesScreen = document.getElementById("screen-rules");
    const interfaceMain = document.querySelector("main");

    rulesScreen.classList.add("pop-out");

    setTimeout(() => {
        rulesScreen.style.display = "none";
        rulesScreen.classList.remove("pop-out");
        // Important : on cache le main seulement si on ne passe pas à un autre écran
        if (interfaceMain) interfaceMain.style.display = "none";
    }, 300);
};

// --- Passer à l'écran anecdote ---
function showAnecdote() {
    if (!currentData) return;

    document.getElementById("screen-quiz").style.display = "none";

    const anecdoteText = document.getElementById("anecdote-text");
    if (anecdoteText) anecdoteText.innerText = currentData.anecdote;

    if (currentFilmTmdb) {
        const poster = document.getElementById("film-poster");
        if (poster) {
            poster.src = currentFilmTmdb.poster || "";
            poster.style.display = currentFilmTmdb.poster ? "block" : "none";
        }
        const titleYear = document.getElementById("film-title-year");
        if (titleYear)
            titleYear.innerText = `${currentFilmTmdb.title} (${currentFilmTmdb.year})`;

        const note = document.getElementById("film-note");
        if (note) note.innerText = `⭐ ${currentFilmTmdb.note} / 10`;

        const trailer = document.getElementById("film-trailer");
        if (trailer) {
            trailer.href = currentFilmTmdb.trailerUrl || "#";
            trailer.style.display = currentFilmTmdb.trailerUrl
                ? "inline-block"
                : "none";
        }

        const overview = document.getElementById("film-overview");
        if (overview) overview.innerText = currentFilmTmdb.overview || "";
    }

    document.getElementById("screen-anecdote").style.display = "block";
}

// --- Vérifier la réponse ---
function handleAnswer(btn, choix, data, container) {
    if (choix === data.bonneReponse) {
        btn.classList.add("answer-correct");
        container.querySelectorAll(".answer-btn").forEach((b) => {
            b.style.pointerEvents = "none";
        });
        playSound("/sound/correct.wav", 0.5);
        setTimeout(() => showAnecdote(), 800);
    } else {
        btn.classList.add("answer-wrong");
        playSound("/sound/wrong.wav");
    }
}

// --- Terminer la séquence ---
window.finishSequence = function () {
    const anecdoteScreen = document.getElementById("screen-anecdote");
    const interfaceMain = document.querySelector("main");

    anecdoteScreen.classList.add("pop-out");

    setTimeout(() => {
        anecdoteScreen.style.display = "none";
        anecdoteScreen.classList.remove("pop-out");
        if (interfaceMain) interfaceMain.style.display = "none";
        updateScore();
    }, 300);
};

function updateScore() {
    if (currentData && !currentData.isFound) {
        score++;
        currentData.isFound = true;
        const el = document.querySelector(".score-counter");
        if (el) el.innerText = `${score} / 25`;
    }
}

// --- OUVRIR LE QUIZ (Appelé par le clic sur un modèle) ---
export function openHUD(data, filmTmdb = null) {
    const rulesScreen = document.getElementById("screen-rules");
    const loaderScreen = document.getElementById("loader-screen");

    // --- BLOCAGE DE SÉCURITÉ ---
    // Si le loader est encore visible OU si les règles sont ouvertes, on refuse d'ouvrir le quiz
    if (
        !loaderScreen.classList.contains("loader-hidden") ||
        rulesScreen.style.display === "block"
    ) {
        console.log(
            "HUD : Tentative d'ouverture du quiz bloquée (Loader ou Règles actifs)",
        );
        return;
    }

    currentData = data;
    currentFilmTmdb = filmTmdb;
    const interfaceMain = document.querySelector("main");

    if (interfaceMain) interfaceMain.style.display = "flex";

    if (data.isFound) {
        showAnecdote();
    } else {
        const questionImg = document.getElementById("question-image");
        if (questionImg)
            questionImg.style.backgroundImage = `url(${data.imageObjet})`;

        const answersContainer = document.getElementById("answers-list");
        if (answersContainer) {
            answersContainer.innerHTML = "";
            data.choix.forEach((choix) => {
                const btn = document.createElement("button");
                btn.classList.add("answer-btn");
                btn.innerText = choix;
                btn.onclick = (e) => {
                    e.stopPropagation();
                    handleAnswer(btn, choix, data, answersContainer);
                };
                answersContainer.appendChild(btn);
            });
        }
        document.getElementById("screen-anecdote").style.display = "none";
        document.getElementById("screen-quiz").style.display = "block";
    }

    // Gestion de la fermeture par l'overlay ou la croix
    const overlay = document.getElementById("hud-overlay");
    if (overlay)
        overlay.onclick = (e) => {
            e.stopPropagation();
            closeHUD();
        };
    const closeBtn = document.getElementById("hud-close");
    if (closeBtn)
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            closeHUD();
        };
}

// --- INITIALISATION (Appelé par le bouton du Loader) ---
export function initGameInterface() {
    const interfaceMain = document.querySelector("main");
    const rulesScreen = document.getElementById("screen-rules");
    const quizScreen = document.getElementById("screen-quiz");
    const anecdoteScreen = document.getElementById("screen-anecdote");

    if (interfaceMain && rulesScreen) {
        // On nettoie tout avant d'afficher
        quizScreen.style.display = "none";
        anecdoteScreen.style.display = "none";

        interfaceMain.style.display = "flex";
        rulesScreen.style.display = "block";

        // On empêche les clics de traverser vers Three.js
        interfaceMain.addEventListener("click", (e) => e.stopPropagation());
    }
}
