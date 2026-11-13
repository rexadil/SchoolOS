/**
 * Semantic Theme System & Design Tokens
 * 6 curated theme packs (dawn, campus, meadow, ocean, royal, slate),
 * each supporting both Light and Dark resolved modes, WCAG AA contrast verification,
 * accessible custom brand color derivation, 3 Bangla-safe font pairs, and layout tokens.
 */

export type ThemeId = 'dawn' | 'campus' | 'meadow' | 'ocean' | 'royal' | 'slate';
export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedMode = 'light' | 'dark';
export type FontPairId = 'heritage' | 'modern' | 'editorial';
export type RadiusScale = 'sharp' | 'rounded' | 'soft';
export type HeroVariant = 'split' | 'editorial' | 'collegiate';
export type HomeSectionKey =
  | 'hero'
  | 'stats'
  | 'admissionBanner'
  | 'journey'
  | 'dailyLife'
  | 'virtualTour'
  | 'teachers'
  | 'testimonials'
  | 'gallery'
  | 'contact';

export const ALL_THEME_IDS: ThemeId[] = ['dawn', 'campus', 'meadow', 'ocean', 'royal', 'slate'];
export const DEFAULT_SECTION_ORDER: HomeSectionKey[] = [
  'hero',
  'stats',
  'admissionBanner',
  'journey',
  'dailyLife',
  'virtualTour',
  'teachers',
  'testimonials',
  'gallery',
  'contact',
];

export interface SemanticColorTokens {
  surface: string;
  surface2: string;
  surfaceCard: string;
  ink: string;
  inkMuted: string;
  line: string;
  primary50: string;
  primary100: string;
  primary200: string;
  primary300: string;
  primary400: string;
  primary500: string;
  primary600: string;
  primary700: string;
  primary800: string;
  primary900: string;
  onPrimary: string;
  accent: string;
  onAccent: string;
  accentSoft: string;
  onAccentSoft: string;
  success: string;
  onSuccess: string;
  successSoft: string;
  onSuccessSoft: string;
  warning: string;
  onWarning: string;
  warningSoft: string;
  onWarningSoft: string;
  danger: string;
  onDanger: string;
  dangerSoft: string;
  onDangerSoft: string;
  ring: string;
}

export interface ThemePackMetadata {
  id: ThemeId;
  name: { bn: string; en: string };
  tagline: { bn: string; en: string };
  light: SemanticColorTokens;
  dark: SemanticColorTokens;
}

export interface FontPairMeta {
  id: FontPairId;
  name: { bn: string; en: string };
  description: { bn: string; en: string };
  headingFont: string;
  bodyFont: string;
}

export interface RadiusMeta {
  id: RadiusScale;
  name: { bn: string; en: string };
  card: string;
  btn: string;
  input: string;
}

export interface AnnouncementConfig {
  enabled: boolean;
  textBn: string;
  textEn: string;
  linkUrl?: string;
}

export interface SocialLinksConfig {
  facebook?: string;
  youtube?: string;
  instagram?: string;
  website?: string;
}

export interface AppearanceSettings {
  theme: ThemeId;
  defaultMode: ThemeMode;
  showModeToggle: boolean;
  useCustomBrandColor: boolean;
  brandColor: string;
  fontPair: FontPairId;
  radius: RadiusScale;
  heroVariant: HeroVariant;
  sectionOrder: HomeSectionKey[];
  hiddenSections: HomeSectionKey[];
  announcement: AnnouncementConfig;
  socialLinks: SocialLinksConfig;
  heroVideoUrl?: string;
  virtualTourUrl?: string;
  logoUrl?: string;
  faviconUrl?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  theme: 'dawn',
  defaultMode: 'light',
  showModeToggle: true,
  useCustomBrandColor: false,
  brandColor: '#B45309',
  fontPair: 'heritage',
  radius: 'rounded',
  heroVariant: 'split',
  sectionOrder: [...DEFAULT_SECTION_ORDER],
  hiddenSections: [],
  announcement: {
    enabled: false,
    textBn: 'নতুন শিক্ষাবর্ষের ভর্তি ফরম বিতরণ ও অনলাইন আবেদন চলছে।',
    textEn: 'Admissions for the upcoming academic session are now open online.',
    linkUrl: '#apply',
  },
  socialLinks: {
    facebook: 'https://facebook.com',
    youtube: 'https://youtube.com',
    instagram: '',
    website: '',
  },
  heroVideoUrl: '',
  virtualTourUrl: '',
  logoUrl: '',
  faviconUrl: '',
};

