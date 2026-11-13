import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSchoolData } from '../context/SchoolDataContext';

function formatWhatsAppDigits(raw?: string): string {
  if (!raw) return '';
  const digits = raw.replace(/[^0-9]/g, '');
  if (!digits) return '';
  if (digits.startsWith('01') && digits.length === 11) {
    return `88${digits}`;
  }
  return digits;
}

export const FloatingWhatsApp: React.FC = () => {
  const { lang, t } = useLanguage();
  const { schoolSettings } = useSchoolData();

  const waDigits = formatWhatsAppDigits(schoolSettings.whatsappNumber);
  if (!waDigits) return null;

  const activeSchoolName = lang === 'bn' ? schoolSettings.nameBn : schoolSettings.nameEn;
  const prefilledMessage =
    lang === 'bn'
      ? `আসসালামু আলাইকুম, ${schoolSettings.nameBn} এ ভর্তি সম্পর্কে জানতে চাই।`
      : `Assalamu Alaikum, I would like admission information for ${schoolSettings.nameEn}.`;

  const href = `https://wa.me/${waDigits}?text=${encodeURIComponent(prefilledMessage)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t(`${activeSchoolName} হোয়াটসঅ্যাপ হেল্পলাইন`, `Chat with ${activeSchoolName} on WhatsApp`)}
      title={t('হোয়াটসঅ্যাপে ভর্তি তথ্য জানুন', 'Chat on WhatsApp for admission help')}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 h-12 px-4 rounded-full bg-success text-on-success shadow-xl border border-line/20 flex items-center gap-2 font-bold text-xs sm:text-sm hover:opacity-95 active:scale-95 transition-all print:hidden"
    >
      <MessageCircle className="w-5 h-5 shrink-0" />
      <span className="hidden sm:inline whitespace-nowrap">
        {t('হোয়াটসঅ্যাপ সাহায্য', 'WhatsApp Help')}
      </span>
    </a>
  );
};
