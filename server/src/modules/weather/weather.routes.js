import { Router } from 'express';
import { getCurrentWeather, getWeatherForecast, getWeatherHistory } from './weather.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/farm/:farmId/current', getCurrentWeather);
router.get('/farm/:farmId/forecast', getWeatherForecast);
router.get('/farm/:farmId/history', getWeatherHistory);

export default router;
