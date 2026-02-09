
'use client';

import { useMemo } from 'react';
import { Camera, Sparkles, HeartPulse, FileText, Package, Building, Pilcrow, Dog, Cat, Info, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/language-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type AnalysisFormValues = {
  petType: 'dog' | 'cat';
  productName: string;
  brandName: string;
  foodType: string;
  lifeStage: 'PUPPY' | 'ADULT' | 'SENIOR' | 'GERIATRIC' | 'ALL_STAGES';
  ingredientsText: string;
  healthConditions: string;
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
      petType: z.enum(['dog', 'cat'], { required_error: t('scannerHome.petTypeRequired') }),
      productName: z.string().min(1, { message: t('scannerHome.productNameRequired') }),
      brandName: z.string().optional(),
      foodType: z.string().optional(),
      lifeStage: z.enum(['PUPPY' , 'ADULT' , 'SENIOR' , 'GERIATRIC' , 'ALL_STAGES']).optional().default('ADULT'),
      ingredientsText: z.string().optional(),
      healthConditions: z.string().optional(),
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
      lifeStage: 'ADULT',
      ingredientsText: '',
      healthConditions: '',
    },
  });

  const selectedPet = form.watch('petType');
  const imageFile = form.watch('image');

  const onSubmit = (data: AnalysisFormValues) => {
    onAnalyze(data);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      <Alert className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary font-bold">Free Beta Service</AlertTitle>
        <AlertDescription className="text-muted-foreground text-sm">
          누구나 무료로 먹거리 성분을 분석할 수 있습니다. <br/>
          <strong>아이 맞춤형 정밀 분석</strong>은 프로필 등록 후 이용 가능합니다.
        </AlertDescription>
      </Alert>

      <Card className="shadow-2xl shadow-primary/10 animate-in fade-in-50 duration-700 border-primary/20 overflow-hidden">
        <CardHeader className="p-8 md:p-10 text-center bg-muted/30 border-b">
          <h1 className="text-3xl font-extrabold font-headline tracking-tight">먹거리 영양 분석</h1>
          <CardDescription className="text-muted-foreground pt-2 text-base">
            제품 라벨을 촬영하여 성분의 안전성을 확인하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              <FormField
                control={form.control}
                name="petType"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-lg font-bold flex items-center gap-2">
                       <span className="w-1.5 h-6 bg-primary rounded-full" />
                       분석 대상
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div className="relative">
                          <RadioGroupItem value="dog" id="dog" className="sr-only" />
                          <Label
                            htmlFor="dog"
                            className={cn(
                              "flex flex-col items-center justify-center rounded-2xl border-2 p-6 cursor-pointer transition-all hover:bg-primary/5",
                              selectedPet === 'dog' ? "border-primary bg-primary/10 shadow-lg" : "border-muted bg-popover"
                            )}
                          >
                            <Dog className={cn("mb-3 h-10 w-10 transition-colors", selectedPet === 'dog' ? "text-primary" : "text-muted-foreground")} />
                            <span className={cn("font-bold text-lg", selectedPet === 'dog' ? "text-primary" : "text-muted-foreground")}>강아지</span>
                          </Label>
                        </div>
                        <div className="relative">
                          <RadioGroupItem value="cat" id="cat" className="sr-only" />
                          <Label
                            htmlFor="cat"
                            className={cn(
                              "flex flex-col items-center justify-center rounded-2xl border-2 p-6 cursor-pointer transition-all hover:bg-primary/5",
                              selectedPet === 'cat' ? "border-primary bg-primary/10 shadow-lg" : "border-muted bg-popover"
                            )}
                          >
                            <Cat className={cn("mb-3 h-10 w-10 transition-colors", selectedPet === 'cat' ? "text-primary" : "text-muted-foreground")} />
                            <span className={cn("font-bold text-lg", selectedPet === 'cat' ? "text-primary" : "text-muted-foreground")}>고양이</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel className="text-lg font-bold flex items-center gap-2">
                   <span className="w-1.5 h-6 bg-primary rounded-full" />
                   라벨 사진 촬영
                </FormLabel>
                <FormField
                    control={form.control}
                    name="image"
                    render={({ field: { onChange, value, ...rest } }) => (
                        <FormItem>
                            <FormControl>
                              <div className="relative w-full h-48 border-2 border-dashed rounded-2xl flex flex-col justify-center items-center text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all bg-muted/20 group">
                                  <div className="p-4 bg-white rounded-full shadow-md group-hover:scale-110 transition-transform">
                                    <Camera className="h-8 w-8 text-primary" />
                                  </div>
                                  <div className="mt-4 px-4">
                                      {imageFile && imageFile.length > 0 ? (
                                          <p className="font-bold text-primary truncate max-w-xs">{imageFile[0].name}</p>
                                      ) : (
                                          <p className="text-sm text-muted-foreground">라벨의 '원료명'이 잘 보이게 찍어주세요.</p>
                                      )}
                                  </div>
                                  <Input 
                                      type="file" 
                                      accept="image/*" 
                                      capture="environment"
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                      onChange={(e) => onChange(e.target.files)}
                                      {...rest}
                                  />
                              </div>
                            </FormControl>
                            <FormDescription className="text-center mt-2">사료, 간식, 영양제 라벨 모두 가능합니다.</FormDescription>
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
                      <FormLabel className="font-bold flex items-center gap-2"><Package className="w-4 h-4 text-primary"/>제품명</FormLabel>
                      <FormControl>
                        <Input className="rounded-xl" placeholder="제품 이름을 적어주세요" {...field} />
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
                      <FormLabel className="font-bold flex items-center gap-2"><Building className="w-4 h-4 text-primary"/>브랜드명 (선택)</FormLabel>
                      <FormControl>
                        <Input className="rounded-xl" placeholder="브랜드를 아신다면 적어주세요" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 relative overflow-hidden group">
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-primary text-white text-[10px] animate-pulse">PREMIUM</Badge>
                  </div>
                  <h4 className="font-bold text-primary flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 fill-primary"/>
                    맞춤 정밀 분석 (유료 서비스)
                  </h4>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                    기저질환(신장질환, 알러지 등)과 생애주기를 반영한 정밀 리포트는 <strong>구독형 서비스</strong>에서 제공됩니다. <br/>
                    현재는 제품의 일반 성분 분석만 제공됩니다.
                  </p>
                  <Button variant="outline" size="sm" className="w-full text-xs" disabled>
                    구독 서비스 준비 중
                  </Button>
              </div>

              <div className="pt-6">
                <Button type="submit" size="lg" className="w-full text-xl py-8 rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all duration-300 transform hover:scale-[1.02]">
                  <Sparkles className="mr-3 h-6 w-6" />
                  분석 시작하기
                </Button>
              </div>

              <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                      직접 입력 (선택)
                      </span>
                  </div>
              </div>

              <FormField
                  control={form.control}
                  name="ingredientsText"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea className="rounded-xl" placeholder="라벨의 원료명을 텍스트로 복사해서 넣으셔도 됩니다." {...field} rows={3}/>
                      </FormControl>
                    </FormItem>
                  )}
                />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
