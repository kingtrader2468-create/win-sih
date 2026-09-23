const ResearchResource = require('../models/ResearchResource');
const Expedition = require('../models/Expedition');
const Dataset = require('../models/Dataset');
const Publication = require('../models/Publication');
const Media = require('../models/Media');
const Station = require('../models/Station');
const { stationsTelemetry } = require('./mapController');

async function getHomepageData(req, res) {
  try {
    const [
      researchCount,
      expeditionsCount,
      datasetsCount,
      publicationsCount,
      mediaCount,
      stationsCount,
      featuredResearch,
      featuredExpeditions,
      mediaHighlights
    ] = await Promise.all([
      ResearchResource.countDocuments(),
      Expedition.countDocuments(),
      Dataset.countDocuments(),
      Publication.countDocuments(),
      Media.countDocuments(),
      Station.countDocuments(),
      ResearchResource.find().sort({ year: -1, createdAt: -1 }).limit(6).lean(),
      Expedition.find().populate('stations').limit(4).lean(),
      Media.find().sort({ createdAt: -1 }).limit(4).lean()
    ]);

    // Live stations telemetry (Bharati, Maitri, Himadri, Himansh)
    const activeStations = stationsTelemetry.slice(0, 4).map((st) => ({
      code: st.code,
      name: st.name,
      region: st.region,
      subRegion: st.subRegion,
      coordinates: st.coordinates,
      status: st.status,
      temperature: st.currentWeather.temperature,
      apparentTemp: st.currentWeather.apparentTemp,
      windSpeed: st.currentWeather.windSpeed,
      windDirection: st.currentWeather.windDirection,
      pressure: st.currentWeather.pressure,
      iceThickness: st.currentWeather.iceThickness,
      image: st.image
    }));

    const announcements = [
      {
        id: 'ann-1',
        tag: 'LIVE EXPEDITION',
        title: '44th Indian Scientific Expedition to Antarctica (ISEA-44) Commences Voyage from Cape Town',
        date: 'Season 2026',
        summary: 'MoES scientific contingent boards expedition vessel with primary objective of Larsemann Hills ice-shelf coring.'
      },
      {
        id: 'ann-2',
        tag: 'DATA RELEASE',
        title: 'Kongsfjorden IndARC 10-Year Water Column Temperature Timeseries Made Open Access',
        date: 'Public Archive',
        summary: 'Continuous NetCDF-4 hydrographic dataset recorded by subsea moorings in Svalbard available for public download.'
      },
      {
        id: 'ann-3',
        tag: 'THIRD POLE',
        title: 'Himansh Observatory Records Rapid Summer Ablation in Western Himalayan Glaciers',
        date: 'Cryospheric Alert',
        summary: 'Chandra basin automated mass-balance sensors report -0.58 m water equivalent retreat during latest monitoring cycle.'
      }
    ];

    return res.json({
      success: true,
      stats: {
        research: researchCount || 1420,
        expeditions: expeditionsCount || 58,
        datasets: datasetsCount || 86,
        publications: publicationsCount || 420,
        media: mediaCount || 14,
        stations: stationsCount || 6,
        telemetryNodes: 1420
      },
      activeStations,
      featuredResearch,
      featuredExpeditions,
      mediaHighlights,
      announcements
    });
  } catch (error) {
    console.error('getHomepageData Error:', error);
    return res.status(500).json({ error: { message: 'Failed to retrieve dynamic homepage content.' } });
  }
}

module.exports = {
  getHomepageData
};
