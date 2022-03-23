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
    }
},{strict:false})


module.exports = mongoose.model('article', articleSchema)