import { state } from '../state/gameState.js'
import { chargerProgression } from '../data/progression.js'
import { showAnecdote, handleAnswer } from './quiz.js'
import { playSound, toggleAllSounds, getMuted } from '../utils/sound.js'
import '../auth/profile.js' // Importer pour attacher les fonctions globales (profil/auth)
import { loadSavedTheme, loadSavedBadge } from './settings.js'

// ════════════════════════════════════════════
// VÉRIFICATION D'ÉTAT (MODÈLES & PROFIL)
// ════════════════════════════════════════════
export function checkReadyState() {
    if (state.profileReady && state.modelsLoaded) {
        const launchBtn = document.getElementById('launch-btn')
        if (launchBtn) {
            launchBtn.style.display = 'inline-block'
        }
    }
}

export function onModelsLoaded() {
    state.modelsLoaded = true
    checkReadyState()
}

// ════════════════════════════════════════════
// FERMETURE DU HUD
// ════════════════════════════════════════════
export function closeHUD() {
    const interfaceMain = document.querySelector('main')
    const quizScreen = document.getElementById('screen-quiz')
    const anecdoteScreen = document.getElementById('screen-anecdote')

    const activeScreen =
        quizScreen.style.display === 'block' ? quizScreen : anecdoteScreen

    if (activeScreen) {
        activeScreen.classList.add('pop-out')
        setTimeout(() => {
            activeScreen.style.display = 'none'
            activeScreen.classList.remove('pop-out')
            if (interfaceMain) interfaceMain.style.display = 'none'
            state.hudOpen = false
        }, 300)
    }
}

// ════════════════════════════════════════════
// FERMER LES RÈGLES
// ════════════════════════════════════════════
window.closeRules = function () {
    const rulesScreen = document.getElementById('screen-rules')
    const interfaceMain = document.querySelector('main')

    rulesScreen.classList.add('pop-out')
    playSound('/sound/wind-sound.mp3', 0.5)

    setTimeout(() => {
        rulesScreen.style.display = 'none'
        rulesScreen.classList.remove('pop-out')
        if (interfaceMain) interfaceMain.style.display = 'none'
        state.hudOpen = false
    }, 300)
}

// ════════════════════════════════════════════
// OUVRIR LE HUD
// ════════════════════════════════════════════
export function openHUD(data, filmTmdb = null) {
    const rulesScreen = document.getElementById('screen-rules')
    const loaderScreen = document.getElementById('loader-screen')

    if (
        !loaderScreen.classList.contains('loader-hidden') ||
        rulesScreen.style.display === 'block'
    ) {
        return
    }

    state.currentData = data
    state.currentFilmTmdb = filmTmdb
    state.hudOpen = true
    const interfaceMain = document.querySelector('main')

    if (interfaceMain) interfaceMain.style.display = 'flex'

    if (data.isFound) {
        state.isNewFind = false
        showAnecdote()
    } else {
        const questionImg = document.getElementById('question-image')
        if (questionImg)
            questionImg.style.backgroundImage = `url(${data.imageObjet})`

        const answersContainer = document.getElementById('answers-list')
        if (answersContainer) {
            answersContainer.innerHTML = ''
            data.choix.forEach((choix) => {
                const btn = document.createElement('button')
                btn.classList.add('answer-btn')
                btn.innerText = choix
                btn.onclick = (e) => {
                    e.stopPropagation()
                    handleAnswer(btn, choix, data, answersContainer)
                }
                answersContainer.appendChild(btn)
            })
        }
        document.getElementById('screen-anecdote').style.display = 'none'
        document.getElementById('screen-quiz').style.display = 'block'
    }

    const overlay = document.getElementById('hud-overlay')
    if (overlay)
        overlay.onclick = (e) => {
            e.stopPropagation()
            closeHUD()
        }

    const closeBtn = document.getElementById('hud-close')
    if (closeBtn)
        closeBtn.onclick = (e) => {
            e.stopPropagation()
            closeHUD()
        }
}

// ════════════════════════════════════════════
// INIT INTERFACE JEU (appelé par le bouton du loader)
// ════════════════════════════════════════════
export function initGameInterface() {
    const interfaceMain = document.querySelector('main')
    const rulesScreen = document.getElementById('screen-rules')
    const quizScreen = document.getElementById('screen-quiz')
    const anecdoteScreen = document.getElementById('screen-anecdote')

    if (interfaceMain && rulesScreen) {
        quizScreen.style.display = 'none'
        anecdoteScreen.style.display = 'none'
        interfaceMain.style.display = 'flex'
        rulesScreen.style.display = 'block'
        state.hudOpen = true
        interfaceMain.addEventListener('click', (e) => e.stopPropagation())
    }
}

// ════════════════════════════════════════════
// DÉMARRAGE — Vérifier si le joueur a déjà un pseudo
// ════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    // Appliquer les préférences sauvegardées dès le démarrage
    loadSavedTheme()
    loadSavedBadge()

    // ── Bouton volume (haut-gauche) ──
    const volumeBtn = document.getElementById('btn-test-quiz')
    if (volumeBtn) {
        const _updateVolumeBtn = () => {
            const muted = getMuted()
            const label = document.getElementById('volume-label')
            if (label) label.textContent = muted ? 'Désactivée' : 'Activée'
            volumeBtn.classList.toggle('toggle-on', !muted)
            volumeBtn.classList.toggle('toggle-off', muted)
            volumeBtn.title = muted ? 'Activer le son' : 'Couper le son'
        }
        volumeBtn.addEventListener('click', () => {
            toggleAllSounds()
            _updateVolumeBtn()
        })
        _updateVolumeBtn()
    }

    const savedUsername = localStorage.getItem('miyaza_username')
    if (savedUsername) {
        // Pseudo trouvé → on charge la progression
        chargerProgression()
        state.profileReady = true
        checkReadyState()
    } else {
        // Pas de pseudo → on affiche le formulaire profil dans le loader
        document.getElementById('auth-profile').style.display = 'block'
        document.getElementById('loader-progress-group').style.display = 'none'
    }
})

/* === AUTH LEGACY START ===
// ════════════════════════════════════════════
// DÉMARRAGE — Ancien système avec vérification JWT
// ════════════════════════════════════════════
// document.addEventListener('DOMContentLoaded', async () => {
//     const { getToken } = await import('../auth/profile.js')
//     const { chargerProgressionLegacy } = await import('../data/progression.js')
//     const token = getToken()
//     if (token) {
//         await chargerProgressionLegacy()
//         if (getToken()) {
//             document.getElementById('screen-auth').style.display = 'none'
//         }
//     } else {
//         if(typeof showMenu === 'function') showMenu()
//     }
// })
=== AUTH LEGACY END === */
