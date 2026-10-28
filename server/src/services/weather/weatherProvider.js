import axios from 'axios';
import { WeatherData } from '../../models/WeatherData.js';
import { logger } from '../../utils/logger.js';

// Map WMO Weather Interpretation Codes (WW)
const WMO_CODES = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snowfall',
  73: 'Moderate snowfall',
  75: 'Heavy snowfall',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail'
};

export const getConditionName = (code) => {
  return WMO_CODES[code] || 'Variable conditions';
};

export const fetchWeatherForFarm = async (farm) => {
  const latitude = farm.location?.latitude || 28.6139; // Default to India lat/lng if not specified
  const longitude = farm.location?.longitude || 77.2090;

  // 1. Check database cache
  const cached = await WeatherData.findOne({
    farmId: farm._id,
    expiresAt: { $gt: new Date() }
  }).sort({ fetchedAt: -1 });

  if (cached) {
    logger.debug(`Returning cached weather data for farm ${farm._id}`);
    return { data: cached, isCached: true };
  }

  // 2. Query Open-Meteo API
  try {
    const url = 'https://api.open-meteo.com/v1/forecast';
    const params = {
      latitude,
      longitude,
      current: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
      hourly: 'temperature_2m,precipitation_probability,relative_humidity_2m',
      timezone: 'auto'
    };

    const response = await axios.get(url, { params, timeout: 6000 });
    const { current, daily, hourly } = response.data;

    const weatherCode = current.weather_code;
    const condition = getConditionName(weatherCode);

    // Format daily forecast (next 7 days)
    const formattedForecast = daily.time.map((dateStr, idx) => ({
      date: dateStr,
      tempMax: daily.temperature_2m_max[idx],
      tempMin: daily.temperature_2m_min[idx],
      precipitationProbability: daily.precipitation_probability_max[idx],
      precipitationSum: daily.precipitation_sum[idx],
      windSpeedMax: daily.wind_speed_10m_max[idx],
      weatherCode: daily.weather_code[idx],
      condition: getConditionName(daily.weather_code[idx])
    }));

    // Format hourly forecast (next 24 hours)
    const formattedHourly = (hourly.time || []).slice(0, 24).map((timeStr, idx) => ({
      time: timeStr,
      temperature: hourly.temperature_2m[idx],
      precipitationProbability: hourly.precipitation_probability[idx],
      humidity: hourly.relative_humidity_2m[idx]
    }));

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 mins TTL

    const weatherRecord = await WeatherData.create({
      farmId: farm._id,
      ownerId: farm.ownerId,
      provider: 'Open-Meteo',
      coordinates: { latitude, longitude },
      current: {
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        precipitation: current.precipitation,
        weatherCode,
        condition
      },
      forecast: formattedForecast,
      hourly: formattedHourly,
      fetchedAt: now,
      expiresAt
    });

    return { data: weatherRecord, isCached: false };
  } catch (error) {
    logger.warn(`Open-Meteo request failed: ${error.message}. Checking stale cache or providing fallback.`);

    // Check if any prior cached record exists
    const stale = await WeatherData.findOne({ farmId: farm._id }).sort({ fetchedAt: -1 });
    if (stale) {
      return { data: stale, isCached: true, isStale: true, notice: 'Showing last known forecast (Network offline)' };
    }

    // Default graceful synthetic fallback so application UI remains fully functional
    const fallbackRecord = {
      farmId: farm._id,
      provider: 'Open-Meteo (Offline Mode)',
      coordinates: { latitude, longitude },
      current: {
        temperature: 28,
        humidity: 62,
        windSpeed: 12,
        precipitation: 0,
        weatherCode: 1,
        condition: 'Mainly clear'
      },
      forecast: [
        { date: new Date().toISOString().split('T')[0], tempMax: 32, tempMin: 22, precipitationProbability: 10, precipitationSum: 0, condition: 'Mainly clear' },
        { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], tempMax: 33, tempMin: 23, precipitationProbability: 15, precipitationSum: 0, condition: 'Partly cloudy' }
      ],
      hourly: [],
      fetchedAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    };

    return { data: fallbackRecord, isCached: false, isFallback: true };
  }
};
