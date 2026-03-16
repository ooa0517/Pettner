
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import SplashScreen from '@/components/splash-screen';
import AuthScreen from '@/components/auth-screen';
import Dashboard from '@/components/dashboard';
import AnalyzerA from '@/components/analyzer-a';
import AnalyzerB from '@/components/analyzer-b';
import { Loader2 } from 'lucide-react';
import { doc } from 'firebase/firestore';

/**
 * Pettner Root Controller v25.0
 * - Authentication Enforcement
 * - Dashboard-driven Navigation
 * - Strict Mode Decoupling (A/B)
 */
export default function Home() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [showSplash, setShowSplash] = useState(true);
  const [currentMode, setCurrentMode] = useState<'dashboard' | 'analyzer-a' | 'analyzer-b'>('dashboard');

  // 사용자 데이터(사용량, 프리미엄 여부) 실시간 구독
  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  
  const { data: userData } = useDoc(userDocRef);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Step 1: Force Authentication
  if (!user) {
    return <AuthScreen />;
  }

  // Step 2 & 3: Personal Dashboard & Independent Analysis Rooms
  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      {currentMode === 'dashboard' && (
        <Dashboard 
          userData={userData}
          onSelectA={() => setCurrentMode('analyzer-a')} 
          onSelectB={() => setCurrentMode('analyzer-b')} 
        />
      )}
      {currentMode === 'analyzer-a' && (
        <AnalyzerA userData={userData} onBack={() => setCurrentMode('dashboard')} />
      )}
      {currentMode === 'analyzer-b' && (
        <AnalyzerB userData={userData} onBack={() => setCurrentMode('dashboard')} />
      )}
    </div>
  );
}
