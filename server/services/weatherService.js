import { generateMockWeatherPayload, searchMockCities } from './mockWeatherData.js';

const OPENWEATHER_KEY = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY;
const WEATHERAPI_KEY = process.env.WEATHERAPI_KEY;

/**
 * Fetch weather data for given city query or lat/lon coordinates
 * Tries OpenWeather, WeatherAPI, Open-Meteo Live Free API, and fallback mock engine
 */
export async function getWeatherData(queryOrCoords) {
  // 1. OpenWeather API (if key present)
  if (OPENWEATHER_KEY) {
    try {
      const liveData = await fetchOpenWeatherMap(queryOrCoords);
      if (liveData) return liveData;
    } catch (err) {
      console.warn('[WeatherService] OpenWeatherMap fetch failed, falling back:', err.message);
    }
  }

  // 2. WeatherAPI.com (if key present)
  if (WEATHERAPI_KEY) {
    try {
      const liveData = await fetchWeatherAPI(queryOrCoords);
      if (liveData) return liveData;
    } catch (err) {
      console.warn('[WeatherService] WeatherAPI fetch failed, falling back:', err.message);
    }
  }

  // 3. Open-Meteo Free Live Weather API (Keyless global weather for any state/continent on Earth)
  try {
    const liveData = await fetchOpenMeteo(queryOrCoords);
    if (liveData) return liveData;
  } catch (err) {
    console.warn('[WeatherService] Open-Meteo fetch failed, using fallback engine:', err.message);
  }

  // 4. Fallback engine
  return generateMockWeatherPayload(queryOrCoords);
}

/**
 * City, State & Continent Search Autocomplete suggestions
 */
