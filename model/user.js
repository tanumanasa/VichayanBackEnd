const mongoose = require('mongoose')
const { Schema } = mongoose


const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        min: 3,
        max: 10
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    isThirdPartyUser: {
        type: Boolean,
        required: true
    },
    isEmailVerified:{
        type:Boolean,
        default:false
    },
    password: {
        type: String,
        required: function () {
            return !this.isThirdPartyUser
        },
        trim: true
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: Number,
        default: -1
    },
    verificationToken: {
        type: String,
        expire_at: { type: Date, default: Date.now, expires: 300 }
    },
    phoneNumber: {
        type: Number,
        length: 10
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    country: {
        type: String
    },
    profilePicture: {},
    coverPicture: {},
    skills: [],
    languages: [],
    designation: {
        type: String
    },
    gender:{
        type: String,
        enum:["Male", "Female", "Other"]
    },
    dob:{
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    sequence:{
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model('user', userSchema)

