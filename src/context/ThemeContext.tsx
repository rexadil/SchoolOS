import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, DEMO_MODE, handleFirestoreError, OperationType } from '../firebase/config';
import { useAuth } from './AuthContext';
import {
  AppearanceSettings,
  DEFAULT_APPEARANCE,
  ResolvedMode,
  THEME_PACKS,
  ThemeMode,
  generateAccessibleBrandPalette,
  validateAndNormalizeAppearance,
  validateTokenPaletteContrast,
} from '../theme/themes';

const STORAGE_APPEARANCE_KEY = 'school_theme_appearance';
const STORAGE_USER_MODE_KEY = 'school_mode_preference';

interface ThemeContextType {
  appearance: AppearanceSettings;
  mode: ThemeMode;
  resolvedMode: ResolvedMode;
  cycleMode: () => void;
  setUserMode: (mode: ThemeMode) => void;
  saveAppearance: (next: AppearanceSettings) => Promise<void>;
  resetAppearance: () => Promise<void>;
  loadingAppearance: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemResolvedMode(): ResolvedMode {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyAppearanceToDom(
  appearance: AppearanceSettings,
  activeMode: ThemeMode,
  resolvedMode: ResolvedMode
) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  let safeTheme = appearance.theme;
  let safeResolved = resolvedMode;

  const pack = THEME_PACKS[safeTheme]?.[safeResolved];
  if (!pack || !validateTokenPaletteContrast(pack).valid) {
    safeTheme = 'dawn';
    safeResolved = 'light';
  }

  root.setAttribute('data-theme', safeTheme);
  root.setAttribute('data-mode', activeMode);
  root.setAttribute('data-resolved-mode', safeResolved);
  root.setAttribute('data-font-pair', appearance.fontPair);
  root.setAttribute('data-radius', appearance.radius);
  root.classList.toggle('dark', safeResolved === 'dark');

  const brandOverrideProps = [
    '--token-primary-50',
    '--token-primary-100',
    '--token-primary-200',
    '--token-primary-300',
    '--token-primary-400',
    '--token-primary-500',
    '--token-primary-600',
    '--token-primary-700',
    '--token-primary-800',
    '--token-primary-900',
    '--token-on-primary',
    '--token-ring',
  ];

  const effectivePack = THEME_PACKS[safeTheme]?.[safeResolved];
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');

  if (appearance.useCustomBrandColor) {
    const generated = generateAccessibleBrandPalette(appearance.brandColor, safeResolved);
    if (generated.valid && generated.tokens) {
      const t = generated.tokens;
      root.style.setProperty('--token-primary-50', t.primary50);
      root.style.setProperty('--token-primary-100', t.primary100);
      root.style.setProperty('--token-primary-200', t.primary200);
      root.style.setProperty('--token-primary-300', t.primary300);
      root.style.setProperty('--token-primary-400', t.primary400);
      root.style.setProperty('--token-primary-500', t.primary500);
      root.style.setProperty('--token-primary-600', t.primary600);
      root.style.setProperty('--token-primary-700', t.primary700);
      root.style.setProperty('--token-primary-800', t.primary800);
      root.style.setProperty('--token-primary-900', t.primary900);
      root.style.setProperty('--token-on-primary', t.onPrimary);
      root.style.setProperty('--token-ring', t.ring);
      if (metaThemeColor) metaThemeColor.setAttribute('content', t.primary600);
      return;
    }
  }

  if (metaThemeColor && effectivePack) {
    metaThemeColor.setAttribute('content', effectivePack.primary600);
  }

  for (const prop of brandOverrideProps) {
    root.style.removeProperty(prop);
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isOwner } = useAuth();

  const [appearance, setAppearance] = useState<AppearanceSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(STORAGE_APPEARANCE_KEY);
        if (cached) {
          return validateAndNormalizeAppearance(JSON.parse(cached));
        }
      } catch {
        // Safe fallback to default
      }
    }
    return { ...DEFAULT_APPEARANCE };
  });

  const [userModeOverride, setUserModeOverride] = useState<ThemeMode | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_USER_MODE_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    }
    return null;
  });

  const [systemMode, setSystemMode] = useState<ResolvedMode>(() => getSystemResolvedMode());
  const [loadingAppearance, setLoadingAppearance] = useState<boolean>(true);

  // Listen to OS color-scheme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemMode(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Live sync Firestore settings/appearance
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'settings', 'appearance'),
      (snap) => {
        if (snap.exists()) {
          const normalized = validateAndNormalizeAppearance(snap.data());
          setAppearance(normalized);
          try {
            localStorage.setItem(STORAGE_APPEARANCE_KEY, JSON.stringify(normalized));
          } catch {
            // ignore quota issues
          }
        }
        setLoadingAppearance(false);
      },
      (err) => {
        console.warn('Appearance snapshot fallback:', err);
        setLoadingAppearance(false);
      }
    );
    return () => unsub();
  }, []);

  // Resolve effective mode (visitor override only applies when showModeToggle is enabled)
  const effectiveMode: ThemeMode =
    appearance.showModeToggle && userModeOverride ? userModeOverride : appearance.defaultMode;
  const resolvedMode: ResolvedMode = effectiveMode === 'system' ? systemMode : effectiveMode;

  // Apply theme & mode to DOM whenever any appearance setting changes
  useEffect(() => {
    applyAppearanceToDom(appearance, effectiveMode, resolvedMode);
  }, [appearance, effectiveMode, resolvedMode]);

  const setUserMode = useCallback((nextMode: ThemeMode) => {
    setUserModeOverride(nextMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_USER_MODE_KEY, nextMode);
    }
  }, []);

  const cycleMode = useCallback(() => {
    if (!appearance.showModeToggle) return;
    const order: ThemeMode[] = ['light', 'dark', 'system'];
    const idx = order.indexOf(effectiveMode);
    const next = order[(idx + 1) % order.length];
    setUserMode(next);
  }, [appearance.showModeToggle, effectiveMode, setUserMode]);

  const saveAppearance = useCallback(
    async (next: AppearanceSettings) => {
      const normalized = validateAndNormalizeAppearance({
        ...next,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.email || 'owner',
      });

      const isDemoActive =
        typeof window !== 'undefined'
          ? localStorage.getItem('school_demo_mode') === 'true' || DEMO_MODE
          : DEMO_MODE;

      setAppearance(normalized);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_APPEARANCE_KEY, JSON.stringify(normalized));
        } catch {
          // ignore
        }
      }

      if (isDemoActive && !isOwner) {
        return;
      }

      try {
        await setDoc(doc(db, 'settings', 'appearance'), normalized);
      } catch (err) {
        if (!isDemoActive) {
          handleFirestoreError(err, OperationType.UPDATE, 'settings/appearance');
        }
      }
    },
    [user?.email, isOwner]
  );

  const resetAppearance = useCallback(async () => {
    await saveAppearance({ ...DEFAULT_APPEARANCE });
  }, [saveAppearance]);

  return (
    <ThemeContext.Provider
      value={{
        appearance,
        mode: effectiveMode,
        resolvedMode,
        cycleMode,
        setUserMode,
        saveAppearance,
        resetAppearance,
        loadingAppearance,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
};
