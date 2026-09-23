import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Compass,
  MapPin,
  Thermometer,
  Wind,
  Layers,
  Activity,
  Globe2,
  Calendar,
  Waves,
  Search,
  ChevronRight,
  X,
  Gauge,
  Info,
  Radio,
  ExternalLink,
  ShieldAlert,
  Snowflake
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  getMapStations,
  getMapLayers,
  getMapProjects
} from '../services/apiClient.js';
import { useTheme } from '../context/ThemeContext.jsx';
import './PolarMapPage.css';

const regionsList = [
  { id: 'All', label: 'All Polar Domains', icon: Globe2 },
  { id: 'Antarctica', label: 'Antarctica (South Pole)', icon: Compass },
  { id: 'Arctic', label: 'Arctic (North Pole)', icon: Snowflake },
  { id: 'Himalaya', label: 'Himalayas (Third Pole)', icon: Layers }
];

const layersList = [
  { id: 'climate', label: 'Climate Telemetry', icon: Activity, color: '#1ea7e8' },
  { id: 'ocean', label: 'Ocean & Currents', icon: Waves, color: '#0ea5e9' },
  { id: 'ice', label: 'Ice Sheets & Glaciers', icon: Snowflake, color: '#38bdf8' },
  { id: 'temperature', label: 'Thermal Isotherms', icon: Thermometer, color: '#f43f5e' },
  { id: 'atmosphere', label: 'Atmosphere & Ozone', icon: Wind, color: '#10b981' }
];

