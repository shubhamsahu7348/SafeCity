import React, { useState } from 'react';
import { Layers, Flame, ShieldAlert, Filter } from 'lucide-react';
import { Complaint } from '../types';
import { RiskHeatmap } from '../components/RiskHeatmap';

interface PublicRiskMapViewProps {
  complaints: Complaint[];
}

export const PublicRiskMapView: React.FC<PublicRiskMapViewProps> = ({ complaints }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filtered = complaints.filter((c) => {
    if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
    return true;
  });

  const criticalZoneCount = complaints.filter((c) => c.isEmergency || c.severity === 'Critical').length;
  const highZoneCount = complaints.filter((c) => c.severity === 'High').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Controls */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-extrabold text-white">Public Risk Intelligence GIS Heatmap</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Calculated from hazard density, severity weights, and unresolved duration
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Hazard Categories</option>
            <option value="Road Hazard">Road Hazards</option>
            <option value="Electrical Hazard">Electrical Hazards</option>
            <option value="Water Hazard">Water Hazards</option>
            <option value="Sanitation Hazard">Sanitation Hazards</option>
            <option value="Environmental Hazard">Environmental Hazards</option>
            <option value="Public Safety Hazard">Public Safety</option>
          </select>
        </div>
      </div>

      {/* Heatmap Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-950/20 p-4 rounded-2xl border border-red-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-red-600 uppercase tracking-wider block">Red Hotspot Zones</span>
            <span className="text-2xl font-black text-red-700">{criticalZoneCount} Zones</span>
          </div>
          <Flame className="w-8 h-8 text-red-600 animate-bounce" />
        </div>

        <div className="bg-orange-950/20 p-4 rounded-2xl border border-orange-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider block">Orange High Risk</span>
            <span className="text-2xl font-black text-orange-700">{highZoneCount} Zones</span>
          </div>
          <ShieldAlert className="w-8 h-8 text-orange-600" />
        </div>

        <div className="bg-emerald-950/20 p-4 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider block">Green Clear Zones</span>
            <span className="text-2xl font-black text-emerald-700">84.2% City Area</span>
          </div>
          <Layers className="w-8 h-8 text-emerald-600" />
        </div>
      </div>

      {/* Interactive GIS Heatmap */}
      <RiskHeatmap complaints={filtered} height="580px" />
    </div>
  );
};
