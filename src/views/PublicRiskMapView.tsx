import React, { useState, useEffect } from 'react';
import { Layers, Flame, ShieldAlert, Navigation, RefreshCw, Search, MapPin } from 'lucide-react';
import { Complaint } from '../types';
import { RiskHeatmap } from '../components/RiskHeatmap';
import { useLanguage } from '../context/LanguageContext';
import { getCachedUserLocation, saveCachedUserLocation, getNetworkLocation, DEFAULT_CIVIC_LOCATION } from '../utils/locationUtils';

interface PublicRiskMapViewProps {
  complaints: Complaint[];
}

export const PublicRiskMapView: React.FC<PublicRiskMapViewProps> = ({ complaints }) => {
  const { t, translateCategory, translateText } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Live Geolocation State
  const cached = getCachedUserLocation();
  const defaultHazardCoord = complaints.length > 0 && typeof complaints[0].latitude === 'number'
    ? { lat: complaints[0].latitude, lng: complaints[0].longitude, address: complaints[0].address }
    : { lat: 19.028698, lng: 73.040177, address: 'Navi Mumbai Civic Jurisdiction' };

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>(
    cached ? { lat: cached.lat, lng: cached.lng } : { lat: defaultHazardCoord.lat, lng: defaultHazardCoord.lng }
  );
  const [userAddress, setUserAddress] = useState<string>(
    cached?.address || defaultHazardCoord.address || 'Smart City Civic Jurisdiction'
  );
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatusMessage, setLocationStatusMessage] = useState<string>(
    cached ? '📍 Centered at your detected location' : '📍 Centered on active hazard zone'
  );

  // Address search query state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Quick Network IP fallback
  const fallbackToIPLocation = async () => {
    try {
      const netLoc = await getNetworkLocation();
      if (netLoc) {
        setUserCoords({ lat: netLoc.lat, lng: netLoc.lng });
        if (netLoc.address) setUserAddress(netLoc.address);
        setLocationStatusMessage(`📍 Located via Network: ${netLoc.address || 'Detected Location'}`);
        return true;
      }
    } catch {
      // Ignore error
    }
    return false;
  };

  // Detect live browser GPS location
  const handleDetectLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatusMessage('Geolocation not supported. Detecting network location...');
      fallbackToIPLocation();
      return;
    }

    setIsLocating(true);
    setLocationStatusMessage('Acquiring high-accuracy live GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserCoords({ lat, lng });
        setLocationStatusMessage('Resolving street address...');

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              const shortAddr = data.address
                ? `${data.address.road || data.address.suburb || ''} ${data.address.city || data.address.town || data.address.county || ''}`.trim() || data.display_name
                : data.display_name;
              setUserAddress(shortAddr);
              setLocationStatusMessage(`✅ Live Location: ${shortAddr}`);
              saveCachedUserLocation({ lat, lng, address: shortAddr });
            } else {
              const fallback = `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
              setUserAddress(fallback);
              setLocationStatusMessage(`✅ Live Location: ${fallback}`);
              saveCachedUserLocation({ lat, lng, address: fallback });
            }
          } else {
            const fallback = `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            setUserAddress(fallback);
            setLocationStatusMessage(`✅ Live Location: ${fallback}`);
            saveCachedUserLocation({ lat, lng, address: fallback });
          }
        } catch (e) {
          const fallback = `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          setUserAddress(fallback);
          setLocationStatusMessage(`✅ Live Location: ${fallback}`);
          saveCachedUserLocation({ lat, lng, address: fallback });
        } finally {
          setIsLocating(false);
        }
      },
      async (err) => {
        console.warn('Live location error:', err);
        setIsLocating(false);
        let msg = 'Unable to fetch GPS. Trying network location...';
        setLocationStatusMessage(`⚠️ ${msg}`);
        await fallbackToIPLocation();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Auto-detect live location on mount
  useEffect(() => {
    handleDetectLiveLocation();
  }, []);

  // Search location geocoding
  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setLocationStatusMessage(`Searching coordinates for "${searchQuery}"...`);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const first = data[0];
          const lat = parseFloat(first.lat);
          const lng = parseFloat(first.lon);
          setUserCoords({ lat, lng });
          setUserAddress(first.display_name);
          setLocationStatusMessage(`📍 Heatmap centered on: ${first.display_name}`);
        } else {
          setLocationStatusMessage(`⚠️ Location "${searchQuery}" not found. Try another city or address.`);
        }
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setLocationStatusMessage('⚠️ Failed to resolve address search.');
    } finally {
      setIsSearching(false);
    }
  };

  const filtered = complaints.filter((c) => {
    if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
    return true;
  });

  const criticalZoneCount = complaints.filter((c) => c.isEmergency || c.severity === 'Critical').length;
  const highZoneCount = complaints.filter((c) => c.severity === 'High').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Controls */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Layers className="w-6 h-6 text-amber-400" />
              <h1 className="text-2xl font-extrabold text-white">{t('heatmap.title', 'Public Risk & Hazard Heatmap')}</h1>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {t('heatmap.subtitle', 'GIS density analysis & high-risk emergency zones')}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDetectLiveLocation}
              disabled={isLocating}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl flex items-center space-x-2 shadow-lg transition-all active:scale-95 disabled:opacity-60"
            >
              {isLocating ? (
                <RefreshCw className="w-4 h-4 animate-spin text-blue-200" />
              ) : (
                <Navigation className="w-4 h-4 text-blue-200 animate-bounce" />
              )}
              <span>{isLocating ? t('map.acquiring_gps', 'Acquiring GPS...') : t('map.detect_location', 'Detect My Live Location')}</span>
            </button>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">{t('map.all_categories', 'All Hazard Categories')}</option>
              <option value="Road Hazard">{t('category.road', 'Road Hazards')}</option>
              <option value="Electrical Hazard">{t('category.electrical', 'Electrical Hazards')}</option>
              <option value="Water Hazard">{t('category.water', 'Water Hazards')}</option>
              <option value="Sanitation Hazard">{t('category.sanitation', 'Sanitation Hazards')}</option>
              <option value="Environmental Hazard">{t('category.environmental', 'Environmental Hazards')}</option>
              <option value="Public Safety Hazard">{t('category.safety', 'Public Safety')}</option>
            </select>
          </div>
        </div>

        {/* Live Location Bar & Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                {t('map.active_center', 'Active GIS Map Center')}
              </span>
              <p className="text-xs font-bold text-white truncate">
                📍 {translateText(userAddress)}
              </p>
              {locationStatusMessage && (
                <p className="text-[11px] text-blue-400 font-semibold truncate mt-0.5">
                  {translateText(locationStatusMessage)}
                </p>
              )}
            </div>
          </div>

          <form onSubmit={handleSearchLocation} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('map.search_placeholder', 'Search location (e.g. Mumbai, Pune)...')}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1"
            >
              {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>{t('map.search_go', 'Go')}</span>}
            </button>
          </form>
        </div>
      </div>

      {/* Heatmap Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-950/20 p-4 rounded-2xl border border-red-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-red-600 uppercase tracking-wider block">{t('heatmap.high_density', 'Red Hotspot Zones')}</span>
            <span className="text-2xl font-black text-red-700">{criticalZoneCount} {t('heatmap.zones', 'Zones')}</span>
          </div>
          <Flame className="w-8 h-8 text-red-600 animate-bounce" />
        </div>

        <div className="bg-orange-950/20 p-4 rounded-2xl border border-orange-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider block">{t('heatmap.medium_density', 'Orange High Risk')}</span>
            <span className="text-2xl font-black text-orange-700">{highZoneCount} {t('heatmap.zones', 'Zones')}</span>
          </div>
          <ShieldAlert className="w-8 h-8 text-orange-600" />
        </div>

        <div className="bg-emerald-950/20 p-4 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider block">{t('heatmap.low_density', 'Green Clear Zones')}</span>
            <span className="text-2xl font-black text-emerald-700">84.2% {t('heatmap.city_area', 'City Area')}</span>
          </div>
          <Layers className="w-8 h-8 text-emerald-600" />
        </div>
      </div>

      {/* Interactive GIS Heatmap */}
      <RiskHeatmap
        complaints={filtered}
        userCoords={userCoords}
        userAddress={userAddress}
        isLocating={isLocating}
        onLocateMe={handleDetectLiveLocation}
        height="580px"
      />
    </div>
  );
};
