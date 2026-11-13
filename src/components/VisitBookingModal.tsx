import React from 'react';
import { X, CalendarCheck, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSchoolData } from '../context/SchoolDataContext';
import { VisitBookingForm } from './VisitBookingForm';

interface VisitBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VisitBookingModal: React.FC<VisitBookingModalProps> = ({ isOpen, onClose }) => {
  const { lang, t } = useLanguage();
  const { schoolSettings } = useSchoolData();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="visit-modal-title"
    >
      <div className="bg-surface-card text-ink rounded-[var(--radius-card)] max-w-lg w-full p-6 sm:p-8 border border-line/35 shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-line/25">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wider mb-1">
              <CalendarCheck className="w-4 h-4" />
              <span>{t('ক্যাম্পাস ভিজিট বুকিং', 'Schedule Campus Visit')}</span>
            </div>
            <h3 id="visit-modal-title" className="font-heading font-extrabold text-xl text-ink">
              {t('সপরিবারে আমাদের ক্যাম্পাস ঘুরে দেখুন', 'Tour Our Campus in Person')}
            </h3>
            <p className="text-xs text-ink-muted flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-primary-600 shrink-0" />
              <span>
                {lang === 'bn' ? schoolSettings.nameBn : schoolSettings.nameEn} · {schoolSettings.area}, {schoolSettings.upazila}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('বন্ধ করুন', 'Close dialog')}
            className="p-2 rounded-full bg-surface-2 hover:bg-primary-50 text-ink-muted hover:text-ink transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <VisitBookingForm compact />
      </div>
    </div>
  );
};
