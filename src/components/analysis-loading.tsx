import { PawPrint } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export default function AnalysisLoading() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-4 py-16">
      <div className="relative flex items-center justify-center h-24 w-24">
        <div className="absolute h-full w-full bg-primary/20 rounded-full animate-ping"></div>
        <PawPrint className="h-12 w-12 text-primary animate-pulse" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">{t('analysisLoading.title')}</h2>
      <p className="text-muted-foreground max-w-md" dangerouslySetInnerHTML={{ __html: t('analysisLoading.description') }} />
    </div>
  );
}