function PolarMapPage() {
  const { isDark } = useTheme();
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [activeLayer, setActiveLayer] = useState('climate');
  const [stations, setStations] = useState([]);
  const [layersData, setLayersData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const overlaysLayerRef = useRef(null);
  const tileLayerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      getMapStations(),
      getMapLayers(),
      getMapProjects()
    ])
      .then(([stationsRes, layersRes, projectsRes]) => {
        if (!isMounted) return;
        if (stationsRes.stations) {
          setStations(stationsRes.stations);
          setSelectedStation(stationsRes.stations[0]); // default to Bharati
        }
        if (layersRes.layers) setLayersData(layersRes.layers);
        if (projectsRes.projects) setProjects(projectsRes.projects);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load map data:', err);
        setError('Unable to reach telemetry stream. Displaying cached polar data.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter stations based on selected region and search query
  const filteredStations = useMemo(() => {
    return stations.filter((station) => {
      const matchRegion =
        selectedRegion === 'All' ||
        station.region.toLowerCase() === selectedRegion.toLowerCase();
      const matchSearch =
        !searchQuery ||
        station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.subRegion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchRegion && matchSearch;
    });
  }, [stations, selectedRegion, searchQuery]);

  // Current active layer details
  const currentLayerData = layersData ? layersData[activeLayer] : null;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      minZoom: 2,
      maxZoom: 18,
      worldCopyJump: true
    }).setView([-25, 45], 2);

    L.control.zoom({ position: 'topright' }).addTo(map);

    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    markersLayerRef.current = L.layerGroup().addTo(map);
    overlaysLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Tile layer switch on Theme change
  useEffect(() => {
    if (!tileLayerRef.current) return;
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    tileLayerRef.current.setUrl(tileUrl);
  }, [isDark]);

  const handleStationSelect = (st) => {
    setSelectedStation(st);
    const lat = st.coordinates?.latitude ?? st.coordinates?.lat;
    const lng = st.coordinates?.longitude ?? st.coordinates?.lng;
    if (mapInstanceRef.current && lat !== undefined && lng !== undefined) {
      mapInstanceRef.current.flyTo([lat, lng], 6, { duration: 1.2 });
    }
  };

  const handleRegionSelect = (regId) => {
    setSelectedRegion(regId);
    if (!mapInstanceRef.current) return;

    if (regId === 'Antarctica') {
      mapInstanceRef.current.flyTo([-72, 45], 3, { duration: 1.2 });
    } else if (regId === 'Arctic') {
      mapInstanceRef.current.flyTo([78.5, 15], 4, { duration: 1.2 });
    } else if (regId === 'Himalaya') {
      mapInstanceRef.current.flyTo([32.4, 78], 5, { duration: 1.2 });
    } else {
      mapInstanceRef.current.flyTo([-10, 30], 2, { duration: 1.2 });
    }
  };

  // Render Station Markers on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    filteredStations.forEach((st) => {
      const lat = st.coordinates?.latitude ?? st.coordinates?.lat;
      const lng = st.coordinates?.longitude ?? st.coordinates?.lng;
      if (lat === undefined || lng === undefined) return;

      const isSelected = selectedStation?.code === st.code;

      const customIcon = L.divIcon({
        className: 'polar-leaflet-marker-wrapper',
        html: `
          <div class="polar-station-marker">
            <div class="polar-marker-pulse ${isSelected ? 'active' : ''}"></div>
            <div class="polar-marker-dot ${isSelected ? 'active' : ''}"></div>
            <div class="polar-marker-badge ${isSelected ? 'active' : ''}">${st.name.split(' ')[0]}</div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      marker.bindPopup(`
        <div style="font-family: inherit; min-width: 170px;">
          <div style="font-weight: 700; font-size: 13px; margin-bottom: 2px; color: ${isDark ? '#38bdf8' : '#0284c7'};">${st.name}</div>
          <div style="font-size: 11px; opacity: 0.8; margin-bottom: 6px;">${st.subRegion || st.region} · Est. ${st.established || st.establishedYear || 'N/A'}</div>
          <div style="display: flex; gap: 8px; font-size: 12px; margin-bottom: 6px;">
            <span>🌡️ <b>${st.currentWeather?.temperature ?? '-'}°C</b></span>
            <span>💨 <b>${st.currentWeather?.windSpeed ?? '-'}</b></span>
          </div>
          <div style="font-size: 11px; color: #10b981; font-weight: 600;">Status: Operational</div>
        </div>
      `, { className: 'polar-leaflet-popup' });

      marker.on('click', () => {
        handleStationSelect(st);
      });

      marker.addTo(markersLayerRef.current);
    });
  }, [filteredStations, selectedStation, isDark]);

  // Polar Geospatial Boundary Overlays based on activeLayer
  useEffect(() => {
    if (!mapInstanceRef.current || !overlaysLayerRef.current) return;
    overlaysLayerRef.current.clearLayers();

    const layerColors = {
      climate: '#1ea7e8',
      ocean: '#0ea5e9',
      ice: '#38bdf8',
      temperature: '#f43f5e',
      atmosphere: '#10b981'
    };
    const color = layerColors[activeLayer] || '#1ea7e8';

    const antarcticCircle = L.circle([-90, 0], {
      radius: 2600000,
      color,
      weight: 1.5,
      dashArray: '6, 6',
      fillColor: color,
      fillOpacity: 0.08
    });

    const arcticCircle = L.circle([90, 0], {
      radius: 2600000,
      color,
      weight: 1.5,
      dashArray: '6, 6',
      fillColor: color,
      fillOpacity: 0.08
    });

    antarcticCircle.addTo(overlaysLayerRef.current);
    arcticCircle.addTo(overlaysLayerRef.current);
  }, [activeLayer]);

  return (
    <div className="polar-map-page w-full min-h-[calc(100vh-80px)] bg-surface-container-lowest flex flex-col">
      {/* 1. TOP HEADER & TELEMETRY STATUS BAR */}
      <div className="border-b border-surface-container-high/80 bg-surface-container-lowest">
        <div className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-primary-container/20 text-primary font-label-sm text-label-sm font-bold uppercase tracking-wider">
                  Sovereign Geospatial Grid
                </span>
                <span className="text-outline font-data-tabular text-label-sm">
                  · WGS-84 / Polar Stereographic
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight m-0">
                Interactive Polar Explorer
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant m-0 mt-1">
                Real-time stations telemetry, environmental layers, and expedition tracks across Antarctica, the Arctic, and the Himalayas.
              </p>
            </div>

            {/* Quick Live Telemetry Indicators */}
            <div className="flex flex-wrap items-center gap-2 font-data-tabular">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low border border-surface-container-high text-on-surface text-label-sm shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-outline font-medium">Telemetry Nodes:</span>
                <span className="font-bold text-on-surface">6 Active</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low border border-surface-container-high text-on-surface text-label-sm shadow-2xs">
                <Thermometer size={14} className="text-primary" />
                <span className="text-outline font-medium">Bharati:</span>
                <span className="font-bold text-on-surface">-18.4°C</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low border border-surface-container-high text-on-surface text-label-sm shadow-2xs">
                <Snowflake size={14} className="text-sky-400" />
                <span className="text-outline font-medium">Himadri:</span>
                <span className="font-bold text-on-surface">-6.8°C</span>
              </div>
            </div>
          </div>

          {/* Region Tabs & Search Row */}
          <div className="mt-4 pt-3 border-t border-surface-container-high/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Domain Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              {regionsList.map((reg) => {
                const Icon = reg.icon;
                const isActive = selectedRegion === reg.id;
                return (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => handleRegionSelect(reg.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-title-md text-body-sm font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-primary-container text-surface-container-lowest shadow-2xs'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{reg.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Filter Search */}
            <div className="relative max-w-xs w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find station, basin, sensor…"
                className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container text-label-md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. LAYER CONTROLS BAR */}
      <div className="bg-surface-container-low/80 border-b border-surface-container-high/70 backdrop-blur-sm sticky top-16 z-30">
        <div className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-2 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-outline shrink-0 hidden sm:inline">
              Data Layers:
            </span>
            <div className="flex items-center gap-1.5">
              {layersList.map((layer) => {
                const Icon = layer.icon;
                const isCurrent = activeLayer === layer.id;
                return (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={() => setActiveLayer(layer.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-label-md text-label-md transition-all ${
                      isCurrent
                        ? 'bg-surface-container-lowest text-primary border border-primary/30 shadow-2xs font-bold'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    <Icon size={15} style={{ color: layer.color }} />
                    <span>{layer.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {currentLayerData?.globalMetrics && (
            <div className="hidden xl:flex items-center gap-4 text-label-sm font-data-tabular text-on-surface-variant">
              {Object.entries(currentLayerData.globalMetrics).slice(0, 2).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="font-semibold text-on-surface">{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. MAIN MAP WORKSPACE (CANVAS + STATION DRAWER) */}
      <div className="max-w-[1440px] w-full mx-auto px-margin-sm lg:px-margin-lg py-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Map Viewport (8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="polar-map-canvas-container relative rounded-2xl overflow-hidden border border-surface-container-high/80 bg-surface-container shadow-sm min-h-[520px] flex flex-col">
            {/* Real Interactive Leaflet Geospatial Canvas */}
            <div className="relative w-full h-[520px] bg-slate-950 overflow-hidden select-none">
              <div ref={mapContainerRef} className="w-full h-full" />

              {/* Map Layer Overlay Info Pill */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-sky-400/30 text-white font-label-sm text-[11px] uppercase tracking-wider shadow-md pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                <span>Active Layer: <strong>{layersList.find((l) => l.id === activeLayer)?.label}</strong></span>
              </div>

              {/* Map Controls: Global Reset View */}
              <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRegionSelect('All')}
                  className="px-3 py-1.5 rounded-lg bg-slate-900/85 hover:bg-slate-800 text-sky-300 border border-sky-400/30 text-xs font-semibold backdrop-blur-md transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Globe2 size={13} />
                  <span>Reset Global View</span>
                </button>
              </div>

              {/* Map Footer Metadata Overlay */}
              <div className="absolute bottom-4 right-4 z-20 hidden sm:flex items-center gap-3 px-3 py-1 rounded-md bg-slate-950/80 backdrop-blur-sm border border-slate-800 text-slate-300 text-[11px] font-data-tabular pointer-events-none">
                <span>MoES / NCPOR Geospatial Telemetry</span>
                <span className="text-sky-400 font-semibold">Leaflet v1.9</span>
              </div>
            </div>

            {/* Layer Data Highlights Bar below Canvas */}
            {currentLayerData && (
              <div className="p-4 bg-surface-container-lowest border-t border-surface-container-high/80">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary-container/20 text-primary shrink-0 mt-0.5">
                    <Info size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-title-md text-label-md font-bold text-on-surface m-0">
                        {currentLayerData.name} Overview
                      </h4>
                      <span className="text-label-sm text-outline font-data-tabular">
                        Real-time Sensor Interpolation
                      </span>
                    </div>
                    <p className="font-body-sm text-label-sm text-on-surface-variant m-0 mb-3 leading-relaxed">
                      {currentLayerData.summary}
                    </p>

                    {/* Zone Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      {currentLayerData.zones?.map((zone) => (
                        <div
                          key={zone.name}
                          className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container-high flex flex-col justify-between"
                        >
                          <span className="font-label-sm text-[11px] text-outline font-semibold line-clamp-1">
                            {zone.name}
                          </span>
                          <span className="font-title-md text-body-sm font-bold text-on-surface mt-1">
                            {zone.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Connected Research Projects Section */}
          <div className="rounded-2xl border border-surface-container-high/80 bg-surface-container-lowest p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <Radio size={18} className="text-primary" />
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold m-0">
                  Active Field Expeditions &amp; Campaigns
                </h3>
              </div>
              <Link
                to="/expeditions"
                className="font-label-sm text-primary hover:underline flex items-center gap-1 font-semibold"
              >
                <span>View All 58 Expeditions</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high hover:border-primary/40 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-surface-container-high text-on-surface-variant font-data-tabular">
                        {proj.code}
                      </span>
                      <span className="text-[11px] font-semibold text-primary">
                        {proj.region}
                      </span>
                    </div>
                    <h4 className="font-title-md text-body-sm font-bold text-on-surface line-clamp-2 mb-1">
                      {proj.title}
                    </h4>
                    <p className="font-body-sm text-label-sm text-on-surface-variant line-clamp-2 m-0 mb-2">
                      {proj.summary}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-outline pt-2 border-t border-surface-container-high/60">
                    <span>Base: {proj.station}</span>
                    <span className="font-semibold text-emerald-600">{proj.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Station Telemetry Inspector (4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {selectedStation ? (
            <div className="station-inspector-card rounded-2xl border border-surface-container-high/80 bg-surface-container-lowest p-5 shadow-sm flex flex-col gap-5 sticky top-28">
              {/* Header with image */}
              <div className="relative rounded-xl overflow-hidden h-40 bg-surface-container">
                <img
                  src={selectedStation.image}
                  alt={selectedStation.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3.5 text-white">
                  <span className="inline-block px-2 py-0.5 rounded bg-primary text-[10px] font-bold tracking-wider uppercase mb-1 w-max">
                    {selectedStation.region} · Established {selectedStation.established}
                  </span>
                  <h2 className="font-headline-sm text-headline-sm font-extrabold m-0 leading-tight">
                    {selectedStation.name}
                  </h2>
                  <span className="text-slate-300 text-xs font-data-tabular">
                    {selectedStation.coordinates.latitude}°N, {selectedStation.coordinates.longitude}°E · {selectedStation.elevation}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low border border-surface-container-high">
                <span className="font-label-sm text-label-sm text-outline font-semibold">
                  Station Status
                </span>
                <span className="inline-flex items-center gap-1.5 font-data-tabular text-label-sm font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {selectedStation.status}
                </span>
              </div>

              {/* Current Telemetry Matrix */}
              <div>
                <h4 className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold mb-2">
                  Live Sensor Telemetry
                </h4>
                <div className="grid grid-cols-2 gap-2 font-data-tabular">
                  <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container-high">
                    <span className="text-[11px] text-outline block">Ambient Temp</span>
                    <span className="font-headline-sm text-headline-sm font-bold text-primary">
                      {selectedStation.currentWeather.temperature}°C
                    </span>
                    <span className="text-[10px] text-outline block mt-0.5">
                      Wind Chill: {selectedStation.currentWeather.apparentTemp}°C
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container-high">
                    <span className="text-[11px] text-outline block">Wind Velocity</span>
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                      {selectedStation.currentWeather.windSpeed}
                    </span>
                    <span className="text-[10px] text-outline block mt-0.5">
                      {selectedStation.currentWeather.windDirection}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container-high">
                    <span className="text-[11px] text-outline block">Barometric Press.</span>
                    <span className="font-title-md text-body-md font-bold text-on-surface">
                      {selectedStation.currentWeather.pressure}
                    </span>
                    <span className="text-[10px] text-outline block mt-0.5">
                      Hum: {selectedStation.currentWeather.humidity}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container-high">
                    <span className="text-[11px] text-outline block">Cryo / Ice State</span>
                    <span className="font-title-md text-body-sm font-bold text-on-surface line-clamp-1">
                      {selectedStation.currentWeather.iceThickness}
                    </span>
                    <span className="text-[10px] text-outline block mt-0.5">
                      Rad: {selectedStation.currentWeather.solarRadiation}
                    </span>
                  </div>
                </div>
              </div>

              {/* 24-Hour Telemetry Line Chart */}
              {selectedStation.telemetryHistory && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold m-0">
                      24h Temperature Curve (°C)
                    </h4>
                    <span className="text-[10px] font-data-tabular text-outline">UTC Telemetry</span>
                  </div>
                  <div className="h-36 w-full rounded-xl bg-surface-container-low p-2 border border-surface-container-high">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedStation.telemetryHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#22374d' : '#e2e8f0'} />
                        <XAxis
                          dataKey="time"
                          tick={{ fontSize: 10, fill: isDark ? '#94a9bf' : '#64748b' }}
                        />
                        <YAxis
                          domain={['auto', 'auto']}
                          tick={{ fontSize: 10, fill: isDark ? '#94a9bf' : '#64748b' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDark ? '#0e1a29' : '#ffffff',
                            borderColor: isDark ? '#22374d' : '#cbd5e1',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="temp"
                          name="Temp (°C)"
                          stroke="#1ea7e8"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Scientific Equipment Installed */}
              <div>
                <h4 className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold mb-2">
                  Active Scientific Instrumentation
                </h4>
                <ul className="flex flex-col gap-1.5 m-0 p-0 list-none">
                  {selectedStation.instruments.map((inst) => (
                    <li
                      key={inst}
                      className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-label-sm border border-surface-container-high/60"
                    >
                      <Gauge size={14} className="text-primary shrink-0" />
                      <span className="line-clamp-1">{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Station Description */}
              <p className="font-body-sm text-label-sm text-on-surface-variant leading-relaxed m-0">
                {selectedStation.description}
              </p>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-surface-container-high flex items-center gap-2">
                <Link
                  to={`/stations`}
                  className="flex-1 py-2 px-3 rounded-lg bg-primary-container text-surface-container-lowest font-label-md text-label-md font-semibold text-center hover:bg-primary transition-colors shadow-2xs"
                >
                  View Station Catalogue
                </Link>
                <Link
                  to="/datasets"
                  className="py-2 px-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold border border-surface-container-high transition-colors"
                  title="View linked NetCDF-4 datasets"
                >
                  <ExternalLink size={16} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-surface-container border border-surface-container-high text-center text-outline">
              <Compass size={32} className="mx-auto mb-2 opacity-50" />
              <p className="font-body-sm m-0">Select any polar station pin on the canvas to inspect real-time telemetry.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PolarMapPage;
