import React from 'react';
import {
  X,
  MapPin,
  Clock,
  ShieldCheck,
  HardHat,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Building2,
  Calendar,
  Share2,
  ThumbsUp,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../types';

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  onClose: () => void;
  onUpvote?: (id: string) => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  onClose,
  onUpvote,
}) => {
  if (!complaint) return null;

  const STATUS_STEPS: ComplaintStatus[] = [
    'Submitted',
    'Verified',
    'Assigned',
    'In Progress',
    'Resolved',
  ];

  const getCurrentStepIndex = () => {
    if (complaint.status === 'Rejected') return 0;
    return STATUS_STEPS.indexOf(complaint.status);
  };

  const currentStepIdx = getCurrentStepIndex();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white flex items-center justify-between border-b border-indigo-900/50 shadow-md">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-indigo-500/20 text-cyan-300 border border-indigo-500/40 font-mono font-black text-xs rounded-lg shadow-sm">
              {complaint.id}
            </span>
            {complaint.isEmergency && (
              <span className="px-3 py-1 bg-gradient-to-r from-rose-600 to-red-600 text-white font-black text-xs uppercase tracking-wider rounded-lg flex items-center space-x-1 animate-pulse border border-rose-400/40 shadow-sm">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Emergency Hazard</span>
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-indigo-300 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
          {/* Title & Metadata Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-md">
                {complaint.category}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-md">
                {complaint.subCategory}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-md">
                Severity: {complaint.severity}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 leading-snug">
              {complaint.title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center text-xs text-slate-500 gap-4">
              <span className="flex items-center">
                <MapPin className="w-3.5 h-3.5 text-blue-500 mr-1" />
                {complaint.address}
              </span>
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 text-slate-400 mr-1" />
                Reported {new Date(complaint.reportedAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Visual Step Progress Timeline */}
          <div className="bg-gradient-to-br from-indigo-50/50 to-slate-50 p-5 rounded-2xl border border-indigo-100">
            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-900 mb-4">
              Resolution Progress Tracking
            </h4>
            <div className="relative flex items-center justify-between">
              {/* Connecting Line */}
              <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-200 -translate-y-1/2 z-0 rounded-full" />
              <div
                className="absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 -translate-y-1/2 z-0 transition-all duration-500 rounded-full"
                style={{
                  width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%`,
                }}
              />

              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div
                    key={step}
                    className="relative z-10 flex flex-col items-center group cursor-default"
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                        isPassed
                          ? 'bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-md'
                          : 'bg-white text-slate-400 border-2 border-slate-300'
                      } ${isCurrent ? 'ring-4 ring-indigo-100 scale-110 shadow-lg' : ''}`}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span
                      className={`mt-2 text-[11px] font-bold text-center ${
                        isCurrent
                          ? 'text-indigo-600 font-black'
                          : isPassed
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description & Photo Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Citizen Description
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {complaint.description}
                </p>
              </div>

              {/* Department Assignment Info */}
              <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-blue-900">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Assigned Department:</span>
                  <span className="text-blue-700 font-extrabold">
                    {complaint.assignedDepartment}
                  </span>
                </div>
                {complaint.assignedWorkerName && (
                  <div className="flex items-center space-x-2 text-xs text-slate-700">
                    <HardHat className="w-4 h-4 text-amber-600" />
                    <span>Dispatched Worker:</span>
                    <span className="font-semibold">{complaint.assignedWorkerName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Photo / Evidence Display */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Original Reported Hazard Image
              </h4>
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-48 bg-slate-100">
                <img
                  src={complaint.photoUrl}
                  alt={complaint.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Before & After Completion Evidence (if resolved or in progress) */}
          {(complaint.afterPhotoUrl || complaint.workRemarks) && (
            <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-900 font-extrabold text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Worker Repair Evidence & AI Verification</span>
                </div>
                {complaint.aiConfidenceScore && (
                  <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Score: {complaint.aiConfidenceScore}% Match</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 mb-1">
                    BEFORE REPAIR
                  </span>
                  <img
                    src={complaint.beforePhotoUrl || complaint.photoUrl}
                    alt="Before"
                    className="w-full h-32 object-cover rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-emerald-700 mb-1">
                    AFTER REPAIR
                  </span>
                  <img
                    src={complaint.afterPhotoUrl || complaint.photoUrl}
                    alt="After"
                    className="w-full h-32 object-cover rounded-xl border border-emerald-400"
                  />
                </div>
              </div>

              {complaint.workRemarks && (
                <p className="text-xs text-emerald-950 font-medium bg-white/80 p-3 rounded-xl border border-emerald-200">
                  <strong className="text-emerald-800">Worker Remarks:</strong> {complaint.workRemarks}
                </p>
              )}
            </div>
          )}

          {/* Timeline Activity Log */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
              Official Audit Timeline Log
            </h4>
            <div className="space-y-3">
              {complaint.timeline.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                >
                  <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg font-bold flex-shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span>{event.actor} ({event.actorRole})</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{event.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => onUpvote && onUpvote(complaint.id)}
            className="px-4 py-2 bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-xl font-semibold text-xs flex items-center space-x-1.5 transition-colors"
          >
            <ThumbsUp className="w-4 h-4 text-blue-600" />
            <span>Upvote ({complaint.upvotes})</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/?id=${complaint.id}`
                );
                alert(`Tracking link copied for ID: ${complaint.id}`);
              }}
              className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl font-semibold text-xs flex items-center space-x-1.5 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Tracking Link</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
