const mongoose = require('mongoose');
const { Schema } = mongoose;

const questionSchema = new Schema({
  text:     { type: String,  required: true },
  choices:  { type: [String], required: true },
  correct:  { type: String,  required: true }
}, { _id: true });

const quizSchema = new Schema({
  title:      { type: String, required: true },
  category:   { type: String, required: true },
  questions:  { type: [questionSchema], required: true },
  createdBy:  { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);
