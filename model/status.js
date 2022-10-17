const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
    userId: {
        type: String,
        ref: 'user',
        required: true,
    },
    status: {
        type: String,
        enum: ['online', 'offline'],
    },
    lastOnline: {
        type: Date,
        default: Date.now()
    }
});

module.exports = new mongoose.model('Status', statusSchema);
