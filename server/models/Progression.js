import mongoose from 'mongoose'

const progressionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',      // lien vers le modèle User
        required: true,
        unique: true      // un seul document de progression par joueur
    },
    score: {
        type: Number,
        default: 0        // commence à 0
    },
    foundObjects: {
        type: [String],   // liste de clés d'objets trouvés (ex: ["totoro", "calcifer"])
        default: []       // vide au départ
    }
}, {
    timestamps: true
})

export default mongoose.model('Progression', progressionSchema)
