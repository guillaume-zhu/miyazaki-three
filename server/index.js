import 'dotenv/config'
import express from 'express'
import fetch from 'node-fetch'
import cors from 'cors'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import User from './models/User.js'
import Progression from './models/Progression.js'
import Player from './models/Player.js'

const app = express()

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json()) // pour lire le body des requêtes POST

const PORT = process.env.PORT || 3000
const TMDB_TOKEN = process.env.TMDB_BEARER_TOKEN
const JWT_SECRET = process.env.JWT_SECRET
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

// ── Connexion à MongoDB Atlas ──
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connecté'))
    .catch((err) => console.error('❌ Erreur MongoDB :', err))

console.log('Token TMDB:', TMDB_TOKEN ? '✓ OK' : '✗ AUCUN TOKEN')

// ════════════════════════════════════════════════
// MIDDLEWARE : vérifier le token JWT
// Ce middleware s'exécute avant les routes protégées
// pour vérifier que le joueur est bien connecté
// ════════════════════════════════════════════════
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization
    // Le header doit être : "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token manquant' })
    }

    const token = authHeader.split(' ')[1]
    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        req.userId = decoded.userId // on attache l'ID du joueur à la requête
        next() // tout est ok, on passe à la route
    } catch {
        return res.status(401).json({ error: 'Token invalide ou expiré' })
    }
}

// ════════════════════════════════════════════════
// ROUTES AUTH
// ════════════════════════════════════════════════

