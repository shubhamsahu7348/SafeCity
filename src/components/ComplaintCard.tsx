import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  MapPin,
  Clock,
  ThumbsUp,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  HardHat,
  FileText,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { Complaint } from '../types';

interface ComplaintCardProps {
  complaint: Complaint;
  onSelect: (complaint: Complaint) => void;
  onUpvote?: (id: string) => void;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  onSelect,
  onUpvote,
}) => {
  const { t, translateCategory, translateText } = useLanguage();

  const getSeverityBadge = () => {
    if (complaint.isEmergency || complaint.severity === 'Critical') {
      return (
        <span className="px-2.5 py-1 text-xs font-black uppercase rounded-full bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md flex items-center space-x-1 animate-pulse border border-rose-400/40">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{t('severity.critical', 'Critical')}</span>
        </span>
      );
    }
    if (complaint.severity === 'High') {
      return (
        <span className="px-2.5 py-1 text-xs font-extrabold uppercase rounded-full bg-orange-500/15 text-orange-700 border border-orange-300">
          {t('severity.high', 'High')}
        </span>
      );
    }
    if (complaint.severity === 'Medium') {
      return (
        <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-full bg-amber-500/15 text-amber-800 border border-amber-300">
          {t('severity.medium', 'Medium')}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-300">
        {t('severity.low', 'Low')}
      </span>
    );
  };

  const getStatusBadge = () => {
    switch (complaint.status) {
      case 'Submitted':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-900/80 backdrop-blur-md text-slate-200 border border-slate-700/80 inline-flex items-center space-x-1 shadow-sm whitespace-nowrap">
            <FileText className="w-3 h-3 text-cyan-300 shrink-0" />
            <span>{t('status.submitted', 'Submitted')}</span>
          </span>
        );
      case 'Verified':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-500/20 text-indigo-300 backdrop-blur-md border border-indigo-400/40 inline-flex items-center space-x-1 shadow-sm whitespace-nowrap">
            <ShieldCheck className="w-3 h-3 text-cyan-300 shrink-0" />
            <span>{t('status.verified', 'Verified')}</span>
          </span>
        );
      case 'Assigned':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-violet-500/20 text-violet-300 backdrop-blur-md border border-violet-400/40 inline-flex items-center space-x-1 shadow-sm whitespace-nowrap">
            <HardHat className="w-3 h-3 text-violet-300 shrink-0" />
            <span>{t('status.assigned', 'Assigned')}</span>
          </span>
        );
      case 'In Progress':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/25 text-amber-200 backdrop-blur-md border border-amber-400/40 inline-flex items-center space-x-1 animate-pulse shadow-sm whitespace-nowrap">
            <Clock className="w-3 h-3 text-amber-300 shrink-0" />
            <span>{t('status.in_progress', 'In Progress')}</span>
          </span>
        );
      case 'Resolved':
        return (
          <span className="px-2.5 py-1 text-xs font-black rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md inline-flex items-center space-x-1 border border-emerald-400/40 whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span>{t('status.resolved', 'Resolved')}</span>
          </span>
        );
      case 'Work Submitted':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-500/25 text-purple-200 backdrop-blur-md border border-purple-400/40 inline-flex items-center space-x-1 shadow-sm whitespace-nowrap">
            <Sparkles className="w-3 h-3 text-purple-300 shrink-0" />
            <span>{t('status.work_submitted', 'Work Submitted')}</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-500/25 text-rose-200 backdrop-blur-md border border-rose-400/40 inline-flex items-center space-x-1 shadow-sm whitespace-nowrap">
            <XCircle className="w-3 h-3 text-rose-300 shrink-0" />
            <span>{t('status.rejected', 'Rejected')}</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`group bg-white rounded-2xl border transition-all duration-300 overflow-hidden vibrant-card-shadow vibrant-card-hover flex flex-col justify-between ${
      complaint.isEmergency ? 'border-rose-400/80 ring-2 ring-rose-400/30 bg-rose-50/20' : 'border-indigo-100/90 hover:border-indigo-300/80'
    }`}>
      <div>
        {/* Card Header Media Image */}
        <div className="relative h-48 overflow-hidden bg-slate-900">
          <img
            src={complaint.photoUrl}
            alt={complaint.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
            {getSeverityBadge()}
            <span className="px-2.5 py-1 text-xs font-bold bg-slate-950/80 backdrop-blur-md text-cyan-200 border border-slate-700/60 rounded-full shadow-sm">
              {translateCategory(complaint.category)}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            {getStatusBadge()}
          </div>

          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
            <span className="bg-slate-950/80 backdrop-blur-md px-2.5 py-0.5 rounded-lg font-mono text-[11px] border border-slate-700/60 text-slate-300">
              ID: {complaint.id}
            </span>
            <span className="flex items-center space-x-1 bg-slate-950/80 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-[11px] border border-slate-700/60 text-slate-300">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>{new Date(complaint.reportedAt).toLocaleDateString()}</span>
            </span>
          </div>
        </div>

        {/* Card Body Content */}
        <div className="p-4 space-y-2">
          <h3
            onClick={() => onSelect(complaint)}
            className="font-black text-slate-900 text-base group-hover:text-indigo-600 transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {translateText(complaint.title)}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
            {translateText(complaint.description)}
          </p>

          {/* Vehicle License Nameplate Badge */}
          {(complaint.vehiclePlateNumber || complaint.aiDetectedPlateNumber) && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-amber-100/80 text-amber-950 rounded-lg border border-amber-300 font-mono text-[11px] font-black w-fit mt-1">
              <span className="px-1 py-0.2 bg-yellow-400 text-slate-900 text-[9px] font-bold rounded">IND</span>
              <span>{complaint.vehiclePlateNumber || complaint.aiDetectedPlateNumber}</span>
              {complaint.challanNumber && (
                <span className="ml-1 text-[9px] bg-emerald-700 text-white font-sans font-bold px-1.5 py-0.2 rounded-full">
                  e-Challan ₹{complaint.fineAmount || 1000}
                </span>
              )}
            </div>
          )}

          <div className="pt-2 flex items-center text-xs text-slate-500 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-indigo-500 mr-1 flex-shrink-0" />
            <span className="truncate">{translateText(complaint.address)}</span>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-indigo-50/30 border-t border-indigo-100/60 flex items-center justify-between">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onUpvote) onUpvote(complaint.id);
          }}
          className="flex items-center space-x-1 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200/80 transition-all shadow-sm active:scale-95"
        >
          <ThumbsUp className="w-3.5 h-3.5 text-indigo-500" />
          <span>{complaint.upvotes} {t('card.citizens', 'Citizens')}</span>
        </button>

        <button
          onClick={() => onSelect(complaint)}
          className="flex items-center space-x-1 text-xs font-extrabold text-indigo-600 hover:text-indigo-700 hover:translate-x-0.5 transition-transform"
        >
          <span>{t('card.track_status', 'Track Status')}</span>
          <ChevronRight className="w-4 h-4 text-indigo-600" />
        </button>
      </div>
    </div>
  );
};
