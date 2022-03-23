const mongoose = require('mongoose')
const { Schema } = mongoose


const tagSchema = new Schema({
    tagName:{
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


module.exports = mongoose.model('tag', tagSchema)