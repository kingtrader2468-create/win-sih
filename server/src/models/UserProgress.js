const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  researchExplored: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ResearchResource' }],
  evidenceInvestigations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Finding' }],
  mysteriesSolved: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mystery' }],
  quizzesCompleted: [{ quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }, completedAt: Date, score: Number }],
  outreachCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OutreachContent' }],
  xp: { type: Number, default: 0, min: 0 },
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
  savedMysteries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mystery' }],
  mysteryProgress: [{ mystery: { type: mongoose.Schema.Types.ObjectId, ref: 'Mystery' }, currentClue: { type: Number, default: 0 }, completed: { type: Boolean, default: false }, updatedAt: Date }],
  recentResearch: [{ resource: { type: mongoose.Schema.Types.ObjectId, ref: 'ResearchResource' }, viewedAt: Date }]
}, { timestamps: true });

module.exports = mongoose.models.UserProgress || mongoose.model('UserProgress', userProgressSchema);
