'use client';

import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/language-context';

export default function FirebaseConfigError() {
  const { t } = useLanguage();

  const envContent = `NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...`;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg border-destructive shadow-2xl shadow-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <AlertTriangle className="text-destructive h-8 w-8" />
            {t('firebaseError.title')}
          </CardTitle>
          <CardDescription>
            {t('firebaseError.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p dangerouslySetInnerHTML={{ __html: t('firebaseError.instructions')}} />
          <div className="bg-muted p-4 rounded-md text-sm font-mono overflow-x-auto">
            <pre><code>{envContent}</code></pre>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('firebaseError.restart')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
