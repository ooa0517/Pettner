
'use client';

import { collection, addDoc, serverTimestamp, type Firestore } from 'firebase/firestore';
import type { AnalyzePetFoodIngredientsInput, AnalyzePetFoodIngredientsOutput } from '@/ai/flows/analyze-pet-food-ingredients';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// This function now saves both the user's input and the AI's output.
export function saveAnalysisToHistory(
    db: Firestore, 
    userId: string, 
    userInput: Omit<AnalyzePetFoodIngredientsInput, 'language' | 'photoDataUri' | 'ingredientsText' | 'brandName' | 'foodType' | 'healthConditions'> & { ingredientsText?: string; brandName?: string, foodType?: string, healthConditions?: string, photoProvided: boolean }, 
    analysisOutput: AnalyzePetFoodIngredientsOutput
) {
  if (!userId) return;

  const historyCollectionRef = collection(db, 'users', userId, 'analysisHistory');
  
  const dataToSave = {
    userInput: userInput,
    analysisOutput: analysisOutput,
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
