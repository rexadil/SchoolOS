import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'bn' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (bnText: string, enText: string) => string;
  formatNumber: (num: number | string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Bengali numeral conversion
const englishToBengaliDigits: Record<string, string> = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('school_template_lang') as Language;
      if (saved === 'bn' || saved === 'en') {
        return saved;
      }
    }
    return 'bn'; // Default Bangla as requested
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('school_template_lang', newLang);
      document.documentElement.lang = newLang;
    }
  };

  const toggleLang = () => {
    setLang(lang === 'bn' ? 'en' : 'bn');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const t = (bnText: string, enText: string) => {
    return lang === 'bn' ? bnText : enText;
  };

  const formatNumber = (val: number | string): string => {
    const str = String(val);
    if (lang === 'bn') {
      return str.replace(/[0-9]/g, (digit) => englishToBengaliDigits[digit] || digit);
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, formatNumber }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
