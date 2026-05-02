// fonction du son:

function playSound(file, vol = 1.0) {
    let audio = new Audio(file);
    audio.volume = vol;
    audio.play();
}

// --- Empêcher les clics dans le HUD de traverser vers la scène 3D ---
document.addEventListener("DOMContentLoaded", () => {
    const gameInterface = document.getElementById("game-interface");
    if (gameInterface) {
        gameInterface.addEventListener("click", (e) => e.stopPropagation());
    }
});

let currentData = null;
let currentFilmTmdb = null; // Données TMDB du film lié à l'objet cliqué
let score = 0;

// --- Fermeture du HUD ---
export function closeHUD() {
    const interfaceMain = document.querySelector("main");
    const activeScreen =
        document.getElementById("screen-quiz").style.display === "block"
            ? document.getElementById("screen-quiz")
            : document.getElementById("screen-anecdote");

    activeScreen.classList.add("pop-out");

    setTimeout(() => {
        activeScreen.style.display = "none";
        activeScreen.classList.remove("pop-out");
        if (interfaceMain) interfaceMain.style.display = "none";
    }, 300);
}

// --- Fermer l'écran des règles ---
window.closeRules = function () {
    const rulesScreen = document.getElementById("screen-rules");
    const interfaceMain = document.querySelector("main");

    rulesScreen.classList.add("pop-out");
    playSound("/sound/wind-sound.mp3", 0.5);

    setTimeout(() => {
        rulesScreen.style.display = "none";
        if (interfaceMain) interfaceMain.style.display = "none";
        rulesScreen.classList.remove("pop-out");
    }, 300);
};

// --- Passer à l'écran anecdote ---
function showAnecdote() {
    if (!currentData) return;

    document.getElementById("screen-quiz").style.display = "none";

    // ── Anecdote (colonne droite) ──
    const anecdoteText = document.getElementById("anecdote-text");
    if (anecdoteText) anecdoteText.innerText = currentData.anecdote;

    // ── Données TMDB (colonne gauche) ──
    if (currentFilmTmdb) {
        // Poster
        const poster = document.getElementById("film-poster");
        if (poster) {
            poster.src = currentFilmTmdb.poster || "";
            poster.style.display = currentFilmTmdb.poster ? "block" : "none";
        }

        // Titre + Année
        const titleYear = document.getElementById("film-title-year");
        if (titleYear)
            titleYear.innerText = `${currentFilmTmdb.title} (${currentFilmTmdb.year})`;

        // Note
        const note = document.getElementById("film-note");
        if (note) note.innerText = `⭐ ${currentFilmTmdb.note} / 10`;

        // Trailer
        const trailer = document.getElementById("film-trailer");
        if (trailer) {
            if (currentFilmTmdb.trailerUrl) {
                trailer.href = currentFilmTmdb.trailerUrl;
                trailer.style.display = "inline-block";
            } else {
                trailer.style.display = "none";
            }
        }

        // Synopsis
        const overview = document.getElementById("film-overview");
        if (overview) overview.innerText = currentFilmTmdb.overview || "";
    }

    document.getElementById("screen-anecdote").style.display = "block";
}

// --- Vérifier la réponse et donner un feedback visuel ---
function handleAnswer(btn, choix, data, container) {
    if (choix === data.bonneReponse) {
        // Bonne réponse → vert + désactiver tous les boutons
        btn.classList.add("answer-correct");
        container.querySelectorAll(".answer-btn").forEach((b) => {
            b.style.pointerEvents = "none";
        });

        playSound("/sound/correct.wav", 0.5);

        // Transition vers l'anecdote après un court délai
        setTimeout(() => showAnecdote(), 800);
    } else {
        // Mauvaise réponse → rouge + shake, ce bouton uniquement est désactivé
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

// --- Mise à jour du score ---
function updateScore() {
    // Si l'objet actuel existe et n'a pas encore été trouvé
    if (currentData && !currentData.isFound) {
        score++;
        currentData.isFound = true; // On marque l'objet comme "trouvé"

        const el = document.querySelector(".score-counter");
        if (el) el.innerText = `${score} / 25`;

        console.log("Nouveau score :", score);
    } else {
        console.log("Objet déjà trouvé, le score ne change pas.");
    }
}

// --- Ouvrir le HUD avec les données d'un objet + les données TMDB du film ---
export function openHUD(data, filmTmdb = null) {
    currentData = data;
    currentFilmTmdb = filmTmdb; // On stocke pour que showAnecdote() puisse y accéder
    const interfaceMain = document.querySelector("main");

    if (interfaceMain) interfaceMain.style.display = "flex";

    // --- LOGIQUE DE FILTRAGE ---
    if (data.isFound) {
        // Cas : Déjà trouvé -> On affiche directement l'anecdote
        showAnecdote();
        document.getElementById("screen-rules").style.display = "none";
    } else {
        // Cas : Nouveau -> On affiche le quiz classique
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

        document.getElementById("screen-rules").style.display = "none";
        document.getElementById("screen-anecdote").style.display = "none";
        document.getElementById("screen-quiz").style.display = "block";
    }

    // --- FERMETURE ---
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

// --- Initialisation automatique des règles ---
document.addEventListener("DOMContentLoaded", () => {
    const interfaceMain = document.querySelector("main");
    const rulesScreen = document.getElementById("screen-rules");

    if (interfaceMain && rulesScreen) {
        setTimeout(() => {
            interfaceMain.style.display = "flex";
            rulesScreen.style.display = "block";
        }, 2000);
    }
});
