import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  HardHat,
  Building2,
  AlertTriangle,
  Ban,
  XCircle,
  Tag,
  FileText,
  ThumbsUp,
  Camera,
  Video,
  Film,
  Calendar,
  ExternalLink,
  Smartphone,
  Mail,
  Send,
  User,
  Phone,
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../types';
import { useLanguage } from '../context/LanguageContext';

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
  const { t, translateCategory, translateDepartment, translateStatus, translateSeverity, translateText } = useLanguage();
  const [searchId, setSearchId] = useState<string>(initialComplaintId);
  const [searchedComplaint, setSearchedComplaint] = useState<Complaint | null>(
    initialComplaintId
      ? complaints.find((c) => c.id.toLowerCase() === initialComplaintId.toLowerCase()) || null
      : null
  );

  // SMS & Email notification state
  const [notifyMobile, setNotifyMobile] = useState<string>('');
  const [notifyEmail, setNotifyEmail] = useState<string>('');
  const [smsSentStatus, setSmsSentStatus] = useState<string | null>(null);
  const [emailSentStatus, setEmailSentStatus] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId) return;

    const found = complaints.find(
      (c) => c.id.toLowerCase() === searchId.trim().toLowerCase()
    );
    setSearchedComplaint(found || null);
    setSmsSentStatus(null);
    setEmailSentStatus(null);
  };

  const handleSendSms = async () => {
    const mobileTrimmed = notifyMobile.trim();
    if (!mobileTrimmed || mobileTrimmed.length < 8) {
      alert('Please enter a valid mobile number (e.g. +91 9876543210)');
      return;
    }
    if (searchedComplaint) {
      const cleanNumber = mobileTrimmed.replace(/[^\d+]/g, '');
      const smsMessage = `SafeCity Portal: Complaint ID #${searchedComplaint.id} (${searchedComplaint.title}). Track status: ${window.location.origin}/?id=${searchedComplaint.id}`;
      
      // Open native device SMS composer with prefilled message
      const smsUrl = `sms:${cleanNumber}?body=${encodeURIComponent(smsMessage)}`;
      window.location.href = smsUrl;

      try {
        await fetch('/api/complaints/sms-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: cleanNumber,
            complaintId: searchedComplaint.id,
            message: smsMessage,
          }),
        });
      } catch (err) {
        console.warn('SMS API log:', err);
      }

      setSmsSentStatus(`📱 Native SMS app launched! Message dispatched to ${mobileTrimmed} for Complaint #${searchedComplaint.id}!`);
    }
  };

  const handleSendEmail = async () => {
    const emailTrimmed = notifyEmail.trim();
    if (!emailTrimmed || !emailTrimmed.includes('@')) {
      alert('Please enter a valid email address (e.g. citizen@gmail.com)');
      return;
    }
    if (searchedComplaint) {
      const subject = `[SafeCity] Tracking Details for Complaint ID: ${searchedComplaint.id}`;
      const body = `SafeCity Citizen Portal Complaint Report\n\nComplaint ID: ${searchedComplaint.id}\nTitle: ${searchedComplaint.title}\nCategory: ${searchedComplaint.category}\nDepartment: ${searchedComplaint.assignedDepartment}\nStatus: ${searchedComplaint.status}\nLocation: ${searchedComplaint.address}\n\nTrack Online: ${window.location.origin}/?id=${searchedComplaint.id}`;
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=${encodeURIComponent(emailTrimmed)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(gmailUrl, '_blank');

      try {
        await fetch('/api/complaints/email-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: emailTrimmed,
            complaintId: searchedComplaint.id,
          }),
        });
      } catch (err) {
        console.warn('API notification log:', err);
      }
      setEmailSentStatus(`📧 Complaint ID #${searchedComplaint.id} emailed to ${emailTrimmed}!`);
    }
  };

  const isTrafficComplaint =
    searchedComplaint &&
    (searchedComplaint.assignedDepartment === 'Traffic Police Department' ||
      searchedComplaint.category === 'Traffic Violation' ||
      !!searchedComplaint.challanNumber);

  const STATUS_STEPS: ComplaintStatus[] = isTrafficComplaint
    ? ['Submitted', 'Verified', 'Resolved']
    : ['Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved'];

  const getCurrentStepIndex = () => {
    if (!searchedComplaint) return 0;
    if (searchedComplaint.status === 'Rejected') return 0;
    if (isTrafficComplaint) {
      if (searchedComplaint.status === 'Submitted') return 0;
      if (
        searchedComplaint.status === 'Verified' ||
        searchedComplaint.status === 'Assigned' ||
        searchedComplaint.status === 'In Progress'
      )
        return 1;
      if (searchedComplaint.status === 'Resolved') return 2;
    }
    return STATUS_STEPS.indexOf(searchedComplaint.status);
  };

  const currentStepIdx = getCurrentStepIndex();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Search Header Banner */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
            {t('track.portal', 'Citizen Transparency Portal')}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t('track.title', 'Track Complaint Status & Evidence')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {t('track.subtitle', 'Enter your unique Complaint ID (e.g., SC-2026-8921) to view complete real-time verification, officer notes, worker dispatch, and repair evidence on a single page.')}
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
              placeholder={t('track.placeholder', 'Enter Complaint ID (e.g. SC-2026-8921)')}
              className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center space-x-1.5"
          >
            <Search className="w-4 h-4 text-cyan-200" />
            <span>{t('track.button', 'Track Hazard')}</span>
          </button>
        </form>

        {/* Sample Quick ID Pills */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-500">{t('track.quick_ids', 'Quick Test IDs:')}</span>
          {complaints.slice(0, 4).map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSearchId(c.id);
                setSearchedComplaint(c);
                setSmsSentStatus(null);
                setEmailSentStatus(null);
              }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-mono font-medium transition-colors flex items-center space-x-1"
            >
              <Tag className="w-3 h-3 text-slate-400" />
              <span>{c.id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Single Page Full Details View for Searched Complaint */}
      {searchedComplaint ? (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-8 animate-fadeIn">
          {/* Top Header & Upvote Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3.5 py-1 bg-indigo-950 text-cyan-300 font-mono font-black text-sm rounded-xl border border-indigo-800">
                  #{searchedComplaint.id}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl border border-slate-200">
                  {translateCategory(searchedComplaint.category)}
                </span>
                {searchedComplaint.isEmergency && (
                  <span className="px-3 py-1 bg-gradient-to-r from-rose-600 to-red-600 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center space-x-1 animate-pulse shadow-sm">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Emergency Hazard</span>
                  </span>
                )}
                {searchedComplaint.status === 'Rejected' && (
                  <span className="px-3 py-1 bg-rose-100 text-rose-800 border border-rose-300 font-black text-xs rounded-xl flex items-center space-x-1">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Rejected Report</span>
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black text-slate-950 pt-1">{translateText(searchedComplaint.title)}</h2>
            </div>

            {/* Upvote Button */}
            <button
              onClick={() => onUpvoteComplaint(searchedComplaint.id)}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-extrabold text-xs rounded-xl flex items-center space-x-2 transition-all active:scale-95 shadow-sm"
            >
              <ThumbsUp className="w-4 h-4 text-blue-600" />
              <span>{searchedComplaint.upvotes} Citizen Upvotes</span>
            </button>
          </div>

          {/* Rejection Banner if Rejected */}
          {searchedComplaint.status === 'Rejected' && (
            <div className="bg-rose-50 border-2 border-rose-300 p-5 rounded-3xl space-y-3 shadow-sm">
              <div className="flex items-center space-x-3 text-rose-800">
                <div className="p-2.5 bg-rose-200 text-rose-800 rounded-2xl shrink-0">
                  <Ban className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base text-rose-950">
                    {t('modal.rejected_title', 'Hazard Complaint Rejected (Marked Fake / Invalid)')}
                  </h3>
                  <p className="text-xs text-rose-800 font-medium mt-0.5">
                    Official Notice for Complaint ID <code className="font-mono font-bold">{searchedComplaint.id}</code>
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-white/90 rounded-2xl border border-rose-200 text-xs text-slate-800 space-y-1">
                <div className="font-bold text-rose-900 flex items-center space-x-1">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>{t('track.officer_verdict', 'Officer Verification Verdict:')}</span>
                </div>
                <p className="text-slate-700 font-medium pl-5 leading-relaxed">
                  {searchedComplaint.verificationNotes
                    ? translateText(searchedComplaint.verificationNotes)
                    : t(
                        'track.rejected_default_note',
                        'This complaint was reviewed by municipal officers and determined to be fake, unverified, or out of municipal jurisdiction.'
                      )}
                </p>
                {searchedComplaint.verifiedByOfficer && (
                  <p className="text-[11px] text-slate-500 pl-5 pt-1">
                    Verified By: <strong>{searchedComplaint.verifiedByOfficer}</strong>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Officer Satisfaction Verdict Banner */}
          {searchedComplaint.officerSatisfaction === 'Satisfactory' && (
            <div className="bg-emerald-50 border-2 border-emerald-300 p-4 rounded-3xl space-y-1.5 shadow-sm">
              <div className="flex items-center space-x-2 text-emerald-900 font-extrabold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Officer Re-Verification Verdict: SATISFACTORY (APPROVED)</span>
              </div>
              <p className="text-xs text-emerald-950 font-medium">
                {searchedComplaint.officerReviewNotes
                  ? translateText(searchedComplaint.officerReviewNotes)
                  : 'Officer inspected maintenance repair work and confirmed resolution meets city standards.'}
              </p>
              {searchedComplaint.verifiedByOfficer && (
                <p className="text-[11px] text-emerald-800 font-semibold pt-0.5">
                  Verified By: <strong>{searchedComplaint.verifiedByOfficer}</strong>
                </p>
              )}
            </div>
          )}

          {/* Real-time Lifecycle Progress Timeline */}
          {searchedComplaint.status !== 'Rejected' && (
            <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
                  {t('modal.status_lifecycle', 'Real-Time Complaint Lifecycle')}
                </span>
                <span className="px-3 py-1 bg-indigo-500/20 text-cyan-300 border border-indigo-500/30 text-xs font-extrabold rounded-full">
                  Current Status: {translateStatus(searchedComplaint.status)}
                </span>
              </div>

              {/* Steps Progress Tracker */}
              <div className="relative pt-4 pb-2">
                <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-800 -translate-y-1/2 z-0"></div>
                <div
                  className="absolute top-1/2 left-4 h-1 bg-gradient-to-r from-blue-500 to-emerald-400 -translate-y-1/2 z-0 transition-all duration-500"
                  style={{
                    width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%`,
                  }}
                ></div>

                <div className="relative z-10 flex items-center justify-between">
                  {STATUS_STEPS.map((stepName, idx) => {
                    const isPassed = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;

                    return (
                      <div key={stepName} className="flex flex-col items-center space-y-2">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-xs shadow-md transition-all ${
                            isCurrent
                              ? 'bg-blue-500 text-white ring-4 ring-blue-500/30 scale-110'
                              : isPassed
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}
                        >
                          {isPassed && !isCurrent ? (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          ) : (
                            idx + 1
                          )}
                        </div>
                        <span
                          className={`text-[11px] font-extrabold text-center max-w-[80px] sm:max-w-none ${
                            isCurrent
                              ? 'text-cyan-300'
                              : isPassed
                              ? 'text-emerald-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {translateStatus(stepName)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Traffic Police & Vehicle e-Challan Enforcement Audit Card - Only show when e-Challan is generated and NOT rejected */}
          {searchedComplaint.status !== 'Rejected' && !!searchedComplaint.challanNumber && (
            <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50/80 rounded-3xl border-2 border-amber-300 space-y-4 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-amber-200/80 pb-2.5">
                <div className="flex items-center space-x-2 text-amber-950 font-black text-sm">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                  <span>Traffic Officer Audit & Fine Receipt</span>
                </div>
                {searchedComplaint.challanNumber && (
                  <span className="px-3 py-1 bg-emerald-600 text-white font-mono font-black text-xs rounded-full uppercase tracking-wider shadow-sm">
                    e-Challan Generated
                  </span>
                )}
              </div>

              <div className="p-4 bg-white rounded-2xl border border-amber-200 space-y-3 text-xs">
                {/* Vehicle License Nameplate */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-slate-500 font-extrabold uppercase text-[10px]">Identified Vehicle Nameplate:</span>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 bg-yellow-400 text-black font-mono font-black text-xs rounded border-2 border-slate-900 shadow-sm">IND</span>
                    <span className="font-mono font-black text-xl text-slate-900 tracking-widest">
                      {searchedComplaint.vehiclePlateNumber || searchedComplaint.aiDetectedPlateNumber || 'MH-12-TP-1024'}
                    </span>
                  </div>
                </div>

                {/* Officer / Enforcement Person */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-extrabold uppercase text-[10px]">Officer / Enforcement Person:</span>
                  <span className="font-extrabold text-blue-950 text-xs">
                    {searchedComplaint.verifiedByOfficer || 'Traffic Police Officer'}
                  </span>
                </div>

                {/* Fine & Offense Details */}
                {searchedComplaint.challanNumber ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-extrabold uppercase text-[10px]">Official e-Challan Number:</span>
                      <span className="font-mono font-black text-amber-900 text-sm">{searchedComplaint.challanNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-extrabold uppercase text-[10px]">Traffic Violation Offense:</span>
                      <span className="font-bold text-slate-900">{searchedComplaint.violationType || searchedComplaint.subCategory}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-amber-100 pt-2.5">
                      <span className="text-slate-800 font-black text-xs uppercase">Penalty Fine Issued:</span>
                      <span className="font-mono font-black text-xl text-rose-700">₹{searchedComplaint.fineAmount || 1000}</span>
                    </div>
                    <div className="text-xs text-emerald-800 font-bold pt-2 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between">
                      <span>⚡ Traffic Officer Direct Action</span>
                      <span className="font-mono text-xs bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded font-black">Status: {searchedComplaint.fineStatus || 'Issued'}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-amber-900 font-medium pt-1">
                    ⏳ Pending Officer Verification: Traffic Officer will verify vehicle nameplate and issue fine directly (No field worker required).
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hazard Summary & Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              <div className="flex items-center space-x-2 text-slate-900 font-black text-xs uppercase tracking-wider border-b border-slate-200 pb-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Hazard Summary & Information</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500 font-semibold">{t('modal.category', 'Category:')}</span>
                  <span className="font-bold text-slate-900">{translateCategory(searchedComplaint.category)} ({searchedComplaint.subCategory})</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500 font-semibold">{t('modal.department', 'Assigned Department:')}</span>
                  <span className="font-extrabold text-blue-800">{translateDepartment(searchedComplaint.assignedDepartment)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500 font-semibold">{t('modal.severity', 'Severity Level:')}</span>
                  <span className="font-bold text-amber-700">{translateSeverity(searchedComplaint.severity)}</span>
                </div>
                <div className="flex justify-between items-start border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500 font-semibold flex items-center space-x-1 shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>Location:</span>
                  </span>
                  <span className="font-bold text-slate-800 text-right pl-2">{translateText(searchedComplaint.address)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Reported On:</span>
                  </span>
                  <span className="font-mono font-bold text-slate-700">{new Date(searchedComplaint.reportedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Officer Verification & Dispatched Worker Info */}
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-slate-900 font-black text-xs uppercase tracking-wider border-b border-slate-200 pb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Officer Verification & Worker Dispatch</span>
                </div>

                {searchedComplaint.verifiedByOfficer && (
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center space-x-1 text-slate-500 font-semibold text-[11px]">
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Verified Officer:</span>
                    </div>
                    <div className="font-extrabold text-slate-900">{searchedComplaint.verifiedByOfficer}</div>
                    {searchedComplaint.verificationNotes && (
                      <p className="text-slate-600 italic text-[11px] pt-1">"{translateText(searchedComplaint.verificationNotes)}"</p>
                    )}
                  </div>
                )}

                {!isTrafficComplaint && searchedComplaint.assignedWorkerName ? (
                  <div className="p-3 bg-indigo-50/80 rounded-2xl border border-indigo-200 text-xs space-y-1">
                    <div className="flex items-center space-x-1 text-indigo-900 font-bold text-[11px]">
                      <HardHat className="w-3.5 h-3.5 text-amber-600" />
                      <span>Dispatched Field Worker:</span>
                    </div>
                    <div className="font-extrabold text-indigo-950 text-sm">{searchedComplaint.assignedWorkerName}</div>
                    {searchedComplaint.assignedWorkerContact && (
                      <div className="flex items-center space-x-1 text-indigo-800 font-mono text-[11px] pt-0.5">
                        <Phone className="w-3 h-3 text-indigo-600" />
                        <span>{searchedComplaint.assignedWorkerContact}</span>
                      </div>
                    )}
                  </div>
                ) : !isTrafficComplaint ? (
                  <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-500 italic">
                    Worker dispatch pending officer verification or assignment.
                  </div>
                ) : null}
              </div>

              {/* Description Box */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Citizen Description</span>
                <p className="text-slate-800 font-medium leading-relaxed">{translateText(searchedComplaint.description)}</p>
              </div>
            </div>
          </div>

          {/* Attached Media Evidence (Photos & Video) */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-slate-900 font-black text-sm uppercase tracking-wider border-b border-slate-200 pb-2">
              <Camera className="w-4 h-4 text-indigo-600" />
              <span>Original Reported Photos & Video Evidence</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Main Photo */}
              <div className="rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm bg-slate-100 h-48 relative group">
                <img src={searchedComplaint.photoUrl} alt="Main Hazard Photo" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <span className="absolute bottom-2 left-2 px-2.5 py-0.5 bg-slate-900/80 backdrop-blur-md text-white font-bold text-[10px] rounded-lg">
                  Primary Photo
                </span>
              </div>

              {/* Additional Photos if any */}
              {searchedComplaint.beforePhotos &&
                searchedComplaint.beforePhotos.slice(1).map((p, idx) => (
                  <div key={idx} className="rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm bg-slate-100 h-48 relative group">
                    <img src={p} alt={`Evidence Photo ${idx + 2}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <span className="absolute bottom-2 left-2 px-2.5 py-0.5 bg-slate-900/80 backdrop-blur-md text-white font-bold text-[10px] rounded-lg">
                      Photo {idx + 2}
                    </span>
                  </div>
                ))}

              {/* Attached Video */}
              {(searchedComplaint.videoUrl || (searchedComplaint.videos && searchedComplaint.videos.length > 0)) && (
                <div className="rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm bg-slate-900 h-48 flex items-center justify-center relative">
                  <video
                    src={searchedComplaint.videoUrl || (searchedComplaint.videos && searchedComplaint.videos[0])}
                    controls
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 px-2.5 py-0.5 bg-rose-600 text-white font-bold text-[10px] rounded-lg flex items-center space-x-1">
                    <Film className="w-3 h-3" />
                    <span>Video Evidence</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Before & After Completion Evidence (for field hazards when in progress or resolved) */}
          {!isTrafficComplaint &&
            (searchedComplaint.afterPhotoUrl ||
              (searchedComplaint.afterPhotos && searchedComplaint.afterPhotos.length > 0) ||
              searchedComplaint.workRemarks ||
              searchedComplaint.status === 'In Progress' ||
              searchedComplaint.status === 'Resolved') && (
              <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-5 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2 text-emerald-400 font-extrabold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Worker Repair Progress & Evidence</span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-mono text-xs rounded-full border border-emerald-500/30 font-bold">
                    {searchedComplaint.status === 'Resolved' ? 'Completed Evidence' : 'Active Work Evidence'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Before Photo */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-amber-400 flex items-center space-x-1">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Before Repair (Reported Hazard):</span>
                    </span>
                    <div className="rounded-2xl overflow-hidden border border-slate-800 h-48 bg-slate-950">
                      <img src={searchedComplaint.beforePhotoUrl || searchedComplaint.photoUrl} alt="Before Repair" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  {/* After Photo */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>After Maintenance (Completed Repair):</span>
                    </span>
                    <div className="rounded-2xl overflow-hidden border border-slate-800 h-48 bg-slate-950 flex items-center justify-center">
                      {searchedComplaint.afterPhotoUrl || (searchedComplaint.afterPhotos && searchedComplaint.afterPhotos[0]) ? (
                        <img
                          src={searchedComplaint.afterPhotoUrl || (searchedComplaint.afterPhotos && searchedComplaint.afterPhotos[0])}
                          alt="After Repair"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4 text-slate-500 text-xs">
                          ⏳ Maintenance in progress... Dispatched worker will upload completion photo upon finish.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {searchedComplaint.workRemarks && (
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1">
                    <span className="text-emerald-400 font-bold">Dispatched Technician Work Remarks:</span>
                    <p className="text-slate-300 leading-relaxed font-medium">"{translateText(searchedComplaint.workRemarks)}"</p>
                  </div>
                )}
              </div>
            )}

          {/* Audit Activity Log */}
          {searchedComplaint.timeline && searchedComplaint.timeline.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-slate-900 font-black text-xs uppercase tracking-wider border-b border-slate-200 pb-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Audit & Activity History Log</span>
              </div>

              <div className="space-y-2">
                {searchedComplaint.timeline.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-slate-900">{translateStatus(item.status)}</div>
                      <div className="text-slate-600 text-[11px] mt-0.5">{translateText(item.note)}</div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Receive Complaint ID via SMS & Email Notification Box */}
          <div className="bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/90 p-5 rounded-3xl border border-indigo-200 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5">
              <div className="flex items-center space-x-2 text-indigo-950 font-extrabold text-xs uppercase tracking-wider">
                <Send className="w-4 h-4 text-indigo-600" />
                <span>Receive Complaint Details directly via SMS & Email</span>
              </div>
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-mono font-bold rounded-full">
                Notification Hub
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* SMS Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Mobile Phone Number (SMS Alert):</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={notifyMobile}
                    onChange={(e) => setNotifyMobile(e.target.value)}
                    placeholder="E.g. +91 9876543210"
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={handleSendSms}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center space-x-1 whitespace-nowrap active:scale-95 transition-all"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send SMS</span>
                  </button>
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Email Address (Email Receipt):</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    placeholder="E.g. citizen@gmail.com"
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={handleSendEmail}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center space-x-1 whitespace-nowrap active:scale-95 transition-all"
                  >
                    <Mail className="w-3 h-3" />
                    <span>Send Email</span>
                  </button>
                </div>
              </div>
            </div>

            {smsSentStatus && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-xl flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{smsSentStatus}</span>
              </div>
            )}

            {emailSentStatus && (
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold rounded-xl flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{emailSentStatus}</span>
              </div>
            )}
          </div>
        </div>
      ) : searchId ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">{t('track.no_found', 'No Complaint Found for ID')} "{searchId}"</h3>
          <p className="text-xs text-slate-500">{t('track.verify_id', 'Please verify the Complaint ID and try again.')}</p>
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
          <h3 className="text-base font-extrabold text-slate-900">{t('track.all_complaints', 'All Active City Complaints')}</h3>
          <p className="text-xs text-slate-500">Click any complaint below to view its complete details directly on this page.</p>
          <div className="space-y-3">
            {complaints.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSearchId(c.id);
                  setSearchedComplaint(c);
                  setSmsSentStatus(null);
                  setEmailSentStatus(null);
                }}
                className="p-4 bg-slate-50 hover:bg-slate-100/90 rounded-2xl border border-slate-200 transition-all cursor-pointer flex items-center justify-between shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-mono text-xs font-bold text-blue-700">#{c.id}</span>
                    <span className="text-[11px] font-semibold text-slate-500">{translateCategory(c.category)}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{translateText(c.title)}</h4>
                </div>
                {c.status === 'Rejected' ? (
                  <span className="px-3 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-lg text-xs font-black inline-flex items-center space-x-1">
                    <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{translateStatus('Rejected')}</span>
                  </span>
                ) : c.status === 'In Progress' ? (
                  <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold inline-flex items-center space-x-1 animate-pulse">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{translateStatus('In Progress')}</span>
                  </span>
                ) : c.status === 'Submitted' ? (
                  <span className="px-3 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-bold inline-flex items-center space-x-1">
                    <FileText className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span>{translateStatus('Submitted')}</span>
                  </span>
                ) : c.status === 'Verified' ? (
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-bold inline-flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>{translateStatus('Verified')}</span>
                  </span>
                ) : c.status === 'Assigned' ? (
                  <span className="px-3 py-1 bg-violet-50 text-violet-800 border border-violet-200 rounded-lg text-xs font-bold inline-flex items-center space-x-1">
                    <HardHat className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                    <span>{translateStatus('Assigned')}</span>
                  </span>
                ) : c.status === 'Resolved' ? (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold inline-flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{translateStatus('Resolved')}</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 inline-flex items-center space-x-1">
                    <span>{translateStatus(c.status)}</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
