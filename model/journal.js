const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    documents: {
        type: []
    },
    author: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    coAuthor: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
});

module.exports = new mongoose.model('Journal', journalSchema);