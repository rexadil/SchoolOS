import React, { useState } from 'react';
import { Calendar, Users, Phone, User, MessageSquare, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSchoolData } from '../context/SchoolDataContext';

interface VisitBookingFormProps {
  onSuccess?: () => void;
  compact?: boolean;
}

const VISIT_COOLDOWN_KEY = 'school_visit_last_ts';

export const VisitBookingForm: React.FC<VisitBookingFormProps> = ({ onSuccess, compact = false }) => {
  const { t, formatNumber } = useLanguage();
  const { submitInquiry, schoolSettings } = useSchoolData();

  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredDateTime, setPreferredDateTime] = useState('');
  const [visitorCount, setVisitorCount] = useState<number>(2);
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successId, setSuccessId] = useState('');

  const validatePhone = (val: string) => /^01[3-9]\d{8}$/.test(val.replace(/[^0-9]/g, ''));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (honeypot.trim()) {
      setSuccessId('booked');
      return;
    }

    if (parentName.trim().length < 2) {
      setErrorMsg(t('অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।', 'Please enter your full name.'));
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!validatePhone(cleanPhone)) {
      setErrorMsg(
        t(
          'অনুগ্রহ করে সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)।',
          'Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01XXXXXXXXX).'
        )
      );
      return;
    }

    if (!preferredDateTime.trim()) {
      setErrorMsg(t('অনুগ্রহ করে ক্যাম্পাস পরিদর্শনের পছন্দের তারিখ ও সময় নির্বাচন করুন।', 'Please choose your preferred visit date and time.'));
      return;
    }

    if (!consent) {
      setErrorMsg(
        t(
          'বুকিং পাঠানোর আগে অনুগ্রহ করে গোপনীয়তা ও যোগাযোগ সম্মতি বাক্সে টিক দিন।',
          'Please check the privacy and contact consent box before submitting.'
        )
      );
      return;
    }

    const lastTs = typeof window !== 'undefined' ? localStorage.getItem(VISIT_COOLDOWN_KEY) : null;
    if (lastTs) {
      const elapsed = Date.now() - Number(lastTs);
      if (elapsed < 60 * 1000) {
        const remaining = Math.ceil((60 * 1000 - elapsed) / 1000);
        setErrorMsg(
          t(
            `স্প্যাম প্রতিরোধে অনুগ্রহ করে আর ${formatNumber(remaining)} সেকেন্ড অপেক্ষা করুন।`,
            `Please wait ${remaining} seconds before submitting another booking.`
          )
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      const id = await submitInquiry({
        parentName: parentName.trim(),
        phone: cleanPhone,
        preferredDateTime: preferredDateTime.trim(),
        visitorCount: Math.max(1, Math.min(20, Number(visitorCount) || 1)),
        message: message.trim() || null,
        consent: true,
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem(VISIT_COOLDOWN_KEY, String(Date.now()));
      }
      setSuccessId(id);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Visit booking error:', err);
      setErrorMsg(
        t(
          'দুঃখিত, বুকিং জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন বা হটলাইনে কল করুন।',
          'Sorry, we could not submit your visit request. Please try again or call our office.'
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setParentName('');
    setPhone('');
    setPreferredDateTime('');
    setVisitorCount(2);
    setMessage('');
    setConsent(false);
    setSuccessId('');
    setErrorMsg('');
  };

  if (successId) {
    return (
      <div className="p-6 rounded-[var(--radius-card)] bg-success-soft text-on-success-soft border border-success/35 space-y-3 text-center">
        <CheckCircle2 className="w-10 h-10 mx-auto text-success" />
        <h4 className="font-heading font-extrabold text-lg">
          {t('ক্যাম্পাস ভিজিট অনুরোধ গৃহীত হয়েছে!', 'Campus Visit Request Confirmed!')}
        </h4>
        <p className="text-xs sm:text-sm leading-[1.7]">
          {t(
            `ধন্যবাদ! ${schoolSettings.nameBn}-এর অফিস প্রতিনিধি আপনার নম্বরে যোগাযোগ করে নির্ধারিত সময়টি নিশ্চিত করবেন।`,
            `Thank you! Our office team at ${schoolSettings.nameEn} will call your phone shortly to confirm your campus visit.`
          )}
        </p>
        <button
          type="button"
          onClick={resetForm}
          className="px-4 py-2 rounded-[var(--radius-btn)] bg-surface-card text-ink border border-line/35 text-xs font-bold hover:border-primary-600 transition-colors"
        >
          {t('আরেকটি বুকিং করুন', 'Book Another Visit')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Anti-bot Honeypot */}
      <input
        type="text"
        name="website_url_check"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="sr-only"
        aria-hidden="true"
      />

      {errorMsg && (
        <div
          role="alert"
          className="p-3 rounded-[var(--radius-btn)] bg-danger-soft text-on-danger-soft border border-danger/35 text-xs font-semibold flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className={`grid grid-cols-1 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2'} gap-4`}>
        <div>
          <label className="block text-xs font-bold text-ink mb-1">
            {t('অভিভাবকের নাম *', 'Parent / Guardian Name *')}
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-ink-muted absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              required
              maxLength={100}
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder={t('অভিভাবকের পূর্ণ নাম লিখুন', "Enter parent / guardian's full name")}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink placeholder:text-ink-muted text-sm focus:border-primary-600 focus:ring-2 focus:ring-ring/25 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-ink mb-1">
            {t('মোবাইল নম্বর (১১ ডিজিট) *', 'Phone Number (11 digits) *')}
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-ink-muted absolute left-3 top-3 pointer-events-none" />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full pl-9 pr-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink placeholder:text-ink-muted text-sm font-mono focus:border-primary-600 focus:ring-2 focus:ring-ring/25 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-ink mb-1">
            {t('পছন্দের তারিখ ও সময় *', 'Preferred Date & Time *')}
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-ink-muted absolute left-3 top-3 pointer-events-none" />
            <input
              type="datetime-local"
              required
              value={preferredDateTime}
              onChange={(e) => setPreferredDateTime(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm focus:border-primary-600 focus:ring-2 focus:ring-ring/25 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-ink mb-1">
            {t('ভিজিটর সংখ্যা (অভিভাবক ও শিশু) *', 'Number of Visitors *')}
          </label>
          <div className="relative">
            <Users className="w-4 h-4 text-ink-muted absolute left-3 top-3 pointer-events-none" />
            <input
              type="number"
              required
              min={1}
              max={10}
              value={visitorCount}
              onChange={(e) => setVisitorCount(Number(e.target.value))}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm font-mono focus:border-primary-600 focus:ring-2 focus:ring-ring/25 outline-none"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-ink mb-1">
          {t('বিশেষ প্রশ্ন বা বার্তা (ঐচ্ছিক)', 'Message or Question (Optional)')}
        </label>
        <div className="relative">
          <MessageSquare className="w-4 h-4 text-ink-muted absolute left-3 top-3 pointer-events-none" />
          <textarea
            rows={compact ? 2 : 3}
            maxLength={500}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('কোন শ্রেণিতে ভর্তির বিষয়ে জানতে চান তা লিখতে পারেন...', 'Mention the class or topics you would like to discuss...')}
            className="w-full pl-9 pr-3.5 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink placeholder:text-ink-muted text-sm focus:border-primary-600 focus:ring-2 focus:ring-ring/25 outline-none resize-none"
          />
        </div>
      </div>

      {/* Privacy Notice & Required Guardian Consent */}
      <div className="p-3.5 rounded-[var(--radius-btn)] bg-surface-2 border border-line/30 space-y-2.5">
        <div className="flex items-start gap-2 text-[11px] text-ink-muted leading-[1.6]">
          <ShieldCheck className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
          <span>
            {t(
              'আপনার প্রদত্ত নাম, মোবাইল নম্বর ও ভিজিটের সময় কেবলমাত্র বিদ্যালয়ের অফিস প্রতিনিধি কর্তৃক যোগাযোগের কাজে ব্যবহৃত হবে।',
              'Your contact details are used solely by our admissions office to schedule and confirm your campus visit.'
            )}
          </span>
        </div>

        <label className="flex items-start gap-2 cursor-pointer select-none pt-1.5 border-t border-line/20">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-primary-600 shrink-0 cursor-pointer"
          />
          <span className="text-xs font-semibold text-ink leading-[1.5]">
            {t(
              'আমি ভিজিট নিশ্চিতকরণের জন্য বিদ্যালয় অফিসের সাথে ফোন/হোয়াটসঅ্যাপে যোগাযোগ করার সম্মতি দিচ্ছি। *',
              'I consent to the school office contacting me to confirm this campus visit. *'
            )}
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 px-5 rounded-[var(--radius-btn)] bg-primary-600 hover:bg-primary-700 text-on-primary font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        <span>
          {submitting
            ? t('জমা হচ্ছে...', 'Submitting...')
            : t('ক্যাম্পাস ভিজিট বুকিং নিশ্চিত করুন', 'Book Campus Visit')}
        </span>
      </button>
    </form>
  );
};
