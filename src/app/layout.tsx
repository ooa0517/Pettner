'use client';

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/contexts/providers';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import Script from 'next/script';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Poppins:wght@600;800&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="https://picsum.photos/seed/pettner-pwa-192/192/192" />
        {/* 토스페이먼츠 SDK 로드 */}
        <Script src="https://js.tosspayments.com/v1/payment" strategy="beforeInteractive" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <Providers>{children}</Providers>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
