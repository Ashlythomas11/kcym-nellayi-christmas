import React, { useState } from 'react';
import { Shield, Gift, Award, Clock, QrCode, History, Database, Eye, LogOut, ArrowLeft, Church, AlertCircle } from 'lucide-react';
import { Prize, Winner, DrawSettings, AuditLog, AdminUser, Language } from '../../types';
import { PrizeManager } from './PrizeManager';
import { WinnerManager } from './WinnerManager';
import { DrawSettingsManager } from './DrawSettingsManager';
import { QRCodeStudio } from './QRCodeStudio';
import { AuditLogViewer } from './AuditLogViewer';
import { SupabaseSetupModal } from './SupabaseSetupModal';
import { ResultsView } from '../ResultsView';

interface AdminDashboardProps {
  adminUser: AdminUser;
  prizes: Prize[];
  winners: Winner[];
  drawSettings: DrawSettings;
  auditLogs: AuditLog[];
  language: Language;
  onRefresh: () => void;
  onLogout: () => void;
  onReturnToPublic: () => void;
}

type AdminTab = 'status' | 'prizes' | 'winners' | 'preview' | 'qr' | 'logs';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUser,
  prizes,
  winners,
  drawSettings,
  auditLogs,
  language,
  onRefresh,
  onLogout,
  onReturnToPublic,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('status');
  const [showDbModal, setShowDbModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-16">
      
      {/* Top Navbar */}
      <header className="bg-christmas-darkGreen text-christmas-ivory border-b-2 border-christmas-gold shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onReturnToPublic}
              className="p-2 rounded-xl bg-christmas-emerald/80 hover:bg-christmas-emerald text-christmas-champagne hover:text-white transition-colors"
              title="Return to Public Site"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-christmas-lightGold" />
                <h2 className="font-serif font-black text-lg sm:text-xl text-christmas-lightGold">
                  KCYM Nellayi Admin
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  drawSettings.isPublished
                    ? 'bg-christmas-gold text-christmas-darkGreen'
                    : 'bg-amber-400 text-black'
                }`}>
                  {drawSettings.isPublished ? 'PUBLISHED' : 'DRAFT'}
                </span>
              </div>
              <p className="text-[11px] text-christmas-champagne/80">
                Logged in as: <strong className="text-white">{adminUser.email}</strong> ({adminUser.name})
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowDbModal(true)}
              className="px-3 py-1.5 rounded-xl border border-christmas-gold/40 text-xs font-semibold text-christmas-champagne hover:text-white hover:bg-christmas-emerald/70 transition-all flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5 text-christmas-lightGold" />
              <span className="hidden sm:inline">Database & Sync</span>
            </button>

            <button
              onClick={onReturnToPublic}
              className="px-3.5 py-1.5 rounded-xl bg-christmas-gold text-christmas-darkGreen font-bold text-xs hover:bg-christmas-lightGold transition-all flex items-center gap-1.5 shadow"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Public Site</span>
            </button>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-christmas-champagne hover:text-white hover:bg-red-900/60 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-1 border-t border-christmas-gold/20 scrollbar-none py-1">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'status'
                ? 'bg-christmas-gold text-christmas-darkGreen shadow'
                : 'text-christmas-champagne hover:text-white hover:bg-christmas-emerald/40'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Draw Status & Timing</span>
          </button>

          <button
            onClick={() => setActiveTab('prizes')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'prizes'
                ? 'bg-christmas-gold text-christmas-darkGreen shadow'
                : 'text-christmas-champagne hover:text-white hover:bg-christmas-emerald/40'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Prizes Catalog ({prizes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('winners')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'winners'
                ? 'bg-christmas-gold text-christmas-darkGreen shadow'
                : 'text-christmas-champagne hover:text-white hover:bg-christmas-emerald/40'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Enter Winners ({winners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'preview'
                ? 'bg-christmas-gold text-christmas-darkGreen shadow'
                : 'text-christmas-champagne hover:text-white hover:bg-christmas-emerald/40'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Private Results Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'qr'
                ? 'bg-christmas-gold text-christmas-darkGreen shadow'
                : 'text-christmas-champagne hover:text-white hover:bg-christmas-emerald/40'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR Code Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-christmas-gold text-christmas-darkGreen shadow'
                : 'text-christmas-champagne hover:text-white hover:bg-christmas-emerald/40'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'status' && (
          <DrawSettingsManager
            drawSettings={drawSettings}
            adminUser={adminUser}
            onRefresh={onRefresh}
          />
        )}

        {activeTab === 'prizes' && (
          <PrizeManager
            prizes={prizes}
            adminUser={adminUser}
            onRefresh={onRefresh}
          />
        )}

        {activeTab === 'winners' && (
          <WinnerManager
            prizes={prizes}
            winners={winners}
            adminUser={adminUser}
            onRefresh={onRefresh}
          />
        )}

        {activeTab === 'preview' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-xs sm:text-sm text-amber-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0" />
                <span>
                  <strong>Private Live Preview Mode:</strong> This view renders the official results view simulating what visitors will see once published.
                </span>
              </div>
              <span className="font-mono text-xs font-bold bg-amber-200 px-2 py-1 rounded">
                Admin Preview
              </span>
            </div>

            <div className="rounded-3xl border-2 border-christmas-gold overflow-hidden shadow-xl bg-white">
              <ResultsView
                drawSettings={{ ...drawSettings, isPublished: true, publishedAt: drawSettings.publishedAt || new Date().toISOString() }}
                prizes={prizes}
                winners={winners}
                language={language}
              />
            </div>
          </div>
        )}

        {activeTab === 'qr' && (
          <QRCodeStudio drawSettings={drawSettings} />
        )}

        {activeTab === 'logs' && (
          <AuditLogViewer logs={auditLogs} />
        )}
      </main>

      {/* Database Modal */}
      {showDbModal && (
        <SupabaseSetupModal
          adminUser={adminUser}
          onRefresh={onRefresh}
          onClose={() => setShowDbModal(false)}
        />
      )}

    </div>
  );
};
