const mongoose = require('mongoose')
const { Schema } = mongoose


const tagarticlemappingSchema = new Schema({
    tagId:{
        type: Schema.Types.ObjectId,
        ref:'tag',
        index:true
    },
    articleId:{
        type: Schema.Types.ObjectId,
        ref: 'article',
        index:true
    },
    createdAt:{
        type: Date,
        default: Date.now 
    }
})


module.exports = mongoose.model('tagarticlemapping', tagarticlemappingSchema)