export async function searchCities(query) {
  if (!query || query.trim().length === 0) return [];

  // WeatherAPI search if key present
  if (WEATHERAPI_KEY) {
    try {
      const res = await fetch(`https://api.weatherapi.com/v1/search.json?key=${WEATHERAPI_KEY}&q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          return data.map(item => ({
            name: item.name,
            country: item.country || item.region,
            lat: item.lat,
            lon: item.lon
          }));
        }
      }
    } catch (err) {
      console.warn('[WeatherService] Search API failed:', err.message);
    }
  }

  // Open-Meteo Geocoding Search (No API Key Required - Global coverage for all states & continents)
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results.map(item => ({
          name: item.admin1 ? `${item.name}, ${item.admin1}` : item.name,
          country: item.country || item.admin1 || '',
          lat: item.latitude,
          lon: item.longitude
        }));
      }
    }
  } catch (err) {
    console.warn('[WeatherService] Open-Meteo search failed:', err.message);
  }

  return searchMockCities(query);
}

/**
 * Open-Meteo Keyless Global Weather Adapter
 */
async function fetchOpenMeteo(queryOrCoords) {
  let lat, lon, name, country;

  if (typeof queryOrCoords === 'object' && queryOrCoords.lat && queryOrCoords.lon) {
    lat = queryOrCoords.lat;
    lon = queryOrCoords.lon;
    name = queryOrCoords.name || 'Current Location';
    country = queryOrCoords.country || '';
  } else if (typeof queryOrCoords === 'string') {
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(queryOrCoords)}&count=1&language=en&format=json`);
    if (!geoRes.ok) return null;
    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) return null;

    const first = geoData.results[0];
    lat = first.latitude;
    lon = first.longitude;
    name = first.name;
    country = first.country || first.admin1 || '';
  } else {
    return null;
  }

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,precipitation_probability,weather_code,surface_pressure,visibility,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto`;

  const weatherRes = await fetch(weatherUrl);
  if (!weatherRes.ok) return null;
  const data = await weatherRes.json();

  return formatOpenMeteoPayload(data, { name, country, lat, lon });
}

function formatOpenMeteoPayload(data, meta) {
  const current = data.current || {};
  const daily = data.daily || {};
  const hourly = data.hourly || {};

  const weatherCode = current.weather_code || 0;
  const icon = getWmoIcon(weatherCode);

  const hourlyList = (hourly.time || []).slice(0, 24).map((t, index) => {
    const timeStr = t.includes('T') ? t.split('T')[1] : t;
    return {
      time: timeStr.substring(0, 5),
      temp: Math.round(hourly.temperature_2m?.[index] ?? 20),
      feelsLike: Math.round(hourly.temperature_2m?.[index] ?? 20),
      condition: getWmoConditionText(hourly.weather_code?.[index] ?? 0),
      icon: getWmoIcon(hourly.weather_code?.[index] ?? 0),
      precipChance: Math.round(hourly.precipitation_probability?.[index] ?? 0),
      humidity: Math.round(hourly.relative_humidity_2m?.[index] ?? 50),
      windSpeed: Math.round(hourly.wind_speed_10m?.[index] ?? 10)
    };
  });

  const dailyList = (daily.time || []).slice(0, 7).map((dStr, index) => ({
    day: new Date(dStr).toLocaleDateString('en-US', { weekday: 'short' }),
    date: dStr,
    condition: getWmoConditionText(daily.weather_code?.[index] ?? 0),
    icon: getWmoIcon(daily.weather_code?.[index] ?? 0),
    maxTemp: Math.round(daily.temperature_2m_max?.[index] ?? 24),
    minTemp: Math.round(daily.temperature_2m_min?.[index] ?? 14),
    precipChance: Math.round(daily.precipitation_probability_max?.[index] ?? 0),
    uvIndex: Math.round(daily.uv_index_max?.[index] ?? 5)
  }));

  return {
    isMock: false,
    location: {
      name: meta.name,
      country: meta.country,
      lat: meta.lat,
      lon: meta.lon
    },
    current: {
      temp: Math.round(current.temperature_2m ?? 22),
      feelsLike: Math.round(current.apparent_temperature ?? 22),
      tempMin: Math.round(daily.temperature_2m_min?.[0] ?? (current.temperature_2m - 4)),
      tempMax: Math.round(daily.temperature_2m_max?.[0] ?? (current.temperature_2m + 4)),
      condition: getWmoConditionText(weatherCode),
      conditionText: getWmoConditionText(weatherCode),
      icon: icon,
      humidity: Math.round(current.relative_humidity_2m ?? 55),
      windSpeed: Math.round(current.wind_speed_10m ?? 12),
      windDeg: Math.round(current.wind_direction_10m ?? 0),
      pressure: Math.round(current.surface_pressure ?? 1013),
      uvIndex: Math.round(daily.uv_index_max?.[0] ?? 6),
      visibility: Math.round((hourly.visibility?.[0] ?? 10000) / 1000),
      dewPoint: Math.round(hourly.dew_point_2m?.[0] ?? 15),
      solar: {
        sunrise: daily.sunrise?.[0] ? daily.sunrise[0].split('T')[1].substring(0, 5) : '06:15 AM',
        sunset: daily.sunset?.[0] ? daily.sunset[0].split('T')[1].substring(0, 5) : '08:30 PM'
      }
    },
    airQuality: {
      aqi: 1,
      level: 'Good',
      color: '#10b981',
      advice: 'Air quality is satisfactory. Ideal for outdoor activity.'
    },
    hourly: hourlyList,
    daily: dailyList,
    updatedAt: new Date().toISOString()
  };
}

function getWmoConditionText(code) {
  if (code === 0) return 'Clear & Sunny';
  if (code >= 1 && code <= 3) return 'Partly Cloudy';
  if (code >= 45 && code <= 48) return 'Foggy';
  if (code >= 51 && code <= 67) return 'Rain Showers';
  if (code >= 71 && code <= 77) return 'Snowfall';
  if (code >= 80 && code <= 82) return 'Heavy Rain';
  if (code >= 85 && code <= 86) return 'Snow Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Clear';
}

function getWmoIcon(code) {
  if (code === 0) return 'sun';
  if (code >= 1 && code <= 3) return 'cloud-sun';
  if (code >= 45 && code <= 48) return 'cloud-fog';
  if (code >= 51 && code <= 67) return 'cloud-rain';
  if (code >= 71 && code <= 77) return 'snowflake';
  if (code >= 80 && code <= 82) return 'cloud-rain';
  if (code >= 85 && code <= 86) return 'snowflake';
  if (code >= 95) return 'cloud-lightning';
  return 'cloud-sun';
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
  const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?${param}&units=metric&appid=${OPENWEATHER_KEY}`);
  const forecast = forecastRes.ok ? await forecastRes.json() : null;

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
      windSpeed: Math.round(item.wind.speed * 3.6)
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
      advice: 'Air quality is acceptable for outdoor activity.'
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
      advice: 'Air quality is acceptable.'
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
