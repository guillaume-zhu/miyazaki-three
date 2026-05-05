import { MODELS_DATA } from '../data/models.js'
import naughtyWords from 'naughty-words'

// ════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════
let currentData = null
let currentFilmTmdb = null
let score = 0
let currentUsername = null  // pseudo du joueur
let selectedAvatar = null   // avatar sélectionné sur l'écran profil
let profileReady = false    // l'utilisateur a un pseudo
let modelsLoaded = false    // les modèles 3D sont chargés
let isNewFind = false       // vrai uniquement lors d'une première découverte

// ════════════════════════════════════════════
// SON
// ════════════════════════════════════════════
function playSound(file, vol = 1.0) {
    const audio = new Audio(file)
    audio.volume = vol
    audio.play()
}

/* === AUTH LEGACY START ===
// ════════════════════════════════════════════
// TOKEN JWT — Stockage dans localStorage
// ════════════════════════════════════════════
function getToken() {
    return localStorage.getItem('miyaza_token')
}

function setToken(token) {
    localStorage.setItem('miyaza_token', token)
}

function removeToken() {
    localStorage.removeItem('miyaza_token')
}
=== AUTH LEGACY END === */

/* Anciennes fonctions de navigation supprimées car il n'y a plus qu'un seul écran (loader) */

// ════════════════════════════════════════════
// AVATAR — Sélection
// ════════════════════════════════════════════
window.selectAvatar = function (avatarKey) {
    selectedAvatar = avatarKey
    // On retire la classe .selected de toutes les cartes
    document.querySelectorAll('.avatar-card').forEach(card => {
        card.classList.remove('selected')
    })
    // On l'ajoute uniquement à la carte cliquée
    const card = document.querySelector(`.avatar-card[data-avatar="${avatarKey}"]`)
    if (card) card.classList.add('selected')
}

// ════════════════════════════════════════════
// PROFIL — Filtre de mots interdits
// ════════════════════════════════════════════
const BADWORDS = new Set([
    ...naughtyWords.fr,
    ...naughtyWords.en
])

function containsBadWords(text) {
    const normalized = text.toLowerCase().trim()
    for (const word of BADWORDS) {
        if (normalized.includes(word)) return true
    }
    return false
}

// ════════════════════════════════════════════
// PROFIL — Rejoindre le jeu avec pseudo + avatar
// Stockage en localStorage (pas d'appel serveur)
// ════════════════════════════════════════════
window.handleProfileSetup = function () {
    const username = document.getElementById('profile-username').value.trim()
    const errorEl = document.getElementById('profile-error')
    errorEl.innerText = ''

    if (!selectedAvatar) {
        errorEl.innerText = 'Choisis un avatar !'
        return
    }
    if (username.length < 2) {
        errorEl.innerText = 'Pseudo trop court (2 caractères minimum)'
        return
    }
    if (containsBadWords(username)) {
        errorEl.innerText = "Ce pseudo n'est pas autorisé 🚫"
        return
    }

    // Stocker en localStorage
    localStorage.setItem('miyaza_username', username)
    localStorage.setItem('miyaza_avatar', selectedAvatar)

    currentUsername = username

    const el = document.querySelector('.score-counter')
    if (el) el.innerText = `${score} / 25`

    afficherPseudo()
    
    // Le profil est prêt, on cache le formulaire et on vérifie si les modèles sont chargés
    document.getElementById('auth-profile').style.display = 'none'
    profileReady = true
    
    if (!modelsLoaded) {
        document.getElementById('loader-progress-group').style.display = 'block'
    }

    checkReadyState()
}

export function onModelsLoaded() {
    modelsLoaded = true
    checkReadyState()
}

function checkReadyState() {
    if (profileReady && modelsLoaded) {
        const launchBtn = document.getElementById('launch-btn')
        if (launchBtn) {
            launchBtn.style.display = 'inline-block'
        }
    }
}

/* === AUTH LEGACY START ===
// ════════════════════════════════════════════
// AUTH — Login (ancien système)
// ════════════════════════════════════════════
window.handleLogin = async function () {
    const email = document.getElementById('auth-email').value.trim()
    const password = document.getElementById('auth-password').value
    const errorEl = document.getElementById('auth-error')
    errorEl.innerText = ''

    try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        const data = await res.json()

        if (!res.ok) {
            errorEl.innerText = data.error || 'Erreur de connexion'
            return
        }

        setToken(data.token)
        if (data.username) {
            currentUsername = data.username
            afficherPseudo()
            await onAuthSuccess()
        } else {
            showProfileSetup()
        }
    } catch {
        errorEl.innerText = 'Impossible de contacter le serveur'
    }
}

// ════════════════════════════════════════════
// AUTH — Register (ancien système)
// ════════════════════════════════════════════
window.handleRegister = async function () {
    const email = document.getElementById('register-email').value.trim()
    const password = document.getElementById('register-password').value
    const errorEl = document.getElementById('register-error')
    errorEl.innerText = ''

    try {
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        const data = await res.json()

        if (!res.ok) {
            errorEl.innerText = data.error || 'Erreur lors de la création du compte'
            return
        }

        setToken(data.token)
        showProfileSetup()
    } catch {
        errorEl.innerText = 'Impossible de contacter le serveur'
    }
}
=== AUTH LEGACY END === */

