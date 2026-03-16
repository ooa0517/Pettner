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
 * Pettner Root Controller v26.0
 * - Flow: Splash -> Authentication Check -> Dashboard -> Analysis Rooms
 * - Strict Mode Decoupling (Analyzer_A / Analyzer_B)
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
    // 스플래시 로고 노출 시간 (2.5초로 브랜드 여운 제공)
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Step 1: Splash Screen
  if (showSplash) {
    return <SplashScreen />;
  }

  // Step 2: Auth Loading (스플래시 이후 로딩 중일 때)
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F9FF]">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  // Step 3: High-End Authentication Screen (로그인하지 않은 경우)
  if (!user) {
    return <AuthScreen />;
  }

  // Step 4: Authenticated Zone (Dashboard & Independent Analysis Rooms)
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
