const mongoose = require('mongoose');
const {Schema} = require('mongoose');

const reportSchema = new mongoose.Schema({
    postId: {
        type: String,
        ref: 'post',
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

module.exports = mongoose.model('report', reportSchema);