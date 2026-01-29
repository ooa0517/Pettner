
'use client';

import { collection, addDoc, serverTimestamp, type Firestore } from 'firebase/firestore';
import type { AnalyzePetFoodIngredientsInput, AnalyzePetFoodIngredientsOutput } from '@/ai/flows/analyze-pet-food-ingredients';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// This type represents what is actually saved in Firestore.
// It's a subset of the full form input, tailored for history.
type UserInputForHistory = {
    petType: 'dog' | 'cat';
    productName: string;
    brandName: string;
    foodType: string;
    lifeStage: 'PUPPY' | 'ADULT' | 'SENIOR' | 'ALL_STAGES';
    ingredientsText: string;
    healthConditions: string;
    photoProvided: boolean;
};


export function saveAnalysisToHistory(
    db: Firestore, 
    userId: string, 
    userInput: UserInputForHistory, 
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
