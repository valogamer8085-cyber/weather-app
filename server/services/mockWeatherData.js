/**
 * Comprehensive Mock Weather Data Generator
 * Provides hyper-realistic weather data for worldwide cities and arbitrary coordinates
 */

const POPULAR_CITIES = [
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, temp: 24, condition: 'Clear', conditionText: 'Sunny & Clear', icon: 'sun', aqi: 1 },
  { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060, temp: 19, condition: 'Clouds', conditionText: 'Partly Cloudy', icon: 'cloud-sun', aqi: 2 },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278, temp: 15, condition: 'Rain', conditionText: 'Light Drizzle', icon: 'cloud-rain', aqi: 1 },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, temp: 18, condition: 'Clouds', conditionText: 'Overcast', icon: 'cloud', aqi: 2 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, temp: 22, condition: 'Clear', conditionText: 'Mostly Clear', icon: 'sun', aqi: 1 },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777, temp: 31, condition: 'Thunderstorm', conditionText: 'Scattered Thunderstorms', icon: 'cloud-lightning', aqi: 4 },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357, temp: 35, condition: 'Clear', conditionText: 'Sunny & Hot', icon: 'sun', aqi: 3 },
  { name: 'Reykjavik', country: 'Iceland', lat: 64.1466, lon: -21.9426, temp: 4, condition: 'Snow', conditionText: 'Light Flurries', icon: 'snowflake', aqi: 1 },
  { name: 'San Francisco', country: 'United States', lat: 37.7749, lon: -122.4194, temp: 17, condition: 'Clouds', conditionText: 'Morning Fog & Clouds', icon: 'cloud-fog', aqi: 1 },
  { name: 'Berlin', country: 'Germany', lat: 52.5200, lon: 13.4050, temp: 16, condition: 'Rain', conditionText: 'Showers', icon: 'cloud-rain', aqi: 2 },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832, temp: 14, condition: 'Clear', conditionText: 'Crisp & Clear', icon: 'sun', aqi: 1 },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, temp: 30, condition: 'Thunderstorm', conditionText: 'Tropical Storms', icon: 'cloud-lightning', aqi: 2 },
  { name: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708, temp: 38, condition: 'Clear', conditionText: 'Intense Sunshine', icon: 'sun', aqi: 3 }
];

/**
 * String hash for deterministic mock values per city name
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Autocomplete search mock service
 */
export function searchMockCities(query) {
  if (!query || query.trim().length === 0) return [];
  const q = query.trim().toLowerCase();

  const matched = POPULAR_CITIES.filter(c =>
    c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
  );

  if (matched.length > 0) return matched;

  // Generate fallback matching item for custom queries
  const capitalized = query.charAt(0).toUpperCase() + query.slice(1);
  return [
    {
      name: capitalized,
      country: 'Global Location',
      lat: 40.0 + (hashString(capitalized) % 20),
      lon: -70.0 + (hashString(capitalized) % 40),
      temp: 18 + (hashString(capitalized) % 15),
      condition: 'Clear',
      conditionText: 'Mostly Clear',
      icon: 'sun',
      aqi: 1 + (hashString(capitalized) % 3)
    }
  ];
}

/**
 * AQI descriptions and recommendation helper
 */
function getAQIDetails(aqiScore) {
  switch (aqiScore) {
    case 1:
      return { level: 'Good', color: '#10b981', advice: 'Air quality is satisfactory. Ideal for outdoor activities.' };
    case 2:
      return { level: 'Moderate', color: '#f59e0b', advice: 'Air quality is acceptable. Sensitive individuals should limit prolonged outdoor exertion.' };
    case 3:
      return { level: 'Unhealthy for Sensitive Groups', color: '#f97316', advice: 'General public unlikely to be affected; sensitive groups may experience irritation.' };
    case 4:
      return { level: 'Unhealthy', color: '#ef4444', advice: 'Everyone may begin to experience health effects. Wear a mask outdoors.' };
    case 5:
      return { level: 'Hazardous', color: '#8b5cf6', advice: 'Emergency health warning. Avoid all outdoor activities.' };
    default:
      return { level: 'Good', color: '#10b981', advice: 'Air quality is good.' };
  }
}

