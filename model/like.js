const mongoose = require('mongoose')
const { Schema } = mongoose


const likeSchema = new Schema({
    postId:{
        type: String,
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


module.exports = mongoose.model('like', likeSchema)