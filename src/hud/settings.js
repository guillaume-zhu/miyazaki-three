import { state } from '../state/gameState.js'
import { afficherPseudo } from '../auth/profile.js'
import { toggleAllSounds, getMuted, nextTrack, prevTrack, getCurrentTrackLabel } from '../utils/sound.js'

// ── Seuils de déblocage (synchronisés avec milestones.js) ──
const UNLOCK = { music: 5, avatar: 10, badge: 15, theme: 20 }

const BADGES = [
    { key: 'explorateur', label: '<img src="/assets/map.svg" class="badge-icon" alt="" /> Explorateur' },
    { key: 'chercheur',   label: '<img src="/assets/loupe.svg" class="badge-icon" alt="" /> Chercheur de souvenirs' },
    { key: 'gardien',     label: '<img src="/assets/medaille.svg" class="badge-icon" alt="" /> Gardien de la mémoire' },
]

const THEMES = [
    { key: 'default',  label: 'Défaut',          colors: { bg: '#e9e0db', border: '#000000', accent: '#8ecc7f' } },
    { key: 'foret',    label: '🌿 Forêt',         colors: { bg: '#d4edda', border: '#2d6a4f', accent: '#52b788' } },
    { key: 'soleil',   label: '🌅 Coucher de soleil', colors: { bg: '#fde8c8', border: '#8b4513', accent: '#e35050' } },
]

// ════════════════════════════════════════════
// OUVRIR / FERMER
// ════════════════════════════════════════════

export function openSettings() {
    const dd = document.getElementById('player-dropdown')
    if (dd) dd.style.display = 'none'

    state.hudOpen = true

    const overlay = document.createElement('div')
    overlay.id = 'settings-overlay'
    overlay.className = 'settings-overlay'
    document.body.appendChild(overlay)

    renderSettings(overlay)
}

window.openSettings = openSettings

export function closeSettings() {
    const overlay = document.getElementById('settings-overlay')
    const modal = document.getElementById('settings-modal')
    if (modal) modal.classList.add('pop-out')

    setTimeout(() => {
        overlay?.remove()
        state.hudOpen = false
    }, 300)
}

// ════════════════════════════════════════════
// RENDU PRINCIPAL
// ════════════════════════════════════════════

function renderSettings(overlay) {
    const score = state.score

    overlay.innerHTML = `
        <div class="settings-modal" id="settings-modal">
            <div class="settings-header">
                <h2 class="settings-title"><img src="/assets/settings.svg" class="settings-icon-title" alt="" /> Paramètres</h2>
                <button class="settings-close" id="settings-close">✕</button>
            </div>
            <div class="settings-body">
                ${buildMusicSection(score)}
                ${buildAvatarSection(score)}
                ${buildBadgeSection(score)}
                ${buildThemeSection(score)}
            </div>
        </div>
    `

    document.getElementById('settings-close').addEventListener('click', closeSettings)
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSettings() })

    // Brancher les sections débloquées
    if (score >= UNLOCK.music)  wireMusicSection()
    if (score >= UNLOCK.avatar) wireAvatarSection()
    if (score >= UNLOCK.badge)  wireBadgeSection()
    if (score >= UNLOCK.theme)  wireThemeSection()

    // Toujours brancher l'accordéon sur les sections débloquées
    ;['music', 'avatar', 'badge', 'theme'].forEach(id => {
        const threshold = UNLOCK[id]
        if (score >= threshold) wireAccordion(id)
    })
}

// ════════════════════════════════════════════
// WRAPPER SECTION
// ════════════════════════════════════════════

function sectionWrap(id, emoji, label, threshold, score, contentHTML) {
    const unlocked = score >= threshold
    return `
        <div class="settings-section ${unlocked ? 'section-unlocked' : 'section-locked'}" id="section-${id}">
            <div class="settings-section-row" id="row-${id}">
                <div class="settings-section-left">
                    <span class="settings-emoji">${emoji}</span>
                    <div>
                        <p class="settings-section-label">${label}</p>
                        ${!unlocked ? `<p class="settings-lock-hint">Débloqué à ${threshold} / 32 souvenirs</p>` : ''}
                    </div>
                </div>
                <span class="${unlocked ? 'settings-chevron' : 'settings-lock-icon'}" id="chevron-${id}">
                    ${unlocked ? '›' : '🔒'}
                </span>
            </div>
            ${unlocked ? `<div class="settings-section-content" id="content-${id}" style="display:none">${contentHTML}</div>` : ''}
        </div>
    `
}