// ════════════════════════════════════════════
// PSEUDO — Affichage dans l'interface
// ════════════════════════════════════════════
function afficherPseudo() {
    if (!currentUsername) return

    const pseudoEl = document.getElementById('header-pseudo')
    if (pseudoEl) pseudoEl.innerText = currentUsername

    const avatarEl = document.getElementById('header-avatar')
    if (avatarEl) {
        const savedAvatar = localStorage.getItem('miyaza_avatar')
        if (savedAvatar) avatarEl.src = `/avatar/${savedAvatar}.svg`
    }
}

/* Fonction supprimée car le flux est géré par checkReadyState() */

// ════════════════════════════════════════════
// PROGRESSION — Charger depuis localStorage
// ════════════════════════════════════════════
function chargerProgression() {
    const username = localStorage.getItem('miyaza_username')
    if (!username) return false

    currentUsername = username
    score = parseInt(localStorage.getItem('miyaza_score') || '0')

    const saved = localStorage.getItem('miyaza_foundObjects')
    if (saved) {
        try {
            const foundObjects = JSON.parse(saved)
            for (const key of foundObjects) {
                if (MODELS_DATA[key]) MODELS_DATA[key].isFound = true
            }
        } catch { /* JSON invalide, on ignore */ }
    }

    const el = document.querySelector('.score-counter')
    if (el) el.innerText = `${score} / 25`

    afficherPseudo()
    return true
}

/* === AUTH LEGACY START ===
// ════════════════════════════════════════════
// PROGRESSION — Charger depuis le backend (ancien système JWT)
// ════════════════════════════════════════════
async function chargerProgressionLegacy() {
    const token = getToken()
    if (!token) return

    try {
        const res = await fetch(`${API_URL}/api/progression`, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (!res.ok) {
            removeToken()
            document.getElementById('screen-auth').style.display = 'flex'
            return
        }

        const { score: savedScore, foundObjects } = await res.json()

        score = savedScore
        for (const key of foundObjects) {
            if (MODELS_DATA[key]) MODELS_DATA[key].isFound = true
        }

        const el = document.querySelector('.score-counter')
        if (el) el.innerText = `${score} / 25`

        const meRes = await fetch(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (meRes.ok) {
            const me = await meRes.json()
            if (me.username) {
                currentUsername = me.username
                afficherPseudo()
            }
        }

        console.log('✅ Progression chargée :', score, 'objet(s) trouvé(s)')
    } catch (error) {
        console.error('Erreur chargement progression :', error)
    }
}
=== AUTH LEGACY END === */

// ════════════════════════════════════════════
// PROGRESSION — Sauvegarder en localStorage
// Appelée après chaque objet trouvé
// ════════════════════════════════════════════
function sauvegarderProgression() {
    const foundObjects = Object.entries(MODELS_DATA)
        .filter(([, data]) => data.isFound)
        .map(([key]) => key)

    localStorage.setItem('miyaza_score', score.toString())
    localStorage.setItem('miyaza_foundObjects', JSON.stringify(foundObjects))
    console.log('💾 Progression sauvegardée (localStorage)')
}

/* === AUTH LEGACY START ===
// ════════════════════════════════════════════
// PROGRESSION — Sauvegarder (ancien système JWT)
// ════════════════════════════════════════════
async function sauvegarderProgressionLegacy() {
    const token = getToken()
    if (!token) return

    const foundObjects = Object.entries(MODELS_DATA)
        .filter(([, data]) => data.isFound)
        .map(([key]) => key)

    try {
        await fetch(`${API_URL}/api/progression/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ score, foundObjects })
        })
        console.log('💾 Progression sauvegardée')
    } catch (error) {
        console.error('Erreur sauvegarde progression :', error)
    }
}
=== AUTH LEGACY END === */

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
    }, 300)
}