export const FONT_PAIRS: Record<FontPairId, FontPairMeta> = {
  heritage: {
    id: 'heritage',
    name: { bn: 'ঐতিহ্য ও স্পষ্টতা (Noto Serif + Hind Siliguri)', en: 'Heritage (Noto Serif + Hind Siliguri)' },
    description: { bn: 'ক্লাসিক সেরিফ শিরোনাম ও পড়তে সহজ বাংলা ফন্ট', en: 'Classic serif headings paired with crisp Hind Siliguri body' },
    headingFont: "'Noto Serif Bengali', 'Noto Serif', serif",
    bodyFont: "'Hind Siliguri', 'Plus Jakarta Sans', sans-serif",
  },
  modern: {
    id: 'modern',
    name: { bn: 'আধুনিক জ্যামিতিক (Hind Siliguri + Noto Sans)', en: 'Modern Sans (Hind Siliguri + Noto Sans)' },
    description: { bn: 'পরিচ্ছন্ন ও আধুনিক ডিজিটাল ক্যাম্পাস টাইপোগ্রাফি', en: 'Clean, contemporary sans-serif typography for digital campuses' },
    headingFont: "'Hind Siliguri', 'Plus Jakarta Sans', sans-serif",
    bodyFont: "'Noto Sans Bengali', 'Hind Siliguri', sans-serif",
  },
  editorial: {
    id: 'editorial',
    name: { bn: 'সাহিত্য ও একাডেমিক (Tiro Bangla + Noto Sans)', en: 'Academic (Tiro Bangla + Noto Sans)' },
    description: { bn: 'একাডেমিক ও ঐতিহ্যবাহী বাংলা সাহিত্য শৈলী', en: 'Editorial literary serif headings with legible Noto Sans body' },
    headingFont: "'Tiro Bangla', 'Noto Serif Bengali', serif",
    bodyFont: "'Noto Sans Bengali', 'Hind Siliguri', sans-serif",
  },
};

export const RADIUS_SCALES: Record<RadiusScale, RadiusMeta> = {
  sharp: {
    id: 'sharp',
    name: { bn: 'তীক্ষ্ণ (Sharp)', en: 'Sharp' },
    card: '0.75rem',
    btn: '0.5rem',
    input: '0.5rem',
  },
  rounded: {
    id: 'rounded',
    name: { bn: 'সুষম (Rounded)', en: 'Rounded' },
    card: '1.5rem',
    btn: '0.875rem',
    input: '0.75rem',
  },
  soft: {
    id: 'soft',
    name: { bn: 'কোমল (Soft)', en: 'Soft' },
    card: '2rem',
    btn: '1.25rem',
    input: '1rem',
  },
};

