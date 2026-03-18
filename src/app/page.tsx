'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import SplashScreen from '@/components/splash-screen';
import { Loader2 } from 'lucide-react';
import { doc } from 'firebase/firestore';

/**
 * Pettner Root Controller v27.3
 * - Dynamic Import applied to resolve ChunkLoadError and optimize bundle size.
 * - Flow: Splash -> Authentication Check -> Dashboard -> Analysis Rooms
 */

// 중량 컴포넌트들을 동적으로 로드하여 초기 app/page 청크 크기를 줄입니다.
const AuthScreen = dynamic(() => import('@/components/auth-screen'), { 
  loading: () => <div className="flex items-center justify-center min-h-screen bg-[#F8F9FF]"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" /></div>,
  ssr: false 
});

const Dashboard = dynamic(() => import('@/components/dashboard'), { 
  ssr: false 
});

const AnalyzerA = dynamic(() => import('@/components/analyzer-a'), { 
  loading: () => <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>,
  ssr: false 
});

const AnalyzerB = dynamic(() => import('@/components/analyzer-b'), { 
  loading: () => <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>,
  ssr: false 
});

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
    // 스플래시 로고 노출 시간 (브랜드 여운 제공 및 초기 청크 로딩 시간 확보)
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Step 1: Splash Screen (Initial Entry)
  if (showSplash) {
    return <SplashScreen />;
  }

  // Step 2: Auth & Service Loading
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F9FF]">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  // Step 3: Unauthenticated Access
  if (!user) {
    return <AuthScreen />;
  }

  // Step 4: Authenticated Zone (Dynamic Mode Switching)
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
