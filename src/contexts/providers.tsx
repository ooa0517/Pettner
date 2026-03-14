
'use client';

import { ReactNode, useEffect } from 'react';
import { useUser } from '@/firebase';
import { LanguageProvider, useLanguage } from '@/contexts/language-context';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import Header from '@/components/header';
import { UserProfileSyncer } from '@/components/user-profile-syncer';

function AppLayout({ children }: { children: ReactNode }) {
  const { language, t } = useLanguage();
  const { isUserLoading } = useUser();

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t('metadata.title');
  }, [language, t]);

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
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