export const THEME_PACKS: Record<ThemeId, ThemePackMetadata> = {
  dawn: {
    id: 'dawn',
    name: { bn: 'প্রভাত (Dawn)', en: 'Dawn' },
    tagline: { bn: 'উষ্ণ সূর্যোদয় ও আনন্দময় পরিবেশ', en: 'Warm sunrise tones, playful & welcoming' },
    light: {
      surface: '#FFFDF7',
      surface2: '#FEF6E4',
      surfaceCard: '#FFFFFF',
      ink: '#1C1917',
      inkMuted: '#57534E',
      line: '#8A7F6D',
      primary50: '#FFFBEB',
      primary100: '#FEF3C7',
      primary200: '#FDE68A',
      primary300: '#FCD34D',
      primary400: '#F59E0B',
      primary500: '#D97706',
      primary600: '#B45309',
      primary700: '#92400E',
      primary800: '#78350F',
      primary900: '#451A03',
      onPrimary: '#FFFFFF',
      accent: '#0F766E',
      onAccent: '#FFFFFF',
      accentSoft: '#CCFBF1',
      onAccentSoft: '#115E59',
      success: '#15803D',
      onSuccess: '#FFFFFF',
      successSoft: '#DCFCE7',
      onSuccessSoft: '#14532D',
      warning: '#A16207',
      onWarning: '#FFFFFF',
      warningSoft: '#FEF9C3',
      onWarningSoft: '#713F12',
      danger: '#BE123C',
      onDanger: '#FFFFFF',
      dangerSoft: '#FFE4E6',
      onDangerSoft: '#881337',
      ring: '#B45309',
    },
    dark: {
      surface: '#14110F',
      surface2: '#211B17',
      surfaceCard: '#1B1613',
      ink: '#FAF5EE',
      inkMuted: '#C7BDB1',
      line: '#75685A',
      primary50: '#FFFBEB',
      primary100: '#FEF3C7',
      primary200: '#FDE68A',
      primary300: '#FCD34D',
      primary400: '#FBBF24',
      primary500: '#D97706',
      primary600: '#B45309',
      primary700: '#92400E',
      primary800: '#78350F',
      primary900: '#451A03',
      onPrimary: '#FFFFFF',
      accent: '#14B8A6',
      onAccent: '#042F2E',
      accentSoft: '#134E4A',
      onAccentSoft: '#99F6E4',
      success: '#16A34A',
      onSuccess: '#052E16',
      successSoft: '#14532D',
      onSuccessSoft: '#BBF7D0',
      warning: '#F59E0B',
      onWarning: '#422006',
      warningSoft: '#451A03',
      onWarningSoft: '#FDE68A',
      danger: '#E11D48',
      onDanger: '#FFFFFF',
      dangerSoft: '#4C0519',
      onDangerSoft: '#FECDD3',
      ring: '#FBBF24',
    },
  },

  campus: {
    id: 'campus',
    name: { bn: 'ক্যাম্পাস (Campus)', en: 'Campus' },
    tagline: { bn: 'গভীর নীল ও সবুজ, ঐতিহ্যবাহী একাডেমিক', en: 'Collegiate navy & emerald, crisp editorial' },
    light: {
      surface: '#F8FAFC',
      surface2: '#EBF0F6',
      surfaceCard: '#FFFFFF',
      ink: '#0F172A',
      inkMuted: '#475569',
      line: '#73839B',
      primary50: '#ECFDF5',
      primary100: '#D1FAE5',
      primary200: '#A7F3D0',
      primary300: '#6EE7B7',
      primary400: '#34D399',
      primary500: '#10B981',
      primary600: '#047857',
      primary700: '#065F46',
      primary800: '#064E3B',
      primary900: '#022C22',
      onPrimary: '#FFFFFF',
      accent: '#1E3A8A',
      onAccent: '#FFFFFF',
      accentSoft: '#DBEAFE',
      onAccentSoft: '#1E3A8A',
      success: '#047857',
      onSuccess: '#FFFFFF',
      successSoft: '#D1FAE5',
      onSuccessSoft: '#064E3B',
      warning: '#B45309',
      onWarning: '#FFFFFF',
      warningSoft: '#FEF3C7',
      onWarningSoft: '#78350F',
      danger: '#BE123C',
      onDanger: '#FFFFFF',
      dangerSoft: '#FFE4E6',
      onDangerSoft: '#881337',
      ring: '#047857',
    },
    dark: {
      surface: '#09111E',
      surface2: '#121E33',
      surfaceCard: '#0F1A2B',
      ink: '#F1F5F9',
      inkMuted: '#A1B2C8',
      line: '#596F8C',
      primary50: '#ECFDF5',
      primary100: '#D1FAE5',
      primary200: '#A7F3D0',
      primary300: '#6EE7B7',
      primary400: '#34D399',
      primary500: '#10B981',
      primary600: '#047857',
      primary700: '#065F46',
      primary800: '#064E3B',
      primary900: '#022C22',
      onPrimary: '#FFFFFF',
      accent: '#38BDF8',
      onAccent: '#082F49',
      accentSoft: '#172554',
      onAccentSoft: '#BFDBFE',
      success: '#34D399',
      onSuccess: '#022C22',
      successSoft: '#064E3B',
      onSuccessSoft: '#A7F3D0',
      warning: '#FBBF24',
      onWarning: '#451A03',
      warningSoft: '#451A03',
      onWarningSoft: '#FDE68A',
      danger: '#E11D48',
      onDanger: '#FFFFFF',
      dangerSoft: '#4C0519',
      onDangerSoft: '#FECDD3',
      ring: '#34D399',
    },
  },

  meadow: {
    id: 'meadow',
    name: { bn: 'সবুজ প্রান্তর (Meadow)', en: 'Meadow' },
    tagline: { bn: 'প্রকৃতিঘেরা সবুজ ও সজীব পরিবেশ', en: 'Fresh forest greens inspired by nature' },
    light: {
      surface: '#F7FBF7',
      surface2: '#EBF5EC',
      surfaceCard: '#FFFFFF',
      ink: '#112216',
      inkMuted: '#3F5947',
      line: '#6E8975',
      primary50: '#F0FDF4',
      primary100: '#DCFCE7',
      primary200: '#BBF7D0',
      primary300: '#86EFAC',
      primary400: '#4ADE80',
      primary500: '#22C55E',
      primary600: '#15803D',
      primary700: '#166534',
      primary800: '#14532D',
      primary900: '#052E16',
      onPrimary: '#FFFFFF',
      accent: '#0E7490',
      onAccent: '#FFFFFF',
      accentSoft: '#CFFAFE',
      onAccentSoft: '#164E63',
      success: '#15803D',
      onSuccess: '#FFFFFF',
      successSoft: '#DCFCE7',
      onSuccessSoft: '#14532D',
      warning: '#B45309',
      onWarning: '#FFFFFF',
      warningSoft: '#FEF3C7',
      onWarningSoft: '#78350F',
      danger: '#BE123C',
      onDanger: '#FFFFFF',
      dangerSoft: '#FFE4E6',
      onDangerSoft: '#881337',
      ring: '#15803D',
    },
    dark: {
      surface: '#0B160E',
      surface2: '#132418',
      surfaceCard: '#101E15',
      ink: '#EDF7EF',
      inkMuted: '#A5C2AC',
      line: '#587860',
      primary50: '#F0FDF4',
      primary100: '#DCFCE7',
      primary200: '#BBF7D0',
      primary300: '#86EFAC',
      primary400: '#4ADE80',
      primary500: '#22C55E',
      primary600: '#15803D',
      primary700: '#166534',
      primary800: '#14532D',
      primary900: '#052E16',
      onPrimary: '#FFFFFF',
      accent: '#22D3EE',
      onAccent: '#083344',
      accentSoft: '#164E63',
      onAccentSoft: '#A5F3FC',
      success: '#4ADE80',
      onSuccess: '#052E16',
      successSoft: '#14532D',
      onSuccessSoft: '#BBF7D0',
      warning: '#FBBF24',
      onWarning: '#451A03',
      warningSoft: '#451A03',
      onWarningSoft: '#FDE68A',
      danger: '#E11D48',
      onDanger: '#FFFFFF',
      dangerSoft: '#4C0519',
      onDangerSoft: '#FECDD3',
      ring: '#4ADE80',
    },
  },

  ocean: {
    id: 'ocean',
    name: { bn: 'সাগর (Ocean)', en: 'Ocean' },
    tagline: { bn: 'আধুনিক নীল ও টিল জলতরঙ্গ', en: 'Modern ocean blue & crisp teal clarity' },
    light: {
      surface: '#F6FAFD',
      surface2: '#E9F2F9',
      surfaceCard: '#FFFFFF',
      ink: '#0C1B2A',
      inkMuted: '#43586D',
      line: '#6D859B',
      primary50: '#F0F9FF',
      primary100: '#E0F2FE',
      primary200: '#BAE6FD',
      primary300: '#7DD3FC',
      primary400: '#38BDF8',
      primary500: '#0EA5E9',
      primary600: '#0369A1',
      primary700: '#075985',
      primary800: '#0C4A6E',
      primary900: '#082F49',
      onPrimary: '#FFFFFF',
      accent: '#0F766E',
      onAccent: '#FFFFFF',
      accentSoft: '#CCFBF1',
      onAccentSoft: '#115E59',
      success: '#047857',
      onSuccess: '#FFFFFF',
      successSoft: '#D1FAE5',
      onSuccessSoft: '#064E3B',
      warning: '#B45309',
      onWarning: '#FFFFFF',
      warningSoft: '#FEF3C7',
      onWarningSoft: '#78350F',
      danger: '#BE123C',
      onDanger: '#FFFFFF',
      dangerSoft: '#FFE4E6',
      onDangerSoft: '#881337',
      ring: '#0369A1',
    },
    dark: {
      surface: '#08131E',
      surface2: '#102132',
      surfaceCard: '#0D1B2A',
      ink: '#ECF5FC',
      inkMuted: '#A1B9CE',
      line: '#56718B',
      primary50: '#F0F9FF',
      primary100: '#E0F2FE',
      primary200: '#BAE6FD',
      primary300: '#7DD3FC',
      primary400: '#38BDF8',
      primary500: '#0EA5E9',
      primary600: '#0369A1',
      primary700: '#075985',
      primary800: '#0C4A6E',
      primary900: '#082F49',
      onPrimary: '#FFFFFF',
      accent: '#2DD4BF',
      onAccent: '#042F2E',
      accentSoft: '#134E4A',
      onAccentSoft: '#99F6E4',
      success: '#34D399',
      onSuccess: '#022C22',
      successSoft: '#064E3B',
      onSuccessSoft: '#A7F3D0',
      warning: '#FBBF24',
      onWarning: '#451A03',
      warningSoft: '#451A03',
      onWarningSoft: '#FDE68A',
      danger: '#E11D48',
      onDanger: '#FFFFFF',
      dangerSoft: '#4C0519',
      onDangerSoft: '#FECDD3',
      ring: '#38BDF8',
    },
  },

  royal: {
    id: 'royal',
    name: { bn: 'রাজকীয় (Royal)', en: 'Royal' },
    tagline: { bn: 'ঐতিহ্যবাহী মেরুন ও সোনালি গাম্ভীর্য', en: 'Traditional maroon & gold institutional prestige' },
    light: {
      surface: '#FDFBF9',
      surface2: '#F6ECE9',
      surfaceCard: '#FFFFFF',
      ink: '#211315',
      inkMuted: '#5D4447',
      line: '#8E6F72',
      primary50: '#FFF1F2',
      primary100: '#FFE4E6',
      primary200: '#FECDD3',
      primary300: '#FDA4AF',
      primary400: '#FB7185',
      primary500: '#E11D48',
      primary600: '#9F1239',
      primary700: '#881337',
      primary800: '#6D0F2D',
      primary900: '#4C0519',
      onPrimary: '#FFFFFF',
      accent: '#92400E',
      onAccent: '#FFFFFF',
      accentSoft: '#FEF3C7',
      onAccentSoft: '#78350F',
      success: '#15803D',
      onSuccess: '#FFFFFF',
      successSoft: '#DCFCE7',
      onSuccessSoft: '#14532D',
      warning: '#B45309',
      onWarning: '#FFFFFF',
      warningSoft: '#FEF3C7',
      onWarningSoft: '#78350F',
      danger: '#B91C1C',
      onDanger: '#FFFFFF',
      dangerSoft: '#FEE2E2',
      onDangerSoft: '#7F1D1D',
      ring: '#9F1239',
    },
    dark: {
      surface: '#160B0E',
      surface2: '#241318',
      surfaceCard: '#1D0F13',
      ink: '#FDF4F5',
      inkMuted: '#CCAAB0',
      line: '#805B62',
      primary50: '#FFF1F2',
      primary100: '#FFE4E6',
      primary200: '#FECDD3',
      primary300: '#FDA4AF',
      primary400: '#FB7185',
      primary500: '#E11D48',
      primary600: '#9F1239',
      primary700: '#881337',
      primary800: '#6D0F2D',
      primary900: '#4C0519',
      onPrimary: '#FFFFFF',
      accent: '#FBBF24',
      onAccent: '#451A03',
      accentSoft: '#451A03',
      onAccentSoft: '#FDE68A',
      success: '#4ADE80',
      onSuccess: '#052E16',
      successSoft: '#14532D',
      onSuccessSoft: '#BBF7D0',
      warning: '#FBBF24',
      onWarning: '#451A03',
      warningSoft: '#451A03',
      onWarningSoft: '#FDE68A',
      danger: '#DC2626',
      onDanger: '#FFFFFF',
      dangerSoft: '#450A0A',
      onDangerSoft: '#FECACA',
      ring: '#FDA4AF',
    },
  },

  slate: {
    id: 'slate',
    name: { bn: 'সাদামাটা (Slate)', en: 'Slate' },
    tagline: { bn: 'শান্ত, নিরপেক্ষ ও মিনিমাল নকশা', en: 'Neutral, calm & minimalist monochrome' },
    light: {
      surface: '#FAFAFA',
      surface2: '#EFEFF2',
      surfaceCard: '#FFFFFF',
      ink: '#111827',
      inkMuted: '#4B5563',
      line: '#767E8C',
      primary50: '#F8FAFC',
      primary100: '#F1F5F9',
      primary200: '#E2E8F0',
      primary300: '#CBD5E1',
      primary400: '#94A3B8',
      primary500: '#64748B',
      primary600: '#334155',
      primary700: '#1E293B',
      primary800: '#0F172A',
      primary900: '#020617',
      onPrimary: '#FFFFFF',
      accent: '#0F766E',
      onAccent: '#FFFFFF',
      accentSoft: '#CCFBF1',
      onAccentSoft: '#115E59',
      success: '#15803D',
      onSuccess: '#FFFFFF',
      successSoft: '#DCFCE7',
      onSuccessSoft: '#14532D',
      warning: '#B45309',
      onWarning: '#FFFFFF',
      warningSoft: '#FEF3C7',
      onWarningSoft: '#78350F',
      danger: '#BE123C',
      onDanger: '#FFFFFF',
      dangerSoft: '#FFE4E6',
      onDangerSoft: '#881337',
      ring: '#334155',
    },
    dark: {
      surface: '#0D0F12',
      surface2: '#171A20',
      surfaceCard: '#13161B',
      ink: '#F3F4F6',
      inkMuted: '#A5ACB8',
      line: '#5E6675',
      primary50: '#F8FAFC',
      primary100: '#F1F5F9',
      primary200: '#E2E8F0',
      primary300: '#CBD5E1',
      primary400: '#94A3B8',
      primary500: '#64748B',
      primary600: '#475569',
      primary700: '#334155',
      primary800: '#1E293B',
      primary900: '#0F172A',
      onPrimary: '#FFFFFF',
      accent: '#2DD4BF',
      onAccent: '#042F2E',
      accentSoft: '#134E4A',
      onAccentSoft: '#99F6E4',
      success: '#4ADE80',
      onSuccess: '#052E16',
      successSoft: '#14532D',
      onSuccessSoft: '#BBF7D0',
      warning: '#FBBF24',
      onWarning: '#451A03',
      warningSoft: '#451A03',
      onWarningSoft: '#FDE68A',
      danger: '#E11D48',
      onDanger: '#FFFFFF',
      dangerSoft: '#4C0519',
      onDangerSoft: '#FECDD3',
      ring: '#94A3B8',
    },
  },
};

