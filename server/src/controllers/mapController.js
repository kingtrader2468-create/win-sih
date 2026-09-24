const Station = require('../models/Station');
const Expedition = require('../models/Expedition');
const ResearchResource = require('../models/ResearchResource');
const { fetchGlobalPolarStations } = require('../services/external/globalStationService');
const globalStationCatalog = require('../services/external/globalStationCatalog');
const { enrichStationsWithWeather } = require('../services/external/openWeatherService');
const { enrichStationsWithImages } = require('../services/external/stationImageService');

// Comprehensive scientific telemetry and metadata for Indian Polar Observatories
const stationsTelemetry = [
  {
    code: 'BHARATI',
    name: 'Bharati Station',
    region: 'Antarctica',
    subRegion: 'Larsemann Hills, East Antarctica',
    coordinates: { latitude: -69.407, longitude: 76.194 },
    elevation: '35m a.s.l.',
    established: 2012,
    status: 'Operational · Wintering',
    currentWeather: {
      temperature: -18.4,
      apparentTemp: -29.2,
      windSpeed: '42 km/h',
      windDirection: 'ESE (Katabatic)',
      pressure: '988 hPa',
      humidity: '68%',
      iceThickness: '2.4 m (Fast Ice)',
      solarRadiation: '112 W/m²'
    },
    instruments: [
      'Induction Coil Magnetometer',
      'Dual-frequency GPS/GNSS receiver',
      'Broadband Seismometer (GSI)',
      'Multi-wavelength Aerosol Radiometer',
      'Automatic Weather Station (AWS-NCPOR)'
    ],
    description: 'India third permanent research base. Built with 134 modular prefabricated containers on stilts to withstand blizzard winds up to 200 km/h with zero environmental footprint.',
    image: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80',
    telemetryHistory: [
      { time: '00:00', temp: -19.5, wind: 38, pressure: 989 },
      { time: '04:00', temp: -20.2, wind: 45, pressure: 988 },
      { time: '08:00', temp: -18.7, wind: 40, pressure: 988 },
      { time: '12:00', temp: -17.1, wind: 35, pressure: 987 },
      { time: '16:00', temp: -17.8, wind: 42, pressure: 987 },
      { time: '20:00', temp: -18.4, wind: 44, pressure: 988 }
    ]
  },
  {
    code: 'MAITRI',
    name: 'Maitri Station',
    region: 'Antarctica',
    subRegion: 'Schirmacher Oasis, Queen Maud Land',
    coordinates: { latitude: -70.766, longitude: 11.731 },
    elevation: '117m a.s.l.',
    established: 1989,
    status: 'Operational · Active',
    currentWeather: {
      temperature: -22.1,
      apparentTemp: -34.0,
      windSpeed: '51 km/h',
      windDirection: 'SE (Polar Plateau)',
      pressure: '974 hPa',
      humidity: '54%',
      iceThickness: '3.1 m (Continental Sheet)',
      solarRadiation: '98 W/m²'
    },
    instruments: [
      'Brewer Ozone Spectrophotometer (IMD)',
      'Fluxgate Magnetometer (IIG)',
      'Priyadarshini Lake Limnology Sonde',
      'Cosmic Ray Super Neutron Monitor',
      'Geodetic GPS Benchmark Station'
    ],
    description: 'India second permanent Antarctic research station situated on rocky ice-free oasis. Conducts multi-decadal geomagnetic, limnological, and atmospheric ozone column monitoring.',
    image: 'https://images.unsplash.com/photo-1548777123-e216912df7d8?auto=format&fit=crop&w=800&q=80',
    telemetryHistory: [
      { time: '00:00', temp: -23.4, wind: 48, pressure: 975 },
      { time: '04:00', temp: -24.1, wind: 54, pressure: 974 },
      { time: '08:00', temp: -22.8, wind: 52, pressure: 974 },
      { time: '12:00', temp: -20.5, wind: 46, pressure: 973 },
      { time: '16:00', temp: -21.4, wind: 49, pressure: 973 },
      { time: '20:00', temp: -22.1, wind: 51, pressure: 974 }
    ]
  },
  {
    code: 'DAKSHIN_GANGOTRI',
    name: 'Dakshin Gangotri',
    region: 'Antarctica',
    subRegion: 'Wohlthat Mountains Shelf',
    coordinates: { latitude: -70.092, longitude: 12.001 },
    elevation: '0m (Sub-ice shelf)',
    established: 1983,
    status: 'Historic Monument · Automated Telemetry',
    currentWeather: {
      temperature: -26.3,
      apparentTemp: -39.5,
      windSpeed: '58 km/h',
      windDirection: 'S',
      pressure: '971 hPa',
      humidity: '49%',
      iceThickness: '12.0 m (Buried under firn)',
      solarRadiation: '45 W/m²'
    },
    instruments: [
      'Autonomous Ice Core Strain Gauges',
      'Borehole Temperature Sensor Array',
      'Historic Heritage Telemetry Transponder'
    ],
    description: 'India first historic scientific base in Antarctica (1983-1990). Now designated an Antarctic Treaty Historic Site & Monument (HSM No. 44) with autonomous subsurface snow-compression sensors.',
    image: 'https://images.unsplash.com/photo-1483181957632-8bda974cbc91?auto=format&fit=crop&w=800&q=80',
    telemetryHistory: [
      { time: '00:00', temp: -27.1, wind: 55, pressure: 972 },
      { time: '04:00', temp: -28.0, wind: 60, pressure: 971 },
      { time: '08:00', temp: -26.9, wind: 58, pressure: 971 },
      { time: '12:00', temp: -25.2, wind: 52, pressure: 970 },
      { time: '16:00', temp: -25.8, wind: 56, pressure: 971 },
      { time: '20:00', temp: -26.3, wind: 58, pressure: 971 }
    ]
  },
  {
    code: 'HIMADRI',
    name: 'Himadri Station',
    region: 'Arctic',
    subRegion: 'Ny-Ålesund, Spitsbergen, Svalbard',
    coordinates: { latitude: 78.923, longitude: 11.928 },
    elevation: '12m a.s.l.',
    established: 2008,
    status: 'Operational · Active',
    currentWeather: {
      temperature: -6.8,
      apparentTemp: -14.2,
      windSpeed: '28 km/h',
      windDirection: 'NW (Fjord flow)',
      pressure: '1004 hPa',
      humidity: '82%',
      iceThickness: '0.8 m (Kongsfjorden Fjord Ice)',
      solarRadiation: '65 W/m²'
    },
    instruments: [
      'Aerosol Chemical Speciation Monitor (ACSM)',
      'Aethalometer AE-33 (Black Carbon)',
      'Micro Pulse Lidar (Atmospheric boundary layer)',
      'C-band Doppler Radar Transceiver',
      'Passive Cavity Aerosol Spectrometer'
    ],
    description: 'India premier Arctic scientific station situated at 79°N in the world northernmost permanent civilian research settlement. Specializes in Arctic amplification, atmospheric chemistry, and marine biology.',
    image: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80',
    telemetryHistory: [
      { time: '00:00', temp: -7.5, wind: 26, pressure: 1005 },
      { time: '04:00', temp: -8.1, wind: 30, pressure: 1004 },
      { time: '08:00', temp: -7.2, wind: 29, pressure: 1004 },
      { time: '12:00', temp: -5.9, wind: 24, pressure: 1003 },
      { time: '16:00', temp: -6.3, wind: 27, pressure: 1004 },
      { time: '20:00', temp: -6.8, wind: 28, pressure: 1004 }
    ]
  },
  {
    code: 'INDARC',
    name: 'IndARC Underwater Mooring',
    region: 'Arctic',
    subRegion: 'Kongsfjorden Fjord Waters, Svalbard',
    coordinates: { latitude: 79.012, longitude: 11.583 },
    elevation: '-192m (Subsea Mooring)',
    established: 2014,
    status: 'Operational · Oceanographic Subsea',
    currentWeather: {
      temperature: 1.8,
      apparentTemp: 1.8,
      windSpeed: '0 km/h (Underwater)',
      windDirection: 'N/A',
      pressure: '20.2 bar (Hydrostatic)',
      humidity: '100% Saline',
      iceThickness: 'Sea water column CTD',
      solarRadiation: '0 W/m² (Submerged)'
    },
    instruments: [
      'Seabird SBE 16plus CTD profiler',
      'Aanderaa Seaguard Acoustic Doppler Current Profiler',
      'Fluorometer (Chlorophyll-a & CDOM)',
      'Dissolved Oxygen Optode 4835',
      'MicroCAT Ocean Temperature Recorder'
    ],
    description: 'First Indian multi-sensor moored oceanographic observatory deployed at 192m depth in Kongsfjorden. Tracks Atlantic water inflows and Arctic polar water exchange.',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    telemetryHistory: [
      { time: '00:00', temp: 1.7, wind: 0, pressure: 1004 },
      { time: '04:00', temp: 1.7, wind: 0, pressure: 1004 },
      { time: '08:00', temp: 1.8, wind: 0, pressure: 1004 },
      { time: '12:00', temp: 1.9, wind: 0, pressure: 1003 },
      { time: '16:00', temp: 1.8, wind: 0, pressure: 1004 },
      { time: '20:00', temp: 1.8, wind: 0, pressure: 1004 }
    ]
  },
  {
    code: 'HIMANSH',
    name: 'Himansh Station',
    region: 'Himalaya',
    subRegion: 'Chandra Basin, Spiti Valley, Himachal Pradesh',
    coordinates: { latitude: 32.408, longitude: 77.618 },
    elevation: '4,080m a.s.l.',
    established: 2016,
    status: 'Operational · High Altitude',
    currentWeather: {
      temperature: -9.4,
      apparentTemp: -18.7,
      windSpeed: '32 km/h',
      windDirection: 'WSW (Alpine Valley)',
      pressure: '624 hPa',
      humidity: '38%',
      iceThickness: '45.0 m (Batal Glacier Core)',
      solarRadiation: '840 W/m² (High UV)'
    },
    instruments: [
      'Ground Penetrating Radar (GPR - 100MHz)',
      'Differential GPS Ice Motion Tracker',
      'Automated Weather Station (AWS with snow depth)',
      'Water Isotope Analyser (Picarro Cavity Ring-Down)',
      'Turbulence Flux Tower'
    ],
    description: 'High-altitude research observatory situated in the Chandra basin, Western Himalayas. Houses advanced instruments for glacier mass balance, hydrological discharge, and permafrost dynamics.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    telemetryHistory: [
      { time: '00:00', temp: -11.2, wind: 28, pressure: 625 },
      { time: '04:00', temp: -12.5, wind: 34, pressure: 624 },
      { time: '08:00', temp: -10.1, wind: 30, pressure: 624 },
      { time: '12:00', temp: -6.8, wind: 26, pressure: 623 },
      { time: '16:00', temp: -8.0, wind: 31, pressure: 623 },
      { time: '20:00', temp: -9.4, wind: 32, pressure: 624 }
    ]
  }
];

