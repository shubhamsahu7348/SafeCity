import React, { useState } from 'react';
import { Mail, Share2, Send, CheckCircle2, Copy, ExternalLink, MessageSquare, Sparkles, Check } from 'lucide-react';
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
  const [copiedEmailText, setCopiedEmailText] = useState<boolean>(false);
  const [showEmailReceiptModal, setShowEmailReceiptModal] = useState<boolean>(false);

  const getEmailContent = (targetEmail: string) => {
    const subject = `[SafeCity Portal] Official Complaint Receipt ID: ${complaint.id}`;
    const body = `Dear Citizen,\n\nYour SafeCity Hazard/Violation Report has been registered.\n\n--------------------------------------------\nOFFICIAL COMPLAINT RECEIPT\n--------------------------------------------\nComplaint ID: ${complaint.id}\nTitle: ${translateText(complaint.title)}\nCategory: ${complaint.category}\nDepartment: ${translateDepartment(complaint.assignedDepartment)}\nStatus: ${complaint.status}\nLocation: ${translateText(complaint.address)}\nReported At: ${new Date(complaint.reportedAt).toLocaleString()}\n--------------------------------------------\n\nTRACK YOUR COMPLAINT REAL-TIME:\n${window.location.origin}/?id=${complaint.id}\n\nThank you for making our community safer!\nSafeCity Citizen Transparency & Grievance Portal`;

    return { subject, body };
  };

  const launchGmailWebCompose = (targetEmail: string) => {
    const { subject, body } = getEmailContent(targetEmail);
    // Gmail Web Direct Compose URL
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=${encodeURIComponent(targetEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank');
  };

  // Send Complaint ID receipt to Gmail/Email
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailTrimmed = userEmail.trim();
    if (!emailTrimmed || !emailTrimmed.includes('@')) {
      alert('Please enter a valid Gmail address (e.g. citizen@gmail.com)');
      return;
    }

    setIsSending(true);
    setSentMessage(null);

    // 1. Open Gmail Compose directly in tab
    launchGmailWebCompose(emailTrimmed);
    setShowEmailReceiptModal(true);

    // 2. Log server-side dispatch entry
    try {
      await fetch('/api/complaints/email-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailTrimmed,
          complaintId: complaint.id,
        }),
      });
      setSentMessage(`${t('report.email_sent_success', 'Complaint ID receipt dispatched for')} ${emailTrimmed}`);
    } catch (err) {
      console.warn('Backend receipt log notify:', err);
      setSentMessage(`Gmail Compose launched for ${emailTrimmed}`);
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
    const emailToUse = userEmail.trim() || 'citizen@gmail.com';
    launchGmailWebCompose(emailToUse);
    setShowEmailReceiptModal(true);
  };

  // Copy Full Formatted Email Text
  const handleCopyEmailText = () => {
    const { subject, body } = getEmailContent(userEmail.trim() || 'citizen@gmail.com');
    const fullText = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText);
    setCopiedEmailText(true);
    setTimeout(() => setCopiedEmailText(false), 3000);
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

  const { subject, body } = getEmailContent(userEmail.trim() || 'your-email@gmail.com');

  return (
    <div className={`bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/90 p-5 rounded-2xl border border-indigo-100 shadow-md space-y-4 text-left ${className}`}>
      {/* Title */}
      <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5">
        <div className="flex items-center space-x-2 text-indigo-950 font-extrabold text-sm">
          <Mail className="w-4 h-4 text-indigo-600" />
          <span>{t('report.email_section_title', 'Send Complaint ID & Details to your Gmail / Email')}</span>
        </div>
        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-full uppercase tracking-wider">
          Instant Gmail
        </span>
      </div>

      {/* Gmail Input Form */}
      <form onSubmit={handleSendEmail} className="space-y-2.5">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder={t('report.email_placeholder', 'Enter your Gmail address (e.g. citizen@gmail.com)')}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-inner"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all whitespace-nowrap disabled:opacity-70 active:scale-95"
          >
            {isSending ? (
              <span>Opening Gmail...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>{t('report.email_send_btn', 'Send to Gmail')}</span>
              </>
            )}
          </button>
        </div>

        {sentMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{sentMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowEmailReceiptModal(!showEmailReceiptModal)}
              className="text-[11px] text-indigo-700 underline font-extrabold ml-2"
            >
              {showEmailReceiptModal ? 'Hide Receipt' : 'View Email Receipt'}
            </button>
          </div>
        )}
      </form>

      {/* Social & Sharing Options */}
      <div className="pt-2 border-t border-indigo-100/80 space-y-2">
        <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>{t('report.share_options_title', 'Share Complaint ID & Tracking Options')}</span>
          <button
            type="button"
            onClick={() => setShowEmailReceiptModal(!showEmailReceiptModal)}
            className="text-indigo-600 hover:text-indigo-800 font-extrabold flex items-center space-x-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>{showEmailReceiptModal ? 'Close Receipt Preview' : 'Preview Email Message'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Direct Gmail Web Compose */}
          <button
            type="button"
            onClick={handleOpenGmailDraft}
            className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-rose-600" />
            <span className="truncate">{t('report.share_gmail', 'Open in Gmail')}</span>
          </button>

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
            <Copy className="w-3.5 h-3.5 text-slate-600" />
            <span className="truncate">{copied ? 'Copied ID!' : 'Copy ID'}</span>
          </button>

          {/* Native System Share */}
          <button
            type="button"
            onClick={handleNativeShare}
            className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="truncate">{t('report.share_native', 'System Share')}</span>
          </button>
        </div>
      </div>

      {/* Formatted Email Preview Receipt Modal/Box */}
      {showEmailReceiptModal && (
        <div className="p-4 bg-slate-900 text-slate-100 rounded-xl border border-slate-700 shadow-xl space-y-3 mt-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2 text-indigo-300 font-bold text-xs">
              <Mail className="w-4 h-4 text-indigo-400" />
              <span>Official Gmail Message Receipt Preview</span>
            </div>
            <button
              onClick={handleCopyEmailText}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-extrabold flex items-center space-x-1 transition-colors"
            >
              {copiedEmailText ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
              <span>{copiedEmailText ? 'Copied Message!' : 'Copy Email Text'}</span>
            </button>
          </div>

          <div className="space-y-1.5 text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300 leading-relaxed whitespace-pre-wrap select-all">
            <div className="text-indigo-400 font-sans font-bold">Subject: {subject}</div>
            <div className="border-b border-slate-800 my-1"></div>
            <div>{body}</div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-[11px]">
            <span className="text-slate-400">
              Target: <strong className="text-white">{userEmail || 'citizen@gmail.com'}</strong>
            </span>
            <button
              onClick={() => launchGmailWebCompose(userEmail.trim() || 'citizen@gmail.com')}
              className="w-full sm:w-auto px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-extrabold flex items-center justify-center space-x-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Launch Gmail Web Tab Directly</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

