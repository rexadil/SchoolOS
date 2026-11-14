import React, { useState, useEffect, lazy, Suspense } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { SchoolDataProvider, useSchoolData } from './context/SchoolDataContext';
import { schoolConfig } from './config/schoolConfig';
import { HomeSectionKey } from './theme/themes';
import { syncSeoHeadAndSchema, SeoRoute } from './utils/seo';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { StatsStrip } from './components/StatsStrip';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AlertTriangle, Megaphone, X, ArrowRight, Loader2 } from 'lucide-react';

const CurriculumJourney = lazy(() =>
  import('./components/CurriculumJourney').then((m) => ({ default: m.CurriculumJourney }))
);
const AdmissionBanner = lazy(() =>
  import('./components/AdmissionBanner').then((m) => ({ default: m.AdmissionBanner }))
);
const DailyTimeline = lazy(() =>
  import('./components/DailyTimeline').then((m) => ({ default: m.DailyTimeline }))
);
const VirtualTourSection = lazy(() =>
  import('./components/VirtualTourSection').then((m) => ({ default: m.VirtualTourSection }))
);
const TeacherSection = lazy(() =>
  import('./components/TeacherSection').then((m) => ({ default: m.TeacherSection }))
);
const ParentTestimonials = lazy(() =>
  import('./components/ParentTestimonials').then((m) => ({ default: m.ParentTestimonials }))
);
const PhotoGallery = lazy(() =>
  import('./components/PhotoGallery').then((m) => ({ default: m.PhotoGallery }))
);
const ContactSection = lazy(() =>
  import('./components/ContactSection').then((m) => ({ default: m.ContactSection }))
);
const Footer = lazy(() =>
  import('./components/Footer').then((m) => ({ default: m.Footer }))
);
const VisitBookingModal = lazy(() =>
  import('./components/VisitBookingModal').then((m) => ({ default: m.VisitBookingModal }))
);
const SchoolTemplateModal = lazy(() =>
  import('./components/SchoolTemplateModal').then((m) => ({ default: m.SchoolTemplateModal }))
);

