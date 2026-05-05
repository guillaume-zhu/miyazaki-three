export function playSound(file, vol = 1.0) {
    const audio = new Audio(file)
    audio.volume = vol
    audio.play().catch(() => {})
}
