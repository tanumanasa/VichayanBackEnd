const mongoose = require('mongoose')
const { Schema } = mongoose


const articleSchema = new Schema({
    text:{
        type: String
    },
    images: [],
    link: [],
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    createdAt:{
        type: Date,
        default: Date.now 
    },
    likesCount: {
        type: Number,
        default: 0
    }
},{strict:false})


module.exports = mongoose.model('article', articleSchema)