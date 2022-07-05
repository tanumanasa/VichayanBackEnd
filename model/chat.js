const mongoose = require('mongoose')
const { Schema } = mongoose


const chatSchema = new Schema({
    message:{
        type: String
    },
    roomId:{
        type: Schema.Types.ObjectId,
        ref: 'room'
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    createdAt:{
        type: Date,
        default: Date.now 
    },
    updatedBy:{
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    updatedAt:{
        type: Date,
        default: Date.now 
    }
},{strict:false})


module.exports = mongoose.model('chat', chatSchema)