'use client';

import { useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * 로그인한 사용자의 정보를 Firestore의 users 컬렉션과 자동으로 동기화하는 컴포넌트입니다.
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
          
          const userData = {
            id: user.uid,
            email: user.email,
            name: user.displayName || 'Pettner User',
            photoURL: user.photoURL,
            updatedAt: serverTimestamp(),
          };

          if (!userDoc.exists()) {
            // 신규 사용자 등록
            await setDoc(userDocRef, {
              ...userData,
              createdAt: serverTimestamp(),
            });
          } else {
            // 기존 사용자 정보 업데이트
            await setDoc(userDocRef, userData, { merge: true });
          }
        } catch (error: any) {
          // 권한 오류 발생 시 에러 이미터로 전달
          if (error.code === 'permission-denied') {
             errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'write',
                requestResourceData: { uid: user.uid, email: user.email }
             }));
          }
        }
      };

      syncProfile();
    }
  }, [user, db]);

  return null;
}
