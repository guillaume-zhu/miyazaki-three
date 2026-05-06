import { state } from '../state/gameState.js'
import { playSound } from '../utils/sound.js'
import { sauvegarderProgression } from '../data/progression.js'
import { checkMilestone } from './milestone.js'

// ════════════════════════════════════════════
// ANECDOTE
// ════════════════════════════════════════════
export function showAnecdote() {
    if (!state.currentData) return

    document.getElementById('screen-quiz').style.display = 'none'

    const anecdoteText = document.getElementById('anecdote-text')
    if (anecdoteText) anecdoteText.innerText = state.currentData.anecdote

    if (state.currentFilmTmdb) {
        const poster = document.getElementById('film-poster')
        if (poster) {
            poster.src = state.currentFilmTmdb.poster || ''
            poster.style.display = state.currentFilmTmdb.poster ? 'block' : 'none'
        }

        const titleYear = document.getElementById('film-title-year')
        if (titleYear)
            titleYear.innerText = `${state.currentFilmTmdb.title} (${state.currentFilmTmdb.year})`

        const note = document.getElementById('film-note')
        if (note) note.innerText = `⭐ ${state.currentFilmTmdb.note} / 10`

        const trailer = document.getElementById('film-trailer')
        if (trailer) {
            trailer.href = state.currentFilmTmdb.trailerUrl || '#'
            trailer.style.display = state.currentFilmTmdb.trailerUrl ? 'inline-block' : 'none'
        }

        const overview = document.getElementById('film-overview')
        if (overview) overview.innerText = state.currentFilmTmdb.overview || ''
    }

    document.getElementById('screen-anecdote').style.display = 'block'
}

// ════════════════════════════════════════════
// RÉPONSE
// ════════════════════════════════════════════
export function handleAnswer(btn, choix, data, container) {
    if (choix === data.bonneReponse) {
        btn.classList.add('answer-correct')
        container.querySelectorAll('.answer-btn').forEach((b) => {
            b.style.pointerEvents = 'none'
        })
        playSound('/sound/correct.wav', 0.5)
        state.isNewFind = true
        setTimeout(() => showAnecdote(), 800)
    } else {
        btn.classList.add('answer-wrong')
        playSound('/sound/wrong.wav')
    }
}

// ════════════════════════════════════════════
// FIN DE SÉQUENCE + TROPHÉE
// ════════════════════════════════════════════
window.finishSequenceWithTrophy = function () {
    const anecdoteScreen = document.getElementById('screen-anecdote')
    const interfaceMain = document.querySelector('main')

    anecdoteScreen.classList.add('pop-out')

    setTimeout(() => {
        anecdoteScreen.style.display = 'none'
        anecdoteScreen.classList.remove('pop-out')
        updateScore()
        if (interfaceMain) interfaceMain.style.display = 'none'
        state.hudOpen = false
        if (state.isNewFind) {
            showTrophyNotification()
            state.isNewFind = false
        }
    }, 300)
}

// ── Gestionnaire de pile de toasts ──
const _toastStack = []
const TOAST_BASE_TOP = 110  // px — position du premier toast
const TOAST_STEP    = 82    // px — hauteur toast (64px) + gap (18px)

function _reflowToasts() {
    _toastStack.forEach((t, i) => {
        t.style.top = (TOAST_BASE_TOP + i * TOAST_STEP) + 'px'
    })
}

export function showTrophyNotification() {
    const toast = document.createElement('div')
    toast.className = 'trophy-notification'
    toast.innerHTML = `
        <img src="/img/trophe.svg" alt="trophée" class="trophy-icon" />
        <div class="trophy-content">
            <p class="trophy-title">Souvenir retrouvé !</p>
            <p class="trophy-count">${state.score} / 32 souvenirs</p>
        </div>
    `

    // Position dans la pile avant d'ajouter au DOM
    toast.style.top = (TOAST_BASE_TOP + _toastStack.length * TOAST_STEP) + 'px'
    _toastStack.push(toast)
    document.body.appendChild(toast)

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.add('trophy-visible')
            playSound('/sound/trophy-sound.mp3', 0.35)
        })
    })

    setTimeout(() => {
        toast.classList.remove('trophy-visible')
        toast.classList.add('trophy-hide')
        setTimeout(() => {
            // Retirer de la pile et recalculer les positions
            const idx = _toastStack.indexOf(toast)
            if (idx !== -1) _toastStack.splice(idx, 1)
            toast.remove()
            _reflowToasts()
        }, 500)
    }, 3500)
}

// ════════════════════════════════════════════
// MISE À JOUR DU SCORE + SAUVEGARDE
// ════════════════════════════════════════════
export function updateScore() {
    if (state.currentData && !state.currentData.isFound) {
        state.score++
        state.currentData.isFound = true

        const el = document.querySelector('.score-counter')
        if (el) el.innerText = `${state.score} / 32`

        // On sauvegarde en base à chaque nouvel objet trouvé
        sauvegarderProgression()
        checkMilestone(state.score)
    }
}
