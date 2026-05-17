import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getFirebase } from '../lib/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface User {
  username: string;
  role: 'admin' | 'student';
  uid?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, role: 'admin' | 'student') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const { auth, db } = getFirebase();

  useEffect(() => {
    if (!auth) return;
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // If we have a firebase user but no local state, try to recover from Firestore
        if (!user && db) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({ 
              username: data.username, 
              role: data.role,
              uid: firebaseUser.uid
            });
          }
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [auth, db]);

  const login = async (username: string, role: 'admin' | 'student') => {
    if (!auth || !db) {
      // Fallback for offline/no firebase
      setUser({ username, role });
      return;
    }

    try {
      // For demo purposes, we use Anonymous Auth and store the username/role in Firestore
      let uid: string;
      try {
        const cred = await signInAnonymously(auth);
        uid = cred.user.uid;
      } catch (authErr: any) {
        console.warn('Firebase Auth restricted, using persistent guest ID:', authErr.message);
        // Fallback to a stable ID based on username for demo consistency
        uid = `guest_${username.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      }
      
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        uid,
        username,
        role,
        lastLogin: serverTimestamp()
      }, { merge: true });

      // Log the login
      const logRef = doc(db, 'access_logs', `${uid}_${Date.now()}`);
      await setDoc(logRef, {
        userId: uid,
        username,
        timestamp: serverTimestamp(),
        action: 'login',
        details: `User logged in as ${role}`
      });

      setUser({ username, role, uid });
    } catch (error) {
      console.error('Final login fallback error:', error);
      // Fallback to local only
      setUser({ username, role });
    }
  };

  const logout = () => {
    if (auth) {
      auth.signOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
