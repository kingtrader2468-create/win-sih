const mongoose = require('mongoose');

const ids = Object.fromEntries(
  'user,stationA,stationB,stationC,stationD,expeditionA,expeditionB,expeditionC,datasetA,datasetB,datasetC,observationA,observationB,publicationA,publicationB,publicationC,publicationD,publicationE,mediaA,mediaB,mediaC,mediaD,mediaE,mediaF,paperA,paperB,paperC,paperD,paperE,reportA,reportB,reportC,findingA,findingB,findingC,evidenceA,evidenceB,mysteryA,mysteryB,quizA,quizB,badgeA,badgeB,badgeC,badgeD,badgeE,outreachA,progressA'.split(',').map((key, index) => [key, new mongoose.Types.ObjectId((index + 1).toString(16).padStart(24, '0'))])
);

const demoData = {
  User: [
    {
      _id: ids.user,
      name: 'Dr. Aarav Sharma',
      email: 'demo@polar-india-hub.local',
      role: 'student',
      registryId: 'POL-2026-8842',
      institution: 'Gossner College Ranchi / NCPOR Research Scholar'
    }
  ],
  Station: [
    {
      _id: ids.stationA,
      name: 'Bharati Station',
      code: 'BHARATI',
      region: 'Antarctica',
      coordinates: { latitude: -69.407, longitude: 76.194 },
      description: 'India third permanent Antarctic research station located in Larsemann Hills, East Antarctica. Specializes in oceanography, continental drift, and cryospheric telemetry.',
      status: 'active'
    },
    {
      _id: ids.stationB,
      name: 'Himadri Station',
      code: 'HIMADRI',
      region: 'Arctic',
      coordinates: { latitude: 78.923, longitude: 11.928 },
      description: 'India sovereign Arctic research station located at Ny-Ålesund, Spitsbergen, Svalbard. Houses multi-year atmospheric chemistry sensors and fjord CTD telemetry.',
      status: 'active'
    },
    {
      _id: ids.stationC,
      name: 'Himansh Station',
      code: 'HIMANSH',
      region: 'Himalaya',
      coordinates: { latitude: 32.408, longitude: 77.618 },
      description: 'High-altitude research facility situated at 4,080m a.s.l. in Chandra Basin, Spiti Valley, Himachal Pradesh. Dedicated to Himalayan glacier mass balance and hydrological isotopes.',
      status: 'active'
    },
    {
      _id: ids.stationD,
      name: 'Maitri Station',
      code: 'MAITRI',
      region: 'Antarctica',
      coordinates: { latitude: -70.766, longitude: 11.731 },
      description: 'India second permanent Antarctic research base established in Schirmacher Oasis, Queen Maud Land. Conducts limnological, geomagnetic, and meteorological monitoring.',
      status: 'active'
    }
  ],
  Expedition: [
    {
      _id: ids.expeditionA,
      title: '43rd Indian Scientific Expedition to Antarctica (ISEA-43)',
      code: 'ISEA-43',
      region: 'Antarctica',
      description: 'Annual sovereign expedition targeting ice shelf stability, sub-ice thermohaline circulation, and biological sampling across Prydz Bay and Larsemann Hills.',
      status: 'completed',
      stations: [ids.stationA, ids.stationD]
    },
    {
      _id: ids.expeditionB,
      title: 'Indian Arctic Winter Expedition & IndARC Mooring Campaign',
      code: 'INDARC-24',
      region: 'Arctic',
      description: 'Winter-long hydrographic and meteorological observation deployment in Kongsfjorden, capturing Atlantic Water heat transport into polar waters.',
      status: 'completed',
      stations: [ids.stationB]
    },
    {
      _id: ids.expeditionC,
      title: 'MoES Himalayan Cryosphere & Chandra Basin Campaign',
      code: 'HIMANSH-CHANDRA',
      region: 'Himalaya',
      description: 'Field mass balance stake measurements, snowpit isotopic profiling, and automated weather station telemetry across Chhota Shigri and Batal glaciers.',
      status: 'completed',
      stations: [ids.stationC]
    }
  ],
  Dataset: [
    {
      _id: ids.datasetA,
      title: 'Larsemann Hills Fast-Ice Cryospheric Profiling & CTD Casts',
      description: 'High-precision CTD profiles, ice thickness gauges, and sub-ice temperature telemetry recorded around Bharati Station in Prydz Bay. CF-1.8 compliant NetCDF-4.',
      region: 'Antarctica',
      researchArea: 'Cryosphere',
      variables: ['ice_thickness', 'sea_water_practical_salinity', 'sea_water_conservative_temperature', 'mCDW_heat_flux'],
      expedition: ids.expeditionA,
      station: ids.stationA,
      status: 'published',
      dataFormat: 'NetCDF-4 (.nc)',
      cfConvention: 'CF Metadata Conventions 1.8',
      spatialProjection: 'WGS 84 / Antarctic Polar Stereographic (EPSG:3031)',
      calibrationStandard: 'TEOS-10 Pressure Calibrated',
      doi: '10.21044/NCPOR.2026.BHARATI.01'
    },
    {
      _id: ids.datasetB,
      title: 'Kongsfjorden IndARC Mooring Multi-Depth Oceanographic Time-Series',
      description: 'Subsurface moored telemetry tracking Atlantic Water intrusion at 120m to 200m depth in Kongsfjorden. Compliant with TEOS-10 and CF Conventions.',
      region: 'Arctic',
      researchArea: 'Oceanography',
      variables: ['temperature', 'salinity', 'acoustic_backscatter', 'dissolved_oxygen'],
      expedition: ids.expeditionB,
      station: ids.stationB,
      status: 'published',
      dataFormat: 'NetCDF-4 (.nc)',
      cfConvention: 'CF Metadata Conventions 1.8',
      spatialProjection: 'WGS 84 / Arctic Polar Stereographic (EPSG:3995)',
      calibrationStandard: 'TEOS-10 Pressure Calibrated',
      doi: '10.21044/NCPOR.2026.INDARC.02'
    },
    {
      _id: ids.datasetC,
      title: 'Chhota Shigri Glacier Mass Balance & Isotopic Snow Stratigraphy',
      description: 'Annual glaciological stake readings, snow accumulation densities, and delta 18-O / delta-D isotopic ratios from Chandra Basin pits at 4,800m elevation.',
      region: 'Himalaya',
      researchArea: 'Glaciology',
      variables: ['stake_mass_balance', 'delta_18_O', 'deuterium_excess', 'snow_density'],
      expedition: ids.expeditionC,
      station: ids.stationC,
      status: 'published',
      dataFormat: 'NetCDF-4 (.nc)',
      cfConvention: 'CF Metadata Conventions 1.8',
      spatialProjection: 'WGS 84 / UTM zone 43N (EPSG:32643)',
      calibrationStandard: 'VSMOW2-SLAP2 Isotopic Standard',
      doi: '10.21044/NCPOR.2026.HIMANSH.03'
    }
  ],
  Observation: [
    {
      _id: ids.observationA,
      title: 'Prydz Bay Deep Thermohaline Inversion',
      description: 'CTD Cast #04-PRYDZ records an episodic pulse of modified Circumpolar Deep Water (mCDW) at 380m depth with potential temperature +0.48°C above freezing point.',
      dataset: ids.datasetA,
      expedition: ids.expeditionA,
      station: ids.stationA
    },
    {
      _id: ids.observationB,
      title: 'IndARC Winter Atlantic Water Advection Pulse',
      description: 'Subsurface CTD sensors record warm (>2.1°C), saline (>34.9 PSU) water entering the fjord interior, impeding surface sea-ice formation despite -25°C air temps.',
      dataset: ids.datasetB,
      expedition: ids.expeditionB,
      station: ids.stationB
    }
  ],
  Publication: [
    {
      _id: ids.publicationA,
      title: 'Cryospheric Mass Balance and Ice-Shelf Basal Melt Dynamics in Prydz Bay',
      authors: ['Dr. R. Sengupta (NCPOR)', 'Dr. M. Ravichandran (MoES)', 'Polar Science Team'],
      year: 2026,
      abstract: 'Investigation of oceanic heat transport under the Amery Ice Shelf and Larsemann Hills fast-ice using TEOS-10 calibrated CTD profiles and mooring arrays.',
      doi: '10.21044/NCPOR.2026.ISEA43.01',
      journal: 'Polar Science Journal',
      researchResource: ids.paperA
    },
    {
      _id: ids.publicationB,
      title: 'Hydrographic Structure and Multi-Year Water Mass Transformation in Kongsfjorden',
      authors: ['Dr. K. P. Krishnan (NCPOR)', 'Arctic Research Group'],
      year: 2026,
      abstract: 'Analysis of continuous winter oceanographic moorings at IndARC station, establishing linkages between West Spitsbergen Current dynamics and fjord sea-ice loss.',
      doi: '10.21044/NCPOR.2026.INDARC.02',
      journal: 'Journal of Geophysical Research: Oceans',
      researchResource: ids.paperB
    },
    {
      _id: ids.publicationC,
      title: 'Isotopic Depletion and Meltwater Hydrograph Separation in Chandra Basin, Western Himalaya',
      authors: ['Dr. P. Sharma (NCPOR)', 'Himalayan Glaciology Division'],
      year: 2026,
      abstract: 'High-altitude snowpit isotopic stratigraphy (delta 18-O and d-excess) coupled with stake mass balance observations on Chhota Shigri glacier.',
      doi: '10.21044/NCPOR.2026.HIMANSH.03',
      journal: 'Cryosphere Discussions',
      researchResource: ids.paperC
    },
    {
      _id: ids.publicationD,
      title: 'Indian Antarctic Act 2022: Framework for Sovereign Environmental Governance',
      authors: ['MoES Legal & Policy Directorate', 'NCPOR Secretariat'],
      year: 2026,
      abstract: 'Comprehensive policy brief on the statutory implementation of environmental protocols, waste management, and open scientific data sovereignty under the Indian Antarctic Act.',
      doi: '10.21044/MoES.2026.IAA.04',
      journal: 'Indian Journal of Polar Law & Governance',
      researchResource: ids.paperD
    },
    {
      _id: ids.publicationE,
      title: 'Science Communication Protocols for Polar Research: Sensationalism Mitigation',
      authors: ['NCPOR Science Dissemination Division', 'Gossner College Collaboration Team'],
      year: 2026,
      abstract: 'Methodological framework for translating complex cryospheric NetCDF-4 telemetry and peer-reviewed monographs into zero-sensationalism educational media.',
      doi: '10.21044/NCPOR.2026.OUTREACH.05',
      journal: 'Journal of Science Dissemination & Outreach',
      researchResource: ids.paperE
    }
  ],
  Media: [
    { _id: ids.mediaA, title: 'Bharati Station Telemetry Operations', type: 'image', description: 'Deployment of in-situ oceanographic CTD mooring near Larsemann Hills, East Antarctica.', credit: 'MoES / NCPOR ISEA-43', expedition: ids.expeditionA },
    { _id: ids.mediaB, title: 'IndARC Arctic Mooring Recovery in Kongsfjorden', type: 'video', description: 'Deep-water acoustic release recovery of the IndARC physical oceanography sensor string.', credit: 'NCPOR Arctic Division', expedition: ids.expeditionB },
    { _id: ids.mediaC, title: 'Himansh Station Glaciology Pit Sampling', type: 'image', description: 'Dr. Sharma conducting snowpack density and delta 18-O sampling on Chhota Shigri glacier.', credit: 'NCPOR Cryosphere Division', expedition: ids.expeditionC },
    { _id: ids.mediaD, title: 'Maitri Station Geomagnetic Observatory', type: 'image', description: 'Quiet-zone geomagnetic sensor array in Schirmacher Oasis.', credit: 'MoES Maitri Station Team', expedition: ids.expeditionA },
    { _id: ids.mediaE, title: 'Polar Triad Interactive Spatial Map', type: 'image', description: 'Tri-polar operational footprint spanning Antarctica, Arctic, and Third Pole.', credit: 'Polar India Hub Cartography' },
    { _id: ids.mediaF, title: 'Cryospheric Provenance Network Schematic', type: 'image', description: 'DAG lineage diagram tracing published findings to sensor CTD casts.', credit: 'NCPOR Informatics Team' }
  ],
  ResearchResource: [
    {
      _id: ids.paperA,
      title: 'Prydz Bay Basal Melt Dynamics & Fast-Ice Telemetry',
      type: 'research-paper',
      description: 'Field observation and NetCDF-4 CTD profiling of modified Circumpolar Deep Water (mCDW) thermal intrusion beneath the fast-ice in Larsemann Hills.',
      year: 2026,
      region: 'Antarctica',
      researchArea: 'Cryosphere',
      source: 'MoES / NCPOR Bharati Station',
      sourceOrganization: 'National Centre for Polar and Ocean Research',
      documentType: 'Peer-Reviewed Research Paper',
      verificationStatus: 'verified',
      citation: 'Sengupta, R. et al. (2026). Polar Science Journal, 14(2), 112-128. DOI: 10.21044/NCPOR.2026.ISEA43.01',
      contentText: 'Authoritative Field Record: Long-term observation records at Bharati Station (Larsemann Hills) demonstrate periodic thermal pulses of modified Circumpolar Deep Water (mCDW) entering the sub-ice cavity. In-situ CTD profiles calibrated under TEOS-10 standards confirm thermohaline anomalies driving localized basal thinning rates of 1.4 m/a. Data complies with the Indian Antarctic Act (2022) and CF Metadata Conventions 1.8.',
      authors: ['Dr. R. Sengupta', 'Dr. M. Ravichandran'],
      relatedExpedition: ids.expeditionA,
      relatedDatasets: [ids.datasetA],
      relatedPublications: [ids.publicationA],
      relatedMedia: [ids.mediaA],
      status: 'published'
    },
    {
      _id: ids.paperB,
      title: 'Kongsfjorden High-Latitude Mooring & Atlantic Water Influx',
      type: 'research-paper',
      description: 'Continuous winter oceanographic mooring telemetry (IndARC) revealing subsurface thermal pulsing that suppresses surface sea-ice formation.',
      year: 2026,
      region: 'Arctic',
      researchArea: 'Oceanography',
      source: 'MoES / NCPOR Himadri Station',
      sourceOrganization: 'National Centre for Polar and Ocean Research',
      documentType: 'Peer-Reviewed Research Paper',
      verificationStatus: 'verified',
      citation: 'Krishnan, K. P. et al. (2026). J. Geophys. Res. Oceans, 131(4), e2025JC0221. DOI: 10.21044/NCPOR.2026.INDARC.02',
      contentText: 'Authoritative Mooring Analysis: The IndARC mooring deployed in Kongsfjorden (78°55\'N) provides uninterrupted hydrographic time series across polar winter seasons. Telemetry reveals accelerated pulses of warm, saline Atlantic Water (AW) transiting the Fram Strait into the fjord interior, suppressing surface sea-ice formation. Pressure and salinity calibrated to TEOS-10 standards.',
      authors: ['Dr. K. P. Krishnan', 'Arctic Research Team'],
      relatedExpedition: ids.expeditionB,
      relatedDatasets: [ids.datasetB],
      relatedPublications: [ids.publicationB],
      relatedMedia: [ids.mediaB],
      status: 'published'
    },
    {
      _id: ids.paperC,
      title: 'Chandra Basin Glacier Mass Balance & Isotopic Snow Chemistry',
      type: 'research-paper',
      description: 'High-altitude stake mass balance and delta 18-O / d-excess isotopic tracking from Himansh Station on Chhota Shigri glacier, Western Himalaya.',
      year: 2026,
      region: 'Himalaya',
      researchArea: 'Glaciology',
      source: 'MoES / NCPOR Himansh Station',
      sourceOrganization: 'National Centre for Polar and Ocean Research',
      documentType: 'Peer-Reviewed Research Paper',
      verificationStatus: 'verified',
      citation: 'Sharma, P. et al. (2026). The Cryosphere Discussions, 19, 441-458. DOI: 10.21044/NCPOR.2026.HIMANSH.03',
      contentText: 'High-Altitude Field Measurement: Research conducted from Himansh Station (4,080m a.s.l., Spiti Valley) tracking mass balance stakes on Chhota Shigri glacier. Stable isotope analysis of delta 18-O and d-excess from pit stratigraphy distinguishes summer monsoon vs western disturbance accumulation regimes.',
      authors: ['Dr. P. Sharma', 'Glaciology Team'],
      relatedExpedition: ids.expeditionC,
      relatedDatasets: [ids.datasetC],
      relatedPublications: [ids.publicationC],
      relatedMedia: [ids.mediaC],
      status: 'published'
    },
    {
      _id: ids.paperD,
      title: 'Indian Antarctic Environmental Governance & Sovereign Scientific Compliance',
      type: 'report',
      description: 'Institutional analysis of statutory compliance under the Indian Antarctic Act (2022) across Bharati and Maitri operations.',
      year: 2026,
      region: 'Antarctica',
      researchArea: 'Environmental Policy',
      source: 'Ministry of Earth Sciences (MoES)',
      sourceOrganization: 'Ministry of Earth Sciences',
      documentType: 'Institutional Policy Report',
      verificationStatus: 'verified',
      citation: 'MoES Directorate (2026). Sovereign Polar Compliance Review, MoES-POL-2026-04.',
      contentText: 'Statutory Governance Report: Details compliance protocols established under the Indian Antarctic Act 2022, governing waste management, permit-based specimen collection, and open NetCDF-4 dissemination standards.',
      authors: ['MoES Polar Policy Division'],
      relatedExpedition: ids.expeditionA,
      relatedDatasets: [ids.datasetA],
      relatedPublications: [ids.publicationD],
      relatedMedia: [ids.mediaD],
      status: 'published'
    },
    {
      _id: ids.paperE,
      title: 'Polar Science Translation: Non-Sensationalist Public Outreach Framework',
      type: 'report',
      description: 'NCPOR guidelines on science communication maintaining a 0/10 Sensationalism Index and verifiable empirical lineage.',
      year: 2026,
      region: 'Antarctica',
      researchArea: 'Science Outreach',
      source: 'NCPOR Outreach Division',
      sourceOrganization: 'National Centre for Polar and Ocean Research',
      documentType: 'Institutional Outreach Manual',
      verificationStatus: 'verified',
      citation: 'NCPOR Dissemination Cell (2026). Science First, Evidence Always: Outreach Standards. NCPOR-COMM-2026.',
      contentText: 'Editorial Protocol: Outlines the strict verification criteria ensuring public communication pieces retain direct citations to primary NetCDF-4 observation moorings and eliminate speculative hyperbole.',
      authors: ['Outreach Directorate'],
      relatedExpedition: ids.expeditionA,
      relatedDatasets: [ids.datasetA],
      relatedPublications: [ids.publicationE],
      relatedMedia: [ids.mediaE],
      status: 'published'
    }
  ],
  Finding: [
    {
      _id: ids.findingA,
      researchResource: ids.paperA,
      title: 'Sub-ice mCDW Intrusion Thermohaline Signal',
      description: 'TEOS-10 CTD observations confirm modified Circumpolar Deep Water delivers warm pulses (+0.48°C) into Larsemann Hills coastal cavities.',
      importance: 'high',
      evidenceLinks: [ids.evidenceA]
    },
    {
      _id: ids.findingB,
      researchResource: ids.paperB,
      title: 'IndARC Atlantic Water Subsurface Warming',
      description: 'Kongsfjorden winter mooring data indicates persistent Atlantic Water core (T > 2°C, S > 34.9 PSU) at 150m, inhibiting sea-ice congelation.',
      importance: 'high',
      evidenceLinks: [ids.evidenceB]
    },
    {
      _id: ids.findingC,
      researchResource: ids.paperC,
      title: 'Chhota Shigri Isotopic Elevation Fractionation',
      description: 'Systematic vertical depletion of delta 18-O at -0.62‰ per 100m elevation gradient observed in Chandra Basin snow stratigraphy.',
      importance: 'medium',
      evidenceLinks: []
    }
  ],
  EvidenceLink: [
    {
      _id: ids.evidenceA,
      finding: ids.findingA,
      dataset: ids.datasetA,
      observation: ids.observationA,
      expedition: ids.expeditionA,
      station: ids.stationA,
      publication: ids.publicationA,
      media: ids.mediaA,
      relationship: 'primary-sensor-provenance',
      note: 'Empirical lineage: CTD Sensor Cast #04-PRYDZ -> Larsemann Hills NetCDF-4 Dataset -> Finding #1.'
    },
    {
      _id: ids.evidenceB,
      finding: ids.findingB,
      dataset: ids.datasetB,
      observation: ids.observationB,
      expedition: ids.expeditionB,
      station: ids.stationB,
      publication: ids.publicationB,
      media: ids.mediaB,
      relationship: 'primary-sensor-provenance',
      note: 'Empirical lineage: IndARC Mooring Time-Series -> Kongsfjorden NetCDF-4 Dataset -> Finding #2.'
    }
  ],
  Mystery: [
    {
      _id: ids.mysteryA,
      researchResource: ids.paperA,
      title: 'The Prydz Bay Thermal Pulse Mystery',
      description: 'Sub-ice thermohaline sensors near Bharati Station recorded anomalous basal melting beneath 2m of sea ice during mid-winter. Trace the physical mechanism.',
      difficulty: 'intermediate',
      estimatedTime: '12 minutes',
      clues: [
        {
          title: 'Deep CTD Cast Anomaly',
          description: 'Examine CTD Cast #04-PRYDZ at 380m depth. What water mass brings heat into the sub-ice cavity?',
          evidenceLink: ids.evidenceA,
          choices: [
            'Modified Circumpolar Deep Water (mCDW) intrusion driven by shelf-break eddy advection',
            'Surface solar irradiance penetrating through the opaque 2-meter fast ice',
            'Atmospheric katabatic winds causing radiative surface heating'
          ],
          correctAnswer: 'Modified Circumpolar Deep Water (mCDW) intrusion driven by shelf-break eddy advection'
        }
      ],
      status: 'published'
    },
    {
      _id: ids.mysteryB,
      researchResource: ids.paperB,
      title: 'The Kongsfjorden Winter Ice Anomaly',
      description: 'Investigate why Kongsfjorden remained ice-free throughout polar night despite atmospheric temperatures reaching -28°C at Himadri Station.',
      difficulty: 'intermediate',
      estimatedTime: '15 minutes',
      clues: [
        {
          title: 'Subsurface Mooring Telemetry',
          description: 'Inspect the IndARC hydrographic mooring timeseries between 120m-200m depth.',
          evidenceLink: ids.evidenceB,
          choices: [
            'Subsurface Atlantic Water (AW) inflow transiting Fram Strait, delivering continuous sensible heat',
            'Chemical contamination from passing commercial maritime transport',
            'Geothermal hydrothermal vent discharge on the fjord continental shelf'
          ],
          correctAnswer: 'Subsurface Atlantic Water (AW) inflow transiting Fram Strait, delivering continuous sensible heat'
        }
      ],
      status: 'published'
    }
  ],
  Quiz: [
    {
      _id: ids.quizA,
      title: 'Prydz Bay Cryospheric & Oceanographic Physics',
      description: 'Formative diagnostic evaluation on ocean-ice shelf heat exchange, TEOS-10 standards, and NetCDF-4 metadata conventions.',
      researchResource: ids.paperA,
      status: 'published',
      questions: [
        {
          prompt: 'Which water mass delivers oceanic heat beneath Antarctic ice shelves in Prydz Bay?',
          options: [
            'Modified Circumpolar Deep Water (mCDW)',
            'Antarctic Surface Water (AASW)',
            'North Atlantic Deep Water (NADW)',
            'Circumpolar Antarctic Bottom Water'
          ],
          answer: 'Modified Circumpolar Deep Water (mCDW)',
          explanation: 'Diagnostic note: mCDW is pushed onto the continental shelf by wind-driven gyres, supplying oceanic sensible heat that drives basal melt.'
        },
        {
          prompt: 'What metadata convention governs sovereign gridded NetCDF-4 polar science datasets?',
          options: [
            'CF Metadata Conventions 1.8',
            'Dublin Core Simple 1.1',
            'W3C Semantic RDF Core',
            'EXIF Geospatial 2.0'
          ],
          answer: 'CF Metadata Conventions 1.8',
          explanation: 'Diagnostic note: Climate and Forecast (CF) Metadata Conventions 1.8 define standard names, units, and spatial bounds for climate models.'
        },
        {
          prompt: 'Under what thermodynamic standard are CTD pressure, salinity, and temperature calibrated?',
          options: [
            'TEOS-10 (Thermodynamic Equation of Seawater - 2010)',
            'EOS-80 Practical Salinity Scale',
            'UNESCO 1966 Salinity Table',
            'NIST Thermometry Scale 1990'
          ],
          answer: 'TEOS-10 (Thermodynamic Equation of Seawater - 2010)',
          explanation: 'Diagnostic note: TEOS-10 adopts Conservative Temperature and Absolute Salinity, accounting for spatial variations in seawater composition.'
        },
        {
          prompt: 'Which Indian research station provides continuous year-round telemetry in Larsemann Hills, East Antarctica?',
          options: [
            'Bharati Station (69°24\'S, 76°11\'E)',
            'Dakshin Gangotri Station',
            'Himadri Station (78°55\'N)',
            'Himansh Station (32°24\'N)'
          ],
          answer: 'Bharati Station (69°24\'S, 76°11\'E)',
          explanation: 'Diagnostic note: Bharati Station was commissioned in 2012 in the Larsemann Hills and maintains active satellite telemetry and oceanographic moorings.'
        },
        {
          prompt: 'What statutory legislation governs environmental protection and research specimen collection in Antarctica for Indian citizens?',
          options: [
            'Indian Antarctic Act (2022)',
            'Wildlife Protection Act (1972)',
            'Environment (Protection) Act (1986)',
            'National Green Tribunal Act (2010)'
          ],
          answer: 'Indian Antarctic Act (2022)',
          explanation: 'Diagnostic note: The Indian Antarctic Act 2022 provides sovereign legal framework aligning Indian operations with the Antarctic Treaty System.'
        }
      ]
    },
    {
      _id: ids.quizB,
      title: 'Arctic Hydrography & High-Latitude Telemetry',
      description: 'Diagnostic assessment evaluating Kongsfjorden water mass dynamics, IndARC mooring telemetry, and science outreach standards.',
      researchResource: ids.paperB,
      status: 'published',
      questions: [
        {
          prompt: 'What temperature and salinity thresholds characterize Atlantic Water (AW) in Kongsfjorden?',
          options: [
            'Salinity > 34.9 PSU and temperatures > 2.0°C',
            'Salinity < 30.0 PSU and temperatures < -1.5°C',
            'Salinity = 32.5 PSU and temperature = 0°C',
            'Salinity > 38.0 PSU and temperature > 15°C'
          ],
          answer: 'Salinity > 34.9 PSU and temperatures > 2.0°C',
          explanation: 'Diagnostic note: Atlantic Water carried by the West Spitsbergen Current is warmer (>2°C) and more saline (>34.9 PSU) than Arctic Surface Water.'
        },
        {
          prompt: 'Where is India sovereign Arctic research station, Himadri, situated?',
          options: [
            'Ny-Ålesund, Spitsbergen, Svalbard',
            'Tromsø, Northern Norway',
            'Nuuk, Greenland',
            'Resolute Bay, Canada'
          ],
          answer: 'Ny-Ålesund, Spitsbergen, Svalbard',
          explanation: 'Diagnostic note: Himadri was established in 2008 at the international Arctic research village of Ny-Ålesund (78°55\'N).'
        },
        {
          prompt: 'What Sensationalism Index is mandated by the MoES Scientific Charter for public outreach pieces?',
          options: [
            '0 / 10 (Strict empirical factual framing with verified citations)',
            '5 / 10 (Moderate entertainment embellishment permitted)',
            '8 / 10 (High dramatic narrative framing)',
            'Unregulated'
          ],
          answer: '0 / 10 (Strict empirical factual framing with verified citations)',
          explanation: 'Diagnostic note: The institutional charter requires zero sensationalism (0/10), ensuring all claims retain direct lineage to primary datasets.'
        },
        {
          prompt: 'What is the sovereign name of India multi-sensor underwater oceanographic mooring deployed in the Arctic?',
          options: [
            'IndARC Mooring System',
            'Argo Polar Float',
            'Svalbard Buoy Array',
            'Himadri Deep Probe'
          ],
          answer: 'IndARC Mooring System',
          explanation: 'Diagnostic note: IndARC is India first multi-sensor underwater observatory deployed in Kongsfjorden since 2014.'
        },
        {
          prompt: 'Why are isotopic ratios (delta 18-O) depleted at higher altitudes on Himalayan glaciers like Chhota Shigri?',
          options: [
            'Rayleigh distillation during orographic ascent removes heavier water isotopes first',
            'Extreme ultraviolet solar radiation selectively destroys oxygen-18',
            'High-altitude bacterial consumption of heavy isotopes',
            'Atmospheric ozone concentration at 4000m'
          ],
          answer: 'Rayleigh distillation during orographic ascent removes heavier water isotopes first',
          explanation: 'Diagnostic note: Orographic precipitation preferentially rains out heavy isotopes (oxygen-18 and deuterium), leaving residual vapor depleted.'
        }
      ]
    }
  ],
  Badge: [
    { _id: ids.badgeA, name: 'Polar Explorer', description: 'Explored research across the sovereign Polar Triad (Antarctica, Arctic, and Himalaya).', icon: 'polar-explorer', criteria: 'View research across all 3 polar domains', category: 'exploration' },
    { _id: ids.badgeB, name: 'Evidence Detective', description: 'Traced provenance DAGs from published findings to primary sensor moorings.', icon: 'evidence-detective', criteria: 'Complete 3 evidence graph investigations', category: 'evidence' },
    { _id: ids.badgeC, name: 'Cryospheric Mystery Solver', description: 'Solved inductive polar forensic mysteries through empirical deduction.', icon: 'mystery-solver', criteria: 'Successfully deduce 2 polar mysteries', category: 'investigation' },
    { _id: ids.badgeD, name: 'MoES Accredited Scholar', description: 'Completed diagnostic quizzes with verified scientific competency.', icon: 'accredited-scholar', criteria: 'Pass research-linked quizzes with >80% score', category: 'learning' },
    { _id: ids.badgeE, name: 'Zero-Sensationalism Communicator', description: 'Generated peer-reviewed, source-grounded public science outreach drafts.', icon: 'science-communicator', criteria: 'Create 2 outreach drafts with 0/10 Sensationalism Index', category: 'communication' }
  ],
  OutreachContent: [
    {
      _id: ids.outreachA,
      user: ids.user,
      researchResource: ids.paperA,
      evidenceLinks: [ids.evidenceA],
      format: 'Infographic',
      title: 'The Hidden Heat Beneath Antarctic Ice',
      content: 'Authoritative Briefing (MoES / NCPOR Bharati Station):\n\nDid you know that oceanic heat can melt ice shelves from below without any atmospheric warming?\n\nKey Finding:\nCTD Cast #04-PRYDZ around Bharati Station reveals modified Circumpolar Deep Water (mCDW) pulsing at 380m depth (+0.48°C above freezing point), driving basal thinning of 1.4 meters per year.\n\nData Standard: NetCDF-4 CF-1.8 compliant | TEOS-10 Calibrated\nSource DOI: 10.21044/NCPOR.2026.ISEA43.01\nGoverning Body: NCPOR, Ministry of Earth Sciences, Govt. of India.',
      status: 'draft'
    }
  ],
  UserProgress: [
    {
      _id: ids.progressA,
      user: ids.user,
      researchExplored: [ids.paperA, ids.paperB],
      mysteriesSolved: [ids.mysteryA],
      quizzesCompleted: [
        {
          quiz: ids.quizA,
          completedAt: new Date('2026-01-01T00:00:00.000Z'),
          score: 100
        }
      ],
      outreachCreated: [ids.outreachA],
      xp: 125,
      badges: [ids.badgeA, ids.badgeC],
      savedMysteries: [ids.mysteryB],
      mysteryProgress: [
        {
          mystery: ids.mysteryA,
          currentClue: 1,
          completed: true,
          updatedAt: new Date('2026-01-01T00:00:00.000Z')
        },
        {
          mystery: ids.mysteryB,
          currentClue: 0,
          completed: false,
          updatedAt: new Date('2026-01-01T00:00:00.000Z')
        }
      ],
      recentResearch: [
        { resource: ids.paperA, viewedAt: new Date('2026-01-01T00:00:00.000Z') },
        { resource: ids.paperB, viewedAt: new Date('2026-01-01T00:00:00.000Z') }
      ]
    }
  ]
};

module.exports = { demoData, ids };
