const mongoose = require('mongoose');

// Define the schema for user
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        unique: true, // Ensure unique usernames
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    scores: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Score', // Ref to Score model
        }
    ]
}, {timestamps: true}); // Add createdAt and updatedAt fields automatically

// Create a User model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;