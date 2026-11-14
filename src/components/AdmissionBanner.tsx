import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSchoolData } from '../context/SchoolDataContext';
import { schoolConfig } from '../config/schoolConfig';
import { getAdmissionClosedInfo, parseBangladeshDeadlineMs } from '../utils/admissionStatus';
import { Sparkles, Calendar, FileText, ArrowRight, BellRing, Lock, Search, CalendarCheck } from 'lucide-react';

interface AdmissionBannerProps {
  onOpenAdmission: () => void;
  onNavigateStatus?: () => void;
  onBookVisit?: () => void;
}

export const AdmissionBanner: React.FC<AdmissionBannerProps> = ({
  onOpenAdmission,
  onNavigateStatus,
  onBookVisit,
}) => {
  const { lang, t, formatNumber } = useLanguage();
  const { admissionNotice, levels } = useSchoolData();

  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const closedInfo = getAdmissionClosedInfo(admissionNotice, nowMs);

  const effectiveEndDate =
    admissionNotice?.endDate?.trim() ||
    (!admissionNotice ? schoolConfig.admission.deadlineDate : undefined);
  const targetMs = parseBangladeshDeadlineMs(effectiveEndDate);

  const computeTimeLeft = (ms: number | null, currentMs: number) => {
    if (ms === null) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    const difference = ms - currentMs;
    if (difference <= 0 || Number.isNaN(difference)) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
    };
  };

  useEffect(() => {
    if (closedInfo.closed || targetMs === null) return;
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [closedInfo.closed, targetMs]);

  const timeLeft = computeTimeLeft(targetMs, nowMs);
  const displayDeadline = lang === 'bn' ? closedInfo.formattedEndDateBn : closedInfo.formattedEndDateEn;

  if (closedInfo.closed) {
    return (
      <section className="bg-surface-2 text-ink border-y border-line/25 py-10 sm:py-12 relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-surface-card border border-line/30 rounded-[var(--radius-card)] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-md">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-danger-soft border border-danger/30 rounded-[var(--radius-btn)] text-xs font-bold text-on-danger-soft uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5 text-on-danger-soft" />
                <span>{t('আবেদন বন্ধ', 'Admission Closed')}</span>
              </div>

              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink tracking-tight">
                {t('অনলাইন ভর্তি আবেদন বর্তমানে বন্ধ রয়েছে', 'Online Admission Applications Are Closed')}
              </h2>

              <p className="text-ink-muted text-sm sm:text-base leading-[1.7]">
                {closedInfo.reason === 'deadline'
                  ? t(
                      `ভর্তি আবেদনের নির্ধারিত শেষ সময়সীমা${displayDeadline ? ` (${displayDeadline})` : ''} অতিক্রান্ত হয়েছে। পূর্বে জমা দেওয়া আবেদনের অবস্থা জানতে স্ট্যাটাস পেজে যান।`,
                      `The admission deadline${displayDeadline ? ` (${displayDeadline})` : ''} has passed. Already applied? Track your application status anytime.`
                    )
                  : t(
                      `বিদ্যালয় কর্তৃপক্ষ কর্তৃক এই মুহূর্তে নতুন ভর্তি আবেদন গ্রহণ বন্ধ রাখা হয়েছে${displayDeadline ? ` (শেষ তারিখ: ${displayDeadline})` : ''}।`,
                      `Admissions are currently closed by school administration${displayDeadline ? ` (End Date: ${displayDeadline})` : ''}.`
                    )}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 shrink-0 w-full lg:w-auto">
              {onBookVisit && (
                <button
                  type="button"
                  onClick={onBookVisit}
                  className="w-full sm:w-auto min-h-[48px] px-5 py-3 rounded-[var(--radius-btn)] bg-surface-2 hover:bg-surface border border-line/35 text-ink font-bold text-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <CalendarCheck className="w-4 h-4 text-accent" />
                  <span>{t('ক্যাম্পাস ভিজিট বুকিং', 'Book Campus Visit')}</span>
                </button>
              )}
              {onNavigateStatus && (
                <button
                  type="button"
                  onClick={onNavigateStatus}
                  className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-[var(--radius-btn)] bg-primary-600 hover:bg-primary-700 text-on-primary font-extrabold text-sm transition-colors flex items-center justify-center gap-2 shadow-md whitespace-nowrap"
                >
                  <Search className="w-4 h-4" />
                  <span>{t('আবেদনের অবস্থা দেখুন', 'Check Application Status')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-primary-700 text-on-primary py-12 sm:py-16 relative overflow-hidden">
      {/* Decorative subtle aura using semantic tokens */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Admission Announcement & Urgency */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-on-primary/15 border border-on-primary/30 rounded-full text-xs font-bold text-on-primary uppercase tracking-wider mb-4">
              <BellRing className="w-3.5 h-3.5 text-on-primary" />
              <span>{schoolConfig.admission.academicYear[lang]} {t('ভর্তি বিজ্ঞপ্তি', 'Admission Notice')}</span>
            </div>

            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-on-primary tracking-tight leading-snug">
              {t(
                'নতুন শিক্ষাবর্ষে আপনার সোনামণিকে ভর্তি করাতে আবেদন করুন',
                'Enroll Your Child for the Upcoming Academic Year'
              )}
            </h2>

            <p className="mt-3 text-on-primary/90 text-sm sm:text-base leading-[1.7] max-w-xl">
              {t(
                `${levels.map(l => l.name.bn.split(' ')[0]).slice(0, 4).join(', ')} ও অন্যান্য শ্রেণিতে সীমিত সংখ্যক আসনে মেধা ও বয়স অনুপাতে ভর্তি নেওয়া হচ্ছে। অনলাইনে প্রাথমিক আবেদন ফরম পূরণ করে স্কুল কার্যালয়ে জমা দিন।`,
                `Admissions are open for ${levels.map(l => l.name.en.split(' ')[0]).slice(0, 4).join(', ')} and subsequent classes with limited seats. Fill out the quick online form and visit our campus.`
              )}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-on-primary/90 font-medium">
              {displayDeadline && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-on-primary shrink-0" />
                  <span>{t(`আবেদনের শেষ তারিখ: ${displayDeadline}`, `Deadline: ${displayDeadline}`)}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-on-primary shrink-0" />
                <span>{t('এককালীন ভর্তি ফি: সাশ্রয়ী ও সুষম', 'Affordable & Transparent Tuition')}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Countdown Box & Direct CTA Button */}
          <div className="lg:col-span-5 bg-surface-card text-ink rounded-[var(--radius-card)] p-6 sm:p-8 border border-line/30 shadow-2xl flex flex-col items-center text-center">
            
            <p className="text-xs font-bold uppercase tracking-widest text-primary-700 dark:text-primary-300 mb-4">
              {t('ভর্তি শেষ হওয়ার সময় বাকি', 'Admission Closes In')}
            </p>

            {/* Countdown Flip Units */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full mb-5">
              <div className="bg-surface-2 rounded-[var(--radius-btn)] p-2.5 sm:p-3 border border-line/25">
                <span className="block text-xl sm:text-3xl font-extrabold text-primary-700 dark:text-primary-300 tabular-nums">
                  {formatNumber(timeLeft.days)}
                </span>
                <span className="text-[10px] sm:text-xs text-ink-muted uppercase tracking-wide font-semibold">
                  {t('দিন', 'Days')}
                </span>
              </div>

              <div className="bg-surface-2 rounded-[var(--radius-btn)] p-2.5 sm:p-3 border border-line/25">
                <span className="block text-xl sm:text-3xl font-extrabold text-primary-700 dark:text-primary-300 tabular-nums">
                  {formatNumber(timeLeft.hours)}
                </span>
                <span className="text-[10px] sm:text-xs text-ink-muted uppercase tracking-wide font-semibold">
                  {t('ঘণ্টা', 'Hours')}
                </span>
              </div>

              <div className="bg-surface-2 rounded-[var(--radius-btn)] p-2.5 sm:p-3 border border-line/25">
                <span className="block text-xl sm:text-3xl font-extrabold text-primary-700 dark:text-primary-300 tabular-nums">
                  {formatNumber(timeLeft.minutes)}
                </span>
                <span className="text-[10px] sm:text-xs text-ink-muted uppercase tracking-wide font-semibold">
                  {t('মিনিট', 'Mins')}
                </span>
              </div>

              <div className="bg-surface-2 rounded-[var(--radius-btn)] p-2.5 sm:p-3 border border-line/25">
                <span className="block text-xl sm:text-3xl font-extrabold text-primary-700 dark:text-primary-300 tabular-nums">
                  {formatNumber(timeLeft.seconds)}
                </span>
                <span className="text-[10px] sm:text-xs text-ink-muted uppercase tracking-wide font-semibold">
                  {t('সেকেন্ড', 'Secs')}
                </span>
              </div>
            </div>

            {/* Seats Remaining Indicator */}
            <div className="w-full bg-warning-soft rounded-[var(--radius-btn)] py-2 px-3 mb-5 border border-warning/30 text-xs font-bold text-on-warning-soft">
              {t(`মোট অবশিষ্ট আসন: মাত্র ${formatNumber(schoolConfig.admission.availableSeats)} টি`, `Only ${formatNumber(schoolConfig.admission.availableSeats)} seats left`)}
            </div>

            {/* Big Action Button */}
            <button
              type="button"
              onClick={onOpenAdmission}
              className="w-full min-h-[48px] py-3.5 px-6 rounded-[var(--radius-btn)] bg-primary-600 hover:bg-primary-700 active:scale-98 text-on-primary font-extrabold text-base transition-all duration-150 flex items-center justify-center gap-2 group shadow-lg"
            >
              <Sparkles className="w-5 h-5 shrink-0" />
              <span>{t('অনলাইন ভর্তি আবেদন করুন', 'Apply for Admission Online')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            {onBookVisit && (
              <button
                type="button"
                onClick={onBookVisit}
                className="w-full min-h-[44px] mt-2.5 py-2.5 px-4 rounded-[var(--radius-btn)] bg-surface-2 hover:bg-surface border border-line/35 text-ink font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
              >
                <CalendarCheck className="w-4 h-4 text-accent shrink-0" />
                <span>{t('সরাসরি ক্যাম্পাস ভিজিট বুক করুন', 'Book a Campus Visit First')}</span>
              </button>
            )}

            <span className="text-[11px] text-ink-muted mt-3">
              {t('ফরম পূরণ করতে মাত্র ২ মিনিট সময় লাগবে', 'Takes only 2 minutes to submit')}
            </span>

          </div>

        </div>
      </div>
    </section>
  );
};
