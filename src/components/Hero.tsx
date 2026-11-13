import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSchoolData } from '../context/SchoolDataContext';
import { useTheme } from '../context/ThemeContext';
import { schoolConfig } from '../config/schoolConfig';
import { parseVideoEmbedUrl } from '../utils/seo';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Trees,
  GraduationCap,
  Microscope,
  BookOpen,
  CalendarCheck,
  Play,
  X,
} from 'lucide-react';

interface HeroProps {
  onOpenAdmission: () => void;
  onExploreJourney: () => void;
  onBookVisit?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenAdmission, onExploreJourney, onBookVisit }) => {
  const { lang, t } = useLanguage();
  const { schoolSettings, levels, schoolType } = useSchoolData();
  const { appearance } = useTheme();
  const [videoOpen, setVideoOpen] = useState(false);

  const heroVideoEmbed = parseVideoEmbedUrl(
    (appearance.heroVideoUrl || schoolConfig.media.heroVideoUrl || '').trim()
  );

  const isHighSchool = schoolType === 'highschool' || schoolType === 'combined';
  const variant = appearance.heroVariant;

  const firstClass = levels[0]?.name[lang].split(' ')[0] || (lang === 'bn' ? 'প্লে' : 'Play');
  const lastClass = levels[levels.length - 1]?.name[lang].split(' ')[0] || (lang === 'bn' ? '৫ম' : 'Class 5');

  const kicker = (
    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide text-primary-700 dark:text-primary-300">
      <span className="px-2 py-0.5 rounded-[var(--radius-btn)] bg-surface-2 border border-line/30 text-[11px] font-bold tracking-wider uppercase text-ink">
        {schoolConfig.brand.productName}
      </span>
      <span aria-hidden="true" className="opacity-45">·</span>
      <span>{schoolSettings.area}</span>
      <span aria-hidden="true" className="opacity-45">·</span>
      <span>{schoolSettings.upazila}</span>
      <span aria-hidden="true" className="opacity-45">·</span>
      <span>{schoolSettings.district}</span>
      <span aria-hidden="true" className="opacity-45">·</span>
      <span className="px-2 py-0.5 rounded-full bg-success-soft text-on-success-soft font-bold text-xs">
        {t('ভর্তি চলছে', 'Admissions Open')}
      </span>
    </div>
  );

  const headline = (
    <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.3] text-balance text-ink">
      {lang === 'bn' ? (
        isHighSchool ? (
          <>
            জ্ঞানের আলো ও আধুনিক বিজ্ঞান চর্চায়{' '}
            <span className="text-primary-600 dark:text-primary-400 inline-block">
              ভবিষ্যৎ বিনির্মাণ
            </span>
          </>
        ) : (
          <>
            প্রতিটি শিশুর ভেতরে{' '}
            <span className="text-primary-600 dark:text-primary-400 inline-block">
              একটি আলো আছে
            </span>
          </>
        )
      ) : isHighSchool ? (
        <>
          Empowering Future Leaders through{' '}
          <span className="text-primary-600 dark:text-primary-400 inline-block">
            STEM & Character
          </span>
        </>
      ) : (
        <>
          Inside every child lies an{' '}
          <span className="text-primary-600 dark:text-primary-400 inline-block">
            unawakened light
          </span>
        </>
      )}
    </h1>
  );

  const subheading = (
    <p className="mt-4 text-base sm:text-lg leading-[1.7] text-ink-muted font-normal">
      {lang === 'bn'
        ? isHighSchool
          ? `${schoolSettings.upazila} এ ${firstClass} থেকে ${lastClass} পর্যন্ত সুশৃঙ্খল, বিজ্ঞানভিত্তিক ও পূর্ণাঙ্গ একাডেমিক পাঠশালা। বিষয়ভিত্তিক অভিজ্ঞ শিক্ষক, সুসজ্জিত বিজ্ঞান ল্যাব ও শতভাগ এসএসসি পাসের সাফল্য নিয়ে আমরা শিক্ষার্থীদের প্রস্তুত করি আগামী পৃথিবীর জন্য।`
          : `${schoolSettings.upazila} এ ${firstClass} থেকে ${lastClass} পর্যন্ত ভীতিমুক্ত, আনন্দময় ও নৈতিক শিক্ষার পাঠশালা। বইয়ের ভারে ক্লান্ত না করে, ভালোবাসায় প্রদীপ জ্বালিয়ে আমরা শিশুদের প্রস্তুত করি আগামী পৃথিবীর জন্য।`
        : isHighSchool
        ? `A premier secondary academic institution in ${schoolSettings.upazila}, ${schoolSettings.district} from ${firstClass} to ${lastClass}. Featuring specialized science laboratories, intensive board exam preparation, and dedicated mentor guidance.`
        : `A nurturing sanctuary in ${schoolSettings.upazila}, ${schoolSettings.district} from ${firstClass} to ${lastClass}. Free from fear and heavy rote learning, we kindle curiosity through love, art, and nature.`}
    </p>
  );

  const actionButtons = (centered = false) => (
    <div className={`mt-8 flex flex-wrap items-center gap-3 sm:gap-4 ${centered ? 'justify-center' : ''}`}>
      <button
        type="button"
        onClick={onOpenAdmission}
        className="px-6 py-3.5 text-base font-bold bg-primary-600 hover:bg-primary-700 text-on-primary rounded-[var(--radius-btn)] shadow-md active:scale-98 transition-all duration-200 flex items-center gap-2 group whitespace-nowrap"
      >
        <span>{t('ভর্তি আবেদন করুন', 'Apply for Admission')}</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>

      {onBookVisit && (
        <button
          type="button"
          onClick={onBookVisit}
          className="px-5 py-3.5 text-sm sm:text-base font-semibold rounded-[var(--radius-btn)] border border-line/40 bg-surface-2 hover:bg-surface-card text-ink transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
        >
          <CalendarCheck className="w-4 h-4 text-accent" />
          <span>{t('ক্যাম্পাস ভিজিট বুকিং', 'Book a Visit')}</span>
        </button>
      )}

      <button
        type="button"
        onClick={onExploreJourney}
        className="px-5 py-3.5 text-sm sm:text-base font-semibold rounded-[var(--radius-btn)] border border-line/35 bg-surface hover:bg-surface-2 text-ink transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
      >
        {isHighSchool ? (
          <BookOpen className="w-4 h-4 text-primary-600" />
        ) : (
          <Sparkles className="w-4 h-4 text-primary-600" />
        )}
        <span>
          {isHighSchool
            ? t(`একাডেমিক রোডম্যাপ (${firstClass} - ${lastClass})`, `Roadmap (${firstClass} - ${lastClass})`)
            : t(`আলোর যাত্রা (${firstClass} - ${lastClass})`, `Explore Journey (${firstClass} - ${lastClass})`)}
        </span>
      </button>
    </div>
  );

  const trustHighlights = (
    <div className="mt-8 pt-6 border-t border-line/25 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs sm:text-sm font-medium text-ink-muted">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 shrink-0 text-primary-600" />
        <span>{t('নিরাপদ ও সিসিটিভি ক্যাম্পাস', 'Safe & CCTV Campus')}</span>
      </div>
      <div className="flex items-center gap-2">
        {isHighSchool ? (
          <GraduationCap className="w-4 h-4 text-primary-600 shrink-0" />
        ) : (
          <HeartHandshake className="w-4 h-4 text-primary-600 shrink-0" />
        )}
        <span>{isHighSchool ? t('১০০% এসএসসি পাশের সাফল্য', '100% SSC Success') : t('স্নেহশীল অভিজ্ঞ শিক্ষক', 'Caring Educators')}</span>
      </div>
      <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
        {isHighSchool ? (
          <Microscope className="w-4 h-4 text-accent shrink-0" />
        ) : (
          <Trees className="w-4 h-4 text-success shrink-0" />
        )}
        <span>{isHighSchool ? t('সুসজ্জিত বিজ্ঞান ও আইসিটি ল্যাব', 'Modern Science & ICT Labs') : t('প্রকৃতিঘেরা সবুজ মাঠ', 'Lush Green Playfield')}</span>
      </div>
    </div>
  );

  const heroImageCard = (tall = true) => (
    <div className="relative group">
      <div className="relative rounded-[var(--radius-card)] overflow-hidden border border-line/35 bg-surface-card shadow-xl">
        <img
          src="/images/hero_school_sunrise.webp"
          alt={lang === 'bn' ? schoolSettings.nameBn : schoolSettings.nameEn}
          className={`w-full ${tall ? 'h-80 sm:h-96' : 'h-64 sm:h-80 lg:h-[420px]'} object-cover object-center group-hover:scale-102 transition-transform duration-500`}
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />

        {heroVideoEmbed && (
          <button
            type="button"
            onClick={() => setVideoOpen(true)}
            aria-label={t('ক্যাম্পাস পরিচিতি ভিডিও দেখুন', 'Watch campus introduction video')}
            className="absolute top-3 right-3 px-3.5 py-2 rounded-full bg-surface-card/95 hover:bg-primary-600 text-ink hover:text-on-primary border border-line/35 shadow-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{t('ক্যাম্পাস ভিডিও', 'Watch Video')}</span>
          </button>
        )}

        <div className="relative sm:absolute sm:bottom-3 sm:left-3 sm:right-3 p-4 sm:rounded-[var(--radius-btn)] bg-surface-card/95 backdrop-blur-xs border-t sm:border border-line/30">
          <span className="text-xs font-bold text-primary-700 dark:text-primary-300 tracking-wider uppercase block">
            {t(`${schoolSettings.area} ক্যাম্পাস প্রাঙ্গণ`, `${schoolSettings.area} Campus`)}
          </span>
          <p className="text-ink text-sm sm:text-base font-semibold mt-0.5">
            {lang === 'bn' ? schoolSettings.sloganBn : schoolSettings.sloganEn}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-line/25 bg-surface text-ink transition-colors duration-200">
      {/* Subtle Rising Sun Decorative SVG using CSS Variables */}
      {!isHighSchool && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[360px] pointer-events-none opacity-75 select-none -z-0"
          aria-hidden="true"
        >
          <svg viewBox="0 0 600 300" className="w-full h-full">
            <defs>
              <radialGradient id="sunGradient" cx="50%" cy="100%" r="90%">
                <stop offset="0%" stopColor="var(--token-primary-400)" stopOpacity="0.28" />
                <stop offset="45%" stopColor="var(--token-primary-300)" stopOpacity="0.14" />
                <stop offset="85%" stopColor="var(--token-surface)" stopOpacity="0" />
              </radialGradient>
            </defs>
            <path d="M 0 300 A 300 300 0 0 1 600 300 Z" fill="url(#sunGradient)" />
            <g stroke="var(--token-primary-400)" strokeWidth="1.75" strokeDasharray="6 4" opacity="0.35">
              <line x1="300" y1="290" x2="120" y2="70" />
              <line x1="300" y1="290" x2="200" y2="40" />
              <line x1="300" y1="290" x2="300" y2="25" />
              <line x1="300" y1="290" x2="400" y2="40" />
              <line x1="300" y1="290" x2="480" y2="70" />
              <line x1="300" y1="290" x2="550" y2="130" />
              <line x1="300" y1="290" x2="50" y2="130" />
            </g>
            <circle cx="300" cy="300" r="105" fill="var(--token-primary-200)" opacity="0.3" />
            <circle cx="300" cy="300" r="72" fill="var(--token-primary-300)" opacity="0.35" />
          </svg>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {variant === 'editorial' && (
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="flex justify-center">{kicker}</div>
            {headline}
            <div className="max-w-2xl mx-auto">{subheading}</div>
            {actionButtons(true)}
            <div className="max-w-3xl mx-auto">{trustHighlights}</div>
            <div className="pt-4">{heroImageCard(false)}</div>
          </div>
        )}

        {variant === 'collegiate' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            <div className="lg:col-span-7 bg-surface-card border border-line/35 rounded-[var(--radius-card)] p-6 sm:p-8 lg:p-10 shadow-sm flex flex-col justify-between">
              <div>
                <div className="mb-3">{kicker}</div>
                {headline}
                {subheading}
              </div>
              <div>
                {actionButtons(false)}
                {trustHighlights}
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between gap-4">
              {heroImageCard(true)}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-[var(--radius-btn)] bg-surface-2 border border-line/30">
                  <span className="text-[11px] font-bold text-ink-muted uppercase block">
                    {t('প্রতিষ্ঠিত', 'Established')}
                  </span>
                  <strong className="font-heading text-lg font-extrabold text-ink">
                    {schoolSettings.eiin ? `EIIN ${schoolSettings.eiin}` : schoolSettings.schoolCode || firstClass}
                  </strong>
                </div>
                <div className="p-4 rounded-[var(--radius-btn)] bg-accent-soft text-on-accent-soft border border-line/25">
                  <span className="text-[11px] font-bold uppercase block opacity-85">
                    {t('শ্রেণি পরিসর', 'Grade Span')}
                  </span>
                  <strong className="font-heading text-lg font-extrabold">
                    {firstClass} — {lastClass}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {variant === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="mb-3">{kicker}</div>
              {headline}
              <div className="max-w-2xl">{subheading}</div>
              {actionButtons(false)}
              {trustHighlights}
            </div>

            <div className="lg:col-span-5">{heroImageCard(true)}</div>
          </div>
        )}
      </div>

      {/* Optional Hero Video Modal */}
      {videoOpen && heroVideoEmbed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label={schoolConfig.media.heroVideoTitle[lang]}
        >
          <div className="bg-surface-card rounded-[var(--radius-card)] max-w-3xl w-full overflow-hidden border border-line/35 shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-line/25">
              <h3 className="font-heading font-bold text-sm sm:text-base text-ink">
                {schoolConfig.media.heroVideoTitle[lang]}
              </h3>
              <button
                type="button"
                onClick={() => setVideoOpen(false)}
                aria-label={t('ভিডিও বন্ধ করুন', 'Close video')}
                className="p-1.5 rounded-full bg-surface-2 hover:bg-primary-50 text-ink-muted hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-[16/9] w-full bg-surface-2">
              {heroVideoEmbed.kind === 'video' ? (
                <video
                  src={heroVideoEmbed.src}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <iframe
                  src={`${heroVideoEmbed.src}${heroVideoEmbed.src.includes('?') ? '&' : '?'}autoplay=1`}
                  title={schoolConfig.media.heroVideoTitle[lang]}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
