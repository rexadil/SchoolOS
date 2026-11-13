import React, { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { compressImage } from '../../utils/imageCompressor';
import {
  ALL_THEME_IDS,
  AppearanceSettings,
  DEFAULT_APPEARANCE,
  DEFAULT_SECTION_ORDER,
  FONT_PAIRS,
  FontPairId,
  HeroVariant,
  HomeSectionKey,
  RADIUS_SCALES,
  RadiusScale,
  THEME_PACKS,
  ThemeMode,
  generateAccessibleBrandPalette,
} from '../../theme/themes';
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Save,
  Sparkles,
  Megaphone,
  Share2,
  Upload,
  Loader2,
  Image as ImageIcon,
  Type,
  Square,
  Layout,
  ShieldCheck,
  Video,
} from 'lucide-react';

interface AppearanceTabProps {
  onNotify: (text: string, type?: 'success' | 'error') => void;
}

const SECTION_LABELS: Record<HomeSectionKey, { bn: string; en: string }> = {
  hero: { bn: 'হিরো ব্যানার ও পরিচিতি', en: 'Hero Section' },
  stats: { bn: 'প্রতিষ্ঠানের অর্জন ও পরিসংখ্যান', en: 'Achievement Counters' },
  admissionBanner: { bn: 'ভর্তি বিজ্ঞপ্তি ও কাউন্টডাউন', en: 'Admission Countdown Banner' },
  journey: { bn: 'পাঠ্যক্রম ও শ্রেণি রোডম্যাপ', en: 'Curriculum Journey / Roadmap' },
  dailyLife: { bn: 'দৈনন্দিন সময়সূচি / কেন আমরা', en: 'Daily Routine / Why Us Stats' },
  virtualTour: { bn: 'ভার্চুয়াল ক্যাম্পাস ট্যুর ভিডিও', en: 'Virtual Campus Tour Video' },
  teachers: { bn: 'শিক্ষকমণ্ডলী ও প্রধান শিক্ষক বাণী', en: 'Faculty & Head Message' },
  testimonials: { bn: 'অভিভাবকদের অভিমত', en: 'Parent Testimonials' },
  gallery: { bn: 'ক্যাম্পাস ফটো গ্যালারি', en: 'Campus Photo Gallery' },
  contact: { bn: 'যোগাযোগ ও ক্যাম্পাস মানচিত্র', en: 'Contact & Campus Map' },
};

const HERO_VARIANTS: Array<{
  id: HeroVariant;
  name: { bn: string; en: string };
  desc: { bn: string; en: string };
}> = [
  {
    id: 'split',
    name: { bn: 'স্প্লিট হিরো (Split)', en: 'Split Hero' },
    desc: { bn: 'বামে শিরোনাম ও ডানে ক্যাম্পাসের বড় ছবি', en: 'Classic asymmetric headline left, campus photo right' },
  },
  {
    id: 'editorial',
    name: { bn: 'এডিটোরিয়াল ব্যানার (Editorial)', en: 'Editorial Centered' },
    desc: { bn: 'কেন্দ্রীয় শিরোনাম ও নিচে পূর্ণ প্রশস্তির ছবি', en: 'Centered typographic statement above wide campus showcase' },
  },
  {
    id: 'collegiate',
    name: { bn: 'কলেজিয়েট কার্ড (Collegiate)', en: 'Collegiate Showcase' },
    desc: { bn: 'প্রাতিষ্ঠানিক তথ্য কার্ড ও পরিচ্ছন্ন একাডেমিক ফ্রেম', en: 'Structured institutional profile card beside framed campus view' },
  },
];

