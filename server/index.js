import 'dotenv/config'
import express from 'express'
import fetch from 'node-fetch'
import cors from 'cors'

const app = express()

app.use(cors({ origin: 'http://localhost:5173' }))

const PORT = process.env.PORT || 3000
const TMDB_TOKEN = process.env.TMDB_BEARER_TOKEN
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

// ── Helper : récupère les données d'un film + son trailer en parallèle ──
async function fetchFilmData(id) {
    const headers = { Authorization: `Bearer ${TMDB_TOKEN}` }

    const [movieRes, videosRes] = await Promise.all([
        fetch(`${TMDB_BASE_URL}/movie/${id}?language=fr-FR`, { headers }),
        fetch(`${TMDB_BASE_URL}/movie/${id}/videos?language=fr-FR`, { headers })
    ])

    const data = await movieRes.json()
    const videosData = await videosRes.json()

    // Cherche un trailer YouTube
    const trailer = videosData.results?.find(
        v => v.type === 'Trailer' && v.site === 'YouTube'
    )

    return {
        id: data.id,
        title: data.title,
        year: data.release_date?.split('-')[0],
        note: Math.round(data.vote_average * 10) / 10,
        overview: data.overview,
        poster: data.poster_path
            ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
            : null,
        trailerUrl: trailer
            ? `https://www.youtube.com/watch?v=${trailer.key}`
            : null
    }
}

// ── ROUTE 1 : Un film par ID — GET /api/movie/129 ──
app.get('/api/movie/:id', async (req, res) => {
    try {
        const film = await fetchFilmData(req.params.id)
        res.json(film)
    } catch (error) {
        console.error('Erreur TMDB :', error)
        res.status(500).json({ error: 'Impossible de récupérer les données du film' })
    }
})

// ── ROUTE 2 : Tous les films Miyazaki — GET /api/films/miyazaki ──
const MIYAZAKI_FILM_IDS = [129, 8392, 128, 4935, 16859, 11621, 12477, 10515, 12429, 149870, 614930]

app.get('/api/films/miyazaki', async (req, res) => {
    try {
        const films = await Promise.all(MIYAZAKI_FILM_IDS.map(fetchFilmData))
        res.json(films)
    } catch (error) {
        console.error('Erreur TMDB :', error)
        res.status(500).json({ error: 'Impossible de récupérer les films' })
    }
})

app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur http://localhost:${PORT}`)
})