// Environmental data layers with telemetry metrics
const mapLayers = {
  climate: {
    id: 'climate',
    name: 'Climate & Telemetry',
    summary: 'Decadal trends, katabatic wind corridors, and temperature anomaly indices across all polar zones.',
    globalMetrics: {
      antarcticAnomaly: '+1.42°C above 1981–2010 mean',
      arcticAnomaly: '+3.15°C (Arctic Amplification)',
      himalayanMassBalance: '-0.52 m w.e. / year',
      co2Concentration: '421.8 ppm (Maitri Background Observatory)'
    },
    zones: [
      { name: 'Larsemann Hills Oasis', lat: -69.4, lng: 76.2, value: 'Mean Annual: -9.8°C', status: 'Stable' },
      { name: 'Schirmacher Continental Rim', lat: -70.7, lng: 11.7, value: 'Katabatic Velocity: 52 km/h', status: 'Alert' },
      { name: 'Kongsfjorden Fjord', lat: 78.9, lng: 11.9, value: 'Winter Warming: +2.1°C/decade', status: 'Warming' },
      { name: 'Chandra Glacier Basin', lat: 32.4, lng: 77.6, value: 'Albedo: 0.62', status: 'Active Retreat' }
    ]
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean & Sea Surface',
    summary: 'Southern Ocean overturning circulation, Kongsfjorden CTD salinity profiles, and IndARC deep currents.',
    globalMetrics: {
      surfaceSalinity: '34.2 PSU (Southern Ocean)',
      subseaCurrentVelocity: '0.14 m/s (Kongsfjorden IndARC depth)',
      oceanPh: '8.02 (Polar acidification index)',
      seaSurfaceTemp: '-1.2°C (Prydz Bay offshore)'
    },
    zones: [
      { name: 'Prydz Bay Continental Shelf', lat: -68.8, lng: 75.0, value: 'Salinity: 34.18 PSU', depth: '480m' },
      { name: 'IndARC Hydrographic Array', lat: 79.0, lng: 11.6, value: 'Atlantic Inflow: 3.4 Sv', depth: '192m' },
      { name: 'Astrid Coast Polynyas', lat: -69.8, lng: 12.5, value: 'Heat Flux: 180 W/m²', depth: 'Surface' }
    ]
  },
  ice: {
    id: 'ice',
    name: 'Ice Sheets & Cryosphere',
    summary: 'Antarctic ice sheet flow velocities, Arctic sea ice extent, and Himalayan glacier calving rates.',
    globalMetrics: {
      antarcticSeaIceExtent: '14.8 million km²',
      arcticMinimumExtent: '4.23 million km²',
      ameryIceShelfVelocity: '1,200 m / year at front',
      chhotaShigriGlacierBalance: '-0.68 m w.e. (2024)'
    },
    zones: [
      { name: 'Amery Ice Shelf Calving Front', lat: -68.5, lng: 73.5, value: 'Thickness: 280m', type: 'Floating Shelf' },
      { name: 'Chhota Shigri Glacier', lat: 32.2, lng: 77.5, value: 'Terminus Retreat: 18m/yr', type: 'Valley Glacier' },
      { name: 'Kongsfjorden Tidewater Glaciers', lat: 79.0, lng: 12.2, value: 'Calving Flux: 0.12 km³/yr', type: 'Tidewater' }
    ]
  },
  temperature: {
    id: 'temperature',
    name: 'Temperature & Heat Isotherms',
    summary: 'Thermal contours, boundary layer lapse rates, and real-time station thermocouple telemetry.',
    globalMetrics: {
      lowestStationTemp: '-26.3°C (Dakshin Gangotri)',
      highestStationTemp: '+1.8°C (IndARC Subsea)',
      himalayanFreezingLevel: '4,450m AMSL',
      inversionStrength: '+8.2°C / 500m (Antarctic Plateau)'
    },
    zones: [
      { name: 'Queen Maud Land Plateau', lat: -71.5, lng: 10.5, value: '-32.4°C' },
      { name: 'Larsemann Hills Coastal', lat: -69.4, lng: 76.2, value: '-18.4°C' },
      { name: 'Ny-Ålesund Fjord Basin', lat: 78.9, lng: 11.9, value: '-6.8°C' },
      { name: 'Spiti Batal Valley', lat: 32.4, lng: 77.6, value: '-9.4°C' }
    ]
  },
  atmosphere: {
    id: 'atmosphere',
    name: 'Atmosphere & Ozone Column',
    summary: 'Stratospheric ozone depletion dynamics, Brewer spectrophotometer scans, and aerosol optical depth.',
    globalMetrics: {
      totalColumnOzone: '182 Dobson Units (Maitri Brewer Station)',
      polarVortexWindSpeed: '220 km/h (Stratospheric Jet)',
      blackCarbonMass: '24.5 ng/m³ (Himadri ACSM)',
      aerosolOpticalDepth: '0.042 (Clean Polar Atmosphere)'
    },
    zones: [
      { name: 'Maitri Stratospheric Column', lat: -70.8, lng: 11.7, value: 'Ozone: 182 DU', sensor: 'Brewer Spectrometer' },
      { name: 'Ny-Ålesund Zeppelin Observatory', lat: 78.9, lng: 11.9, value: 'CO2: 422.4 ppm', sensor: 'Picarro CRDS' },
      { name: 'Himansh Radiation Tower', lat: 32.4, lng: 77.6, value: 'UV Index: 9.8 (High)', sensor: 'Pyranometer' }
    ]
  }
};

