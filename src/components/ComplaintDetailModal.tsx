import React, { useState } from 'react';
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
  Video,
  Camera,
  Film,
  XCircle,
  Ban,
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { ShareComplaintCard } from './ShareComplaintCard';

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
  const { t, translateCategory, translateDepartment, translateStatus, translateSeverity, translateText } = useLanguage();

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
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
                <span>{t('map.emergency', 'Emergency Hazard')}</span>
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
          {/* Rejection Notice Banner if Rejected */}
          {complaint.status === 'Rejected' && (
            <div className="bg-rose-50 border-2 border-rose-300 p-5 rounded-3xl space-y-3 shadow-sm">
              <div className="flex items-center space-x-3 text-rose-800">
                <div className="p-2.5 bg-rose-200 text-rose-800 rounded-2xl flex-shrink-0">
                  <Ban className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base text-rose-950">
                    {t('modal.rejected_title', 'Hazard Complaint Rejected (Marked Fake / Invalid)')}
                  </h3>
                  <p className="text-xs text-rose-800 font-medium mt-0.5">
                    Official Notice for Complaint ID <code className="font-mono font-bold">{complaint.id}</code>
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-white/90 rounded-2xl border border-rose-200 text-xs text-slate-800 space-y-1">
                <div className="font-bold text-rose-900 flex items-center space-x-1">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>{t('track.officer_verdict', 'Officer Verification Verdict:')}</span>
                </div>
                <p className="text-slate-700 font-medium pl-5 leading-relaxed">
                  {complaint.verificationNotes ? translateText(complaint.verificationNotes) : t('track.rejected_default_note', 'This complaint was reviewed by municipal officers and determined to be fake, unverified, or out of municipal jurisdiction.')}
                </p>
                {complaint.verifiedByOfficer && (
                  <p className="text-[11px] text-slate-500 pl-5 pt-1">
                    {t('modal.verified_by', 'Verified By:')} <strong>{complaint.verifiedByOfficer}</strong>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Officer Re-Verification Verdict Banner (Satisfactory) */}
          {complaint.officerSatisfaction === 'Satisfactory' && (
            <div className="bg-emerald-50 border-2 border-emerald-300 p-4 rounded-3xl space-y-1.5 shadow-sm">
              <div className="flex items-center space-x-2 text-emerald-900 font-extrabold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>{t('modal.verdict_satisfactory', 'Officer Re-Verification Verdict: SATISFACTORY (APPROVED)')}</span>
              </div>
              <p className="text-xs text-emerald-950 font-medium">
                {complaint.officerReviewNotes ? translateText(complaint.officerReviewNotes) : t('modal.satisfactory_default', 'Officer inspected maintenance repair work and confirmed resolution meets city standards.')}
              </p>
              {complaint.verifiedByOfficer && (
                <p className="text-[11px] text-emerald-800 font-semibold pt-0.5">
                  {t('modal.verified_by', 'Verified By:')} <strong>{complaint.verifiedByOfficer}</strong>
                </p>
              )}
            </div>
          )}

          {/* Officer Re-Verification Verdict Banner (Unsatisfactory / Rework) */}
          {complaint.officerSatisfaction === 'Unsatisfactory' && (
            <div className="bg-rose-50 border-2 border-rose-300 p-4 rounded-3xl space-y-1.5 shadow-sm">
              <div className="flex items-center space-x-2 text-rose-900 font-extrabold text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>{t('modal.verdict_unsatisfactory', 'Officer Re-Verification Verdict: UNSATISFACTORY (REWORK REQUIRED)')}</span>
              </div>
              <p className="text-xs text-rose-950 font-medium">
                {translateText(complaint.reworkReason || complaint.officerReviewNotes || 'Officer found maintenance repair incomplete or defective. Work has been reassigned to technician for rework.')}
              </p>
              {complaint.assignedWorkerName && (
                <p className="text-[11px] text-rose-800 font-semibold pt-0.5">
                  {t('modal.reassigned_tech', 'Reassigned Technician for Rework:')} <strong>{complaint.assignedWorkerName}</strong>
                </p>
              )}
            </div>
          )}

          {/* Title & Metadata Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-md">
                {translateCategory(complaint.category)}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-md">
                {translateText(complaint.subCategory)}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-md">
                {t('modal.severity', 'Severity:')} {translateSeverity(complaint.severity)}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 leading-snug">
              {translateText(complaint.title)}
            </h2>
            <div className="mt-2 flex flex-wrap items-center text-xs text-slate-500 gap-4">
              <span className="flex items-center">
                <MapPin className="w-3.5 h-3.5 text-blue-500 mr-1" />
                {translateText(complaint.address)}
              </span>
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 text-slate-400 mr-1" />
                {t('modal.reported_at', 'Reported')} {new Date(complaint.reportedAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Visual Step Progress Timeline */}
          <div className="bg-gradient-to-br from-indigo-50/50 to-slate-50 p-5 rounded-2xl border border-indigo-100">
            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-900 mb-4">
              {t('modal.resolution_tracking', 'Resolution Progress Tracking')}
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
                      {translateStatus(step)}
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
                  {t('modal.citizen_desc', 'Citizen Description')}
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {translateText(complaint.description)}
                </p>
              </div>

              {/* Department Assignment Info */}
              <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-blue-900">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>{t('modal.department', 'Assigned Department:')}</span>
                  <span className="text-blue-700 font-extrabold">
                    {translateDepartment(complaint.assignedDepartment)}
                  </span>
                </div>
                {complaint.assignedWorkerName && (
                  <div className="flex items-center space-x-2 text-xs text-slate-700">
                    <HardHat className="w-4 h-4 text-amber-600" />
                    <span>{t('modal.dispatched_worker', 'Dispatched Worker:')}</span>
                    <span className="font-semibold">{complaint.assignedWorkerName}</span>
                  </div>
                )}
              </div>

              {/* Traffic Police & Vehicle e-Challan Receipt Card */}
              {(complaint.vehiclePlateNumber || complaint.challanNumber || complaint.assignedDepartment === 'Traffic Police Department') && (
                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50/80 rounded-2xl border-2 border-amber-300 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2 text-amber-950 font-black text-sm">
                      <ShieldCheck className="w-5 h-5 text-amber-700" />
                      <span>Traffic Police Enforcement & e-Challan</span>
                    </div>
                    {complaint.challanNumber && (
                      <span className="px-2.5 py-0.5 bg-emerald-600 text-white font-mono font-bold text-[10px] rounded-full uppercase tracking-wider shadow-sm">
                        e-Challan Issued
                      </span>
                    )}
                  </div>

                  {/* Vehicle License Plate Display */}
                  <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-amber-200">
                    <div className="px-3 py-1.5 bg-yellow-400 text-black font-black font-mono text-xs rounded-lg border-2 border-slate-900 shadow-sm flex items-center space-x-1 shrink-0">
                      <span>IND</span>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Identified Vehicle Nameplate</div>
                      <div className="font-mono font-black text-lg text-slate-900 tracking-widest">
                        {complaint.vehiclePlateNumber || complaint.aiDetectedPlateNumber || 'MH-12-AB-1234'}
                      </div>
                    </div>
                  </div>

                  {/* Fine & Challan Details if issued */}
                  {complaint.challanNumber ? (
                    <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-600">e-Challan Number:</span>
                        <span className="font-mono font-extrabold text-amber-800">{complaint.challanNumber}</span>
                      </div>
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-600">Violation Offense:</span>
                        <span className="text-slate-900">{complaint.violationType || complaint.subCategory}</span>
                      </div>
                      <div className="flex items-center justify-between font-bold border-t border-slate-100 pt-2">
                        <span className="text-slate-700">Penalty Fine Amount:</span>
                        <span className="font-mono font-black text-base text-rose-700">₹{complaint.fineAmount || 1000}</span>
                      </div>
                      <div className="text-[11px] text-emerald-800 font-bold pt-1 bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-center justify-between">
                        <span>⚡ Officer Direct Action (No field worker required)</span>
                        <span className="font-mono text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">Fine Status: {complaint.fineStatus || 'Issued'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-900 font-medium">
                      ℹ️ Reported to Traffic Police Department. Traffic Officers will verify vehicle plate and levy fine directly.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Photo & Video Evidence Display */}
            <div className="space-y-4">
              {/* Photo Gallery */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                    <Camera className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{t('modal.photos_title', 'Reported Hazard Photos')} ({complaint.photos?.length || 1})</span>
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(complaint.photos && complaint.photos.length > 0
                    ? complaint.photos
                    : [complaint.photoUrl]
                  ).map((url, idx) => (
                    <div key={idx} className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-40 bg-slate-900 group">
                      <img
                        src={url}
                        alt={`${complaint.title} photo ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-950/80 backdrop-blur-md text-white font-mono text-[10px] font-bold rounded-lg border border-slate-700">
                        Photo #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video Evidence List */}
              {((complaint.videos && complaint.videos.length > 0) || complaint.videoUrl) && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <h4 className="text-xs font-bold text-cyan-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <Video className="w-3.5 h-3.5 text-cyan-600" />
                    <span>{t('modal.videos_title', 'Hazard Video Recordings')} ({complaint.videos?.length || (complaint.videoUrl ? 1 : 0)})</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {(complaint.videos && complaint.videos.length > 0
                      ? complaint.videos
                      : complaint.videoUrl
                      ? [complaint.videoUrl]
                      : []
                    ).map((vUrl, idx) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded-2xl border border-slate-800 shadow-md">
                        <div className="flex items-center justify-between pb-1 px-1 text-[11px] font-mono text-cyan-400 font-bold">
                          <span>Video Clip #{idx + 1}</span>
                          <span className="text-[10px] text-slate-400">{t('modal.media_rec', 'Media Recording')}</span>
                        </div>
                        {vUrl.startsWith('data:video') || vUrl.endsWith('.mp4') || vUrl.endsWith('.webm') ? (
                          <video src={vUrl} controls className="w-full h-40 rounded-xl object-cover bg-black" />
                        ) : (
                          <a
                            href={vUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-slate-900 hover:bg-slate-800 text-cyan-300 font-mono text-xs rounded-xl flex items-center justify-between transition-colors"
                          >
                            <span className="truncate">▶ Play Media Video Link #{idx + 1}</span>
                            <ExternalLink className="w-4 h-4 ml-2 flex-shrink-0" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Before & After Completion Evidence (if in progress or resolved) */}
          {(complaint.afterPhotoUrl ||
            complaint.beforePhotoUrl ||
            (complaint.beforePhotos && complaint.beforePhotos.length > 0) ||
            (complaint.afterPhotos && complaint.afterPhotos.length > 0) ||
            complaint.workRemarks ||
            complaint.status === 'In Progress' ||
            complaint.status === 'Resolved') && (
            <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-5 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2 text-emerald-400 font-extrabold text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>{t('modal.field_evidence', 'Field Technician Onsite Maintenance Evidence')}</span>
                </div>
                {complaint.aiConfidenceScore && (
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{t('modal.ai_audit', 'AI Audit:')} {complaint.aiConfidenceScore}% {t('modal.match', 'Match')}</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* BEFORE MAINTENANCE BOX */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <span>1. {t('modal.before_maint', 'BEFORE Maintenance (Onsite Arrival)')}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {(complaint.beforePhotos?.length || 1)} Photo(s) • {(complaint.beforeVideos?.length || (complaint.beforeVideoUrl ? 1 : 0))} Video(s)
                    </span>
                  </div>

                  {/* Before Photos */}
                  <div className="grid grid-cols-2 gap-2">
                    {(complaint.beforePhotos && complaint.beforePhotos.length > 0
                      ? complaint.beforePhotos
                      : [complaint.beforePhotoUrl || complaint.photoUrl]
                    ).map((url, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden border border-amber-500/20 h-28 bg-black">
                        <img src={url} alt={`Before ${idx + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/80 text-amber-300 font-mono text-[9px] rounded font-bold">
                          Before #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Before Videos */}
                  {((complaint.beforeVideos && complaint.beforeVideos.length > 0) || complaint.beforeVideoUrl) && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <span className="text-[10px] font-bold text-amber-300 font-mono uppercase">
                        {t('modal.before_videos', 'Before Video Recordings:')}
                      </span>
                      <div className="grid grid-cols-1 gap-1.5">
                        {(complaint.beforeVideos && complaint.beforeVideos.length > 0
                          ? complaint.beforeVideos
                          : complaint.beforeVideoUrl
                          ? [complaint.beforeVideoUrl]
                          : []
                        ).map((vUrl, idx) => (
                          <div key={idx} className="p-1.5 bg-black rounded-xl border border-amber-900/40">
                            {vUrl.startsWith('data:video') || vUrl.endsWith('.mp4') || vUrl.endsWith('.webm') ? (
                              <video src={vUrl} controls className="w-full h-28 rounded-lg object-cover" />
                            ) : (
                              <a
                                href={vUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-slate-900 hover:bg-slate-800 text-amber-300 font-mono text-xs rounded-lg flex items-center justify-between"
                              >
                                <span>▶ Before Video #{idx + 1}</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* AFTER MAINTENANCE BOX */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <span>2. {t('modal.after_maint', 'AFTER Maintenance (Completed)')}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {(complaint.afterPhotos?.length || (complaint.afterPhotoUrl ? 1 : 0))} Photo(s) • {(complaint.completionVideos?.length || (complaint.completionVideoUrl ? 1 : 0))} Video(s)
                    </span>
                  </div>

                  {/* After Photos */}
                  {(complaint.afterPhotos && complaint.afterPhotos.length > 0) || complaint.afterPhotoUrl ? (
                    <div className="grid grid-cols-2 gap-2">
                      {(complaint.afterPhotos && complaint.afterPhotos.length > 0
                        ? complaint.afterPhotos
                        : [complaint.afterPhotoUrl!]
                      ).map((url, idx) => (
                        <div key={idx} className="relative rounded-xl overflow-hidden border border-emerald-500/20 h-28 bg-black">
                          <img src={url} alt={`After ${idx + 1}`} className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/80 text-emerald-300 font-mono text-[9px] rounded font-bold">
                            After #{idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-center text-xs text-slate-400 font-medium">
                      {t('modal.maint_in_progress', 'Maintenance repair in progress. Completion photos will be uploaded upon work resolution.')}
                    </div>
                  )}

                  {/* After Videos */}
                  {((complaint.completionVideos && complaint.completionVideos.length > 0) || complaint.completionVideoUrl) && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <span className="text-[10px] font-bold text-emerald-300 font-mono uppercase">
                        {t('modal.completion_videos', 'Completion Repair Videos:')}
                      </span>
                      <div className="grid grid-cols-1 gap-1.5">
                        {(complaint.completionVideos && complaint.completionVideos.length > 0
                          ? complaint.completionVideos
                          : complaint.completionVideoUrl
                          ? [complaint.completionVideoUrl]
                          : []
                        ).map((vUrl, idx) => (
                          <div key={idx} className="p-1.5 bg-black rounded-xl border border-emerald-900/40">
                            {vUrl.startsWith('data:video') || vUrl.endsWith('.mp4') || vUrl.endsWith('.webm') ? (
                              <video src={vUrl} controls className="w-full h-28 rounded-lg object-cover" />
                            ) : (
                              <a
                                href={vUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-slate-900 hover:bg-slate-800 text-emerald-300 font-mono text-xs rounded-lg flex items-center justify-between"
                              >
                                <span>▶ Completion Video #{idx + 1}</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {complaint.workRemarks && (
                <div className="text-xs text-slate-200 font-medium bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <strong className="text-emerald-400">{t('modal.worker_remarks', 'Worker Field Remarks:')}</strong> {translateText(complaint.workRemarks)}
                </div>
              )}
            </div>
          )}

          {/* Timeline Activity Log */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
              {t('modal.audit_log', 'Official Audit Timeline Log')}
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
                      <span>{event.actor} ({translateText(event.actorRole)})</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{translateText(event.note)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Send Complaint ID to Gmail & Sharing Options Card */}
          <ShareComplaintCard complaint={complaint} />
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => onUpvote && onUpvote(complaint.id)}
            className="px-4 py-2 bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-xl font-semibold text-xs flex items-center space-x-1.5 transition-colors"
          >
            <ThumbsUp className="w-4 h-4 text-blue-600" />
            <span>{t('modal.upvote', 'Upvote')} ({complaint.upvotes})</span>
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
              <span>{t('modal.share_link', 'Share Tracking Link')}</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center space-x-1.5"
            >
              <X className="w-4 h-4 text-slate-300" />
              <span>{t('modal.close', 'Close')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
