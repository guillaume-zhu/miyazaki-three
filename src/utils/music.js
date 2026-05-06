// ════════════════════════════════════════════
// MUSIQUE D'AMBIANCE — Singleton
// ════════════════════════════════════════════

let ambientAudio = null
let _enabled = localStorage.getItem('miyaza_music') !== 'false' // true par défaut

/**
 * Initialise et lance la musique d'ambiance.
 * Doit être appelé après une interaction utilisateur (politique autoplay).
 */
export function initMusic() {
    ambientAudio = new Audio('/sound/Ghibli-sounds-shortened.MP3')
    ambientAudio.loop = true
    ambientAudio.volume = 0.25

    if (_enabled) {
        ambientAudio.play().catch(() => {
            // Autoplay bloqué — on ignore silencieusement
        })
    }
}

/**
 * Bascule la musique on/off.
 * @returns {boolean} Nouvel état (true = activée)
 */
export function toggleMusic() {
    _enabled = !_enabled
    localStorage.setItem('miyaza_music', _enabled ? 'true' : 'false')

    if (_enabled) {
        ambientAudio?.play().catch(() => {})
    } else {
        ambientAudio?.pause()
    }

    return _enabled
}

export function isMusicEnabled() {
    return _enabled
}
