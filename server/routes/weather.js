import { Router } from 'express';
import { getWeatherData, searchCities } from '../services/weatherService.js';

const router = Router();

/**
 * GET /api/weather
 * Query weather forecast by city name or geocoded coordinates
 * Examples:
 *   /api/weather?q=Tokyo
 *   /api/weather?lat=35.6762&lon=139.6503
 */
router.get('/weather', async (req, res, next) => {
  try {
    const { q, lat, lon } = req.query;

    if (!q && (!lat || !lon)) {
      // Default to New York if no location specified
      const data = await getWeatherData('New York');
      return res.json(data);
    }

    const locationQuery = (lat && lon) ? { lat: parseFloat(lat), lon: parseFloat(lon) } : q;
    const data = await getWeatherData(locationQuery);

    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/weather/search
 * Location autocomplete endpoint
 * Example: /api/weather/search?q=Lond
 */
router.get('/weather/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return res.json([]);
    }

    const suggestions = await searchCities(q.trim());
    res.json(suggestions);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/health
 * Server healthcheck endpoint
 */
router.get('/health', (req, res) => {
  const hasKey = Boolean(process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY || process.env.WEATHERAPI_KEY);
  res.json({
    status: 'ok',
    mode: hasKey ? 'live-api' : 'mock-fallback',
    timestamp: new Date().toISOString()
  });
});

export default router;
