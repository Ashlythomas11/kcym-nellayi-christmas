import React from 'react';
import { Shield, Heart, ArrowUp } from 'lucide-react';
import kcymLogo from '../../Kcym_state_logo.png';
import { Language } from '../types';
import { translations } from '../constants/translations';

interface FooterProps {
  language: Language;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ language, onOpenAdmin }) => {
  const t = translations[language];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-christmas-darkGreen text-christmas-ivory border-t-2 border-christmas-gold/40 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        <section
          aria-label="Sponsor: Bad Boy Group"
          className="relative overflow-hidden rounded-3xl border border-christmas-gold/50 bg-gradient-to-br from-black/40 via-christmas-emerald/60 to-black/50 p-5 shadow-2xl shadow-black/20 sm:p-8"
        >
          <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-christmas-gold/10 blur-3xl" />
          <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:gap-8 sm:text-left">
            <div className="flex h-36 w-36 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-christmas-gold/50 bg-white shadow-lg shadow-black/20 sm:h-40 sm:w-40">
              <img
                src="/images/sponsors/bad-boy-group.jpg"
                alt="Bad Boy Group sponsor logo"
                className="h-full w-full object-contain"
                loading="lazy"
              />
            </div>
            <div>
              <p className="mb-2 flex items-center justify-center gap-3 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-christmas-champagne sm:justify-start">
                <span className="h-px w-8 bg-christmas-gold/70" />
                Our valued sponsor
                <span className="h-px w-8 bg-christmas-gold/70 sm:hidden" />
              </p>
              <h3 className="bg-gradient-to-r from-christmas-lightGold via-white to-christmas-lightGold bg-clip-text font-serif text-3xl font-black uppercase tracking-wider text-transparent drop-shadow sm:text-5xl">
                BAD BOY GROUP
              </h3>
              <p className="mt-3 text-sm text-christmas-champagne/80">
                With gratitude for supporting our celebration.
              </p>
            </div>
          </div>
        </section>

        <section aria-label={t.footer.officeBearers} className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-center text-xs text-christmas-champagne/80">
          <p>
            {t.footer.director}: <span className="font-semibold text-christmas-ivory">Fr. Thomas Elamkunnapuzha</span>
          </p>
          <p>
            {t.footer.president}: <span className="font-semibold text-christmas-ivory">Jomon George</span>
            {' · '}
            <a href="tel:+919746144002" className="text-christmas-lightGold hover:underline">
              +91 9746144002
            </a>
          </p>
          <p>
            {t.footer.vicePresident}: <span className="font-semibold text-christmas-ivory">Snowel Shaji</span>
            {' · '}
            <a href="tel:+919995102612" className="text-christmas-lightGold hover:underline">
              +91 9995102612
            </a>
          </p>
        </section>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-christmas-gold/20">
          {/* Brand Info */}
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <img src={kcymLogo} alt="" className="w-12 h-12 object-contain flex-shrink-0" />
            <div>
              <h4 className="font-serif font-black text-xl text-christmas-lightGold">
                KCYM • ST. MARY'S CHURCH, NELLAYI
              </h4>
              <p className="text-xs text-christmas-champagne">
                {t.footer.tagline}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdmin}
              className="min-h-10 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black/40 hover:bg-black/60 border border-christmas-gold/40 text-xs text-christmas-lightGold transition-all font-medium"
            >
              <Shield className="w-4 h-4 text-christmas-lightGold" />
              <span>{t.footer.adminLink}</span>
            </button>

            <button
              onClick={scrollToTop}
              className="min-h-10 min-w-10 p-2.5 rounded-xl bg-christmas-emerald/80 hover:bg-christmas-emerald border border-christmas-gold/40 text-christmas-champagne hover:text-white transition-all"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom credits */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-christmas-champagne/70 gap-3 text-center sm:text-left">
          <p>{t.footer.copyright}</p>
          <p className="flex items-center justify-center gap-1">
            <span>Built with devotion & care for Nellayi Parish</span>
            <Heart className="w-3.5 h-3.5 text-christmas-red fill-christmas-red" />
          </p>
        </div>

      </div>
    </footer>
  );
};
