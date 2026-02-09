
'use client';

import { useMemo } from 'react';
import { Camera, Sparkles, Dog, Cat, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/language-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type AnalysisFormValues = {
  petType: 'dog' | 'cat';
  productName: string;
  brandName: string;
  foodType: string;
  ingredientsText: string;
  image?: FileList;
};

type ScannerHomeProps = {
  onAnalyze: (data: AnalysisFormValues) => void;
};

export default function ScannerHome({ onAnalyze }: ScannerHomeProps) {
  const { t } = useLanguage();
  
  const formSchema = useMemo(() => {
    const imageSchema = typeof window !== 'undefined' 
      ? z.instanceof(FileList).optional() 
      : z.any().optional();

    return z.object({
      petType: z.enum(['dog', 'cat']),
      productName: z.string().min(1, { message: t('scannerHome.productNameRequired') }),
      brandName: z.string().optional(),
      foodType: z.string().optional().default('dry'),
      ingredientsText: z.string().optional(),
      image: imageSchema,
    }).refine(data => data.ingredientsText || (data.image && data.image.length > 0), {
      message: t('scannerHome.inputRequired'),
      path: ['image'], 
    });
  }, [t]);

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      petType: 'dog',
      productName: '',
      brandName: '',
      foodType: 'dry',
      ingredientsText: '',
    },
  });

  const selectedPet = form.watch('petType');
  const imageFile = form.watch('image');

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20">
      <Alert className="bg-primary/5 border-primary/20 shadow-sm">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <AlertTitle className="text-primary font-bold">글로벌 영양 표준 준수 (AAFCO/FEDIAF)</AlertTitle>
        <AlertDescription className="text-muted-foreground text-xs leading-relaxed">
          Pettner는 미국, 유럽의 글로벌 영양 가이드라인에 맞춰 성분을 분석합니다. <br/>
          본 분석 결과는 참고용이며, 수의사의 진단을 대체할 수 없습니다.
        </AlertDescription>
      </Alert>

      <Card className="shadow-2xl border-primary/20 overflow-hidden">
        <CardHeader className="p-8 text-center bg-muted/20 border-b">
          <h1 className="text-3xl font-black font-headline tracking-tight">영양 성분 정밀 분석</h1>
          <CardDescription className="pt-2">라벨 사진 한 장으로 시작하는 전문가급 성분 분석</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onAnalyze)} className="space-y-8">

              <FormField
                control={form.control}
                name="petType"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-lg font-bold flex items-center gap-2">
                       <span className="w-1.5 h-6 bg-primary rounded-full" /> 분석 대상
                    </FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4">
                        <Label htmlFor="dog" className={cn("flex flex-col items-center p-6 border-2 rounded-2xl cursor-pointer transition-all", selectedPet === 'dog' ? "border-primary bg-primary/5 shadow-lg" : "border-muted")}>
                          <RadioGroupItem value="dog" id="dog" className="sr-only" />
                          <Dog className={cn("mb-3 h-10 w-10", selectedPet === 'dog' ? "text-primary" : "text-muted-foreground")} />
                          <span className="font-bold">강아지</span>
                        </Label>
                        <Label htmlFor="cat" className={cn("flex flex-col items-center p-6 border-2 rounded-2xl cursor-pointer transition-all", selectedPet === 'cat' ? "border-primary bg-primary/5 shadow-lg" : "border-muted")}>
                          <RadioGroupItem value="cat" id="cat" className="sr-only" />
                          <Cat className={cn("mb-3 h-10 w-10", selectedPet === 'cat' ? "text-primary" : "text-muted-foreground")} />
                          <span className="font-bold">고양이</span>
                        </Label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel className="text-lg font-bold flex items-center gap-2">
                   <span className="w-1.5 h-6 bg-primary rounded-full" /> 성분표 촬영
                </FormLabel>
                <FormField
                    control={form.control}
                    name="image"
                    render={({ field: { onChange, value, ...rest } }) => (
                        <FormItem>
                            <FormControl>
                              <div className="relative w-full h-40 border-2 border-dashed rounded-2xl flex flex-col justify-center items-center text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all bg-muted/10">
                                  <Camera className="h-10 w-10 text-primary mb-2" />
                                  <p className="text-sm font-medium">
                                      {imageFile && imageFile.length > 0 ? imageFile[0].name : "라벨의 '원료명'을 촬영해 주세요."}
                                  </p>
                                  <Input type="file" accept="image/*" capture="environment" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => onChange(e.target.files)} {...rest} />
                              </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">제품명</FormLabel>
                      <FormControl><Input placeholder="예: 인스팅트 오리지널" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brandName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">브랜드명</FormLabel>
                      <FormControl><Input placeholder="예: 인스팅트" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="p-6 bg-primary/5 rounded-2xl border-2 border-primary/20 relative">
                  <Badge className="absolute -top-3 right-4 bg-primary text-white">PREMIUM PREVIEW</Badge>
                  <h4 className="font-bold text-primary flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 fill-primary"/> 정밀 매칭 (유료 서비스 안내)
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    품종별 유전 질환, 비만, 알러지 등 <strong>초개인화 맞춤 분석</strong>은 마이페이지에서 정밀 프로필 등록(구독형) 후 이용하실 수 있습니다. 현재는 일반 성분 분석을 제공합니다.
                  </p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-muted-foreground shrink-0" />
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {t('scannerHome.legalDisclaimer')}
                </p>
              </div>

              <Button type="submit" size="lg" className="w-full h-16 text-xl rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] transition-transform">
                <Sparkles className="mr-2 h-6 w-6" /> 분석 리포트 생성
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
