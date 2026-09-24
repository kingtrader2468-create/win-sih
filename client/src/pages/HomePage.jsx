import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard, getHomepageData } from '../services/apiClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import InfiniteSpiral from '../components/InfiniteSpiral.jsx';
import PixelSnow from '../components/PixelSnow.jsx';

const polarSpiralImages = [
  { src: 'https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&w=900&q=80', alt: 'Antarctic glacier field' },
  { src: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=900&q=80', alt: 'Polar atmosphere and sky' },
  { src: 'https://images.unsplash.com/photo-1551582045-6ec9c11d8697?auto=format&fit=crop&w=900&q=80', alt: 'Polar wildlife research' },
  { src: 'https://images.unsplash.com/photo-1464278533981-50106e6176b1?auto=format&fit=crop&w=900&q=80', alt: 'Himalayan high altitude fieldwork' },
  { src: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=900&q=80', alt: 'Arctic ocean and sea ice' },
  { src: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=900&q=80', alt: 'Earth observation landscape' },
  { src: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=900&q=80', alt: 'Snow covered polar ridge' },
  { src: 'https://images.unsplash.com/photo-1486911278844-a81c5267e227?auto=format&fit=crop&w=900&q=80', alt: 'Remote polar coastline' }
];

function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [homepageData, setHomepageData] = useState(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState('All');

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      getDashboard(controller.signal).catch(() => null),
      getHomepageData(controller.signal).catch(() => null)
    ]).then(([dash, home]) => {
      if (dash) setDashboardData(dash);
      if (home) setHomepageData(home);
    }).catch((err) => {
      console.error('Home data load error:', err);
    });
    return () => controller.abort();
  }, []);

  const progress = dashboardData?.userProgress;
  const recentItem = progress?.recentResearch?.[0]?.resource;

  const disciplines = ['All Polar Disciplines', 'Glaciology', 'Atmospheric Science', 'Polar Biology'];

  // Render only research returned by the backend.
  const dynamicResearch = homepageData?.featuredResearch?.length
    ? homepageData.featuredResearch.map((item) => ({
      id: item._id,
        category: (item.type || 'PEER-REVIEWED PAPER').toUpperCase(),
        categoryClass: 'bg-primary-container/20 text-primary',
        discipline: item.discipline || 'Glaciology',
        region: `${item.region || 'Antarctica'} · ${item.year || 2024}`,
        doi: item.doi || `DOI: 10.1016/j.polar.${item.year || 2024}`,
        image: item.thumbnailUrl || '',
        alt: item.title,
        title: item.title,
        authors: item.authors?.join(', ') || 'NCPOR Scientific Contingent',
        evidence1: 'Linked Datasets',
        evidence2: 'Evidence Graph Available',
        evidence3: 'Peer Verified',
        url: `/research/${item._id}`,
        actionText: 'View Research & Evidence',
        actionIcon: 'arrow_forward'
      }))
    : [];

  const filteredResearch = dynamicResearch.filter((item) => {
    if (selectedDiscipline === 'All Polar Disciplines' || selectedDiscipline === 'All') return true;
    return item.discipline === selectedDiscipline;
  });

  const researchImageFallbacks = [
    'https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1551582045-6ec9c11d8697?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1464278533981-50106e6176b1?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1486911278844-a81c5267e227?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1473445361085-b9a07f55608b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=900&q=80&sat=-20',
    'https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&w=900&q=80&sat=20',
    'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=900&q=80&sat=-30',
    'https://images.unsplash.com/photo-1464278533981-50106e6176b1?auto=format&fit=crop&w=900&q=80&sat=15',
    'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=900&q=80&sat=-15',
    'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=900&q=80&sat=25'
  ];

  const topicImageRules = [
    { terms: ['glacier', 'glaciolog', 'ice sheet', 'ice core', 'snow', 'cryosphere'], pool: [0, 6, 12] },
    { terms: ['atmosphere', 'aerosol', 'ozone', 'climate', 'meteorolog', 'wind'], pool: [1, 7, 13] },
    { terms: ['biology', 'ecology', 'wildlife', 'penguin', 'seal', 'organism'], pool: [2, 8, 14] },
    { terms: ['himalaya', 'mountain', 'chandra', 'himansh', 'high altitude'], pool: [3, 9, 15] },
    { terms: ['ocean', 'marine', 'fjord', 'sea ice', 'arctic', 'svalbard'], pool: [4, 10, 16] },
    { terms: ['remote sensing', 'satellite', 'earth observation', 'geophysics', 'mapping'], pool: [5, 11, 17] }
  ];

  const getResearchImage = (item, cardIndex) => {
    const searchableText = `${item.title} ${item.authors} ${item.discipline} ${item.region}`.toLowerCase();
    const matchedRule = topicImageRules.find((rule) =>
      rule.terms.some((term) => searchableText.includes(term))
    );
    const imagePool = matchedRule?.pool || researchImageFallbacks.map((_, index) => index);
    return researchImageFallbacks[imagePool[cardIndex % imagePool.length]];
  };

  return (
    <div className="relative flex flex-col w-full bg-surface-container-lowest">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-35">
        <PixelSnow
          color="#b9d9ee"
          minFlakeSize={1.25}
          speed={0.6}
          density={0.3}
          direction={125}
          brightness={0.8}
          className="h-full"
        />
      </div>
      {/* 1. HERO SECTION */}
      <section className="relative z-10 max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg pt-space-xl lg:pt-space-2xl pb-space-xl min-h-[620px] lg:min-h-[680px] flex items-center">
          {/* Main Hero Headline & Introduction */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-center justify-between w-full">
            <div className="lg:col-span-7 flex flex-col items-start lg:pr-16">
              <h1 className="font-headline-lg text-headline-lg lg:font-display-xl lg:text-display-xl text-on-surface font-extrabold tracking-tight leading-tight mb-space-md">
                Discover India’s Polar Science
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed mb-space-xl">
                Explore peer-reviewed field telemetry, reconstruct paleoclimatic ice-core records, trace direct research evidence, and investigate empirical polar mysteries across the three poles.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-space-md">
                <Link
                  to="/research"
                  className="inline-flex items-center gap-space-sm px-6 py-3 bg-primary-container text-surface-container-lowest font-label-md text-label-md rounded-lg shadow-sm hover:bg-primary transition-all transform active:scale-[0.99]"
                >
                  <span className="material-symbols-outlined text-[18px]">explore</span>
                  <span>Explore Research</span>
                </Link>
                <a
                  href="#active-journey"
                  className="inline-flex items-center gap-space-sm px-6 py-3 bg-surface-container-low text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container transition-all"
                >
                  <span>Continue Learning</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 w-full lg:pl-10">
              <div className="relative overflow-hidden rounded-2xl">
                <div className="h-[360px] sm:h-[440px]">
                  <InfiniteSpiral
                    items={polarSpiralImages}
                    animationMode="all"
                    speed={0.32}
                    radius={170}
                    cardWidth={112}
                    cardHeight={112}
                    verticalSpacing={62}
                    perspective={1000}
                    cardRadius={14}
                    centerScale={1.18}
                    edgeBlur={5}
                    cardsPerTurn={8}
                    pauseOnHover
                  />
                </div>
              </div>
            </div>
          </div>

      </section>

      {/* 2. ACTIVE RESEARCH JOURNEY (Continue Learning) */}
      <section className="relative z-10 w-full max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl" id="active-journey">
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg lg:p-space-xl shadow-md border border-surface-container-high/60 relative overflow-hidden">
          {/* Top Decorative Band */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-tertiary-container via-primary-container to-primary" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-center">
            {/* Content Pane */}
            <div className="lg:col-span-8 flex flex-col">
              <div className="flex items-center gap-space-xs mb-space-sm">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low text-tertiary font-label-sm text-label-sm font-bold tracking-wider uppercase">
                  <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse" />
                  ACTIVE RESEARCH JOURNEY
                </span>
                <span className="font-data-tabular text-label-sm text-outline">Track ID: GLAC-CDML-09</span>
              </div>
              <h2 className="font-headline-md text-headline-md lg:font-headline-lg lg:text-headline-lg text-on-surface font-bold mb-space-xs">
                {recentItem?.title || 'Antarctic Climate Research & Ice Core Proxies'}
              </h2>
              <div className="font-label-md text-body-sm text-secondary font-medium mb-space-sm">
                Paleoclimatology &amp; Glaciology · Module 3 of 6
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-space-lg leading-relaxed">
                Reconstructing past atmospheric CO₂ and isotopic δ¹⁸O variations from Central Dronning Maud Land ice cores. Learn how bubble air entrapment dates ancient global paleoclimate intervals.
              </p>

              {/* Progress Bar Component */}
              <div className="w-full bg-surface-container-low rounded-full h-3 mb-space-sm overflow-hidden p-0.5 border border-surface-container-high/60">
                <div className="bg-tertiary-container h-full rounded-full transition-all duration-700" style={{ width: '65%' }} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-lg text-label-sm font-data-tabular">
                <span className="text-tertiary font-semibold">65% Completed · 4 of 7 evidence modules analyzed</span>
                <span className="text-outline">Estimated remaining: 28 mins</span>
              </div>

              {/* Next Step Pill & CTA */}
              <div className="flex flex-wrap items-center gap-space-md">
                <Link
                  to={recentItem ? `/research/${recentItem._id}` : '/research'}
                  className="inline-flex items-center gap-space-sm px-6 py-2.5 bg-tertiary text-on-tertiary font-label-md text-label-md rounded-lg shadow-sm hover:bg-tertiary/90 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">play_circle</span>
                  <span>Resume Journey</span>
                </Link>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm">
                  <span className="text-outline">Next Target:</span>
                  <span className="font-semibold text-primary">Analyze Microtephra Layers from Dome Fuji</span>
                  <span className="material-symbols-outlined text-[16px] text-primary">arrow_forward</span>
                </div>
              </div>
            </div>

            {/* Ice Core Visual Widget */}
            <div className="lg:col-span-4 bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between h-full border border-surface-container-high/80">
              <div className="flex items-center justify-between mb-space-sm">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                  Active Stratigraphic Sample
                </span>
                <span className="font-data-tabular text-label-sm text-primary font-bold">CORE IND-2023-B3</span>
              </div>

              {/* Stratigraphic Ice Column Visualization */}
              <div className="relative w-full h-32 rounded-lg bg-surface-container overflow-hidden p-2 flex flex-col justify-between shadow-inner">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#1ea7e8_1px,transparent_1px)] [background-size:8px_8px]" />
                <div className="relative z-10 flex items-center justify-between text-[11px] font-data-tabular">
                  <span className="bg-surface-container-lowest/90 px-1.5 py-0.5 rounded text-on-surface">Depth: 142.8m</span>
                  <span className="bg-surface-container-lowest/90 px-1.5 py-0.5 rounded text-tertiary font-semibold">δ¹⁸O: -34.8‰</span>
                </div>
                {/* Visual Ice Density Bands */}
                <div className="relative z-10 flex flex-col gap-1.5 my-auto">
                  <div className="h-2 w-full bg-primary-fixed rounded-sm" />
                  <div className="h-3 w-5/6 bg-primary-container/40 rounded-sm" />
                  <div className="h-1.5 w-full bg-tertiary-fixed-dim rounded-sm" />
                  <div className="h-2.5 w-4/6 bg-secondary-fixed rounded-sm" />
                </div>
                <div className="relative z-10 flex items-center justify-between text-[10px] text-outline font-data-tabular">
                  <span>Approx. Age: 11,240 BP (Holocene Transition)</span>
                  <span className="text-primary font-semibold">Verified Specimen</span>
                </div>
              </div>

              <div className="mt-space-sm pt-space-xs border-t border-surface-container-high/70 flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant">
                <span>Primary Core Repository:</span>
                <span className="font-semibold text-on-surface">NCPOR Cryo-Vault, Goa</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. RECOMMENDED RESEARCH (DOMINANT RESEARCH DISCOVERY) */}
      <section className="w-full max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">
                Scientific Repository Explorer
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
              Recommended Research Resources
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Peer-reviewed monographs, observational sensor arrays, and polar data curated for student investigations.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-space-xs">
            {disciplines.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDiscipline(d)}
                className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-medium transition-all ${
                  selectedDiscipline === d || (d === 'All Polar Disciplines' && selectedDiscipline === 'All')
                    ? 'bg-secondary text-surface-container-lowest shadow-sm'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Rich Scientific Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter-lg">
          {filteredResearch.map((item, cardIndex) => (
            <div
              key={item.id}
              className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between group border border-surface-container-high/60"
            >
              <div>
                <div className="flex items-center justify-between gap-space-xs mb-space-md">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-bold tracking-wide ${item.categoryClass}`}>
                    {item.category}
                  </span>
                  <span className="font-data-tabular text-label-sm text-outline">{item.region}</span>
                </div>

                <div className="relative w-full h-44 rounded-xl overflow-hidden mb-space-md bg-surface-container-low">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={item.alt}
                    src={getResearchImage(item, cardIndex)}
                    onError={(event) => {
                      const fallback = researchImageFallbacks[cardIndex % researchImageFallbacks.length];
                      if (event.currentTarget.src !== fallback) {
                        event.currentTarget.src = fallback;
                      }
                    }}
                  />
                  {item.liveBadge && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-tertiary-container text-surface-container-lowest font-data-tabular text-label-sm font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-surface-container-lowest animate-pulse" />
                      Live Telemetry
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-surface-container-lowest/90 backdrop-blur-sm font-data-tabular text-label-sm text-on-surface">
                    {item.doi}
                  </div>
                </div>

                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors leading-snug mb-space-sm">
                  {item.title}
                </h3>
                <p className="font-label-md text-label-md text-secondary font-medium mb-space-md">
                  {item.authors}
                </p>

                {/* Evidence Indicators Pill Group */}
                <div className="flex flex-wrap items-center gap-space-xs mb-space-lg">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container-low text-on-surface font-data-tabular text-label-sm">
                    <span className="material-symbols-outlined text-[14px] text-primary">database</span>
                    {item.evidence1}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container-low text-on-surface font-data-tabular text-label-sm">
                    <span className="material-symbols-outlined text-[14px] text-tertiary">hub</span>
                    {item.evidence2}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container-low text-on-surface font-data-tabular text-label-sm">
                    <span className="material-symbols-outlined text-[14px] text-outline">verified_user</span>
                    {item.evidence3}
                  </span>
                </div>
              </div>

              <div className="pt-space-md border-t border-surface-container-high/60 flex items-center justify-between">
                <Link
                  to={item.url}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-surface-container-low text-primary font-label-md text-label-md font-semibold hover:bg-primary hover:text-surface-container-lowest transition-colors"
                >
                  <span>{item.actionText}</span>
                  <span className="material-symbols-outlined text-[16px]">{item.actionIcon}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEATURED EXPEDITIONS */}
      <section className="w-full max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl">
        <div className="flex items-center justify-between mb-space-lg">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-tertiary" />
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">
                Scientific Operations
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
              Active &amp; Milestone Indian Polar Expeditions
            </h2>
          </div>
          <Link
            to="/expeditions"
            className="hidden sm:inline-flex items-center gap-1 text-primary font-label-md text-label-md font-semibold hover:underline"
          >
            <span>View all 58 Indian Expeditions</span>
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter-lg">
          {/* Expedition Card 1: 44th ISEA */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 font-data-tabular text-label-sm font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  ACTIVE FIELD SEASON
                </span>
                <span className="font-data-tabular text-label-sm text-outline">ISEA-44 · 2024–2025</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-space-xs">
                44th Indian Scientific Expedition to Antarctica (ISEA)
              </h3>
              <div className="flex items-center gap-2 text-primary font-label-sm text-label-sm font-medium mb-space-md">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                <span>Target: Maitri &amp; Bharati Stations, Queen Maud Land</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-space-md leading-relaxed">
                Deployment concentrating on deep ice-bedrock teleconnections, space weather electromagnetic emissions, and permafrost drill core retrieval across Princess Astrid Coast.
              </p>
              <div className="grid grid-cols-2 gap-space-sm p-space-sm bg-surface-container-low rounded-xl mb-space-md font-data-tabular text-label-sm">
                <div>
                  <span className="text-outline block text-[11px]">Scientific Contingent:</span>
                  <span className="text-on-surface font-semibold">48 Scientists &amp; Support</span>
                </div>
                <div>
                  <span className="text-outline block text-[11px]">Expedition Leader:</span>
                  <span className="text-on-surface font-semibold">Dr. A. K. Nagarajan (NCPOR)</span>
                </div>
              </div>
            </div>
            <div className="pt-space-sm flex items-center justify-between">
              <Link
                to="/expeditions"
                className="inline-flex items-center gap-2 py-2.5 px-5 rounded-lg bg-on-surface text-surface-container-lowest font-label-md text-label-md font-medium hover:bg-on-surface/90 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">satellite_alt</span>
                <span>View Expedition Log &amp; Data Feed</span>
              </Link>
              <span className="font-data-tabular text-label-sm text-outline hidden sm:inline">
                Telemetry sync: 4m ago
              </span>
            </div>
          </div>

          {/* Expedition Card 2: Arctic Winter Expedition */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-data-tabular text-label-sm font-semibold">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  HISTORIC MILESTONE
                </span>
                <span className="font-data-tabular text-label-sm text-outline">IND-ARC-WIN-24</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-space-xs">
                Indian Arctic Winter Expedition 2023–2024
              </h3>
              <div className="flex items-center gap-2 text-primary font-label-sm text-label-sm font-medium mb-space-md">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                <span>Target: Himadri Station, Svalbard (79°N)</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-space-md leading-relaxed">
                Continuous Arctic polar night aerosol characterization, space physics, and fjord hydrography. Marked India’s maiden year-round winter scientific presence in the high Arctic.
              </p>
              <div className="grid grid-cols-2 gap-space-sm p-space-sm bg-surface-container-low rounded-xl mb-space-md font-data-tabular text-label-sm">
                <div>
                  <span className="text-outline block text-[11px]">Wintering Milestone:</span>
                  <span className="text-on-surface font-semibold">1st Maiden Wintering</span>
                </div>
                <div>
                  <span className="text-outline block text-[11px]">Polar Night Duration:</span>
                  <span className="text-on-surface font-semibold">118 Continuous Days</span>
                </div>
              </div>
            </div>
            <div className="pt-space-sm flex items-center justify-between">
              <Link
                to="/expeditions"
                className="inline-flex items-center gap-2 py-2.5 px-5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">biotech</span>
                <span>Explore Winter Science Results</span>
              </Link>
              <span className="font-data-tabular text-label-sm text-outline hidden sm:inline">
                Monograph Published
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MYSTERIES (Strictly Subdued Scientific Tone) */}
      <section className="w-full max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl">
        <div className="p-space-lg lg:p-space-xl rounded-2xl bg-surface-container-low border border-surface-container-high/60">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-md">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">
                Inquiry-Led Learning
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                Research-Based Mysteries Unlocked For You
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-label-sm text-label-sm shadow-xs border border-surface-container-high/80">
              <span className="material-symbols-outlined text-amber-500 text-[18px]">lightbulb</span>
              <span>Analyze a research resource or dataset to unlock its associated mystery.</span>
            </div>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-3xl mb-space-lg">
            Scientific enigmas identified by polar expeditions that require evidence tracing, hypothesis evaluation, and multi-sensor telemetry examination.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {/* Mystery 1: Unlocked */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
                    <span className="material-symbols-outlined text-[14px]">lock_open</span>
                    Unlocked via Larsemann Hills Paper
                  </span>
                  <span className="font-data-tabular text-label-sm text-outline">Case Ref: MYS-ANT-04</span>
                </div>
                <h3 className="font-title-md text-headline-sm text-on-surface font-bold mb-space-xs">
                  The Larsemann Hills Temperature Anomaly (1998–2022)
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md leading-relaxed">
                  Why did specific coastal oases in East Antarctica resist warming trends while the Antarctic Peninsula heated at four times the global rate?
                </p>
              </div>
              <div className="pt-space-sm border-t border-surface-container-high/40 flex items-center justify-between">
                <Link
                  to="/mystery/000000000000000000000001"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-container text-surface-container-lowest font-label-md text-label-md hover:bg-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">account_tree</span>
                  <span>Investigate Evidence (Guided Reasoning)</span>
                </Link>
                <span className="font-data-tabular text-label-sm text-outline">3 Clues Available</span>
              </div>
            </div>

            {/* Mystery 2: Locked */}
            <div className="bg-surface-container-lowest/70 rounded-xl p-space-md shadow-xs border border-surface-container-high/40 flex flex-col justify-between opacity-85">
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container text-outline font-label-sm text-label-sm font-bold">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    Locked
                  </span>
                  <span className="font-data-tabular text-label-sm text-outline">Case Ref: MYS-ARC-02</span>
                </div>
                <h3 className="font-title-md text-headline-sm text-secondary font-bold mb-space-xs">
                  The Missing Kongsfjorden Phytoplankton Bloom
                </h3>
                <p className="font-body-sm text-body-sm text-outline mb-space-md leading-relaxed">
                  An unexplained shift in spring diatom mass occurred despite optimal photoperiod and temperature conditions during the 2023 Arctic melt cycle.
                </p>
              </div>
              <div className="pt-space-sm border-t border-surface-container-high/40 flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                <span className="font-data-tabular text-label-sm text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-outline">info</span>
                  Analyze IndARC Moored Sensor Dataset to unlock
                </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-outline font-label-sm text-label-sm cursor-not-allowed"
                  disabled
                >
                  <span>Locked</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. STUDENT PROGRESS & BADGES */}
      <section className="w-full max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl mb-space-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg">
          {/* Left Column: Academic Scientific Progress */}
          <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container-high/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">
                    Research Profile
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    My Scientific Progress
                  </h3>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-container-low text-primary font-data-tabular text-label-sm font-semibold">
                    {isAuthenticated ? 'Level 4 Junior Polar Researcher' : 'Scholar Visitor (Sample)'}
                  </span>
                </div>
              </div>

              {/* Academic Metrics Grid */}
              <div className="grid grid-cols-2 gap-space-sm mb-space-md font-data-tabular">
                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col">
                  <span className="text-outline text-label-sm mb-1">Explored Papers</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    {progress?.researchExplored?.length || 14}
                  </span>
                  <span className="text-[11px] text-tertiary mt-1">4 linked to peer data</span>
                </div>
                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col">
                  <span className="text-outline text-label-sm mb-1">Mysteries Solved</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    {progress?.mysteriesSolved?.length || 2}
                  </span>
                  <span className="text-[11px] text-primary mt-1">1 active investigation</span>
                </div>
                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col">
                  <span className="text-outline text-label-sm mb-1">Polar Quizzes</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    {progress?.quizzesCompleted?.length || 8}
                  </span>
                  <span className="text-[11px] text-secondary mt-1">Avg. Score 92%</span>
                </div>
                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col">
                  <span className="text-outline text-label-sm mb-1">Academic XP</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    {progress?.xp || 1250}
                  </span>
                  <span className="text-[11px] text-outline mt-1">Next rank: 1,500 XP</span>
                </div>
              </div>
            </div>
            <div className="pt-space-sm border-t border-surface-container-high/60 flex items-center justify-between text-label-sm">
              <span className="text-outline font-data-tabular">
                Scholar ID: {user?.registryId || 'NCPOR-EDU-2025-884'}
              </span>
              <Link to="/progress" className="text-primary font-semibold hover:underline">
                Academic Record &amp; Transcript
              </Link>
            </div>
          </div>

          {/* Right Column: Research Milestone Badges */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container-high/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">
                    Institutional Validation
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    Research Milestone Badges
                  </h3>
                </div>
                <span className="font-data-tabular text-label-sm text-outline">4 of 12 Milestones Verified</span>
              </div>

              {/* 4 Dignified Scientific Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
                {/* Badge 1: Antarctic Field Scout */}
                <div className="p-3 rounded-xl bg-surface-container-low flex flex-col items-center text-center group hover:bg-surface-container transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-primary-fixed/60 flex items-center justify-center text-primary mb-2 shadow-2xs">
                    <span className="material-symbols-outlined text-[24px]">explore</span>
                  </div>
                  <span className="font-title-md text-label-md font-bold text-on-surface leading-tight">
                    Antarctic Field Scout
                  </span>
                  <span className="font-data-tabular text-[10px] text-outline mt-1">Nov 14, 2024</span>
                  <span className="mt-2 text-[10px] font-label-sm px-1.5 py-0.5 rounded bg-surface-container-lowest text-tertiary">
                    Verified
                  </span>
                </div>

                {/* Badge 2: Cryo-Data Analyst */}
                <div className="p-3 rounded-xl bg-surface-container-low flex flex-col items-center text-center group hover:bg-surface-container transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-tertiary-fixed/60 flex items-center justify-center text-tertiary mb-2 shadow-2xs">
                    <span className="material-symbols-outlined text-[24px]">layers</span>
                  </div>
                  <span className="font-title-md text-label-md font-bold text-on-surface leading-tight">
                    Cryo-Data Analyst
                  </span>
                  <span className="font-data-tabular text-[10px] text-outline mt-1">Dec 02, 2024</span>
                  <span className="mt-2 text-[10px] font-label-sm px-1.5 py-0.5 rounded bg-surface-container-lowest text-tertiary">
                    Verified
                  </span>
                </div>

                {/* Badge 3: Ny-Ålesund Observer */}
                <div className="p-3 rounded-xl bg-surface-container-low flex flex-col items-center text-center group hover:bg-surface-container transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-secondary-fixed/70 flex items-center justify-center text-on-secondary-fixed mb-2 shadow-2xs">
                    <span className="material-symbols-outlined text-[24px]">water</span>
                  </div>
                  <span className="font-title-md text-label-md font-bold text-on-surface leading-tight">
                    Ny-Ålesund Observer
                  </span>
                  <span className="font-data-tabular text-[10px] text-outline mt-1">Jan 18, 2025</span>
                  <span className="mt-2 text-[10px] font-label-sm px-1.5 py-0.5 rounded bg-surface-container-lowest text-tertiary">
                    Verified
                  </span>
                </div>

                {/* Badge 4: Evidence Tracer */}
                <div className="p-3 rounded-xl bg-surface-container-low flex flex-col items-center text-center group hover:bg-surface-container transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-primary-container/30 flex items-center justify-center text-on-primary-fixed-variant mb-2 shadow-2xs">
                    <span className="material-symbols-outlined text-[24px]">hub</span>
                  </div>
                  <span className="font-title-md text-label-md font-bold text-on-surface leading-tight">
                    Evidence Tracer
                  </span>
                  <span className="font-data-tabular text-[10px] text-outline mt-1">Feb 04, 2025</span>
                  <span className="mt-2 text-[10px] font-label-sm px-1.5 py-0.5 rounded bg-surface-container-lowest text-tertiary">
                    Verified
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-space-sm border-t border-surface-container-high/60 flex items-center justify-between text-label-sm">
              <span className="text-outline font-data-tabular">
                Accredited by NCPOR Scientific Education Council
              </span>
              <Link to="/learning" className="text-primary font-semibold hover:underline">
                View Badge Verification Standards
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
