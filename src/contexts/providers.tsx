'use client';

import { ReactNode, useEffect } from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { LanguageProvider, useLanguage } from '@/contexts/language-context';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import Header from '@/components/header';

function AppLayout({ children }: { children: ReactNode }) {
  const { language, t } = useLanguage();

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t('metadata.title');
  }, [language, t]);

  return (
    <>
      <FirebaseErrorListener />
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow flex flex-col">{children}</main>
      </div>
      <Toaster />
    </>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppLayout>{children}</AppLayout>
      </LanguageProvider>
    </AuthProvider>
  );
}
