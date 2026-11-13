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
import { CurriculumJourney } from './components/CurriculumJourney';
import { AdmissionBanner } from './components/AdmissionBanner';
import { DailyTimeline } from './components/DailyTimeline';
import { VirtualTourSection } from './components/VirtualTourSection';
import { TeacherSection } from './components/TeacherSection';
import { ParentTestimonials } from './components/ParentTestimonials';
import { PhotoGallery } from './components/PhotoGallery';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AdmissionModal } from './components/AdmissionModal';
import { VisitBookingModal } from './components/VisitBookingModal';
import { SchoolTemplateModal } from './components/SchoolTemplateModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AlertTriangle, Megaphone, X, ArrowRight, Loader2 } from 'lucide-react';

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
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
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

  const handleOpenAdmissionModal = (className?: string) => {
    setSelectedClassForAdmission(className);
    setIsAdmissionModalOpen(true);
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
          <AdmissionBanner
            key="admissionBanner"
            onOpenAdmission={() => navigateTo('apply')}
            onNavigateStatus={() => navigateTo('status')}
            onBookVisit={openVisitModal}
          />
        );
      case 'journey':
        return (
          <CurriculumJourney
            key="journey"
            onSelectClassForAdmission={(className) => {
              setSelectedClassForAdmission(className);
              navigateTo('apply');
            }}
          />
        );
      case 'dailyLife':
        return <DailyTimeline key="dailyLife" />;
      case 'virtualTour':
        return <VirtualTourSection key="virtualTour" onBookVisit={openVisitModal} />;
      case 'teachers':
        return <TeacherSection key="teachers" />;
      case 'testimonials':
        return <ParentTestimonials key="testimonials" />;
      case 'gallery':
        return <PhotoGallery key="gallery" />;
      case 'contact':
        return <ContactSection key="contact" />;
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
        <div className="w-full bg-accent text-on-accent text-xs sm:text-sm font-semibold py-2 px-4 border-b border-line/20">
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
            onOpenAdmission={() => handleOpenAdmissionModal()}
            onOpenTemplateConfig={() => setIsTemplateModalOpen(true)}
            onOpenVisitModal={openVisitModal}
            onNavigateApply={() => navigateTo('apply')}
            onNavigateAdmin={() => navigateTo('admin')}
            onNavigateStatus={() => navigateTo('status')}
          />

          <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
            {appearance.sectionOrder.map((secKey) => renderHomeSection(secKey))}
          </main>

          <Footer
            onOpenAdmission={() => handleOpenAdmissionModal()}
            onOpenTemplateConfig={() => setIsTemplateModalOpen(true)}
            onOpenVisitModal={openVisitModal}
            onNavigateApply={() => navigateTo('apply')}
            onNavigateAdmin={() => navigateTo('admin')}
            onNavigateStatus={() => navigateTo('status')}
          />

          <AdmissionModal
            isOpen={isAdmissionModalOpen}
            onClose={() => setIsAdmissionModalOpen(false)}
            preselectedClass={selectedClassForAdmission}
          />

          <VisitBookingModal
            isOpen={isVisitModalOpen}
            onClose={closeVisitModal}
          />

          <SchoolTemplateModal
            isOpen={isTemplateModalOpen}
            onClose={() => setIsTemplateModalOpen(false)}
          />
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
