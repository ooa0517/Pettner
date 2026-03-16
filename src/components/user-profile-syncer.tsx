'use client';

import { useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * 로그인한 사용자의 정보를 Firestore의 users 컬렉션과 자동으로 동기화하는 컴포넌트입니다.
 * 신규 사용자의 경우 기본 사용량 및 프리미엄 상태를 초기화합니다.
 */
export function UserProfileSyncer() {
  const { user } = useUser();
  const db = useFirestore();

  useEffect(() => {
    if (user && db) {
      const syncProfile = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        
        try {
          const userDoc = await getDoc(userDocRef);
          const today = new Date().toISOString().split('T')[0];
          
          const baseData = {
            id: user.uid,
            email: user.email,
            name: user.displayName || 'Pettner User',
            photoURL: user.photoURL,
            updatedAt: serverTimestamp(),
          };

          if (!userDoc.exists()) {
            // 신규 사용자 등록: 기본 필드 강제 초기화
            await setDoc(userDocRef, {
              ...baseData,
              isPremium: false,
              dailyUsageCount: 0,
              lastUsageDate: today,
              createdAt: serverTimestamp(),
            });
          } else {
            // 기존 사용자 정보 업데이트 (병합)
            await setDoc(userDocRef, baseData, { merge: true });
          }
        } catch (error: any) {
          if (error.code === 'permission-denied') {
             errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'write',
                requestResourceData: { uid: user.uid }
             }));
          }
        }
      };

      syncProfile();
    }
  }, [user, db]);

  return null;
}
