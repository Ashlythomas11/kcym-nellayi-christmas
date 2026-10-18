import React, { useState } from 'react';
import { Database, Copy, Check, ExternalLink, Download, Upload, RefreshCw, Key, ShieldCheck } from 'lucide-react';
import { getSupabaseCredentials, saveSupabaseCredentials, isSupabaseConfigured } from '../../services/supabaseClient';
import { exportDataJSON, importDataJSON, resetToDefaults } from '../../services/storage';
import { AdminUser } from '../../types';

interface SupabaseSetupModalProps {
  adminUser: AdminUser;
  onRefresh: () => void;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ adminUser, onRefresh, onClose }) => {
  const currentCreds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(currentCreds.url);
  const [anonKey, setAnonKey] = useState(currentCreds.anonKey);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const configured = isSupabaseConfigured();

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      saveSupabaseCredentials(supabaseUrl, anonKey);
      setStatusMsg('Supabase configuration updated! Reloading connection...');
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch {
      setStatusMsg('Unable to save Supabase settings in this browser. Enable browser storage or configure .env.local.');
    }
  };

  const handleExportJSON = () => {
    const json = exportDataJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KCYM-Nellayi-Backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const handleImportJSON = async () => {
    if (!importJsonText.trim()) return;
    try {
      const res = await importDataJSON(importJsonText, adminUser.email);
      setStatusMsg(res.message);
      if (res.success) {
        setTimeout(() => onRefresh(), 500);
      }
    } catch (error) {
      console.error('Failed to restore backup:', error);
      setStatusMsg(error instanceof Error ? error.message : 'Unable to restore backup.');
    }
  };

  const handleResetDefaults = async () => {
    if (confirm('Are you sure you want to reset all prizes, draw settings, and winners back to default church data?')) {
      try {
        await resetToDefaults(adminUser.email);
        setStatusMsg('Reset to default parish data completed.');
        onRefresh();
      } catch (error) {
        console.error('Failed to reset parish data:', error);
        setStatusMsg(error instanceof Error ? error.message : 'Unable to reset parish data.');
      }
    }
  };

  const sqlSchemaSnippet = `-- Run this in Supabase SQL Editor:
-- Deploy supabase/functions/admin-username-login and configure the
-- SUPABASE_SERVICE_ROLE_KEY Edge Function secret before enabling admin login.
-- Assign app_metadata.role ("superadmin" or "organizer") using Supabase Auth Admin.
CREATE TABLE IF NOT EXISTS public.admin_usernames (
    username TEXT PRIMARY KEY CHECK (username = lower(username)),
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.admin_usernames ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.admin_usernames FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.admin_usernames TO service_role;
-- Add each authorized username and its existing Supabase Auth email:
-- INSERT INTO public.admin_usernames (username, email) VALUES ('username', 'admin@example.org');

CREATE TABLE IF NOT EXISTS public.draw_settings (
    id INT PRIMARY KEY DEFAULT 1,
    draw_date_ist TIMESTAMPTZ NOT NULL DEFAULT '2026-12-25 00:00:00+05:30',
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    is_published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ,
    published_by TEXT,
    prizes JSONB
);
ALTER TABLE public.draw_settings ADD COLUMN IF NOT EXISTS prizes JSONB;
ALTER TABLE public.draw_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view settings" ON public.draw_settings;
DROP POLICY IF EXISTS "Admins can edit settings" ON public.draw_settings;
DROP POLICY IF EXISTS "Admins can update draw settings" ON public.draw_settings;
CREATE POLICY "Public can view settings" ON public.draw_settings FOR SELECT USING (true);
CREATE POLICY "Admins can edit settings" ON public.draw_settings FOR ALL TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('superadmin', 'organizer'))
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('superadmin', 'organizer'));

CREATE TABLE IF NOT EXISTS public.winners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prize_id UUID,
    prize_rank INT,
    winning_coupon_number TEXT NOT NULL UNIQUE,
    winner_name TEXT NOT NULL,
    winner_location TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.winners ADD COLUMN IF NOT EXISTS prize_rank INT;
ALTER TABLE public.winners DROP CONSTRAINT IF EXISTS winners_prize_id_fkey;
ALTER TABLE public.winners ALTER COLUMN prize_id DROP NOT NULL;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF to_regclass('public.prizes') IS NOT NULL THEN
    UPDATE public.winners AS winner
    SET prize_rank = prize.rank
    FROM public.prizes AS prize
    WHERE winner.prize_rank IS NULL AND winner.prize_id = prize.id;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'draw_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.draw_settings;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'winners'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.winners;
  END IF;
END
$$;

DROP POLICY IF EXISTS "Admins have full access to winners" ON public.winners;
CREATE POLICY "Admins have full access to winners" ON public.winners FOR ALL TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('superadmin', 'organizer'))
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('superadmin', 'organizer'));
DROP POLICY IF EXISTS "Public can only view published winners" ON public.winners;
CREATE POLICY "Public can only view published winners" ON public.winners FOR SELECT TO anon
USING (EXISTS (SELECT 1 FROM public.draw_settings WHERE id = 1 AND is_published = true));`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchemaSnippet);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border-2 border-christmas-gold">
        
        {/* Header */}
        <div className="bg-christmas-darkGreen text-christmas-ivory p-6 flex items-center justify-between border-b border-christmas-gold/30">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-christmas-lightGold" />
            <div>
              <h3 className="font-serif font-bold text-xl text-christmas-lightGold">
                Database & Supabase Cloud Integration
              </h3>
              <p className="text-xs text-christmas-champagne">
                KCYM St. Mary's Church, Nellayi Backend Setup
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white text-sm font-bold">
            ✕
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto text-xs sm:text-sm">
          
          {/* Status notification */}
          {statusMsg && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl font-semibold">
              {statusMsg}
            </div>
          )}

          {/* Connection status badge */}
          <div className="bg-christmas-ivory p-4 rounded-2xl border border-christmas-gold/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase">Storage Mode:</span>
              <p className="font-bold text-christmas-emerald text-base">
                {configured ? 'Connected to Supabase Cloud Backend' : 'Running in Unified Local Browser Storage'}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              configured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {configured ? 'Cloud Synced' : 'Local Mode Active'}
            </span>
          </div>

          {/* Form to enter / update Supabase keys */}
          <form onSubmit={handleSaveCredentials} className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-200">
            <h4 className="font-serif font-bold text-sm text-gray-800 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-christmas-gold" />
              <span>Supabase Project Credentials</span>
            </h4>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Project URL (e.g. https://xyzcompany.supabase.co)
              </label>
              <input
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full p-2.5 rounded-xl border border-gray-300 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Project Anon / Public API Key
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full p-2.5 rounded-xl border border-gray-300 font-mono text-xs"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-christmas-emerald hover:bg-christmas-darkGreen text-white font-bold text-xs"
            >
              Save Credentials & Connect
            </button>
          </form>

          {/* SQL Schema snippet & copy button */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-800">Supabase SQL Schema & RLS Policies:</span>
              <button
                type="button"
                onClick={copySql}
                className="flex items-center gap-1.5 text-xs text-christmas-emerald font-bold hover:underline"
              >
                {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSchema ? 'Copied SQL!' : 'Copy SQL Script'}</span>
              </button>
            </div>
            <pre className="p-3 bg-gray-900 text-gray-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-40">
              {sqlSchemaSnippet}
            </pre>
          </div>

          {/* Parish Data Backup & Restore */}
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-serif font-bold text-sm text-gray-800">
              Parish Data Backup & Export (JSON)
            </h4>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleExportJSON}
                className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold flex items-center gap-1.5 text-xs"
              >
                <Download className="w-4 h-4 text-christmas-emerald" />
                <span>Export Full Backup JSON</span>
              </button>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-4 py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 font-semibold flex items-center gap-1.5 text-xs"
              >
                <RefreshCw className="w-4 h-4 text-red-600" />
                <span>Reset to Initial Parish Defaults</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
