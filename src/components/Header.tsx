import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSchoolData } from '../context/SchoolDataContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { schoolConfig, SchoolType } from '../config/schoolConfig';
import {
  Menu,
  X,
  Phone,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  ShieldCheck,
  FileText,
  Search,
  GraduationCap,
  Layers,
  ChevronDown,
  CalendarCheck,
} from 'lucide-react';

interface HeaderProps {
  onOpenAdmission: () => void;
  onOpenTemplateConfig: () => void;
  onOpenVisitModal?: () => void;
  onNavigateApply: () => void;
  onNavigateAdmin: () => void;
  onNavigateStatus?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenVisitModal,
  onNavigateApply,
  onNavigateAdmin,
  onNavigateStatus,
}) => {
  const { lang, setLang, t } = useLanguage();
  const { schoolSettings, schoolType, switchPreset } = useSchoolData();
  const { isAdmin } = useAuth();
  const { appearance, mode, cycleMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [presetDropdownOpen, setPresetDropdownOpen] = useState(false);

  const isHighSchool = schoolType === 'highschool' || schoolType === 'combined';
  const activeLogoUrl = appearance.logoUrl || schoolSettings.logoUrl;

  const navLinks = [
    { href: '#journey', label: isHighSchool ? t('একাডেমিক রোডম্যাপ', 'Roadmap') : t('আলোর যাত্রা', 'Journey of Light') },
    { href: isHighSchool ? '#why-us' : '#daily-life', label: isHighSchool ? t('কেন আমরা', 'Why Choose Us') : t('আমাদের দিন', 'Daily Life') },
    { href: '#teachers', label: t('শিক্ষকবৃন্দ', 'Teachers') },
    { href: '#gallery', label: t('গ্যালারি', 'Gallery') },
    { href: '#contact', label: t('যোগাযোগ', 'Contact') },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const presetLabels: Record<SchoolType, { bn: string; en: string }> = {
    kindergarten: { bn: 'কিন্ডারগার্টেন (Play - 5)', en: 'Kindergarten (Play-5)' },
    primary: { bn: 'প্রাথমিক বিদ্যালয় (১ম - ৫ম)', en: 'Primary (1-5)' },
    highschool: { bn: 'উচ্চ বিদ্যালয় (৬ষ্ঠ - ১০ম)', en: 'High School (6-10)' },
    combined: { bn: 'স্কুল অ্যান্ড কলেজ (প্লে - ১০ম)', en: 'School & College' },
  };

  const modeLabel =
    mode === 'light'
      ? t('লাইট মোড (পরিবর্তন করতে ক্লিক করুন)', 'Light Mode (click to switch)')
      : mode === 'dark'
      ? t('ডার্ক মোড (পরিবর্তন করতে ক্লিক করুন)', 'Dark Mode (click to switch)')
      : t('সিস্টেম মোড (পরিবর্তন করতে ক্লিক করুন)', 'System Mode (click to switch)');

  const ModeIcon = mode === 'dark' ? Moon : mode === 'system' ? Monitor : Sun;

  return (
    <header className="sticky top-0 z-40 w-full transition-colors duration-200 backdrop-blur-md border-b bg-surface/95 border-line/25 text-ink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-20">

          {/* Brand Wordmark & Institutional Badges */}
          <a
            href="#"
            className="flex items-center gap-3 group whitespace-nowrap shrink-0"
            aria-label={lang === 'bn' ? schoolSettings.nameBn : schoolSettings.nameEn}
          >
            {activeLogoUrl ? (
              <img
                src={activeLogoUrl}
                alt={lang === 'bn' ? schoolSettings.nameBn : schoolSettings.nameEn}
                decoding="async"
                className="w-11 h-11 rounded-[var(--radius-btn)] object-contain p-0.5 shadow-sm group-hover:scale-105 transition-transform shrink-0 bg-surface-card border border-line/35"
              />
            ) : (
              <div className="w-11 h-11 rounded-[var(--radius-btn)] bg-gradient-to-tr from-primary-600 to-accent text-on-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
                {isHighSchool ? (
                  <GraduationCap className="w-6 h-6 stroke-[2.2]" />
                ) : (
                  <Sun className="w-6 h-6 stroke-[2.2]" />
                )}
              </div>
            )}

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-base sm:text-xl tracking-tight leading-tight text-ink group-hover:text-primary-600 transition-colors">
                  {lang === 'bn' ? schoolSettings.nameBn : schoolSettings.nameEn}
                </span>
                <span className="hidden 2xl:inline-block text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-surface-2 border border-line/30 text-ink-muted">
                  {schoolConfig.brand.productName}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-ink-muted mt-0.5">
                <span>{schoolSettings.area}, {schoolSettings.upazila}</span>

                {schoolSettings.eiin && (
                  <>
                    <span aria-hidden="true" className="opacity-50">·</span>
                    <span className="font-mono font-bold text-on-accent-soft bg-accent-soft px-1.5 py-0.2 rounded border border-line/25">
                      EIIN {schoolSettings.eiin}
                    </span>
                  </>
                )}

                {schoolSettings.mpoStatus && (
                  <>
                    <span aria-hidden="true" className="opacity-50 hidden md:inline">·</span>
                    <span className="text-primary-700 dark:text-primary-300 hidden md:inline">
                      {schoolSettings.mpoStatus}
                    </span>
                  </>
                )}
              </div>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-semibold">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="text-ink-muted hover:text-primary-600 transition-colors whitespace-nowrap shrink-0 relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-primary-600 hover:after:w-full after:transition-all after:duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Quick School Level Template Switcher */}
            <div className="relative hidden xl:block">
              <button
                type="button"
                onClick={() => setPresetDropdownOpen(!presetDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-[var(--radius-btn)] border bg-surface-2 border-line/35 text-ink hover:border-primary-600 transition-all"
                title={t('স্কুল স্তর প্রিসেট পরিবর্তন করুন', 'Switch School Level Preset')}
              >
                <Layers className="w-3.5 h-3.5 text-primary-600" />
                <span>{presetLabels[schoolType]?.[lang] || 'Preset'}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {presetDropdownOpen && (
                <div className="absolute right-0 mt-1 w-56 rounded-[var(--radius-card)] shadow-xl border bg-surface-card border-line/35 text-ink p-1.5 z-50">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted px-2 py-1">
                    {t('স্কুল প্রিসেট টেমপ্লেট', 'School Level Preset')}
                  </div>
                  {(['kindergarten', 'primary', 'highschool'] as SchoolType[]).map((typeKey) => (
                    <button
                      key={typeKey}
                      type="button"
                      onClick={() => {
                        switchPreset(typeKey);
                        setPresetDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-[var(--radius-btn)] text-xs font-bold transition-colors flex items-center justify-between ${
                        schoolType === typeKey
                          ? 'bg-primary-600 text-on-primary'
                          : 'hover:bg-surface-2 text-ink'
                      }`}
                    >
                      <span>{presetLabels[typeKey][lang]}</span>
                      {schoolType === typeKey && <span className="text-[10px]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Light / Dark / System Mode Toggle */}
            {appearance.showModeToggle && (
              <button
                type="button"
                onClick={cycleMode}
                className="p-2 rounded-[var(--radius-btn)] bg-surface-2 border border-line/35 text-ink hover:border-primary-600 hover:text-primary-600 transition-colors shrink-0"
                title={modeLabel}
                aria-label={modeLabel}
              >
                <ModeIcon className="w-4 h-4" />
              </button>
            )}

            {/* Language Switcher */}
            <div className="flex items-center p-0.5 rounded-full border border-line/35 bg-surface-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLang('bn')}
                className={`px-2.5 sm:px-3 py-1 rounded-full transition-all duration-150 ${
                  lang === 'bn'
                    ? 'bg-primary-600 text-on-primary shadow-xs font-bold'
                    : 'text-ink-muted hover:text-ink'
                }`}
                title="বাংলা নির্বাচন করুন"
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 sm:px-3 py-1 rounded-full transition-all duration-150 ${
                  lang === 'en'
                    ? 'bg-primary-600 text-on-primary shadow-xs font-bold'
                    : 'text-ink-muted hover:text-ink'
                }`}
                title="Switch to English"
              >
                EN
              </button>
            </div>

            {/* Admin Portal Button */}
            <button
              type="button"
              onClick={onNavigateAdmin}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-[var(--radius-btn)] transition-colors border whitespace-nowrap shrink-0 ${
                isAdmin
                  ? 'bg-success-soft text-on-success-soft border-success/40'
                  : 'bg-surface-2 text-ink border-line/35 hover:border-primary-600'
              }`}
              title={t('প্রশাসক ড্যাশবোর্ড', 'Admin Dashboard')}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-primary-600" />
              <span className="hidden sm:inline">{t('অ্যাডমিন', 'Admin')}</span>
            </button>

            {/* Status Check Button */}
            <button
              type="button"
              onClick={onNavigateStatus}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-[var(--radius-btn)] transition-colors border border-line/35 bg-accent-soft text-on-accent-soft hover:opacity-90 whitespace-nowrap shrink-0"
              title={t('ভর্তি আবেদনের বর্তমান অবস্থা', 'Check Admission Status')}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{t('স্ট্যাটাস', 'Status')}</span>
            </button>

            {/* Public Admission Form Link (/apply) */}
            <button
              type="button"
              onClick={onNavigateApply}
              className="px-4 py-2 text-xs sm:text-sm font-bold bg-primary-600 hover:bg-primary-700 text-on-primary rounded-[var(--radius-btn)] shadow-xs hover:shadow-md active:scale-98 transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('ভর্তি আবেদন', 'Apply Now')}</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-ink hover:text-primary-600 rounded-[var(--radius-btn)] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-line/30 px-4 pt-3 pb-6 shadow-xl bg-surface text-ink">
          {/* Mobile Preset Selector */}
          <div className="pb-3 border-b border-line/20 mb-3">
            <span className="text-[10px] font-bold text-ink-muted block mb-1">
              {t('স্কুল স্তর প্রিসেট পরিবর্তন করুন:', 'Switch School Level Preset:')}
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {(['kindergarten', 'primary', 'highschool'] as SchoolType[]).map((typeKey) => (
                <button
                  key={typeKey}
                  type="button"
                  onClick={() => switchPreset(typeKey)}
                  className={`py-1.5 px-2 rounded-[var(--radius-btn)] font-bold text-center border text-[11px] ${
                    schoolType === typeKey
                      ? 'bg-primary-600 text-on-primary border-primary-600'
                      : 'bg-surface-2 text-ink border-line/30'
                  }`}
                >
                  {typeKey === 'kindergarten' ? 'কেজি' : typeKey === 'primary' ? 'প্রাথমিক' : 'উচ্চ বিদ্যালয়'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-2.5">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="px-3 py-2 text-base font-semibold rounded-[var(--radius-btn)] hover:bg-surface-2 transition-colors"
              >
                {link.label}
              </a>
            ))}

            <div className="pt-3 border-t border-line/20 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateApply();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold bg-primary-600 hover:bg-primary-700 text-on-primary rounded-[var(--radius-btn)] shadow-xs"
              >
                <FileText className="w-4 h-4" />
                <span>{t('অনলাইন ভর্তি ফরম (/apply)', 'Online Admission Form (/apply)')}</span>
              </button>

              {onOpenVisitModal && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenVisitModal();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold bg-surface-2 hover:bg-surface-card text-ink rounded-[var(--radius-btn)] border border-line/35"
                >
                  <CalendarCheck className="w-4 h-4 text-accent" />
                  <span>{t('ক্যাম্পাস ভিজিট বুক করুন', 'Book a Campus Visit')}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onNavigateStatus) onNavigateStatus();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-on-accent-soft bg-accent-soft rounded-[var(--radius-btn)] border border-line/25"
              >
                <Search className="w-4 h-4" />
                <span>{t('ভর্তি আবেদনের অবস্থা (/status)', 'Application Status (/status)')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateAdmin();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-[var(--radius-btn)] border border-line/35 bg-surface-2 hover:bg-surface-card text-ink"
              >
                <ShieldCheck className="w-4 h-4 text-primary-600" />
                <span>{t('প্রশাসক ড্যাশবোর্ড (/admin)', 'Admin Dashboard (/admin)')}</span>
              </button>

              <a
                href={`tel:${schoolSettings.phonePrimary}`}
                className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-surface-2 rounded-[var(--radius-btn)] border border-line/30 text-ink"
              >
                <Phone className="w-3.5 h-3.5 text-primary-600" />
                <span>{schoolSettings.phonePrimary}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