// ════════════════════════════════════════════
// BUILD HTML DES SECTIONS
// ════════════════════════════════════════════

function buildMusicSection(score) {
    const on = !getMuted()
    const label = getCurrentTrackLabel()
    const content = `
        <div class="settings-toggle-row">
            <span class="settings-toggle-label">Musique d'ambiance</span>
            <button class="settings-toggle-btn ${on ? 'toggle-on' : 'toggle-off'}" id="music-toggle">
                ${on ? '🔊 Activée' : '🔇 Désactivée'}
            </button>
        </div>
        <div class="settings-track-row">
            <button class="track-nav-btn" id="track-prev">‹</button>
            <span class="track-label" id="track-label">${label}</span>
            <button class="track-nav-btn" id="track-next">›</button>
        </div>
    `
    return sectionWrap('music', '<img src="/assets/musique.svg" class="settings-icon-svg" alt="" />', "Musique d'ambiance", UNLOCK.music, score, content)
}

function buildAvatarSection(score) {
    const current = localStorage.getItem('miyaza_avatar') || ''
    const grid = Array.from({ length: 8 }, (_, i) => i + 1).map(n => `
        <div class="avatar-card ${current === 'avatar-' + n ? 'selected' : ''}" data-avatar="avatar-${n}">
            <img src="/avatar/avatar-${n}.svg" class="avatar-img" />
        </div>
    `).join('')

    const content = `
        <div class="avatar-grid">${grid}</div>
        <button class="submit-btn settings-save-btn" id="avatar-save-btn">Confirmer</button>
    `
    return sectionWrap('avatar', '<img src="/assets/deguise.svg" class="settings-icon-svg" alt="" />', "Changer d'avatar", UNLOCK.avatar, score, content)
}

function buildBadgeSection(score) {
    const current = localStorage.getItem('miyaza_badge') || 'explorateur'
    const list = BADGES.map(b => `
        <div class="settings-badge-option ${current === b.key ? 'badge-selected' : ''}" data-badge="${b.key}">
            ${b.label}
        </div>
    `).join('')

    const content = `
        <div class="settings-badge-list" id="badge-list">${list}</div>
        <button class="submit-btn settings-save-btn" id="badge-save-btn">Confirmer</button>
    `
    return sectionWrap('badge', '<img src="/assets/titre.svg" class="settings-icon-svg" alt="" />', 'Titre / Badge', UNLOCK.badge, score, content)
}

function buildThemeSection(score) {
    const current = localStorage.getItem('miyaza_theme') || 'default'
    const list = THEMES.map(t => `
        <div class="settings-theme-option ${current === t.key ? 'theme-selected' : ''}"
             data-theme="${t.key}"
             style="background:${t.colors.bg}; border-color:${t.colors.border}">
            <span class="settings-theme-swatch" style="background:${t.colors.accent}"></span>
            <span class="settings-theme-name" style="color:${t.colors.border}">${t.label}</span>
        </div>
    `).join('')

    const content = `
        <div class="settings-theme-list" id="theme-list">${list}</div>
        <button class="submit-btn settings-save-btn" id="theme-save-btn">Appliquer</button>
    `
    return sectionWrap('theme', '<img src="/assets/interface.svg" class="settings-icon-svg" alt="" />', "Thème de l'interface", UNLOCK.theme, score, content)
}

// ════════════════════════════════════════════
// ACCORDÉON (expand/collapse)
// ════════════════════════════════════════════

function wireAccordion(id) {
    const row = document.getElementById('row-' + id)
    const content = document.getElementById('content-' + id)
    const chevron = document.getElementById('chevron-' + id)
    if (!row || !content) return

    row.style.cursor = 'pointer'
    row.addEventListener('click', () => {
        const isOpen = content.style.display !== 'none'
        content.style.display = isOpen ? 'none' : 'block'
        if (chevron) chevron.style.transform = isOpen ? '' : 'rotate(90deg)'
    })
}

// ════════════════════════════════════════════
// WIRING DES INTERACTIONS
// ════════════════════════════════════════════

