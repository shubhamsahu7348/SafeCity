import React, { useState, useEffect } from 'react';
import { MapPin, Filter, PlusCircle, Search, Flame, ShieldAlert, Navigation, RefreshCw, Compass, CheckCircle2, AlertCircle, Target, Info } from 'lucide-react';
import { Complaint, HazardCategory, ComplaintStatus } from '../types';
import { HazardMap } from '../components/HazardMap';
import { ComplaintDetailModal } from '../components/ComplaintDetailModal';
import { useLanguage } from '../context/LanguageContext';
import { getCachedUserLocation, saveCachedUserLocation, getNetworkLocation, DEFAULT_CIVIC_LOCATION } from '../utils/locationUtils';

interface LiveMapViewProps {
  complaints: Complaint[];
  setActiveTab: (tab: string) => void;
  onUpvoteComplaint: (id: string) => void;
  selectedComplaintId?: string;
  onSelectComplaint?: (complaint: Complaint) => void;
}

// Calculate Haversine distance in km
const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const LiveMapView: React.FC<LiveMapViewProps> = ({
  complaints,
  setActiveTab,
  onUpvoteComplaint,
  selectedComplaintId,
  onSelectComplaint,
}) => {
  const { t, translateCategory, translateStatus, translateSeverity, translateText } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(() => {
    if (selectedComplaintId) {
      return complaints.find((c) => c.id === selectedComplaintId) || null;
    }
    return null;
  });
  const [modalComplaint, setModalComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    if (selectedComplaintId) {
      const match = complaints.find((c) => c.id === selectedComplaintId);
      if (match) {
        setSelectedComplaint(match);
      }
    }
  }, [selectedComplaintId, complaints]);

  // Live Location & Geolocation state - defaults to cached location or first complaint cluster
  const cachedLoc = getCachedUserLocation();
  const defaultHazardCoord = complaints.length > 0 && typeof complaints[0].latitude === 'number'
    ? { lat: complaints[0].latitude, lng: complaints[0].longitude, address: complaints[0].address }
    : { lat: 19.028698, lng: 73.040177, address: 'Navi Mumbai Civic Jurisdiction' };

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>(
    cachedLoc ? { lat: cachedLoc.lat, lng: cachedLoc.lng } : { lat: defaultHazardCoord.lat, lng: defaultHazardCoord.lng }
  );
  const [userAddress, setUserAddress] = useState<string>(
    cachedLoc?.address || defaultHazardCoord.address || 'Smart City Civic Jurisdiction'
  );
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatusMessage, setLocationStatusMessage] = useState<string>(
    cachedLoc ? '📍 Centered at your last detected location' : '📍 Centered on active hazard zone'
  );
  const [locationDetected, setLocationDetected] = useState<boolean>(!!cachedLoc);

  // Address search query state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Quick Network IP fallback if browser GPS permission is denied or unavailable
  const fallbackToIPLocation = async () => {
    try {
      const netLoc = await getNetworkLocation();
      if (netLoc) {
        setUserCoords({ lat: netLoc.lat, lng: netLoc.lng });
        if (netLoc.address) setUserAddress(netLoc.address);
        setLocationDetected(true);
        setLocationStatusMessage(`📍 Located via Network: ${netLoc.address || 'Detected Location'}`);
        return true;
      }
    } catch {
      // Ignore error
    }
    return false;
  };

  // Detect live browser location
  const handleDetectLiveLocation = () => {
    setSelectedComplaint(null);
    if (!navigator.geolocation) {
      setLocationStatusMessage('Geolocation not supported. Detecting network location...');
      fallbackToIPLocation();
      return;
    }

    setIsLocating(true);
    setLocationStatusMessage('Acquiring live GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserCoords({ lat, lng });
        setLocationDetected(true);
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
        } catch {
          const fallback = `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          setUserAddress(fallback);
          setLocationStatusMessage(`✅ Live Location: ${fallback}`);
          saveCachedUserLocation({ lat, lng, address: fallback });
        } finally {
          setIsLocating(false);
        }
      },
      async () => {
        setIsLocating(false);
        setLocationStatusMessage('GPS unavailable. Detecting via network IP...');
        const success = await fallbackToIPLocation();
        if (!success) {
          setLocationStatusMessage('📍 Centered on active civic hazard zone');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  };

  // Auto-detect live location on mount
  useEffect(() => {
    handleDetectLiveLocation();
  }, []);

  // Search address geocoding
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
          setLocationDetected(true);
          setLocationStatusMessage(`📍 Map centered on: ${first.display_name}`);
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

  // Filter complaints & calculate distance from live user position
  const allDistanceComplaints = complaints
    .filter((c) => {
      if (typeof c.latitude !== 'number' || typeof c.longitude !== 'number' || isNaN(c.latitude) || isNaN(c.longitude)) {
        return false;
      }
      if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
      if (selectedStatus !== 'All' && c.status !== selectedStatus) return false;
      return true;
    })
    .map((c) => {
      const dist = getDistanceInKm(userCoords.lat, userCoords.lng, c.latitude, c.longitude);
      return { ...c, distanceKm: isNaN(dist) ? 0 : dist };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm); // Sort nearest first

  // Apply radius filter if radiusKm > 0, otherwise show all
  const filteredComplaints = radiusKm > 0
    ? allDistanceComplaints.filter((c) => c.distanceKm <= radiusKm)
    : allDistanceComplaints;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Controls */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-6 h-6 text-emerald-600" />
              <h1 className="text-xl font-extrabold text-slate-900">{t('map.title', 'Live Hazard Intelligence Map')}</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('map.subtitle', 'Real-time geospatial hazard tracking, live GPS location detection & radius filtering')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDetectLiveLocation}
              disabled={isLocating}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center space-x-2 shadow-md transition-all active:scale-95 disabled:opacity-60"
            >
              {isLocating ? (
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
              ) : (
                <Navigation className="w-4 h-4 text-emerald-200 animate-bounce" />
              )}
              <span>{isLocating ? t('map.acquiring_gps', 'Acquiring GPS...') : t('map.detect_location', 'Detect My Live Location')}</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('map.report_hazard', 'Report Hazard')}</span>
            </button>
          </div>
        </div>

        {/* Live Location Banner & Address Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          {/* Status Badge */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                {t('map.active_center', 'Active Map Center / Live GPS')}
              </span>
              <p className="text-xs font-bold text-slate-800 truncate">
                📍 {translateText(userAddress)}
              </p>
              {locationStatusMessage && (
                <p className="text-[11px] text-emerald-700 font-semibold truncate mt-0.5">
                  {translateText(locationStatusMessage)}
                </p>
              )}
            </div>
          </div>

          {/* Location Search Form */}
          <form onSubmit={handleSearchLocation} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('map.search_placeholder', 'Search location/address (e.g., London, New York)...')}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1"
            >
              {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <>
                <Search className="w-3.5 h-3.5 text-cyan-300" />
                <span>{t('map.search_go', 'Go')}</span>
              </>}
            </button>
          </form>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
          >
            <option value="All">{t('map.all_categories', 'All Categories')}</option>
            <option value="Road Hazard">{t('category.road', 'Road Hazards')}</option>
            <option value="Electrical Hazard">{t('category.electrical', 'Electrical Hazards')}</option>
            <option value="Water Hazard">{t('category.water', 'Water Hazards')}</option>
            <option value="Sanitation Hazard">{t('category.sanitation', 'Sanitation Hazards')}</option>
            <option value="Environmental Hazard">{t('category.environmental', 'Environmental Hazards')}</option>
            <option value="Public Safety Hazard">{t('category.safety', 'Public Safety')}</option>
            <option value="Traffic Violation">{t('category.traffic', 'Traffic Violations')}</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
          >
            <option value="All">{t('map.all_statuses', 'All Statuses')}</option>
            <option value="Submitted">{t('status.submitted', 'Submitted')}</option>
            <option value="Verified">{t('status.verified', 'Verified')}</option>
            <option value="Assigned">{t('status.assigned', 'Assigned')}</option>
            <option value="In Progress">{t('status.in_progress', 'In Progress')}</option>
            <option value="Resolved">{t('status.resolved', 'Resolved')}</option>
          </select>

          {/* Radius Filter */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            <span className="px-2 text-slate-500 text-[11px]">{t('map.radius', 'Radius:')}</span>
            {[
              { val: 1, label: '1 km' },
              { val: 5, label: '5 km' },
              { val: 10, label: '10 km' },
              { val: 25, label: '25 km' },
              { val: 50, label: '50 km' },
              { val: 0, label: 'All Hazards' },
            ].map((r) => (
              <button
                key={r.val}
                type="button"
                onClick={() => setRadiusKm(r.val)}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center space-x-1 ${
                  radiusKm === r.val ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Target className="w-3 h-3" />
                <span>{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map & Hazard List Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaflet Map Column */}
        <div className="lg:col-span-2 space-y-3">
          <HazardMap
            complaints={filteredComplaints}
            selectedComplaintId={selectedComplaint?.id}
            onSelectComplaint={(c) => {
              setSelectedComplaint(c);
              setModalComplaint(c);
            }}
            radiusKm={radiusKm}
            userCoords={userCoords}
            userAddress={userAddress}
            isLocating={isLocating}
            onLocateMe={handleDetectLiveLocation}
            height="560px"
          />
        </div>

        {/* Nearby Hazards Sidebar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[560px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                {t('map.nearby_hazards', 'Nearby Hazards')} ({filteredComplaints.length})
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {radiusKm > 0
                  ? `Showing active hazards within ${radiusKm} km radius`
                  : t('map.sorted_distance', 'Sorted by distance from your live location')}
              </p>
            </div>
            {radiusKm > 0 && filteredComplaints.length < allDistanceComplaints.length && (
              <button
                onClick={() => setRadiusKm(0)}
                className="text-[10px] font-black text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200"
              >
                Show All ({allDistanceComplaints.length})
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pt-3 pr-1">
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-3 px-4">
                <MapPin className="w-10 h-10 mx-auto opacity-50 text-slate-400 animate-bounce" />
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    {radiusKm > 0
                      ? `No hazards reported within ${radiusKm} km of your position.`
                      : t('map.no_hazards', 'No hazards found matching current filters.')}
                  </p>
                  {allDistanceComplaints.length > 0 && radiusKm > 0 && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      There are {allDistanceComplaints.length} hazards reported further out in the city.
                    </p>
                  )}
                </div>
                {radiusKm > 0 && (
                  <div className="flex flex-col items-center space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRadiusKm(25)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all"
                    >
                      Expand to 25 km
                    </button>
                    <button
                      type="button"
                      onClick={() => setRadiusKm(0)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all"
                    >
                      View All City Hazards ({allDistanceComplaints.length})
                    </button>
                  </div>
                )}
              </div>
            ) : (
              filteredComplaints.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedComplaint(c);
                    setModalComplaint(c);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-2 group ${
                    selectedComplaint?.id === c.id
                      ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20 shadow-md'
                      : 'border-slate-200/80 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={c.photoUrl}
                      alt={c.title}
                      className="w-14 h-14 object-cover rounded-xl flex-shrink-0 border border-slate-200 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center space-x-1 truncate">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded ${
                              c.isEmergency ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {c.isEmergency ? t('map.emergency', 'Emergency') : translateSeverity(c.severity)}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 truncate">{translateCategory(c.category)}</span>
                        </div>
                        <span className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-md flex-shrink-0">
                          📍 {c.distanceKm < 1 ? `${Math.round(c.distanceKm * 1000)} m` : `${c.distanceKm.toFixed(1)} km`}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 truncate">{translateText(c.title)}</h4>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{translateText(c.address)}</p>
                    </div>
                  </div>

                  {/* Quick Action Toolbar */}
                  <div className="flex items-center justify-end space-x-2 pt-1 border-t border-slate-100/80">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedComplaint(c);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 border border-slate-200 hover:border-blue-300 rounded-lg text-[10px] font-extrabold flex items-center space-x-1 transition-all"
                    >
                      <MapPin className="w-3 h-3 text-blue-600" />
                      <span>{t('map.center_map', 'Center Map')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedComplaint(c);
                        setModalComplaint(c);
                      }}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black shadow-sm flex items-center space-x-1 transition-all"
                    >
                      <Info className="w-3 h-3 text-cyan-200" />
                      <span>{t('map.full_details', 'Full Details')}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {modalComplaint && (
        <ComplaintDetailModal
          complaint={modalComplaint}
          onClose={() => setModalComplaint(null)}
          onUpvote={onUpvoteComplaint}
        />
      )}
    </div>
  );
};

