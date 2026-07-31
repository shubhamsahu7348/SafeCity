import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Navigation, RefreshCw, MapPin } from 'lucide-react';
import { Complaint } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface RiskHeatmapProps {
  complaints: Complaint[];
  height?: string;
  center?: { lat: number; lng: number };
  userCoords?: { lat: number; lng: number };
  userAddress?: string;
  isLocating?: boolean;
  onLocateMe?: () => void;
}

export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({
  complaints,
  height = '500px',
  center = { lat: 37.774929, lng: -122.419416 },
  userCoords = { lat: 37.774929, lng: -122.419416 },
  userAddress,
  isLocating = false,
  onLocateMe,
}) => {
  const { t, translateSeverity, translateText } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const heatmapLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // User pin icon
  const createUserMarkerIcon = () => {
    const userIconHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 rounded-full bg-blue-500 animate-ping opacity-70"></div>
        <div class="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-xl flex items-center justify-center text-white">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
    `;
    return L.divIcon({
      html: userIconHtml,
      className: 'user-pin-heatmap',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userCoords.lat, userCoords.lng],
        zoom: 13,
        zoomControl: true,
      });

      // Dark theme map tile layer for high-contrast risk heatmap visualization
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
        }
      ).addTo(map);

      // Add user location marker
      const userMarker = L.marker([userCoords.lat, userCoords.lng], {
        icon: createUserMarkerIcon(),
        zIndexOffset: 1000,
      }).addTo(map);

      userMarker.bindPopup(`
        <div class="p-1.5 font-sans">
          <div class="font-extrabold text-blue-400 text-xs flex items-center space-x-1 mb-0.5">
            <span>📍 ${t('map.active_center', 'MY LIVE LOCATION')}</span>
          </div>
          <div class="text-[11px] text-slate-200 font-medium">${translateText(userAddress) || 'GPS Position Detected'}</div>
          <div class="text-[10px] text-slate-400 font-mono mt-1">${userCoords.lat.toFixed(5)}, ${userCoords.lng.toFixed(5)}</div>
        </div>
      `);

      userMarkerRef.current = userMarker;
      heatmapLayerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update user marker position & pan map smoothly
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userCoords.lat, userCoords.lng]);
      userMarkerRef.current.setPopupContent(`
        <div class="p-1.5 font-sans">
          <div class="font-extrabold text-blue-400 text-xs flex items-center space-x-1 mb-0.5">
            <span>📍 ${t('map.active_center', 'MY LIVE LOCATION')}</span>
          </div>
          <div class="text-[11px] text-slate-200 font-medium">${translateText(userAddress) || 'GPS Position Detected'}</div>
          <div class="text-[10px] text-slate-400 font-mono mt-1">${userCoords.lat.toFixed(5)}, ${userCoords.lng.toFixed(5)}</div>
        </div>
      `);
    }

    map.flyTo([userCoords.lat, userCoords.lng], map.getZoom() < 12 ? 14 : map.getZoom(), {
      animate: true,
      duration: 1,
    });
  }, [userCoords, userAddress]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !heatmapLayerGroupRef.current) return;

    heatmapLayerGroupRef.current.clearLayers();

    // Render weighted heat intensity buffers around each hazard
    complaints.forEach((c) => {
      let weight = 1;
      let color = '#22c55e'; // Green
      let radiusMeters = 300;

      if (c.severity === 'Medium') {
        weight = 2;
        color = '#eab308'; // Yellow
        radiusMeters = 450;
      } else if (c.severity === 'High') {
        weight = 3;
        color = '#f97316'; // Orange
        radiusMeters = 600;
      } else if (c.severity === 'Critical' || c.isEmergency) {
        weight = 5;
        color = '#ef4444'; // Red
        radiusMeters = 800;
      }

      // Outer gradient risk zone
      const outerCircle = L.circle([c.latitude, c.longitude], {
        radius: radiusMeters,
        color: color,
        fillColor: color,
        fillOpacity: 0.2,
        weight: 1,
      });

      // Inner core intensity ring
      const innerCircle = L.circle([c.latitude, c.longitude], {
        radius: radiusMeters * 0.4,
        color: color,
        fillColor: color,
        fillOpacity: 0.45,
        weight: 2,
      });

      const popupContent = `
        <div class="p-2 text-slate-900 font-sans">
          <div class="font-extrabold text-sm mb-1">${translateText(c.title)}</div>
          <div class="text-xs text-slate-600 mb-1">${t('heatmap.zone_intensity', 'Zone Risk Intensity:')} <span class="font-bold text-red-600">${translateSeverity(c.severity)}</span></div>
          <div class="text-xs text-slate-500">${translateText(c.address)}</div>
        </div>
      `;

      outerCircle.bindPopup(popupContent);
      innerCircle.bindPopup(popupContent);

      heatmapLayerGroupRef.current?.addLayer(outerCircle);
      heatmapLayerGroupRef.current?.addLayer(innerCircle);
    });
  }, [complaints]);

  const handleCenterOnUser = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userCoords.lat, userCoords.lng], 15, { animate: true, duration: 1 });
      if (userMarkerRef.current) {
        userMarkerRef.current.openPopup();
      }
    }
    if (onLocateMe) {
      onLocateMe();
    }
  };

  return (
    <div className="relative z-0 isolate rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {/* Floating GPS Location Button */}
      <div className="absolute top-4 left-4 z-10 flex flex-col items-start space-y-2">
        <button
          onClick={handleCenterOnUser}
          disabled={isLocating}
          className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-2xl shadow-2xl border border-blue-400 flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
          title="Center map on my live GPS location"
        >
          {isLocating ? (
            <RefreshCw className="w-4 h-4 text-white animate-spin" />
          ) : (
            <Navigation className="w-4 h-4 text-white animate-bounce" />
          )}
          <span>{isLocating ? 'Locating GPS...' : 'Center My Live Location'}</span>
        </button>

        {userAddress && (
          <div className="px-3 py-1.5 bg-slate-900/90 backdrop-blur-md rounded-xl shadow-lg border border-slate-700 text-[11px] text-blue-200 font-bold max-w-xs truncate flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping flex-shrink-0"></span>
            <span className="truncate">{userAddress}</span>
          </div>
        )}
      </div>

      {/* Heatmap Legend */}
      <div className="absolute top-4 right-4 z-10 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-800 text-white text-xs space-y-2 shadow-xl max-w-xs">
        <div className="font-bold uppercase tracking-wider text-[11px] text-slate-300">GIS Risk Heatmap Key</div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between space-x-4">
            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-emerald-500 mr-1.5"></span>Green Zone</span>
            <span className="text-slate-400 text-[10px]">Low Risk</span>
          </div>
          <div className="flex items-center justify-between space-x-4">
            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-yellow-500 mr-1.5"></span>Yellow Zone</span>
            <span className="text-slate-400 text-[10px]">Medium Risk</span>
          </div>
          <div className="flex items-center justify-between space-x-4">
            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-orange-500 mr-1.5"></span>Orange Zone</span>
            <span className="text-slate-400 text-[10px]">High Risk</span>
          </div>
          <div className="flex items-center justify-between space-x-4 font-bold text-red-400">
            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-600 mr-1.5 animate-pulse"></span>Red Zone</span>
            <span className="text-red-400 text-[10px]">Critical Hazard Hotspot</span>
          </div>
        </div>
      </div>
    </div>
  );
};
