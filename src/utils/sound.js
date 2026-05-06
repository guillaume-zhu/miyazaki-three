// État global du son
let isMuted = false;
let backgroundMusic = null;

/**
 * Joue un son ponctuel (bruitage)
 */
export function playSound(file, vol = 1.0) {
    if (isMuted) return; // Ne fait rien si le son est coupé

    const audio = new Audio(file);
    audio.volume = vol;
    audio.play().catch(() => {});
}

/**
 * Joue la musique de fond en boucle
 */
export function playBackgroundMusic(file, vol = 0.5) {
    if (!backgroundMusic) {
        backgroundMusic = new Audio(file);
        backgroundMusic.loop = true; // Active la lecture en boucle
    }
    
    backgroundMusic.volume = vol;
    
    if (!isMuted) {
        backgroundMusic.play().catch(() => {});
    }
}

/**
 * Alterne entre muet et sonore pour TOUS les sons
 */
export function toggleAllSounds() {
    isMuted = !isMuted;

    // Gestion de la musique de fond
    if (backgroundMusic) {
        if (isMuted) {
            backgroundMusic.pause();
        } else {
            backgroundMusic.play().catch(() => {});
        }
    }
    
    return isMuted; // Retourne l'état pour changer l'icône si besoin
}