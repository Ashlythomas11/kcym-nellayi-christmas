import React from 'react';
import { X, Award, Gift, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import { Prize, Language } from '../types';
import { translations } from '../constants/translations';

interface PrizeModalProps {
  prize: Prize | null;
  language: Language;
  onClose: () => void;
}

export const PrizeModal: React.FC<PrizeModalProps> = ({ prize, language, onClose }) => {
  if (!prize) return null;
  const t = translations[language];

  const title = language === 'ml' && prize.title_ml ? prize.title_ml : prize.title;
  const description = language === 'ml' && prize.description_ml ? prize.description_ml : prize.description;
  const categoryLabel = language === 'ml' && prize.categoryLabel_ml ? prize.categoryLabel_ml : prize.categoryLabel;
  const sponsor = language === 'ml' && prize.sponsor_ml ? prize.sponsor_ml : prize.sponsor;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="prize-modal-title"
    >
      <div className="relative bg-christmas-ivory w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border-2 border-christmas-gold animate-fadeIn">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors focus:ring-2 focus:ring-christmas-gold"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Prize Image Header */}
        <div className="relative h-64 sm:h-80 w-full bg-christmas-darkGreen overflow-hidden">
          <img
            src={prize.imageUrl}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-christmas-darkGreen via-transparent to-black/30" />

          {/* Rank Badge */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-christmas-gold text-christmas-darkGreen font-serif font-black text-sm uppercase tracking-wider shadow-gold-glow flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>{categoryLabel}</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-black/60 text-white text-xs font-mono backdrop-blur-sm">
              #{prize.rank}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h3 id="prize-modal-title" className="font-serif text-2xl sm:text-3xl font-bold text-christmas-emerald">
              {title}
            </h3>
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
              {description}
            </p>
          </div>

          {/* Sponsor recognition */}
          {sponsor && (
            <div className="bg-christmas-gold/10 border border-christmas-gold/30 rounded-2xl p-4 flex items-start gap-3">
              <Heart className="w-5 h-5 text-christmas-red flex-shrink-0 mt-0.5 fill-christmas-red" />
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                  {t.gifts.sponsoredBy}
                </p>
                <p className="text-sm sm:text-base font-bold text-christmas-emerald">
                  {sponsor}
                </p>
              </div>
            </div>
          )}

          {/* Verification checklist notice */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>
                {language === 'en'
                  ? 'Official Parish Prize Guarantee'
                  : 'ഇടവകയുടെ ഔദ്യോഗിക സമ്മാന ഉറപ്പ്'}
              </span>
            </div>
            <p className="text-emerald-800">
              {language === 'en'
                ? 'All prizes are brand-new, covered under standard manufacturer warranty, and authenticated by KCYM St. Mary\'s Church Nellayi.'
                : 'എല്ലാ സമ്മാനങ്ങളും പുതിയവയാണ്; നിർമ്മാതാവിന്റെ സാധാരണ വാറന്റിയോടെയാണ് നൽകുന്നത്.'}
            </p>
            <p className="border-t border-emerald-200 pt-2 text-emerald-800">
              {language === 'en'
                ? 'The prize shown in the image may differ from the actual prize awarded.'
                : 'ചിത്രത്തിലുള്ള സമ്മാനം യഥാർത്ഥത്തിൽ നൽകുന്ന സമ്മാനത്തിൽ നിന്ന് വ്യത്യസ്തമായിരിക്കാം.'}
            </p>
          </div>

          {/* Footer Close Action */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-christmas-emerald hover:bg-christmas-lightGreen text-white font-semibold text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
