const Badge = require('../models/Badge');

const badgeRequirements = [
  ['Polar Explorer', 'researchExplored', 3],
  ['Research Detective', 'evidenceInvestigations', 3],
  ['Polar Mystery Solver', 'mysteriesSolved', 3],
  ['Knowledge Seeker', 'quizzesCompleted', 5],
  ['Science Communicator', 'outreachCreated', 3]
];

async function awardEligibleBadges(progress) {
  badgeRequirements.forEach(([, field]) => { if (!progress[field]) progress[field] = []; });
  const eligibleNames = badgeRequirements.filter(([, field, threshold]) => progress[field].length >= threshold).map(([name]) => name);
  if (!eligibleNames.length) return [];
  const eligibleBadges = await Badge.find({ name: { $in: eligibleNames } });
  const existing = new Set(progress.badges.map((badge) => String(badge)));
  const awarded = eligibleBadges.filter((badge) => !existing.has(String(badge._id)));
  if (awarded.length) progress.badges.push(...awarded.map((badge) => badge._id));
  return awarded;
}

module.exports = { awardEligibleBadges };
