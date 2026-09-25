import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Target, Navigation, RefreshCw, Globe, Map as MapIcon } from 'lucide-react';
import { Complaint } from '../types';

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  onChangeLocation: (lat: number, lng: number, address?: string) => void;
  nearbyComplaints?: Complaint[];
  height?: string;
  isLocating?: boolean;
  onLocateMe?: () => void;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  latitude,
  longitude,
  address,
  onChangeLocation,
  nearbyComplaints = [],
  height = '280px',
  isLocating = false,
  onLocateMe,
}) => {
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileGroupRef = useRef<L.LayerGroup | null>(null);
  const pinMarkerRef = useRef<L.Marker | null>(null);
  const nearbyGroupRef = useRef<L.LayerGroup | null>(null);

  // Custom pulsating hazard pin for report location
  const createHazardPinIcon = () => {
    const html = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 rounded-full bg-rose-500 animate-ping opacity-75"></div>
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-rose-600 text-white shadow-xl border-2 border-white ring-4 ring-rose-500/30">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5-2.5z"/>
          </svg>
        </div>
      </div>
    `;
    return L.divIcon({
      html,
      className: 'custom-hazard-pin',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  };

  // Nearby existing hazard icon
  const createNearbyPinIcon = (cat: string) => {
    const html = `
      <div class="relative flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white shadow-md border-2 border-white opacity-85">
        <span class="text-[10px] font-black">!</span>
      </div>
    `;
    return L.divIcon({
      html,
      className: 'custom-nearby-pin',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  // Apply tile style
  const applyTileLayer = (style: 'streets' | 'satellite', targetMap?: L.Map) => {
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
    } else {
      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; Esri &mdash; Satellite',
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
    }

    map.invalidateSize();
  };

  useEffect(() => {
    if (mapInstanceRef.current) {
      applyTileLayer(mapStyle, mapInstanceRef.current);
    }
  }, [mapStyle]);

  // Initialize Map
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
      center: [latitude, longitude],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    mapInstanceRef.current = map;
    tileGroupRef.current = L.layerGroup().addTo(map);
    applyTileLayer(mapStyle, map);

    // Draggable Hazard Pin
    const marker = L.marker([latitude, longitude], {
      icon: createHazardPinIcon(),
      draggable: true,
      zIndexOffset: 1000,
    }).addTo(map);

    marker.bindPopup(`
      <div class="p-1 font-sans text-xs">
        <span class="font-extrabold text-rose-600 block mb-0.5">📍 REPORTED HAZARD LOCATION</span>
        <span class="text-slate-600">${address || 'Selected GPS Point'}</span>
        <span class="text-[10px] text-slate-400 block mt-1">Drag pin or click map to move</span>
      </div>
    `);

    // Handle pin drag end
    marker.on('dragend', async () => {
      const pos = marker.getLatLng();
      onChangeLocation(pos.lat, pos.lng);
      // Attempt reverse geocoding
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.lat}&lon=${pos.lng}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.display_name) {
            onChangeLocation(pos.lat, pos.lng, data.display_name);
          }
        }
      } catch {
        // Ignore fallback
      }
    });

    // Handle map click
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      onChangeLocation(lat, lng);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.display_name) {
            onChangeLocation(lat, lng, data.display_name);
          }
        }
      } catch {
        // Ignore fallback
      }
    });

    pinMarkerRef.current = marker;
    nearbyGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Resize observer
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      ro = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      ro.observe(mapContainerRef.current);
    }

    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      if (ro) ro.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      pinMarkerRef.current = null;
      nearbyGroupRef.current = null;
      tileGroupRef.current = null;
    };
  }, []);

  // Sync pin position when props change
  useEffect(() => {
    if (!pinMarkerRef.current || !(pinMarkerRef.current as any)._map || !mapInstanceRef.current) return;
    const cur = pinMarkerRef.current.getLatLng();
    if (Math.abs(cur.lat - latitude) > 0.0001 || Math.abs(cur.lng - longitude) > 0.0001) {
      pinMarkerRef.current.setLatLng([latitude, longitude]);
      mapInstanceRef.current.panTo([latitude, longitude]);
    }
  }, [latitude, longitude]);

  // Render nearby complaints on map
  useEffect(() => {
    if (!nearbyGroupRef.current) return;
    nearbyGroupRef.current.clearLayers();

    nearbyComplaints.forEach((c) => {
      if (typeof c.latitude !== 'number' || typeof c.longitude !== 'number') return;
      const m = L.marker([c.latitude, c.longitude], {
        icon: createNearbyPinIcon(c.category),
      });
      m.bindPopup(`
        <div class="p-1 font-sans text-xs">
          <span class="font-extrabold text-amber-600 block">⚠️ Already Reported Hazard</span>
          <span class="font-bold text-slate-800">${c.title}</span>
          <span class="text-[10px] text-slate-500 block mt-0.5">Status: ${c.status} (${c.assignedDepartment})</span>
        </div>
      `);
      nearbyGroupRef.current?.addLayer(m);
    });
  }, [nearbyComplaints]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([latitude, longitude], 16, { animate: true });
      if (pinMarkerRef.current && (pinMarkerRef.current as any)._map) {
        pinMarkerRef.current.openPopup();
      }
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-indigo-200/80 shadow-md w-full bg-slate-100">
      <div ref={mapContainerRef} style={{ height, minHeight: height, width: '100%' }} />

      {/* Floating Instructions & Recenter Buttons */}
      <div className="absolute top-2.5 left-2.5 z-10 flex items-center space-x-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow text-[11px] font-bold text-slate-700">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
        <span>Click or drag pin to fine-tune exact hazard position</span>
      </div>

      <div className="absolute top-2.5 right-2.5 z-10 flex items-center space-x-1.5">
        {/* Style Switcher */}
        <div className="flex items-center bg-white/95 backdrop-blur-md p-0.5 rounded-xl border border-slate-200 shadow text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setMapStyle('streets')}
            className={`px-2 py-1 rounded-lg transition-all flex items-center space-x-1 ${
              mapStyle === 'streets' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Real Street Map"
          >
            <MapIcon className="w-3 h-3" />
            <span>Streets</span>
          </button>
          <button
            type="button"
            onClick={() => setMapStyle('satellite')}
            className={`px-2 py-1 rounded-lg transition-all flex items-center space-x-1 ${
              mapStyle === 'satellite' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Satellite Aerial Map"
          >
            <Globe className="w-3 h-3" />
            <span>Satellite</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleRecenter}
          className="px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-900 text-white rounded-xl text-[11px] font-extrabold shadow flex items-center space-x-1 transition-all"
          title="Recenter pin in view"
        >
          <Target className="w-3.5 h-3.5 text-cyan-300" />
          <span>Recenter</span>
        </button>

        {onLocateMe && (
          <button
            type="button"
            onClick={onLocateMe}
            disabled={isLocating}
            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-extrabold shadow flex items-center space-x-1 transition-all disabled:opacity-60"
            title="Use device GPS"
          >
            {isLocating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-white" />
            )}
            <span>GPS</span>
          </button>
        )}
      </div>

      {/* Legend footnote */}
      <div className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-slate-600 font-semibold border border-slate-200 shadow-sm flex items-center space-x-2">
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-rose-600 inline-block"></span>
          <span>Your Hazard Pin</span>
        </span>
        {nearbyComplaints.length > 0 && (
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
            <span>{nearbyComplaints.length} Existing Nearby Hazards</span>
          </span>
        )}
      </div>
    </div>
  );
};
