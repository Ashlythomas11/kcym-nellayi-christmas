import React, { useState, useEffect } from 'react';
import { Clock, Sparkles, AlertCircle, Award, CheckCircle2, Calendar } from 'lucide-react';
import { Language, DrawSettings } from '../types';
import { calculateTimeLeft, formatToIST, formatToISTMalayalam, CountdownTimeLeft } from '../utils/timezone';
import { translations } from '../constants/translations';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface CountdownTimerProps {
  language: Language;
  drawSettings: DrawSettings;
  onViewResults: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  language,
  drawSettings,
  onViewResults,
}) => {
  const [timeLeft, setTimeLeft] = useState<CountdownTimeLeft>(() =>
    calculateTimeLeft(drawSettings.drawDateIST)
  );

  const t = translations[language];
  const revealRef = useScrollReveal<HTMLElement>();

  // Update countdown every second
  useEffect(() => {
    // Initial calculation immediately on mount/settings change
    setTimeLeft(calculateTimeLeft(drawSettings.drawDateIST));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(drawSettings.drawDateIST));
    }, 1000);

    return () => clearInterval(timer);
  }, [drawSettings.drawDateIST]);

  const formattedDate =
    language === 'en'
      ? formatToIST(drawSettings.drawDateIST)
      : formatToISTMalayalam(drawSettings.drawDateIST);

  return (
    <section id="countdown" ref={revealRef} data-reveal className="scroll-mt-24 py-14 bg-christmas-darkGreen border-b border-christmas-gold/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-christmas-gold/15 border border-christmas-gold/40 text-christmas-ivory text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-christmas-gold" />
            <span>{t.countdown.title}</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-christmas-ivory">
            {language === 'en' ? 'Live Draw Countdown' : 'തത്സമയ നറുക്കെടുപ്പ് കൗണ്ട്ഡൗൺ'}
          </h2>

          <p className="text-sm sm:text-base text-christmas-ivory/80 max-w-2xl mx-auto flex items-center justify-center gap-1.5">
            <Calendar className="w-4 h-4 text-christmas-lightGold flex-shrink-0" />
            <span>{formattedDate}</span>
          </p>
        </div>

        {/* State 1: RESULTS ALREADY PUBLISHED */}
        {drawSettings.isPublished ? (
          <div className="bg-gradient-to-br from-christmas-darkGreen to-christmas-emerald text-christmas-ivory rounded-3xl p-8 sm:p-10 shadow-xl border-2 border-christmas-gold text-center space-y-6 animate-fadeIn">
            <div className="w-16 h-16 mx-auto rounded-full bg-christmas-gold/20 border-2 border-christmas-gold flex items-center justify-center shadow-gold-glow">
              <CheckCircle2 className="w-8 h-8 text-christmas-lightGold" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-christmas-lightGold">
                {t.countdown.publishedTitle}
              </h3>
              <p className="text-sm sm:text-base text-christmas-champagne max-w-xl mx-auto">
                {t.countdown.publishedDesc}
              </p>
              {drawSettings.publishedAt && (
                <p className="text-xs text-christmas-champagne/70 font-mono">
                  {language === 'en' ? 'Official Timestamp:' : 'പ്രസിദ്ധീകരിച്ച സമയം:'}{' '}
                  {formatToIST(drawSettings.publishedAt)}
                </p>
              )}
            </div>

            <div>
              <button
                onClick={onViewResults}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-christmas-gold to-christmas-lightGold text-christmas-darkGreen font-serif font-black text-lg shadow-gold-glow hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2.5"
              >
                <Award className="w-6 h-6" />
                <span>{t.countdown.viewResultsBtn}</span>
              </button>
            </div>
          </div>
        ) : timeLeft.isExpired ? (
          /* State 2: DEADLINE PASSED, BUT RESULTS NOT YET PUBLISHED (Waiting manual confirmation) */
          <div className="bg-gradient-to-br from-christmas-burgundy/90 to-christmas-emerald text-christmas-ivory rounded-3xl p-8 sm:p-10 shadow-xl border-2 border-christmas-gold/60 text-center space-y-5 animate-pulse-subtle">
            <div className="w-16 h-16 mx-auto rounded-full bg-christmas-gold/20 border border-christmas-gold flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-christmas-lightGold" />
            </div>

            <div className="space-y-3 max-w-2xl mx-auto">
              <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-christmas-champagne">
                {t.countdown.arrived}
              </h3>
              <p className="text-xs sm:text-sm text-christmas-champagne/80 leading-relaxed">
                {language === 'en'
                  ? 'The live draw is currently taking place or counterfoils are being verified by parish convenors. Winning coupons will be published right here immediately once officially signed and approved.'
                  : 'നറുക്കെടുപ്പ് നടക്കുകയാണ്. പള്ളി അധികൃതർ കൂപ്പൺ കൗണ്ടർഫോയിലുകൾ പരിശോധിച്ചുവരുന്നു. ഔദ്യോഗികമായി അംഗീകരിച്ച ശേഷം വിജയിച്ച കൂപ്പൺ നമ്പറുകൾ ഇവിടെ പ്രസിദ്ധീകരിക്കും.'}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 border border-christmas-gold/40 text-xs font-mono text-christmas-lightGold">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>{language === 'en' ? 'Awaiting Authorized Administrator Confirmation' : 'അധികൃതരുടെ സ്ഥിരീകരണത്തിനായി കാത്തിരിക്കുന്നു'}</span>
            </div>
          </div>
        ) : (
          /* State 3: ACTIVE LIVE COUNTDOWN */
          <div className="space-y-6">
            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6"
              role="timer"
              aria-live="polite"
              aria-label="Countdown until prize draw"
            >
              {/* Days */}
              <div                             className="bg-christmas-ivory text-christmas-wood rounded-2xl p-5 sm:p-6 text-center border-2 border-christmas-burgundy/70 shadow-card hover:border-christmas-gold transition-colors">
                <span key={timeLeft.days} className="font-serif font-black text-4xl sm:text-5xl md:text-6xl text-christmas-burgundy block tracking-tight animate-count-tick">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-christmas-emerald block mt-2 break-words">
                  {t.countdown.days}
                </span>
              </div>

              {/* Hours */}
              <div                             className="bg-christmas-ivory text-christmas-wood rounded-2xl p-5 sm:p-6 text-center border-2 border-christmas-burgundy/70 shadow-card hover:border-christmas-gold transition-colors">
                <span key={timeLeft.hours} className="font-serif font-black text-4xl sm:text-5xl md:text-6xl text-christmas-burgundy block tracking-tight animate-count-tick">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-christmas-emerald block mt-2 break-words">
                  {t.countdown.hours}
                </span>
              </div>

              {/* Minutes */}
              <div                             className="bg-christmas-ivory text-christmas-wood rounded-2xl p-5 sm:p-6 text-center border-2 border-christmas-burgundy/70 shadow-card hover:border-christmas-gold transition-colors">
                <span key={timeLeft.minutes} className="font-serif font-black text-4xl sm:text-5xl md:text-6xl text-christmas-burgundy block tracking-tight animate-count-tick">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-christmas-emerald block mt-2 break-words">
                  {t.countdown.minutes}
                </span>
              </div>

              {/* Seconds */}
              <div                             className="bg-christmas-ivory text-christmas-wood rounded-2xl p-5 sm:p-6 text-center border-2 border-christmas-burgundy/70 shadow-card hover:border-christmas-gold transition-colors">
                <span key={timeLeft.seconds} className="font-serif font-black text-4xl sm:text-5xl md:text-6xl text-christmas-burgundy block tracking-tight animate-count-tick">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-christmas-emerald block mt-2 break-words">
                  {t.countdown.seconds}
                </span>
              </div>
            </div>

            {/* Timezone and draw details note */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-christmas-ivory/80 bg-christmas-emerald/70 p-3.5 rounded-xl border border-christmas-gold/20 gap-2">
              <span className="font-medium">{t.countdown.timezoneNote}</span>
              <span className="text-christmas-emerald font-semibold">
                {t.countdown.venueLabel} {language === 'en' ? drawSettings.drawVenue : drawSettings.drawVenue_ml}
              </span>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
