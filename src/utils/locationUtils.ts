export interface UserLocation {
  lat: number;
  lng: number;
  address?: string;
}

const STORAGE_KEY = 'aapdasetu_user_location_cache';
const LEGACY_STORAGE_KEY = 'safecity_user_location_cache';

// Return cached user location if available from earlier detection in this session
export function getCachedUserLocation(): UserLocation | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(LEGACY_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
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

// Get live GPS position with fallback to cache
export function getLiveUserLocation(): Promise<UserLocation> {
  return new Promise((resolve) => {
    const cached = getCachedUserLocation();

    if (!navigator.geolocation) {
      resolve(cached || { lat: 37.774929, lng: -122.419416, address: 'Default City Center' });
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
      () => {
        // On error or denied, resolve cached or fallback
        resolve(cached || { lat: 37.774929, lng: -122.419416, address: 'Default City Center' });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}
