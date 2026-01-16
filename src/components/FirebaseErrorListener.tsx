'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      if (process.env.NODE_ENV === 'development') {
        // In development, throw the error to show the Next.js overlay.
        // This provides a much better debugging experience.
        throw error;
      } else {
        // In production, you would typically log this to an error reporting service
        // and perhaps show a generic error message to the user.
        console.error("Firestore Permission Error:", error);
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  return null; // This component does not render anything.
}
