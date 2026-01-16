import { PawPrint } from 'lucide-react';

export default function AnalysisLoading() {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-4 py-16">
      <div className="relative flex items-center justify-center h-24 w-24">
        <div className="absolute h-full w-full bg-primary/20 rounded-full animate-ping"></div>
        <PawPrint className="h-12 w-12 text-primary animate-pulse" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">AI가 분석 중입니다...</h2>
      <p className="text-muted-foreground max-w-md">
        최신 과학 논문과 영양학 가이드라인을 기반으로<br/>
        사료 성분을 꼼꼼하게 살펴보고 있습니다.
      </p>
    </div>
  );
}
