import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSchoolData } from '../context/SchoolDataContext';
import { MessageSquareQuote, Star, MapPin } from 'lucide-react';

export const ParentTestimonials: React.FC = () => {
  const { lang, t } = useLanguage();
  const { testimonials } = useSchoolData();

  if (testimonials.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 bg-cream-paper border-b border-line/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wider mb-2">
            <MessageSquareQuote className="w-4 h-4" />
            <span>{t('অভিভাবকদের অভিমত', 'Parent Voices')}</span>
          </div>

          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
            {t('সন্তানের হাসিমুখে সন্তুষ্ট পিতামাতার অনুভূতি', 'Heartwarming Testimonials from Parents')}
          </h2>

          <p className="mt-3 text-ink-muted text-sm sm:text-base leading-[1.7]">
            {t(
              'সাধারণ অভিভাবকদের আস্থা ও সন্তানদের ভালোবাসাই আমাদের সবচেয়ে বড় অর্জন।',
              'The genuine trust of families and the smiles of our students are our greatest honor.'
            )}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((test) => {
            const name = lang === 'bn' ? test.parentNameBn : (test.parentNameEn || test.parentNameBn);
            const childGrade = lang === 'bn' ? test.childGradeBn : (test.childGradeEn || test.childGradeBn);
            const location = lang === 'bn' ? test.locationBn : (test.locationEn || test.locationBn);
            const feedback = lang === 'bn' ? test.feedbackBn : (test.feedbackEn || test.feedbackBn);

            return (
              <div
                key={test.id}
                className="bg-surface-card rounded-[var(--radius-card)] p-6 sm:p-7 border border-line/30 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* 5-Star Rating */}
                  <div className="flex items-center gap-1 mb-4 text-primary-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary-400 stroke-none" />
                    ))}
                  </div>

                  {/* Quote Text */}
                  <p className="text-ink-muted text-sm sm:text-base leading-[1.7] italic mb-6">
                    "{feedback}"
                  </p>
                </div>

                {/* Author & Child Info */}
                <div className="pt-4 border-t border-line/20 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-900 flex items-center justify-center font-bold text-sm shrink-0">
                    {name.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-ink text-sm leading-tight truncate">
                      {name}
                    </h4>
                    <p className="text-xs text-primary-700 dark:text-primary-300 font-medium truncate">
                      {childGrade}
                    </p>
                    <p className="text-[11px] text-ink-muted flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span>{location}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
