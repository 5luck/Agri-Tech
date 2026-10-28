import { Farm } from '../../models/Farm.js';
import { WeatherData } from '../../models/WeatherData.js';
import { fetchWeatherForFarm } from '../../services/weather/weatherProvider.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

export const getCurrentWeather = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.farmId);
    if (!farm) return sendError(res, 'Farm not found', 404);

    const result = await fetchWeatherForFarm(farm);
    return sendSuccess(res, {
      current: result.data.current,
      coordinates: result.data.coordinates,
      provider: result.data.provider,
      fetchedAt: result.data.fetchedAt,
      expiresAt: result.data.expiresAt,
      isCached: result.isCached,
      isStale: result.isStale || false,
      notice: result.notice || null
    }, 'Current weather retrieved');
  } catch (err) {
    next(err);
  }
};

export const getWeatherForecast = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.farmId);
    if (!farm) return sendError(res, 'Farm not found', 404);

    const result = await fetchWeatherForFarm(farm);
    return sendSuccess(res, {
      forecast: result.data.forecast,
      hourly: result.data.hourly,
      current: result.data.current,
      coordinates: result.data.coordinates,
      provider: result.data.provider,
      fetchedAt: result.data.fetchedAt,
      isCached: result.isCached,
      isStale: result.isStale || false,
      notice: result.notice || null
    }, 'Weather forecast retrieved');
  } catch (err) {
    next(err);
  }
};

export const getWeatherHistory = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.farmId);
    if (!farm) return sendError(res, 'Farm not found', 404);

    const history = await WeatherData.find({ farmId: farm._id })
      .sort({ fetchedAt: -1 })
      .limit(10);

    return sendSuccess(res, history, 'Weather history retrieved');
  } catch (err) {
    next(err);
  }
};
