import React, { useState, useEffect } from 'react';
import { MapPin, Filter, PlusCircle, Search, Flame, ShieldAlert, Navigation, RefreshCw, Compass, CheckCircle2, AlertCircle, Target, Info } from 'lucide-react';
import { Complaint, HazardCategory, ComplaintStatus } from '../types';
import { HazardMap } from '../components/HazardMap';
import { ComplaintDetailModal } from '../components/ComplaintDetailModal';

interface LiveMapViewProps {
  complaints: Complaint[];
  setActiveTab: (tab: string) => void;
  onUpvoteComplaint: (id: string) => void;
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
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [modalComplaint, setModalComplaint] = useState<Complaint | null>(null);

  // Live Location & Geolocation state
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: 37.774929,
    lng: -122.419416,
  });
  const [userAddress, setUserAddress] = useState<string>('Detecting your live GPS location...');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatusMessage, setLocationStatusMessage] = useState<string>('');
  const [locationDetected, setLocationDetected] = useState<boolean>(false);

  // Address search query state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Detect live browser location
  const handleDetectLiveLocation = () => {
    setSelectedComplaint(null);
    if (!navigator.geolocation) {
      setLocationStatusMessage('Geolocation is not supported by your browser.');
      setUserAddress('San Francisco, CA (Default)');
      return;
    }

    setIsLocating(true);
    setLocationStatusMessage('Acquiring high-accuracy live GPS coordinates...');

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
            } else {
              const fallback = `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
              setUserAddress(fallback);
              setLocationStatusMessage(`✅ Live Location: ${fallback}`);
            }
          } else {
            const fallback = `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            setUserAddress(fallback);
            setLocationStatusMessage(`✅ Live Location: ${fallback}`);
          }
        } catch (e) {
          const fallback = `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          setUserAddress(fallback);
          setLocationStatusMessage(`✅ Live Location: ${fallback}`);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn('Live location error:', err);
        setIsLocating(false);
        let msg = 'Unable to fetch device GPS location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location access denied. Please enable location permissions in browser settings.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'GPS signal unavailable. Using default location.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Retrying recommended.';
        }
        setLocationStatusMessage(`⚠️ ${msg}`);
        setUserAddress('San Francisco, CA (Default View)');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
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
  const filteredComplaints = complaints
    .filter((c) => {
      if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
      if (selectedStatus !== 'All' && c.status !== selectedStatus) return false;
      return true;
    })
    .map((c) => {
      const dist = getDistanceInKm(userCoords.lat, userCoords.lng, c.latitude, c.longitude);
      return { ...c, distanceKm: dist };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm); // Sort nearest first

  return (
    <div className="space-y-6 pb-12">
      {/* Header Controls */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-6 h-6 text-emerald-600" />
              <h1 className="text-xl font-extrabold text-slate-900">Live Hazard Intelligence Map</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time geospatial hazard tracking, live GPS location detection & radius filtering
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
              <span>{isLocating ? 'Acquiring GPS...' : 'Detect My Live Location'}</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Hazard</span>
            </button>
          </div>
        </div>

        {/* Live Location Banner & Address Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          {/* Status Badge */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Active Map Center / Live GPS
              </span>
              <p className="text-xs font-bold text-slate-800 truncate">
                📍 {userAddress}
              </p>
              {locationStatusMessage && (
                <p className="text-[11px] text-emerald-700 font-semibold truncate mt-0.5">
                  {locationStatusMessage}
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
                placeholder="Search location/address (e.g., London, New York)..."
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
                <span>Go</span>
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
            <option value="All">All Categories</option>
            <option value="Road Hazard">Road Hazards</option>
            <option value="Electrical Hazard">Electrical Hazards</option>
            <option value="Water Hazard">Water Hazards</option>
            <option value="Sanitation Hazard">Sanitation Hazards</option>
            <option value="Environmental Hazard">Environmental Hazards</option>
            <option value="Public Safety Hazard">Public Safety</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Verified">Verified</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          {/* Radius Filter */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            <span className="px-2 text-slate-500 text-[11px]">Radius:</span>
            {[1, 5, 10, 25].map((r) => (
              <button
                key={r}
                onClick={() => setRadiusKm(r)}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center space-x-1 ${
                  radiusKm === r ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Target className="w-3 h-3" />
                <span>{r} km</span>
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
                Nearby Hazards ({filteredComplaints.length})
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Sorted by distance from your live location</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Click to Inspect</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pt-3 pr-1">
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <MapPin className="w-8 h-8 mx-auto opacity-50 text-slate-400" />
                <p className="text-xs font-bold">No hazards found matching current filters.</p>
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
                            {c.isEmergency ? 'Emergency' : c.severity}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 truncate">{c.category}</span>
                        </div>
                        <span className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-md flex-shrink-0">
                          📍 {c.distanceKm < 1 ? `${Math.round(c.distanceKm * 1000)} m` : `${c.distanceKm.toFixed(1)} km`}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 truncate">{c.title}</h4>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{c.address}</p>
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
                      title="Center and highlight this hazard on the live map"
                    >
                      <MapPin className="w-3 h-3 text-blue-600" />
                      <span>Center Map</span>
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
                      <span>Full Details</span>
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

