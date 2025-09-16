import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { User } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const fetchUserProfile = async (uid: string) => {
    try {
      console.log('Fetching user profile for UID:', uid);
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User data found:', userData);
        setUserProfile({
          id: uid,
          ...userData,
          expiryDate: userData.expiryDate?.toDate(),
          createdAt: userData.createdAt?.toDate(),
          lastLoginAt: userData.lastLoginAt?.toDate(),
        } as User);
      } else {
        console.log('No user document found for UID:', uid);
        // Create a basic admin profile if user doesn't exist in Firestore
        const basicProfile: User = {
          id: uid,
          name: 'Admin User',
          email: 'admin@emaamul.com',
          role: 'admin',
          subscriptionStatus: 'active',
          expiryDate: new Date('2025-12-31'),
          createdAt: new Date(),
        };
        setUserProfile(basicProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Set a fallback admin profile on error
      const fallbackProfile: User = {
        id: uid,
        name: 'Admin User',
        email: 'admin@emaamul.com',
        role: 'admin',
        subscriptionStatus: 'active',
        expiryDate: new Date('2025-12-31'),
        createdAt: new Date(),
      };
      setUserProfile(fallbackProfile);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const isAdmin = userProfile?.role === 'admin';

  const value = {
    currentUser,
    userProfile,
    login,
    logout,
    loading,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
