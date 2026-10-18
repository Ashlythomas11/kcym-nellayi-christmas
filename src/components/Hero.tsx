import React from 'react';
import { Gift, Award, MapPin, Calendar, Clock, Tag, ShieldCheck } from 'lucide-react';
import christmasBackground from '../../1e217dbcfc36f8918a9cc66ad3e51939.jpg';
import { Language, DrawSettings } from '../types';
import { translations } from '../constants/translations';

function formatDrawDate(date: string, language: Language, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'ml-IN', {
    ...options,
    timeZone: 'Asia/Kolkata',
  }).format(new Date(date));
}

interface HeroProps {
  language: Language;
  drawSettings: DrawSettings;
  onExploreGifts: () => void;
  onCheckResults: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  language,
  drawSettings,
  onExploreGifts,
  onCheckResults,
}) => {
  const t = translations[language];
  const formattedDrawDate = formatDrawDate(drawSettings.drawDateIST, language, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedDrawTime = formatDrawDate(drawSettings.drawDateIST, language, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <section id="hero" className="relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-christmas-darkGreen via-christmas-emerald to-christmas-darkGreen text-christmas-ivory py-12 lg:py-20 border-b border-christmas-gold/30">
      {/* Decorative festive background elements */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-christmas-gold to-transparent opacity-60" />

      <div
        className="hero-photo-overlay"
        style={{ '--hero-photo': `url("${christmasBackground}")` } as React.CSSProperties}
        aria-hidden="true"
      />

      <div className="absolute inset-x-0 top-0 h-20 pointer-events-none z-[1]" aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => (
          <span
            key={index}
            className="fairy-light"
            style={{
              left: `${5 + index * 8}%`,
              top: `${18 + (index % 3) * 8}px`,
              animationDelay: `${(index % 5) * 0.7}s`,
            }}
          />
        ))}
      </div>

      <div className="snowfall-layer" aria-hidden="true">
        {Array.from({ length: 22 }, (_, index) => (
          <span
            key={index}
            className="snowflake"
            style={{
              left: `${(index * 47 + 9) % 100}%`,
              width: `${2 + (index % 3)}px`,
              height: `${2 + (index % 3)}px`,
              opacity: 0.25 + (index % 5) * 0.12,
              animationDuration: `${12 + (index % 7) * 2}s`,
              animationDelay: `${-((index * 3) % 20)}s`,
              '--drift': `${(index % 2 ? 1 : -1) * (12 + index % 28)}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-[2]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Main Hero Column (7 cols) */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-christmas-gold/50 shadow-sm text-xs sm:text-sm text-christmas-ivory">
              <ShieldCheck className="w-4 h-4 text-christmas-lightGold flex-shrink-0" />
              <span>{t.badge.official} • {language === 'en' ? "St. Mary's Church Nellayi" : 'സെന്റ് മേരീസ് പള്ളി, നെല്ലായി'}</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-christmas-ivory tracking-tight leading-[1.15] drop-shadow-md">
              <span className="block text-christmas-ivory">{language === 'en' ? 'Christmas & New Year' : 'ക്രിസ്മസ്–പുതുവത്സര'}</span>
              <span className="block text-christmas-lightGold">{language === 'en' ? 'Lucky Draw' : 'ഭാഗ്യനറുക്കെടുപ്പ്'}</span>
              <span className="block text-christmas-ivory">{language === 'en' ? 'by KCYM Nellayi' : 'കെ.സി.വൈ.എം. നെല്ലായി യൂണിറ്റ്'}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-christmas-ivory/85 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              {language === 'en' ? drawSettings.heroSubtitle : drawSettings.heroSubtitle_ml}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onExploreGifts}
                className="px-6 py-3.5 rounded-xl bg-christmas-burgundy hover:bg-christmas-brightRed text-christmas-ivory font-bold text-base shadow-red-glow border border-christmas-gold/40 flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <Gift className="w-5 h-5 text-christmas-lightGold" />
                <span>{t.hero.exploreGifts}</span>
              </button>

              <button
                onClick={onCheckResults}
                className="px-6 py-3.5 rounded-xl bg-christmas-ivory hover:bg-christmas-parchment text-christmas-emerald font-bold text-base border border-christmas-gold/50 flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <Award className="w-5 h-5 text-christmas-gold" />
                <span>{t.hero.checkResults}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Festive Card & Key Draw Highlights (5 cols) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-gradient-to-br from-christmas-emerald via-christmas-darkGreen to-christmas-emerald p-6 sm:p-8 border border-christmas-gold/50 shadow-2xl backdrop-blur-md">
              
              <div className="space-y-5">
                <div className="border-b border-christmas-gold/30 pb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-christmas-lightGold">
                    {language === 'en' ? 'Grand Lucky Draw' : 'മഹാ ഭാഗ്യ നറുക്കെടുപ്പ്'}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-christmas-ivory mt-1">
                    {language === 'en' ? 'St. Mary\'s Church, Nellayi' : 'സെന്റ് മേരീസ് പള്ളി, നെല്ലായി'}
                  </h3>
                  <p className="text-xs text-christmas-champagne mt-0.5">
                    {language === 'en' ? 'Organized by KCYM Youth Wing' : 'സംഘാടനം: കെ.സി.വൈ.എം. യുവജന വിഭാഗം'}
                  </p>
                </div>

                {/* Key Details List */}
                <div className="space-y-3.5 text-sm">
                  <div className="flex items-start gap-3 bg-black/20 p-3 rounded-xl border border-christmas-gold/20">
                    <Calendar className="w-5 h-5 text-christmas-lightGold flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-christmas-champagne/80 font-medium">
                        {language === 'en' ? 'Draw Date' : 'നറുക്കെടുപ്പ് തീയതി'}
                      </p>
                      <p className="text-sm font-bold text-christmas-ivory">
                        {formattedDrawDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-black/20 p-3 rounded-xl border border-christmas-gold/20">
                    <Clock className="w-5 h-5 text-christmas-lightGold flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-christmas-champagne/80 font-medium">
                        {language === 'en' ? 'Draw Time (IST)' : 'നറുക്കെടുപ്പ് സമയം (IST)'}
                      </p>
                      <p className="text-sm font-bold text-christmas-ivory">
                        {formattedDrawTime} (Asia/Kolkata)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-black/20 p-3 rounded-xl border border-christmas-gold/20">
                    <MapPin className="w-5 h-5 text-christmas-lightGold flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-christmas-champagne/80 font-medium">
                        {language === 'en' ? 'Draw Venue' : 'നറുക്കെടുപ്പ് സ്ഥലം'}
                      </p>
                      <p className="text-sm font-semibold text-christmas-ivory leading-snug">
                        {language === 'en' ? drawSettings.drawVenue : drawSettings.drawVenue_ml}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-christmas-gold/15 p-3 rounded-xl border border-christmas-gold/40">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-christmas-lightGold" />
                      <span className="text-xs text-christmas-champagne font-medium">
                        {language === 'en' ? 'Coupon Price' : 'കൂപ്പൺ വില'}:
                      </span>
                    </div>
                    <span className="text-lg font-black text-christmas-lightGold font-serif">
                      {drawSettings.couponPrice}
                    </span>
                  </div>
                </div>

                {/* Parish Priest & Organizer Endorsement note */}
                <div className="pt-2 text-center text-xs text-christmas-champagne/80 italic border-t border-christmas-gold/20">
                  {language === 'en'
                    ? '"All coupon contributions directly benefit local parish charity and youth ministry."'
                    : 'കൂപ്പൺ വഴി ലഭിക്കുന്ന തുക ജീവകാരുണ്യ പ്രവർത്തനങ്ങൾക്കും ക്രിസ്മസ് ആഘോഷങ്ങൾക്കും പള്ളി തിരുനാളിനും വിനിയോഗിക്കുന്നു.'}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
