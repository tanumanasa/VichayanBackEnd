const mongoose = require('mongoose')
const { Schema } = mongoose

const postSchema = new Schema({
    text:{
        type: String
    },
    images: [],
    docs: [],
    websitesLink:[],
    privacy:{
        type: String,
        enum:["private", "public", "connections"]
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    createdAt:{
        type: Date,
        default: Date.now 
    }
},{strict:false})

module.exports = mongoose.model('post', postSchema)


