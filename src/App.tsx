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
  mapDrawSettingsRow,
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
  const [drawSettings, setDrawSettings] = useState<DrawSettings>(INITIAL_DRAW_SETTINGS);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
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
        .catch((error) => console.error('Unable to refresh the prize catalog:', error));
    }
    if (hasLoadedCloudSettings.current && (s.isPublished || adminUser)) {
      void fetchWinnersFromSupabase()
        .then((cloudWinners) => {
          if (!cloudWinners) return;
          hasLoadedCloudWinners.current = true;
          setWinners(cloudWinners);
        })
        .catch((error) => console.error('Unable to refresh winning coupons:', error));
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

    const loadDrawSettings = async () => {
      try {
        const supabase = getSupabaseClient();
        if (!supabase) return;

        channel = supabase
          .channel('public-draw-settings')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'draw_settings', filter: 'id=eq.1' },
            (payload) => {
              if (!isActive || !payload.new || Object.keys(payload.new).length === 0) return;
              hasLoadedCloudSettings.current = true;
              const settings = mapDrawSettingsRow(payload.new);
              setDrawSettings(settings);
              void fetchPrizesFromSupabase()
                .then((cloudPrizes) => {
                  if (!isActive || !cloudPrizes) return;
                  hasLoadedCloudPrizes.current = true;
                  setPrizes(cloudPrizes);
                })
                .catch((error) => console.error('Unable to refresh the prize catalog:', error));
              if (settings.isPublished || adminUserRef.current) {
                void fetchWinnersFromSupabase()
                  .then((cloudWinners) => {
                    if (!isActive || !cloudWinners) return;
                    hasLoadedCloudWinners.current = true;
                    setWinners(cloudWinners);
                  })
                  .catch((error) => console.error('Unable to refresh published winners:', error));
              } else {
                hasLoadedCloudWinners.current = false;
                setWinners([]);
              }
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'winners' },
            () => {
              if (!isActive || (!adminUserRef.current && !hasLoadedCloudSettings.current)) return;
              void fetchWinnersFromSupabase()
                .then((cloudWinners) => {
                  if (!isActive || !cloudWinners) return;
                  hasLoadedCloudWinners.current = true;
                  setWinners(cloudWinners);
                })
                .catch((error) => console.error('Unable to refresh winning coupons:', error));
            }
          )
          .subscribe((status, error) => {
            if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              console.error('Live draw settings subscription failed:', error || status);
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
          try {
            const cloudWinners = await fetchWinnersFromSupabase();
            if (cloudWinners && isActive) {
              hasLoadedCloudWinners.current = true;
              setWinners(cloudWinners);
            }
          } catch (error) {
            console.error('Unable to load published winning coupons:', error);
          }
        }
      } catch (error) {
        console.error('Unable to load live draw settings; using default settings:', error);
      } finally {
        if (isActive) setIsSettingsLoading(false);
      }
    };

    void loadDrawSettings();
    return () => {
      isActive = false;
      if (channel) void getSupabaseClient()?.removeChannel(channel);
    };
  }, []);

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
    adminUserRef.current = user;
    setAdminUser(user);
    setCurrentView('admin-dashboard');
    void fetchWinnersFromSupabase()
      .then((cloudWinners) => {
        if (cloudWinners) {
          hasLoadedCloudWinners.current = true;
          setWinners(cloudWinners);
        } else {
          setWinners(getWinners(true));
        }
      })
      .catch((error) => {
        console.error('Unable to load administrator winners from Supabase:', error);
        setWinners(getWinners(true));
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
          const cloudWinners = await fetchWinnersFromSupabase();
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
