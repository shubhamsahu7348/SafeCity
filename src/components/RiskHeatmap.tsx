import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Navigation, RefreshCw, Layers, Globe, Map as MapIcon, Plus, Minus, Crosshair } from 'lucide-react';
import { Complaint } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface RiskHeatmapProps {
  complaints: Complaint[];
  userCoords: { lat: number; lng: number };
  userAddress?: string;
  height?: string;
  isLocating?: boolean;
  onLocateMe?: () => void;
}

export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({
  complaints,
  userCoords,
  userAddress,
  height = '560px',
  isLocating = false,
  onLocateMe,
}) => {
  const { t, translateSeverity, translateText } = useLanguage();
  const [mapStyle, setMapStyle] = useState<'dark' | 'streets' | 'satellite'>('dark');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // User Marker Icon
  const createUserMarkerIcon = () => {
    const userIconHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 rounded-full bg-blue-500 animate-ping opacity-75"></div>
        <div class="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white">
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

  // Switch active map tile layer in RiskHeatmap
  const applyTileLayer = useCallback((style: 'dark' | 'satellite' | 'streets', targetMap?: L.Map) => {
    const map = targetMap || mapInstanceRef.current;
    if (!map) return;

    if (!tileLayerGroupRef.current) {
      tileLayerGroupRef.current = L.layerGroup().addTo(map);
    }
    tileLayerGroupRef.current.clearLayers();

    if (style === 'dark') {
      const darkBase = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; Esri &mdash; Dark GIS Base',
          maxZoom: 19,
        }
      );
      const darkRef = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; Esri',
          maxZoom: 19,
        }
      );
      tileLayerGroupRef.current.addLayer(darkBase);
      tileLayerGroupRef.current.addLayer(darkRef);
    } else if (style === 'satellite') {
      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; Esri &mdash; Satellite Imagery',
          maxZoom: 19,
        }
      );
      const labelsLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; Esri',
          maxZoom: 19,
        }
      );
      tileLayerGroupRef.current.addLayer(satLayer);
      tileLayerGroupRef.current.addLayer(labelsLayer);
    } else if (style === 'streets') {
      const streetLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; Esri &mdash; Street Map',
          maxZoom: 19,
        }
      );
      tileLayerGroupRef.current.addLayer(streetLayer);
    }

    map.invalidateSize();
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      applyTileLayer(mapStyle, mapInstanceRef.current);
    }
  }, [mapStyle, applyTileLayer]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    if ((mapContainerRef.current as any)._leaflet_id) {
      (mapContainerRef.current as any)._leaflet_id = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [userCoords.lat, userCoords.lng],
      zoom: 13,
      zoomControl: false,
      scrollWheelZoom: true,
      touchZoom: true,
      doubleClickZoom: true,
    });

    // Set instance ref immediately
    mapInstanceRef.current = map;

    // Real map tile layer group
    tileLayerGroupRef.current = L.layerGroup().addTo(map);
    applyTileLayer(mapStyle, map);

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

    // ResizeObserver ensures heatmap invalidates size on resize and tab switch
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 50);
    setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 200);
    setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 500);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      userMarkerRef.current = null;
      tileLayerGroupRef.current = null;
      heatmapLayerGroupRef.current = null;
    };
  }, []);

  // Update user marker position
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current && (userMarkerRef.current as any)._map) {
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
  }, [userCoords, userAddress, t, translateText]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !heatmapLayerGroupRef.current) return;

    heatmapLayerGroupRef.current.clearLayers();

    // Render weighted heat intensity buffers around each hazard
    complaints.forEach((c) => {
      if (typeof c.latitude !== 'number' || typeof c.longitude !== 'number' || isNaN(c.latitude) || isNaN(c.longitude)) return;

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
        radius: radiusMeters * 0.45,
        color: color,
        fillColor: color,
        fillOpacity: 0.45,
        weight: 2,
      });

      // Interactive popup
      const popup = L.popup().setContent(`
        <div class="p-1 font-sans text-xs">
          <div class="font-extrabold mb-1" style="color: ${color}">⚠️ RISK ZONE: ${translateSeverity(c.severity).toUpperCase()}</div>
          <div class="font-bold text-slate-900">${translateText(c.title)}</div>
          <div class="text-slate-600 text-[11px] mt-0.5">${translateText(c.address)}</div>
          <div class="text-slate-400 text-[10px] mt-1 font-mono">Risk Radius: ${radiusMeters}m | Severity Weight: ${weight}x</div>
        </div>
      `);

      outerCircle.bindPopup(popup);
      innerCircle.bindPopup(popup);

      heatmapLayerGroupRef.current?.addLayer(outerCircle);
      heatmapLayerGroupRef.current?.addLayer(innerCircle);
    });
  }, [complaints, t, translateSeverity, translateText]);

  const fitAllHazards = () => {
    const map = mapInstanceRef.current;
    if (!map || complaints.length === 0) return;
    const validCoords = complaints
      .filter((c) => typeof c.latitude === 'number' && typeof c.longitude === 'number' && !isNaN(c.latitude) && !isNaN(c.longitude))
      .map((c) => [c.latitude, c.longitude] as [number, number]);
    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  };

  const handleCenterOnUser = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userCoords.lat, userCoords.lng], 14, { animate: true, duration: 1 });
      if (userMarkerRef.current && (userMarkerRef.current as any)._map) {
        userMarkerRef.current.openPopup();
      }
    }
    if (onLocateMe) {
      onLocateMe();
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  return (
    <div className="relative z-0 isolate rounded-2xl overflow-hidden border border-slate-800 shadow-xl w-full bg-slate-900" style={{ height, minHeight: height }}>
      <div ref={mapContainerRef} className="w-full" style={{ height, minHeight: height, width: '100%' }} />

      {/* Floating GPS Location & Fit Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col items-start space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Style Switcher */}
          <div className="flex items-center bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-700 shadow-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setMapStyle('dark')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all ${
                mapStyle === 'dark'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Dark GIS Contrast Map"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Dark GIS</span>
            </button>

            <button
              type="button"
              onClick={() => setMapStyle('streets')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all ${
                mapStyle === 'streets'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Real Street Map with roads and city landmarks"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Real Streets</span>
            </button>

            <button
              type="button"
              onClick={() => setMapStyle('satellite')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all ${
                mapStyle === 'satellite'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="High resolution aerial satellite imagery"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Satellite</span>
            </button>
          </div>

          <button
            type="button"
            onClick={fitAllHazards}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-2xl border border-indigo-400 flex items-center space-x-1.5 transition-all hover:scale-105 active:scale-95"
            title="Fit all hazard zones in view"
          >
            <Navigation className="w-3.5 h-3.5 text-cyan-200" />
            <span>Fit All Zones ({complaints.length})</span>
          </button>

          <button
            type="button"
            onClick={handleCenterOnUser}
            disabled={isLocating}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-2xl shadow-2xl border border-slate-600 flex items-center space-x-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
            title="Center map on my live GPS location"
          >
            {isLocating ? (
              <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-white animate-bounce" />
            )}
            <span>{isLocating ? 'Locating...' : 'My GPS'}</span>
          </button>
        </div>

        {userAddress && (
          <div className="px-3 py-1.5 bg-slate-900/90 backdrop-blur-md rounded-xl shadow-lg border border-slate-700 text-[11px] text-blue-200 font-bold max-w-xs truncate flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping flex-shrink-0"></span>
            <span className="truncate">{userAddress}</span>
          </div>
        )}
      </div>

      {/* High-Contrast Zoom Controls */}
      <div className="absolute top-24 left-4 z-10 flex flex-col space-y-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl shadow-xl border border-slate-700">
        <button
          type="button"
          onClick={handleZoomIn}
          className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-all active:scale-95"
          title="Zoom In"
        >
          <Plus className="w-4 h-4 font-bold" />
        </button>
        <div className="w-full h-px bg-slate-700 my-0.5"></div>
        <button
          type="button"
          onClick={handleZoomOut}
          className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-all active:scale-95"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4 font-bold" />
        </button>
        <div className="w-full h-px bg-slate-700 my-0.5"></div>
        <button
          type="button"
          onClick={handleCenterOnUser}
          className="p-2 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 rounded-xl transition-all active:scale-95"
          title="Recenter on My Location"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Heatmap Legend */}
      <div className="absolute top-4 right-4 z-10 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-800 text-white text-xs space-y-2 shadow-xl max-w-xs">
        <div className="font-bold uppercase tracking-wider text-[11px] text-slate-300">Hazard Risk Severity Levels</div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between space-x-4">
            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-emerald-500 mr-1.5"></span>Green Zone</span>
            <span className="text-[11px] text-slate-400 font-mono">Low (300m)</span>
          </div>
          <div className="flex items-center justify-between space-x-4">
            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-yellow-500 mr-1.5"></span>Yellow Zone</span>
            <span className="text-[11px] text-slate-400 font-mono">Medium (450m)</span>
          </div>
          <div className="flex items-center justify-between space-x-4">
            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-orange-500 mr-1.5"></span>Orange Zone</span>
            <span className="text-[11px] text-slate-400 font-mono">High (600m)</span>
          </div>
          <div className="flex items-center justify-between space-x-4">
            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-1.5 animate-pulse"></span>Red Hotspot</span>
            <span className="text-[11px] text-red-400 font-bold font-mono">Critical (800m)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
