import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CountdownTimer } from './components/CountdownTimer';
import { GiftGallery } from './components/GiftGallery';
import { ResultsView } from './components/ResultsView';
import { ChurchInfoSection } from './components/ChurchInfoSection';
import { Footer } from './components/Footer';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CouponSearchModal } from './components/CouponSearchModal';

import { Language, Prize, Winner, DrawSettings, AuditLog, AdminUser, CouponSearchResult } from './types';
import {
  getDrawSettings,
  getPrizes,
  getWinners,
  getAuditLogs,
  DATA_CHANGE_EVENT,
  searchCoupon,
} from './services/storage';
import { triggerWinnerCelebration } from './utils/confetti';
import { getSupabaseClient } from './services/supabaseClient';

export function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [currentView, setCurrentView] = useState<'public' | 'admin-login' | 'admin-dashboard'>('public');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // Core reactive data states
  const [drawSettings, setDrawSettings] = useState<DrawSettings>(getDrawSettings);
  const [prizes, setPrizes] = useState<Prize[]>(getPrizes);
  const [winners, setWinners] = useState<Winner[]>(() => getWinners(false));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(getAuditLogs);

  // Quick coupon search pop-up from Hero or QR scan URL parameter
  const [qrSearchResult, setQrSearchResult] = useState<CouponSearchResult | null>(null);

  // Reload state from unified storage
  const reloadData = useCallback(() => {
    const s = getDrawSettings();
    setDrawSettings(s);
    setPrizes(getPrizes());
    setWinners(getWinners(Boolean(adminUser)));
    setAuditLogs(getAuditLogs());
  }, [adminUser]);

  // Listen to cross-component data changes
  useEffect(() => {
    window.addEventListener(DATA_CHANGE_EVENT, reloadData);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, reloadData);
  }, [reloadData]);

  // Handle URL parameters (QR code deep linking)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Check for direct coupon parameter: ?coupon=7842
    const couponParam = params.get('coupon') || window.location.hash.replace('#coupon=', '');
    if (couponParam) {
      const result = searchCoupon(couponParam, Boolean(adminUser));
      setQrSearchResult(result);
      if (result.isWinner) {
        triggerWinnerCelebration();
      }
    }

    // Check for admin route query: ?admin=true or #admin
    if (params.get('admin') === 'true' || window.location.hash === '#admin') {
      if (adminUser) setCurrentView('admin-dashboard');
      else setCurrentView('admin-login');
    }
  }, [adminUser]);

  // Handle section scrolling
  const scrollToSection = (sectionId: string) => {
    setCurrentView('public');
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    }, 50);
  };

  const handleLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    setCurrentView('admin-dashboard');
    // Admin can see unpublished winners for preview/management
    setWinners(getWinners(true));
  };

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Administrator sign-out failed:', error);
      }
    } catch (error) {
      console.error('Administrator sign-out failed:', error);
    } finally {
      setAdminUser(null);
      setCurrentView('public');
      setWinners(getWinners(false));
    }
  };

  return (
    <div lang={language === 'ml' ? 'ml' : 'en'} className={`min-h-screen flex flex-col ${language === 'ml' ? 'font-malayalam' : 'font-sans'}`}>
      
      {/* VIEW 1: ADMIN LOGIN SCREEN */}
      {currentView === 'admin-login' && (
        <AdminLogin
          onLoginSuccess={handleLoginSuccess}
          onCancel={() => setCurrentView('public')}
        />
      )}

      {/* VIEW 2: ADMIN DASHBOARD */}
      {currentView === 'admin-dashboard' && adminUser && (
        <AdminDashboard
          adminUser={adminUser}
          prizes={prizes}
          winners={winners}
          drawSettings={drawSettings}
          auditLogs={auditLogs}
          language={language}
          onRefresh={reloadData}
          onLogout={handleLogout}
          onReturnToPublic={() => setCurrentView('public')}
        />
      )}

      {/* VIEW 3: PUBLIC RESULTS & FESTIVE PORTAL */}
      {currentView === 'public' && (
        <>
          <Header
            language={language}
            onLanguageChange={setLanguage}
            onNavigate={scrollToSection}
            onOpenAdmin={() => {
              if (adminUser) setCurrentView('admin-dashboard');
              else setCurrentView('admin-login');
            }}
            isPublished={drawSettings.isPublished}
          />

          <main className="flex-1">
            <Hero
              language={language}
              drawSettings={drawSettings}
              onExploreGifts={() => scrollToSection('gifts')}
              onCheckResults={() => scrollToSection('results')}
            />

            <CountdownTimer
              language={language}
              drawSettings={drawSettings}
              onViewResults={() => scrollToSection('results')}
            />

            <GiftGallery
              prizes={prizes}
              language={language}
            />

            <ResultsView
              drawSettings={drawSettings}
              prizes={prizes}
              winners={winners}
              language={language}
            />

            <ChurchInfoSection
              language={language}
              drawSettings={drawSettings}
            />
          </main>

          <Footer
            language={language}
            onOpenAdmin={() => {
              if (adminUser) setCurrentView('admin-dashboard');
              else setCurrentView('admin-login');
            }}
          />

          {/* Quick QR / Hero Search Modal */}
          <CouponSearchModal
            searchResult={qrSearchResult}
            language={language}
            drawSettings={drawSettings}
            onClose={() => setQrSearchResult(null)}
          />
        </>
      )}

    </div>
  );
}

export default App;
