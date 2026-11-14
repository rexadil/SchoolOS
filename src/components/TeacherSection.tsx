import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { schoolConfig } from '../config/schoolConfig';
import { useSchoolData } from '../context/SchoolDataContext';
import { GraduationCap, Quote, Heart, Sparkles } from 'lucide-react';

export const TeacherSection: React.FC = () => {
  const { lang, t } = useLanguage();
  const { staffList, schoolSettings } = useSchoolData();

  // Semantic avatar badge styles
  const avatarClasses = [
    'bg-primary-600 text-on-primary',
    'bg-accent text-on-accent',
    'bg-success text-on-success',
    'bg-warning text-on-warning',
  ];

  return (
    <section id="teachers" className="py-16 sm:py-24 bg-surface border-b border-line/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wider mb-2">
            <GraduationCap className="w-4 h-4" />
            <span>{t('নিবেদিত শিক্ষকমণ্ডলী', 'Our Dedicated Faculty')}</span>
          </div>

          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
            {t('স্নেহ ও প্রজ্ঞায় আলোকিত শিক্ষক সমাজ', 'Educators Who Nurture with Love & Wisdom')}
          </h2>

          <p className="mt-3 text-ink-muted text-sm sm:text-base leading-[1.7]">
            {t(
              'আমাদের শিক্ষকরা ক্লাসে শুধু পাঠদান করেন না; প্রতিটি শিশুর সুখ-দুঃখ বুঝে তাদের নিজস্ব গতিতে মেধা বিকাশে পরম বন্ধুর মতো পাশে থাকেন।',
              'Our educators are gentle mentors who celebrate each child’s unique pace of growth with patience, psychology, and personal care.'
            )}
          </p>
        </div>

        {/* Headmistress Editorial Message Banner */}
        <div className="mb-16 bg-surface-2 rounded-[var(--radius-card)] p-6 sm:p-10 border border-line/30 shadow-sm relative overflow-hidden">
          <div className="absolute top-4 right-6 text-primary-500/15 pointer-events-none">
            <Quote className="w-24 h-24" />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8">
              {(() => {
                const pTitle =
                  (lang === 'bn' ? schoolSettings.principalTitleBn : schoolSettings.principalTitleEn)?.trim() ||
                  schoolConfig.principalMessage.title[lang];
                const pMessage =
                  (lang === 'bn' ? schoolSettings.principalMessageBn : schoolSettings.principalMessageEn)?.trim() ||
                  schoolConfig.principalMessage.message[lang];
                const pName =
                  (lang === 'bn' ? schoolSettings.principalNameBn : schoolSettings.principalNameEn)?.trim() ||
                  schoolConfig.principalMessage.author[lang];
                const sName = lang === 'bn' ? schoolSettings.nameBn : schoolSettings.nameEn;

                return (
                  <>
                    <div className="flex items-center gap-2 text-xs font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wider mb-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{pTitle}</span>
                    </div>

                    <blockquote className="font-heading text-ink text-base sm:text-lg italic leading-[1.8]">
                      "{pMessage}"
                    </blockquote>

                    <div className="mt-6 pt-4 border-t border-line/25 flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-primary-600 text-on-primary flex items-center justify-center font-bold text-base shadow-xs">
                        {pName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-ink text-sm sm:text-base">
                          {pName}
                        </h4>
                        <p className="text-xs text-ink-muted">
                          {t(`অধ্যক্ষ / প্রধান শিক্ষক, ${sName}`, `Principal / Head Teacher, ${sName}`)}
                        </p>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Quick highlight box */}
            <div className="lg:col-span-4 bg-surface-card rounded-[var(--radius-card)] p-5 border border-line/30 shadow-xs">
              <h5 className="font-bold text-xs uppercase tracking-wider text-primary-700 dark:text-primary-300 mb-3 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-danger" />
                <span>{t('আমাদের শিক্ষক দর্শন', 'Our Pedagogy Creed')}</span>
              </h5>
              <ul className="space-y-2 text-xs sm:text-sm text-ink-muted leading-normal">
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 font-bold">✓</span>
                  <span>{t('ভয়হীন ও মারধরমুক্ত সম্পূর্ণ আনন্দময় শ্রেণিকক্ষ', 'Zero physical or psychological reprimand')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 font-bold">✓</span>
                  <span>{t('প্রত্যেক শিশুর মানসিক সামর্থ্য অনুযায়ী যত্ন', 'Differentiated learning based on child readiness')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 font-bold">✓</span>
                  <span>{t('প্রতিমাসে নিয়মিত অভিভাবক-শিক্ষক মতবিনিময় সভা', 'Monthly Parent-Teacher progress discussions')}</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Teachers Cards Grid */}
        {staffList.length === 0 ? (
          <div className="p-10 rounded-[var(--radius-card)] bg-surface-card border border-line/30 text-center space-y-2.5 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-[var(--radius-btn)] bg-surface-2 border border-line/25 flex items-center justify-center mx-auto text-primary-600">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-base text-ink">
              {t('শিক্ষকমণ্ডলীর তথ্য হালনাগাদ হচ্ছে', 'Faculty Profiles Coming Soon')}
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-[1.7]">
              {t(
                'অ্যাডমিন প্যানেল থেকে শিক্ষকদের নাম, পদবি ও ছবি যুক্ত করলে এখানে তা স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।',
                'Faculty profiles, qualifications, and photos will appear here once published from the school admin panel.'
              )}
            </p>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {staffList.map((teacher, idx) => {
            const avatarClass = avatarClasses[idx % avatarClasses.length];
            const displayName = lang === 'bn' ? teacher.nameBn : (teacher.nameEn || teacher.nameBn);
            const displayRole = lang === 'bn' ? teacher.roleBn : (teacher.roleEn || teacher.roleBn);

            return (
              <div
                key={teacher.id || idx}
                className="bg-surface-card rounded-[var(--radius-card)] p-6 border border-line/30 shadow-xs hover:shadow-md hover:border-primary-400 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Visual Avatar Monogram or Photo */}
                  <div className="flex items-center gap-3 mb-4">
                    {teacher.photoUrl ? (
                      <img
                        src={teacher.photoUrl}
                        alt={displayName}
                        width={56}
                        height={56}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="w-14 h-14 rounded-[var(--radius-btn)] object-cover shadow-xs border border-line/30"
                      />
                    ) : (
                      <div
                        className={`w-14 h-14 rounded-[var(--radius-btn)] ${avatarClass} flex items-center justify-center font-heading font-extrabold text-xl shadow-xs`}
                      >
                        {displayName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-heading font-bold text-base text-ink leading-tight">
                        {displayName}
                      </h3>
                      <p className="text-xs text-primary-700 dark:text-primary-300 font-medium mt-0.5">
                        {displayRole}
                      </p>
                    </div>
                  </div>

                  {/* Qualification */}
                  {teacher.qualification && (
                    <div className="py-2.5 border-y border-line/20 text-xs text-ink-muted">
                      <p className="flex items-center gap-1.5 font-medium">
                        <GraduationCap className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                        <span>{teacher.qualification}</span>
                      </p>
                    </div>
                  )}

                  {/* Personal Quote / Bio */}
                  {teacher.bio && (
                    <p className="mt-3 text-xs sm:text-sm text-ink-muted italic leading-[1.6]">
                      "{teacher.bio}"
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-line/20 flex items-center justify-between text-[11px] text-ink-muted">
                  <span>{schoolSettings.nameBn}</span>
                  <span className="text-success font-semibold">{t('নিবেদিত শিক্ষক', 'Faculty')}</span>
                </div>
              </div>
            );
          })}
        </div>
        )}

      </div>
    </section>
  );
};
