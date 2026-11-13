import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSchoolData } from '../context/SchoolDataContext';
import { SchoolLevel } from '../config/schoolConfig';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Users,
  ArrowUpRight,
  GraduationCap,
  Award,
  Layers,
  BookOpen
} from 'lucide-react';

interface CurriculumJourneyProps {
  onSelectClassForAdmission: (className: string) => void;
}

export const CurriculumJourney: React.FC<CurriculumJourneyProps> = ({ onSelectClassForAdmission }) => {
  const { lang, t, formatNumber } = useLanguage();
  const { levels, schoolType } = useSchoolData();

  const [selectedClassId, setSelectedClassId] = useState<string>(() => levels[0]?.id || 'play');

  // Sync selectedClassId if levels array changes due to preset switch
  useEffect(() => {
    if (!levels.some((l) => l.id === selectedClassId)) {
      if (levels.length > 0) {
        setSelectedClassId(levels[0].id);
      }
    }
  }, [levels, selectedClassId]);

  const selectedClass: SchoolLevel =
    levels.find((c) => c.id === selectedClassId) || levels[0] || {
      id: 'default',
      name: { bn: 'শ্রেণি', en: 'Class' },
      learn: { bn: [], en: [] },
      teach: { bn: '', en: '' },
    };

  const currentIndex = levels.findIndex((c) => c.id === selectedClassId);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedClassId(levels[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < levels.length - 1) {
      setSelectedClassId(levels[currentIndex + 1].id);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, levels.length]);

  const isHighSchool = schoolType === 'highschool' || schoolType === 'combined';

  return (
    <section
      id="journey"
      className="py-16 sm:py-24 relative overflow-hidden transition-colors duration-300 bg-surface text-ink border-b border-line/20"
    >
      {/* Background Ambience */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold tracking-wider uppercase mb-2 text-primary-700 dark:text-primary-300">
            {isHighSchool ? (
              <>
                <GraduationCap className="w-4 h-4" />
                <span>{t('একাডেমিক রোডম্যাপ: ৬ষ্ঠ থেকে এসএসসি', 'Academic Roadmap: Class 6 to SSC')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{t('আলোর যাত্রা পাঠ্যক্রম', 'Curriculum: Journey of Light')}</span>
              </>
            )}
          </div>

          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
            {isHighSchool ? (
              <span>
                {t('৬ষ্ঠ থেকে ১০ম শ্রেণি: মেধা, বিজ্ঞান ও এসএসসি সাফল্য', 'Class 6 to 10: Academic Excellence & SSC Summit')}
              </span>
            ) : (
              <span>
                {t(
                  `${levels[0]?.name[lang].split(' ')[0] || 'প্লে'} থেকে ${levels[levels.length - 1]?.name[lang].split(' ')[0] || '৫ম'}: জ্ঞানের প্রদীপ প্রজ্জ্বলন`,
                  `${levels[0]?.name[lang].split(' ')[0] || 'Play'} to ${levels[levels.length - 1]?.name[lang].split(' ')[0] || 'Class 5'}: Lighting the Lanterns of Wisdom`
                )}
              </span>
            )}
          </h2>

          <p className="mt-3 text-base sm:text-lg leading-[1.7] text-ink-muted">
            {isHighSchool
              ? t(
                  'মাধ্যমিক স্তরে আধুনিক শ্রেণিকক্ষ, মাল্টিমিডিয়া পাঠদান, অভিজ্ঞ শিক্ষকমণ্ডলী ও মানসম্মত ল্যাব সুবিধার সমন্বয়ে পরিচালিত ধারাবাহিক শিক্ষা পথচলা। প্রতিটি শ্রেণি নির্বাচন করে বিস্তারিত পাঠ্যক্রম ও বিষয়সমূহ জানুন।',
                  'A structured secondary academic pathway from Class 6 up to the SSC Examination summit, offering comprehensive STEM labs, commerce case-studies, humanities seminars, and board exam mastery.'
                )
              : t(
                  'আমাদের স্কুলে প্রতিটি শ্রেণি হলো আলোর এক একটি সোপান। প্রতিটি পদক্ষেপে জ্বলে ওঠে নতুন প্রদীপ—যেখানে শিশু কেবল পড়া মুখস্থ করে না, নিজেকে আবিষ্কার করে।',
                  'Each grade represents a progressive lantern of dawn. Tap on any class stop to discover the age milestones, pedagogical care, and joyful learning experiences.'
                )}
          </p>
        </div>

        {/* Dynamic Road / Steps */}
        <div className="relative mb-12 py-4">
          
          {/* Desktop SVG Guide Line */}
          <div className="hidden md:block relative h-24 w-full max-w-5xl mx-auto">
            <svg viewBox="0 0 1000 100" fill="none" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="journeyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--token-primary-500)" />
                  <stop offset="50%" stopColor="var(--token-accent)" />
                  <stop offset="100%" stopColor="var(--token-success)" />
                </linearGradient>
              </defs>

              <path
                d={
                  isHighSchool
                    ? 'M 40 50 L 960 50'
                    : 'M 60 60 Q 200 15, 340 60 T 620 60 T 940 60'
                }
                stroke="var(--token-line)"
                strokeOpacity="0.35"
                strokeWidth={isHighSchool ? '4' : '6'}
                strokeDasharray={isHighSchool ? '8 6' : undefined}
                strokeLinecap="round"
              />

              <path
                d={
                  isHighSchool
                    ? 'M 40 50 L 960 50'
                    : 'M 60 60 Q 200 15, 340 60 T 620 60 T 940 60'
                }
                stroke="url(#journeyGrad)"
                strokeWidth={isHighSchool ? '3' : '3.5'}
                strokeLinecap="round"
                className="animate-path-flow"
              />
            </svg>
          </div>

          {/* Stepped Stations / Lanterns (Responsive Scroll Bar) */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4 pt-2 no-scrollbar px-2 max-w-6xl mx-auto">
            {levels.map((cls, idx) => {
              const isSelected = cls.id === selectedClassId;
              const isPassed = idx <= currentIndex;

              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => setSelectedClassId(cls.id)}
                  className="flex flex-col items-center group shrink-0 transition-all duration-200 rounded-[var(--radius-btn)] p-1 focus-visible:ring-2 focus-visible:ring-ring"
                  aria-pressed={isSelected}
                  title={`${cls.name[lang]}`}
                >
                  <div className="relative">
                    {/* Glowing Aura */}
                    {isPassed && (
                      <div className="absolute -inset-2 rounded-[var(--radius-card)] blur-md pointer-events-none bg-primary-400/25" />
                    )}

                    {isHighSchool ? (
                      /* Collegiate Milestone Badge Box */
                      <div
                        className={`relative w-14 h-16 sm:w-16 sm:h-20 rounded-[var(--radius-btn)] flex flex-col items-center justify-center transition-all duration-200 border ${
                          isSelected
                            ? 'bg-primary-600 text-on-primary border-primary-700 shadow-lg scale-105 -translate-y-1'
                            : isPassed
                            ? 'bg-primary-100 dark:bg-surface-2 text-primary-800 dark:text-primary-200 border-primary-300 dark:border-line/40 hover:bg-primary-200'
                            : 'bg-surface-card text-ink-muted border-line/35 hover:border-line'
                        }`}
                      >
                        {cls.groups ? (
                          <Layers className="w-5 h-5 mb-1" />
                        ) : idx === levels.length - 1 ? (
                          <Award className="w-5 h-5 mb-1" />
                        ) : (
                          <BookOpen className="w-5 h-5 mb-1" />
                        )}

                        <span className="text-xs font-bold leading-tight">
                          {cls.name[lang].split(' ')[0]}
                        </span>

                        <span className="text-[10px] font-mono mt-0.5 opacity-80">
                          {t(`ধাপ ${formatNumber(idx + 1)}`, `Step ${formatNumber(idx + 1)}`)}
                        </span>
                      </div>
                    ) : (
                      /* Traditional Clay Lantern / প্রদীপ Box */
                      <div
                        className={`relative w-12 h-14 sm:w-14 sm:h-16 rounded-[var(--radius-btn)] flex flex-col items-center justify-center transition-all duration-300 border ${
                          isSelected
                            ? 'bg-primary-600 text-on-primary border-primary-700 shadow-lg scale-110 -translate-y-1'
                            : isPassed
                            ? 'bg-primary-100 dark:bg-surface-2 text-primary-900 dark:text-primary-200 border-primary-300 dark:border-line/40 hover:bg-primary-200 hover:scale-105'
                            : 'bg-surface-card text-ink-muted border-line/30 hover:border-line'
                        }`}
                      >
                        <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor">
                          <path d="M9 3 C9 2, 15 2, 15 3" strokeWidth="1.8" strokeLinecap="round" />
                          <path d="M8 5 L16 5" strokeWidth="2" strokeLinecap="round" />
                          <path
                            d="M6 7 L18 7 L16 18 L8 18 Z"
                            strokeWidth="1.6"
                            strokeLinejoin="round"
                            fill={
                              isPassed
                                ? isSelected
                                  ? 'var(--token-primary-300)'
                                  : 'var(--token-primary-100)'
                                : 'var(--token-surface-2)'
                            }
                          />
                          {isPassed && (
                            <path
                              d="M12 15 C10.5 15, 10.5 11, 12 9 C13.5 11, 13.5 15, 12 15 Z"
                              fill={isSelected ? 'var(--token-danger)' : 'var(--token-primary-600)'}
                              stroke="none"
                            />
                          )}
                          <path d="M7 19 L17 19" strokeWidth="2.2" strokeLinecap="round" />
                        </svg>

                        <span className="text-[10px] font-bold mt-0.5 leading-none tabular-nums">
                          {formatNumber(idx + 1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Class Label Below */}
                  <span
                    className={`mt-2 text-xs font-bold tracking-tight text-center whitespace-nowrap transition-colors ${
                      isSelected
                        ? 'text-primary-700 dark:text-primary-300'
                        : 'text-ink-muted group-hover:text-ink'
                    }`}
                  >
                    {cls.name[lang].split(' ')[0]}
                  </span>

                  {cls.age && (
                    <span className="text-[10px] text-ink-muted font-medium">
                      {cls.age[lang].split(' ')[0]} {t('বছর', 'Yrs')}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Class Curriculum Detail Card */}
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-[var(--radius-card)] p-6 sm:p-8 lg:p-10 shadow-xl transition-all duration-300 bg-surface-card border border-line/30 text-ink">
            {/* Top Color Accent Line */}
            <div
              className="absolute top-0 left-0 right-0 h-2 rounded-t-[var(--radius-card)]"
              style={{
                backgroundColor: selectedClass.colorAccent || 'var(--token-primary-500)',
              }}
            />

            {/* Header info of selected class */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line/25">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold mb-1">
                  <span className="text-primary-700 dark:text-primary-300">
                    {selectedClass.lanternStage ? selectedClass.lanternStage[lang] : selectedClass.name[lang]}
                  </span>
                  {selectedClass.age && (
                    <>
                      <span aria-hidden="true" className="text-ink-muted">·</span>
                      <span className="text-success font-bold">
                        {selectedClass.age[lang]}
                      </span>
                    </>
                  )}
                  {selectedClass.milestoneBadge && (
                    <span className="px-2 py-0.5 rounded-md bg-success-soft text-on-success-soft text-xs font-bold border border-success/30">
                      {selectedClass.milestoneBadge[lang]}
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink">
                  {selectedClass.name[lang]}
                </h3>

                <p className="text-sm sm:text-base mt-1 font-medium text-ink-muted">
                  {selectedClass.description?.[lang] || selectedClass.subtitle?.[lang]}
                </p>

                {/* Display Stream Badges if Class 9/10 */}
                {selectedClass.groups && selectedClass.groups.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-primary-700 dark:text-primary-300 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{t('উপলব্ধ বিভাগসমূহ:', 'Available Streams:')}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-accent-soft border border-accent/30 text-on-accent-soft text-xs font-bold">
                      {t('বিজ্ঞান (Science)', 'Science')}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-success-soft border border-success/30 text-on-success-soft text-xs font-bold">
                      {t('ব্যবসায় শিক্ষা (Commerce)', 'Business Studies')}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-warning-soft border border-warning/30 text-on-warning-soft text-xs font-bold">
                      {t('মানবিক (Humanities)', 'Humanities')}
                    </span>
                  </div>
                )}
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="p-2 rounded-[var(--radius-btn)] border border-line/35 bg-surface-2 text-ink hover:bg-primary-50 disabled:opacity-25 disabled:pointer-events-none transition-colors"
                  aria-label="Previous Class"
                  title="পূর্ববর্তী শ্রেণি"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <span className="text-xs font-bold px-2 tabular-nums text-ink-muted">
                  {formatNumber(currentIndex + 1)} / {formatNumber(levels.length)}
                </span>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentIndex === levels.length - 1}
                  className="p-2 rounded-[var(--radius-btn)] border border-line/35 bg-surface-2 text-ink hover:bg-primary-50 disabled:opacity-25 disabled:pointer-events-none transition-colors"
                  aria-label="Next Class"
                  title="পরবর্তী শ্রেণি"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
              
              {/* Left Column: What They Learn */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 text-ink">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>{t('এই শ্রেণিতে কী কী শেখানো হয়?', 'What Students Learn & Master')}</span>
                </h4>

                <ul className="space-y-3">
                  {selectedClass.learn[lang].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm sm:text-base leading-[1.6] text-ink-muted"
                    >
                      <span className="w-1.5 h-1.5 rounded-full mt-2.5 shrink-0 bg-primary-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Activities if available */}
                {selectedClass.activities && selectedClass.activities[lang]?.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-line/20">
                    <p className="text-xs font-bold uppercase tracking-wider mb-2 text-ink-muted">
                      {t('সহশিক্ষা ও সৃজনশীল কার্যক্রম', 'Extracurricular & Co-curricular')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedClass.activities[lang].map((act, i) => (
                        <span
                          key={i}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-accent-soft text-on-accent-soft border-accent/25"
                        >
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Teaching Methodology & Hours */}
              <div className="rounded-[var(--radius-card)] p-6 border border-line/25 bg-surface-2 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider mb-3 text-ink">
                    {t('শিক্ষাদান পদ্ধতি ও মেন্টরশিপ', 'Teaching Methodology & Pedagogy')}
                  </h4>

                  <p className="text-sm sm:text-base leading-[1.7] text-ink-muted">
                    {selectedClass.teach[lang]}
                  </p>

                  <div className="mt-5 space-y-3 pt-4 border-t border-line/20 text-xs sm:text-sm text-ink-muted">
                    {selectedClass.dailyRoutineSample && (
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 shrink-0 text-primary-600" />
                        <span>
                          <strong className="text-ink">{t('দৈনিক সময়সূচি:', 'Daily Hours:')}</strong>{' '}
                          {selectedClass.dailyRoutineSample[lang]}
                        </span>
                      </div>
                    )}

                    {selectedClass.studentRatio && (
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 shrink-0 text-accent" />
                        <span>
                          <strong className="text-ink">{t('শিক্ষার্থী অনুপাত:', 'Student Ratio:')}</strong>{' '}
                          {selectedClass.studentRatio}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Apply CTA for this class */}
                <div className="mt-6 pt-4 border-t border-line/20">
                  <button
                    type="button"
                    onClick={() => onSelectClassForAdmission(selectedClass.name[lang])}
                    className="w-full py-3 px-4 rounded-[var(--radius-btn)] font-bold text-sm transition-all flex items-center justify-center gap-2 group shadow-md bg-primary-600 hover:bg-primary-700 text-on-primary"
                  >
                    <span>
                      {t(
                        `${selectedClass.name[lang]} শ্রেণিতে ভর্তির আবেদন করুন`,
                        `Apply for ${selectedClass.name[lang]}`
                      )}
                    </span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
