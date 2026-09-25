import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { RefreshCw, Navigation, Layers, Globe, Map as MapIcon, Plus, Minus, Crosshair } from 'lucide-react';
import { Complaint, SeverityLevel } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getCachedUserLocation, DEFAULT_CIVIC_LOCATION } from '../utils/locationUtils';

interface HazardMapProps {
  complaints: Complaint[];
  selectedComplaintId?: string;
  onSelectComplaint?: (complaint: Complaint) => void;
  radiusKm?: number; // 0 for All, or 1, 5, 10, 25, 50 km
  userCoords?: { lat: number; lng: number };
  userAddress?: string;
  isLocating?: boolean;
  onLocateMe?: () => void;
  height?: string;
}

export const HazardMap: React.FC<HazardMapProps> = ({
  complaints,
  selectedComplaintId,
  onSelectComplaint,
  radiusKm = 5,
  userCoords,
  userAddress,
  isLocating = false,
  onLocateMe,
  height = '500px',
}) => {
  const { t, translateCategory, translateSeverity, translateText } = useLanguage();
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'osm'>('streets');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileGroupRef = useRef<L.LayerGroup | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());
  const initialFitDoneRef = useRef<boolean>(false);

  // Determine effective coordinates: prefer prop, then cached, then first complaint, then civic default
  const cachedLoc = getCachedUserLocation();
  const effectiveCoords = userCoords || (cachedLoc ? { lat: cachedLoc.lat, lng: cachedLoc.lng } : null) || (
    complaints.length > 0 && typeof complaints[0].latitude === 'number'
      ? { lat: complaints[0].latitude, lng: complaints[0].longitude }
      : { lat: DEFAULT_CIVIC_LOCATION.lat, lng: DEFAULT_CIVIC_LOCATION.lng }
  );

  const effectiveAddress = userAddress || cachedLoc?.address || 'Civic Jurisdiction Center';

  // Mathematically calculate LatLngBounds for a radius in km without relying on circle layer internals
  const calculateRadiusBounds = (lat: number, lng: number, radiusInKm: number): L.LatLngBounds => {
    const latDelta = radiusInKm / 111.32;
    const lngDelta = radiusInKm / (111.32 * Math.max(0.1, Math.cos((lat * Math.PI) / 180)));
    return L.latLngBounds(
      [lat - latDelta, lng - lngDelta],
      [lat + latDelta, lng + lngDelta]
    );
  };

  // Helper for severity color
  const getSeverityColor = (severity: SeverityLevel, isEmergency?: boolean): string => {
    if (isEmergency || severity === 'Critical') return '#ef4444'; // Red
    if (severity === 'High') return '#f97316'; // Orange
    if (severity === 'Medium') return '#eab308'; // Yellow
    return '#22c55e'; // Green
  };

  // Helper to create HTML Leaflet icon
  const createCustomIcon = (complaint: Complaint, isSelected: boolean) => {
    const color = getSeverityColor(complaint.severity, complaint.isEmergency);
    const isEmergency = complaint.isEmergency || complaint.severity === 'Critical';

    const pulseClass = isEmergency ? 'animate-ping opacity-75' : '';
    const borderClass = isSelected ? 'ring-4 ring-blue-500 scale-125 z-50' : '';

    const html = `
      <div class="relative flex items-center justify-center transition-all cursor-pointer">
        ${
          isEmergency
            ? `<div class="absolute w-8 h-8 rounded-full bg-red-500 ${pulseClass}"></div>`
            : ''
        }
        <div class="relative flex items-center justify-center w-7 h-7 rounded-full text-white shadow-lg border-2 border-white ${borderClass}" style="background-color: ${color};">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5-2.5z"/>
          </svg>
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-hazard-pin',
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -28],
    });
  };

  // Create User Pin Leaflet Icon
  const createUserMarkerIcon = () => {
    const userIconHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 rounded-full bg-blue-500 animate-ping opacity-60"></div>
        <div class="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
    `;
    return L.divIcon({
      html: userIconHtml,
      className: 'user-pin',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  // Switch active map tile layer without reloading pins
  const applyTileLayer = useCallback((style: 'streets' | 'satellite' | 'osm', targetMap?: L.Map) => {
    const map = targetMap || mapInstanceRef.current;
    if (!map) return;

    if (!tileGroupRef.current) {
      tileGroupRef.current = L.layerGroup().addTo(map);
    }
    tileGroupRef.current.clearLayers();

    if (style === 'streets') {
      const streetLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; Esri &mdash; Street Map',
          maxZoom: 19,
        }
      );
      tileGroupRef.current.addLayer(streetLayer);
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
      tileGroupRef.current.addLayer(satLayer);
      tileGroupRef.current.addLayer(labelsLayer);
    } else if (style === 'osm') {
      const osmLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        {
          subdomains: 'abc',
          attribution: '&copy; OpenStreetMap contributors, Humanitarian style',
          maxZoom: 19,
        }
      );
      tileGroupRef.current.addLayer(osmLayer);
    }

    map.invalidateSize();
  }, []);

  // Sync map style changes when state updates
  useEffect(() => {
    if (mapInstanceRef.current) {
      applyTileLayer(mapStyle, mapInstanceRef.current);
    }
  }, [mapStyle, applyTileLayer]);

  // Initialize map instance once on mount
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up any stale map instance or leftover leaflet id
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    if ((mapContainerRef.current as any)._leaflet_id) {
      (mapContainerRef.current as any)._leaflet_id = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [effectiveCoords.lat, effectiveCoords.lng],
      zoom: 14,
      zoomControl: false, // We provide custom high-contrast zoom buttons
      scrollWheelZoom: true,
      touchZoom: true,
      doubleClickZoom: true,
    });

    // Assign map ref immediately
    mapInstanceRef.current = map;

    // Attach real map tile layer group
    tileGroupRef.current = L.layerGroup().addTo(map);
    applyTileLayer(mapStyle, map);

    // User Location Marker
    const userMarker = L.marker([effectiveCoords.lat, effectiveCoords.lng], {
      icon: createUserMarkerIcon(),
      zIndexOffset: 1000,
    }).addTo(map);

    userMarker.bindPopup(`
      <div class="p-1.5 font-sans">
        <div class="font-extrabold text-blue-700 text-xs flex items-center space-x-1 mb-0.5">
          <span>📍 ${t('map.active_center', 'MY LIVE LOCATION')}</span>
        </div>
        <div class="text-[11px] text-slate-700 font-medium">${translateText(effectiveAddress) || 'GPS Position Detected'}</div>
        <div class="text-[10px] text-slate-400 font-mono mt-1">${effectiveCoords.lat.toFixed(5)}, ${effectiveCoords.lng.toFixed(5)}</div>
      </div>
    `);

    userMarkerRef.current = userMarker;
    markersGroupRef.current = L.layerGroup().addTo(map);

    // ResizeObserver ensures map recalculates tiles on tab switch, container resize, and viewport changes
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    // Invalidate size in multiple ticks to guarantee tiles render properly
    setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 50);
    setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 200);
    setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 600);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      circleRef.current = null;
      userMarkerRef.current = null;
      markersGroupRef.current = null;
      tileGroupRef.current = null;
      markersMapRef.current.clear();
      initialFitDoneRef.current = false;
    };
  }, []);

  // Update user marker position and popup content when coords change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([effectiveCoords.lat, effectiveCoords.lng]);
      userMarkerRef.current.setPopupContent(`
        <div class="p-1.5 font-sans">
          <div class="font-extrabold text-blue-700 text-xs flex items-center space-x-1 mb-0.5">
            <span>📍 ${t('map.active_center', 'MY LIVE LOCATION')}</span>
          </div>
          <div class="text-[11px] text-slate-700 font-medium">${translateText(effectiveAddress) || 'GPS Position Detected'}</div>
          <div class="text-[10px] text-slate-400 font-mono mt-1">${effectiveCoords.lat.toFixed(5)}, ${effectiveCoords.lng.toFixed(5)}</div>
        </div>
      `);
    }
  }, [effectiveCoords.lat, effectiveCoords.lng, effectiveAddress, t, translateText]);

  // Update radius circle and hazard markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersGroupRef.current) return;

    // Clear existing markers
    markersGroupRef.current.clearLayers();

    // Manage user radius circle
    if (radiusKm && radiusKm > 0) {
      if (circleRef.current && (circleRef.current as any)._map === map) {
        circleRef.current.setLatLng([effectiveCoords.lat, effectiveCoords.lng]);
        circleRef.current.setRadius(radiusKm * 1000);
      } else {
        if (circleRef.current) {
          try {
            circleRef.current.remove();
          } catch {
            // ignore
          }
        }
        circleRef.current = L.circle([effectiveCoords.lat, effectiveCoords.lng], {
          radius: radiusKm * 1000,
          color: '#2563eb',
          fillColor: '#3b82f6',
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: '4, 4',
        }).addTo(map);
      }
    } else if (circleRef.current) {
      try {
        circleRef.current.remove();
      } catch {
        // ignore
      }
      circleRef.current = null;
    }

    // Add complaint markers
    const markersMap = new Map<string, L.Marker>();

    complaints.forEach((c) => {
      if (typeof c.latitude !== 'number' || typeof c.longitude !== 'number' || isNaN(c.latitude) || isNaN(c.longitude)) {
        return;
      }

      const isSelected = c.id === selectedComplaintId;
      const marker = L.marker([c.latitude, c.longitude], {
        icon: createCustomIcon(c, isSelected),
      });

      // Build popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 max-w-xs font-sans';
      popupContent.innerHTML = `
        <div class="rounded-lg overflow-hidden mb-2">
          <img src="${c.photoUrl}" alt="${c.title}" class="w-full h-24 object-cover rounded-md"/>
        </div>
        <div class="flex items-center space-x-1 mb-1">
          <span class="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded ${
            c.isEmergency ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 text-slate-800'
          }">
            ${c.isEmergency ? `🚨 ${t('map.emergency', 'EMERGENCY')}` : translateSeverity(c.severity)}
          </span>
          <span class="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 rounded border border-blue-200">
            ${translateCategory(c.category)}
          </span>
        </div>
        <h4 class="font-bold text-sm text-slate-900 leading-snug mb-1">${translateText(c.title)}</h4>
        <p class="text-xs text-slate-600 mb-2 truncate">${translateText(c.address)}</p>
        <div class="flex items-center justify-between pt-1 border-t border-slate-100">
          <span class="text-[10px] font-medium text-slate-500">ID: ${c.id}</span>
          <button id="view-detail-${c.id}" class="px-2.5 py-1 bg-blue-600 text-white font-semibold text-xs rounded hover:bg-blue-700 transition-colors flex items-center space-x-1">
            <span>🔍 ${t('map.full_details', 'View Details')}</span>
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectComplaint) onSelectComplaint(c);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-detail-${c.id}`);
        if (btn && onSelectComplaint) {
          btn.onclick = () => onSelectComplaint(c);
        }
      });

      markersGroupRef.current?.addLayer(marker);
      markersMap.set(c.id, marker);
    });

    markersMapRef.current = markersMap;

    // Run bounds fit ONLY on initial load if not done yet
    if (!initialFitDoneRef.current && map) {
      initialFitDoneRef.current = true;
      if (radiusKm && radiusKm > 0) {
        const bounds = calculateRadiusBounds(effectiveCoords.lat, effectiveCoords.lng, radiusKm);
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
      } else if (complaints.length > 0) {
        const validCoords = complaints
          .filter((c) => typeof c.latitude === 'number' && typeof c.longitude === 'number' && !isNaN(c.latitude) && !isNaN(c.longitude))
          .map((c) => [c.latitude, c.longitude] as [number, number]);
        if (validCoords.length > 0) {
          map.fitBounds(L.latLngBounds(validCoords), { padding: [40, 40], maxZoom: 15 });
        }
      }
    }
  }, [complaints, radiusKm, selectedComplaintId, effectiveCoords.lat, effectiveCoords.lng]);

  // Adjust camera when radius is changed by user
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !initialFitDoneRef.current) return;

    if (radiusKm && radiusKm > 0) {
      const bounds = calculateRadiusBounds(effectiveCoords.lat, effectiveCoords.lng, radiusKm);
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 });
    } else if (radiusKm === 0 && complaints.length > 0) {
      fitAllHazards();
    }
  }, [radiusKm, effectiveCoords.lat, effectiveCoords.lng]);

  // Fly to selected complaint when user selects one
  useEffect(() => {
    if (!selectedComplaintId || !mapInstanceRef.current) return;
    const target = complaints.find((c) => c.id === selectedComplaintId);
    if (target && typeof target.latitude === 'number' && typeof target.longitude === 'number') {
      mapInstanceRef.current.flyTo([target.latitude, target.longitude], 16, {
        animate: true,
        duration: 0.8,
      });
      const marker = markersMapRef.current.get(selectedComplaintId);
      if (marker) {
        const timer = setTimeout(() => {
          if (mapInstanceRef.current && (marker as any)._map) {
            marker.openPopup();
          }
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedComplaintId, complaints]);

  const fitAllHazards = () => {
    const map = mapInstanceRef.current;
    if (!map || complaints.length === 0) return;
    const validCoords = complaints
      .filter((c) => typeof c.latitude === 'number' && typeof c.longitude === 'number' && !isNaN(c.latitude) && !isNaN(c.longitude))
      .map((c) => [c.latitude, c.longitude] as [number, number]);
    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    }
  };

  const handleCenterOnUser = () => {
    const map = mapInstanceRef.current;
    if (map) {
      if (radiusKm && radiusKm > 0) {
        const bounds = calculateRadiusBounds(effectiveCoords.lat, effectiveCoords.lng, radiusKm);
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 });
      } else {
        map.flyTo([effectiveCoords.lat, effectiveCoords.lng], 15, { animate: true, duration: 1 });
      }
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
    <div className="relative z-0 isolate rounded-3xl overflow-hidden border border-slate-200 shadow-md w-full bg-slate-100" style={{ height, minHeight: height }}>
      <div ref={mapContainerRef} className="w-full" style={{ height, minHeight: height, width: '100%' }} />

      {/* Real Map Style Switcher (Streets / Satellite / OSM) */}
      <div className="absolute top-4 left-4 z-10 flex items-center bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-xl border border-slate-200 text-xs font-bold">
        <button
          type="button"
          onClick={() => setMapStyle('streets')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all ${
            mapStyle === 'streets'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Standard Street Map with roads and city landmarks"
        >
          <MapIcon className="w-3.5 h-3.5" />
          <span>Real Streets</span>
        </button>

        <button
          type="button"
          onClick={() => setMapStyle('satellite')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all ${
            mapStyle === 'satellite'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="High resolution aerial satellite imagery"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Satellite</span>
        </button>

        <button
          type="button"
          onClick={() => setMapStyle('osm')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all ${
            mapStyle === 'osm'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="OpenStreetMap detailed humanitarian view"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>OSM View</span>
        </button>
      </div>

      {/* Custom High-Contrast Zoom Controls */}
      <div className="absolute top-20 left-4 z-10 flex flex-col space-y-1 bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-xl border border-slate-200">
        <button
          type="button"
          onClick={handleZoomIn}
          className="p-2 hover:bg-slate-100 text-slate-700 hover:text-blue-600 rounded-xl transition-all active:scale-95"
          title="Zoom In"
        >
          <Plus className="w-4 h-4 font-bold" />
        </button>
        <div className="w-full h-px bg-slate-200 my-0.5"></div>
        <button
          type="button"
          onClick={handleZoomOut}
          className="p-2 hover:bg-slate-100 text-slate-700 hover:text-blue-600 rounded-xl transition-all active:scale-95"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4 font-bold" />
        </button>
        <div className="w-full h-px bg-slate-200 my-0.5"></div>
        <button
          type="button"
          onClick={handleCenterOnUser}
          className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-all active:scale-95"
          title="Recenter on My Location"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Floating GPS & View Controls Overlay */}
      <div className="absolute top-4 right-4 z-10 flex flex-col items-end space-y-2">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={fitAllHazards}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-xl border border-blue-500 flex items-center space-x-1.5 transition-all hover:scale-105 active:scale-95"
            title="Zoom out and fit all active hazards in view"
          >
            <Navigation className="w-3.5 h-3.5 text-cyan-200" />
            <span>Fit All Hazards ({complaints.length})</span>
          </button>

          <button
            type="button"
            onClick={handleCenterOnUser}
            disabled={isLocating}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl shadow-xl border border-slate-700 flex items-center space-x-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
            title="Center map on my live GPS location"
          >
            {isLocating ? (
              <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            )}
            <span>{isLocating ? 'Locating...' : 'My Live Location'}</span>
          </button>
        </div>

        {effectiveAddress && (
          <div className="px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200 text-[11px] text-slate-700 font-semibold max-w-xs truncate flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping flex-shrink-0"></span>
            <span className="truncate">{effectiveAddress}</span>
            {radiusKm && radiusKm > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                {radiusKm} km radius
              </span>
            )}
          </div>
        )}
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-200/80 text-xs flex flex-wrap items-center gap-3">
        <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Severity:</span>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span className="text-slate-600 font-medium">Low</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block"></span>
          <span className="text-slate-600 font-medium">Medium</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
          <span className="text-slate-600 font-medium">High</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block animate-pulse"></span>
          <span className="text-red-600 font-bold">Critical / Emergency</span>
        </div>
      </div>
    </div>
  );
};
