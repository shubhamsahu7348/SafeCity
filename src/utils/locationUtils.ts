export interface UserLocation {
  lat: number;
  lng: number;
  address?: string;
}

const STORAGE_KEY = 'aapdasetu_user_location_cache';
const LEGACY_STORAGE_KEY = 'safecity_user_location_cache';

// Smart City civic jurisdiction default center (Navi Mumbai)
export const DEFAULT_CIVIC_LOCATION: UserLocation = {
  lat: 19.028698,
  lng: 73.040177,
  address: 'Navi Mumbai Civic Jurisdiction, Maharashtra',
};

// Return cached user location if available from earlier detection in this session
export function getCachedUserLocation(): UserLocation | null {
  try {
    const raw =
      sessionStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem(STORAGE_KEY) ||
      sessionStorage.getItem(LEGACY_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
      return parsed;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

// Persist user location so map and reports immediately open to where user is
export function saveCachedUserLocation(loc: UserLocation): void {
  try {
    const payload = JSON.stringify(loc);
    sessionStorage.setItem(STORAGE_KEY, payload);
    localStorage.setItem(STORAGE_KEY, payload);
  } catch {
    // Ignore storage errors
  }
}

// Network / IP location fallback with multiple free, fast providers
export async function getNetworkLocation(): Promise<UserLocation | null> {
  // Provider 1: ipwho.is (fast, highly reliable, no API key)
  try {
    const res = await fetch('https://ipwho.is/');
    if (res.ok) {
      const data = await res.json();
      if (data.success && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        const cityRegion = [data.city, data.region, data.country].filter(Boolean).join(', ');
        const loc: UserLocation = {
          lat: data.latitude,
          lng: data.longitude,
          address: cityRegion || 'Estimated Network Location',
        };
        saveCachedUserLocation(loc);
        return loc;
      }
    }
  } catch {
    // Try next provider
  }

  // Provider 2: freeipapi.com
  try {
    const res = await fetch('https://freeipapi.com/api/json');
    if (res.ok) {
      const data = await res.json();
      if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        const cityRegion = [data.cityName, data.regionName, data.countryName].filter(Boolean).join(', ');
        const loc: UserLocation = {
          lat: data.latitude,
          lng: data.longitude,
          address: cityRegion || 'Estimated Network Location',
        };
        saveCachedUserLocation(loc);
        return loc;
      }
    }
  } catch {
    // Ignore error
  }

  return null;
}

// Get live GPS position with fallback to network IP and cache
export function getLiveUserLocation(): Promise<UserLocation> {
  return new Promise((resolve) => {
    const cached = getCachedUserLocation();

    if (!navigator.geolocation) {
      getNetworkLocation().then((netLoc) => {
        resolve(netLoc || cached || DEFAULT_CIVIC_LOCATION);
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: UserLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        saveCachedUserLocation(loc);
        resolve(loc);
      },
      async () => {
        // On error or denied, try IP network location
        const netLoc = await getNetworkLocation();
        resolve(netLoc || cached || DEFAULT_CIVIC_LOCATION);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  });
}