// Research Projects and Expeditions linked to polar points
const mapProjects = [
  {
    id: 'proj-isea43',
    title: '43rd Indian Scientific Expedition to Antarctica (ISEA-43)',
    region: 'Antarctica',
    code: 'ISEA-43',
    station: 'Bharati & Maitri',
    coordinates: { latitude: -69.407, longitude: 76.194 },
    discipline: 'Glaciology & Geophysics',
    pi: 'Dr. Yogesh Ray (NCPOR)',
    participants: 48,
    status: 'Field Season Complete',
    summary: 'Sub-ice shelf bedrock coring, geomagnetic storm telemetry, and microbiological cryo-preservation studies.'
  },
  {
    id: 'proj-arctic-winter',
    title: 'Maiden Indian Arctic Winter Expedition',
    region: 'Arctic',
    code: 'ARC-WIN-2024',
    station: 'Himadri Station',
    coordinates: { latitude: 78.923, longitude: 11.928 },
    discipline: 'Atmospheric Physics',
    pi: 'Dr. K. P. Krishnan (NCPOR)',
    participants: 12,
    status: 'Historical Milestone Complete',
    summary: 'First ever year-round wintering mission by Indian scientists in Svalbard through polar night darkness.'
  },
  {
    id: 'proj-indarc-mooring',
    title: 'Kongsfjorden Decade Long IndARC Observational Timeseries',
    region: 'Arctic',
    code: 'INDARC-DECADE',
    station: 'IndARC Underwater Mooring',
    coordinates: { latitude: 79.012, longitude: 11.583 },
    discipline: 'Physical Oceanography',
    pi: 'Himadri Oceanographic Team',
    participants: 8,
    status: 'Autonomous Continuous Recording',
    summary: 'Continuous 10-year timeseries of fjord temperature, salinity, currents, and nutrient influxes.'
  },
  {
    id: 'proj-himansh-chandra',
    title: 'Himalayan Cryospheric Glacier Mass Balance (Himansh Campaign)',
    region: 'Himalaya',
    code: 'HIM-CHANDRA-2024',
    station: 'Himansh Station',
    coordinates: { latitude: 32.408, longitude: 77.618 },
    discipline: 'Glacial Hydrology',
    pi: 'Dr. Parmanand Sharma (NCPOR)',
    participants: 16,
    status: 'Active Monitoring',
    summary: 'Drone photogrammetry, ice depth profiling via GPR, and discharge gauging of Sutlej and Chandra rivers.'
  }
];

