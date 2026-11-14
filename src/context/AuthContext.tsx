import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  auth,
  db,
  DEMO_MODE,
  OWNER_EMAIL,
  isDeveloperEmail,
  loginWithGoogle,
  logoutUser,
} from '../firebase/config';

export type UserRole = 'owner' | 'moderator' | 'none';

/**
 * AuthContext resolves 3 strict privilege tiers from Google Auth + Firestore:
 * 1. `isDeveloper` — Hardcoded developer allowlist (`DEVELOPER_EMAILS` + `firestore.rules`),
 *    exclusively permitted to assign/lock `settings/ownership`.
 * 2. `isOwner` — Active single Principal/Owner (`settings/ownership.ownerEmail`, or
 *    fallback `OWNER_EMAIL` prior to initial handover).
 * 3. `isModerator` — Staff listed in `admins/{email}` with `role: "moderator"`.
 */

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isOwner: boolean;
  isModerator: boolean;
  isAdmin: boolean;
  /**
   * BUSINESS PROTECTION:
   * True ONLY when the signed-in Google account belongs to the hardcoded
   * `DEVELOPER_EMAILS` allowlist (`schoolConfig.developerEmails` + `firestore.rules`).
   * Only developers may assign or change `ownerEmail` / `ownershipLocked`.
   */
  isDeveloper: boolean;
  /**
   * Set to `true` in Firestore (`settings/ownership` & `settings/school`) once
   * the developer hands over the template to the first real Principal/Owner.
   */
  ownershipLocked: boolean;
  effectiveOwnerEmail: string;
  loading: boolean;
  login: () => Promise<User>;
  logout: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('none');
  const [effectiveOwnerEmail, setEffectiveOwnerEmail] = useState<string>(OWNER_EMAIL);
  const [ownershipLocked, setOwnershipLocked] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const resolveOwnershipState = useCallback(async (): Promise<{ ownerEmail: string; locked: boolean }> => {
    const isDemo =
      typeof window !== 'undefined'
        ? localStorage.getItem('school_demo_mode') === 'true' || DEMO_MODE
        : DEMO_MODE;

    if (isDemo && typeof window !== 'undefined') {
      const demoOwner = localStorage.getItem('school_demo_owner_email');
      const demoLocked = localStorage.getItem('school_demo_ownership_locked') === 'true';
      if (demoOwner && demoOwner.includes('@')) {
        const normalized = demoOwner.trim().toLowerCase();
        return {
          ownerEmail: normalized,
          locked: demoLocked || !isDeveloperEmail(normalized),
        };
      }
    }

    try {
      const ownershipSnap = await getDoc(doc(db, 'settings', 'ownership'));
      if (ownershipSnap.exists()) {
        const data = ownershipSnap.data();
        if (typeof data?.ownerEmail === 'string' && data.ownerEmail.trim()) {
          const normalized = data.ownerEmail.trim().toLowerCase();
          const locked =
            typeof data.ownershipLocked === 'boolean'
              ? data.ownershipLocked
              : !isDeveloperEmail(normalized);
          return { ownerEmail: normalized, locked };
        }
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('Ownership lookup fallback:', err);
      }
    }

    return { ownerEmail: OWNER_EMAIL, locked: false };
  }, []);

  const checkUserRole = useCallback(
    async (currentUser: User | null) => {
      if (!currentUser || !currentUser.email) {
        setRole('none');
        setLoading(false);
        return;
      }

      const email = currentUser.email.trim().toLowerCase();
      const { ownerEmail: activeOwner, locked } = await resolveOwnershipState();
      setEffectiveOwnerEmail(activeOwner);
      setOwnershipLocked(locked);

      // Single active owner check (matches Firestore rules currentOwnerEmail())
      if (email === activeOwner) {
        setRole('owner');

        try {
          const ownerDocRef = doc(db, 'admins', email);
          const snap = await getDoc(ownerDocRef);
          if (!snap.exists() || snap.data()?.role !== 'owner') {
            await setDoc(ownerDocRef, {
              email,
              role: 'owner',
              addedBy: 'system',
              addedAt: new Date().toISOString(),
              createdAt: serverTimestamp(),
            });
          }
        } catch (err) {
          if (import.meta.env.DEV) {
            console.warn('Could not sync owner record to Firestore:', err);
          }
        }

        setLoading(false);
        return;
      }

      // Otherwise only explicit moderators retain school admin access
      try {
        const adminDocRef = doc(db, 'admins', email);
        const snap = await getDoc(adminDocRef);

        if (snap.exists() && snap.data()?.role === 'moderator') {
          setRole('moderator');
        } else {
          setRole('none');
        }
      } catch (err) {
        console.error('Error verifying admin permissions:', err);
        setRole('none');
      } finally {
        setLoading(false);
      }
    },
    [resolveOwnershipState]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      await checkUserRole(currentUser);
    });

    return () => unsubscribe();
  }, [checkUserRole]);

  // Real-time listener for ownership lock/handover state while signed in
  useEffect(() => {
    if (!user || !user.email) return;

    const unsubOwnership = onSnapshot(
      doc(db, 'settings', 'ownership'),
      () => {
        void checkUserRole(user);
      },
      (err) => {
        if (import.meta.env.DEV) {
          console.warn('Ownership snapshot note:', err);
        }
      }
    );

    return () => unsubOwnership();
  }, [user, checkUserRole]);

  const refreshRole = useCallback(async () => {
    await checkUserRole(user);
  }, [checkUserRole, user]);

  const handleLogin = useCallback(async () => {
    setLoading(true);
    try {
      const loggedUser = await loginWithGoogle();
      await checkUserRole(loggedUser);
      return loggedUser;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }, [checkUserRole]);

  const handleLogout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    setRole('none');
  }, []);

  const isDeveloper = Boolean(user?.email && user.emailVerified !== false && isDeveloperEmail(user.email));

  const value = useMemo(
    () => ({
      user,
      role,
      isOwner: role === 'owner',
      isModerator: role === 'moderator',
      isAdmin: role === 'owner' || role === 'moderator',
      isDeveloper,
      ownershipLocked,
      effectiveOwnerEmail,
      loading,
      login: handleLogin,
      logout: handleLogout,
      refreshRole,
    }),
    [user, role, isDeveloper, ownershipLocked, effectiveOwnerEmail, loading, handleLogin, handleLogout, refreshRole]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
