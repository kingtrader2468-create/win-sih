const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const Badge = require('../models/Badge');

async function getProgress(request, response) {
  const user = await User.findOne({ email: 'demo@polar-india-hub.local' });
  if (!user) return response.status(404).json({ error: { message: 'Demo student session is unavailable.' } });
  const progress = await UserProgress.findOne({ user: user._id })
    .populate('badges')
    .populate({ path: 'savedMysteries', select: 'title difficulty estimatedTime researchResource', populate: { path: 'researchResource', select: 'title' } })
    .populate({ path: 'recentResearch.resource', select: 'title type description region year' })
    .populate('mysteriesSolved', 'title difficulty updatedAt')
    .populate('quizzesCompleted.quiz', 'title')
    .populate('outreachCreated', 'title format createdAt')
    .lean();
  const thresholds = await Badge.find().select('name description criteria').lean();
  return response.json({ mode: 'demo-student-session', progress: progress || { xp: 0, researchExplored: [], evidenceInvestigations: [], mysteriesSolved: [], quizzesCompleted: [], outreachCreated: [], badges: [], savedMysteries: [], recentResearch: [] }, thresholds });
}

module.exports = { getProgress };
