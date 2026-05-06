// ════════════════════════════════════════════
// PLAYLIST
// ════════════════════════════════════════════
export const MUSIC_TRACKS = [
    { file: '/sound/music/ghibli-music-mix.mp3',                           label: 'Ghibli Mix' },
    { file: '/sound/music/a-journey-monaural-joe.mp3',                     label: 'A Journey' },
    { file: '/sound/music/bygone-days-porco-rosso.mp3',                    label: 'Bygone Days' },
    { file: '/sound/music/day-of-the-river-joe-hisaishi.mp3',              label: 'Day of the River' },
    { file: '/sound/music/heartbroken-kiki-.mp3',                          label: 'Heartbroken (Kiki)' },
    { file: '/sound/music/musique-kiki-1.MP3',                             label: "Kiki's Theme" },
    { file: '/sound/music/princess-mononoke-instrumental-joe-hisaishi.mp3',label: 'Princess Mononoké' },
    { file: '/sound/music/the-flower-garden-joe-hisaishi.mp3',             label: 'The Flower Garden' },
    { file: '/sound/music/the-path-of-the-wind.mp3',                       label: 'The Path of the Wind' },
    { file: '/sound/music/the-promise-of-the-world.mp3',                   label: 'The Promise of the World' },
    { file: '/sound/music/to-ursulas-cabin.mp3',                           label: "To Ursula's Cabin" },
]

// ════════════════════════════════════════════
// ÉTAT GLOBAL
// ════════════════════════════════════════════
let isMuted = false
let _audio = null
let _currentIndex = 0
const MUSIC_VOLUME = 0.4
let _fadeInterval = null

// ════════════════════════════════════════════
// SONS PONCTUELS
// ════════════════════════════════════════════
export function playSound(file, vol = 1.0) {
    if (isMuted) return
    const audio = new Audio(file)
    audio.volume = vol
    audio.play().catch(() => {})
}

// ════════════════════════════════════════════
// MUSIQUE DE FOND — init
// ════════════════════════════════════════════
export function initMusic() {
    let saved = parseInt(localStorage.getItem('miyaza_track') || '0', 10)
    if (isNaN(saved) || saved < 0 || saved >= MUSIC_TRACKS.length) saved = 0
    _startTrack(saved)
}

// ════════════════════════════════════════════
// CHANGEMENT DE PISTE (avec fade)
// ════════════════════════════════════════════
function _startTrack(index) {
    if (_audio) {
        _audio.pause()
        _audio.src = ''
    }
    _currentIndex = index
    localStorage.setItem('miyaza_track', String(index))

    _audio = new Audio(MUSIC_TRACKS[index].file)
    _audio.volume = isMuted ? 0 : MUSIC_VOLUME
    _audio.addEventListener('ended', () => nextTrack())

    if (!isMuted) {
        _audio.play().catch(() => {})
    }
}

function _fadeTo(target, duration = 700, onComplete) {
    if (_fadeInterval) clearInterval(_fadeInterval)
    if (!_audio) { onComplete?.(); return }

    const STEPS = 20
    const stepMs = duration / STEPS
    const start = _audio.volume
    const delta = (target - start) / STEPS
    let step = 0

    _fadeInterval = setInterval(() => {
        step++
        if (_audio) _audio.volume = Math.max(0, Math.min(1, start + delta * step))
        if (step >= STEPS) {
            clearInterval(_fadeInterval)
            _fadeInterval = null
            onComplete?.()
        }
    }, stepMs)
}

export function setTrack(index) {
    if (index === _currentIndex) return

    const _dispatch = () => {
        window.dispatchEvent(new CustomEvent('miyaza:trackchange', { detail: { index } }))
    }

    if (isMuted) {
        _startTrack(index)
        _dispatch()
        return
    }

    _fadeTo(0, 700, () => {
        _startTrack(index)
        _fadeTo(MUSIC_VOLUME, 700)
        _dispatch()
    })
}

export function nextTrack() {
    setTrack((_currentIndex + 1) % MUSIC_TRACKS.length)
}

export function prevTrack() {
    setTrack((_currentIndex - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length)
}

export function getCurrentTrackIndex() {
    return _currentIndex
}

export function getCurrentTrackLabel() {
    return MUSIC_TRACKS[_currentIndex]?.label ?? ''
}

// ════════════════════════════════════════════
// MUTE / UNMUTE
// ════════════════════════════════════════════
export function toggleAllSounds() {
    isMuted = !isMuted
    if (_audio) {
        if (isMuted) {
            _audio.pause()
        } else {
            _audio.volume = MUSIC_VOLUME
            _audio.play().catch(() => {})
        }
    }
    return isMuted
}

export function getMuted() {
    return isMuted
}
