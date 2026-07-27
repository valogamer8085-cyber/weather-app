/**
 * API Fetch Client with Error Handling & Caching
 */

const API_BASE = '/api';

export async function fetchWeather(queryOrCoords) {
  let url = `${API_BASE}/weather`;

  if (typeof queryOrCoords === 'object' && queryOrCoords.lat && queryOrCoords.lon) {
    url += `?lat=${queryOrCoords.lat}&lon=${queryOrCoords.lon}`;
  } else if (typeof queryOrCoords === 'string' && queryOrCoords.trim().length > 0) {
    url += `?q=${encodeURIComponent(queryOrCoords.trim())}`;
  }

  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server returned ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[API Error] Fetch weather failed:', error);
    throw error;
  }
}

export async function fetchCitySuggestions(query) {
  if (!query || query.trim().length === 0) return [];

  try {
    const response = await fetch(`${API_BASE}/weather/search?q=${encodeURIComponent(query.trim())}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.warn('[API Error] City search failed:', error);
    return [];
  }
}
