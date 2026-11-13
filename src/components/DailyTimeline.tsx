import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSchoolData } from '../context/SchoolDataContext';
import { schoolConfig, campusWhyUsStats } from '../config/schoolConfig';
import {
  Sun,
  BookOpen,
  Apple,
  Sparkles,
  Palette,
  Smile,
  Clock,
  Award,
  GraduationCap,
  Microscope,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Sun: <Sun className="w-5 h-5 text-primary-600" />,
  BookOpen: <BookOpen className="w-5 h-5 text-accent" />,
  Apple: <Apple className="w-5 h-5 text-success" />,
  Sparkles: <Sparkles className="w-5 h-5 text-warning" />,
  Palette: <Palette className="w-5 h-5 text-danger" />,
  Smile: <Smile className="w-5 h-5 text-primary-700 dark:text-primary-300" />,
};

const statsIconMap: Record<string, React.ReactNode> = {
  Award: <Award className="w-7 h-7 text-warning" />,
  GraduationCap: <GraduationCap className="w-7 h-7 text-success" />,
  Microscope: <Microscope className="w-7 h-7 text-accent" />,
  ShieldCheck: <ShieldCheck className="w-7 h-7 text-primary-600" />,
};

export const DailyTimeline: React.FC = () => {
  const { lang, t, formatNumber } = useLanguage();
  const { schoolType, schoolSettings } = useSchoolData();

  const isHighSchool = schoolType === 'highschool' || schoolType === 'combined';

  if (isHighSchool) {
    // "Why Us" Institutional Stats Section for High School / Combined
    return (
      <section id="why-us" className="py-16 sm:py-24 bg-surface-2 text-ink border-b border-line/20 relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-on-success-soft uppercase tracking-widest mb-2 px-3 py-1 rounded-full bg-success-soft border border-success/30">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('কেন আমাদের স্কুল নির্বাচন করবেন?', 'Why Choose Our Institution')}</span>
            </div>

            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
              {t('গুণগত শিক্ষা, বিজ্ঞানাগার ও ধারাবাহিক সাফল্য', 'Quality Pedagogy, STEM Labs & Consistent SSC Glory')}
            </h2>

            <p className="mt-3 text-ink-muted text-sm sm:text-base leading-[1.7]">
              {t(
                `${schoolSettings.district} জেলার ${schoolSettings.upazila} এ মাধ্যমিক পর্যায়ের শিক্ষার্থীদের জন্য আধুনিক মাল্টিমিডিয়া ক্লাসরুম, সুসজ্জিত ব্যবহারিক ল্যাব এবং নিবেদিতপ্রাণ শিক্ষকদের সার্বক্ষণিক তত্ত্বাবধান।`,
                'Empowering high school scholars with modern audio-visual learning, distinct science laboratories, rigorous mock tests, and comprehensive character building.'
              )}
            </p>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {campusWhyUsStats.map((stat, idx) => (
              <div
                key={idx}
                className="relative bg-surface-card rounded-[var(--radius-card)] p-6 border border-line/30 shadow-md hover:border-primary-500/60 transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-[var(--radius-btn)] bg-surface-2 border border-line/25 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                    {statsIconMap[stat.icon] || <Award className="w-7 h-7 text-primary-600" />}
                  </div>

                  <div className="font-heading font-black text-3xl sm:text-4xl text-ink tracking-tight tabular-nums mb-1">
                    {lang === 'bn' ? stat.value : stat.valueEn}
                  </div>

                  <h3 className="font-heading font-bold text-lg text-primary-700 dark:text-primary-300 mb-2">
                    {stat.title[lang]}
                  </h3>

                  <p className="text-xs sm:text-sm text-ink-muted leading-[1.6]">
                    {stat.subtitle[lang]}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-line/20 flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  <span>{t('মানসম্মত পাঠ্যক্রম নিশ্চিত', 'Verified Benchmark')}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Institutional Highlights Banner */}
          <div className="mt-12 bg-surface-card border border-line/30 rounded-[var(--radius-card)] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="font-heading font-bold text-lg sm:text-xl text-ink">
                {t('বিজ্ঞান, ব্যবসায় শিক্ষা ও মানবিক শাখার পৃথক ব্যবহারিক ক্লাস', 'Dedicated Science, Commerce & Humanities Facilities')}
              </h4>
              <p className="text-xs sm:text-sm text-ink-muted">
                {t(
                  'প্রতিটি শিক্ষার্থীর জন্য পৃথক গাইড টিচার এবং সাপ্তাহিক মডেল টেস্ট মূল্যায়ন।',
                  'Dedicated faculty advisors for each student cohort along with weekly performance audits.'
                )}
              </p>
            </div>

            <a
              href="#apply"
              className="px-6 py-3 rounded-[var(--radius-btn)] bg-primary-600 hover:bg-primary-700 text-on-primary font-bold text-xs sm:text-sm transition-colors whitespace-nowrap shadow-md"
            >
              {t('ভর্তি তথ্যাবলি দেখুন', 'View Admission Requirements')}
            </a>
          </div>

        </div>
      </section>
    );
  }

  // Daily School Routine Timeline for Kindergarten / Primary
  return (
    <section id="daily-life" className="py-16 sm:py-24 bg-cream-paper border-b border-line/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wider mb-2">
            <Clock className="w-4 h-4" />
            <span>{t('আনন্দময় রুটিন', 'Joyful Routine')}</span>
          </div>

          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
            {t('আমাদের একটি দিন: সকাল থেকে ছুটি', 'A Day at School: From Dawn to Farewell')}
          </h2>

          <p className="mt-3 text-ink-muted text-sm sm:text-base leading-[1.7]">
            {t(
              'বইয়ের পড়া মুখস্থ করার যান্ত্রিক চাপ নয়; সকালের রোদে সমাবেশ থেকে শুরু করে দুপুরের হাসিমুখে বিদায় পর্যন্ত প্রতিটি মুহূর্ত আনন্দ ও কৌতূহলে ভরা।',
              'Not a rigid chore of heavy books, but an intentional rhythm of joy, wholesome food, curiosity, and outdoor play from morning till afternoon.'
            )}
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical connecting line for desktop */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-0.5 bg-line/35" />

          <div className="space-y-8 sm:space-y-10">
            {schoolConfig.dailyTimeline.map((item, idx) => {
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={idx}
                  className={`relative flex flex-col md:flex-row items-center gap-6 ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Timeline Content Card */}
                  <div className="w-full md:w-1/2">
                    <div className="bg-surface-card rounded-[var(--radius-card)] p-6 border border-line/30 shadow-xs hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold px-2.5 py-1 bg-primary-100 text-primary-900 rounded-lg tabular-nums">
                          {item.time[lang]}
                        </span>
                        <span className="text-xs font-bold text-ink-muted tabular-nums">
                          {t(`ধাপ ${formatNumber(idx + 1)}`, `Step ${formatNumber(idx + 1)}`)}
                        </span>
                      </div>

                      <h3 className="font-heading font-bold text-lg sm:text-xl text-ink mb-2">
                        {item.title[lang]}
                      </h3>

                      <p className="text-sm text-ink-muted leading-[1.7]">
                        {item.description[lang]}
                      </p>
                    </div>
                  </div>

                  {/* Central Node Circle */}
                  <div className="relative z-10 w-12 h-12 rounded-[var(--radius-btn)] bg-surface-2 border-2 border-primary-500 flex items-center justify-center shadow-xs shrink-0">
                    {iconMap[item.icon] || <Sparkles className="w-5 h-5 text-primary-600" />}
                  </div>

                  <div className="hidden md:block w-1/2" />
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
