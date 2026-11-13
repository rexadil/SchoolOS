import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const OfflineIndicator: React.FC = () => {
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-40 max-w-xs px-3.5 py-2.5 rounded-[var(--radius-btn)] bg-warning-soft text-on-warning-soft border border-warning/40 shadow-lg flex items-center gap-2 text-xs font-bold print:hidden"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>
        {t('আপনি অফলাইনে আছেন — সংযোগ ফিরলে তথ্য আপডেট হবে', 'You are offline — changes sync when reconnected')}
      </span>
    </div>
  );
};
