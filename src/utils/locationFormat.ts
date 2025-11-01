/**
 * Format location to show area/city name with coordinates
 * Example: "Brooklyn, New York (40.6782, -73.9442)"
 */
export function formatLocation(location: string | null): string {
  if (!location) return 'Location not set';
  
  // Check if location is just coordinates (lat, lng format)
  const coordRegex = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
  if (coordRegex.test(location)) {
    return `Location (${location})`;
  }
  
  // Check if location has coordinates in it already
  const hasCoords = /\(.*-?\d+\.?\d*,\s*-?\d+\.?\d*.*\)/.test(location);
  if (hasCoords) {
    return location;
  }
  
  // Return as is if it's already a named location
  return location;
}

/**
 * Reverse geocode coordinates to get area and city name
 * Uses browser's geolocation API with reverse geocoding
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    // Use OpenStreetMap Nominatim API for reverse geocoding (free, no API key needed)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Marketplace-App/1.0'
        }
      }
    );
    
    if (!response.ok) throw new Error('Geocoding failed');
    
    const data = await response.json();
    const address = data.address;
    
    // Build a readable address
    const parts = [];
    
    if (address.suburb || address.neighbourhood) {
      parts.push(address.suburb || address.neighbourhood);
    } else if (address.road) {
      parts.push(address.road);
    }
    
    if (address.city || address.town || address.village) {
      parts.push(address.city || address.town || address.village);
    } else if (address.county) {
      parts.push(address.county);
    }
    
    const locationName = parts.length > 0 ? parts.join(', ') : 'Unknown Location';
    return `${locationName} (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }
}
