// --- HUD.js — Module ES6 ---

// --- Empêcher les clics dans le HUD de traverser vers la scène 3D ---
document.addEventListener("DOMContentLoaded", () => {
    const gameInterface = document.getElementById("game-interface")
    if (gameInterface) {
        gameInterface.addEventListener("click", (e) => e.stopPropagation())
    }
})

let currentData = null
let score = 0

// --- Fermeture du HUD ---
export function closeHUD() {
    const interfaceMain = document.querySelector("main")
    const activeScreen =
        document.getElementById("screen-quiz").style.display === "block"
            ? document.getElementById("screen-quiz")
            : document.getElementById("screen-anecdote")

    activeScreen.classList.add("pop-out")

    setTimeout(() => {
        activeScreen.style.display = "none"
        activeScreen.classList.remove("pop-out")
        if (interfaceMain) interfaceMain.style.display = "none"
    }, 300)
}

// --- Fermer l'écran des règles ---
window.closeRules = function () {
    const rulesScreen = document.getElementById("screen-rules")
    const interfaceMain = document.querySelector("main")

    rulesScreen.classList.add("pop-out")

    setTimeout(() => {
        rulesScreen.style.display = "none"
        if (interfaceMain) interfaceMain.style.display = "none"
        rulesScreen.classList.remove("pop-out")
    }, 300)
}

// --- Passer à l'écran anecdote ---
function showAnecdote() {
    if (!currentData) return

    document.getElementById("screen-quiz").style.display = "none"

    const anecdoteText = document.getElementById("anecdote-text")
    const anecdoteImg = document.getElementById("anecdote-image")

    if (anecdoteText) anecdoteText.innerText = currentData.anecdote
    if (anecdoteImg)
        anecdoteImg.style.backgroundImage = `url(${currentData.imageAnecdote})`

    document.getElementById("screen-anecdote").style.display = "block"
}

// --- Vérifier la réponse et donner un feedback visuel ---
function handleAnswer(btn, choix, data, container) {
    if (choix === data.bonneReponse) {
        // Bonne réponse → vert + désactiver tous les boutons
        btn.classList.add("answer-correct")
        container.querySelectorAll(".answer-btn").forEach((b) => {
            b.style.pointerEvents = "none"
        })
        // Transition vers l'anecdote après un court délai
        setTimeout(() => showAnecdote(), 800)
    } else {
        // Mauvaise réponse → rouge + shake, ce bouton uniquement est désactivé
        btn.classList.add("answer-wrong")
    }
}

// --- Terminer la séquence ---
window.finishSequence = function () {
    const anecdoteScreen = document.getElementById("screen-anecdote")
    const interfaceMain = document.querySelector("main")

    anecdoteScreen.classList.add("pop-out")

    setTimeout(() => {
        anecdoteScreen.style.display = "none"
        anecdoteScreen.classList.remove("pop-out")
        if (interfaceMain) interfaceMain.style.display = "none"
        updateScore()
    }, 300)
}

// --- Mise à jour du score ---
function updateScore() {
    score++
    const el = document.querySelector(".score-counter")
    if (el) el.innerText = `${score}/22`
}

// --- Ouvrir le HUD avec les données d'un objet ---
export function openHUD(data) {
    currentData = data
    const interfaceMain = document.querySelector("main")

    if (interfaceMain) interfaceMain.style.display = "flex"

    // Image de l'objet
    const questionImg = document.getElementById("question-image")
    if (questionImg)
        questionImg.style.backgroundImage = `url(${data.imageObjet})`

    // Génération des boutons de réponse
    const answersContainer = document.getElementById("answers-list")
    if (answersContainer) {
        answersContainer.innerHTML = ""
        data.choix.forEach((choix) => {
            const btn = document.createElement("button")
            btn.classList.add("answer-btn")
            btn.innerText = choix
            btn.onclick = (e) => {
                e.stopPropagation()
                handleAnswer(btn, choix, data, answersContainer)
            }
            answersContainer.appendChild(btn)
        })
    }

    // Affichage des écrans
    document.getElementById("screen-rules").style.display = "none"
    document.getElementById("screen-anecdote").style.display = "none"
    document.getElementById("screen-quiz").style.display = "block"

    // Fermeture via overlay et croix
    const overlay = document.getElementById("hud-overlay")
    if (overlay) overlay.onclick = (e) => {
        e.stopPropagation()
        closeHUD()
    }

    const closeBtn = document.getElementById("hud-close")
    if (closeBtn) closeBtn.onclick = (e) => {
        e.stopPropagation()
        closeHUD()
    }
}