const AdminDashboard = lazy(() =>
  import('./pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const ApplyPage = lazy(() =>
  import('./pages/ApplyPage').then((m) => ({ default: m.ApplyPage }))
);
const StatusPage = lazy(() =>
  import('./pages/StatusPage').then((m) => ({ default: m.StatusPage }))
);

type ViewRoute = 'home' | 'apply' | 'admin' | 'status';

function SchoolApp() {
  const { lang, t } = useLanguage();
  const { demoMode, schoolSettings } = useSchoolData();
  const { appearance, resolvedMode } = useTheme();

  const [currentRoute, setCurrentRoute] = useState<ViewRoute>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/admin') || hash.includes('admin')) return 'admin';
      if (path.includes('/apply') || hash.includes('apply')) return 'apply';
      if (path.includes('/status') || hash.includes('status')) return 'status';
    }
    return 'home';
  });

  const [prefilledAppNo, setPrefilledAppNo] = useState<string>('');
  const [isVisitModalOpen, setIsVisitModalOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      return path.includes('/visit') || hash === '#visit';
    }
    return false;
  });
  const [selectedClassForAdmission, setSelectedClassForAdmission] = useState<string | undefined>(undefined);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  // Sync route with URL bar & browser history
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/admin') || hash.includes('admin')) {
        setCurrentRoute('admin');
        setIsVisitModalOpen(false);
      } else if (path.includes('/apply') || hash.includes('apply')) {
        setCurrentRoute('apply');
        setIsVisitModalOpen(false);
      } else if (path.includes('/status') || hash.includes('status')) {
        setCurrentRoute('status');
        setIsVisitModalOpen(false);
      } else if (path.includes('/visit') || hash === '#visit') {
        setCurrentRoute('home');
        setIsVisitModalOpen(true);
      } else {
        setCurrentRoute('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigateTo = (route: ViewRoute, extraParam?: string) => {
    setCurrentRoute(route);
    setIsVisitModalOpen(false);
    if (route === 'status' && extraParam) {
      setPrefilledAppNo(extraParam);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (route === 'admin') {
      window.history.pushState(null, '', '#admin');
    } else if (route === 'apply') {
      window.history.pushState(null, '', '#apply');
    } else if (route === 'status') {
      window.history.pushState(null, '', '#status');
    } else {
      window.history.pushState(null, '', '#');
    }
  };

  const openVisitModal = () => {
    if (currentRoute !== 'home') {
      setCurrentRoute('home');
    }
    setIsVisitModalOpen(true);
    if (typeof window !== 'undefined' && window.location.hash !== '#visit') {
      window.history.pushState(null, '', '#visit');
    }
  };

  const closeVisitModal = () => {
    setIsVisitModalOpen(false);
    if (typeof window !== 'undefined' && window.location.hash === '#visit') {
      window.history.pushState(null, '', '#');
    }
  };

  const handleScrollToJourney = () => {
    const el = document.getElementById('journey');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Sync dynamic document head metadata, Open Graph, Canonical & School Schema.org JSON-LD
  useEffect(() => {
    const seoRoute: SeoRoute = isVisitModalOpen ? 'visit' : currentRoute;
    syncSeoHeadAndSchema({
      route: seoRoute,
      lang,
      schoolConfig,
      schoolSettings,
      appearance,
    });
  }, [
    currentRoute,
    isVisitModalOpen,
    schoolSettings,
    lang,
    appearance,
    resolvedMode,
  ]);

  // Demo Safety Check: show sticky banner whenever demoMode is enabled
  const isDemoBannerVisible = Boolean(demoMode);

  const announcementText =
    lang === 'bn' ? appearance.announcement.textBn : appearance.announcement.textEn;
  const showAnnouncement =
    currentRoute === 'home' &&
    appearance.announcement.enabled &&
    Boolean(announcementText?.trim()) &&
    !announcementDismissed;

  const handleAnnouncementLink = (e: React.MouseEvent, url?: string) => {
    if (!url) return;
    const trimmed = url.trim();
    if (trimmed === '#apply' || trimmed === '/apply') {
      e.preventDefault();
      navigateTo('apply');
    } else if (trimmed === '#status' || trimmed === '/status') {
      e.preventDefault();
      navigateTo('status');
    } else if (trimmed === '#visit' || trimmed === '/visit') {
      e.preventDefault();
      openVisitModal();
    } else if (trimmed === '#admin' || trimmed === '/admin') {
      e.preventDefault();
      navigateTo('admin');
    } else if (trimmed.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(trimmed);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const sectionFallback = (
    <div className="py-12 flex items-center justify-center bg-surface text-ink-muted">
      <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
    </div>
  );

  const renderHomeSection = (key: HomeSectionKey) => {
    if (appearance.hiddenSections.includes(key)) return null;

    switch (key) {
      case 'hero':
        return (
          <Hero
            key="hero"
            onOpenAdmission={() => navigateTo('apply')}
            onExploreJourney={handleScrollToJourney}
            onBookVisit={openVisitModal}
          />
        );
      case 'stats':
        return <StatsStrip key="stats" />;
      case 'admissionBanner':
        return (
          <Suspense key="admissionBanner" fallback={sectionFallback}>
            <AdmissionBanner
              onOpenAdmission={() => navigateTo('apply')}
              onNavigateStatus={() => navigateTo('status')}
              onBookVisit={openVisitModal}
            />
          </Suspense>
        );
      case 'journey':
        return (
          <Suspense key="journey" fallback={sectionFallback}>
            <CurriculumJourney
              onSelectClassForAdmission={(className) => {
                setSelectedClassForAdmission(className);
                navigateTo('apply');
              }}
            />
          </Suspense>
        );
      case 'dailyLife':
        return (
          <Suspense key="dailyLife" fallback={sectionFallback}>
            <DailyTimeline />
          </Suspense>
        );
      case 'virtualTour':
        return (
          <Suspense key="virtualTour" fallback={null}>
            <VirtualTourSection onBookVisit={openVisitModal} />
          </Suspense>
        );
      case 'teachers':
        return (
          <Suspense key="teachers" fallback={sectionFallback}>
            <TeacherSection />
          </Suspense>
        );
      case 'testimonials':
        return (
          <Suspense key="testimonials" fallback={null}>
            <ParentTestimonials />
          </Suspense>
        );
      case 'gallery':
        return (
          <Suspense key="gallery" fallback={sectionFallback}>
            <PhotoGallery />
          </Suspense>
        );
      case 'contact':
        return (
          <Suspense key="contact" fallback={sectionFallback}>
            <ContactSection />
          </Suspense>
        );
      default:
        return null;
    }
  };

  const routeFallback = (
    <div className="min-h-[60vh] flex items-center justify-center p-6 bg-surface text-ink">
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        <p className="text-sm font-semibold text-ink-muted">
          {t('পাতাটি লোড হচ্ছে...', 'Loading page...')}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-surface text-ink selection:bg-primary-200 selection:text-primary-900 transition-colors duration-200">
      {/* WCAG AA Skip to Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2.5 focus:rounded-[var(--radius-btn)] focus:bg-primary-600 focus:text-on-primary focus:text-xs focus:font-bold focus:shadow-lg"
      >
        {t('মূল অংশে যান', 'Skip to main content')}
      </a>

      {/* Demo Safety Banner */}
      {isDemoBannerVisible && (
        <aside
          role="alert"
          aria-label="Demo Mode Safety Warning"
          className="sticky top-0 z-50 w-full bg-danger text-on-danger text-xs sm:text-sm font-bold py-2.5 px-4 text-center shadow-md flex items-center justify-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>ডেমো মোড — এখানে দেওয়া তথ্য সংরক্ষিত হবে না / Demo mode — data is NOT saved</span>
        </aside>
      )}

      {/* Optional Announcement Bar */}
      {showAnnouncement && (
        <div
          className={`w-full text-xs sm:text-sm font-semibold py-2 px-4 border-b transition-colors ${
            appearance.announcement.style === 'primary'
              ? 'bg-primary-600 text-on-primary border-primary-700/30'
              : appearance.announcement.style === 'warning'
              ? 'bg-warning-soft text-on-warning-soft border-warning/30'
              : appearance.announcement.style === 'success'
              ? 'bg-success-soft text-on-success-soft border-success/30'
              : appearance.announcement.style === 'neutral'
              ? 'bg-surface-2 text-ink border-line/35'
              : 'bg-accent text-on-accent border-line/20'
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 mx-auto text-center">
              <Megaphone className="w-4 h-4 shrink-0" />
              {appearance.announcement.linkUrl ? (
                <a
                  href={appearance.announcement.linkUrl}
                  onClick={(e) => handleAnnouncementLink(e, appearance.announcement.linkUrl)}
                  className="inline-flex items-center gap-1.5 hover:underline font-bold"
                >
                  <span>{announcementText}</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </a>
              ) : (
                <span>{announcementText}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setAnnouncementDismissed(true)}
              aria-label={t('বন্ধ করুন', 'Dismiss announcement')}
              className="p-1 rounded-md opacity-80 hover:opacity-100 transition-opacity shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 1. Render Admin Dashboard Page */}
      {currentRoute === 'admin' && (
        <Suspense fallback={routeFallback}>
          <AdminDashboard onGoHome={() => navigateTo('home')} />
        </Suspense>
      )}

      {/* 2. Render Public Admission Application Form Page (/apply) */}
      {currentRoute === 'apply' && (
        <Suspense fallback={routeFallback}>
          <ApplyPage
            onGoHome={() => navigateTo('home')}
            onNavigateStatus={(appNo) => navigateTo('status', appNo)}
            initialClass={selectedClassForAdmission}
          />
        </Suspense>
      )}

      {/* 3. Render Public Application Status Verification Page (/status) */}
      {currentRoute === 'status' && (
        <Suspense fallback={routeFallback}>
          <StatusPage
            onGoHome={() => navigateTo('home')}
            onNavigateApply={() => navigateTo('apply')}
            initialAppNo={prefilledAppNo}
          />
        </Suspense>
      )}

      {/* 4. Render Public Homepage */}
      {currentRoute === 'home' && (
        <>
          <Header
            onOpenVisitModal={openVisitModal}
            onNavigateApply={() => navigateTo('apply')}
            onNavigateAdmin={() => navigateTo('admin')}
            onNavigateStatus={() => navigateTo('status')}
          />

          <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
            {appearance.sectionOrder.map((secKey) => renderHomeSection(secKey))}
          </main>

          <Suspense fallback={null}>
            <Footer
              onOpenTemplateConfig={() => setIsTemplateModalOpen(true)}
              onOpenVisitModal={openVisitModal}
              onNavigateApply={() => navigateTo('apply')}
              onNavigateAdmin={() => navigateTo('admin')}
              onNavigateStatus={() => navigateTo('status')}
            />
          </Suspense>

          {isVisitModalOpen && (
            <Suspense fallback={null}>
              <VisitBookingModal
                isOpen={isVisitModalOpen}
                onClose={closeVisitModal}
              />
            </Suspense>
          )}

          {isTemplateModalOpen && (
            <Suspense fallback={null}>
              <SchoolTemplateModal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
              />
            </Suspense>
          )}
        </>
      )}

      {/* Floating WhatsApp Support & Offline Indicator on Public Views */}
      {currentRoute !== 'admin' && <FloatingWhatsApp />}
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ThemeProvider>
          <SchoolDataProvider>
            <SchoolApp />
          </SchoolDataProvider>
        </ThemeProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
