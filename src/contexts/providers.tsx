'use client';

import { ReactNode, useEffect } from 'react';
import { LanguageProvider, useLanguage } from '@/contexts/language-context';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import Header from '@/components/header';
import { UserProfileSyncer } from '@/components/user-profile-syncer';

function AppLayout({ children }: { children: ReactNode }) {
  const { language, t } = useLanguage();

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t('metadata.title');
  }, [language, t]);

  return (
    <>
      <FirebaseErrorListener />
      <UserProfileSyncer />
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
    <LanguageProvider>
      <AppLayout>{children}</AppLayout>
    </LanguageProvider>
  );
}
