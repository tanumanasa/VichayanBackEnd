const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    },
    story: {
        type: {}
    },
    caption: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 86400
    }
});

module.exports = new mongoose.model('Story', storySchema);