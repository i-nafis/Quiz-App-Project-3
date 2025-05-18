const mongoose = require('mongoose');

// Define schema for score
const scoreSchema = new mongoose.Schema({
    score: {
        type: Number,
        required: true,
    },
    mode: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
});

// Create a score model from the schema
const Score = mongoose.model('Score', scoreSchema);
