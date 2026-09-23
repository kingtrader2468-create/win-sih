const mongoose = require('mongoose');
const Mystery = require('../models/Mystery');
const UserProgress = require('../models/UserProgress');
const { awardEligibleBadges } = require('../services/progressService');

async function getScholarProgress(user) {
  if (!user) return null;
  return UserProgress.findOneAndUpdate(
    { user: user._id },
    { $setOnInsert: { user: user._id } },
    { new: true, upsert: true }
  );
}

async function resolveMystery(id) {
  let mystery = null;
  if (id && id !== 'default' && id !== 'undefined' && mongoose.isValidObjectId(id)) {
    mystery = await Mystery.findOne({
      $or: [{ _id: id }, { researchResource: id }]
    })
      .populate('researchResource')
      .populate({ path: 'clues.evidenceLink', populate: { path: 'finding', select: 'title' } })
      .lean();
  }

  if (!mystery) {
    // Graceful fallback to first available mystery so page never fails
    mystery = await Mystery.findOne()
      .populate('researchResource')
      .populate({ path: 'clues.evidenceLink', populate: { path: 'finding', select: 'title' } })
      .lean();
  }
  return mystery;
}

function publicMystery(mystery, progress) {
  const saved = progress?.savedMysteries?.some((item) => String(item) === String(mystery._id)) || false;
  const state = progress?.mysteryProgress?.find((item) => String(item.mystery) === String(mystery._id));
  return {
    ...mystery,
    clues: (mystery.clues || []).map(({ correctAnswer, ...clue }) => clue),
    progress: { saved, currentClue: state?.currentClue || 0, completed: state?.completed || false }
  };
}

async function listMysteries(request, response) {
  try {
    const mysteries = await Mystery.find()
      .populate('researchResource', 'title region year type')
      .lean();

    const progress = request.user ? await getScholarProgress(request.user) : null;
    const formatted = mysteries.map((m) => publicMystery(m, progress));
    return response.json({ mysteries: formatted, total: formatted.length });
  } catch (error) {
    console.error('Error listing mysteries:', error);
    return response.status(500).json({ error: { message: 'Failed to list mysteries.' } });
  }
}

async function getMystery(request, response) {
  const mystery = await resolveMystery(request.params.id);
  if (!mystery) return response.status(404).json({ error: { message: 'No optional mystery is available for this research resource.' } });

  const progress = request.user ? await getScholarProgress(request.user) : null;

  return response.json({
    mode: request.user ? 'authenticated-session' : 'guest-preview',
    isAuthenticated: Boolean(request.user),
    mystery: publicMystery(mystery, progress)
  });
}

async function saveMystery(request, response) {
  if (!request.user) {
    return response.status(401).json({ error: { message: 'Scholar authentication required. Please sign in.' } });
  }

  const [mystery, progress] = await Promise.all([
    resolveMystery(request.params.id),
    getScholarProgress(request.user)
  ]);
  if (!mystery) return response.status(404).json({ error: { message: 'Mystery not found.' } });

  const alreadySaved = progress.savedMysteries.some((item) => String(item) === String(mystery._id));
  progress.savedMysteries = alreadySaved
    ? progress.savedMysteries.filter((item) => String(item) !== String(mystery._id))
    : [...progress.savedMysteries, mystery._id];
  await progress.save();
  return response.json({ saved: !alreadySaved, message: !alreadySaved ? 'Mystery saved for later.' : 'Mystery removed from saved items.' });
}

async function submitAnswer(request, response) {
  if (!request.user) {
    return response.status(401).json({ error: { message: 'Scholar authentication required to investigate clues and submit deductions.' } });
  }

  const [mystery, progress] = await Promise.all([
    resolveMystery(request.params.id),
    getScholarProgress(request.user)
  ]);
  if (!mystery) return response.status(404).json({ error: { message: 'Mystery not found.' } });

  const clueIndex = Number(request.body.clueIndex) || 0;
  const clue = mystery.clues[clueIndex];
  if (!clue) return response.status(400).json({ error: { message: 'Clue not found.' } });

  const correct = request.body.answer === clue.correctAnswer;
  if (!correct) return response.json({ correct: false, message: 'Not enough evidence — inspect the source again.' });

  const nextClue = clueIndex + 1;
  const completed = nextClue >= mystery.clues.length;
  const state = progress.mysteryProgress.find((item) => String(item.mystery) === String(mystery._id));
  if (state) {
    state.currentClue = nextClue;
    state.completed = completed;
    state.updatedAt = new Date();
  } else {
    progress.mysteryProgress.push({ mystery: mystery._id, currentClue: nextClue, completed, updatedAt: new Date() });
  }

  if (completed && !progress.mysteriesSolved.some((item) => String(item) === String(mystery._id))) {
    progress.mysteriesSolved.push(mystery._id);
    progress.xp += 10;
  }

  const awardedBadges = await awardEligibleBadges(progress);
  await progress.save();
  return response.json({
    correct: true,
    completed,
    nextStep: completed ? 'result' : 'clue',
    currentClue: nextClue,
    message: 'Evidence Confirmed',
    xp: progress.xp,
    awardedBadges: awardedBadges.map((badge) => badge.name)
  });
}

async function getMysteryResult(request, response) {
  const [mystery, progress] = await Promise.all([
    resolveMystery(request.params.id),
    request.user ? getScholarProgress(request.user) : null
  ]);
  if (!mystery) return response.status(404).json({ error: { message: 'Mystery not found.' } });

  return response.json({
    completed: true,
    title: mystery.title,
    result: 'Evidence Confirmed — Prototype Demo Content. This result reflects a completed simulated evidence-tracing activity, not a verified scientific conclusion.',
    scientificExplanation: `Prototype Demo Content — Review ${mystery.researchResource?.title || 'the linked research source'} and its linked records before making any scientific interpretation.`,
    learningPoints: ['Trace claims to a linked evidence record.', 'Keep the original research resource authoritative.', 'Treat this simulated activity as a learning aid, not a scientific conclusion.'],
    evidenceUsed: (mystery.clues || []).map((clue) => ({ title: clue.title, findingId: clue.evidenceLink?.finding?._id || null })),
    researchResource: mystery.researchResource
  });
}

module.exports = { listMysteries, getMystery, saveMystery, submitAnswer, getMysteryResult };
