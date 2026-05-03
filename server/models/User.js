import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true,
        sparse: true,  // unique mais peut être null (pas encore défini après register)
        trim: true,
        minlength: 2,
        maxlength: 20
    },
    avatar: {
        type: String,
        default: null  // clé de l'avatar choisi, ex: "avatar-1"
    }
}, {
    timestamps: true
})

export default mongoose.model('User', userSchema)
