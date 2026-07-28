import React, { useState } from 'react';
import { Search, MapPin, Clock, ShieldCheck, CheckCircle2, HardHat, Building2, AlertTriangle, ArrowRight, Ban, XCircle } from 'lucide-react';
import { Complaint } from '../types';
import { ComplaintDetailModal } from '../components/ComplaintDetailModal';

interface ComplaintTrackingViewProps {
  complaints: Complaint[];
  initialComplaintId?: string;
  onUpvoteComplaint: (id: string) => void;
}

export const ComplaintTrackingView: React.FC<ComplaintTrackingViewProps> = ({
  complaints,
  initialComplaintId = '',
  onUpvoteComplaint,
}) => {
  const [searchId, setSearchId] = useState<string>(initialComplaintId);
  const [searchedComplaint, setSearchedComplaint] = useState<Complaint | null>(
    initialComplaintId
      ? complaints.find((c) => c.id.toLowerCase() === initialComplaintId.toLowerCase()) || null
      : null
  );
  const [selectedComplaintModal, setSelectedComplaintModal] = useState<Complaint | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId) return;

    const found = complaints.find(
      (c) => c.id.toLowerCase() === searchId.trim().toLowerCase()
    );
    setSearchedComplaint(found || null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Search Header Banner */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
            Citizen Transparency Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Track Complaint Status & Evidence
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Enter your unique Complaint ID (e.g., <code className="text-blue-300 font-bold">SC-2026-8921</code>) to track verification, worker assignment, and completion evidence.
          </p>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Complaint ID (e.g. SC-2026-8921)"
              className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            Track Hazard
          </button>
        </form>

        {/* Sample Quick ID Pills */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-500">Quick Test IDs:</span>
          {complaints.slice(0, 4).map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSearchId(c.id);
                setSearchedComplaint(c);
              }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-mono font-medium transition-colors"
            >
              {c.id}
            </button>
          ))}
        </div>
      </div>

      {/* Searched Complaint Display */}
      {searchedComplaint ? (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
          {searchedComplaint.status === 'Rejected' && (
            <div className="bg-rose-50 border-2 border-rose-300 p-5 rounded-2xl space-y-2">
              <div className="flex items-center space-x-2 text-rose-800 font-extrabold text-sm">
                <Ban className="w-5 h-5 text-rose-600" />
                <span>COMPLAINT REJECTED (ID: {searchedComplaint.id})</span>
              </div>
              <p className="text-xs text-rose-950 leading-relaxed font-medium">
                <strong>Officer Verdict:</strong> {searchedComplaint.verificationNotes || 'This hazard report was checked by the department officer and determined to be fake, duplicate, or invalid. No worker dispatch will be made.'}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 font-mono font-bold text-sm rounded-xl">
                {searchedComplaint.id}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-800 font-bold text-xs rounded-xl">
                {searchedComplaint.category}
              </span>
              {searchedComplaint.status === 'Rejected' && (
                <span className="px-3 py-1 bg-rose-100 text-rose-800 border border-rose-300 font-extrabold text-xs rounded-xl flex items-center space-x-1">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Rejected Report</span>
                </span>
              )}
            </div>

            <button
              onClick={() => setSelectedComplaintModal(searchedComplaint)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors"
            >
              <span>View Full Modal Audit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{searchedComplaint.title}</h2>
            <p className="text-xs text-slate-600 mt-1">{searchedComplaint.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hazard Summary</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">Status:</span><span className="font-bold text-blue-700">{searchedComplaint.status}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Assigned Department:</span><span className="font-bold text-slate-800">{searchedComplaint.assignedDepartment}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Address:</span><span className="font-semibold text-slate-700">{searchedComplaint.address}</span></div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 h-40 bg-slate-100">
              <img src={searchedComplaint.photoUrl} alt={searchedComplaint.title} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      ) : searchId ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Complaint Found for ID "{searchId}"</h3>
          <p className="text-xs text-slate-500">Please verify the Complaint ID and try again.</p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">All Active City Complaints</h3>
          <div className="space-y-3">
            {complaints.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSearchId(c.id);
                  setSearchedComplaint(c);
                }}
                className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-mono text-xs font-bold text-blue-700">{c.id}</span>
                    <span className="text-[11px] font-semibold text-slate-500">{c.category}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{c.title}</h4>
                </div>
                {c.status === 'Rejected' ? (
                  <span className="px-3 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-lg text-xs font-black flex items-center space-x-1">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Rejected (Fake)</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
                    {c.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal View */}
      {selectedComplaintModal && (
        <ComplaintDetailModal
          complaint={selectedComplaintModal}
          onClose={() => setSelectedComplaintModal(null)}
          onUpvote={onUpvoteComplaint}
        />
      )}
    </div>
  );
};
