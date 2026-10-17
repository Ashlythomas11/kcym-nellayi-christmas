import React from 'react';
import { X, Award, Sparkles, CheckCircle2, AlertCircle, Heart, Phone, MapPin } from 'lucide-react';
import { CouponSearchResult, Language, DrawSettings } from '../types';
import { translations } from '../constants/translations';

interface CouponSearchModalProps {
  searchResult: CouponSearchResult | null;
  language: Language;
  drawSettings: DrawSettings;
  onClose: () => void;
}

export const CouponSearchModal: React.FC<CouponSearchModalProps> = ({
  searchResult,
  language,
  drawSettings,
  onClose,
}) => {
  if (!searchResult) return null;
  const t = translations[language];

  const { isWinner, searchedNumber, winner, prize } = searchResult;

  const prizeTitle =
    prize && language === 'ml' && prize.title_ml ? prize.title_ml : prize?.title;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
    >
      <div className="relative bg-christmas-ivory w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border-2 border-christmas-gold">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/10 hover:bg-black/20 text-gray-700 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {isWinner ? (
          /* WINNER CELEBRATION MODAL */
          <div className="text-center p-6 sm:p-8 space-y-6">
            
            {/* Header with Confetti Ribbon */}
            <div className="space-y-3">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-christmas-gold to-christmas-lightGold flex items-center justify-center shadow-gold-glow animate-bounce">
                <Award className="w-10 h-10 text-christmas-darkGreen" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-christmas-red text-white text-xs font-black uppercase tracking-wider shadow-red-glow">
                <Sparkles className="w-4 h-4 text-christmas-lightGold" />
                <span>{language === 'en' ? 'WINNING COUPON VERIFIED' : 'വിജയകൂപ്പൺ സ്ഥിരീകരിച്ചു'}</span>
              </div>

              <h3 id="search-modal-title" className="font-serif text-2xl sm:text-3xl font-extrabold text-christmas-emerald">
                {t.results.winnerCongrats}
              </h3>

              <div className="inline-block bg-christmas-darkGreen text-christmas-lightGold px-6 py-2.5 rounded-2xl border-2 border-christmas-gold shadow-md">
                <span className="text-xs uppercase tracking-widest text-christmas-champagne block">
                  {t.results.winningNumberLabel}
                </span>
                <span className="font-mono text-3xl font-black tracking-widest">
                  {winner?.winningCouponNumber}
                </span>
              </div>
            </div>

            {/* Winner & Prize Information Card */}
            <div className="bg-white rounded-2xl p-5 border border-christmas-gold/40 shadow-sm text-left space-y-4">
              {prize && (
                <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                  <img
                    src={prize.imageUrl}
                    alt={prizeTitle}
                    className="w-16 h-16 rounded-xl object-cover border border-christmas-gold/50 flex-shrink-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-christmas-red uppercase">
                      {prize.categoryLabel}
                    </span>
                    <h4 className="font-serif font-bold text-base sm:text-lg text-christmas-emerald leading-snug">
                      {prizeTitle}
                    </h4>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-2 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-500 block">{t.results.winnerLabel}</span>
                  <span className="font-bold text-gray-900 text-base">{winner?.winnerName}</span>
                </div>
                {winner?.winnerLocation && (
                  <div>
                    <span className="text-gray-500 block">{language === 'en' ? 'Location / Ward:' : 'സ്ഥലം / വാർഡ്:'}</span>
                    <span className="font-semibold text-gray-800">{winner.winnerLocation}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Claim Instructions */}
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-xs text-amber-900 text-left space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <CheckCircle2 className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span>{language === 'en' ? 'Prize Claim Instructions' : 'സമ്മാനം കൈപ്പറ്റാനുള്ള നിർദ്ദേശങ്ങൾ'}</span>
              </div>
              <p className="leading-relaxed">
                {t.results.claimNotice}
              </p>
              <div className="pt-1 flex flex-col gap-1 text-[11px] text-amber-800">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {drawSettings.churchAddress}
                </span>
                <span className="flex items-center gap-1.5 font-semibold">
                  <Phone className="w-3.5 h-3.5" />
                  {drawSettings.contactPhone}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-christmas-gold to-christmas-lightGold text-christmas-darkGreen font-bold text-base hover:brightness-105 active:scale-95 transition-all shadow-md"
            >
              {language === 'en' ? 'Done' : 'പൂർത്തിയായി'}
            </button>
          </div>
        ) : (
          /* NON-WINNING RESPECTFUL SEARCH RESULT */
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-gray-500" />
            </div>

            <div className="space-y-2">
              <h3 id="search-modal-title" className="font-serif text-xl sm:text-2xl font-bold text-christmas-wood">
                {t.results.noResultsFound}
              </h3>
              <p className="font-mono text-2xl font-black text-christmas-red bg-red-50 py-1.5 px-4 rounded-xl inline-block border border-red-200">
                {searchedNumber}
              </p>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
              {t.results.noResultsEncourage}
            </p>

            <div className="bg-christmas-gold/10 border border-christmas-gold/30 rounded-2xl p-4 flex items-center gap-3 text-left">
              <Heart className="w-6 h-6 text-christmas-red flex-shrink-0 fill-christmas-red" />
              <p className="text-xs text-christmas-emerald font-medium leading-relaxed">
                {language === 'en'
                  ? 'Your generous contribution directly funds charitable support for needy families and youth programs at St. Mary\'s Church, Nellayi.'
                  : 'നിങ്ങളുടെ വിലയേറിയ പങ്കാളിത്തം നെല്ലായി പള്ളിയിലെ ജീവകാരുണ്യ പ്രവർത്തനങ്ങൾക്കും യുവജന സേവനങ്ങൾക്കും സഹായകമാണ്.'}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-christmas-emerald hover:bg-christmas-darkGreen text-white font-bold text-sm transition-colors"
            >
              {language === 'en' ? 'Check Another Coupon' : 'മറ്റൊരു കൂപ്പൺ പരിശോധിക്കുക'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
