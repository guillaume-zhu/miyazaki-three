import { MODELS_DATA } from '../data/models.js'
import { API_URL } from '../config.js'

// ════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════
let currentData = null
let currentFilmTmdb = null
let score = 0
let currentUsername = null  // pseudo du joueur
let selectedAvatar = null   // avatar sélectionné sur l'écran profil

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
// Le token prouve que le joueur est connecté.
// On le garde entre les sessions (rechargements de page).
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

// ════════════════════════════════════════════
// AUTH — Navigation entre les écrans
// ════════════════════════════════════════════
function hideAllAuthScreens() {
    document.getElementById('auth-menu').style.display = 'none'
    document.getElementById('auth-profile').style.display = 'none'
}

window.showMenu = function () {
    hideAllAuthScreens()
    document.getElementById('auth-menu').style.display = 'flex'
}

/* === AUTH LEGACY START ===
window.showLogin = function () {
    hideAllAuthScreens()
    document.getElementById('auth-login').style.display = 'block'
    document.getElementById('auth-error').innerText = ''
}

window.showRegister = function () {
    hideAllAuthScreens()
    document.getElementById('auth-register').style.display = 'block'
    document.getElementById('register-error').innerText = ''
}
=== AUTH LEGACY END === */

window.showProfileSetup = function () {
    hideAllAuthScreens()
    document.getElementById('auth-profile').style.display = 'block'
    document.getElementById('profile-error').innerText = ''
    selectedAvatar = null
    // Réinitialiser la sélection visuelle
    document.querySelectorAll('.avatar-card').forEach(card => {
        card.classList.remove('selected')
    })
}

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
// PROFIL — Rejoindre le jeu avec pseudo + avatar
// Appelle POST /api/player/join (nouveau flux)
// ════════════════════════════════════════════
window.handleProfileSetup = async function () {
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

    try {
        const res = await fetch(`${API_URL}/api/player/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, avatar: selectedAvatar })
        })
        const data = await res.json()

        if (!res.ok) {
            errorEl.innerText = data.error || 'Erreur lors de la connexion'
            return
        }

        // Stocker le pseudo en localStorage pour auto-reconnexion
        localStorage.setItem('miyaza_username', data.username)

        currentUsername = data.username
        score = data.score || 0
        // Restaurer les objets trouvés
        if (data.foundObjects && data.foundObjects.length > 0) {
            for (const key of data.foundObjects) {
                if (MODELS_DATA[key]) MODELS_DATA[key].isFound = true
            }
        }

        const el = document.querySelector('.score-counter')
        if (el) el.innerText = `${score} / 25`

        afficherPseudo()
        await onAuthSuccess()
    } catch {
        errorEl.innerText = 'Impossible de contacter le serveur'
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
    // Dans le header à côté du score
    const header = document.querySelector('.icon-right')
    let pseudoEl = document.getElementById('header-pseudo')
    if (!pseudoEl && header) {
        pseudoEl = document.createElement('p')
        pseudoEl.id = 'header-pseudo'
        pseudoEl.className = 'header-pseudo'
        header.prepend(pseudoEl)
    }
    if (pseudoEl) pseudoEl.innerText = currentUsername
}

// ════════════════════════════════════════════
// Après connexion réussie :
// Cache l'écran auth pour laisser apparaître le jeu
// ════════════════════════════════════════════
async function onAuthSuccess() {
    document.getElementById('screen-auth').style.display = 'none'
}

// ════════════════════════════════════════════
// PROGRESSION — Charger depuis le backend (nouveau flux Player)
// ════════════════════════════════════════════
async function chargerProgression() {
    const username = localStorage.getItem('miyaza_username')
    if (!username) return false

    try {
        const res = await fetch(`${API_URL}/api/player/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        })

        if (!res.ok) {
            // Pseudo invalide ou erreur → on nettoie et on affiche le menu
            localStorage.removeItem('miyaza_username')
            return false
        }

        const data = await res.json()

        currentUsername = data.username
        score = data.score || 0

        if (data.foundObjects && data.foundObjects.length > 0) {
            for (const key of data.foundObjects) {
                if (MODELS_DATA[key]) MODELS_DATA[key].isFound = true
            }
        }

        const el = document.querySelector('.score-counter')
        if (el) el.innerText = `${score} / 25`

        afficherPseudo()
        return true
    } catch (error) {
        console.error('Erreur chargement progression :', error)
        return false
    }
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
// PROGRESSION — Sauvegarder dans le backend (nouveau flux Player)
// Appelée après chaque objet trouvé
// ════════════════════════════════════════════
async function sauvegarderProgression() {
    const username = localStorage.getItem('miyaza_username')
    if (!username) return

    // On reconstruit la liste des clés des objets trouvés
    const foundObjects = Object.entries(MODELS_DATA)
        .filter(([, data]) => data.isFound)
        .map(([key]) => key)

    try {
        await fetch(`${API_URL}/api/player/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, score, foundObjects })
        })
        console.log('💾 Progression sauvegardée')
    } catch (error) {
        console.error('Erreur sauvegarde progression :', error)
    }
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
        setTimeout(() => showAnecdote(), 800)
    } else {
        btn.classList.add('answer-wrong')
        playSound('/sound/wrong.wav')
    }
}

// ════════════════════════════════════════════
// ÉCRAN BRAVO
// ════════════════════════════════════════════
window.showBravo = function () {
    const anecdoteScreen = document.getElementById('screen-anecdote')
    anecdoteScreen.classList.add('pop-out')

    setTimeout(() => {
        anecdoteScreen.style.display = 'none'
        anecdoteScreen.classList.remove('pop-out')
        updateScore()

        const bravoScore = document.getElementById('bravo-score')
        if (bravoScore) {
            const pseudo = currentUsername ? `Bravo ${currentUsername} !` : 'Bravo !'
            bravoScore.innerText = `${pseudo} Tu as retrouvé ${score} souvenir${score > 1 ? 's' : ''} sur 25`
        }

        document.getElementById('screen-bravo').style.display = 'block'
    }, 300)
}

// ════════════════════════════════════════════
// FIN DE SÉQUENCE
// ════════════════════════════════════════════
window.finishSequence = function () {
    const bravoScreen = document.getElementById('screen-bravo')
    const interfaceMain = document.querySelector('main')

    bravoScreen.classList.add('pop-out')

    setTimeout(() => {
        bravoScreen.style.display = 'none'
        bravoScreen.classList.remove('pop-out')
        if (interfaceMain) interfaceMain.style.display = 'none'
    }, 300)
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
// CHANGER DE JOUEUR (remplace l'ancien handleLogout)
// ════════════════════════════════════════════
window.handleChangePlayer = function () {
    localStorage.removeItem('miyaza_username')
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
document.addEventListener('DOMContentLoaded', async () => {
    const savedUsername = localStorage.getItem('miyaza_username')
    if (savedUsername) {
        // Pseudo trouvé → on charge la progression depuis la BDD
        const success = await chargerProgression()
        if (success) {
            document.getElementById('screen-auth').style.display = 'none'
        } else {
            // Erreur → on affiche le menu
            showMenu()
        }
    } else {
        // Pas de pseudo → on affiche le menu principal
        showMenu()
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
