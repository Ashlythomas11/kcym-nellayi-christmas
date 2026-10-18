import React, { useState, useEffect, useCallback, useRef } from 'react';
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

import { INITIAL_DRAW_SETTINGS } from './constants/initialData';
import { Language, Prize, Winner, DrawSettings, AuditLog, AdminUser, CouponSearchResult } from './types';
import {
  fetchDrawSettingsFromSupabase,
  fetchPrizesFromSupabase,
  fetchWinnersFromSupabase,
  getDrawSettings,
  getPrizes,
  getWinners,
  getAuditLogs,
  DATA_CHANGE_EVENT,
  checkCouponNumber,
} from './services/storage';
import { triggerWinnerCelebration } from './utils/confetti';
import { getSupabaseClient, isSupabaseConfigured } from './services/supabaseClient';

export function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [currentView, setCurrentView] = useState<'public' | 'admin-login' | 'admin-dashboard'>('public');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // Core reactive data states
  const [drawSettings, setDrawSettings] = useState<DrawSettings>(INITIAL_DRAW_SETTINGS);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [cloudDataError, setCloudDataError] = useState<string | null>(null);
  const hasLoadedCloudSettings = useRef(false);
  const hasLoadedCloudPrizes = useRef(false);
  const hasLoadedCloudWinners = useRef(false);
  const adminUserRef = useRef(adminUser);
  const [prizes, setPrizes] = useState<Prize[]>(getPrizes);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(getAuditLogs);

  // Quick coupon search pop-up from Hero or QR scan URL parameter
  const [qrSearchResult, setQrSearchResult] = useState<CouponSearchResult | null>(null);

  // Reload state from unified storage
  const reloadData = useCallback(() => {
    const s = getDrawSettings();
    if (!hasLoadedCloudSettings.current) setDrawSettings(s);
    if (!hasLoadedCloudPrizes.current) {
      setPrizes(getPrizes());
    } else {
      void fetchPrizesFromSupabase()
        .then((cloudPrizes) => {
          if (cloudPrizes) {
            hasLoadedCloudPrizes.current = true;
            setPrizes(cloudPrizes);
          }
        })
        .catch((error) => {
          console.error('Unable to refresh the prize catalog:', error);
          setCloudDataError('The latest shared prize and winner data could not be loaded. Please refresh the page or contact the administrator.');
        });
    }
    if (hasLoadedCloudSettings.current && (s.isPublished || adminUser)) {
      void fetchWinnersFromSupabase(Boolean(adminUser))
        .then((cloudWinners) => {
          if (!cloudWinners) return;
          hasLoadedCloudWinners.current = true;
          setWinners(cloudWinners);
        })
        .catch((error) => {
          console.error('Unable to refresh winning coupons:', error);
          setCloudDataError('The latest shared prize and winner data could not be loaded. Please refresh the page or contact the administrator.');
        });
    } else if (hasLoadedCloudSettings.current) {
      hasLoadedCloudWinners.current = false;
      setWinners([]);
    } else if (!hasLoadedCloudWinners.current) {
      setWinners(getWinners(Boolean(adminUser)));
    }
    setAuditLogs(getAuditLogs());
  }, [adminUser]);

  // Listen to cross-component data changes
  useEffect(() => {
    window.addEventListener(DATA_CHANGE_EVENT, reloadData);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, reloadData);
  }, [reloadData]);

  // Load shared settings before showing the public page to avoid flashing stale local values.
  useEffect(() => {
    let isActive = true;
    let channel: ReturnType<NonNullable<ReturnType<typeof getSupabaseClient>>['channel']> | undefined;

    const refreshPublishedData = async () => {
      if (!getSupabaseClient()) {
        setCloudDataError(
          isSupabaseConfigured()
            ? 'The shared database connection could not be initialized.'
            : 'This website is not connected to its shared database. Configure the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
        );
        return;
      }

      try {
        const [settings, cloudPrizes, cloudWinners] = await Promise.all([
          fetchDrawSettingsFromSupabase(),
          fetchPrizesFromSupabase(),
          fetchWinnersFromSupabase(Boolean(adminUserRef.current)),
        ]);
        if (!isActive) return;

        if (settings) {
          hasLoadedCloudSettings.current = true;
          setDrawSettings(settings);
        }
        if (cloudPrizes) {
          hasLoadedCloudPrizes.current = true;
          setPrizes(cloudPrizes);
        }
        if (cloudWinners) {
          hasLoadedCloudWinners.current = true;
          setWinners(cloudWinners);
        } else if (settings && !settings.isPublished && !adminUserRef.current) {
          hasLoadedCloudWinners.current = false;
          setWinners([]);
        }
        setCloudDataError(null);
      } catch (error) {
        console.error('Unable to refresh published draw data:', error);
        setCloudDataError('The latest shared prize and winner data could not be loaded. Please refresh the page or contact the administrator.');
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refreshPublishedData();
      }
    };

    window.addEventListener('focus', refreshPublishedData);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const loadDrawSettings = async () => {
      try {
        const supabase = getSupabaseClient();
        if (!supabase) {
          setCloudDataError(
            isSupabaseConfigured()
              ? 'The shared database connection could not be initialized.'
              : 'This website is not connected to its shared database. Configure the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
          );
          return;
        }

        channel = supabase
          .channel('public-draw-settings')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'draw_settings_publication', filter: 'id=eq.1' },
            refreshPublishedData
          )
          .subscribe((status, error) => {
            if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              console.error('Live published-results subscription failed:', error || status);
            }
          });

        const liveSettings = await fetchDrawSettingsFromSupabase();
        if (!liveSettings || !isActive) return;

        hasLoadedCloudSettings.current = true;
        setDrawSettings(liveSettings);
        const cloudPrizes = await fetchPrizesFromSupabase();
        if (cloudPrizes && isActive) {
          hasLoadedCloudPrizes.current = true;
          setPrizes(cloudPrizes);
        }
        if (liveSettings.isPublished) {
          const cloudWinners = await fetchWinnersFromSupabase();
          if (cloudWinners && isActive) {
            hasLoadedCloudWinners.current = true;
            setWinners(cloudWinners);
          }
        }
        setCloudDataError(null);
      } catch (error) {
        console.error('Unable to load live draw settings; using default settings:', error);
        setCloudDataError('The latest shared prize and winner data could not be loaded. Please refresh the page or contact the administrator.');
      } finally {
        if (isActive) setIsSettingsLoading(false);
      }
    };

    void loadDrawSettings();
    return () => {
      isActive = false;
      window.removeEventListener('focus', refreshPublishedData);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (channel) void getSupabaseClient()?.removeChannel(channel);
    };
  }, []);

  // Handle URL parameters (QR code deep linking)
  useEffect(() => {
    let isActive = true;
    const params = new URLSearchParams(window.location.search);
    
    // Check for direct coupon parameter: ?coupon=7842
    const couponParam = params.get('coupon') || window.location.hash.replace('#coupon=', '');
    if (couponParam) {
      void checkCouponNumber(couponParam, Boolean(adminUser))
        .then((result) => {
          if (!isActive) return;
          setQrSearchResult(result);
          if (result.isWinner) triggerWinnerCelebration();
        })
        .catch((error) => console.error('Unable to check coupon from URL:', error));
    }

    // Check for admin route query: ?admin=true or #admin
    if (params.get('admin') === 'true' || window.location.hash === '#admin') {
      if (adminUser) setCurrentView('admin-dashboard');
      else setCurrentView('admin-login');
    }
    return () => {
      isActive = false;
    };
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
    adminUserRef.current = user;
    setAdminUser(user);
    setCurrentView('admin-dashboard');
    void fetchWinnersFromSupabase(true)
      .then((cloudWinners) => {
        if (cloudWinners) {
          hasLoadedCloudWinners.current = true;
          setWinners(cloudWinners);
        } else {
          setWinners([]);
          setCloudDataError('Administrator results could not be loaded from the shared database.');
        }
        if (cloudWinners) setCloudDataError(null);
      })
      .catch((error) => {
        console.error('Unable to load administrator winners from Supabase:', error);
        setWinners([]);
        setCloudDataError('Administrator results could not be loaded from the shared database.');
      });
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
      adminUserRef.current = null;
      setAdminUser(null);
      setCurrentView('public');
      hasLoadedCloudWinners.current = false;
      setWinners([]);
      if (drawSettings.isPublished) {
        try {
          const cloudWinners = await fetchWinnersFromSupabase(false);
          if (cloudWinners) {
            hasLoadedCloudWinners.current = true;
            setWinners(cloudWinners);
          }
        } catch (error) {
          console.error('Unable to load public winning coupons:', error);
        }
      }
    }
  };

  if (isSettingsLoading && currentView === 'public') {
    return (
      <div
        lang={language === 'ml' ? 'ml' : 'en'}
        className={`min-h-screen bg-gray-50 ${language === 'ml' ? 'font-malayalam' : 'font-sans'}`}
      >
        <div role="status" aria-label="Loading latest draw settings" className="flex min-h-screen items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-christmas-emerald/20 border-t-christmas-emerald" />
        </div>
      </div>
    );
  }

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
          cloudDataError={cloudDataError}
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
              dataError={cloudDataError}
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
