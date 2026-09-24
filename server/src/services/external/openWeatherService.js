const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const CACHE_TTL_MS = 5 * 60 * 1000;

let weatherCache = {
  expiresAt: 0,
  values: new Map()
};

async function fetchWeatherBatch(stations, { signal } = {}) {
  const validStations = stations.filter((station) =>
    Number.isFinite(station.coordinates?.latitude) &&
    Number.isFinite(station.coordinates?.longitude)
  );
  if (!validStations.length) return [];

  const url = new URL(OPEN_METEO_URL);
  url.searchParams.set('latitude', validStations.map((station) => station.coordinates.latitude).join(','));
  url.searchParams.set('longitude', validStations.map((station) => station.coordinates.longitude).join(','));
  url.searchParams.set('current', [
    'temperature_2m',
    'relative_humidity_2m',
    'apparent_temperature',
    'precipitation',
    'weather_code',
    'wind_speed_10m',
    'wind_direction_10m',
    'surface_pressure'
  ].join(','));
  url.searchParams.set('wind_speed_unit', 'kmh');
  url.searchParams.set('temperature_unit', 'celsius');
  url.searchParams.set('timezone', 'UTC');

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Open-Meteo request failed with HTTP ${response.status}`);
  }

  const payload = await response.json();
  const forecasts = Array.isArray(payload) ? payload : [payload];
  return validStations.map((station, index) => {
    const current = forecasts[index]?.current || {};
    return {
      code: station.code,
      weather: {
        temperature: current.temperature_2m ?? null,
        apparentTemp: current.apparent_temperature ?? null,
        windSpeed: current.wind_speed_10m ?? null,
        windDirection: current.wind_direction_10m ?? null,
        pressure: current.surface_pressure ?? null,
        humidity: current.relative_humidity_2m ?? null,
        precipitation: current.precipitation ?? null,
        weatherCode: current.weather_code ?? null,
        source: 'Open-Meteo',
        observedAt: new Date().toISOString()
      }
    };
  });
}

async function enrichStationsWithWeather(stations) {
  if (Date.now() < weatherCache.expiresAt) {
    return stations.map((station) => ({
      ...station,
      currentWeather: weatherCache.values.get(station.code) || null,
      weatherStatus: weatherCache.values.has(station.code) ? 'Live' : 'Unavailable'
    }));
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const results = await Promise.allSettled([fetchWeatherBatch(stations, {
    signal: controller.signal
  })]);
  clearTimeout(timeout);

  const values = new Map();
  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value) {
      result.value.forEach(({ code, weather }) => values.set(code, weather));
    } else if (result.status === 'rejected') {
      console.warn('Open-Meteo unavailable for station batch:', result.reason.message);
    }
  });

  weatherCache = {
    expiresAt: Date.now() + CACHE_TTL_MS,
    values
  };

  return stations.map((station) => ({
    ...station,
    currentWeather: values.get(station.code) || null,
    weatherStatus: values.has(station.code) ? 'Live' : 'Unavailable'
  }));
}

module.exports = { enrichStationsWithWeather };