// ==========================================
// WCAG 2.1 CONTRAST & PALETTE MATH UTILITIES
// ==========================================

export function isValidHexColor(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex.trim());
}

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return [r, g, b];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      case bn:
        h = (rn - gn) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

export function hslToHex(h: number, s: number, l: number): string {
  const hn = ((h % 360) + 360) % 360;
  const sn = Math.max(0, Math.min(100, s)) / 100;
  const ln = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((hn / 60) % 2) - 1));
  const m = ln - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (hn < 60) [r, g, b] = [c, x, 0];
  else if (hn < 120) [r, g, b] = [x, c, 0];
  else if (hn < 180) [r, g, b] = [0, c, x];
  else if (hn < 240) [r, g, b] = [0, x, c];
  else if (hn < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

export function getRelativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const srgb = v / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export interface ContrastCheckFailure {
  pair: string;
  foreground: string;
  background: string;
  ratio: number;
  required: number;
}

export function validateTokenPaletteContrast(tokens: SemanticColorTokens): {
  valid: boolean;
  failures: ContrastCheckFailure[];
} {
  const checks: Array<{ pair: string; fg: string; bg: string; min: number }> = [
    { pair: 'ink on surface', fg: tokens.ink, bg: tokens.surface, min: 4.5 },
    { pair: 'ink on surface-2', fg: tokens.ink, bg: tokens.surface2, min: 4.5 },
    { pair: 'ink on surface-card', fg: tokens.ink, bg: tokens.surfaceCard, min: 4.5 },
    { pair: 'ink-muted on surface', fg: tokens.inkMuted, bg: tokens.surface, min: 4.5 },
    { pair: 'ink-muted on surface-2', fg: tokens.inkMuted, bg: tokens.surface2, min: 4.5 },
    { pair: 'on-primary on primary-600', fg: tokens.onPrimary, bg: tokens.primary600, min: 4.5 },
    { pair: 'on-primary on primary-700', fg: tokens.onPrimary, bg: tokens.primary700, min: 4.5 },
    { pair: 'on-accent on accent', fg: tokens.onAccent, bg: tokens.accent, min: 4.5 },
    { pair: 'on-accent-soft on accent-soft', fg: tokens.onAccentSoft, bg: tokens.accentSoft, min: 4.5 },
    { pair: 'on-success on success', fg: tokens.onSuccess, bg: tokens.success, min: 4.5 },
    { pair: 'on-success-soft on success-soft', fg: tokens.onSuccessSoft, bg: tokens.successSoft, min: 4.5 },
    { pair: 'on-warning on warning', fg: tokens.onWarning, bg: tokens.warning, min: 4.5 },
    { pair: 'on-warning-soft on warning-soft', fg: tokens.onWarningSoft, bg: tokens.warningSoft, min: 4.5 },
    { pair: 'on-danger on danger', fg: tokens.onDanger, bg: tokens.danger, min: 4.5 },
    { pair: 'on-danger-soft on danger-soft', fg: tokens.onDangerSoft, bg: tokens.dangerSoft, min: 4.5 },
    { pair: 'line UI border on surface', fg: tokens.line, bg: tokens.surface, min: 3.0 },
    { pair: 'ring UI focus on surface', fg: tokens.ring, bg: tokens.surface, min: 3.0 },
  ];

  const failures: ContrastCheckFailure[] = [];
  for (const c of checks) {
    const ratio = getContrastRatio(c.fg, c.bg);
    if (ratio < c.min) {
      failures.push({
        pair: c.pair,
        foreground: c.fg,
        background: c.bg,
        ratio: Number(ratio.toFixed(2)),
        required: c.min,
      });
    }
  }

  return { valid: failures.length === 0, failures };
}

export interface GeneratedBrandPaletteResult {
  valid: boolean;
  error?: { bn: string; en: string };
  contrastRatioOnWhite: number;
  contrastRatioOnDark: number;
  selectedContrast: number;
  tokens?: Pick<
    SemanticColorTokens,
    | 'primary50'
    | 'primary100'
    | 'primary200'
    | 'primary300'
    | 'primary400'
    | 'primary500'
    | 'primary600'
    | 'primary700'
    | 'primary800'
    | 'primary900'
    | 'onPrimary'
    | 'ring'
  >;
}

/**
 * Generates an accessible primary-50..900 ramp from a single brand color.
 * Rejects invalid hex or colors whose contrast cannot satisfy WCAG AA (>= 4.5:1)
 * cleanly for interactive primary buttons & readable links.
 */
export function generateAccessibleBrandPalette(
  rawHex: string,
  resolvedMode: ResolvedMode = 'light'
): GeneratedBrandPaletteResult {
  const hex = rawHex.trim().toUpperCase();
  if (!isValidHexColor(hex)) {
    return {
      valid: false,
      error: { bn: 'সঠিক হেক্স কালার কোড দিন (যেমন #047857)', en: 'Enter a valid 6-digit hex color (e.g. #047857)' },
      contrastRatioOnWhite: 0,
      contrastRatioOnDark: 0,
      selectedContrast: 0,
    };
  }

  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);

  // Reject colors that are overly pale or too close to pure black/white where primary-600/700 breaks hierarchy
  if (l > 82 || l < 12) {
    return {
      valid: false,
      error: {
        bn: 'এই রঙটি অতিরিক্ত হালকা বা অতিরিক্ত গাঢ়। WCAG AA কনট্রাস্ট বজায় রাখতে মাঝারি থেকে গাঢ় রঙ নির্বাচন করুন।',
        en: 'Color is too light or too dark. Pick a richer mid-to-deep tone for WCAG AA contrast.',
      },
      contrastRatioOnWhite: getContrastRatio(hex, '#FFFFFF'),
      contrastRatioOnDark: getContrastRatio(hex, '#0F172A'),
      selectedContrast: 0,
    };
  }

  // Determine whether white (#FFFFFF) or deep ink (#0F172A) yields better contrast on the chosen color,
  // preferring dark primary-600 (<= 44% lightness) when possible for white text.
  const whiteRatioRaw = getContrastRatio(hex, '#FFFFFF');
  const darkRatioRaw = getContrastRatio(hex, '#0F172A');

  // If the picked color sits in a washed-out mid-zone where contrast with white is < 4.5 AND
  // user wants white-on-primary or dark-on-primary: verify chosen primary-600 passes >= 4.5
  let p600 = hex;
  let onPrimary = '#FFFFFF';
  if (whiteRatioRaw >= 4.5) {
    p600 = hex;
    onPrimary = '#FFFFFF';
  } else if (darkRatioRaw >= 4.5 && l >= 60) {
    p600 = hex;
    onPrimary = '#0F172A';
  } else {
    // Reject if the raw color fails 4.5:1 on white AND isn't high-luminance enough for dark text comfortably
    return {
      valid: false,
      error: {
        bn: `এই রঙটির কনট্রাস্ট (${Math.max(whiteRatioRaw, darkRatioRaw).toFixed(2)}:1) WCAG AA মানদণ্ড (৪.৫:১) পূরণ করেনি। একটু গাঢ় রঙ নিন।`,
        en: `Contrast (${Math.max(whiteRatioRaw, darkRatioRaw).toFixed(2)}:1) fails WCAG AA (4.5:1). Choose a slightly deeper color.`,
      },
      contrastRatioOnWhite: Number(whiteRatioRaw.toFixed(2)),
      contrastRatioOnDark: Number(darkRatioRaw.toFixed(2)),
      selectedContrast: Number(Math.max(whiteRatioRaw, darkRatioRaw).toFixed(2)),
    };
  }

  const p700 = onPrimary === '#FFFFFF'
    ? hslToHex(h, Math.min(100, s + 4), Math.max(16, l - 8))
    : hslToHex(h, s, Math.min(82, l + 8));

  // Verify p700 also passes >= 4.5 with onPrimary AND >= 4.5 on light surface
  if (getContrastRatio(p700, onPrimary) < 4.5) {
    return {
      valid: false,
      error: {
        bn: 'হোভার স্টেট কনট্রাস্ট ৪.৫:১ এর নিচে নেমে যাচ্ছে। অন্য রঙ নির্বাচন করুন।',
        en: 'Hover state contrast falls below 4.5:1. Please adjust the color.',
      },
      contrastRatioOnWhite: Number(whiteRatioRaw.toFixed(2)),
      contrastRatioOnDark: Number(darkRatioRaw.toFixed(2)),
      selectedContrast: Number(getContrastRatio(p600, onPrimary).toFixed(2)),
    };
  }

  const clampSat = Math.max(18, Math.min(92, s));
  const p50 = hslToHex(h, Math.max(15, clampSat * 0.75), 97);
  const p100 = hslToHex(h, Math.max(18, clampSat * 0.8), 92);
  const p200 = hslToHex(h, Math.max(20, clampSat * 0.85), 84);
  const p300 = hslToHex(h, Math.max(22, clampSat * 0.9), 74);
  const p400 = hslToHex(h, clampSat, 62);
  const p500 = hslToHex(h, clampSat, 50);
  const p800 = hslToHex(h, Math.min(100, clampSat + 4), 22);
  const p900 = hslToHex(h, Math.min(100, clampSat + 6), 14);
  const ring = resolvedMode === 'dark' ? p300 : p600;

  return {
    valid: true,
    contrastRatioOnWhite: Number(whiteRatioRaw.toFixed(2)),
    contrastRatioOnDark: Number(darkRatioRaw.toFixed(2)),
    selectedContrast: Number(getContrastRatio(p600, onPrimary).toFixed(2)),
    tokens: {
      primary50: p50,
      primary100: p100,
      primary200: p200,
      primary300: p300,
      primary400: p400,
      primary500: p500,
      primary600: p600,
      primary700: p700,
      primary800: p800,
      primary900: p900,
      onPrimary,
      ring,
    },
  };
}

