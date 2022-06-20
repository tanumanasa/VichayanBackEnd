const mongoose = require('mongoose')
const { Schema } = mongoose

const connectionSchema = new Schema({
    createdBy:{
        type: Schema.Types.ObjectId,
        ref:'user',
        index:true
    },
    recievedBy:{
        type: Schema.Types.ObjectId,
        ref:'user',
        index:true
    },
    status :{
        type: String,
        default: 'sent' 
    },
    isDeleted :{
        type: Boolean,
        default: false 
    },
    createdAt:{
        type: Date,
        default: Date.now 
    }
})

module.exports = mongoose.model('connection', connectionSchema)