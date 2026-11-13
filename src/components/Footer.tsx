import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSchoolData } from '../context/SchoolDataContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { schoolConfig } from '../config/schoolConfig';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Sun,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  ArrowUp,
  ShieldCheck,
  FileText,
  Search,
  Facebook,
  Youtube,
  Instagram,
  Globe,
  CalendarCheck,
} from 'lucide-react';

interface FooterProps {
  onOpenAdmission: () => void;
  onOpenTemplateConfig: () => void;
  onOpenVisitModal?: () => void;
  onNavigateApply: () => void;
  onNavigateAdmin: () => void;
  onNavigateStatus?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenTemplateConfig,
  onOpenVisitModal,
  onNavigateApply,
  onNavigateAdmin,
  onNavigateStatus,
}) => {
  const { lang, t, formatNumber } = useLanguage();
  const { schoolSettings, levels, schoolType } = useSchoolData();
  const { isOwner } = useAuth();
  const { appearance } = useTheme();

  const isHighSchool = schoolType === 'highschool' || schoolType === 'combined';
  const activeLogoUrl = appearance.logoUrl || schoolSettings.logoUrl;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialItems = [
    { key: 'facebook', url: appearance.socialLinks.facebook, label: 'Facebook', icon: <Facebook className="w-4 h-4" /> },
    { key: 'youtube', url: appearance.socialLinks.youtube, label: 'YouTube', icon: <Youtube className="w-4 h-4" /> },
    { key: 'instagram', url: appearance.socialLinks.instagram, label: 'Instagram', icon: <Instagram className="w-4 h-4" /> },
    { key: 'website', url: appearance.socialLinks.website, label: 'Website', icon: <Globe className="w-4 h-4" /> },
  ].filter((item) => Boolean(item.url && item.url.trim()));

  return (
    <footer className="bg-surface-2 text-ink pt-16 pb-12 border-t border-line/35 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-line/25">

          {/* Brand & Slogan Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              {activeLogoUrl ? (
                <img
                  src={activeLogoUrl}
                  alt={lang === 'bn' ? schoolSettings.nameBn : schoolSettings.nameEn}
                  loading="lazy"
                  decoding="async"
                  className="w-10 h-10 rounded-[var(--radius-btn)] object-contain p-0.5 bg-surface-card border border-line/35"
                />
              ) : (
                <div className="w-10 h-10 rounded-[var(--radius-btn)] bg-primary-600 text-on-primary flex items-center justify-center shadow-xs">
                  {isHighSchool ? (
                    <GraduationCap className="w-6 h-6 stroke-[2.2]" />
                  ) : (
                    <Sun className="w-6 h-6 stroke-[2.2]" />
                  )}
                </div>
              )}
              <div>
                <span className="font-heading font-extrabold text-xl text-ink block leading-tight">
                  {lang === 'bn' ? schoolSettings.nameBn : schoolSettings.nameEn}
                </span>
                <span className="text-[11px] font-bold tracking-wider uppercase text-primary-700 dark:text-primary-300">
                  {schoolConfig.brand.productName}
                </span>
              </div>
            </div>

            <p className="text-primary-700 dark:text-primary-300 text-sm font-heading italic max-w-sm">
              "{lang === 'bn' ? schoolSettings.sloganBn : schoolSettings.sloganEn}"
            </p>

            <p className="text-xs text-ink-muted leading-[1.7] max-w-md">
              {isHighSchool
                ? t(
                    `${schoolSettings.district} জেলার ${schoolSettings.upazila} উপজেলার ${schoolSettings.area} এ অবস্থিত একটি সুপ্রতিষ্ঠিত ও আধুনিক মাধ্যমিক বিদ্যাপীঠ। ৬ষ্ঠ থেকে ১০ম শ্রেণি পর্যন্ত প্রতিটি শিক্ষার্থীর মেধা বিকাশ ও এসএসসি সাফল্যের নিশ্চয়তা।`,
                    `A distinguished secondary institution in ${schoolSettings.area}, ${schoolSettings.upazila}, ${schoolSettings.district} offering rigorous academic guidance, science laboratories, and board examination success from Class 6 to 10.`
                  )
                : t(
                    `${schoolSettings.district} জেলার ${schoolSettings.upazila} উপজেলার ${schoolSettings.area} এ অবস্থিত একটি আধুনিক, সংস্কৃতিবান ও ভীতিহীন প্রাক-প্রাথমিক ও প্রাথমিক বিদ্যাপিঠ। প্রতিটি শিশুর নিজস্ব আলো প্রজ্জ্বলনই আমাদের ব্রত।`,
                    `A forward-thinking, culturally rooted pre-primary and primary sanctuary at ${schoolSettings.area}, ${schoolSettings.upazila}, ${schoolSettings.district}. Dedicated to kindling the inner brilliance of every child.`
                  )}
            </p>

            {/* Institutional Credentials */}
            <div className="text-xs text-ink-muted pt-2 flex flex-wrap items-center gap-2">
              {schoolSettings.eiin && (
                <span className="inline-flex items-center gap-1 bg-surface-card border border-line/30 px-2.5 py-0.5 rounded-[var(--radius-btn)] text-accent font-mono">
                  <span className="font-sans text-[11px] text-ink-muted">EIIN:</span>
                  <strong>{schoolSettings.eiin}</strong>
                </span>
              )}

              {schoolSettings.mpoStatus && (
                <span className="inline-flex items-center gap-1 bg-accent-soft text-on-accent-soft border border-line/25 px-2.5 py-0.5 rounded-[var(--radius-btn)] font-medium">
                  {schoolSettings.mpoStatus}
                </span>
              )}

              {schoolSettings.schoolCode && (
                <span className="inline-flex items-center gap-1 bg-surface-card border border-line/30 px-2.5 py-0.5 rounded-[var(--radius-btn)] text-primary-700 dark:text-primary-300 font-mono">
                  <span className="font-sans text-[11px] text-ink-muted">{t('কোড:', 'Code:')}</span>
                  <strong>{schoolSettings.schoolCode}</strong>
                </span>
              )}

              {schoolSettings.registrationNo && (
                <span className="text-ink-muted font-mono text-[11px]">
                  {schoolSettings.registrationNo}
                </span>
              )}
            </div>

            {/* Social Media Links */}
            {socialItems.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {socialItems.map((item) => (
                  <a
                    key={item.key}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-btn)] bg-surface-card border border-line/30 text-ink hover:border-primary-600 hover:text-primary-600 text-xs font-semibold transition-colors"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links Column */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary-700 dark:text-primary-300">
              {t('প্রয়োজনীয় লিংক', 'Quick Navigation')}
            </h4>

            <ul className="space-y-2 text-xs sm:text-sm text-ink-muted">
              <li>
                <a href="#journey" className="hover:text-primary-600 transition-colors">
                  {t(
                    `পাঠ্যক্রম (${formatNumber(levels.length)}টি শ্রেণি)`,
                    `Curriculum (${formatNumber(levels.length)} Classes)`
                  )}
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onNavigateApply}
                  className="hover:text-primary-600 transition-colors text-left flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-primary-600" />
                  <span>{t('অনলাইন ভর্তি ফরম (/apply)', 'Online Admission (/apply)')}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onNavigateStatus}
                  className="hover:text-primary-600 transition-colors text-left flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5 text-primary-600" />
                  <span>{t('ভর্তি আবেদনের অবস্থা (/status)', 'Application Status (/status)')}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onNavigateAdmin}
                  className="hover:text-primary-600 transition-colors text-left flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                  <span>{t('অ্যাডমিন পোর্টাল (/admin)', 'Admin Portal (/admin)')}</span>
                </button>
              </li>
              <li>
                <a href="#teachers" className="hover:text-primary-600 transition-colors">
                  {t('শিক্ষকমণ্ডলী ও প্রধান শিক্ষকের বাণী', 'Faculty & Head Message')}
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-primary-600 transition-colors">
                  {t('ক্যাম্পাস ছবি গ্যালারি', 'Campus Photo Gallery')}
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-primary-600 transition-colors">
                  {t(`${schoolSettings.area} ক্যাম্পাসের অবস্থান`, 'Campus Location Map')}
                </a>
              </li>
              {onOpenVisitModal && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenVisitModal}
                    className="hover:text-primary-600 transition-colors text-left flex items-center gap-1.5"
                  >
                    <CalendarCheck className="w-3.5 h-3.5 text-primary-600" />
                    <span>{t('ক্যাম্পাস ভিজিট বুকিং (#visit)', 'Book a Campus Visit (#visit)')}</span>
                  </button>
                </li>
              )}
              {(isOwner || schoolConfig.showTemplateInspector) && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenTemplateConfig}
                    className="hover:text-primary-600 transition-colors text-left"
                  >
                    {t('অন্য স্কুলের জন্য টেমপ্লেট কোড', 'School Template Source')}
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Contact Details Column */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary-700 dark:text-primary-300">
              {t('ক্যাম্পাস যোগাযোগ', 'Campus Contact')}
            </h4>

            <div className="space-y-2.5 text-xs sm:text-sm text-ink-muted">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary-600 shrink-0 mt-1" />
                <span>
                  {schoolSettings.addressLine}, {schoolSettings.area}, {schoolSettings.upazila}, {schoolSettings.district}
                </span>
              </p>

              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-accent shrink-0" />
                <a href={`tel:${schoolSettings.phonePrimary}`} className="hover:text-ink transition-colors font-mono">
                  {schoolSettings.phonePrimary}
                </a>
              </p>

              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary-600 shrink-0" />
                <a href={`mailto:${schoolSettings.email}`} className="hover:text-ink transition-colors">
                  {schoolSettings.email}
                </a>
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={onNavigateApply}
                className="w-full py-2.5 px-4 font-bold text-xs rounded-[var(--radius-btn)] bg-primary-600 hover:bg-primary-700 text-on-primary transition-colors shadow-sm"
              >
                {t('অনলাইন ভর্তি আবেদন ফরম (/apply)', 'Online Admission Form (/apply)')}
              </button>

              {onOpenVisitModal && (
                <button
                  type="button"
                  onClick={onOpenVisitModal}
                  className="w-full py-2.5 px-4 font-bold text-xs rounded-[var(--radius-btn)] bg-surface-card hover:bg-surface border border-line/35 text-ink transition-colors flex items-center justify-center gap-1.5"
                >
                  <CalendarCheck className="w-3.5 h-3.5 text-accent" />
                  <span>{t('ক্যাম্পাস ভিজিট বুক করুন', 'Book a Campus Visit')}</span>
                </button>
              )}

              <div className="pt-1">
                <PWAInstallButton />
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-ink-muted">
          <div className="text-center md:text-left space-y-1">
            <div>
              © {formatNumber(schoolConfig.identity.establishedYear)} - {formatNumber(new Date().getFullYear())} {lang === 'bn' ? schoolSettings.nameBn : schoolSettings.nameEn}। {t('সর্বস্বত্ব সংরক্ষিত।', 'All rights reserved.')}
            </div>
            <div className="text-[11px] text-ink-muted/90 font-medium">
              {lang === 'bn' ? schoolConfig.brand.attributionBn : schoolConfig.brand.attribution}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-semibold text-ink/90 text-center md:text-right">
              {lang === 'bn' ? schoolConfig.brand.footerSignatureBn : schoolConfig.brand.footerSignature}
            </span>

            <button
              type="button"
              onClick={scrollToTop}
              className="p-2 rounded-[var(--radius-btn)] bg-surface-card hover:bg-primary-600 text-ink hover:text-on-primary transition-colors border border-line/35 shrink-0"
              aria-label={t('উপরে যান', 'Scroll to top')}
              title={t('উপরে যান', 'Scroll to top')}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