function wireMusicSection() {
    document.getElementById('music-toggle')?.addEventListener('click', (e) => {
        e.stopPropagation()
        const muted = toggleAllSounds()
        const enabled = !muted
        const btn = document.getElementById('music-toggle')
        btn.textContent = enabled ? '🔊 Activée' : '🔇 Désactivée'
        btn.className = `settings-toggle-btn ${enabled ? 'toggle-on' : 'toggle-off'}`
    })

    document.getElementById('track-prev')?.addEventListener('click', (e) => {
        e.stopPropagation()
        prevTrack()
    })

    document.getElementById('track-next')?.addEventListener('click', (e) => {
        e.stopPropagation()
        nextTrack()
    })

    // Mise à jour du label quand la piste change (flèches ou auto-avance)
    window.addEventListener('miyaza:trackchange', () => {
        const labelEl = document.getElementById('track-label')
        if (labelEl) labelEl.textContent = getCurrentTrackLabel()
    })
}

function wireAvatarSection() {
    let selected = localStorage.getItem('miyaza_avatar') || ''

    document.querySelectorAll('#content-avatar .avatar-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.stopPropagation()
            document.querySelectorAll('#content-avatar .avatar-card').forEach(c => c.classList.remove('selected'))
            card.classList.add('selected')
            selected = card.dataset.avatar
        })
    })

    document.getElementById('avatar-save-btn')?.addEventListener('click', (e) => {
        e.stopPropagation()
        if (!selected) return
        localStorage.setItem('miyaza_avatar', selected)
        state.selectedAvatar = selected
        afficherPseudo()

        const btn = document.getElementById('avatar-save-btn')
        btn.textContent = '✓ Sauvegardé !'
        setTimeout(() => { btn.textContent = 'Confirmer' }, 1500)
    })
}

function wireBadgeSection() {
    let selected = localStorage.getItem('miyaza_badge') || 'explorateur'

    document.querySelectorAll('#badge-list .settings-badge-option').forEach(opt => {
        opt.addEventListener('click', (e) => {
            e.stopPropagation()
            document.querySelectorAll('#badge-list .settings-badge-option').forEach(o => o.classList.remove('badge-selected'))
            opt.classList.add('badge-selected')
            selected = opt.dataset.badge
        })
    })

    document.getElementById('badge-save-btn')?.addEventListener('click', (e) => {
        e.stopPropagation()
        localStorage.setItem('miyaza_badge', selected)
        updateBadgeDisplay(selected)

        const btn = document.getElementById('badge-save-btn')
        btn.textContent = '✓ Sauvegardé !'
        setTimeout(() => { btn.textContent = 'Confirmer' }, 1500)
    })
}

function wireThemeSection() {
    let selected = localStorage.getItem('miyaza_theme') || 'default'

    document.querySelectorAll('#theme-list .settings-theme-option').forEach(opt => {
        opt.addEventListener('click', (e) => {
            e.stopPropagation()
            document.querySelectorAll('#theme-list .settings-theme-option').forEach(o => o.classList.remove('theme-selected'))
            opt.classList.add('theme-selected')
            selected = opt.dataset.theme
        })
    })

    document.getElementById('theme-save-btn')?.addEventListener('click', (e) => {
        e.stopPropagation()
        const theme = THEMES.find(t => t.key === selected)
        if (!theme) return
        applyTheme(theme)
        localStorage.setItem('miyaza_theme', selected)

        const btn = document.getElementById('theme-save-btn')
        btn.textContent = '✓ Appliqué !'
        setTimeout(() => { btn.textContent = 'Appliquer' }, 1500)
    })
}

// ════════════════════════════════════════════
// THÈME — Variables CSS
// ════════════════════════════════════════════

export function applyTheme(theme) {
    const root = document.documentElement
    root.style.setProperty('--bg-color', theme.colors.bg)
    root.style.setProperty('--border-color', theme.colors.border)
    root.style.setProperty('--accent-color', theme.colors.accent)
}

export function loadSavedTheme() {
    const key = localStorage.getItem('miyaza_theme') || 'default'
    const theme = THEMES.find(t => t.key === key)
    if (theme) applyTheme(theme)
}

// ════════════════════════════════════════════
// BADGE — Affichage sous le pseudo
// ════════════════════════════════════════════

export function updateBadgeDisplay(key) {
    const badge = BADGES.find(b => b.key === key)
    const el = document.getElementById('header-badge')
    if (el && badge) el.innerHTML = badge.label
}

export function loadSavedBadge() {
    const key = localStorage.getItem('miyaza_badge')
    if (key) updateBadgeDisplay(key)
}
