const mongoose = require('mongoose');
const {Schema} = require('mongoose');

const followSchema = new mongoose.Schema({
    userId: {
        type: String,
        ref: 'user',
        index: true
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
});

module.exports = mongoose.model('follow', followSchema);