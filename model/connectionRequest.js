const mongoose = require('mongoose')
const { Schema } = mongoose

const connectionRequestSchema = new Schema({
    sender:{
        type: Schema.Types.ObjectId,
        ref:'user',
        index:true
    },
    receiver:{
        type: Schema.Types.ObjectId,
        ref:'user',
        index:true
    },
    status:{
        type:"String",
        enum: ['sent', 'received', 'ignored']
    },
    createdAt:{
        type: Date,
        default: Date.now 
    }
})

module.exports = mongoose.model('connectionRequest', connectionRequestSchema)