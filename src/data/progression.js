import { state } from '../state/gameState.js'
import { MODELS_DATA } from './models.js'
import { afficherPseudo } from '../auth/profile.js'

// ════════════════════════════════════════════
// PROGRESSION — Charger depuis localStorage
// ════════════════════════════════════════════
export function chargerProgression() {
    const username = localStorage.getItem('miyaza_username')
    if (!username) return false

    state.currentUsername = username
    state.score = parseInt(localStorage.getItem('miyaza_score') || '0')

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
    if (el) el.innerText = `${state.score} / 25`

    afficherPseudo()
    return true
}

// ════════════════════════════════════════════
// PROGRESSION — Sauvegarder en localStorage
// Appelée après chaque objet trouvé
// ════════════════════════════════════════════
export function sauvegarderProgression() {
    const foundObjects = Object.entries(MODELS_DATA)
        .filter(([, data]) => data.isFound)
        .map(([key]) => key)

    localStorage.setItem('miyaza_score', state.score.toString())
    localStorage.setItem('miyaza_foundObjects', JSON.stringify(foundObjects))
    console.log('💾 Progression sauvegardée (localStorage)')
}

/* === AUTH LEGACY START ===
// ════════════════════════════════════════════
// PROGRESSION — Charger depuis le backend (ancien système JWT)
// ════════════════════════════════════════════
export async function chargerProgressionLegacy() {
    const { getToken, removeToken } = await import('../auth/profile.js')
    const token = getToken()
    if (!token) return

    try {
        const res = await fetch(`${API_URL}/api/progression`, {
            headers: { Authorization: \`Bearer \${token}\` }
        })

        if (!res.ok) {
            removeToken()
            document.getElementById('screen-auth').style.display = 'flex'
            return
        }

        const { score: savedScore, foundObjects } = await res.json()

        state.score = savedScore
        for (const key of foundObjects) {
            if (MODELS_DATA[key]) MODELS_DATA[key].isFound = true
        }

        const el = document.querySelector('.score-counter')
        if (el) el.innerText = `${state.score} / 25`

        const meRes = await fetch(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (meRes.ok) {
            const me = await meRes.json()
            if (me.username) {
                state.currentUsername = me.username
                afficherPseudo()
            }
        }

        console.log('✅ Progression chargée :', state.score, 'objet(s) trouvé(s)')
    } catch (error) {
        console.error('Erreur chargement progression :', error)
    }
}

// ════════════════════════════════════════════
// PROGRESSION — Sauvegarder (ancien système JWT)
// ════════════════════════════════════════════
export async function sauvegarderProgressionLegacy() {
    const { getToken } = await import('../auth/profile.js')
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
            body: JSON.stringify({ score: state.score, foundObjects })
        })
        console.log('💾 Progression sauvegardée')
    } catch (error) {
        console.error('Erreur sauvegarde progression :', error)
    }
}
=== AUTH LEGACY END === */
