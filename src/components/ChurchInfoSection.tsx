import React from 'react';
import { Church, ShieldAlert, MapPin, Heart, CheckCircle2, ArrowRight } from 'lucide-react';
import { Language, DrawSettings } from '../types';
import { translations } from '../constants/translations';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface ChurchInfoSectionProps {
  language: Language;
  drawSettings: DrawSettings;
}

export const ChurchInfoSection: React.FC<ChurchInfoSectionProps> = ({ language, drawSettings }) => {
  const t = translations[language];
  const revealRef = useScrollReveal<HTMLElement>();

  return (
    <section id="church" ref={revealRef} data-reveal className="scroll-mt-24 py-16 bg-christmas-ivory border-b border-christmas-gold/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-christmas-emerald/10 border border-christmas-emerald/30 text-christmas-emerald text-xs font-semibold">
            <Church className="w-4 h-4 text-christmas-emerald" />
            <span>KCYM Nellayi Unit • Diocese of Irinjalakuda</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-christmas-emerald">
            {t.church.aboutTitle}
          </h2>

          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            {t.church.aboutDesc}
          </p>
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Rules & Guidelines */}
          <div className="bg-christmas-ivory rounded-3xl p-5 sm:p-6 border-2 border-christmas-emerald/40 shadow-lg shadow-christmas-emerald/10 flex flex-col space-y-4">
            <div className="flex items-center gap-2.5 text-christmas-red">
              <ShieldAlert className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-serif text-xl font-bold text-christmas-emerald">
                {t.church.rulesTitle}
              </h3>
            </div>

            <ul className="flex flex-1 flex-col justify-between space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
              <li className="flex items-start gap-2 rounded-xl border-2 border-christmas-emerald/25 bg-christmas-ivory p-2.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-christmas-gold flex-shrink-0 mt-0.5" />
                <span>{t.church.rule1}</span>
              </li>
              <li className="flex items-start gap-2 rounded-xl border-2 border-christmas-emerald/25 bg-christmas-ivory p-2.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-christmas-gold flex-shrink-0 mt-0.5" />
                <span>{t.church.rule2}</span>
              </li>
              <li className="flex items-start gap-2 rounded-xl border-2 border-christmas-emerald/25 bg-christmas-ivory p-2.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-christmas-gold flex-shrink-0 mt-0.5" />
                <span>{t.church.rule3}</span>
              </li>
              <li className="flex items-start gap-2 rounded-xl border-2 border-christmas-emerald/25 bg-christmas-ivory p-2.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-christmas-gold flex-shrink-0 mt-0.5" />
                <span>{t.church.rule4}</span>
              </li>
            </ul>

            <div className="bg-christmas-parchment border-2 border-christmas-wood/35 rounded-2xl p-3 text-xs text-christmas-wood flex items-center gap-3 shadow-md shadow-christmas-wood/10">
              <Heart className="w-5 h-5 text-christmas-red flex-shrink-0 fill-christmas-red" />
              <span>
                {language === 'en'
                  ? 'Coupon proceeds support charitable causes, Christmas celebrations, and church festivals.'
                  : 'കൂപ്പൺ വഴി ലഭിക്കുന്ന തുക ജീവകാരുണ്യ പ്രവർത്തനങ്ങൾക്കും ക്രിസ്മസ് ആഘോഷങ്ങൾക്കും പള്ളി തിരുനാളുകൾക്കും വിനിയോഗിക്കുന്നു.'}
              </span>
            </div>
          </div>

          {/* Contact & Parish Office */}
          <div className="bg-gradient-to-br from-christmas-darkGreen to-christmas-emerald text-christmas-ivory rounded-3xl p-5 sm:p-6 border-2 border-christmas-gold/50 shadow-card flex flex-col gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-christmas-lightGold uppercase tracking-wider">
                {language === 'en' ? 'Official Contacts' : 'ഔദ്യോഗിക ബന്ധപ്പെടൽ വിവരങ്ങൾ'}
              </span>
              <h3 className="font-serif text-2xl font-bold text-christmas-ivory">
                {t.church.contactTitle}
              </h3>
            </div>

            <div className="flex-1 flex flex-col gap-3 text-sm">
              <div className="overflow-hidden rounded-2xl border border-christmas-gold/30 bg-black/20">
                <iframe
                  title="Google Maps preview of St. Mary's Church, Nellayi"
                  src="https://www.google.com/maps?q=St.%20Mary%27s%20Church%2C%20Nellayi%20P.O.%2C%20Thrissur%20District%2C%20Kerala%20680305%2C%20India&output=embed"
                  className="h-32 w-full border-0 [filter:invert(90%)_hue-rotate(180deg)_sepia(15%)_saturate(120%)_brightness(88%)_contrast(90%)] sm:h-32"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
                <div className="p-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-christmas-lightGold flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs text-christmas-champagne/80 font-medium">
                        {language === 'en' ? "St. Mary's Church, Nellayi" : 'സെന്റ് മേരീസ് പള്ളി, നെല്ലായി'}
                      </p>
                      <p className="mt-1 font-semibold text-christmas-ivory">
                        {language === 'en'
                          ? "St. Mary's Church, Nellayi P.O., Thrissur District, Kerala – 680305, India"
                          : drawSettings.churchAddress_ml}
                      </p>
                      <a
                        href="https://www.google.com/maps/dir/?api=1&destination=St.%20Mary%27s%20Church%2C%20Nellayi%20P.O.%2C%20Thrissur%20District%2C%20Kerala%20680305%2C%20India"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 min-h-10 inline-flex items-center gap-2 px-1 font-semibold text-christmas-lightGold transition-colors hover:text-christmas-ivory"
                      >
                        {language === 'en' ? 'Get Directions' : 'വഴി കണ്ടെത്തുക'}
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <a
                href="https://www.instagram.com/kcym_nellayi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit KCYM Nellayi on Instagram"
                className="group flex items-center gap-3 rounded-2xl border border-christmas-gold/40 bg-black/15 p-3 transition-colors hover:bg-black/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-christmas-lightGold"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-christmas-gold/15 text-christmas-lightGold">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-christmas-champagne/80 font-medium">KCYM Instagram:</span>
                  <span className="font-semibold text-christmas-ivory transition-colors group-hover:text-christmas-lightGold">
                    @kcym_nellayi
                  </span>
                </span>
              </a>
            </div>

            <div className="border-t border-christmas-gold/25 pt-3">
              <p className="font-serif text-sm font-bold text-christmas-lightGold">
                Faith. Fellowship. Service.
              </p>
              <p className="mt-1 text-xs text-christmas-champagne/80">
                Together, we grow in faith and serve our community with love.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
