
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ImageIcon, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type AdPosition = 'top' | 'middle' | 'bottom' | 'loading';

export default function AdBanner({ position }: { position: AdPosition }) {
  const { user } = useUser();
  const db = useFirestore();
  const [isPremium, setIsPremium] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (user && db) {
      getDoc(doc(db, 'users', user.uid)).then(snap => {
        if (snap.exists() && snap.data().isPremium) {
          setIsPremium(true);
        } else {
          setIsVisible(true);
        }
      });
    } else {
        setIsVisible(true);
    }
  }, [user, db]);

  // 프리미엄 사용자는 광고를 보지 않습니다 (수익 최적화: 유료 전환 유도)
  if (isPremium || !isVisible) return null;

  return (
    <div className={cn(
      "w-full overflow-hidden transition-all animate-in fade-in duration-1000",
      position === 'loading' ? "my-8" : "my-12"
    )}>
      <div className={cn(
        "relative rounded-[2rem] bg-muted/30 border border-dashed border-muted-foreground/20 flex flex-col items-center justify-center text-center group",
        position === 'loading' ? "min-h-[150px] p-6" : "min-h-[250px] p-10"
      )}>
        {/* 실제 애드센스 코드가 들어갈 자리 */}
        <div className="absolute top-2 right-4 flex items-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
          <Info size={10} />
          <span className="text-[8px] font-black uppercase tracking-widest">Sponsored</span>
        </div>
        
        <div className="space-y-4 opacity-40 group-hover:opacity-60 transition-opacity">
          <div className="bg-white/50 p-4 rounded-3xl inline-block shadow-sm">
            <ImageIcon className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black text-muted-foreground">Google AdSense / AdMob Placement</p>
            <p className="text-[10px] font-medium text-muted-foreground/80">
              {position === 'loading' ? "분석 리포트 생성 대기 중 노출되는 광고입니다." : "이 광고 수수료는 Pettner AI 엔진의 운영비로 사용됩니다."}
            </p>
          </div>
        </div>

        {/* 광고 제거 유도 버튼 (수익 창구 2: 유료 결제 유도) */}
        <button 
          onClick={() => window.location.href = '/account'}
          className="mt-6 text-[10px] font-black text-primary bg-white px-4 py-2 rounded-full shadow-sm hover:scale-105 transition-transform"
        >
          광고 없이 무제한으로 이용하기 →
        </button>
      </div>
    </div>
  );
}