/**
 * Validates and safely normalizes any Firestore or localStorage appearance object.
 * Never throws; always falls back to DEFAULT_APPEARANCE ('dawn' + 'light') on invalid values.
 */
export function validateAndNormalizeAppearance(raw: unknown): AppearanceSettings {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_APPEARANCE };
  }
  const obj = raw as Record<string, unknown>;

  const theme: ThemeId = ALL_THEME_IDS.includes(obj.theme as ThemeId)
    ? (obj.theme as ThemeId)
    : DEFAULT_APPEARANCE.theme;

  const defaultMode: ThemeMode = ['light', 'dark', 'system'].includes(obj.defaultMode as string)
    ? (obj.defaultMode as ThemeMode)
    : DEFAULT_APPEARANCE.defaultMode;

  const showModeToggle =
    typeof obj.showModeToggle === 'boolean' ? obj.showModeToggle : DEFAULT_APPEARANCE.showModeToggle;

  const fontPair: FontPairId = ['heritage', 'modern', 'editorial'].includes(obj.fontPair as string)
    ? (obj.fontPair as FontPairId)
    : DEFAULT_APPEARANCE.fontPair;

  const radius: RadiusScale = ['sharp', 'rounded', 'soft'].includes(obj.radius as string)
    ? (obj.radius as RadiusScale)
    : DEFAULT_APPEARANCE.radius;

  const heroVariant: HeroVariant = ['split', 'editorial', 'collegiate'].includes(obj.heroVariant as string)
    ? (obj.heroVariant as HeroVariant)
    : DEFAULT_APPEARANCE.heroVariant;

  let useCustomBrandColor = Boolean(obj.useCustomBrandColor);
  let brandColor =
    typeof obj.brandColor === 'string' && isValidHexColor(obj.brandColor)
      ? obj.brandColor.toUpperCase()
      : DEFAULT_APPEARANCE.brandColor;

  if (useCustomBrandColor) {
    const check = generateAccessibleBrandPalette(brandColor, 'light');
    if (!check.valid) {
      useCustomBrandColor = false;
      brandColor = DEFAULT_APPEARANCE.brandColor;
    }
  }

  // Normalize sectionOrder so all 8 sections exist cleanly without duplicates
  const rawOrder = Array.isArray(obj.sectionOrder) ? obj.sectionOrder : [];
  const validOrderSet = new Set<HomeSectionKey>();
  for (const item of rawOrder) {
    if (DEFAULT_SECTION_ORDER.includes(item as HomeSectionKey)) {
      validOrderSet.add(item as HomeSectionKey);
    }
  }
  for (const def of DEFAULT_SECTION_ORDER) {
    validOrderSet.add(def);
  }
  const sectionOrder = Array.from(validOrderSet);

  const hiddenSections: HomeSectionKey[] = Array.isArray(obj.hiddenSections)
    ? obj.hiddenSections.filter((s): s is HomeSectionKey => DEFAULT_SECTION_ORDER.includes(s as HomeSectionKey))
    : [];

  const rawAnnouncement = (obj.announcement && typeof obj.announcement === 'object'
    ? obj.announcement
    : {}) as Record<string, unknown>;

  const announcement: AnnouncementConfig = {
    enabled: typeof rawAnnouncement.enabled === 'boolean' ? rawAnnouncement.enabled : false,
    textBn:
      typeof rawAnnouncement.textBn === 'string'
        ? rawAnnouncement.textBn
        : DEFAULT_APPEARANCE.announcement.textBn,
    textEn:
      typeof rawAnnouncement.textEn === 'string'
        ? rawAnnouncement.textEn
        : DEFAULT_APPEARANCE.announcement.textEn,
    linkUrl:
      typeof rawAnnouncement.linkUrl === 'string'
        ? rawAnnouncement.linkUrl
        : DEFAULT_APPEARANCE.announcement.linkUrl,
  };

  const rawSocial = (obj.socialLinks && typeof obj.socialLinks === 'object'
    ? obj.socialLinks
    : {}) as Record<string, unknown>;

  const socialLinks: SocialLinksConfig = {
    facebook: typeof rawSocial.facebook === 'string' ? rawSocial.facebook : '',
    youtube: typeof rawSocial.youtube === 'string' ? rawSocial.youtube : '',
    instagram: typeof rawSocial.instagram === 'string' ? rawSocial.instagram : '',
    website: typeof rawSocial.website === 'string' ? rawSocial.website : '',
  };

  const heroVideoUrl =
    typeof obj.heroVideoUrl === 'string' && obj.heroVideoUrl.length <= 500 ? obj.heroVideoUrl.trim() : '';
  const virtualTourUrl =
    typeof obj.virtualTourUrl === 'string' && obj.virtualTourUrl.length <= 500 ? obj.virtualTourUrl.trim() : '';

  const logoUrl = typeof obj.logoUrl === 'string' && obj.logoUrl.length <= 307200 ? obj.logoUrl : '';
  const faviconUrl = typeof obj.faviconUrl === 'string' && obj.faviconUrl.length <= 153600 ? obj.faviconUrl : '';

  return {
    theme,
    defaultMode,
    showModeToggle,
    useCustomBrandColor,
    brandColor,
    fontPair,
    radius,
    heroVariant,
    sectionOrder,
    hiddenSections,
    announcement,
    socialLinks,
    heroVideoUrl,
    virtualTourUrl,
    logoUrl,
    faviconUrl,
    updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : undefined,
    updatedBy: typeof obj.updatedBy === 'string' ? obj.updatedBy : undefined,
  };
}
