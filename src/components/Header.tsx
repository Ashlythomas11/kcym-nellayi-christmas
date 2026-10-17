import React, { useState } from 'react';
import { Church, Menu, X, Shield, Globe, Award, Gift, Clock, Search } from 'lucide-react';
import kcymLogo from '../../Kcym_state_logo.png';
import { Language } from '../types';
import { translations } from '../constants/translations';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigate: (sectionId: string) => void;
  onOpenAdmin: () => void;
  isPublished: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  onNavigate,
  onOpenAdmin,
  isPublished,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[language];

  const handleNavClick = (sectionId: string) => {
    onNavigate(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-christmas-emerald/95 backdrop-blur-md border-b border-christmas-gold/30 text-christmas-ivory shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand Identity */}
          <button
            onClick={() => handleNavClick('hero')}
            className="flex items-center gap-2.5 sm:gap-3.5 text-left group focus:outline-none focus:ring-2 focus:ring-christmas-gold rounded-lg p-1.5 transition-all"
            aria-label="KCYM St. Mary's Church Nellayi Homepage"
          >
            <img
              src={kcymLogo}
              alt=""
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0 group-hover:scale-105 transition-transform"
            />

            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black tracking-wider text-xl sm:text-2xl text-christmas-ivory">
                  KCYM
                </span>
              </div>
              <p className="text-[11px] sm:text-sm text-christmas-ivory/80 font-medium tracking-wide">
                St.Marys Church, Nellayi
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1.5 lg:gap-3" aria-label="Main Navigation">
            <button
              onClick={() => handleNavClick('hero')}
              className="px-3 py-2 rounded-md text-sm font-medium hover:text-christmas-lightGold hover:bg-white/10 transition-colors focus:ring-2 focus:ring-christmas-gold"
            >
              {t.nav.home}
            </button>
            <button
              onClick={() => handleNavClick('countdown')}
              className="px-3 py-2 rounded-md text-sm font-medium hover:text-christmas-lightGold hover:bg-white/10 transition-colors focus:ring-2 focus:ring-christmas-gold flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4 text-christmas-lightGold" />
              {t.nav.countdown}
            </button>
            <button
              onClick={() => handleNavClick('gifts')}
              className="px-3 py-2 rounded-md text-sm font-medium hover:text-christmas-lightGold hover:bg-white/10 transition-colors focus:ring-2 focus:ring-christmas-gold flex items-center gap-1.5"
            >
              <Gift className="w-4 h-4 text-christmas-lightGold" />
              {t.nav.gifts}
            </button>
            <button
              onClick={() => handleNavClick('results')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:ring-2 focus:ring-christmas-gold flex items-center gap-1.5 ${
                isPublished
                  ? 'bg-christmas-gold text-christmas-darkGreen font-bold shadow-gold-glow hover:bg-christmas-lightGold'
                  : 'hover:text-christmas-lightGold hover:bg-white/10'
              }`}
            >
              <Award className="w-4 h-4" />
              {t.nav.results}
              {isPublished && (
                <span className="w-2 h-2 rounded-full bg-christmas-red animate-ping" />
              )}
            </button>
            <button
              onClick={() => handleNavClick('church')}
              className="px-3 py-2 rounded-md text-sm font-medium hover:text-christmas-lightGold hover:bg-white/10 transition-colors focus:ring-2 focus:ring-christmas-gold"
            >
              {t.nav.church}
            </button>
          </nav>

          {/* Quick Actions (Language, Motion, Admin) */}
          <div className="hidden xl:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-black/15 border border-christmas-gold/40 rounded-full p-0.5">
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all ${
                  language === 'en'
                    ? 'bg-christmas-gold text-christmas-darkGreen shadow'
                    : 'text-christmas-ivory/80 hover:text-christmas-ivory'
                }`}
                aria-label="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange('ml')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all ${
                  language === 'ml'
                    ? 'bg-christmas-gold text-christmas-darkGreen shadow'
                    : 'text-christmas-ivory/80 hover:text-christmas-ivory'
                }`}
                aria-label="മലയാളത്തിലേക്ക് മാറ്റുക"
              >
                മലയാളം
              </button>
            </div>

            {/* Admin Portal Pill */}
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-christmas-gold/50 text-xs font-medium bg-christmas-burgundy hover:bg-christmas-brightRed text-christmas-ivory transition-all shadow-sm focus:ring-2 focus:ring-christmas-gold"
              aria-label="Open Administrator Portal"
            >
              <Shield className="w-3.5 h-3.5 text-christmas-lightGold" />
              <span>Admin</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex xl:hidden items-center gap-2">
            {/* Language switch on mobile */}
            <button
              onClick={() => onLanguageChange(language === 'en' ? 'ml' : 'en')}
              className="min-h-10 min-w-10 px-2.5 py-2 text-xs font-bold rounded border border-christmas-gold/50 text-christmas-ivory bg-white/10"
              aria-label="Toggle language"
            >
              {language === 'en' ? 'മലയാളം' : 'EN'}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-christmas-ivory hover:text-christmas-lightGold hover:bg-white/10 border border-christmas-gold/30 focus:outline-none focus:ring-2 focus:ring-christmas-gold"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-christmas-emerald border-b border-christmas-gold/30 px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          <div className="grid grid-cols-1 gap-1">
            <button
              onClick={() => handleNavClick('hero')}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium hover:bg-white/10 text-left text-christmas-ivory"
            >
              {t.nav.home}
            </button>
            <button
              onClick={() => handleNavClick('countdown')}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium hover:bg-white/10 text-left text-christmas-ivory"
            >
              <Clock className="w-5 h-5 text-christmas-lightGold" />
              {t.nav.countdown}
            </button>
            <button
              onClick={() => handleNavClick('gifts')}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium hover:bg-white/10 text-left text-christmas-ivory"
            >
              <Gift className="w-5 h-5 text-christmas-lightGold" />
              {t.nav.gifts}
            </button>
            <button
              onClick={() => handleNavClick('results')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-md text-base font-medium text-left ${
                isPublished
                  ? 'bg-christmas-gold text-christmas-darkGreen font-bold'
                  : 'hover:bg-white/10 text-christmas-ivory'
              }`}
            >
              <span className="flex items-center gap-3">
                <Award className="w-5 h-5" />
                {t.nav.results}
              </span>
              {isPublished && (
                <span className="text-xs bg-christmas-red text-white px-2 py-0.5 rounded-full font-bold">
                  PUBLISHED
                </span>
              )}
            </button>
            <button
              onClick={() => handleNavClick('church')}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium hover:bg-white/10 text-left text-christmas-ivory"
            >
              <Church className="w-5 h-5 text-christmas-lightGold" />
              {t.nav.church}
            </button>
          </div>

          <div className="pt-3 border-t border-christmas-gold/20 flex items-center justify-between">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-christmas-burgundy text-christmas-lightGold text-sm font-semibold border border-christmas-gold/50"
            >
              <Shield className="w-4 h-4" />
              {t.footer.adminLink}
            </button>

          </div>
        </div>
      )}
    </header>
  );
};
