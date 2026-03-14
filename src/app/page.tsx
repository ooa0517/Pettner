
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import SplashScreen from '@/components/splash-screen';
import AuthScreen from '@/components/auth-screen';
import ModeSelector from '@/components/mode-selector';
import AnalyzerA from '@/components/analyzer-a';
import AnalyzerB from '@/components/analyzer-b';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const [showSplash, setShowSplash] = useState(true);
  const [currentMode, setCurrentMode] = useState<'select' | 'analyzer-a' | 'analyzer-b'>('select');

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

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      {currentMode === 'select' && (
        <ModeSelector 
          onSelectA={() => setCurrentMode('analyzer-a')} 
          onSelectB={() => setCurrentMode('analyzer-b')} 
        />
      )}
      {currentMode === 'analyzer-a' && (
        <AnalyzerA onBack={() => setCurrentMode('select')} />
      )}
      {currentMode === 'analyzer-b' && (
        <AnalyzerB onBack={() => setCurrentMode('select')} />
      )}
    </div>
  );
}
