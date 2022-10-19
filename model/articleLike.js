const mongoose = require('mongoose')
const { Schema } = mongoose


const articleLikeSchema = new Schema({
    articleId:{
        type: String,
        ref: 'article',
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


module.exports = mongoose.model('articleLike', articleLikeSchema)