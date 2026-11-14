import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SchoolSettingsData, useSchoolData } from '../../context/SchoolDataContext';
import { presets, schoolConfig } from '../../config/schoolConfig';
import { compressImage } from '../../utils/imageCompressor';
import {
  Building2,
  Save,
  Loader2,
  Upload,
  Image as ImageIcon,
  Layers,
  Palette,
  Megaphone,
  Quote,
  MapPin,
  Phone,
  Shield,
  Award,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Eye,
} from 'lucide-react';

interface SchoolIdentityTabProps {
  onNotify: (text: string, type?: 'success' | 'error') => void;
  onNavigateTab: (tab: 'appearance' | 'fees' | 'notices' | 'users_logs') => void;
}

/**
 * SchoolIdentityTab:
 * - School Owners (Principals) can customize all institutional identity fields,
 *   logo, favicon, hero copy, Principal's message, address, map, and announcement bar.
 * - Ownership Transfer & Lock controls (`settings/ownership`) are rendered strictly
 *   for Developer accounts (`isDeveloper === true`) and enforced by Firestore Rules.
 */
export const SchoolIdentityTab: React.FC<SchoolIdentityTabProps> = ({
  onNotify,
  onNavigateTab,
}) => {
  const { lang, t } = useLanguage();
  const { isOwner, isDeveloper, ownershipLocked, effectiveOwnerEmail } = useAuth();
  const { appearance, saveAppearance } = useTheme();
  const {
    schoolSettings,
    feeSettings,
    notices,
    schoolType,
    switchPreset,
    updateSchoolSettings,
    transferOwnership,
  } = useSchoolData();

  const [form, setForm] = useState<SchoolSettingsData>(schoolSettings);
  const [announcementForm, setAnnouncementForm] = useState(appearance.announcement);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  // Developer-Only Ownership Lock & Transfer State
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [confirmPhrase, setConfirmPhrase] = useState('');
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    setForm(schoolSettings);
  }, [schoolSettings]);

  useEffect(() => {
    setAnnouncementForm(appearance.announcement);
  }, [appearance.announcement]);

  const activeLogoUrl = form.logoUrl || appearance.logoUrl || '';
  const activeFaviconUrl = appearance.faviconUrl || '';

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      onNotify(t('ফাইলের আকার ১২ মেগাবাইটের বেশি হতে পারবে না।', 'File exceeds 12MB limit.'), 'error');
      return;
    }

    setUploadingLogo(true);
    try {
      const compressed = await compressImage(file, { maxDimension: 480, maxBytes: 120 * 1024 });
      setForm((prev) => ({ ...prev, logoUrl: compressed }));
      onNotify(t('লোগো অপ্টিমাইজ হয়েছে। সংরক্ষণে ক্লিক করুন।', 'Logo optimized. Click Save Identity Settings.'));
    } catch (err) {
      console.error(err);
      onNotify(t('লোগো প্রসেস করা যায়নি।', 'Failed to process logo image.'), 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleUploadFavicon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      onNotify(t('ফাইলের আকার ১২ মেগাবাইটের বেশি হতে পারবে না।', 'File exceeds 12MB limit.'), 'error');
      return;
    }

    setUploadingFavicon(true);
    try {
      const compressed = await compressImage(file, { maxDimension: 192, maxBytes: 60 * 1024 });
      await saveAppearance({ ...appearance, faviconUrl: compressed });
      onNotify(t('ফ্যাভিকন সফলভাবে আপলোড ও সংরক্ষিত হয়েছে!', 'Favicon uploaded and saved successfully!'));
    } catch (err) {
      console.error(err);
      onNotify(t('ফ্যাভিকন আপলোড করা যায়নি।', 'Failed to upload favicon.'), 'error');
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleRemoveFavicon = async () => {
    try {
      await saveAppearance({ ...appearance, faviconUrl: '' });
      onNotify(t('ফ্যাভিকন মুছে ফেলা হয়েছে।', 'Favicon removed.'));
    } catch (err) {
      console.error(err);
      onNotify(t('ফ্যাভিকন মোছা যায়নি।', 'Failed to remove favicon.'), 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameBn.trim() || !form.nameEn.trim()) {
      onNotify(t('বিদ্যালয়ের বাংলা ও ইংরেজি নাম আবশ্যক।', 'Both Bengali and English school names are required.'), 'error');
      return;
    }
    if (!form.phonePrimary.trim()) {
      onNotify(t('প্রধান হটলাইন নম্বর দিন।', 'Primary phone number is required.'), 'error');
      return;
    }

    setSaving(true);
    try {
      await updateSchoolSettings({
        ...form,
        nameBn: form.nameBn.trim(),
        nameEn: form.nameEn.trim(),
        shortNameBn: (form.shortNameBn || '').trim(),
        shortNameEn: (form.shortNameEn || '').trim(),
        sloganBn: (form.sloganBn || '').trim(),
        sloganEn: (form.sloganEn || '').trim(),
        heroTitleBn: (form.heroTitleBn || '').trim(),
        heroTitleEn: (form.heroTitleEn || '').trim(),
        heroSubtitleBn: (form.heroSubtitleBn || '').trim(),
        heroSubtitleEn: (form.heroSubtitleEn || '').trim(),
        addressLine: (form.addressLine || '').trim(),
        area: (form.area || '').trim(),
        upazila: (form.upazila || '').trim(),
        district: (form.district || '').trim(),
        postCode: (form.postCode || '').trim(),
        phonePrimary: form.phonePrimary.trim(),
        phoneSecondary: (form.phoneSecondary || '').trim(),
        whatsappNumber: (form.whatsappNumber || '').trim(),
        email: (form.email || '').trim(),
        facebookUrl: (form.facebookUrl || '').trim(),
        youtubeUrl: (form.youtubeUrl || '').trim(),
        principalNameBn: (form.principalNameBn || '').trim(),
        principalNameEn: (form.principalNameEn || '').trim(),
        principalTitleBn: (form.principalTitleBn || '').trim(),
        principalTitleEn: (form.principalTitleEn || '').trim(),
        principalMessageBn: (form.principalMessageBn || '').trim(),
        principalMessageEn: (form.principalMessageEn || '').trim(),
      });

      // Also persist announcement bar settings when changed by Owner
      if (isOwner) {
        const annChanged =
          JSON.stringify(announcementForm) !== JSON.stringify(appearance.announcement);
        if (annChanged) {
          await saveAppearance({
            ...appearance,
            announcement: {
              ...announcementForm,
              textBn: (announcementForm.textBn || '').trim(),
              textEn: (announcementForm.textEn || '').trim(),
              linkUrl: (announcementForm.linkUrl || '').trim(),
            },
          });
        }
      }

      onNotify(t('বিদ্যালয়ের পরিচিতি সফলভাবে সংরক্ষিত হয়েছে!', 'School identity saved successfully!'));
    } catch (err) {
      console.error(err);
      onNotify(t('তথ্য সংরক্ষণে ত্রুটি হয়েছে।', 'Failed to save school identity.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  /**
   * BUSINESS PROTECTION:
   * Only authenticated Developer accounts (`isDeveloper === true`) can execute
   * ownership assignment/transfer. Normal Principals (`isOwner && !isDeveloper`)
   * never see this form and are blocked by Firestore rules (`settings/ownership`).
   */
  const trimmedNewOwner = newOwnerEmail.trim().toLowerCase();
  const emailValid = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(trimmedNewOwner);
  const notSameOwner = trimmedNewOwner !== effectiveOwnerEmail.toLowerCase();
  const normalizedConfirm = confirmPhrase.trim();
  const phraseMatches =
    normalizedConfirm === 'TRANSFER' ||
    (schoolSettings.nameBn.trim() && normalizedConfirm === schoolSettings.nameBn.trim()) ||
    (schoolSettings.nameEn.trim() && normalizedConfirm.toLowerCase() === schoolSettings.nameEn.trim().toLowerCase());
  const canTransfer = isDeveloper && emailValid && notSameOwner && phraseMatches && !transferring;

  const handleTransferOwnership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDeveloper) {
      onNotify(
        t('মালিকানা পরিবর্তন শুধুমাত্র ডেভেলপার অ্যাকাউন্টের জন্য সংরক্ষিত।', 'Only authorized developer accounts can change ownership.'),
        'error'
      );
      return;
    }
    if (!canTransfer) {
      onNotify(
        t(
          'সঠিক নতুন Gmail দিন এবং নিশ্চিতকরণ টেক্সট (TRANSFER অথবা বিদ্যালয়ের নাম) লিখুন।',
          'Provide a valid new Gmail and type TRANSFER or the school name to confirm.'
        ),
        'error'
      );
      return;
    }

    setTransferring(true);
    try {
      await transferOwnership(trimmedNewOwner);
      setNewOwnerEmail('');
      setConfirmPhrase('');
      onNotify(
        t(
          `মালিকানা ${trimmedNewOwner} এ হস্তান্তর ও লক করা হয়েছে।`,
          `Ownership assigned & locked to ${trimmedNewOwner}.`
        )
      );
    } catch (err) {
      console.error(err);
      onNotify(
        err instanceof Error
          ? err.message
          : t('মালিকানা হস্তান্তর করা যায়নি।', 'Failed to transfer ownership.'),
        'error'
      );
    } finally {
      setTransferring(false);
    }
  };

  // Handover Readiness Checklist
  const activeAdmissionNotice = notices.find((n) => n.isAdmissionNotice && n.admissionActive);
  const checklistItems = [
    {
      done: Boolean(form.nameBn && form.nameEn && form.addressLine && form.phonePrimary),
      titleBn: '১. বিদ্যালয়ের নাম, পূর্ণ ঠিকানা, পোস্ট কোড ও হটলাইন নম্বর যাচাই',
      titleEn: '1. Verify School Name, Address, Post Code & Hotline',
    },
    {
      done: Boolean(activeLogoUrl),
      titleBn: '২. প্রতিষ্ঠানের অফিসিয়াল লোগো ও ব্রাউজার ফ্যাভিকন আপলোড',
      titleEn: '2. Upload Official School Logo & Browser Favicon',
    },
    {
      done: Boolean(form.principalNameBn && form.principalMessageBn && form.heroTitleBn),
      titleBn: '৩. প্রধান শিক্ষকের নাম/বাণী এবং হিরো মূল শিরোনাম ও ক্যাপশন হালনাগাদ',
      titleEn: '3. Customize Principal Message & Hero Headline/Caption',
    },
    {
      done: Boolean(feeSettings.bkashNumber && feeSettings.nagadNumber),
      titleBn: '৪. শ্রেণিভিত্তিক ভর্তি/মাসিক ফি এবং বিকাশ-নগদ নম্বর সেটআপ',
      titleEn: '4. Configure Class Fees & bKash/Nagad Payment Numbers',
      actionLabel: t('ফি ট্যাব →', 'Fees →'),
      actionTab: 'fees' as const,
    },
    {
      done: Boolean(activeAdmissionNotice),
      titleBn: '৫. বর্তমান শিক্ষাবর্ষের সক্রিয় ভর্তি বিজ্ঞপ্তি ও শেষ তারিখ চালু করা',
      titleEn: '5. Publish Active Admission Circular & Deadline Date',
      actionLabel: t('নোটিশ ট্যাব →', 'Notices →'),
      actionTab: 'notices' as const,
    },
    {
      done: Boolean(form.map?.lat && form.map?.lng && form.whatsappNumber),
      titleBn: '৬. গুগল ম্যাপ স্থানাঙ্ক (Lat/Lng), ফেসবুক ও হোয়াটসঅ্যাপ নম্বর পরীক্ষা',
      titleEn: '6. Verify Google Map Coordinates, Facebook & WhatsApp',
    },
    {
      done: Boolean(appearance.theme),
      titleBn: '৭. থিম প্যাক, ডার্ক মোড ও টপ অ্যানাউন্সমেন্ট বার কনফিগার',
      titleEn: '7. Review Theme Pack, Dark Mode & Announcement Bar',
      actionLabel: t('দৃশ্যমানতা →', 'Appearance →'),
      actionTab: 'appearance' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Live Identity & Announcement Preview Banner */}
      <div className="bg-surface-card rounded-[var(--radius-card)] p-6 sm:p-8 border border-line/35 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-line/20 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" />
              <span>
                {isDeveloper
                  ? t('স্কুল পরিচিতি ও ডেভেলপার লক (Developer + Owner)', 'School Identity & Developer Ownership Lock')
                  : t('বিদ্যালয়ের পূর্ণ পরিচিতি ও কনফিগারেশন (Owner Only)', 'Full School Identity & Settings (Owner Only)')}
              </span>
            </div>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-ink">
              {t('কোড স্পর্শ না করেই প্রতিষ্ঠানের সম্পূর্ণ তথ্য নিয়ন্ত্রণ করুন', 'Full White-Label Institutional Control Without Editing Code')}
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-1 leading-[1.7]">
              {t(
                'এখানে সংরক্ষিত প্রতিটি তথ্য Firestore (/settings/school)-এ সংরক্ষিত হয় এবং তাৎক্ষণিকভাবে মূল ওয়েবসাইট, ভর্তি ফরম ও SEO স্কিমায় প্রতিফলিত হয়।',
                'Every field here persists in Firestore (/settings/school) and overrides static template defaults across homepage, admission form, and SEO schema.'
              )}
            </p>
          </div>

          {isOwner && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onNavigateTab('appearance')}
                className="px-3.5 py-2 rounded-[var(--radius-btn)] bg-surface-2 hover:bg-surface text-ink border border-line/35 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Palette className="w-3.5 h-3.5 text-primary-600" />
                <span>{t('থিম ও অ্যানাউন্সমেন্ট বার', 'Theme & Announcement')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Live Preview Box */}
        <div className="rounded-[var(--radius-card)] border border-line/30 bg-surface overflow-hidden">
          <div className="px-4 py-2 bg-surface-2 border-b border-line/20 flex items-center justify-between text-[11px] font-bold text-ink-muted">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-primary-600" />
              <span>{t('লাইভ পাবলিক প্রিভিউ', 'Live Public Preview')}</span>
            </span>
            <span className="font-mono text-primary-700 dark:text-primary-300">
              /settings/school
            </span>
          </div>

          {/* Announcement bar preview */}
          {appearance.announcement.enabled && (
            <div
              className={`px-4 py-1.5 text-center text-xs font-bold flex items-center justify-center gap-2 ${
                appearance.announcement.style === 'primary'
                  ? 'bg-primary-600 text-on-primary'
                  : appearance.announcement.style === 'warning'
                  ? 'bg-warning-soft text-on-warning-soft'
                  : appearance.announcement.style === 'success'
                  ? 'bg-success-soft text-on-success-soft'
                  : appearance.announcement.style === 'neutral'
                  ? 'bg-surface-2 text-ink border-b border-line/20'
                  : 'bg-accent text-on-accent'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5 shrink-0" />
              <span>{lang === 'bn' ? appearance.announcement.textBn : appearance.announcement.textEn}</span>
            </div>
          )}

          <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-7 space-y-2">
              <div className="flex items-center gap-3">
                {activeLogoUrl ? (
                  <img
                    src={activeLogoUrl}
                    alt="School Logo"
                    className="w-12 h-12 rounded-[var(--radius-btn)] object-contain p-1 bg-surface-card border border-line/30 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-[var(--radius-btn)] bg-primary-600 text-on-primary flex items-center justify-center font-heading font-extrabold text-lg shrink-0">
                    {(lang === 'bn' ? form.nameBn : form.nameEn).charAt(0) || 'S'}
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-heading font-extrabold text-base sm:text-lg text-ink">
                      {lang === 'bn' ? form.nameBn : form.nameEn}
                    </span>
                    {(lang === 'bn' ? form.shortNameBn : form.shortNameEn) && (
                      <span className="px-2 py-0.5 rounded bg-surface-2 border border-line/30 text-[10px] font-bold uppercase text-ink-muted">
                        {lang === 'bn' ? form.shortNameBn : form.shortNameEn}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-ink-muted">
                    {form.area}, {form.upazila}{form.postCode ? ` - ${form.postCode}` : ''}, {form.district}
                    {form.eiin ? ` · EIIN ${form.eiin}` : ''}
                  </div>
                </div>
              </div>

              <h3 className="font-heading font-extrabold text-lg sm:text-xl text-ink pt-1">
                {(lang === 'bn' ? form.heroTitleBn : form.heroTitleEn) || form.sloganBn}
              </h3>
              <p className="text-xs text-ink-muted leading-[1.7]">
                {(lang === 'bn' ? form.heroSubtitleBn : form.heroSubtitleEn) || form.sloganEn}
              </p>
            </div>

            <div className="lg:col-span-5 bg-surface-card rounded-[var(--radius-card)] p-4 border border-line/25 space-y-2 text-xs">
              <div className="font-bold text-primary-700 dark:text-primary-300 flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5" />
                <span>{(lang === 'bn' ? form.principalNameBn : form.principalNameEn) || t('প্রধান শিক্ষক', 'Principal')}</span>
              </div>
              <p className="text-ink-muted italic line-clamp-2 leading-[1.7]">
                "{(lang === 'bn' ? form.principalMessageBn : form.principalMessageEn) || ''}"
              </p>
              <div className="pt-2 border-t border-line/20 flex flex-wrap gap-3 text-[11px] font-mono text-ink-muted">
                <span>{form.phonePrimary}</span>
                <span>WA: {form.whatsappNumber}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Editable School Identity Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-surface-card rounded-[var(--radius-card)] p-6 sm:p-8 border border-line/35 shadow-xs space-y-8"
      >
        {/* 1. School Level Preset */}
        <div className="p-5 rounded-[var(--radius-card)] bg-surface-2 border border-line/30 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-heading font-extrabold text-base text-ink flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary-600" />
                <span>{t('১. বিদ্যালয়ের স্তর প্রিসেট (School Level Preset)', '1. School Level Template Preset')}</span>
              </h3>
              <p className="text-xs text-ink-muted">
                {t('স্তর পরিবর্তন করলে শ্রেণি কাঠামো ও ভর্তি ফরমের ফিল্ড স্বয়ংক্রিয়ভাবে সামঞ্জস্যপূর্ণ হয়।', 'Switch grade spans and admission form fields safely.')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(
              [
                {
                  id: 'kindergarten' as const,
                  title: t('কিন্ডারগার্টেন (Kindergarten)', 'Kindergarten'),
                  sub: t('প্লে, নার্সারি, কেজি ও ১ম-৫ম শ্রেণি', 'Play, Nursery, KG & Class 1-5'),
                },
                {
                  id: 'primary' as const,
                  title: t('প্রাথমিক বিদ্যালয় (Primary)', 'Primary School'),
                  sub: t('১ম থেকে ৫ম শ্রেণি (৫টি গ্রেড)', 'Class 1 to 5 (5 Grades)'),
                },
                {
                  id: 'highschool' as const,
                  title: t('উচ্চ বিদ্যালয় (High School)', 'High School'),
                  sub: t('৬ষ্ঠ-১০ম শ্রেণি ও বিভাগসমূহ', 'Class 6-10 & Streams'),
                },
              ]
            ).map((presetOpt) => {
              const active = schoolType === presetOpt.id;
              return (
                <button
                  key={presetOpt.id}
                  type="button"
                  onClick={() => {
                    switchPreset(presetOpt.id);
                    const p = presets[presetOpt.id];
                    setForm((prev) => ({
                      ...prev,
                      schoolType: presetOpt.id,
                      eiin: p.eiin || prev.eiin,
                      mpoStatus: p.mpoStatus || prev.mpoStatus,
                      schoolCode: p.schoolCode || prev.schoolCode,
                      registrationNo: p.registrationNo || prev.registrationNo,
                    }));
                  }}
                  className={`p-3.5 rounded-[var(--radius-btn)] border text-left transition-all ${
                    active
                      ? 'bg-primary-600 text-on-primary border-primary-700 shadow-sm ring-2 ring-ring/30'
                      : 'bg-surface-card text-ink border-line/35 hover:border-primary-400'
                  }`}
                >
                  <div className="font-bold text-sm">{presetOpt.title}</div>
                  <div className={`text-xs mt-0.5 ${active ? 'text-on-primary/85' : 'text-ink-muted'}`}>
                    {presetOpt.sub}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Logo & Favicon Quick Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-[var(--radius-card)] bg-surface-2 border border-line/25 space-y-2.5">
            <label className="block text-xs font-bold text-ink">
              {t('বিদ্যালয়ের লোগো (সর্বোচ্চ ৪৮০px)', 'School Official Logo (Max 480px)')}
            </label>
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-[var(--radius-btn)] bg-surface-card border border-line/35 flex items-center justify-center overflow-hidden shrink-0">
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-ink-muted" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-btn)] bg-primary-600 hover:bg-primary-700 text-on-primary text-xs font-bold">
                  {uploadingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>{uploadingLogo ? t('প্রসেস হচ্ছে...', 'Optimizing...') : t('লোগো আপলোড', 'Upload Logo')}</span>
                  <input type="file" accept="image/*" onChange={handleUploadLogo} disabled={uploadingLogo} className="hidden" />
                </label>
                {form.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, logoUrl: '' }))}
                    className="px-2.5 py-1.5 rounded-[var(--radius-btn)] bg-danger-soft text-on-danger-soft text-xs font-bold"
                  >
                    {t('মুছুন', 'Remove')}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-[var(--radius-card)] bg-surface-2 border border-line/25 space-y-2.5">
            <label className="block text-xs font-bold text-ink">
              {t('ব্রাউজার ট্যাব ফ্যাভিকন (সর্বোচ্চ ১৯২px)', 'Browser Tab Favicon (Max 192px)')}
            </label>
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-[var(--radius-btn)] bg-surface-card border border-line/35 flex items-center justify-center overflow-hidden shrink-0">
                {activeFaviconUrl ? (
                  <img src={activeFaviconUrl} alt="Favicon" className="w-full h-full object-contain p-1" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-ink-muted" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {isOwner ? (
                  <>
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-btn)] bg-primary-600 hover:bg-primary-700 text-on-primary text-xs font-bold">
                      {uploadingFavicon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>{uploadingFavicon ? t('আপলোড হচ্ছে...', 'Uploading...') : t('ফ্যাভিকন আপলোড', 'Upload Favicon')}</span>
                      <input type="file" accept="image/*" onChange={handleUploadFavicon} disabled={uploadingFavicon} className="hidden" />
                    </label>
                    {activeFaviconUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveFavicon}
                        className="px-2.5 py-1.5 rounded-[var(--radius-btn)] bg-danger-soft text-on-danger-soft text-xs font-bold"
                      >
                        {t('মুছুন', 'Remove')}
                      </button>
                    )}
                  </>
                ) : (
                  <span className="text-[11px] text-ink-muted">
                    {t('বর্তমান Owner দ্বারা নিয়ন্ত্রিত', 'Managed by current Owner')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Names, Short Names, Slogans & Hero Texts */}
        <div className="space-y-4">
          <h3 className="font-heading font-extrabold text-base text-ink border-b border-line/20 pb-2">
            {t('২. প্রতিষ্ঠানের নাম, সংক্ষিপ্ত নাম, স্লোগান ও হিরো ক্যাপশন', '2. Names, Short Name, Tagline & Hero Copy')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('বিদ্যালয়ের পূর্ণ নাম (বাংলায়) *', 'Full School Name (Bengali) *')}
              </label>
              <input
                type="text"
                required
                value={form.nameBn}
                onChange={(e) => setForm({ ...form, nameBn: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('বিদ্যালয়ের পূর্ণ নাম (ইংরেজিতে) *', 'Full School Name (English) *')}
              </label>
              <input
                type="text"
                required
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('সংক্ষিপ্ত নাম / ব্র্যান্ড ব্যাজ (বাংলা)', 'Short Name / Badge (Bengali)')}
              </label>
              <input
                type="text"
                value={form.shortNameBn || ''}
                onChange={(e) => setForm({ ...form, shortNameBn: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('সংক্ষিপ্ত নাম / ব্র্যান্ড ব্যাজ (ইংরেজি)', 'Short Name / Badge (English)')}
              </label>
              <input
                type="text"
                value={form.shortNameEn || ''}
                onChange={(e) => setForm({ ...form, shortNameEn: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('স্লোগান / মূলমন্ত্র (বাংলা)', 'Slogan / Motto (Bengali)')}
              </label>
              <input
                type="text"
                value={form.sloganBn}
                onChange={(e) => setForm({ ...form, sloganBn: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('স্লোগান / মূলমন্ত্র (ইংরেজি)', 'Slogan / Motto (English)')}
              </label>
              <input
                type="text"
                value={form.sloganEn}
                onChange={(e) => setForm({ ...form, sloganEn: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('হিরো মূল শিরোনাম (বাংলা)', 'Hero Main Headline (Bengali)')}
              </label>
              <input
                type="text"
                value={form.heroTitleBn}
                onChange={(e) => setForm({ ...form, heroTitleBn: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('হিরো মূল শিরোনাম (ইংরেজি)', 'Hero Main Headline (English)')}
              </label>
              <input
                type="text"
                value={form.heroTitleEn}
                onChange={(e) => setForm({ ...form, heroTitleEn: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('হিরো উপ-শিরোনাম / ক্যাপশন (বাংলা)', 'Hero Caption / Subtitle (Bengali)')}
              </label>
              <textarea
                rows={3}
                value={form.heroSubtitleBn}
                onChange={(e) => setForm({ ...form, heroSubtitleBn: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm leading-[1.7] focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('হিরো উপ-শিরোনাম / ক্যাপশন (ইংরেজি)', 'Hero Caption / Subtitle (English)')}
              </label>
              <textarea
                rows={3}
                value={form.heroSubtitleEn}
                onChange={(e) => setForm({ ...form, heroSubtitleEn: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm leading-[1.7] focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 4. Principal Name & Message / Bani */}
        <div className="space-y-4 p-5 rounded-[var(--radius-card)] bg-surface-2 border border-line/25">
          <h3 className="font-heading font-extrabold text-base text-ink flex items-center gap-2">
            <Quote className="w-4 h-4 text-primary-600" />
            <span>{t('৩. প্রধান শিক্ষক / অধ্যক্ষের নাম ও বাণী', '3. Principal Name & Editorial Message')}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('অধ্যক্ষ / প্রধান শিক্ষকের নাম (বাংলা)', 'Principal Name (Bengali)')}
              </label>
              <input
                type="text"
                value={form.principalNameBn || ''}
                onChange={(e) => setForm({ ...form, principalNameBn: e.target.value })}
                className="w-full px-3.5 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('অধ্যক্ষ / প্রধান শিক্ষকের নাম (ইংরেজি)', 'Principal Name (English)')}
              </label>
              <input
                type="text"
                value={form.principalNameEn || ''}
                onChange={(e) => setForm({ ...form, principalNameEn: e.target.value })}
                className="w-full px-3.5 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('বাণীর শিরোনাম (বাংলা)', 'Message Heading (Bengali)')}
              </label>
              <input
                type="text"
                value={form.principalTitleBn || ''}
                onChange={(e) => setForm({ ...form, principalTitleBn: e.target.value })}
                className="w-full px-3.5 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('বাণীর শিরোনাম (ইংরেজি)', 'Message Heading (English)')}
              </label>
              <input
                type="text"
                value={form.principalTitleEn || ''}
                onChange={(e) => setForm({ ...form, principalTitleEn: e.target.value })}
                className="w-full px-3.5 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('অধ্যক্ষের বাণী (বাংলা)', 'Principal Message (Bengali)')}
              </label>
              <textarea
                rows={4}
                value={form.principalMessageBn || ''}
                onChange={(e) => setForm({ ...form, principalMessageBn: e.target.value })}
                className="w-full px-3.5 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm leading-[1.7]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('অধ্যক্ষের বাণী (ইংরেজি)', 'Principal Message (English)')}
              </label>
              <textarea
                rows={4}
                value={form.principalMessageEn || ''}
                onChange={(e) => setForm({ ...form, principalMessageEn: e.target.value })}
                className="w-full px-3.5 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm leading-[1.7]"
              />
            </div>
          </div>
        </div>

        {/* 5. Location, Contacts, Social & Google Map */}
        <div className="space-y-4">
          <h3 className="font-heading font-extrabold text-base text-ink flex items-center gap-2 border-b border-line/20 pb-2">
            <MapPin className="w-4 h-4 text-primary-600" />
            <span>{t('৪. পূর্ণ ঠিকানা, যোগাযোগ ও গুগল ম্যাপ', '4. Full Address, Contacts, Social & Google Maps')}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-ink mb-1">
                {t('বাড়ি / সড়ক ঠিকানা', 'Street / Address Line')}
              </label>
              <input
                type="text"
                value={form.addressLine}
                onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
                className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('এলাকা / ইউনিয়ন', 'Area / Union')}
              </label>
              <input
                type="text"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('উপজেলা / থানা', 'Upazila')}
              </label>
              <input
                type="text"
                value={form.upazila}
                onChange={(e) => setForm({ ...form, upazila: e.target.value })}
                className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  {t('জেলা', 'District')}
                </label>
                <input
                  type="text"
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  {t('পোস্ট কোড', 'Post Code')}
                </label>
                <input
                  type="text"
                  value={form.postCode || ''}
                  onChange={(e) => setForm({ ...form, postCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-ink mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-primary-600" />
                <span>{t('প্রধান হটলাইন ফোন *', 'Primary Phone *')}</span>
              </label>
              <input
                type="text"
                required
                value={form.phonePrimary}
                onChange={(e) => setForm({ ...form, phonePrimary: e.target.value })}
                className="w-full px-3.5 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('দ্বিতীয় ফোন নম্বর', 'Secondary Phone')}
              </label>
              <input
                type="text"
                value={form.phoneSecondary}
                onChange={(e) => setForm({ ...form, phoneSecondary: e.target.value })}
                className="w-full px-3.5 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('হোয়াটসঅ্যাপ নম্বর', 'WhatsApp Number')}
              </label>
              <input
                type="text"
                value={form.whatsappNumber}
                onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                className="w-full px-3.5 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('অফিসিয়াল ইমেইল', 'School Email')}
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('ফেসবুক পেজ URL', 'Facebook Page URL')}
              </label>
              <input
                type="url"
                value={form.facebookUrl || ''}
                onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
                placeholder="https://facebook.com/..."
                className="w-full px-3.5 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('ইউটিউব চ্যানেল URL', 'YouTube Channel URL')}
              </label>
              <input
                type="url"
                value={form.youtubeUrl || ''}
                onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                placeholder="https://youtube.com/..."
                className="w-full px-3.5 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-xs font-mono"
              />
            </div>
          </div>

          {/* Google Maps Coordinates & Embed URL */}
          <div className="p-4 rounded-[var(--radius-card)] bg-surface-2 border border-line/25 space-y-3">
            <div className="text-xs font-bold text-ink uppercase tracking-wider">
              {t('গুগল ম্যাপ স্থানাঙ্ক ও এম্বেড লিংক (Google Map Configuration)', 'Google Maps Coordinates & Embed')}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-ink-muted mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={form.map?.lat ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      map: { ...form.map, lat: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-ink-muted mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={form.map?.lng ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      map: { ...form.map, lng: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-ink-muted mb-1">
                  {t('ম্যাপ শেয়ার লিংক (Share URL)', 'Google Maps Share URL')}
                </label>
                <input
                  type="url"
                  value={form.map?.shareUrl || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      map: { ...form.map, shareUrl: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-ink-muted mb-1">
                  {t('ম্যাপ এম্বেড URL (Iframe)', 'Map Embed Iframe URL')}
                </label>
                <input
                  type="url"
                  value={form.map?.embedUrl || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      map: { ...form.map, embedUrl: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 6. Institutional Credentials & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 bg-surface-2 rounded-[var(--radius-card)] border border-line/25 space-y-3">
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-success" />
              <span>{t('৫. সরকারি স্বীকৃতি (EIIN, MPO, Code & Reg)', '5. Institutional Codes (EIIN, MPO & Reg)')}</span>
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">EIIN</label>
                <input
                  type="text"
                  value={form.eiin || ''}
                  onChange={(e) => setForm({ ...form, eiin: e.target.value })}
                  className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs font-mono font-bold bg-surface text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">{t('এমপিও স্ট্যাটাস', 'MPO Status')}</label>
                <input
                  type="text"
                  value={form.mpoStatus || ''}
                  onChange={(e) => setForm({ ...form, mpoStatus: e.target.value })}
                  className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs bg-surface text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">{t('বিদ্যালয় কোড', 'School Code')}</label>
                <input
                  type="text"
                  value={form.schoolCode || ''}
                  onChange={(e) => setForm({ ...form, schoolCode: e.target.value })}
                  placeholder={`${schoolConfig.applicationPrefix}-4509`}
                  className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs font-mono font-bold bg-surface text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">{t('নিবন্ধন নং', 'Registration No')}</label>
                <input
                  type="text"
                  value={form.registrationNo || ''}
                  onChange={(e) => setForm({ ...form, registrationNo: e.target.value })}
                  className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs bg-surface text-ink"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-surface-2 rounded-[var(--radius-card)] border border-line/25 space-y-3">
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-primary-600" />
              <span>{t('৬. হোমপেজ অর্জন ও পরিসংখ্যান', '6. Homepage Achievement Counters')}</span>
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">{t('মোট শিক্ষার্থী', 'Total Students')}</label>
                <input
                  type="number"
                  min={0}
                  value={form.stats?.studentsCount ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      stats: { ...form.stats, studentsCount: Number(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs font-mono font-bold bg-surface text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">{t('অভিজ্ঞ শিক্ষক', 'Teachers')}</label>
                <input
                  type="number"
                  min={0}
                  value={form.stats?.teachersCount ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      stats: { ...form.stats, teachersCount: Number(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs font-mono font-bold bg-surface text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">{t('অভিজ্ঞতার বছর', 'Years Active')}</label>
                <input
                  type="number"
                  min={0}
                  value={form.stats?.yearsCount ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      stats: { ...form.stats, yearsCount: Number(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs font-mono font-bold bg-surface text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">{t('সাফল্যের হার', 'Success Rate')}</label>
                <input
                  type="text"
                  value={form.stats?.successRate ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      stats: { ...form.stats, successRate: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs font-mono font-bold bg-surface text-ink"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 7. Top Announcement Bar Quick Controls (Owner Editable) */}
        {isOwner && (
          <div className="p-4 sm:p-5 bg-surface-2 rounded-[var(--radius-card)] border border-line/25 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-primary-600" />
                  <span>{t('৭. শীর্ষ ঘোষণা বার (Top Announcement Bar)', '7. Top Announcement Bar')}</span>
                </h4>
                <p className="text-[11px] text-ink-muted mt-0.5">
                  {t('ওয়েবসাইটের একদম উপরে জরুরি ভর্তি বা ছুটির ঘোষণা দেখান।', 'Display urgent admission or notice banner at the top of the public website.')}
                </p>
              </div>
              <label className="inline-flex items-center gap-2 text-xs font-bold text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={announcementForm.enabled}
                  onChange={(e) =>
                    setAnnouncementForm({ ...announcementForm, enabled: e.target.checked })
                  }
                  className="w-4 h-4 accent-primary-600"
                />
                <span>{announcementForm.enabled ? t('সক্রিয় (Enabled)', 'Enabled') : t('বন্ধ (Hidden)', 'Hidden')}</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  {t('ঘোষণা বার্তা (বাংলা)', 'Announcement Text (Bengali)')}
                </label>
                <input
                  type="text"
                  value={announcementForm.textBn}
                  onChange={(e) =>
                    setAnnouncementForm({ ...announcementForm, textBn: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  {t('ঘোষণা বার্তা (ইংরেজি)', 'Announcement Text (English)')}
                </label>
                <input
                  type="text"
                  value={announcementForm.textEn}
                  onChange={(e) =>
                    setAnnouncementForm({ ...announcementForm, textEn: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  {t('লিংক (ঐচ্ছিক, যেমন #apply)', 'Link Target (Optional, e.g. #apply)')}
                </label>
                <input
                  type="text"
                  value={announcementForm.linkUrl}
                  onChange={(e) =>
                    setAnnouncementForm({ ...announcementForm, linkUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  {t('ব্যানার রঙের ধরন', 'Banner Style')}
                </label>
                <select
                  value={announcementForm.style || 'accent'}
                  onChange={(e) =>
                    setAnnouncementForm({
                      ...announcementForm,
                      style: e.target.value as typeof announcementForm.style,
                    })
                  }
                  className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-xs font-bold"
                >
                  <option value="accent">{t('অ্যাকসেন্ট (Accent)', 'Accent')}</option>
                  <option value="primary">{t('প্রাইমারি (Primary)', 'Primary')}</option>
                  <option value="warning">{t('সতর্কতা (Warning)', 'Warning')}</option>
                  <option value="success">{t('সবুজ (Success)', 'Success')}</option>
                  <option value="neutral">{t('নিরপেক্ষ (Neutral)', 'Neutral')}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end border-t border-line/20">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-on-primary font-bold text-sm rounded-[var(--radius-btn)] shadow-md flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? t('সংরক্ষণ হচ্ছে...', 'Saving Identity...') : t('স্কুল পরিচিতি সংরক্ষণ করুন', 'Save School Identity')}</span>
          </button>
        </div>
      </form>

      {/* Developer-Only Ownership Lock & Checklist Grid
          BUSINESS PROTECTION: Normal school Owners (Principals) MUST NOT see any
          ownership transfer form or inputs once handed over. Only Developer accounts
          (`isDeveloper === true`) see the ownership assignment & lock controls. */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {isDeveloper && (
          <form
            onSubmit={handleTransferOwnership}
            className="lg:col-span-6 bg-surface-card rounded-[var(--radius-card)] p-6 sm:p-7 border border-danger/35 shadow-xs space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-[var(--radius-btn)] bg-danger-soft text-danger flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg text-ink">
                  {t('ডেভেলপার ওনারশিপ কন্ট্রোল ও লক (Developer Only)', 'Developer Ownership Transfer & Lock')}
                </h3>
                <p className="text-xs text-ink-muted mt-0.5 leading-[1.7]">
                  {t(
                    'শুধুমাত্র অনুমোদিত ডেভেলপার অ্যাকাউন্ট থেকে প্রথমবার বা জরুরি প্রয়োজনে অধ্যক্ষের Gmail নির্ধারণ করা যাবে। অধ্যক্ষ নির্ধারিত হলে ownershipLocked: true সক্রিয় হয়।',
                    'Restricted strictly to developer accounts. Assigning a school Principal sets ownershipLocked: true so the Principal cannot transfer ownership to anyone else.'
                  )}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-[var(--radius-btn)] bg-surface-2 border border-line/25 text-xs flex flex-wrap items-center justify-between gap-2">
              <span className="text-ink-muted font-semibold">{t('বর্তমান সক্রিয় Owner:', 'Current Active Owner:')}</span>
              <span className="font-mono font-bold text-primary-700 dark:text-primary-300">{effectiveOwnerEmail}</span>
            </div>

            <div className="p-3 rounded-[var(--radius-btn)] bg-surface-2 border border-line/25 text-xs flex flex-wrap items-center justify-between gap-2">
              <span className="text-ink-muted font-semibold">{t('ওনারশিপ লক স্ট্যাটাস:', 'Ownership Lock State:')}</span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                  ownershipLocked
                    ? 'bg-success-soft text-on-success-soft'
                    : 'bg-warning-soft text-on-warning-soft'
                }`}
              >
                {ownershipLocked ? 'ownershipLocked: true (LOCKED)' : 'ownershipLocked: false (UNLOCKED)'}
              </span>
            </div>

            <div className="p-3 rounded-[var(--radius-btn)] bg-warning-soft text-on-warning-soft border border-warning/30 text-xs flex items-start gap-2 leading-[1.7]">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {t(
                  'সতর্কতা: নতুন অধ্যক্ষের Gmail সেট করলে তিনি স্কুলের একমাত্র Owner হবেন এবং তার প্যানেল থেকে মালিকানা হস্তান্তর সম্পূর্ণ লুকানো থাকবে।',
                  'Note: Assigning a Principal Gmail grants them single Owner control with ownershipLocked=true; they cannot transfer ownership further.'
                )}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  {t('নতুন অধ্যক্ষ / Owner-এর Gmail ঠিকানা *', 'Principal / Owner Gmail Address *')}
                </label>
                <input
                  type="email"
                  required
                  value={newOwnerEmail}
                  onChange={(e) => setNewOwnerEmail(e.target.value)}
                  placeholder="principal.school@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm font-mono focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
                />
                {trimmedNewOwner && !notSameOwner && (
                  <p className="text-[11px] text-danger mt-1 font-semibold">
                    {t('বর্তমান Owner-এর ইমেইল থেকে ভিন্ন একটি Gmail দিন।', 'Must differ from current owner Gmail.')}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  {t('নিশ্চিতকরণ: নিচে "TRANSFER" অথবা বিদ্যালয়ের নাম লিখুন *', 'Confirmation: Type "TRANSFER" or School Name *')}
                </label>
                <input
                  type="text"
                  required
                  value={confirmPhrase}
                  onChange={(e) => setConfirmPhrase(e.target.value)}
                  placeholder="TRANSFER"
                  className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm font-mono focus:border-danger focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!canTransfer}
              className="w-full py-3 px-5 rounded-[var(--radius-btn)] bg-danger hover:opacity-90 text-on-danger font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-40"
            >
              {transferring ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              <span>
                {transferring
                  ? t('হস্তান্তর ও লক সম্পন্ন হচ্ছে...', 'Assigning & Locking Ownership...')
                  : t('অধ্যক্ষকে মালিকানা প্রদান ও লক করুন', 'Assign Owner & Lock Ownership')}
              </span>
            </button>
          </form>
        )}

        {/* Read-Only Readiness Checklist */}
        <div
          className={`${
            isDeveloper ? 'lg:col-span-6' : 'lg:col-span-12'
          } bg-surface-card rounded-[var(--radius-card)] p-6 sm:p-7 border border-line/35 shadow-xs space-y-4`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line/20 pb-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-[var(--radius-btn)] bg-accent-soft text-on-accent-soft flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg text-ink">
                  {t('বিদ্যালয় ওয়েবসাইট সেটআপ চেকলিস্ট', 'School Launch Readiness Checklist')}
                </h3>
                <p className="text-xs text-ink-muted mt-0.5 leading-[1.7]">
                  {t(
                    'বিদ্যালয়ের ওয়েবসাইট ও অনলাইন ভর্তি সচল রাখার প্রয়োজনীয় ধাপসমূহ।',
                    'Launch readiness overview for school identity, fees, and public notices.'
                  )}
                </p>
              </div>
            </div>

            {!isDeveloper && (
              <div className="px-3 py-1.5 rounded-[var(--radius-btn)] bg-surface-2 border border-line/30 text-[11px] font-semibold text-ink-muted flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-success" />
                <span>
                  {t('লাইসেন্সকৃত অ্যাকাউন্ট:', 'Licensed Owner:')}{' '}
                  <strong className="font-mono text-ink">{effectiveOwnerEmail}</strong>
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            {checklistItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-[var(--radius-btn)] bg-surface-2 border border-line/25 flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  {item.done ? (
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-ink-muted shrink-0 mt-0.5" />
                  )}
                  <span className="text-xs font-semibold text-ink leading-[1.6]">
                    {lang === 'bn' ? item.titleBn : item.titleEn}
                  </span>
                </div>

                {isOwner && item.actionTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab(item.actionTab!)}
                    className="px-2.5 py-1 rounded-md bg-surface-card border border-line/35 text-[11px] font-bold text-primary-700 dark:text-primary-300 hover:border-primary-600 shrink-0 transition-colors"
                  >
                    {item.actionLabel}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