async function getMapStations(req, res) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    let globalStations = [];
    try {
      globalStations = await fetchGlobalPolarStations({ signal: controller.signal });
    } catch (error) {
      console.warn('Global station catalogue unavailable; returning verified local records:', error.message);
    } finally {
      clearTimeout(timeout);
    }

    const stationMap = new Map(globalStationCatalog.map((station) => [station.code, station]));
    stationsTelemetry.forEach((station) => stationMap.set(station.code, {
      ...station,
      source: 'Polar India Hub / NCPOR station metadata',
      sourceUrl: 'https://ncpor.res.in/',
      verificationStatus: 'Curated station metadata; live observations vary by station'
    }));
    globalStations.forEach((station) => {
      if (!stationMap.has(station.code)) stationMap.set(station.code, station);
    });
    const stationsWithWeather = await enrichStationsWithWeather([...stationMap.values()]);
    const stations = await enrichStationsWithImages(stationsWithWeather);

    return res.json({
      success: true,
      count: stations.length,
      source: 'OpenStreetMap research-station catalogue plus Polar India Hub station metadata',
      weatherSource: 'Open-Meteo',
      lastUpdated: new Date().toISOString(),
      stations
    });
  } catch (error) {
    console.error('getMapStations Error:', error);
    return res.status(500).json({ error: { message: 'Failed to retrieve polar station coordinates.' } });
  }
}

