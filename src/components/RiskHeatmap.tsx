import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Complaint } from '../types';

interface RiskHeatmapProps {
  complaints: Complaint[];
  height?: string;
  center?: { lat: number; lng: number };
}

export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({
  complaints,
  height = '500px',
  center = { lat: 37.774929, lng: -122.419416 },
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const heatmapLayerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [center.lat, center.lng],
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
          <div class="font-extrabold text-sm mb-1">${c.title}</div>
          <div class="text-xs text-slate-600 mb-1">Zone Risk Intensity: <span class="font-bold text-red-600">${c.severity}</span></div>
          <div class="text-xs text-slate-500">${c.address}</div>
        </div>
      `;

      outerCircle.bindPopup(popupContent);
      innerCircle.bindPopup(popupContent);

      heatmapLayerGroupRef.current?.addLayer(outerCircle);
      heatmapLayerGroupRef.current?.addLayer(innerCircle);
    });
  }, [complaints]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {/* Heatmap Legend */}
      <div className="absolute top-4 right-4 z-[400] bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-800 text-white text-xs space-y-2 shadow-xl max-w-xs">
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
