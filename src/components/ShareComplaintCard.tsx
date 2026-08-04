import React, { useState } from 'react';
import { Share2, Copy, MessageSquare, Check } from 'lucide-react';
import { Complaint } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ShareComplaintCardProps {
  complaint: Complaint;
  className?: string;
}

export const ShareComplaintCard: React.FC<ShareComplaintCardProps> = ({ complaint, className = '' }) => {
  const { t, translateText, translateDepartment } = useLanguage();
  const [copied, setCopied] = useState<boolean>(false);

  // WhatsApp Share
  const handleShareWhatsApp = () => {
    const text = `🚨 SafeCity Hazard Report Details\n\n• Complaint ID: ${complaint.id}\n• Title: ${translateText(complaint.title)}\n• Department: ${translateDepartment(complaint.assignedDepartment)}\n• Status: ${complaint.status}\n\nTrack progress on SafeCity Portal: ${window.location.origin}/?id=${complaint.id}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Native System Share
  const handleNativeShare = async () => {
    const shareData = {
      title: `SafeCity Complaint ID: ${complaint.id}`,
      text: `Track SafeCity Hazard Report (${complaint.id}): ${translateText(complaint.title)}`,
      url: `${window.location.origin}/?id=${complaint.id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share canceled or not supported', err);
      }
    } else {
      handleCopyText();
    }
  };

  // Copy ID & Link
  const handleCopyText = () => {
    const textToCopy = `Complaint ID: ${complaint.id} | Link: ${window.location.origin}/?id=${complaint.id}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className={`bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/90 p-4 rounded-2xl border border-indigo-100 shadow-sm space-y-3 text-left ${className}`}>
      <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
        <div className="flex items-center space-x-2 text-indigo-950 font-extrabold text-xs uppercase tracking-wider">
          <Share2 className="w-4 h-4 text-indigo-600" />
          <span>{t('report.share_options_title', 'Share Complaint Tracking Link & Details')}</span>
        </div>
        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-mono font-black rounded-full">
          #{complaint.id}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* WhatsApp */}
        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span className="truncate">{t('report.share_whatsapp', 'WhatsApp')}</span>
        </button>

        {/* Copy ID & Link */}
        <button
          type="button"
          onClick={handleCopyText}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
          <span className="truncate">{copied ? 'Copied Link!' : 'Copy Link'}</span>
        </button>

        {/* Native System Share */}
        <button
          type="button"
          onClick={handleNativeShare}
          className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5 text-blue-600" />
          <span className="truncate">{t('report.share_native', 'Share')}</span>
        </button>
      </div>
    </div>
  );
};


