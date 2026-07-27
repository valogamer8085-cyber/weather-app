import { generateMockWeatherPayload, searchMockCities } from './mockWeatherData.js';

const OPENWEATHER_KEY = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY;
const WEATHERAPI_KEY = process.env.WEATHERAPI_KEY;

/**
 * Fetch weather data for given city query or lat/lon coordinates
 */
export async function getWeatherData(queryOrCoords) {
  // If API key is available, attempt live fetch; otherwise use fallback
  if (OPENWEATHER_KEY) {
    try {
      const liveData = await fetchOpenWeatherMap(queryOrCoords);
      if (liveData) return liveData;
    } catch (err) {
      console.warn('[WeatherService] OpenWeatherMap fetch failed, falling back to mock data:', err.message);
    }
  }

  if (WEATHERAPI_KEY) {
    try {
      const liveData = await fetchWeatherAPI(queryOrCoords);
      if (liveData) return liveData;
    } catch (err) {
      console.warn('[WeatherService] WeatherAPI fetch failed, falling back to mock data:', err.message);
    }
  }

  // Fallback engine
  return generateMockWeatherPayload(queryOrCoords);
}

/**
 * City Search Autocomplete suggestions
 */
export async function searchCities(query) {
  if (!query || query.trim().length === 0) return [];

  if (WEATHERAPI_KEY) {
    try {
      const res = await fetch(`https://api.weatherapi.com/v1/search.json?key=${WEATHERAPI_KEY}&q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        return data.map(item => ({
          name: item.name,
          country: item.country || item.region,
          lat: item.lat,
          lon: item.lon
        }));
      }
    } catch (err) {
      console.warn('[WeatherService] Search API failed, using mock search:', err.message);
    }
  }

  return searchMockCities(query);
}

/**
 * OpenWeatherMap API Adapter
 */
async function fetchOpenWeatherMap(queryOrCoords) {
  let param = '';
  if (typeof queryOrCoords === 'object' && queryOrCoords.lat && queryOrCoords.lon) {
    param = `lat=${queryOrCoords.lat}&lon=${queryOrCoords.lon}`;
  } else if (typeof queryOrCoords === 'string') {
    param = `q=${encodeURIComponent(queryOrCoords)}`;
  } else {
    return null;
  }

  const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?${param}&units=metric&appid=${OPENWEATHER_KEY}`);
  if (!currentRes.ok) throw new Error(`OpenWeather API returned ${currentRes.status}`);

  const current = await currentRes.json();

  // Try 5 day / 3 hour forecast
  const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?${param}&units=metric&appid=${OPENWEATHER_KEY}`);
  const forecast = forecastRes.ok ? await forecastRes.json() : null;

  // Format standard payload structure matching our app UI requirements
  return formatOpenWeatherPayload(current, forecast);
}

function formatOpenWeatherPayload(current, forecast) {
  const mainCond = current.weather?.[0]?.main || 'Clear';
  const iconMap = {
    Clear: 'sun',
    Clouds: 'cloud',
    Rain: 'cloud-rain',
    Drizzle: 'cloud-rain',
    Thunderstorm: 'cloud-lightning',
    Snow: 'snowflake',
    Mist: 'cloud-fog',
    Fog: 'cloud-fog'
  };

  const hourly = (forecast?.list || []).slice(0, 24).map(item => {
    const d = new Date(item.dt * 1000);
    return {
      time: `${d.getHours().toString().padStart(2, '0')}:00`,
      temp: Math.round(item.main.temp),
      feelsLike: Math.round(item.main.feels_like),
      condition: item.weather[0]?.main || 'Clear',
      icon: iconMap[item.weather[0]?.main] || 'sun',
      precipChance: Math.round((item.pop || 0) * 100),
      humidity: item.main.humidity,
      windSpeed: Math.round(item.wind.speed * 3.6) // m/s to km/h
    };
  });

  return {
    isMock: false,
    location: {
      name: current.name,
      country: current.sys?.country || '',
      lat: current.coord.lat,
      lon: current.coord.lon
    },
    current: {
      temp: Math.round(current.main.temp),
      feelsLike: Math.round(current.main.feels_like),
      tempMin: Math.round(current.main.temp_min),
      tempMax: Math.round(current.main.temp_max),
      condition: mainCond,
      conditionText: current.weather[0]?.description || mainCond,
      icon: iconMap[mainCond] || 'sun',
      humidity: current.main.humidity,
      windSpeed: Math.round(current.wind.speed * 3.6),
      windDeg: current.wind.deg || 0,
      pressure: current.main.pressure,
      uvIndex: 5,
      visibility: Math.round((current.visibility || 10000) / 1000),
      dewPoint: Math.round(current.main.temp - (100 - current.main.humidity) / 5),
      solar: {
        sunrise: new Date(current.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sunset: new Date(current.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    },
    airQuality: {
      aqi: 2,
      level: 'Moderate',
      color: '#f59e0b',
      advice: 'Air quality is acceptable for outdoor activity.',
      pollutants: { pm2_5: 14, pm10: 28, o3: 40, no2: 15, so2: 4, co: 0.5 }
    },
    hourly: hourly.length ? hourly : generateMockWeatherPayload(current.name).hourly,
    daily: generateMockWeatherPayload(current.name).daily,
    updatedAt: new Date().toISOString()
  };
}

/**
 * WeatherAPI.com Adapter
 */
async function fetchWeatherAPI(queryOrCoords) {
  let param = '';
  if (typeof queryOrCoords === 'object' && queryOrCoords.lat && queryOrCoords.lon) {
    param = `${queryOrCoords.lat},${queryOrCoords.lon}`;
  } else {
    param = encodeURIComponent(queryOrCoords);
  }

  const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${WEATHERAPI_KEY}&q=${param}&days=7&aqi=yes`);
  if (!res.ok) throw new Error(`WeatherAPI returned ${res.status}`);

  const data = await res.json();
  return formatWeatherAPIPayload(data);
}

function formatWeatherAPIPayload(data) {
  const current = data.current;
  const location = data.location;
  const forecastDays = data.forecast?.forecastday || [];

  return {
    isMock: false,
    location: {
      name: location.name,
      country: location.country,
      lat: location.lat,
      lon: location.lon
    },
    current: {
      temp: Math.round(current.temp_c),
      feelsLike: Math.round(current.feelslike_c),
      tempMin: Math.round(forecastDays[0]?.day.mintemp_c || current.temp_c - 3),
      tempMax: Math.round(forecastDays[0]?.day.maxtemp_c || current.temp_c + 3),
      condition: current.condition.text,
      conditionText: current.condition.text,
      icon: getIconFromCode(current.condition.code),
      humidity: current.humidity,
      windSpeed: Math.round(current.wind_kph),
      windDeg: current.wind_degree,
      windDirection: current.wind_dir,
      pressure: current.pressure_mb,
      uvIndex: current.uv,
      visibility: current.vis_km,
      solar: {
        sunrise: forecastDays[0]?.astro.sunrise || '06:00 AM',
        sunset: forecastDays[0]?.astro.sunset || '08:00 PM'
      }
    },
    airQuality: {
      aqi: current.air_quality ? Math.min(5, Math.max(1, current.air_quality['us-epa-index'] || 1)) : 1,
      level: 'Moderate',
      color: '#f59e0b',
      advice: 'Air quality is acceptable.',
      pollutants: {
        pm2_5: Math.round(current.air_quality?.pm2_5 || 12),
        pm10: Math.round(current.air_quality?.pm10 || 22),
        o3: Math.round(current.air_quality?.o3 || 35),
        no2: Math.round(current.air_quality?.no2 || 15),
        so2: Math.round(current.air_quality?.so2 || 3),
        co: Math.round(current.air_quality?.co || 0.4)
      }
    },
    hourly: (forecastDays[0]?.hour || []).map(h => ({
      time: h.time.split(' ')[1],
      temp: Math.round(h.temp_c),
      feelsLike: Math.round(h.feelslike_c),
      condition: h.condition.text,
      icon: getIconFromCode(h.condition.code),
      precipChance: h.chance_of_rain || h.chance_of_snow || 0,
      humidity: h.humidity,
      windSpeed: Math.round(h.wind_kph)
    })),
    daily: forecastDays.map(fd => ({
      day: new Date(fd.date).toLocaleDateString('en-US', { weekday: 'short' }),
      date: fd.date,
      condition: fd.day.condition.text,
      icon: getIconFromCode(fd.day.condition.code),
      maxTemp: Math.round(fd.day.maxtemp_c),
      minTemp: Math.round(fd.day.mintemp_c),
      precipChance: fd.day.daily_chance_of_rain || 0,
      uvIndex: fd.day.uv
    })),
    updatedAt: new Date().toISOString()
  };
}

function getIconFromCode(code) {
  if ([1000].includes(code)) return 'sun';
  if ([1003, 1006].includes(code)) return 'cloud-sun';
  if ([1009, 1030, 1135].includes(code)) return 'cloud';
  if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240].includes(code)) return 'cloud-rain';
  if ([1087, 1273, 1276].includes(code)) return 'cloud-lightning';
  if ([1066, 1114, 1210, 1213, 1216, 1219, 1222, 1225].includes(code)) return 'snowflake';
  return 'cloud-sun';
}
