// models/Score.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const scoreSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  mode: {
    type: Number,
    required: true    // total questions in that attempt
  },
  recordedAt: {
    type: Date,
    default: Date.now
  }
});

// one per user+mode to avoid duplicates (optional)
scoreSchema.index({ user: 1, mode: 1 }, { unique: true });

module.exports = mongoose.model('Score', scoreSchema);
