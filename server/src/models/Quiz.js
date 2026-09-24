const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: String,
  researchResource: { type: mongoose.Schema.Types.ObjectId, ref: 'ResearchResource' },
  difficulty: { type: String, enum: ['easy', 'moderate', 'challenging', 'advanced', 'expert'], default: 'easy' },
  questions: [{ prompt: String, options: [String], answer: String, explanation: String }],
  status: { type: String, default: 'published' }
}, { timestamps: true });

module.exports = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);
