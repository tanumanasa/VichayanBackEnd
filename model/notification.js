const mongoose = require('mongoose')
const { Schema } = mongoose


const notificationSchema = new Schema({
    type: {
        type: String,
        enum: ["ConnectionRecieved", "ConnectionAccept"],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'user',
        index:true
    },
    isSeen: {
        type: Boolean,
        default: false,
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: 'user',
        index:true
    },
    updatedBy:{
        type: Schema.Types.ObjectId,
        ref: 'user',
        index:true
    },
    createdAt:{
        type: Date,
        default: Date.now 
    },
    updatedAt:{
        type: Date,
    }
})


module.exports = mongoose.model('notification', notificationSchema)