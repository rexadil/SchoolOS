import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { t } = useLanguage();
  const { canInstall, isIOS, isInstalled, promptInstall } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled || (!canInstall && !isIOS)) return null;

  const handleClick = async () => {
    if (canInstall) {
      await promptInstall();
    } else if (isIOS) {
      setShowIOSGuide((prev) => !prev);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-btn)] bg-surface-card border border-line/35 text-ink hover:border-primary-600 hover:text-primary-600 text-xs font-bold transition-colors shadow-xs"
      >
        {canInstall ? <Download className="w-3.5 h-3.5 text-primary-600" /> : <Smartphone className="w-3.5 h-3.5 text-primary-600" />}
        <span>{t('অ্যাপ ইনস্টল করুন', 'Install School App')}</span>
      </button>

      {showIOSGuide && (
        <div
          role="dialog"
          aria-label={t('অ্যাপ ইনস্টল নির্দেশিকা', 'Install instructions')}
          className="mt-2 p-3 rounded-[var(--radius-card)] bg-surface-card border border-line/40 shadow-lg text-xs text-ink-muted max-w-xs"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="leading-[1.6]">
              {t(
                'সাফারি (Safari) ব্রাউজারের Share বোতামে চাপ দিয়ে "Add to Home Screen" নির্বাচন করুন।',
                'Tap the Share icon in Safari and choose "Add to Home Screen" to install.'
              )}
            </p>
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="p-0.5 text-ink-muted hover:text-ink shrink-0"
              aria-label={t('বন্ধ করুন', 'Close')}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
