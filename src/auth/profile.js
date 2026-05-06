import naughtyWords from 'naughty-words'
import { state } from '../state/gameState.js'
import { checkReadyState } from '../hud/HUD.js'

// ════════════════════════════════════════════
// AVATAR — Sélection
// ════════════════════════════════════════════
window.selectAvatar = function (avatarKey) {
    state.selectedAvatar = avatarKey
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
// PSEUDO — Affichage dans l'interface
// ════════════════════════════════════════════
export function afficherPseudo() {
    if (!state.currentUsername) return

    const pseudoEl = document.getElementById('header-pseudo')
    if (pseudoEl) pseudoEl.innerText = state.currentUsername

    const avatarEl = document.getElementById('header-avatar')
    if (avatarEl) {
        const savedAvatar = localStorage.getItem('miyaza_avatar')
        if (savedAvatar) avatarEl.src = `/avatar/${savedAvatar}.svg`
    }
}

// ════════════════════════════════════════════
// PROFIL — Rejoindre le jeu avec pseudo + avatar
// Stockage en localStorage (pas d'appel serveur)
// ════════════════════════════════════════════
window.handleProfileSetup = function () {
    const username = document.getElementById('profile-username').value.trim()
    const errorEl = document.getElementById('profile-error')
    errorEl.innerText = ''

    if (!state.selectedAvatar) {
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
    localStorage.setItem('miyaza_avatar', state.selectedAvatar)

    state.currentUsername = username

    const el = document.querySelector('.score-counter')
    if (el) el.innerText = `${state.score} / 32`

    afficherPseudo()
    
    // Le profil est prêt, on cache le formulaire et on vérifie si les modèles sont chargés
    document.getElementById('auth-profile').style.display = 'none'
    state.profileReady = true
    
    if (!state.modelsLoaded) {
        document.getElementById('loader-progress-group').style.display = 'block'
    }

    checkReadyState()
}

// ════════════════════════════════════════════
// CHANGER DE JOUEUR
// ════════════════════════════════════════════
window.handleChangePlayer = function () {
    // Progression
    localStorage.removeItem('miyaza_username')
    localStorage.removeItem('miyaza_avatar')
    localStorage.removeItem('miyaza_score')
    localStorage.removeItem('miyaza_foundObjects')
    // Paliers & préférences (ajoutés avec le système de settings/milestones)
    localStorage.removeItem('miyaza_milestonesShown')
    localStorage.removeItem('miyaza_music')
    localStorage.removeItem('miyaza_badge')
    localStorage.removeItem('miyaza_theme')

    // On recharge simplement la page pour recommencer le flux
    window.location.reload()
}

window.togglePlayerDropdown = function () {
    const dd = document.getElementById('player-dropdown')
    if (dd) dd.style.display = dd.style.display === 'none' ? 'block' : 'none'
}

/* === AUTH LEGACY START ===
// ════════════════════════════════════════════
// TOKEN JWT — Stockage dans localStorage
// ════════════════════════════════════════════
export function getToken() {
    return localStorage.getItem('miyaza_token')
}

export function setToken(token) {
    localStorage.setItem('miyaza_token', token)
}

export function removeToken() {
    localStorage.removeItem('miyaza_token')
}

// ════════════════════════════════════════════
// AUTH — Login (ancien système)
// ════════════════════════════════════════════
window.handleLogin = async function () {
    const email = document.getElementById('auth-email').value.trim()
    const password = document.getElementById('auth-password').value
    const errorEl = document.getElementById('auth-error')
    errorEl.innerText = ''

    try {
        const res = await fetch(\`\${API_URL}/api/auth/login\`, {
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
            state.currentUsername = data.username
            afficherPseudo()
            if(typeof onAuthSuccess === 'function') await onAuthSuccess()
        } else {
            if(typeof showProfileSetup === 'function') showProfileSetup()
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
        const res = await fetch(\`\${API_URL}/api/auth/register\`, {
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
        if(typeof showProfileSetup === 'function') showProfileSetup()
    } catch {
        errorEl.innerText = 'Impossible de contacter le serveur'
    }
}

// ════════════════════════════════════════════
// DÉCONNEXION (ancien système)
// ════════════════════════════════════════════
window.handleLogout = async function () {
    const { MODELS_DATA } = await import('../data/models.js')
    removeToken()
    state.score = 0
    state.currentUsername = null
    state.selectedAvatar = null
    for (const key of Object.keys(MODELS_DATA)) {
        MODELS_DATA[key].isFound = false
    }
    const el = document.querySelector('.score-counter')
    if (el) el.innerText = '0 / 32'

    const pseudoEl = document.getElementById('header-pseudo')
    if (pseudoEl) pseudoEl.remove()

    document.getElementById('screen-auth').style.display = 'flex'
    if(typeof showMenu === 'function') showMenu()
}
=== AUTH LEGACY END === */
