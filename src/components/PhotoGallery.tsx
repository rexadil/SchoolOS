import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSchoolData } from '../context/SchoolDataContext';
import { Camera, Maximize2, X, ChevronRight } from 'lucide-react';

export const PhotoGallery: React.FC = () => {
  const { lang, t } = useLanguage();
  const { galleryPhotos } = useSchoolData();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeImageIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveImageIndex(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeImageIndex]);

  const categoryLabels: Record<string, { bn: string; en: string }> = {
    building: { bn: 'ক্যাম্পাস ও ভবন', en: 'Campus' },
    classes: { bn: 'শ্রেণিকক্ষ', en: 'Classroom' },
    events: { bn: 'খেলাধুলা ও উৎসব', en: 'Sports & Events' },
    nature: { bn: 'বাগান ও প্রকৃতি', en: 'Eco & Nature' },
  };

  const filteredItems = selectedCategory === 'all'
    ? galleryPhotos
    : galleryPhotos.filter((item) => item.category === selectedCategory);

  return (
    <section id="gallery" className="py-16 sm:py-24 bg-surface border-b border-line/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wider mb-2">
              <Camera className="w-4 h-4" />
              <span>{t('ছবি ও স্মৃতিকথা', 'Photo Gallery')}</span>
            </div>

            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
              {t('ক্যাম্পাস ও প্রাণবন্ত কর্মকাণ্ডের খণ্ডচিত্র', 'Glimpses of School Life & Joyful Moments')}
            </h2>

            <p className="mt-2 text-ink-muted text-sm sm:text-base leading-[1.7] max-w-xl">
              {t(
                'শ্রেণিকক্ষের নিবিড় শিক্ষা থেকে খেলার মাঠের মুক্ত দৌড় এবং সবুজ বাগানে শিশুদের মাটির স্পর্শ।',
                'From active classroom discovery to running on the green field and nurturing saplings in the garden.'
              )}
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-2 rounded-[var(--radius-btn)] border border-line/30 text-xs font-semibold overflow-x-auto shrink-0">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-[var(--radius-input)] transition-all whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-primary-600 text-on-primary shadow-xs font-bold'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {t('সবগুলো ছবি', 'All Photos')}
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('classes')}
              className={`px-3.5 py-1.5 rounded-[var(--radius-input)] transition-all whitespace-nowrap ${
                selectedCategory === 'classes'
                  ? 'bg-primary-600 text-on-primary shadow-xs font-bold'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {t('শ্রেণিকক্ষ', 'Classrooms')}
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('events')}
              className={`px-3.5 py-1.5 rounded-[var(--radius-input)] transition-all whitespace-nowrap ${
                selectedCategory === 'events'
                  ? 'bg-primary-600 text-on-primary shadow-xs font-bold'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {t('খেলাধুলা ও উৎসব', 'Sports')}
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('nature')}
              className={`px-3.5 py-1.5 rounded-[var(--radius-input)] transition-all whitespace-nowrap ${
                selectedCategory === 'nature'
                  ? 'bg-primary-600 text-on-primary shadow-xs font-bold'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {t('বাগান ও প্রকৃতি', 'Eco & Nature')}
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <div className="p-10 rounded-[var(--radius-card)] bg-surface-card border border-line/30 text-center space-y-2.5 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-[var(--radius-btn)] bg-surface-2 border border-line/25 flex items-center justify-center mx-auto text-primary-600">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-base text-ink">
              {t('এই বিভাগে এখনও কোনো ছবি নেই', 'No Photos in This Category Yet')}
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-[1.7]">
              {t(
                'অন্য বিভাগ নির্বাচন করে দেখুন অথবা অ্যাডমিন প্যানেল থেকে নতুন ক্যাম্পাস ছবি যুক্ত করুন।',
                'Select another category tab or upload campus photos from the school admin panel.'
              )}
            </p>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => setActiveImageIndex(idx)}
              className="group cursor-pointer bg-surface-card rounded-[var(--radius-card)] overflow-hidden border border-line/30 shadow-xs hover:shadow-xl hover:border-primary-400 transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
                <img
                  src={item.photoUrl}
                  alt={item.title}
                  width={800}
                  height={600}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.src = '/images/classroom_learning.webp';
                  }}
                />

                <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="p-2.5 rounded-full bg-surface-card/90 text-ink shadow-lg">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="absolute top-3 left-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-surface-card/90 text-ink border border-line/25 backdrop-blur-xs">
                    {categoryLabels[item.category]?.[lang] || item.category}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-heading font-bold text-sm sm:text-base text-ink line-clamp-1 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                    {item.title}
                  </h3>
                </div>

                <div className="mt-3 pt-2 border-t border-line/20 flex items-center justify-between text-[11px] text-primary-700 dark:text-primary-300 font-semibold">
                  <span>{t('বড় করে দেখুন', 'View Fullscreen')}</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

      </div>

      {/* Lightbox Modal */}
      {activeImageIndex !== null && filteredItems[activeImageIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative max-w-4xl w-full bg-surface-card rounded-[var(--radius-card)] overflow-hidden shadow-2xl border border-line/40">
            
            <button
              type="button"
              onClick={() => setActiveImageIndex(null)}
              className="absolute top-4 right-4 z-20 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-surface-card/90 hover:bg-surface-2 text-ink border border-line/30 transition-colors shadow-md"
              aria-label={t('ছবি বন্ধ করুন', 'Close Preview')}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-[16/10] bg-surface-2">
              <img
                src={filteredItems[activeImageIndex].photoUrl}
                alt={filteredItems[activeImageIndex].title}
                width={1280}
                height={800}
                decoding="async"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-6 bg-surface-card border-t border-line/20">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-primary-100 text-primary-900 uppercase">
                {categoryLabels[filteredItems[activeImageIndex].category]?.[lang] || filteredItems[activeImageIndex].category}
              </span>
              <h3 className="font-heading font-bold text-xl text-ink mt-2">
                {filteredItems[activeImageIndex].title}
              </h3>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};

