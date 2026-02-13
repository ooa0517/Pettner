
'use client';

import { useMemo, useState } from 'react';
import { Camera, Sparkles, Dog, Cat, ShieldCheck, AlertTriangle, Info, Star, CheckCircle2 } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [isHovered, setIsHovered] = useState(false);
  
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
    <TooltipProvider>
      <div className="space-y-6 max-w-2xl mx-auto pb-32 animate-in fade-in duration-700">
        <Alert className="bg-primary/5 border-primary/20 shadow-sm rounded-2xl p-5">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <div className="ml-2">
            <AlertTitle className="text-primary font-black text-lg">초정밀 영양 검증 시스템</AlertTitle>
            <AlertDescription className="text-muted-foreground text-sm leading-relaxed mt-1">
              AAFCO(미국)와 FEDIAF(유럽)의 최신 가이드라인을 실시간으로 대조합니다. <br/>
              사진이 선명할수록 분석의 정확도가 올라갑니다.
            </div>
          </div>
        </Alert>

        <Card className="shadow-2xl border-none ring-1 ring-black/5 overflow-hidden rounded-[2.5rem] bg-white">
          <CardHeader className="p-10 text-center bg-gradient-to-b from-muted/30 to-white border-b border-muted/50">
            <div className="flex justify-center mb-4">
               <Badge className="bg-primary text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                  AI Ingredient Scanner
               </Badge>
            </div>
            <h1 className="text-4xl font-black font-headline tracking-tight text-foreground">성분 분석 스캔</h1>
            <CardDescription className="text-base pt-2">라벨의 '원료명'이 잘 보이게 찍어주세요.</CardDescription>
          </CardHeader>
          
          <CardContent className="p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onAnalyze)} className="space-y-10">

                <FormField
                  control={form.control}
                  name="petType"
                  render={({ field }) => (
                    <FormItem className="space-y-6">
                      <FormLabel className="text-xl font-black flex items-center gap-3">
                         <span className="w-2 h-8 bg-primary rounded-full" /> 
                         누구를 위한 분석인가요?
                      </FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-6">
                          <Label htmlFor="dog" className={cn(
                            "flex flex-col items-center p-8 border-2 rounded-[2rem] cursor-pointer transition-all duration-300", 
                            selectedPet === 'dog' ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-muted hover:bg-muted/30"
                          )}>
                            <RadioGroupItem value="dog" id="dog" className="sr-only" />
                            <div className={cn("p-4 rounded-full mb-4", selectedPet === 'dog' ? "bg-primary text-white" : "bg-muted")}>
                              <Dog className="h-10 w-10" />
                            </div>
                            <span className="font-black text-lg">강아지</span>
                          </Label>
                          <Label htmlFor="cat" className={cn(
                            "flex flex-col items-center p-8 border-2 rounded-[2rem] cursor-pointer transition-all duration-300", 
                            selectedPet === 'cat' ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-muted hover:bg-muted/30"
                          )}>
                            <RadioGroupItem value="cat" id="cat" className="sr-only" />
                            <div className={cn("p-4 rounded-full mb-4", selectedPet === 'cat' ? "bg-primary text-white" : "bg-muted")}>
                              <Cat className="h-10 w-10" />
                            </div>
                            <span className="font-black text-lg">고양이</span>
                          </Label>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-6">
                  <FormLabel className="text-xl font-black flex items-center gap-3">
                     <span className="w-2 h-8 bg-primary rounded-full" /> 성분표 캡처
                  </FormLabel>
                  <FormField
                      control={form.control}
                      name="image"
                      render={({ field: { onChange, value, ...rest } }) => (
                          <FormItem>
                              <FormControl>
                                <div 
                                  className={cn(
                                    "relative w-full aspect-video border-3 border-dashed rounded-[2rem] flex flex-col justify-center items-center text-center cursor-pointer transition-all duration-500",
                                    imageFile && imageFile.length > 0 ? "border-success bg-success/5" : "border-muted hover:border-primary hover:bg-primary/5 bg-muted/10"
                                  )}
                                >
                                    <div className={cn("p-6 rounded-full mb-4 shadow-inner", imageFile && imageFile.length > 0 ? "bg-success/20" : "bg-primary/10")}>
                                      {imageFile && imageFile.length > 0 ? <CheckCircle2 className="h-12 w-12 text-success" /> : <Camera className="h-12 w-12 text-primary" />}
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-lg font-black text-foreground">
                                          {imageFile && imageFile.length > 0 ? "촬영 완료!" : "카메라 아이콘을 눌러 촬영"}
                                      </p>
                                      <p className="text-sm text-muted-foreground px-10">
                                        {imageFile && imageFile.length > 0 ? imageFile[0].name : "사료/간식 라벨의 '원재료명'을 촬영하세요."}
                                      </p>
                                    </div>
                                    <Input 
                                      type="file" 
                                      accept="image/*" 
                                      capture="environment" 
                                      className="absolute inset-0 opacity-0 cursor-pointer" 
                                      onChange={(e) => onChange(e.target.files)} 
                                      {...rest} 
                                    />
                                </div>
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="productName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-foreground/80">제품명</FormLabel>
                        <FormControl>
                          <Input placeholder="예: 인스팅트 오리지널" className="h-14 rounded-xl border-2 focus:ring-primary" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="brandName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-foreground/80">브랜드명</FormLabel>
                        <FormControl>
                          <Input placeholder="예: 인스팅트 (Instinct)" className="h-14 rounded-xl border-2 focus:ring-primary" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="p-8 bg-gradient-to-br from-primary/10 to-indigo-50 rounded-[2rem] border-2 border-primary/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                      <Star size={100} fill="currentColor" className="text-primary" />
                    </div>
                    <div className="flex justify-between items-start mb-3">
                      <Badge className="bg-primary text-white font-bold px-3 py-1">PREMIUM MATCHING</Badge>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-5 h-5 text-primary/40 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs p-4">
                          <p className="font-bold mb-1">초개인화 정밀 매칭이란?</p>
                          <p className="text-xs leading-relaxed">아이의 품종 유전적 질환, 현재의 신체 상태(BCS), 산책량, 기저질환 등을 제품 성분과 입체적으로 대조하여 1:1 맞춤형 적합도 점수를 산출합니다.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <h4 className="text-xl font-black text-primary mb-2">우리 아이 맞춤형 분석 안내</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed pr-10">
                      품종별 유전 분석, 비만/알러지 1:1 매칭 등 <strong>초개인화 리포트</strong>는 마이페이지에서 정밀 프로필 등록(구독형) 후 이용하실 수 있습니다. 지금은 일반 성분 분석을 제공합니다.
                    </p>
                </div>

                <div className="flex items-center gap-3 p-4 bg-muted/40 rounded-2xl border border-muted-foreground/10">
                  <AlertTriangle className="w-5 h-5 text-muted-foreground shrink-0" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    본 분석은 최신 영양 가이드라인을 참조하지만 수의사의 직접 진료를 대신할 수 없습니다. 질환이 있는 경우 반드시 수의사와 먼저 상담하십시오.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className="w-full h-20 text-2xl font-black rounded-[2rem] shadow-2xl shadow-primary/40 hover:scale-[1.01] active:scale-95 transition-all bg-primary hover:bg-primary/90"
                >
                  <Sparkles className={cn("mr-3 h-8 w-8 transition-all", isHovered && "rotate-12 scale-125")} />
                  분석 리포트 생성 시작
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
