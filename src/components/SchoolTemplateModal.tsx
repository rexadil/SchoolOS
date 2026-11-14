import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { schoolConfig } from '../config/schoolConfig';
import { X, Copy, Check, Code2, Sparkles, Layers } from 'lucide-react';

interface SchoolTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchoolTemplateModal: React.FC<SchoolTemplateModalProps> = ({ isOpen, onClose }) => {
  const { lang, t } = useLanguage();
  const { isOwner } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!isOpen || (!isOwner && !schoolConfig.showTemplateInspector)) return null;

  const sampleSnippet = `// src/config/schoolConfig.ts
export const schoolConfig = {
  identity: {
    name: {
      bn: "আপনার স্কুলের নাম",
      en: "Your School Name",
    },
    slogan: {
      bn: "প্রতিটি শিশুর ভেতরে একটি আলো আছে",
      en: "Inside every child burns an eternal light",
    },
    conceptName: "আলোর যাত্রা",
  },
  location: {
    addressLine1: "উপজেলা সড়ক, সদর",
    geoCoordinates: { lat: 25.8016, lng: 89.5539 },
  },
  contact: {
    phonePrimary: "+880 1XXX-XXXXXX",
    whatsappNumber: "+8801XXXXXXXXX",
    email: "contact@school.edu.bd",
  },
  theme: {
    bgCream: "var(--token-surface)",
    sunriseGold: "var(--token-primary-500)",
    sunriseCoral: "var(--token-accent)",
    leafGreen: "var(--token-success)",
  },
  classes: [ /* Play, Nursery, KG, Class 1-5 */ ],
};`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-surface-card text-ink rounded-[var(--radius-card)] shadow-2xl border border-line/35 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-primary-700 text-on-primary px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5" />
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg">
                {t('পুনর্ব্যবহারযোগ্য স্কুল টেমপ্লেট গাইড', 'Reusable School Website Template Guide')}
              </h3>
              <p className="text-xs text-on-primary/80">
                {t('যেকোনো স্কুলের জন্য এক ফাইলে সহজ পরিবর্তনযোগ্য আর্কিটেকচার', 'Single-file configuration for any kindergarten or school')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-on-primary/15 hover:bg-on-primary/25 text-on-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          
          <div className="p-4 bg-warning-soft rounded-[var(--radius-card)] border border-warning/30 text-on-warning-soft text-xs sm:text-sm leading-[1.7]">
            <p className="font-bold mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{t('কীভাবে এই টেমপ্লেট অন্য স্কুলের জন্য ব্যবহার করবেন?', 'How to reuse this template for another school?')}</span>
            </p>
            <p>
              {t(
                'এই ওয়েবসাইটের সমস্ত তথ্য (স্কুলের নাম, লোগো, অবস্থান, ফোন নম্বর, হোয়াটসঅ্যাপ, শিক্ষক তালিকা, ৮টি শ্রেণির পাঠ্যক্রম, ও দিনপঞ্জি) একটি মাত্র কনফিগারেশন ফাইল `src/config/schoolConfig.ts` এ সুশৃঙ্খলভাবে রাখা হয়েছে। এটি এডিট করলেই গোটা ওয়েবসাইট স্বয়ংক্রিয়ভাবে পরিবর্তিত হয়ে নতুন স্কুলের জন্য প্রস্তুত হয়ে যাবে।',
                'All school details (name, logo, coordinates, phone numbers, teachers, 8-class curriculum milestones, and daily timeline) are isolated in `src/config/schoolConfig.ts`. Modifying this single file instantly adapts the entire website for any educational institution.'
              )}
            </p>
          </div>

          {/* Key Modular Properties */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-surface-2 rounded-[var(--radius-btn)] border border-line/25">
              <strong className="block text-ink mb-1">১. স্কুল পরিচিতি ও ব্র্যান্ডিং</strong>
              <p className="text-ink-muted">বাংলা ও ইংরেজি নাম, স্লোগান, প্রতিষ্ঠার সাল ও সরকারি রেজিস্ট্রেশন নম্বর।</p>
            </div>
            <div className="p-3 bg-surface-2 rounded-[var(--radius-btn)] border border-line/25">
              <strong className="block text-ink mb-1">২. আলোর যাত্রা পাঠ্যক্রম</strong>
              <p className="text-ink-muted">প্লে থেকে ৫ম শ্রেণি পর্যন্ত বয়স, পাঠদান পদ্ধতি ও কার্যক্রমের পূর্ণাঙ্গ ডাটাবেজ।</p>
            </div>
            <div className="p-3 bg-surface-2 rounded-[var(--radius-btn)] border border-line/25">
              <strong className="block text-ink mb-1">৩. যোগাযোগ ও অবস্থান</strong>
              <p className="text-ink-muted">হটলাইন, হোয়াটসঅ্যাপ সরাসরি চ্যাট ও গুগল ম্যাপ / ওপেনস্ট্রিটম্যাপ সমন্বয়।</p>
            </div>
          </div>

          {/* Code Snippet Box */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-ink-muted flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-primary-600" />
                <span>src/config/schoolConfig.ts</span>
              </span>

              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1 bg-surface-2 hover:bg-surface border border-line/30 text-ink rounded-[var(--radius-input)] text-xs font-medium flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t('কপি হয়েছে!', 'Copied!') : t('কোড কপি করুন', 'Copy Code')}</span>
              </button>
            </div>

            <pre className="p-4 bg-surface-2 border border-line/30 text-ink rounded-[var(--radius-card)] text-xs font-mono overflow-x-auto leading-[1.6]">
              <code>{sampleSnippet}</code>
            </pre>
          </div>

          <div className="pt-4 border-t border-line/25 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-on-primary rounded-[var(--radius-btn)] text-xs font-bold transition-colors"
            >
              {t('ঠিক আছে, বন্ধ করুন', 'Close Guide')}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
