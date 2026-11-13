import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, OWNER_EMAIL, loginWithGoogle, logoutUser } from '../firebase/config';

export type UserRole = 'owner' | 'moderator' | 'none';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isOwner: boolean;
  isModerator: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: () => Promise<User>;
  logout: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('none');
  const [loading, setLoading] = useState(true);

  const checkUserRole = async (currentUser: User | null) => {
    if (!currentUser || !currentUser.email) {
      setRole('none');
      setLoading(false);
      return;
    }

    const email = currentUser.email.toLowerCase();

    // Check if user is the designated owner/principal
    if (email === OWNER_EMAIL.toLowerCase()) {
      setRole('owner');

      // Ensure the owner document exists in the admins collection
      try {
        const ownerDocRef = doc(db, 'admins', email);
        const snap = await getDoc(ownerDocRef);
        if (!snap.exists()) {
          await setDoc(ownerDocRef, {
            email: email,
            role: 'owner',
            addedBy: 'system',
            addedAt: new Date().toISOString(),
            createdAt: serverTimestamp(),
          });
        }
      } catch (err) {
        console.warn('Could not sync owner record to Firestore:', err);
      }

      setLoading(false);
      return;
    }

    // Check if user is an existing admin/moderator in Firestore
    try {
      const adminDocRef = doc(db, 'admins', email);
      const snap = await getDoc(adminDocRef);

      if (snap.exists()) {
        const data = snap.data();
        if (data.role === 'owner') {
          setRole('owner');
        } else if (data.role === 'moderator') {
          setRole('moderator');
        } else {
          setRole('none');
        }
      } else {
        // Any other Google account sees "অনুমতি নেই" (no access)
        setRole('none');
      }
    } catch (err) {
      console.error('Error verifying admin permissions:', err);
      setRole('none');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      await checkUserRole(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const refreshRole = async () => {
    if (user) {
      await checkUserRole(user);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const loggedUser = await loginWithGoogle();
      await checkUserRole(loggedUser);
      return loggedUser;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setRole('none');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isOwner: role === 'owner',
        isModerator: role === 'moderator',
        isAdmin: role === 'owner' || role === 'moderator',
        loading,
        login: handleLogin,
        logout: handleLogout,
        refreshRole,
      }}
    >
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
