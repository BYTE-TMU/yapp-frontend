const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;

/**
 * Reverse geocode a lat/lng coordinate into a human-readable address string.
 * Uses LocationIQ's reverse geocoding API (1 request credit per call).
 *
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<string|null>} Formatted address string, or null on failure
 */
export async function reverseGeocode(lat, lng) {
  if (!LOCATIONIQ_API_KEY || LOCATIONIQ_API_KEY === 'your_locationiq_api_key_here') {
    console.warn('LocationIQ API key not configured. Set VITE_LOCATIONIQ_API_KEY in .env');
    return null;
  }

  try {
    const url = `https://us1.locationiq.com/v1/reverse?key=${LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lng}&format=json`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn('Reverse geocoding failed:', response.status);
      return null;
    }

    const data = await response.json();

    // Build a concise address: prefer building/road + city
    const addr = data.address || {};
    const parts = [
      addr.building || addr.shop || addr.amenity || addr.tourism || null,
      addr.road || addr.pedestrian || addr.footway || null,
      addr.suburb || addr.neighbourhood || addr.city_district || null,
      addr.city || addr.town || addr.village || null,
    ].filter(Boolean);

    if (parts.length > 0) {
      return parts.join(', ');
    }

    // Fallback: trim the full display name to something readable
    if (data.display_name) {
      // display_name is very long; take the first 3 comma-separated segments
      return data.display_name.split(',').slice(0, 3).join(',').trim();
    }

    return null;
  } catch (err) {
    console.warn('Reverse geocoding error:', err);
    return null;
  }
}

/**
 * Autocomplete / forward geocode an address query.
 * Uses LocationIQ's autocomplete API (1 request credit per call).
 *
 * @param {string} query  - The search string typed by the user
 * @returns {Promise<{error: boolean, results: Array}>} Result shape with error flag and results array
 */
export async function searchAddress(query) {
  if (!LOCATIONIQ_API_KEY || LOCATIONIQ_API_KEY === 'your_locationiq_api_key_here') {
    console.warn('LocationIQ API key not configured. Set VITE_LOCATIONIQ_API_KEY in .env');
    return { error: true, results: [] };
  }

  if (!query || query.trim().length < 2) return { error: false, results: [] };

  try {
    const url = `https://us1.locationiq.com/v1/autocomplete?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(query.trim())}&limit=5&format=json&countrycodes=ca`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn('Address search failed:', response.status);
      return { error: true, results: [] };
    }

    const data = await response.json();
    return { error: false, results: Array.isArray(data) ? data : [] };
  } catch (err) {
    console.warn('Address search error:', err);
    return { error: true, results: [] };
  }
}
