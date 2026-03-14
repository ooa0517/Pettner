
'use client';

import { collection, addDoc, serverTimestamp, type Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * 분석 결과를 Firebase Firestore에 저장합니다.
 * A/B 타입 구분을 지원합니다.
 */
export function saveAnalysisToHistory(
    db: Firestore, 
    userId: string, 
    type: 'A' | 'B',
    userInput: any, 
    analysisOutput: any
) {
  if (!userId || !db) return;

  const historyCollectionRef = collection(db, 'users', userId, 'analysisHistory');
  
  const dataToSave = {
    type,
    userInput,
    analysisOutput,
    createdAt: serverTimestamp(),
  };

  addDoc(historyCollectionRef, dataToSave)
    .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: historyCollectionRef.path,
            operation: 'create',
            requestResourceData: dataToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}
