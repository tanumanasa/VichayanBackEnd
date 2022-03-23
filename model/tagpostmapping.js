const mongoose = require('mongoose')
const { Schema } = mongoose


const tagpostmappingSchema = new Schema({
    tagId:{
        type: Schema.Types.ObjectId,
        ref:'tag',
        index:true
    },
    postId:{
        type: Schema.Types.ObjectId,
        ref: 'post',
        index:true
    },
    createdAt:{
        type: Date,
        default: Date.now 
    }
})


module.exports = mongoose.model('tagpostmapping', tagpostmappingSchema)