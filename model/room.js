const mongoose = require('mongoose')
const { Schema } = mongoose


const roomSchema = new Schema({
    message:{
        type: String
    },
    member:{
        type: Schema.Types.ObjectId,
        ref: 'room'
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


module.exports = mongoose.model('room', roomSchema)