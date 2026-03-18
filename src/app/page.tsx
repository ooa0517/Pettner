'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import SplashScreen from '@/components/splash-screen';
import { Loader2 } from 'lucide-react';
import { doc } from 'firebase/firestore';

/**
 * Pettner Root Controller v29.0
 * - Unified Flow: Dashboard -> Unified Scanning -> Master Report
 */

const AuthScreen = dynamic(() => import('@/components/auth-screen'), { 
  loading: () => <div className="flex items-center justify-center min-h-screen bg-[#F8F9FF]"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" /></div>,
  ssr: false 
});

const Dashboard = dynamic(() => import('@/components/dashboard'), { 
  ssr: false 
});

const UnifiedAnalyzer = dynamic(() => import('@/components/unified-analyzer'), { 
  loading: () => <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>,
  ssr: false 
});

export default function Home() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [showSplash, setShowSplash] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  
  const { data: userData } = useDoc(userDocRef);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F9FF]">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      {isAnalyzing ? (
        <UnifiedAnalyzer 
          userData={userData} 
          onBack={() => setIsAnalyzing(false)} 
        />
      ) : (
        <Dashboard 
          userData={userData}
          onStartAnalysis={() => setIsAnalyzing(true)}
        />
      )}
    </div>
  );
}
