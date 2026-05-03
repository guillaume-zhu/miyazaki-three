import { API_URL } from '../config.js'

// Stockage en mémoire des films TMDB
export const FILMS_TMDB = {}

export async function chargerFilmsTMDB() {
    try {
        const response = await fetch(`${API_URL}/api/films/miyazaki`)
        const films = await response.json()

        for (const film of films) {
            FILMS_TMDB[film.id] = film
        }

        console.log('✅ Films TMDB chargés :', Object.keys(FILMS_TMDB).length, 'films')
    } catch (error) {
        console.error('❌ Impossible de charger les films TMDB :', error)
    }
}