export const AppearanceTab: React.FC<AppearanceTabProps> = ({ onNotify }) => {
  const { lang, t } = useLanguage();
  const { appearance, resolvedMode, saveAppearance, resetAppearance } = useTheme();
  const { schoolSettings, logActivity } = useSchoolData();

  const [draft, setDraft] = useState<AppearanceSettings>(appearance);
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>(resolvedMode);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  useEffect(() => {
    setDraft(appearance);
  }, [appearance]);

  const brandCheck = useMemo(
    () => generateAccessibleBrandPalette(draft.brandColor, previewMode),
    [draft.brandColor, previewMode]
  );

  const previewTokens = useMemo(() => {
    const base = THEME_PACKS[draft.theme][previewMode];
    if (draft.useCustomBrandColor && brandCheck.valid && brandCheck.tokens) {
      return {
        ...base,
        ...brandCheck.tokens,
      };
    }
    return base;
  }, [draft.theme, draft.useCustomBrandColor, previewMode, brandCheck]);

  const canSave = !draft.useCustomBrandColor || brandCheck.valid;

  const handleSave = async () => {
    if (!canSave) {
      onNotify(
        brandCheck.error?.[lang] ||
          t('ব্র্যান্ড কালার WCAG AA মানদণ্ড পূরণ করেনি।', 'Brand color failed WCAG AA contrast check.'),
        'error'
      );
      return;
    }

    setSaving(true);
    try {
      await saveAppearance(draft);
      await logActivity(
        'থিম ও দৃশ্যমানতা পরিবর্তন',
        `থিম: ${draft.theme}, ডিফল্ট মোড: ${draft.defaultMode}, ফন্ট: ${draft.fontPair}, হিরো: ${draft.heroVariant}`
      );
      onNotify(
        t('দৃশ্যমানতা ও থিম সেটিংস সফলভাবে সংরক্ষিত হয়েছে!', 'Appearance & theme settings saved successfully!')
      );
    } catch (err) {
      console.error(err);
      onNotify(t('সেটিংস সংরক্ষণে সমস্যা হয়েছে।', 'Failed to save appearance settings.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      await resetAppearance();
      setDraft({ ...DEFAULT_APPEARANCE });
      await logActivity('থিম রিসেট', 'দৃশ্যমানতা ও থিম সেটিংস ডিফল্ট অবস্থায় ফিরিয়ে আনা হয়েছে।');
      onNotify(t('ডিফল্ট থিম ও লেআউট পুনরুদ্ধার করা হয়েছে।', 'Appearance reset to defaults.'));
    } catch (err) {
      console.error(err);
      onNotify(t('রিসেট করা যায়নি।', 'Failed to reset appearance.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadAsset = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'logoUrl' | 'faviconUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      onNotify(t('ফাইলের আকার ১২ মেগাবাইটের বেশি হতে পারবে না।', 'File exceeds 12MB limit.'), 'error');
      return;
    }

    const setBusy = target === 'logoUrl' ? setUploadingLogo : setUploadingFavicon;
    setBusy(true);
    try {
      const compressed = await compressImage(file, {
        maxDimension: target === 'logoUrl' ? 480 : 192,
        maxBytes: target === 'logoUrl' ? 120 * 1024 : 60 * 1024,
      });
      setDraft((prev) => ({ ...prev, [target]: compressed }));
      onNotify(
        target === 'logoUrl'
          ? t('লোগো অপ্টিমাইজ হয়েছে। পরিবর্তন সংরক্ষণ করুন।', 'Logo optimized. Click Save Changes.')
          : t('ফ্যাভিকন অপ্টিমাইজ হয়েছে। পরিবর্তন সংরক্ষণ করুন।', 'Favicon optimized. Click Save Changes.')
      );
    } catch (err) {
      console.error(err);
      onNotify(t('ছবি প্রসেস করা যায়নি।', 'Failed to process image.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= draft.sectionOrder.length) return;
    const next = [...draft.sectionOrder];
    const [moved] = next.splice(index, 1);
    next.splice(targetIdx, 0, moved);
    setDraft((prev) => ({ ...prev, sectionOrder: next }));
  };

  const toggleSectionVisibility = (key: HomeSectionKey) => {
    setDraft((prev) => {
      const isHidden = prev.hiddenSections.includes(key);
      return {
        ...prev,
        hiddenSections: isHidden
          ? prev.hiddenSections.filter((s) => s !== key)
          : [...prev.hiddenSections, key],
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Top Action Bar */}
      <div className="bg-surface-card rounded-[var(--radius-card)] p-6 sm:p-8 border border-line/35 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">
            <Palette className="w-4 h-4" />
            <span>{t('থিম ও দৃশ্যমানতা নিয়ন্ত্রণ (Owner Only)', 'Theme & Appearance Engine (Owner Only)')}</span>
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-ink">
            {t('সাইটের রঙ, ফন্ট, হিরো ও সেকশন সাজান', 'Customize Colors, Fonts, Hero & Homepage Layout')}
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            {t(
              'সব পরিবর্তন WCAG AA কনট্রাস্ট পরীক্ষিত এবং Firestore-এ সরাসরি সংরক্ষিত হয়। শ্রেণি, ফি বা ভর্তি তথ্যে কোনো প্রভাব ফেলে না।',
              'All themes pass WCAG AA contrast verification and sync via Firestore without modifying curriculum, fees, or admission records.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="px-4 py-2.5 rounded-[var(--radius-btn)] bg-surface-2 hover:bg-surface text-ink border border-line/40 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('ডিফল্ট রিসেট', 'Reset Defaults')}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !canSave}
            className="px-5 py-2.5 rounded-[var(--radius-btn)] bg-primary-600 hover:bg-primary-700 text-on-primary text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? t('সংরক্ষণ হচ্ছে...', 'Saving...') : t('পরিবর্তন সংরক্ষণ করুন', 'Save Appearance')}</span>
          </button>
        </div>
      </div>

      {/* Live Preview Panel */}
      <div className="bg-surface-card rounded-[var(--radius-card)] p-6 border border-line/35 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <h3 className="font-heading font-bold text-base text-ink">
              {t('লাইভ প্রিভিউ (সংরক্ষণের আগে দেখুন)', 'Live Theme & Typography Preview')}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-surface-2 rounded-[var(--radius-btn)] border border-line/30">
            <button
              type="button"
              onClick={() => setPreviewMode('light')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                previewMode === 'light'
                  ? 'bg-primary-600 text-on-primary'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>{t('লাইট', 'Light')}</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('dark')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                previewMode === 'dark'
                  ? 'bg-primary-600 text-on-primary'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>{t('ডার্ক', 'Dark')}</span>
            </button>
          </div>
        </div>

        {/* Rendered Preview Surface */}
        <div
          style={{
            backgroundColor: previewTokens.surface,
            color: previewTokens.ink,
            borderColor: previewTokens.line,
            borderRadius: RADIUS_SCALES[draft.radius].card,
            fontFamily: FONT_PAIRS[draft.fontPair].bodyFont,
          }}
          className="border overflow-hidden transition-all"
        >
          {draft.announcement.enabled && (
            <div
              style={{
                backgroundColor: previewTokens.accent,
                color: previewTokens.onAccent,
              }}
              className="px-4 py-1.5 text-center text-xs font-bold"
            >
              {lang === 'bn' ? draft.announcement.textBn : draft.announcement.textEn}
            </div>
          )}

          <div
            style={{
              backgroundColor: previewTokens.surface2,
              borderColor: previewTokens.line,
            }}
            className="px-5 py-3 border-b flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              {draft.logoUrl ? (
                <img
                  src={draft.logoUrl}
                  alt="Preview logo"
                  style={{ borderRadius: RADIUS_SCALES[draft.radius].btn }}
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <div
                  style={{
                    backgroundColor: previewTokens.primary600,
                    color: previewTokens.onPrimary,
                    borderRadius: RADIUS_SCALES[draft.radius].btn,
                  }}
                  className="w-8 h-8 flex items-center justify-center font-bold text-sm"
                >
                  {(lang === 'bn' ? schoolSettings.nameBn : schoolSettings.nameEn).charAt(0)}
                </div>
              )}
              <div>
                <div
                  style={{ fontFamily: FONT_PAIRS[draft.fontPair].headingFont }}
                  className="font-bold text-sm leading-tight"
                >
                  {lang === 'bn' ? schoolSettings.nameBn : schoolSettings.nameEn}
                </div>
                <div style={{ color: previewTokens.inkMuted }} className="text-[11px]">
                  {THEME_PACKS[draft.theme].name[lang]} · {draft.heroVariant.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                style={{
                  backgroundColor: previewTokens.accentSoft,
                  color: previewTokens.onAccentSoft,
                  borderRadius: RADIUS_SCALES[draft.radius].btn,
                }}
                className="px-2.5 py-1 text-[11px] font-bold"
              >
                {t('স্ট্যাটাস', 'Status')}
              </span>
              <span
                style={{
                  backgroundColor: previewTokens.primary600,
                  color: previewTokens.onPrimary,
                  borderRadius: RADIUS_SCALES[draft.radius].btn,
                }}
                className="px-3 py-1 text-[11px] font-bold"
              >
                {t('ভর্তি আবেদন', 'Apply Now')}
              </span>
            </div>
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-7 space-y-2">
              <span
                style={{
                  backgroundColor: previewTokens.successSoft,
                  color: previewTokens.onSuccessSoft,
                  borderRadius: RADIUS_SCALES[draft.radius].btn,
                }}
                className="inline-block px-2.5 py-0.5 text-[11px] font-bold"
              >
                {t('ভর্তি চলছে — WCAG AA পরীক্ষিত', 'Admissions Open — WCAG AA Verified')}
              </span>
              <h4
                style={{ fontFamily: FONT_PAIRS[draft.fontPair].headingFont }}
                className="text-lg sm:text-xl font-extrabold leading-snug"
              >
                {lang === 'bn' ? schoolSettings.heroTitleBn : schoolSettings.heroTitleEn}
              </h4>
              <p style={{ color: previewTokens.inkMuted }} className="text-xs leading-[1.7]">
                {t(
                  'যুক্তাক্ষর ও বাংলা পাঠযোগ্যতা: প্রতিটি শিক্ষার্থীর ভেতরের সম্ভাবনা ও বিজ্ঞানের আলোয় আলোকিত আগামী।',
                  'Bangla and English legibility preview across cards, buttons, and institutional badges.'
                )}
              </p>
            </div>
            <div className="md:col-span-5">
              <div
                style={{
                  backgroundColor: previewTokens.surfaceCard,
                  borderColor: previewTokens.line,
                  borderRadius: RADIUS_SCALES[draft.radius].card,
                }}
                className="p-4 border space-y-2"
              >
                <div className="text-xs font-bold">{t('নমুনা কার্ড ও স্ট্যাটাস চিপ', 'Sample Card & Status Badges')}</div>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                  <span
                    style={{
                      backgroundColor: previewTokens.successSoft,
                      color: previewTokens.onSuccessSoft,
                    }}
                    className="px-2 py-0.5 rounded-md"
                  >
                    Approved
                  </span>
                  <span
                    style={{
                      backgroundColor: previewTokens.warningSoft,
                      color: previewTokens.onWarningSoft,
                    }}
                    className="px-2 py-0.5 rounded-md"
                  >
                    Pending
                  </span>
                  <span
                    style={{
                      backgroundColor: previewTokens.dangerSoft,
                      color: previewTokens.onDangerSoft,
                    }}
                    className="px-2 py-0.5 rounded-md"
                  >
                    Closed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Theme Pack Selector (6 Packs) */}
      <div className="bg-surface-card rounded-[var(--radius-card)] p-6 sm:p-8 border border-line/35 shadow-xs space-y-4">
        <div>
          <h3 className="font-heading font-extrabold text-lg text-ink">
            {t('১. থিম প্যাক নির্বাচন করুন (৬টি থিম · লাইট ও ডার্ক)', '1. Choose Theme Pack (6 Packs · Light & Dark)')}
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">
            {t('প্রতিটি থিমে স্বতন্ত্র রঙ ও ডার্ক মোড রয়েছে।', 'Each theme pack includes curated light and dark color tokens.')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_THEME_IDS.map((id) => {
            const pack = THEME_PACKS[id];
            const isSelected = draft.theme === id;
            const lt = pack.light;
            const dk = pack.dark;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, theme: id }))}
                className={`text-left p-4 rounded-[var(--radius-card)] border-2 transition-all flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-primary-600 bg-primary-50/40 dark:bg-surface-2 shadow-sm'
                    : 'border-line/30 bg-surface hover:border-line/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-heading font-bold text-sm text-ink">{pack.name[lang]}</div>
                    <div className="text-[11px] text-ink-muted mt-0.5">{pack.tagline[lang]}</div>
                  </div>
                  {isSelected && (
                    <span className="w-6 h-6 rounded-full bg-primary-600 text-on-primary flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {/* Light & Dark Mini Swatch Bar */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-line/20">
                  <div
                    style={{ backgroundColor: lt.surface, borderColor: lt.line }}
                    className="p-2 rounded-lg border flex items-center gap-1.5"
                  >
                    <span style={{ backgroundColor: lt.primary600 }} className="w-4 h-4 rounded-full shrink-0" />
                    <span style={{ backgroundColor: lt.accent }} className="w-4 h-4 rounded-full shrink-0" />
                    <span style={{ color: lt.ink }} className="text-[10px] font-bold ml-auto">
                      {t('লাইট', 'Light')}
                    </span>
                  </div>
                  <div
                    style={{ backgroundColor: dk.surface, borderColor: dk.line }}
                    className="p-2 rounded-lg border flex items-center gap-1.5"
                  >
                    <span style={{ backgroundColor: dk.primary400 }} className="w-4 h-4 rounded-full shrink-0" />
                    <span style={{ backgroundColor: dk.accent }} className="w-4 h-4 rounded-full shrink-0" />
                    <span style={{ color: dk.ink }} className="text-[10px] font-bold ml-auto">
                      {t('ডার্ক', 'Dark')}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Mode Settings & Custom Brand Color */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Default Mode & Header Toggle */}
        <div className="bg-surface-card rounded-[var(--radius-card)] p-6 border border-line/35 shadow-xs space-y-4">
          <h3 className="font-heading font-extrabold text-base text-ink">
            {t('২. ডিফল্ট মোড ও টগল নিয়ন্ত্রণ', '2. Default Mode & Mode Switcher')}
          </h3>

          <div className="grid grid-cols-3 gap-2.5">
            {(
              [
                { id: 'light', label: t('লাইট', 'Light'), icon: <Sun className="w-4 h-4" /> },
                { id: 'dark', label: t('ডার্ক', 'Dark'), icon: <Moon className="w-4 h-4" /> },
                { id: 'system', label: t('সিস্টেম', 'System'), icon: <Monitor className="w-4 h-4" /> },
              ] as Array<{ id: ThemeMode; label: string; icon: React.ReactNode }>
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, defaultMode: opt.id }))}
                className={`p-3 rounded-[var(--radius-btn)] border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  draft.defaultMode === opt.id
                    ? 'bg-primary-600 text-on-primary border-primary-600 shadow-xs'
                    : 'bg-surface-2 text-ink border-line/30 hover:border-line/60'
                }`}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          <label className="flex items-center justify-between gap-3 p-3.5 rounded-[var(--radius-btn)] bg-surface-2 border border-line/25 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-ink block">
                {t('হেডারে দর্শকদের জন্য ডার্ক/লাইট বাটন দেখান', 'Show Light/Dark/System toggle in header')}
              </span>
              <span className="text-[11px] text-ink-muted">
                {t('বন্ধ রাখলে সব দর্শক নির্ধারিত ডিফল্ট মোড দেখবেন', 'When off, visitors only see your chosen default mode')}
              </span>
            </div>
            <input
              type="checkbox"
              checked={draft.showModeToggle}
              onChange={(e) => setDraft((prev) => ({ ...prev, showModeToggle: e.target.checked }))}
              className="w-4 h-4 accent-primary-600"
            />
          </label>
        </div>

        {/* Optional Single Brand Color Picker with WCAG AA Check */}
        <div className="bg-surface-card rounded-[var(--radius-card)] p-6 border border-line/35 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-heading font-extrabold text-base text-ink">
              {t('৩. কাস্টম ব্র্যান্ড কালার (ঐচ্ছিক)', '3. Custom Brand Color (Optional)')}
            </h3>
            <label className="inline-flex items-center gap-2 text-xs font-bold text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={draft.useCustomBrandColor}
                onChange={(e) => setDraft((prev) => ({ ...prev, useCustomBrandColor: e.target.checked }))}
                className="w-4 h-4 accent-primary-600"
              />
              <span>{t('সক্রিয় করুন', 'Enable Override')}</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="color"
              aria-label="Pick brand color"
              value={/^#[0-9A-Fa-f]{6}$/.test(draft.brandColor) ? draft.brandColor : DEFAULT_APPEARANCE.brandColor}
              onChange={(e) => setDraft((prev) => ({ ...prev, brandColor: e.target.value.toUpperCase() }))}
              className="w-12 h-11 rounded-[var(--radius-btn)] border border-line/40 cursor-pointer bg-surface p-1"
            />
            <input
              type="text"
              value={draft.brandColor}
              onChange={(e) => setDraft((prev) => ({ ...prev, brandColor: e.target.value.toUpperCase() }))}
              placeholder={DEFAULT_APPEARANCE.brandColor}
              className="flex-1 min-w-[140px] px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm font-mono uppercase focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
            />
            {brandCheck.valid ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-btn)] bg-success-soft text-on-success-soft text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>AA {brandCheck.selectedContrast}:1</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-btn)] bg-danger-soft text-on-danger-soft text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{t('কনট্রাস্ট কম', 'Low Contrast')}</span>
              </span>
            )}
          </div>

          {!brandCheck.valid && brandCheck.error && (
            <div className="p-3 rounded-[var(--radius-btn)] bg-danger-soft text-on-danger-soft text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{brandCheck.error[lang]}</span>
            </div>
          )}

          {brandCheck.valid && brandCheck.tokens && (
            <div className="flex items-center gap-1 pt-1">
              {[
                brandCheck.tokens.primary100,
                brandCheck.tokens.primary300,
                brandCheck.tokens.primary500,
                brandCheck.tokens.primary600,
                brandCheck.tokens.primary800,
              ].map((swatch, idx) => (
                <div
                  key={idx}
                  style={{ backgroundColor: swatch }}
                  className="h-5 flex-1 rounded-md border border-line/20"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Font Pairs, Corner Radius, Hero Variant */}
      <div className="bg-surface-card rounded-[var(--radius-card)] p-6 sm:p-8 border border-line/35 shadow-xs space-y-6">
        {/* Font Pairs */}
        <div className="space-y-3">
          <h3 className="font-heading font-extrabold text-base text-ink flex items-center gap-2">
            <Type className="w-4 h-4 text-primary-600" />
            <span>{t('৪. বাংলা ও ইংরেজি ফন্ট জুটি', '4. Typography Pair (Bangla-Safe)')}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(['heritage', 'modern', 'editorial'] as FontPairId[]).map((fid) => {
              const fp = FONT_PAIRS[fid];
              const active = draft.fontPair === fid;
              return (
                <button
                  key={fid}
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, fontPair: fid }))}
                  className={`p-4 rounded-[var(--radius-card)] border-2 text-left transition-all ${
                    active ? 'border-primary-600 bg-primary-50/40 dark:bg-surface-2' : 'border-line/30 bg-surface hover:border-line/60'
                  }`}
                >
                  <div className="text-xs font-bold text-primary-700 dark:text-primary-300">{fp.name[lang]}</div>
                  <div style={{ fontFamily: fp.headingFont }} className="text-base font-bold text-ink mt-1.5">
                    {t('আদর্শ বিদ্যাপীঠ — যুক্তাক্ষর ও শিরোনাম পরীক্ষা', 'Journey of Academic Light')}
                  </div>
                  <div style={{ fontFamily: fp.bodyFont }} className="text-xs text-ink-muted mt-1 leading-[1.7]">
                    {fp.description[lang]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Corner Radius & Hero Variant */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-line/20">
          {/* Corner Radius */}
          <div className="space-y-3">
            <h3 className="font-heading font-extrabold text-base text-ink flex items-center gap-2">
              <Square className="w-4 h-4 text-primary-600" />
              <span>{t('৫. কার্ড ও বাটনের কোণা (Corner Radius)', '5. Corner Radius Scale')}</span>
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {(['sharp', 'rounded', 'soft'] as RadiusScale[]).map((rid) => {
                const rm = RADIUS_SCALES[rid];
                const active = draft.radius === rid;
                return (
                  <button
                    key={rid}
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, radius: rid }))}
                    style={{ borderRadius: rm.card }}
                    className={`p-3.5 border-2 text-center transition-all ${
                      active ? 'border-primary-600 bg-primary-50/40 dark:bg-surface-2' : 'border-line/30 bg-surface'
                    }`}
                  >
                    <div
                      style={{ borderRadius: rm.btn }}
                      className="w-full h-8 bg-surface-2 border border-line/40 mb-2"
                    />
                    <span className="text-xs font-bold text-ink">{rm.name[lang]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hero Variant */}
          <div className="space-y-3">
            <h3 className="font-heading font-extrabold text-base text-ink flex items-center gap-2">
              <Layout className="w-4 h-4 text-primary-600" />
              <span>{t('৬. হিরো সেকশন লেআউট', '6. Hero Layout Variant')}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {HERO_VARIANTS.map((hv) => {
                const active = draft.heroVariant === hv.id;
                return (
                  <button
                    key={hv.id}
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, heroVariant: hv.id }))}
                    className={`p-3.5 rounded-[var(--radius-btn)] border-2 text-left transition-all ${
                      active ? 'border-primary-600 bg-primary-50/40 dark:bg-surface-2' : 'border-line/30 bg-surface'
                    }`}
                  >
                    <div className="text-xs font-bold text-ink">{hv.name[lang]}</div>
                    <div className="text-[11px] text-ink-muted mt-1 leading-snug">{hv.desc[lang]}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 7. Homepage Section Visibility & Order */}
      <div className="bg-surface-card rounded-[var(--radius-card)] p-6 sm:p-8 border border-line/35 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-heading font-extrabold text-base text-ink">
              {t('৭. হোমপেজ সেকশন ক্রম ও প্রদর্শন নিয়ন্ত্রণ', '7. Homepage Section Order & Visibility')}
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              {t('যেকোনো সেকশন লুকান বা উপর-নিচে সাজান।', 'Show/hide or reorder homepage sections dynamically.')}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setDraft((prev) => ({
                ...prev,
                sectionOrder: [...DEFAULT_SECTION_ORDER],
                hiddenSections: [],
              }))
            }
            className="px-3 py-1.5 rounded-[var(--radius-btn)] bg-surface-2 text-ink text-xs font-bold border border-line/30 hover:border-line/60"
          >
            {t('ক্রম রিসেট করুন', 'Reset Section Order')}
          </button>
        </div>

        <div className="space-y-2">
          {draft.sectionOrder.map((secKey, idx) => {
            const isHidden = draft.hiddenSections.includes(secKey);
            return (
              <div
                key={secKey}
                className={`p-3 rounded-[var(--radius-btn)] border flex items-center justify-between gap-3 ${
                  isHidden
                    ? 'bg-surface-2/60 border-line/20 opacity-70'
                    : 'bg-surface border-line/35'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-md bg-surface-2 text-ink-muted text-xs font-mono font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-ink truncate">
                    {SECTION_LABELS[secKey][lang]}
                  </span>
                  {isHidden && (
                    <span className="px-2 py-0.5 rounded-md bg-warning-soft text-on-warning-soft text-[10px] font-bold">
                      {t('লুকানো', 'Hidden')}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveSection(idx, -1)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg bg-surface-2 text-ink disabled:opacity-30 hover:bg-primary-100 hover:text-primary-900"
                    title={t('উপরে নিন', 'Move Up')}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(idx, 1)}
                    disabled={idx === draft.sectionOrder.length - 1}
                    className="p-1.5 rounded-lg bg-surface-2 text-ink disabled:opacity-30 hover:bg-primary-100 hover:text-primary-900"
                    title={t('নিচে নিন', 'Move Down')}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSectionVisibility(secKey)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                      isHidden
                        ? 'bg-surface-2 text-ink-muted hover:text-ink'
                        : 'bg-success-soft text-on-success-soft'
                    }`}
                  >
                    {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">
                      {isHidden ? t('দেখান', 'Show') : t('দৃশ্যমান', 'Visible')}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. Announcement Bar, Social Links & Branding Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Announcement Bar */}
        <div className="bg-surface-card rounded-[var(--radius-card)] p-6 border border-line/35 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-heading font-extrabold text-base text-ink flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-primary-600" />
              <span>{t('৮. টপ অ্যানাউন্সমেন্ট বার', '8. Top Announcement Bar')}</span>
            </h3>
            <label className="inline-flex items-center gap-2 text-xs font-bold text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={draft.announcement.enabled}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    announcement: { ...prev.announcement, enabled: e.target.checked },
                  }))
                }
                className="w-4 h-4 accent-primary-600"
              />
              <span>{t('চালু রাখুন', 'Enabled')}</span>
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('ঘোষণা (বাংলা)', 'Announcement Text (Bengali)')}
              </label>
              <input
                type="text"
                maxLength={240}
                value={draft.announcement.textBn}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    announcement: { ...prev.announcement, textBn: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-xs sm:text-sm focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('ঘোষণা (ইংরেজি)', 'Announcement Text (English)')}
              </label>
              <input
                type="text"
                maxLength={240}
                value={draft.announcement.textEn}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    announcement: { ...prev.announcement, textEn: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-xs sm:text-sm focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('লিংক ইউআরএল (ঐচ্ছিক)', 'Link URL (Optional)')}
              </label>
              <input
                type="text"
                maxLength={300}
                value={draft.announcement.linkUrl || ''}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    announcement: { ...prev.announcement, linkUrl: e.target.value },
                  }))
                }
                placeholder="#apply"
                className="w-full px-3.5 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-xs font-mono focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Social Links & Logo / Favicon */}
        <div className="bg-surface-card rounded-[var(--radius-card)] p-6 border border-line/35 shadow-xs space-y-5">
          <div className="space-y-3">
            <h3 className="font-heading font-extrabold text-base text-ink flex items-center gap-2">
              <Share2 className="w-4 h-4 text-primary-600" />
              <span>{t('৯. সোশ্যাল মিডিয়া লিংক (ফুটার)', '9. Social Media Links (Footer)')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(['facebook', 'youtube', 'instagram', 'website'] as const).map((platform) => (
                <div key={platform}>
                  <label className="block text-[11px] font-bold text-ink-muted uppercase mb-1">
                    {platform}
                  </label>
                  <input
                    type="text"
                    maxLength={300}
                    value={draft.socialLinks[platform] || ''}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, [platform]: e.target.value },
                      }))
                    }
                    placeholder={`https://${platform}.com/...`}
                    className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-xs focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-line/20 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Logo Upload */}
            <div className="p-3.5 rounded-[var(--radius-btn)] bg-surface-2 border border-line/25 space-y-2">
              <div className="text-xs font-bold text-ink">{t('লোগো (সর্বোচ্চ ৪৮০px)', 'Theme Logo (Max 480px)')}</div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-[var(--radius-btn)] bg-surface border border-line/30 flex items-center justify-center overflow-hidden shrink-0">
                  {draft.logoUrl ? (
                    <img src={draft.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-ink-muted" />
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary-600 text-on-primary text-[11px] font-bold">
                    {uploadingLogo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    <span>{t('আপলোড', 'Upload')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadAsset(e, 'logoUrl')}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                  </label>
                  {draft.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, logoUrl: '' }))}
                      className="px-2 py-1 rounded-lg bg-danger-soft text-on-danger-soft text-[11px] font-bold"
                    >
                      {t('মুছুন', 'Remove')}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Favicon Upload */}
            <div className="p-3.5 rounded-[var(--radius-btn)] bg-surface-2 border border-line/25 space-y-2">
              <div className="text-xs font-bold text-ink">{t('ফ্যাভিকন (সর্বোচ্চ ১৯২px)', 'Favicon (Max 192px)')}</div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-[var(--radius-btn)] bg-surface border border-line/30 flex items-center justify-center overflow-hidden shrink-0">
                  {draft.faviconUrl ? (
                    <img src={draft.faviconUrl} alt="Favicon" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-ink-muted" />
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary-600 text-on-primary text-[11px] font-bold">
                    {uploadingFavicon ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    <span>{t('আপলোড', 'Upload')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadAsset(e, 'faviconUrl')}
                      disabled={uploadingFavicon}
                      className="hidden"
                    />
                  </label>
                  {draft.faviconUrl && (
                    <button
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, faviconUrl: '' }))}
                      className="px-2 py-1 rounded-lg bg-danger-soft text-on-danger-soft text-[11px] font-bold"
                    >
                      {t('মুছুন', 'Remove')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 10. Campus Video & Virtual Tour URLs */}
      <div className="bg-surface-card rounded-[var(--radius-card)] p-6 sm:p-8 border border-line/35 shadow-xs space-y-4">
        <div>
          <h3 className="font-heading font-extrabold text-base text-ink flex items-center gap-2">
            <Video className="w-4 h-4 text-primary-600" />
            <span>{t('১০. ক্যাম্পাস ভিডিও ও ভার্চুয়াল ট্যুর (ঐচ্ছিক)', '10. Hero Video & Virtual Campus Tour (Optional)')}</span>
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">
            {t(
              'ইউটিউব, ভিমিও বা সরাসরি MP4 ভিডিও লিংক দিন। লিংক দিলে ক্লিক-টু-প্লে পপআপ ও সেকশন স্বয়ংক্রিয়ভাবে চালু হবে (ফাঁকা রাখলে লুকানো থাকবে)।',
              'Provide a YouTube, Vimeo, or direct MP4 URL. Sections appear automatically with click-to-play lazy loading when configured.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-ink mb-1">
              {t('হিরো প্লে-বাটন ভিডিও লিংক (Hero Video URL)', 'Hero Watch Video URL')}
            </label>
            <input
              type="url"
              maxLength={500}
              value={draft.heroVideoUrl || ''}
              onChange={(e) => setDraft((prev) => ({ ...prev, heroVideoUrl: e.target.value }))}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3.5 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-xs font-mono focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink mb-1">
              {t('ভার্চুয়াল ক্যাম্পাস ট্যুর ভিডিও লিংক (Virtual Tour URL)', 'Virtual Campus Tour Video URL')}
            </label>
            <input
              type="url"
              maxLength={500}
              value={draft.virtualTourUrl || ''}
              onChange={(e) => setDraft((prev) => ({ ...prev, virtualTourUrl: e.target.value }))}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3.5 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-xs font-mono focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