/**
 * Generate full mock weather payload
 */
export function generateMockWeatherPayload(queryOrCoords) {
  let cityName = 'New York';
  let countryName = 'United States';
  let lat = 40.7128;
  let lon = -74.0060;

  if (typeof queryOrCoords === 'object' && queryOrCoords.lat && queryOrCoords.lon) {
    lat = parseFloat(queryOrCoords.lat);
    lon = parseFloat(queryOrCoords.lon);
    cityName = queryOrCoords.name || `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
    countryName = queryOrCoords.country || 'Geocoded Coordinates';
  } else if (typeof queryOrCoords === 'string' && queryOrCoords.trim().length > 0) {
    const match = POPULAR_CITIES.find(c => c.name.toLowerCase() === queryOrCoords.trim().toLowerCase());
    if (match) {
      cityName = match.name;
      countryName = match.country;
      lat = match.lat;
      lon = match.lon;
    } else {
      cityName = queryOrCoords.trim().charAt(0).toUpperCase() + queryOrCoords.trim().slice(1);
      countryName = 'International Region';
      lat = 20.0 + (hashString(cityName) % 50);
      lon = -100.0 + (hashString(cityName) % 180);
    }
  }

  const seed = hashString(cityName);
  const baseTemp = 10 + (seed % 22); // 10°C to 32°C range
  const conditionsPool = ['Clear', 'Clouds', 'Rain', 'Snow', 'Thunderstorm'];
  const condition = conditionsPool[seed % conditionsPool.length];

  let conditionText = 'Sunny & Clear';
  let icon = 'sun';
  let precipBase = 5;

  if (condition === 'Clouds') {
    conditionText = seed % 2 === 0 ? 'Partly Cloudy' : 'Overcast';
    icon = seed % 2 === 0 ? 'cloud-sun' : 'cloud';
    precipBase = 20;
  } else if (condition === 'Rain') {
    conditionText = seed % 2 === 0 ? 'Moderate Rain' : 'Light Drizzle';
    icon = 'cloud-rain';
    precipBase = 75;
  } else if (condition === 'Snow') {
    conditionText = 'Light Snow Flurries';
    icon = 'snowflake';
    precipBase = 60;
  } else if (condition === 'Thunderstorm') {
    conditionText = 'Heavy Thunderstorm & Rain';
    icon = 'cloud-lightning';
    precipBase = 90;
  }

  const humidity = 40 + (seed % 45);
  const windSpeed = 8 + (seed % 24);
  const windDeg = (seed * 37) % 360;
  const pressure = 1008 + (seed % 18);
  const uvIndex = condition === 'Clear' ? 6 + (seed % 4) : 2 + (seed % 3);
  const aqiScore = 1 + (seed % 4);
  const aqiDetails = getAQIDetails(aqiScore);

  // Generate 24 hourly points
  const now = new Date();
  const currentHour = now.getHours();
  const hourly = [];

  for (let i = 0; i < 24; i++) {
    const hourVal = (currentHour + i) % 24;
    const hourLabel = `${hourVal.toString().padStart(2, '0')}:00`;

    // Temperature curve variation (cooler at night, warmer at 14:00)
    const diurnalFactor = Math.sin(((hourVal - 6) / 24) * Math.PI * 2);
    const tempVar = Math.round(baseTemp + (diurnalFactor * 4) + ((i % 3) - 1));
    const precipChance = Math.min(100, Math.max(0, precipBase + Math.floor(Math.sin(i) * 20)));

    let hourCondition = condition;
    let hourIcon = icon;
    if (precipChance > 70) {
      hourCondition = 'Rain';
      hourIcon = 'cloud-rain';
    } else if (hourVal >= 20 || hourVal < 6) {
      if (condition === 'Clear') hourIcon = 'moon';
    }

    hourly.push({
      time: hourLabel,
      timestamp: new Date(now.getTime() + i * 3600000).toISOString(),
      temp: tempVar,
      feelsLike: tempVar - 1,
      condition: hourCondition,
      icon: hourIcon,
      precipChance,
      humidity: Math.min(95, humidity + (i % 5)),
      windSpeed: Math.round(windSpeed + Math.sin(i) * 3)
    });
  }

  // Generate 7-day forecast
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const daily = [];

  for (let d = 0; d < 7; d++) {
    const forecastDate = new Date(now.getTime() + d * 86400000);
    const dayName = d === 0 ? 'Today' : daysOfWeek[forecastDate.getDay()];
    const dateStr = `${forecastDate.toLocaleString('en-US', { month: 'short' })} ${forecastDate.getDate()}`;
    const daySeed = seed + d * 17;
    const dayCondition = conditionsPool[daySeed % conditionsPool.length];

    const maxTemp = Math.round(baseTemp + 3 + (daySeed % 4));
    const minTemp = Math.round(baseTemp - 4 - (daySeed % 3));
    let dayIcon = 'sun';

    if (dayCondition === 'Clouds') dayIcon = 'cloud-sun';
    else if (dayCondition === 'Rain') dayIcon = 'cloud-rain';
    else if (dayCondition === 'Snow') dayIcon = 'snowflake';
    else if (dayCondition === 'Thunderstorm') dayIcon = 'cloud-lightning';

    daily.push({
      day: dayName,
      date: dateStr,
      condition: dayCondition,
      icon: dayIcon,
      maxTemp,
      minTemp,
      precipChance: (daySeed % 8) * 12,
      uvIndex: Math.min(11, Math.max(1, 3 + (daySeed % 7))),
      windSpeed: 10 + (daySeed % 15),
      humidity: 50 + (daySeed % 35)
    });
  }

  return {
    isMock: true,
    location: {
      name: cityName,
      country: countryName,
      lat,
      lon,
      timezone: 'UTC'
    },
    current: {
      temp: Math.round(baseTemp),
      feelsLike: Math.round(baseTemp - 1),
      tempMin: Math.round(baseTemp - 3),
      tempMax: Math.round(baseTemp + 4),
      condition,
      conditionText,
      icon,
      humidity,
      windSpeed,
      windDeg,
      windDirection: getWindDirection(windDeg),
      pressure,
      uvIndex,
      visibility: 10, // km
      dewPoint: Math.round(baseTemp - (100 - humidity) / 5),
      solar: {
        sunrise: '06:15 AM',
        sunset: '08:30 PM',
        progressPct: calculateSunProgress()
      }
    },
    airQuality: {
      aqi: aqiScore,
      level: aqiDetails.level,
      color: aqiDetails.color,
      advice: aqiDetails.advice,
      pollutants: {
        pm2_5: 12 + (seed % 15),
        pm10: 25 + (seed % 20),
        o3: 45 + (seed % 25),
        no2: 18 + (seed % 10),
        so2: 5 + (seed % 5),
        co: 0.4 + ((seed % 5) / 10)
      }
    },
    hourly,
    daily,
    updatedAt: new Date().toISOString()
  };
}

function getWindDirection(deg) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round(deg / 22.5) % 16];
}

function calculateSunProgress() {
  const now = new Date();
  const hours = now.getHours() + now.getMinutes() / 60;
  const sunriseHours = 6.25; // 06:15
  const sunsetHours = 20.5;  // 20:30

  if (hours < sunriseHours) return 0;
  if (hours > sunsetHours) return 100;
  return Math.round(((hours - sunriseHours) / (sunsetHours - sunriseHours)) * 100);
}
