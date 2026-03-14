
'use client';

import { 
  Sparkles, 
  ArrowRight, 
  ShoppingBag,
  Target,
  Gavel,
  ShieldCheck,
  Microscope,
  Scale,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useUser();

  const handleStart = () => {
    if (user) {
      window.location.reload(); // 리프레시하여 ScannerHome으로 진입
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="space-y-24 py-12 animate-in fade-in duration-1000">
      {/* Hero Section */}
      <div className="text-center space-y-8 max-w-3xl mx-auto">
        <Badge className="bg-primary/10 text-primary border-none px-6 py-2 rounded-full font-black text-xs tracking-widest uppercase animate-bounce">
          Pettner Precision v21.0
        </Badge>
        <h1 className="text-6xl md:text-7xl font-black font-headline tracking-tighter text-foreground leading-none">
          사료 한 알의 <br/><span className="text-primary">과학적 진실</span>
        </h1>
        <p className="text-xl text-muted-foreground font-medium leading-relaxed">
          5,000편 이상의 수의 영양학 논문과 AAFCO 표준을 기반으로 <br className="hidden md:block"/>
          우리 아이에게 딱 맞는 사료인지 1초 만에 분석합니다.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
          <Button onClick={handleStart} size="lg" className="h-20 px-12 rounded-[2rem] text-2xl font-black shadow-2xl shadow-primary/30 hover:scale-105 transition-all">
            분석 시작하기 <ArrowRight className="ml-3" />
          </Button>
          {!user && (
            <Button asChild variant="outline" size="lg" className="h-20 px-12 rounded-[2rem] text-xl font-bold border-2">
              <Link href="/login">기존 회원 로그인</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Feature Split Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CardFeature 
          icon={<ShoppingBag size={48} className="text-primary opacity-20" />}
          title="제품 성분 분석 (General)"
          desc="AAFCO 기준 충족 여부, 원재료 품질, 제조 공정 투명성을 객관적으로 감사하여 사료의 등급을 매깁니다."
          badges={["Grade A~F", "AAFCO 가이드라인", "ESG 제조 감사"]}
          onClick={handleStart}
        />
        <CardFeature 
          icon={<Target size={48} className="text-primary" />}
          title="우리 아이 맞춤 매칭 (Custom)"
          desc="아이의 알레르기, 질환, 나이를 고려하여 사료와의 상성을 %로 환산하고 전용 메디컬 리포트를 생성합니다."
          badges={["1:1 상성 매칭", "알레르기 필터링", "맞춤 급여량"]}
          highlight
          onClick={handleStart}
        />
      </div>

      {/* Trust Section */}
      <div className="bg-white rounded-[4rem] p-16 shadow-2xl space-y-12 text-center">
        <h2 className="text-4xl font-black tracking-tight">왜 Pettner인가?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatItem label="분석 논문 데이터" val="5,000+" />
          <StatItem label="주의 성분 DB" val="200+" />
          <StatItem label="누적 분석 리포트" val="12만+" />
          <StatItem label="수의 영양학자 협업" val="100%" />
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BenefitCard icon={<Microscope />} title="과학적 근거" desc="AVMA, NRC 가이드라인을 기반으로 한 정밀 알고리즘" />
        <CardFeatureBenefit icon={<ShieldCheck />} title="리스크 필터링" desc="입력된 질환 및 알러지 유발 성분 즉시 탐지" />
        <CardFeatureBenefit icon={<Scale />} title="정밀 급여 계산" desc="논문 권장 칼로리(30~50kcal/kg) 기반 맞춤 설계" />
        <CardFeatureBenefit icon={<Zap />} title="실시간 리포트" desc="촬영 즉시 생성되는 전문가 수준의 수의 진단서" />
      </div>

      {/* Footer Disclaimer */}
      <div className="text-center space-y-4 opacity-50 max-w-2xl mx-auto pb-20">
        <div className="flex items-center justify-center gap-2">
          <Gavel size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Medical Disclaimer</span>
        </div>
        <p className="text-[10px] leading-relaxed font-medium">
          Pettner는 AI 기술과 수의 영양학 데이터를 활용한 분석 도구이며, 수의사의 직접적인 진료를 대신할 수 없습니다. <br/>
          심각한 질환이 있는 경우 반드시 전문 수의사의 상담을 받으시기 바랍니다.
        </p>
      </div>
    </div>
  );
}

function CardFeature({ icon, title, desc, badges, highlight = false, onClick }: any) {
  return (
    <div onClick={onClick} className={cn(
      "p-12 rounded-[3.5rem] shadow-xl transition-all cursor-pointer hover:scale-[1.02]",
      highlight ? "bg-primary text-white" : "bg-white text-foreground"
    )}>
      <div className="space-y-6">
        <div className={cn("p-4 rounded-3xl inline-block", highlight ? "bg-white/20" : "bg-muted")}>
          {icon}
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-black">{title}</h3>
          <p className={cn("text-lg font-medium opacity-80", highlight ? "text-white/80" : "text-muted-foreground")}>
            {desc}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {badges.map((b: string) => (
            <Badge key={b} variant="outline" className={cn("rounded-full px-4 py-1 font-bold", highlight ? "border-white/30 text-white" : "border-primary/20 text-primary")}>
              {b}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, val }: any) {
  return (
    <div className="space-y-1">
      <p className="text-4xl font-black text-primary tracking-tighter">{val}</p>
      <p className="text-xs font-bold text-muted-foreground uppercase">{label}</p>
    </div>
  );
}

function BenefitCard({ icon, title, desc }: any) {
  return (
    <div className="p-8 bg-white rounded-[2.5rem] shadow-lg space-y-4 hover:shadow-xl transition-shadow">
      <div className="p-3 bg-primary/10 text-primary rounded-2xl w-fit">
        {icon}
      </div>
      <div className="space-y-1">
        <h4 className="font-black text-lg">{title}</h4>
        <p className="text-sm text-muted-foreground font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function CardFeatureBenefit({ icon, title, desc }: any) {
  return <BenefitCard icon={icon} title={title} desc={desc} />;
}

import { cn } from '@/lib/utils';
