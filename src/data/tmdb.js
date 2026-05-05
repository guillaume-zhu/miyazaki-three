import { FILMS_DATA } from './films.js'

export const FILMS_TMDB = FILMS_DATA

export async function chargerFilmsTMDB() {
    console.log('✅ Films TMDB chargés (statique) :', Object.keys(FILMS_TMDB).length, 'films')
}