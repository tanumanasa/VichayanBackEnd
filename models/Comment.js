const mongoose = require('mongoose')
const { Schema } = mongoose

const commentSchema = new Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    text: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    pic:{
        type:String,
    },
    commentedBy:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})


module.exports = mongoose.model('comment', commentSchema)