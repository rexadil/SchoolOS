import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';
import firebaseConfig from '../../firebase-applet-config.json';
import { schoolConfig } from '../config/schoolConfig';

/**
 * Firebase Web Config Resolver (Vercel Multi-School + AI Studio compatible)
 *
 * When deployed on Vercel (or any static host), set `VITE_FIREBASE_*` environment
 * variables in Project Settings to connect each client school deployment to its
 * own dedicated Firebase project without modifying repository source code.
 * When `VITE_FIREBASE_PROJECT_ID` is omitted, it falls back cleanly to
 * `firebase-applet-config.json` (used in AI Studio preview).
 */
const envApiKey = (import.meta.env.VITE_FIREBASE_API_KEY || '').trim();
const envAuthDomain = (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '').trim();
const envProjectId = (import.meta.env.VITE_FIREBASE_PROJECT_ID || '').trim();
const envStorageBucket = (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '').trim();
const envMessagingSenderId = (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim();
const envAppId = (import.meta.env.VITE_FIREBASE_APP_ID || '').trim();
const envMeasurementId = (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '').trim();
const envDatabaseId = (import.meta.env.VITE_FIREBASE_DATABASE_ID || '').trim();

const hasCustomEnvConfig = Boolean(envProjectId);

if (import.meta.env.DEV && hasCustomEnvConfig && (!envApiKey || !envAppId || !envAuthDomain)) {
  console.warn(
    'Partial VITE_FIREBASE_* environment variables detected. Ensure VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, and VITE_FIREBASE_APP_ID are all configured.'
  );
}

const resolvedFirebaseConfig = {
  apiKey: envApiKey || firebaseConfig.apiKey,
  authDomain: envAuthDomain || firebaseConfig.authDomain,
  projectId: envProjectId || firebaseConfig.projectId,
  storageBucket: envStorageBucket || firebaseConfig.storageBucket,
  messagingSenderId: envMessagingSenderId || firebaseConfig.messagingSenderId,
  appId: envAppId || firebaseConfig.appId,
  measurementId: envMeasurementId || firebaseConfig.measurementId,
};

const resolvedDatabaseId =
  envDatabaseId || (hasCustomEnvConfig ? '(default)' : firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Core
export const app = initializeApp(resolvedFirebaseConfig);

/**
 * Non-secret environment diagnostics displayed strictly inside the
 * Owner/Developer-only System Info panel in AdminDashboard.
 */
export const firebaseEnvironmentInfo = {
  configSource: hasCustomEnvConfig ? ('vercel-env' as const) : ('applet-config' as const),
  projectId: resolvedFirebaseConfig.projectId,
  authDomain: resolvedFirebaseConfig.authDomain,
  databaseId: resolvedDatabaseId || '(default)',
  appEnv: ((import.meta.env.VITE_APP_ENV as string | undefined) || import.meta.env.MODE || 'production').trim(),
};

/**
 * Firebase App Check Preparation (reCAPTCHA v3)
 *
 * Set `VITE_FIREBASE_APPCHECK_SITE_KEY` in Vercel/local env variables when you enable
 * App Check enforcement in Firebase Console. Leaving it blank keeps App Check non-blocking
 * during initial setup.
 */
let appCheckInstance: AppCheck | null = null;
const appCheckSiteKey = (import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY || '').trim();

if (typeof window !== 'undefined' && appCheckSiteKey) {
  try {
    if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN) {
      const debugVal = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN;
      (window as unknown as Record<string, unknown>).FIREBASE_APPCHECK_DEBUG_TOKEN =
        debugVal === 'true' ? true : debugVal;
    }
    appCheckInstance = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(appCheckSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('App Check initialization deferred:', err);
    }
  }
}

export const appCheckStatus = {
  configured: Boolean(appCheckSiteKey),
  active: Boolean(appCheckInstance),
  provider: 'reCAPTCHA v3',
};

// Initialize Firestore with exact database ID from env or applet config
export const db =
  resolvedDatabaseId && resolvedDatabaseId !== '(default)'
    ? getFirestore(app, resolvedDatabaseId)
    : getFirestore(app);

// Initialize Auth (Firebase Storage is completely removed per Spark plan requirements)
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * Demo Mode isolation flag:
 * Keep `false` in all production builds. Demo mode can only run in a local
 * browser sandbox (`localStorage.school_demo_mode === 'true'`) and always displays
 * a sticky red safety banner indicating changes are not persisted to Firestore.
 */
export const DEMO_MODE: boolean = false;

// Custom parameters to always prompt account selection
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Fallback Principal/Owner email before /settings/ownership is initialized in Firestore
export const OWNER_EMAIL = schoolConfig.ownerEmail.trim().toLowerCase();

/**
 * BUSINESS PROTECTION (DEVELOPER ALLOWLIST):
 * Only these developer Google accounts are allowed to transfer or unlock school
 * ownership (`settings/ownership`). Must stay synchronized with `developerEmails()`
 * in `firestore.rules`.
 */
export const DEVELOPER_EMAILS: string[] = Array.from(
  new Set(
    (schoolConfig.developerEmails && schoolConfig.developerEmails.length > 0
      ? schoolConfig.developerEmails
      : [schoolConfig.ownerEmail]
    )
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  )
);

export function isDeveloperEmail(email?: string | null): boolean {
  if (!email) return false;
  return DEVELOPER_EMAILS.includes(email.trim().toLowerCase());
}

// Standardized Operation Types & Error Handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Startup connection verification test
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'settings', 'school'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      if (import.meta.env.DEV) {
        console.warn('Firebase client is offline or starting up.');
      }
      return false;
    }
    return true;
  }
}

// Google Sign-in helper using popup (works across Vercel and iFrame sandboxes)
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-in failed:', error);
    throw error;
  }
}

// Logout helper
export async function logoutUser() {
  await signOut(auth);
}
