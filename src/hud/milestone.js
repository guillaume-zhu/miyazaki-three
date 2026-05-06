import { MILESTONES } from '../data/milestones.js';
import { playSound } from '../utils/sound.js';
import { state } from '../state/gameState.js';

// ════════════════════════════════════════════
// GESTION DES PALIERS (MILESTONES)
// ════════════════════════════════════════════

/**
 * Vérifie si le score actuel déclenche un palier.
 * Appelé depuis updateScore() dans quiz.js.
 */
export function checkMilestone(score) {
    const milestone = MILESTONES.find(m => m.threshold === score);
    if (!milestone) return;

    // Vérifier si le palier a déjà été affiché (anti-doublon)
    const shownMilestonesStr = localStorage.getItem('miyaza_milestonesShown');
    const shownMilestones = shownMilestonesStr ? JSON.parse(shownMilestonesStr) : [];

    if (shownMilestones.includes(milestone.id)) {
        console.log(`Palier ${milestone.id} déjà vu.`);
        return;
    }

    // Retarder l'affichage pour laisser passer le toast trophée
    setTimeout(() => {
        showMilestonePopup(milestone);
        
        // Sauvegarder l'affichage
        shownMilestones.push(milestone.id);
        localStorage.setItem('miyaza_milestonesShown', JSON.stringify(shownMilestones));
    }, 600); // 0.6s — le popup arrive juste après le toast, les deux sont visibles ensemble
}

/**
 * Construit et affiche le popup pour un palier donné.
 */
export function showMilestonePopup(milestoneData) {
    const overlay = document.createElement('div');
    overlay.className = 'milestone-overlay';
    overlay.id = 'milestone-overlay';

    // Générer les confettis CSS si c'est le palier final
    let confettiHTML = '';
    if (milestoneData.isFinal) {
        confettiHTML = '<div class="milestone-confetti-container">';
        const colors = ['#8ecc7f', '#e9e0db', '#f4c542', '#e35050', '#7bb3e0'];
        for (let i = 0; i < 40; i++) {
            const left = Math.random() * 100;
            const animDuration = 2 + Math.random() * 3;
            const animDelay = Math.random() * 2;
            const color = colors[Math.floor(Math.random() * colors.length)];
            confettiHTML += `<div class="confetti" style="left: ${left}%; background-color: ${color}; animation-duration: ${animDuration}s; animation-delay: ${animDelay}s;"></div>`;
        }
        confettiHTML += '</div>';
    }

    overlay.innerHTML = `
        ${confettiHTML}
        <div class="milestone-popup ${milestoneData.isFinal ? 'milestone-final' : ''}" id="milestone-popup">
            <h2 class="milestone-header">${milestoneData.title}</h2>
            <div class="milestone-icon-box">
                ${milestoneData.emoji}
            </div>
            <p class="milestone-reward">${milestoneData.rewardName}</p>
            <p class="milestone-desc">${milestoneData.description}</p>
            <button class="submit-btn milestone-close-btn" id="milestone-close-btn">${milestoneData.buttonText}</button>
        </div>
    `;

    document.body.appendChild(overlay);

    // Bloquer le raycaster pendant l'affichage du popup
    state.hudOpen = true;

    // Son de victoire (différent si final)
    playSound(milestoneData.isFinal ? '/sound/correct.wav' : '/sound/trophy-sound.mp3', 0.6);

    const closeBtn = document.getElementById('milestone-close-btn');
    closeBtn.addEventListener('click', () => {
        closeMilestonePopup(overlay, milestoneData);
    });
}

/**
 * Ferme le popup avec animation et affiche le tooltip.
 */
function closeMilestonePopup(overlay, milestoneData) {
    const popup = document.getElementById('milestone-popup');
    if (popup) {
        popup.classList.add('pop-out');
    }

    playSound('/sound/wind-sound.mp3', 0.5);

    setTimeout(() => {
        overlay.remove();
        state.hudOpen = false;

        // Afficher le tooltip (Option 2)
        if (milestoneData.tooltipText) {
            showMilestoneTooltip(milestoneData.tooltipText);
        }
    }, 300);
}

/**
 * Affiche le tooltip pointant vers le menu joueur/paramètres.
 */
function showMilestoneTooltip(text) {
    let tooltip = document.getElementById('milestone-tooltip');
    
    // Créer s'il n'existe pas
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'milestone-tooltip';
        tooltip.className = 'milestone-tooltip';
        document.body.appendChild(tooltip);
    }

    tooltip.innerHTML = text;
    
    // Afficher
    requestAnimationFrame(() => {
        tooltip.classList.add('show');
    });

    // Cacher après 4 secondes
    setTimeout(() => {
        tooltip.classList.remove('show');
    }, 4000);
}
