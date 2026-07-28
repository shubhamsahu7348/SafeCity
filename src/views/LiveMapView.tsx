import React, { useState } from 'react';
import { MapPin, Filter, PlusCircle, Search, Flame, ShieldAlert } from 'lucide-react';
import { Complaint, HazardCategory, ComplaintStatus } from '../types';
import { HazardMap } from '../components/HazardMap';
import { ComplaintDetailModal } from '../components/ComplaintDetailModal';

interface LiveMapViewProps {
  complaints: Complaint[];
  setActiveTab: (tab: string) => void;
  onUpvoteComplaint: (id: string) => void;
}

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

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
    if (selectedStatus !== 'All' && c.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Controls */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-extrabold text-slate-900">Live Hazard Intelligence Map</h1>
          </div>
          <p className="text-xs text-slate-500">Real-time geospatial hazard monitoring & radius filtering</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
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
            {[1, 5, 10].map((r) => (
              <button
                key={r}
                onClick={() => setRadiusKm(r)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  radiusKm === r ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>

          <button
            onClick={() => setActiveTab('report')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Hazard</span>
          </button>
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
            height="560px"
          />
        </div>

        {/* Nearby Hazards Sidebar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[560px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-sm">
              Hazards Within {radiusKm} km ({filteredComplaints.length})
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">Click to Inspect</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pt-3 pr-1">
            {filteredComplaints.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedComplaint(c);
                  setModalComplaint(c);
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 ${
                  selectedComplaint?.id === c.id
                    ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20'
                    : 'border-slate-200/80 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <img
                  src={c.photoUrl}
                  alt={c.title}
                  className="w-14 h-14 object-cover rounded-xl flex-shrink-0 border border-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded ${
                        c.isEmergency ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {c.isEmergency ? 'Emergency' : c.severity}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 truncate">{c.category}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 truncate">{c.title}</h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{c.address}</p>
                </div>
              </div>
            ))}
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
