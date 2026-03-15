import { API_BASE_URL } from './config.js';

/**
 * Reverse geocode a lat/lng via the backend proxy.
 * The LocationIQ API key is kept server-side; results are cached 1 hour.
 *
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<string|null>} Formatted address string, or null on failure
 */
export async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/waypoint/geocode/reverse?lat=${lat}&lng=${lng}`,
      { credentials: 'include' },
    );
    if (!response.ok) {
      console.warn('Reverse geocoding failed:', response.status);
      return null;
    }
    const data = await response.json();
    return data.address ?? null;
  } catch (err) {
    console.warn('Reverse geocoding error:', err);
    return null;
  }
}

/**
 * Autocomplete / forward geocode an address query via the backend proxy.
 * The LocationIQ API key is kept server-side; results are cached 5 minutes.
 *
 * @param {string} query  - The search string typed by the user
 * @returns {Promise<{error: boolean, results: Array}>} Result shape with error flag and results array
 */
export async function searchAddress(query) {
  if (!query || query.trim().length < 2) return { error: false, results: [] };

  try {
    const response = await fetch(
      `${API_BASE_URL}/waypoint/geocode/search?q=${encodeURIComponent(query.trim())}`,
      { credentials: 'include' },
    );
    if (!response.ok) {
      console.warn('Address search failed:', response.status);
      return { error: true, results: [] };
    }
    const data = await response.json();
    return { error: false, results: data.results ?? [] };
  } catch (err) {
    console.warn('Address search error:', err);
    return { error: true, results: [] };
  }
}
