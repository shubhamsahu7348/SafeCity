import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Complaint, SeverityLevel } from '../types';

interface HazardMapProps {
  complaints: Complaint[];
  selectedComplaintId?: string;
  onSelectComplaint?: (complaint: Complaint) => void;
  radiusKm?: number; // 1, 5, or 10 km
  userCoords?: { lat: number; lng: number };
  height?: string;
}

export const HazardMap: React.FC<HazardMapProps> = ({
  complaints,
  selectedComplaintId,
  onSelectComplaint,
  radiusKm = 5,
  userCoords = { lat: 37.774929, lng: -122.419416 },
  height = '500px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

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
      <div class="relative flex items-center justify-center transition-all">
        ${
          isEmergency
            ? `<div class="absolute w-8 h-8 rounded-full bg-red-500 ${pulseClass}"></div>`
            : ''
        }
        <div class="relative flex items-center justify-center w-7 h-7 rounded-full text-white shadow-lg border-2 border-white ${borderClass}" style="background-color: ${color};">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
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

  // Initialize map instance once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userCoords.lat, userCoords.lng],
        zoom: 13,
        zoomControl: true,
      });

      // CartoDB Positron / OpenStreetMap high quality tiles
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 19,
        }
      ).addTo(map);

      // User Location Marker (Pulse Blue)
      const userIconHtml = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-6 h-6 rounded-full bg-blue-500 animate-ping opacity-60"></div>
          <div class="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md"></div>
        </div>
      `;
      const userMarkerIcon = L.divIcon({
        html: userIconHtml,
        className: 'user-pin',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker([userCoords.lat, userCoords.lng], { icon: userMarkerIcon })
        .addTo(map)
        .bindPopup('<b>Your Current Location</b><br/>SafeCity Radius Center');

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Clean up map on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update radius circle and markers whenever complaints, radius, or selected ID changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersGroupRef.current) return;

    // Clear existing markers
    markersGroupRef.current.clearLayers();

    // Draw user radius circle
    if (circleRef.current) {
      circleRef.current.remove();
    }
    circleRef.current = L.circle([userCoords.lat, userCoords.lng], {
      radius: radiusKm * 1000,
      color: '#2563eb',
      fillColor: '#3b82f6',
      fillOpacity: 0.08,
      weight: 1.5,
      dashArray: '4, 4',
    }).addTo(map);

    // Add complaint markers
    complaints.forEach((c) => {
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
            ${c.isEmergency ? '🚨 EMERGENCY' : c.severity}
          </span>
          <span class="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 rounded border border-blue-200">
            ${c.category}
          </span>
        </div>
        <h4 class="font-bold text-sm text-slate-900 leading-snug mb-1">${c.title}</h4>
        <p class="text-xs text-slate-600 mb-2 truncate">${c.address}</p>
        <div class="flex items-center justify-between pt-1 border-t border-slate-100">
          <span class="text-[10px] font-medium text-slate-500">ID: ${c.id}</span>
          <button id="view-detail-${c.id}" class="px-2.5 py-1 bg-blue-600 text-white font-semibold text-xs rounded hover:bg-blue-700 transition-colors">
            View Details
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectComplaint) onSelectComplaint(c);
      });

      // Attach click handler to popup button
      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-detail-${c.id}`);
        if (btn && onSelectComplaint) {
          btn.onclick = () => onSelectComplaint(c);
        }
      });

      markersGroupRef.current?.addLayer(marker);
    });
  }, [complaints, radiusKm, selectedComplaintId, userCoords]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-200/80 text-xs flex flex-wrap items-center gap-3">
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
