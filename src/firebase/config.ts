import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase Core
export const app = initializeApp(firebaseConfig);

// Firebase App Check Preparation (reCAPTCHA v3)
// Set VITE_FIREBASE_APPCHECK_SITE_KEY in environment variables to enable App Check.
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
    console.warn('App Check initialization deferred:', err);
  }
}

export const appCheckStatus = {
  configured: Boolean(appCheckSiteKey),
  active: Boolean(appCheckInstance),
  provider: 'reCAPTCHA v3',
};

// Initialize Firestore with exact database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth (Firebase Storage is completely removed per plan requirements)
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Demo mode configuration (can be toggled in code or via localStorage 'school_demo_mode')
export const DEMO_MODE: boolean = false;

// Custom parameters to always prompt account selection if desired
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

import { schoolConfig } from '../config/schoolConfig';

// Single source of truth for Principal/Owner email (read from schoolConfig)
export const OWNER_EMAIL = schoolConfig.ownerEmail;

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
      console.warn('Firebase client is offline or starting up.');
      return false;
    }
    return true;
  }
}

// Google Sign-in helper using popup (recommended for iFrame sandbox)
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
