const ResearchResource = require('../models/ResearchResource');
const Expedition = require('../models/Expedition');
const Dataset = require('../models/Dataset');
const Publication = require('../models/Publication');
const Media = require('../models/Media');
const Mystery = require('../models/Mystery');
const Station = require('../models/Station');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');

async function getDashboard(request, response) {
  try {
    let user = request.user;
    if (!user) {
      user = await User.findOne({ email: 'demo@polar-india-hub.local' }) || await User.findOne();
    }

    const progress = user ? await UserProgress.findOne({ user: user._id })
      .populate('badges')
      .populate({ path: 'savedMysteries', select: 'title difficulty estimatedTime researchResource', populate: { path: 'researchResource', select: 'title' } })
      .populate({ path: 'recentResearch.resource', select: 'title type description region year' })
      .lean() : null;

    const [
      featuredResearch,
      recentResearchItems,
      featuredExpeditions,
      unlockedMysteries,
      expeditionsCount,
      datasetsCount,
      publicationsCount,
      mediaCount,
      researchCount,
      mysteriesCount,
      stationsCount
    ] = await Promise.all([
      ResearchResource.find().sort({ year: -1, createdAt: -1 }).limit(6).lean(),
      ResearchResource.find().sort({ createdAt: -1 }).limit(4).lean(),
      Expedition.find().populate('stations').limit(4).lean(),
      Mystery.find().populate('researchResource', 'title region year type').limit(3).lean(),
      Expedition.countDocuments(),
      Dataset.countDocuments(),
      Publication.countDocuments(),
      Media.countDocuments(),
      ResearchResource.countDocuments(),
      Mystery.countDocuments(),
      Station.countDocuments()
    ]);

    const continueJourney = progress?.recentResearch?.[0]?.resource || featuredResearch[0] || null;

    const progressSummary = {
      xp: progress?.xp || 420,
      researchExploredCount: progress?.researchExplored?.length || 14,
      evidenceInvestigationsCount: progress?.evidenceInvestigations?.length || 6,
      mysteriesSolvedCount: progress?.mysteriesSolved?.length || 2,
      quizzesCompletedCount: progress?.quizzesCompleted?.length || 5,
      badgesCount: progress?.badges?.length || 3
    };

    return response.json({
      counts: {
        research: researchCount,
        expeditions: expeditionsCount,
        datasets: datasetsCount,
        publications: publicationsCount,
        media: mediaCount,
        mysteries: mysteriesCount,
        stations: stationsCount
      },
      featuredResearch,
      researchRecommendations: featuredResearch,
      recentResearch: recentResearchItems,
      recentResearchItems,
      continueJourney,
      featuredExpeditions,
      unlockedMysteries,
      progressSummary,
      userProgress: progress
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return response.status(500).json({ error: { message: 'Failed to load dashboard data.' } });
  }
}

module.exports = { getDashboard };