function getMapConfig(req, res) {
  const key = process.env.MAPTILER_API_KEY;
  return res.json({
    provider: key ? 'maptiler' : 'carto',
    styleUrl: key ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${encodeURIComponent(key)}` : '',
    tileUrl: key ? `https://api.maptiler.com/maps/voyager/{z}/{x}/{y}.png?key=${encodeURIComponent(key)}` : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    darkTileUrl: key ? `https://api.maptiler.com/maps/darkmatter/{z}/{x}/{y}.png?key=${encodeURIComponent(key)}` : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: key ? '&copy; MapTiler &copy; OpenStreetMap contributors' : '&copy; OpenStreetMap contributors &copy; CARTO'
  });
}

async function getMapLayers(req, res) {
  try {
    const { layer } = req.query;
    if (layer && mapLayers[layer]) {
      return res.json({ success: true, layer: mapLayers[layer] });
    }
    return res.json({
      success: true,
      layers: mapLayers
    });
  } catch (error) {
    console.error('getMapLayers Error:', error);
    return res.status(500).json({ error: { message: 'Failed to retrieve environmental data layers.' } });
  }
}

async function getMapProjects(req, res) {
  try {
    const { region } = req.query;
    let list = mapProjects;
    if (region && region !== 'All') {
      list = list.filter((p) => p.region.toLowerCase() === region.toLowerCase());
    }
    return res.json({
      success: true,
      count: list.length,
      projects: list
    });
  } catch (error) {
    console.error('getMapProjects Error:', error);
    return res.status(500).json({ error: { message: 'Failed to retrieve polar field projects.' } });
  }
}

async function getStationByCode(req, res) {
  try {
    const { code } = req.params;
    const station = stationsTelemetry.find((s) => s.code.toUpperCase() === code.toUpperCase());
    if (!station) {
      return res.status(404).json({ error: { message: 'Polar research station not found.' } });
    }
    return res.json({ success: true, station });
  } catch (error) {
    console.error('getStationByCode Error:', error);
    return res.status(500).json({ error: { message: 'Failed to retrieve station details.' } });
  }
}

module.exports = {
  getMapStations,
  getMapConfig,
  getMapLayers,
  getMapProjects,
  getStationByCode,
  stationsTelemetry,
  mapLayers,
  mapProjects
};
