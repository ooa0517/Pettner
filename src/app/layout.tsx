
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/contexts/providers';

export const viewport: Viewport = {
  themeColor: '#4B45ED',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Pettner | 수의 영양학 기반 성분 분석기',
  description: 'AI 수의사 선생님이 꼼꼼하게 분석해주는 우리 아이 사료 성분 리포트. 이제 스마트하게 급여하세요!',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Pettner',
  },
  openGraph: {
    type: 'website',
    siteName: 'Pettner',
    title: 'Pettner | 반려동물 사료 성분 분석기',
    description: '사진 한 장으로 끝내는 우리 아이 맞춤 영양 분석 리포트',
    images: [
      {
        url: 'https://picsum.photos/seed/pettner-og/1200/630',
        width: 1200,
        height: 630,
        alt: 'Pettner 분석기 미리보기',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pettner | 반려동물 사료 성분 분석기',
    description: '수의사가 알려주는 진짜 사료 이야기',
    images: ['https://picsum.photos/seed/pettner-og/1200/630'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Poppins:wght@600;800&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="https://picsum.photos/seed/pettner-pwa-192/192/192" />
      </head>
      <body className="font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
