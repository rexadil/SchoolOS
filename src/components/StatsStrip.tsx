import React from 'react';
import { Users, GraduationCap, Calendar, Award } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSchoolData } from '../context/SchoolDataContext';
import { schoolConfig } from '../config/schoolConfig';

export const StatsStrip: React.FC = () => {
  const { t, formatNumber } = useLanguage();
  const { schoolSettings, staffList } = useSchoolData();

  const establishedYear = schoolConfig.identity.establishedYear || 2016;
  const dynamicYears = Math.max(1, new Date().getFullYear() - establishedYear);

  const studentsCount = schoolSettings.stats?.studentsCount ?? schoolConfig.stats.studentsCount;
  const teachersCount = Math.max(
    schoolSettings.stats?.teachersCount ?? schoolConfig.stats.teachersCount,
    staffList.length
  );
  const yearsCount = schoolSettings.stats?.yearsCount ?? dynamicYears;
  const successRate = schoolSettings.stats?.successRate ?? schoolConfig.stats.successRate;

  const items = [
    {
      icon: <Users className="w-5 h-5 text-primary-600" />,
      value: `${formatNumber(studentsCount)}+`,
      label: t('বর্তমান শিক্ষার্থী', 'Active Students'),
    },
    {
      icon: <GraduationCap className="w-5 h-5 text-accent" />,
      value: `${formatNumber(teachersCount)}+`,
      label: t('অভিজ্ঞ শিক্ষকমণ্ডলী', 'Dedicated Educators'),
    },
    {
      icon: <Calendar className="w-5 h-5 text-warning" />,
      value: `${formatNumber(yearsCount)}+ ${t('বছর', 'Yrs')}`,
      label: t(`প্রতিষ্ঠিত (${formatNumber(establishedYear)})`, `Serving Since ${establishedYear}`),
    },
    {
      icon: <Award className="w-5 h-5 text-success" />,
      value: successRate,
      label: t('পাশের ও সন্তুষ্টির হার', 'Success & Parent Trust'),
    },
  ];

  return (
    <section
      aria-label={t('বিদ্যালয়ের পরিসংখ্যান', 'Institutional Milestones')}
      className="py-8 sm:py-10 bg-surface-2 border-b border-line/25"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="bg-surface-card rounded-[var(--radius-card)] px-4 py-4 sm:px-5 sm:py-5 border border-line/30 shadow-xs flex items-center gap-3.5"
            >
              <div className="w-11 h-11 rounded-[var(--radius-btn)] bg-surface-2 border border-line/25 flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div className="min-w-0">
                <div className="font-heading font-extrabold text-xl sm:text-2xl text-ink tabular-nums leading-tight">
                  {item.value}
                </div>
                <div className="text-[11px] sm:text-xs font-semibold text-ink-muted truncate mt-0.5">
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
