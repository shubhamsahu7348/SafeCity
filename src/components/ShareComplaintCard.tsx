import React, { useState } from 'react';
import { Mail, Share2, Send, CheckCircle2, Copy, ExternalLink, MessageSquare } from 'lucide-react';
import { Complaint } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ShareComplaintCardProps {
  complaint: Complaint;
  className?: string;
}

export const ShareComplaintCard: React.FC<ShareComplaintCardProps> = ({ complaint, className = '' }) => {
  const { t, translateText, translateDepartment } = useLanguage();
  const [userEmail, setUserEmail] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Send Complaint ID receipt to Gmail/Email
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail || !userEmail.includes('@')) {
      alert('Please enter a valid Gmail or Email address (e.g. citizen@gmail.com)');
      return;
    }

    const emailTrimmed = userEmail.trim();
    setIsSending(true);
    setSentMessage(null);

    const triggerClientSideEmail = () => {
      const subject = `[SafeCity Portal] Complaint ID: ${complaint.id}`;
      const body = `Dear Citizen,\n\nYour SafeCity Hazard/Violation Report has been registered.\n\nComplaint ID: ${complaint.id}\nTitle: ${translateText(complaint.title)}\nDepartment: ${translateDepartment(complaint.assignedDepartment)}\nStatus: ${complaint.status}\nLocation: ${translateText(complaint.address)}\nReported At: ${new Date(complaint.reportedAt).toLocaleString()}\n\nTrack real-time resolution evidence directly at:\n${window.location.origin}/?id=${complaint.id}\n\nThank you for keeping our city safe!\nSafeCity Citizen Transparency Portal`;

      const mailtoUrl = `mailto:${encodeURIComponent(emailTrimmed)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setSentMessage(`${t('report.email_sent_success', 'Complaint ID tracking link dispatched to')} ${emailTrimmed}`);
      window.open(mailtoUrl, '_blank');
    };

    try {
      const res = await fetch('/api/complaints/email-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailTrimmed,
          complaintId: complaint.id,
        }),
      });

      if (res && res.ok) {
        const data = await res.json();
        setSentMessage(`${t('report.email_sent_success', 'Complaint ID tracking link dispatched to')} ${emailTrimmed}`);
        if (data && data.mailtoUrl) {
          window.open(data.mailtoUrl, '_blank');
        } else {
          triggerClientSideEmail();
        }
      } else {
        triggerClientSideEmail();
      }
    } catch (err) {
      // Fallback gracefully without throwing fetch errors to the console
      triggerClientSideEmail();
    } finally {
      setIsSending(false);
    }
  };

  // WhatsApp Share
  const handleShareWhatsApp = () => {
    const text = `🚨 SafeCity Hazard Report Details\n\n• Complaint ID: ${complaint.id}\n• Title: ${translateText(complaint.title)}\n• Department: ${translateDepartment(complaint.assignedDepartment)}\n• Status: ${complaint.status}\n\nTrack progress on SafeCity Portal: ${window.location.origin}/?id=${complaint.id}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Direct Gmail Draft
  const handleOpenGmailDraft = () => {
    const subject = `[SafeCity Portal] Complaint ID: ${complaint.id}`;
    const body = `SafeCity Citizen Report Details:\n\nComplaint ID: ${complaint.id}\nTitle: ${translateText(complaint.title)}\nDepartment: ${translateDepartment(complaint.assignedDepartment)}\nLocation: ${translateText(complaint.address)}\nStatus: ${complaint.status}\n\nTrack real-time resolution at:\n${window.location.origin}/?id=${complaint.id}`;
    const mailtoUrl = `mailto:${userEmail ? encodeURIComponent(userEmail) : ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
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

  // Copy ID / Link
  const handleCopyText = () => {
    const textToCopy = `Complaint ID: ${complaint.id} | Link: ${window.location.origin}/?id=${complaint.id}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className={`bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/80 p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-4 text-left ${className}`}>
      {/* Title */}
      <div className="flex items-center space-x-2 text-indigo-900 font-extrabold text-sm border-b border-indigo-100/80 pb-2">
        <Mail className="w-4 h-4 text-indigo-600" />
        <span>{t('report.email_section_title', 'Send Complaint ID & Details to your Gmail / Email')}</span>
      </div>

      {/* Gmail Input Form */}
      <form onSubmit={handleSendEmail} className="space-y-2">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder={t('report.email_placeholder', 'Enter your Gmail address (e.g. citizen@gmail.com)')}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5 transition-all whitespace-nowrap disabled:opacity-70"
          >
            {isSending ? (
              <span>Sending...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>{t('report.email_send_btn', 'Send to Gmail')}</span>
              </>
            )}
          </button>
        </div>

        {sentMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{sentMessage}</span>
          </div>
        )}
      </form>

      {/* Social & Sharing Options */}
      <div className="pt-2 border-t border-indigo-100/80 space-y-2">
        <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">
          {t('report.share_options_title', 'Share Complaint ID & Tracking Options')}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* WhatsApp */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span className="truncate">{t('report.share_whatsapp', 'WhatsApp')}</span>
          </button>

          {/* Gmail Draft */}
          <button
            type="button"
            onClick={handleOpenGmailDraft}
            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-rose-600" />
            <span className="truncate">{t('report.share_gmail', 'Gmail Draft')}</span>
          </button>

          {/* Copy ID */}
          <button
            type="button"
            onClick={handleCopyText}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-slate-600" />
            <span className="truncate">{copied ? 'Copied!' : 'Copy ID'}</span>
          </button>

          {/* Native System Share */}
          <button
            type="button"
            onClick={handleNativeShare}
            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="truncate">{t('report.share_native', 'System Share')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
