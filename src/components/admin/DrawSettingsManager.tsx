import React, { useState } from 'react';
import { Settings, Calendar, Clock, MapPin, Phone, Mail, CheckCircle2, AlertTriangle, Save, Globe } from 'lucide-react';
import { DrawSettings, AdminUser } from '../../types';
import { updateDrawSettings, publishResults, unpublishResults } from '../../services/storage';
import { formatToIST } from '../../utils/timezone';

interface DrawSettingsManagerProps {
  drawSettings: DrawSettings;
  adminUser: AdminUser;
  onRefresh: () => void;
}

export const DrawSettingsManager: React.FC<DrawSettingsManagerProps> = ({
  drawSettings,
  adminUser,
  onRefresh,
}) => {
  const [formData, setFormData] = useState<DrawSettings>(drawSettings);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [showUnpublishConfirm, setShowUnpublishConfirm] = useState(false);
  const [unpublishReason, setUnpublishReason] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleFormChange = (key: keyof DrawSettings, val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveError('');
    if (!e.currentTarget.reportValidity()) {
      setSaveError('Please correct the highlighted fields before saving.');
      return;
    }

    setIsSaving(true);
    try {
      await updateDrawSettings(formData, adminUser.email);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onRefresh();
    } catch (error) {
      console.error('Failed to save draw settings:', error);
      setSaveError(error instanceof Error ? error.message : 'Unable to save configuration. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmPublish = async () => {
    await publishResults(adminUser.email);
    setShowPublishConfirm(false);
    onRefresh();
  };

  const handleConfirmUnpublish = async () => {
    await unpublishResults(adminUser.email, unpublishReason);
    setShowUnpublishConfirm(false);
    setUnpublishReason('');
    onRefresh();
  };

  return (
    <div className="space-y-8">
      
      {/* Publication Status Hero Card */}
      <div className={`p-6 sm:p-8 rounded-3xl border-2 shadow-lg transition-all ${
        drawSettings.isPublished
          ? 'bg-gradient-to-br from-emerald-900 to-christmas-darkGreen text-white border-christmas-gold'
          : 'bg-gradient-to-br from-amber-50 to-orange-50/60 border-amber-300 text-gray-900'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                drawSettings.isPublished
                  ? 'bg-christmas-gold text-christmas-darkGreen'
                  : 'bg-amber-200 text-amber-900'
              }`}>
                {drawSettings.isPublished ? 'RESULTS CURRENTLY PUBLISHED' : 'RESULTS DRAFT (UNPUBLISHED)'}
              </span>
              <span className="text-xs opacity-75">
                {drawSettings.timezone}
              </span>
            </div>

            <h3 className={`font-serif text-2xl sm:text-3xl font-black ${
              drawSettings.isPublished ? 'text-christmas-lightGold' : 'text-christmas-emerald'
            }`}>
              {drawSettings.isPublished
                ? 'Official Results are Live on Public Website'
                : 'Public View Shows "Results Not Yet Published"'}
            </h3>

            <p className="text-xs sm:text-sm max-w-xl opacity-90 leading-relaxed">
              {drawSettings.isPublished
                ? `Published on ${formatToIST(drawSettings.publishedAt)} by ${drawSettings.publishedBy || adminUser.email}. Public visitors can search and view all winners.`
                : 'All winning coupon numbers and winner names are currently hidden from public visitors until you click "Publish Results".'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {!drawSettings.isPublished ? (
              <button
                type="button"
                onClick={() => setShowPublishConfirm(true)}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-christmas-gold to-christmas-lightGold text-christmas-darkGreen font-bold text-sm sm:text-base shadow-gold-glow hover:brightness-105 active:scale-95 transition-all text-center"
              >
                Publish Results Officially
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowUnpublishConfirm(true)}
                className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow transition-colors text-center"
              >
                Unpublish for Correction
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <form noValidate onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-christmas-emerald" />
            <h4 className="font-serif font-bold text-lg text-christmas-emerald">
              Draw Timing & Parish Announcement Settings
            </h4>
          </div>

          {saveSuccess && (
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved Successfully</span>
            </span>
          )}
        </div>

        {saveError && (
          <div role="alert" className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {saveError}
          </div>
        )}

        {/* Date & Time (IST) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Exact Draw Date & Time (Asia/Kolkata - IST)
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.drawDateIST}
                onChange={(e) => handleFormChange('drawDateIST', e.target.value)}
                placeholder="2026-12-25T00:00:00+05:30"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 font-mono text-sm focus:ring-2 focus:ring-christmas-gold"
              />
              <Clock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
            <p className="text-[11px] text-gray-500">
              Default: <code>2026-12-25T00:00:00+05:30</code> (Dec 25, 2026 12:00 AM IST)
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Coupon Contribution Price
            </label>
            <input
              type="text"
              required
              value={formData.couponPrice}
              onChange={(e) => handleFormChange('couponPrice', e.target.value)}
              placeholder="₹50"
              className="w-full p-2.5 rounded-xl border border-gray-300 text-sm font-bold"
            />
          </div>
        </div>

        {/* Venues */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Draw Venue (English)
            </label>
            <input
              type="text"
              required
              value={formData.drawVenue}
              onChange={(e) => handleFormChange('drawVenue', e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Draw Venue (Malayalam)
            </label>
            <input
              type="text"
              value={formData.drawVenue_ml}
              onChange={(e) => handleFormChange('drawVenue_ml', e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-300 text-sm"
            />
          </div>
        </div>

        {/* Hero Headline & Subtitle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Homepage Subtitle (English)
            </label>
            <input
              type="text"
              value={formData.heroSubtitle}
              onChange={(e) => handleFormChange('heroSubtitle', e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Homepage Subtitle (Malayalam)
            </label>
            <input
              type="text"
              value={formData.heroSubtitle_ml}
              onChange={(e) => handleFormChange('heroSubtitle_ml', e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-300 text-sm"
            />
          </div>
        </div>

        {/* Contacts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Parish Office Helpline / Phone
            </label>
            <input
              type="text"
              value={formData.contactPhone}
              onChange={(e) => handleFormChange('contactPhone', e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-300 text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Contact Email
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleFormChange('contactEmail', e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-300 text-sm font-mono"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="pt-4 border-t flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-christmas-emerald hover:bg-christmas-darkGreen text-white font-bold text-sm flex items-center gap-2 shadow disabled:cursor-wait disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>

      {/* Explicit Publish Confirmation Modal */}
      {showPublishConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 text-center border-2 border-christmas-gold">
            <div className="w-16 h-16 mx-auto rounded-full bg-christmas-gold/20 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-christmas-red" />
            </div>

            <div className="space-y-2">
              <h4 className="font-serif font-black text-2xl text-christmas-emerald">
                Confirm Official Publication
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                You are about to make the winning coupon numbers and winner names visible to all public visitors and QR code scanners worldwide.
              </p>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 text-left space-y-1">
              <p className="font-bold">Before confirming, please verify:</p>
              <p>✓ All counterfoils have been physically verified by the Parish Vicar / Committee.</p>
              <p>✓ There are no duplicate or conflicting winning coupon numbers.</p>
              <p>✓ Winner names have been approved for public release.</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowPublishConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPublish}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-christmas-gold to-christmas-lightGold text-christmas-darkGreen font-bold text-sm shadow-md"
              >
                Yes, Publish Results Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Explicit Unpublish Confirmation Modal */}
      {showUnpublishConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 text-center border-2 border-red-500">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            <div className="space-y-2">
              <h4 className="font-serif font-black text-2xl text-red-800">
                Unpublish Official Results
              </h4>
              <p className="text-xs sm:text-sm text-gray-600">
                This will immediately hide all winning numbers from public visitors. Enter an explanation reason for the audit log.
              </p>
            </div>

            <div className="text-left space-y-1">
              <label className="block text-xs font-bold text-gray-700">Reason for Unpublishing *</label>
              <textarea
                rows={2}
                required
                value={unpublishReason}
                onChange={(e) => setUnpublishReason(e.target.value)}
                placeholder="e.g. Correcting typographical error in 3rd prize coupon number..."
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowUnpublishConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!unpublishReason.trim()}
                onClick={handleConfirmUnpublish}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold disabled:opacity-50"
              >
                Confirm Unpublish
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
