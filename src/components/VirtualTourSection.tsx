import React, { useState } from 'react';
import { Play, Video, CalendarCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSchoolData } from '../context/SchoolDataContext';
import { useTheme } from '../context/ThemeContext';
import { schoolConfig } from '../config/schoolConfig';
import { parseVideoEmbedUrl } from '../utils/seo';

interface VirtualTourSectionProps {
  onBookVisit?: () => void;
}

export const VirtualTourSection: React.FC<VirtualTourSectionProps> = ({ onBookVisit }) => {
  const { lang, t } = useLanguage();
  const { schoolSettings } = useSchoolData();
  const { appearance } = useTheme();
  const [playing, setPlaying] = useState(false);

  const rawUrl = (appearance.virtualTourUrl || schoolConfig.media.virtualTourUrl || '').trim();
  const embed = parseVideoEmbedUrl(rawUrl);

  if (!embed) return null;

  const schoolName = lang === 'bn' ? schoolSettings.nameBn : schoolSettings.nameEn;

  return (
    <section
      id="virtual-tour"
      className="py-14 sm:py-20 bg-surface border-b border-line/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wider">
              <Video className="w-4 h-4" />
              <span>{t('ভার্চুয়াল ক্যাম্পাস ট্যুর', 'Virtual Campus Tour')}</span>
            </div>

            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink tracking-tight">
              {schoolConfig.media.virtualTourTitle[lang]}
            </h2>

            <p className="text-sm sm:text-base text-ink-muted leading-[1.7]">
              {schoolConfig.media.virtualTourDescription[lang]}
            </p>

            {onBookVisit && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onBookVisit}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-[var(--radius-btn)] bg-primary-600 hover:bg-primary-700 text-on-primary text-xs sm:text-sm font-bold transition-colors shadow-sm"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>{t('সরাসরি ক্যাম্পাস ভিজিট বুক করুন', 'Book an In-Person Visit')}</span>
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-7">
            <div className="relative aspect-[16/9] w-full rounded-[var(--radius-card)] overflow-hidden border border-line/35 bg-surface-card shadow-lg">
              {playing ? (
                embed.kind === 'video' ? (
                  <video
                    src={embed.src}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <iframe
                    src={`${embed.src}${embed.src.includes('?') ? '&' : '?'}autoplay=1`}
                    title={`${schoolName} Virtual Tour`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )
              ) : (
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  className="relative w-full h-full group text-left block"
                  aria-label={t('ক্যাম্পাস ভিডিও চালু করুন', 'Play campus tour video')}
                >
                  <img
                    src="/images/hero_school_sunrise.webp"
                    alt={`${schoolName} Campus Preview`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-ink/40 flex flex-col items-center justify-center gap-3 p-4">
                    <span className="w-16 h-16 rounded-full bg-primary-600 text-on-primary flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 fill-current ml-0.5" />
                    </span>
                    <span className="px-4 py-1.5 rounded-full bg-surface-card/95 text-ink text-xs font-bold shadow-md">
                      {t('ক্যাম্পাস ভিডিও দেখুন', 'Play Virtual Campus Tour')}
                    </span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