// ════════════════════════════════════════════
// ANECDOTE
// ════════════════════════════════════════════
function showAnecdote() {
    if (!currentData) return

    document.getElementById('screen-quiz').style.display = 'none'

    const anecdoteText = document.getElementById('anecdote-text')
    if (anecdoteText) anecdoteText.innerText = currentData.anecdote

    if (currentFilmTmdb) {
        const poster = document.getElementById('film-poster')
        if (poster) {
            poster.src = currentFilmTmdb.poster || ''
            poster.style.display = currentFilmTmdb.poster ? 'block' : 'none'
        }

        const titleYear = document.getElementById('film-title-year')
        if (titleYear)
            titleYear.innerText = `${currentFilmTmdb.title} (${currentFilmTmdb.year})`

        const note = document.getElementById('film-note')
        if (note) note.innerText = `⭐ ${currentFilmTmdb.note} / 10`

        const trailer = document.getElementById('film-trailer')
        if (trailer) {
            trailer.href = currentFilmTmdb.trailerUrl || '#'
            trailer.style.display = currentFilmTmdb.trailerUrl ? 'inline-block' : 'none'
        }

        const overview = document.getElementById('film-overview')
        if (overview) overview.innerText = currentFilmTmdb.overview || ''
    }

    document.getElementById('screen-anecdote').style.display = 'block'
}

// ════════════════════════════════════════════
// RÉPONSE
// ════════════════════════════════════════════
function handleAnswer(btn, choix, data, container) {
    if (choix === data.bonneReponse) {
        btn.classList.add('answer-correct')
        container.querySelectorAll('.answer-btn').forEach((b) => {
            b.style.pointerEvents = 'none'
        })
        playSound('/sound/correct.wav', 0.5)
        isNewFind = true
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
        if (isNewFind) {
            showTrophyNotification()
            isNewFind = false
        }
    }, 300)
}

function showTrophyNotification() {
    const toast = document.createElement('div')
    toast.className = 'trophy-notification'
    toast.innerHTML = `
        <img src="/img/trophe.svg" alt="trophée" class="trophy-icon" />
        <div class="trophy-content">
            <p class="trophy-title">Souvenir retrouvé !</p>
            <p class="trophy-count">${score} / 25 souvenirs</p>
        </div>
    `
    document.body.appendChild(toast)

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.add('trophy-visible')
            const sfx = new Audio('/sound/trophy-sound.mp3')
            sfx.volume = 0.35
            sfx.play().catch(() => {})
        })
    })

    setTimeout(() => {
        toast.classList.remove('trophy-visible')
        toast.classList.add('trophy-hide')
        setTimeout(() => toast.remove(), 500)
    }, 3500)
}

// ════════════════════════════════════════════
// MISE À JOUR DU SCORE + SAUVEGARDE
// ════════════════════════════════════════════
function updateScore() {
    if (currentData && !currentData.isFound) {
        score++
        currentData.isFound = true

        const el = document.querySelector('.score-counter')
        if (el) el.innerText = `${score} / 25`

        // On sauvegarde en base à chaque nouvel objet trouvé
        sauvegarderProgression()
    }
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

    currentData = data
    currentFilmTmdb = filmTmdb
    const interfaceMain = document.querySelector('main')

    if (interfaceMain) interfaceMain.style.display = 'flex'

    if (data.isFound) {
        isNewFind = false
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
        interfaceMain.addEventListener('click', (e) => e.stopPropagation())
    }
}

// ════════════════════════════════════════════
// CHANGER DE JOUEUR
// ════════════════════════════════════════════
window.handleChangePlayer = function () {
    localStorage.removeItem('miyaza_username')
    localStorage.removeItem('miyaza_avatar')
    localStorage.removeItem('miyaza_score')
    localStorage.removeItem('miyaza_foundObjects')
    
    // On recharge simplement la page pour recommencer le flux
    window.location.reload()
}

window.togglePlayerDropdown = function () {
    const dd = document.getElementById('player-dropdown')
    if (dd) dd.style.display = dd.style.display === 'none' ? 'block' : 'none'
}

/* === AUTH LEGACY START ===
// ════════════════════════════════════════════
// DÉCONNEXION (ancien système)
// ════════════════════════════════════════════
window.handleLogout = function () {
    removeToken()
    score = 0
    currentUsername = null
    selectedAvatar = null
    for (const key of Object.keys(MODELS_DATA)) {
        MODELS_DATA[key].isFound = false
    }
    const el = document.querySelector('.score-counter')
    if (el) el.innerText = '0 / 25'

    const pseudoEl = document.getElementById('header-pseudo')
    if (pseudoEl) pseudoEl.remove()

    document.getElementById('screen-auth').style.display = 'flex'
    showMenu()
}
=== AUTH LEGACY END === */

// ════════════════════════════════════════════
// DÉMARRAGE — Vérifier si le joueur a déjà un pseudo
// ════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    const savedUsername = localStorage.getItem('miyaza_username')
    if (savedUsername) {
        // Pseudo trouvé → on charge la progression
        chargerProgression()
        profileReady = true
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
document.addEventListener('DOMContentLoaded', async () => {
    const token = getToken()
    if (token) {
        await chargerProgressionLegacy()
        if (getToken()) {
            document.getElementById('screen-auth').style.display = 'none'
        }
    } else {
        showMenu()
    }
})
=== AUTH LEGACY END === */