// ── POST /api/auth/register — Créer un compte ──
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' })
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Mot de passe trop court (6 caractères minimum)' })
        }

        // Vérifier si l'email est déjà utilisé
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(409).json({ error: 'Cet email est déjà utilisé' })
        }

        // Hasher le mot de passe (10 = niveau de complexité du hash)
        const hashedPassword = await bcrypt.hash(password, 10)

        // Créer le joueur en base
        const user = await User.create({ email, password: hashedPassword })

        // Créer une progression vide pour ce joueur
        await Progression.create({ userId: user._id })

        // Générer un token JWT valable 7 jours
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' })

        res.status(201).json({ token, email: user.email })
    } catch (error) {
        console.error('Erreur register :', error)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

// ── POST /api/auth/login — Se connecter ──
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' })
        }

        // Chercher le joueur par email
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' })
        }

        // Comparer le mot de passe avec le hash stocké
        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' })
        }

        // Générer un token JWT valable 7 jours
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' })

        // On renvoie aussi username et avatar pour les afficher dans le jeu
        res.json({
            token,
            email: user.email,
            username: user.username || null,
            avatar: user.avatar || null
        })
    } catch (error) {
        console.error('Erreur login :', error)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

// ── PATCH /api/auth/profile — Sauvegarder avatar + pseudo ──
app.patch('/api/auth/profile', authMiddleware, async (req, res) => {
    try {
        const { username, avatar } = req.body

        if (!username || username.trim().length < 2) {
            return res.status(400).json({ error: 'Pseudo trop court (2 caractères minimum)' })
        }
        if (username.trim().length > 20) {
            return res.status(400).json({ error: 'Pseudo trop long (20 caractères maximum)' })
        }

        // Vérifier que le pseudo n'est pas déjà pris par un autre joueur
        const existing = await User.findOne({
            username: username.trim(),
            _id: { $ne: req.userId } // on exclut l'utilisateur actuel
        })
        if (existing) {
            return res.status(409).json({ error: 'Ce pseudo est déjà pris' })
        }

        await User.findByIdAndUpdate(req.userId, {
            username: username.trim(),
            avatar: avatar || 'avatar-1'
        })

        res.json({ success: true, username: username.trim(), avatar })
    } catch (error) {
        console.error('Erreur profile :', error)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

// ── GET /api/auth/me — Récupérer les infos du joueur connecté ──
app.get('/api/auth/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password')
        if (!user) return res.status(404).json({ error: 'Joueur introuvable' })
        res.json({ email: user.email, username: user.username || null, avatar: user.avatar || null })
    } catch (error) {
        console.error('Erreur /me :', error)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

// ════════════════════════════════════════════════
// ROUTES PROGRESSION (protégées par authMiddleware)
// ════════════════════════════════════════════════

// ── GET /api/progression — Charger la progression du joueur ──
app.get('/api/progression', authMiddleware, async (req, res) => {
    try {
        const progression = await Progression.findOne({ userId: req.userId })
        if (!progression) {
            return res.json({ score: 0, foundObjects: [] })
        }
        res.json({ score: progression.score, foundObjects: progression.foundObjects })
    } catch (error) {
        console.error('Erreur get progression :', error)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

// ── POST /api/progression/save — Sauvegarder la progression ──
app.post('/api/progression/save', authMiddleware, async (req, res) => {
    try {
        const { score, foundObjects } = req.body

        // findOneAndUpdate : cherche et met à jour, ou crée si inexistant
        await Progression.findOneAndUpdate(
            { userId: req.userId },
            { score, foundObjects },
            { upsert: true } // crée le document s'il n'existe pas
        )

        res.json({ success: true })
    } catch (error) {
        console.error('Erreur save progression :', error)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

// ════════════════════════════════════════════════
// ROUTES TMDB (inchangées)
// ════════════════════════════════════════════════

async function fetchFilmData(id) {
    const headers = { Authorization: `Bearer ${TMDB_TOKEN}` }

    const [movieRes, videosRes] = await Promise.all([
        fetch(`${TMDB_BASE_URL}/movie/${id}?language=fr-FR`, { headers }),
        fetch(`${TMDB_BASE_URL}/movie/${id}/videos?language=fr-FR`, { headers })
    ])

    const data = await movieRes.json()
    const videosData = await videosRes.json()

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

app.get('/api/movie/:id', async (req, res) => {
    try {
        const film = await fetchFilmData(req.params.id)
        res.json(film)
    } catch (error) {
        console.error('Erreur TMDB :', error)
        res.status(500).json({ error: 'Impossible de récupérer les données du film' })
    }
})

const MIYAZAKI_FILM_IDS = [129, 8392, 128, 4935, 16859, 11621, 12477, 10515, 12429, 149870, 508883]

app.get('/api/films/miyazaki', async (req, res) => {
    try {
        const films = await Promise.all(MIYAZAKI_FILM_IDS.map(fetchFilmData))
        res.json(films)
    } catch (error) {
        console.error('Erreur TMDB :', error)
        res.status(500).json({ error: 'Impossible de récupérer les films' })
    }
})

// ════════════════════════════════════════════════
// ROUTES PLAYER (nouveau flux sans auth)
// ════════════════════════════════════════════════

// ── POST /api/player/join — Rejoindre ou reprendre une partie ──
app.post('/api/player/join', async (req, res) => {
    try {
        const { username, avatar } = req.body

        if (!username || username.trim().length < 2) {
            return res.status(400).json({ error: 'Pseudo trop court (2 caractères minimum)' })
        }
        if (username.trim().length > 20) {
            return res.status(400).json({ error: 'Pseudo trop long (20 caractères maximum)' })
        }

        // Chercher un joueur existant avec ce pseudo
        let player = await Player.findOne({ username: username.trim() })

        if (player) {
            // Joueur existant → on met à jour l'avatar si fourni et on renvoie ses données
            if (avatar) {
                player.avatar = avatar
                await player.save()
            }
            return res.json({
                username: player.username,
                avatar: player.avatar,
                score: player.score,
                foundObjects: player.foundObjects,
                isNew: false
            })
        }

        // Nouveau joueur → création
        player = await Player.create({
            username: username.trim(),
            avatar: avatar || 'avatar-1'
        })

        res.status(201).json({
            username: player.username,
            avatar: player.avatar,
            score: player.score,
            foundObjects: player.foundObjects,
            isNew: true
        })
    } catch (error) {
        // Gestion du cas où le pseudo est pris (race condition)
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Ce pseudo est déjà pris' })
        }
        console.error('Erreur player/join :', error)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

// ── POST /api/player/save — Sauvegarder la progression ──
app.post('/api/player/save', async (req, res) => {
    try {
        const { username, score, foundObjects } = req.body

        if (!username) {
            return res.status(400).json({ error: 'Pseudo requis' })
        }

        const player = await Player.findOneAndUpdate(
            { username: username.trim() },
            { score, foundObjects },
            { new: true }
        )

        if (!player) {
            return res.status(404).json({ error: 'Joueur introuvable' })
        }

        res.json({ success: true })
    } catch (error) {
        console.error('Erreur player/save :', error)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur http://localhost:${PORT}`)
})
