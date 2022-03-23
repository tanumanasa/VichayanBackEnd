const mongoose = require('mongoose')
const { Schema } = mongoose

const replySchema = new Schema({
    reply:{
        type: String
    },
    commentId:{
        type: Schema.Types.ObjectId,
        ref: 'comment',
        index:true
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: 'user',
        index:true
    },
    createdAt:{
        type: Date,
        default: Date.now 
    }
})

module.exports = mongoose.model('reply', replySchema)