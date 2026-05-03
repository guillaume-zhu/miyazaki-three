import mongoose from 'mongoose'

const playerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 2,
        maxlength: 20
    },
    avatar: {
        type: String,
        default: 'avatar-1'
    },
    score: {
        type: Number,
        default: 0
    },
    foundObjects: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
})

export default mongoose.model('Player', playerSchema)
