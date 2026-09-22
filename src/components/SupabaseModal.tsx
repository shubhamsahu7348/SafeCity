import React, { useState, useEffect } from 'react';
import { Database, Copy, Check, ExternalLink, X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPABASE_SCHEMA_SQL = `-- 1. Create complaints table
CREATE TABLE IF NOT EXISTS public.complaints (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    sub_category TEXT,
    severity TEXT NOT NULL,
    is_emergency BOOLEAN DEFAULT FALSE,
    description TEXT,
    photo_url TEXT,
    video_url TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    videos JSONB DEFAULT '[]'::jsonb,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    address TEXT,
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'Submitted',
    assigned_department TEXT,
    assigned_worker_id TEXT,
    assigned_worker_name TEXT,
    timeline JSONB DEFAULT '[]'::jsonb,
    before_photo_url TEXT,
    after_photo_url TEXT,
    upvotes INT DEFAULT 1,
    estimated_resolution_hours INT,
    vehicle_plate_number TEXT,
    violation_type TEXT,
    fine_amount NUMERIC,
    fine_status TEXT,
    challan_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_dept ON public.complaints(assigned_department);
CREATE INDEX IF NOT EXISTS idx_complaints_reported_at ON public.complaints(reported_at DESC);

-- 3. Row Level Security
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- 4. Citizen & Department Access Policies
DROP POLICY IF EXISTS "Allow public insert to complaints" ON public.complaints;
CREATE POLICY "Allow public insert to complaints" ON public.complaints FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read from complaints" ON public.complaints;
CREATE POLICY "Allow public read from complaints" ON public.complaints FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public update to complaints" ON public.complaints;
CREATE POLICY "Allow public update to complaints" ON public.complaints FOR UPDATE USING (true);`;

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<{
    connected: boolean;
    projectId?: string;
    tableExists?: boolean;
    totalRecords?: number;
    message?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/supabase/status')
        .then((r) => r.json())
        .then((data) => setStatus(data))
        .catch(() => setStatus({ connected: true, projectId: 'hflpnvixueffwbjbmnzh', tableExists: false }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-indigo-700/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-900/50 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Supabase Database Setup</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono">
                  hflpnvixueffwbjbmnzh
                </span>
              </h3>
              <p className="text-xs text-slate-400">PostgreSQL table & security policies setup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status banner */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-indigo-950 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            {status?.tableExists ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-300 font-semibold">Table created & active ({status.totalRecords || 0} records stored)</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-amber-300 font-medium">Table awaiting creation in Supabase SQL Editor</span>
              </>
            )}
          </div>
          <a
            href="https://supabase.com/dashboard/project/hflpnvixueffwbjbmnzh/sql/new"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1 font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
          >
            <span>Open SQL Editor</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-200 leading-relaxed">
            <strong className="block text-amber-100 font-semibold mb-1">
              ⚠️ Important: Do not paste the file name!
            </strong>
            PostgreSQL cannot execute the text <code className="px-1 py-0.5 bg-amber-900/60 rounded text-amber-300">supabase-schema.sql</code>.
            Instead, copy and paste the <strong>actual SQL code block below</strong> into the Supabase SQL editor and click <strong>Run</strong>.
          </div>

          <div className="relative">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-semibold text-slate-300">SQL Commands to execute:</span>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-all active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied SQL!' : 'Copy SQL Script'}</span>
              </button>
            </div>
            <pre className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto max-h-60 leading-relaxed select-all">
              {SUPABASE_SCHEMA_SQL}
            </pre>
          </div>

          {/* Step-by-step instructions */}
          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl space-y-2 text-xs text-slate-300">
            <div className="font-semibold text-white">3 Simple Steps:</div>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li>Click <strong>&quot;Copy SQL Script&quot;</strong> above.</li>
              <li>
                Open{' '}
                <a
                  href="https://supabase.com/dashboard/project/hflpnvixueffwbjbmnzh/sql/new"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline font-bold"
                >
                  Supabase SQL Editor (New Query) ↗
                </a>
              </li>
              <li>Paste (Ctrl+V or Cmd+V) the copied SQL code and click the green <strong>Run</strong> button.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/80">
          <span className="text-[11px] text-slate-400">Project: hflpnvixueffwbjbmnzh</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
