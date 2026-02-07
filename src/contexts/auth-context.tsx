
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isFirebaseReady: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isFirebaseReady: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isFirebaseReady = !!auth;

  useEffect(() => {
    if (auth && db) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          // 사용자의 닉네임과 정보를 Firestore에 동기화 (가족 공유 기능 등을 위해 필수로 저장)
          const userData = {
            id: user.uid,
            email: user.email,
            name: user.displayName || 'Pettner User',
            photoURL: user.photoURL,
            updatedAt: serverTimestamp(),
          };

          if (!userDoc.exists()) {
            // 신규 사용자 등록
            setDoc(userDocRef, {
              ...userData,
              createdAt: serverTimestamp(),
            }).catch((serverError) => {
              const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'create',
                requestResourceData: userData,
              });
              errorEmitter.emit('permission-error', permissionError);
            });
          } else {
            // 기존 사용자 정보 업데이트 (닉네임 변경 등 반영)
            setDoc(userDocRef, userData, { merge: true }).catch((serverError) => {
              const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'update',
                requestResourceData: userData,
              });
              errorEmitter.emit('permission-error', permissionError);
            });
          }
          setUser(user);
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isFirebaseReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
