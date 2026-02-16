'use client';

import { useMemo, useState, useEffect } from 'react';
import { 
  Camera, Sparkles, Dog, Cat, ShieldCheck, 
  CheckCircle2, Heart, Database, Stethoscope, 
  AlertCircle, ChevronRight, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type AnalysisFormValues = {
  petType: 'dog' | 'cat';
  analysisMode: 'general' | 'custom';
  productName: string;
  brandName: string;
  foodType: string;
  ingredientsText: string;
  image?: FileList;
  petProfile: {
    name: string;
    age: string;
    weight: string;
    neutered: string;
    breed: string;
    activityLevel: 'LOW' | 'NORMAL' | 'HIGH';
    bcs: 'THIN' | 'IDEAL' | 'OVERWEIGHT';
    environment: 'INDOOR' | 'MIXED';
    healthConditions: string[];
    allergies: string[];
  };
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
      analysisMode: z.enum(['general', 'custom']),
      productName: z.string().min(1, { message: '제품명을 입력해주세요.' }),
      brandName: z.string().optional(),
      foodType: z.string().min(1, { message: '제품 유형을 선택해주세요.' }),
      ingredientsText: z.string().optional(),
      image: imageSchema,
      petProfile: z.object({
        name: z.string().optional(),
        age: z.string().optional(),
        weight: z.string().optional(),
        neutered: z.string().optional(),
        breed: z.string().optional(),
        activityLevel: z.enum(['LOW', 'NORMAL', 'HIGH']).optional(),
        bcs: z.enum(['THIN', 'IDEAL', 'OVERWEIGHT']).optional(),
        environment: z.enum(['INDOOR', 'MIXED']).optional(),
        healthConditions: z.array(z.string()).optional(),
        allergies: z.array(z.string()).optional(),
      }),
    }).refine(data => data.ingredientsText || (data.image && data.image.length > 0), {
      message: '성분표 텍스트를 입력하거나 사진을 업로드해주세요.',
      path: ['image'], 
    });
  }, []);

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      petType: 'dog',
      analysisMode: 'custom',
      productName: '',
      brandName: '',
      foodType: 'dry',
      ingredientsText: '',
      petProfile: {
        name: '',
        age: '',
        weight: '',
        neutered: 'yes',
        breed: '',
        activityLevel: 'NORMAL',
        bcs: 'IDEAL',
        environment: 'INDOOR',
        healthConditions: [],
        allergies: [],
      }
    },
  });

  const selectedPet = form.watch('petType');
  const analysisMode = form.watch('analysisMode');
  const imageFile = form.watch('image');
  const selectedBreed = form.watch('petProfile.breed');

  // 품종별 AI 힌트 (보호자에게 알러지나 질환을 미리 제안)
  const [breedHint, setBreedHint] = useState<string | null>(null);

  useEffect(() => {
    if (selectedBreed && selectedBreed.length > 1) {
      if (selectedBreed.includes('말티즈') || selectedBreed.includes('포드') || selectedBreed.includes('푸들')) {
        setBreedHint('말티즈/푸들은 슬개골 탈구와 눈물 자국이 흔합니다. 관절 건강과 알러지 여부를 확인해보세요!');
      } else if (selectedBreed.includes('슈나우저')) {
        setBreedHint('슈나우저는 췌장염 위험이 높습니다. 지방 함량이 낮은 식단이 중요합니다.');
      } else if (selectedBreed.includes('페르시안')) {
        setBreedHint('페르시안은 유전적으로 신장 질환(PKD)에 취약합니다. 인 함량을 꼭 체크해야 합니다.');
      } else {
        setBreedHint(null);
      }
    } else {
      setBreedHint(null);
    }
  }, [selectedBreed]);

  const dogConditions = ['슬개골/관절', '눈물 자국/피부', '소화/설사', '다이어트', '심장'];
  const catConditions = ['신장/비뇨기', '헤어볼 관리', '음수량 부족', '다이어트', '치아'];
  const allergyList = ['닭고기', '소고기', '곡물(밀/옥수수)', '달걀', '유제품'];

  const isFormValid = form.watch('productName') && (form.watch('ingredientsText') || (imageFile && imageFile.length > 0));

  return (
    <TooltipProvider>
      <div className="space-y-8 max-w-2xl mx-auto pb-32 animate-in fade-in duration-700">
        
        <div className="text-center space-y-3">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full font-black text-xs tracking-widest uppercase">
            Vet-Based Analysis
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-foreground">
            {t('scannerHome.title')}
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            AI 수의사가 우리 아이 품종과 상태에 맞춰 분석해드려요.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card 
            className={cn(
              "cursor-pointer transition-all border-2 overflow-hidden relative",
              analysisMode === 'custom' ? "border-primary bg-primary/5 shadow-lg scale-[1.02]" : "border-muted"
            )}
            onClick={() => form.setValue('analysisMode', 'custom')}
          >
            <div className="p-5 flex flex-col items-center gap-2">
               <Stethoscope size={24} className={analysisMode === 'custom' ? "text-primary" : "text-muted-foreground"} />
               <p className="font-black text-sm text-center">우리 아이 맞춤 분석<br/><span className="text-[9px] font-medium opacity-60">추천 급여량 계산 포함</span></p>
            </div>
          </Card>
          <Card 
            className={cn(
              "cursor-pointer transition-all border-2 overflow-hidden relative",
              analysisMode === 'general' ? "border-primary bg-primary/5 shadow-lg scale-[1.02]" : "border-muted"
            )}
            onClick={() => form.setValue('analysisMode', 'general')}
          >
            <div className="p-5 flex flex-col items-center gap-2">
               <Database size={24} className={analysisMode === 'general' ? "text-primary" : "text-muted-foreground"} />
               <p className="font-black text-sm text-center">제품 성분만 분석<br/><span className="text-[9px] font-medium opacity-60">객관적 영양 농도 비교</span></p>
            </div>
          </Card>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onAnalyze)} className="space-y-10">
            
            {analysisMode === 'custom' && (
              <Card className="shadow-xl border-none ring-1 ring-black/5 rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="bg-muted/30 p-8 border-b">
                  <CardTitle className="flex items-center gap-3 text-xl font-black">
                    <Heart className="text-primary fill-primary" size={24} /> 
                    반려동물 정밀 프로필
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-10">
                  
                  <FormField
                    control={form.control}
                    name="petType"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4">
                            <Label htmlFor="dog" className={cn(
                              "flex flex-col items-center p-6 border-2 rounded-3xl cursor-pointer transition-all", 
                              selectedPet === 'dog' ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-muted"
                            )}>
                              <RadioGroupItem value="dog" id="dog" className="sr-only" />
                              <Dog size={32} className={cn("mb-2", selectedPet === 'dog' ? "text-primary" : "text-muted-foreground")} />
                              <span className="font-black">강아지</span>
                            </Label>
                            <Label htmlFor="cat" className={cn(
                              "flex flex-col items-center p-6 border-2 rounded-3xl cursor-pointer transition-all", 
                              selectedPet === 'cat' ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-muted"
                            )}>
                              <RadioGroupItem value="cat" id="cat" className="sr-only" />
                              <Cat size={32} className={cn("mb-2", selectedPet === 'cat' ? "text-primary" : "text-muted-foreground")} />
                              <span className="font-black">고양이</span>
                            </Label>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="petProfile.breed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">품종</FormLabel>
                          <FormControl>
                            <Input placeholder="예: 말티즈, 샴" className="h-12 rounded-xl" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="petProfile.weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">몸무게 (kg)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" placeholder="예: 5.5" className="h-12 rounded-xl" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {breedHint && (
                    <Alert className="bg-primary/5 border-primary/20 rounded-2xl animate-in slide-in-from-top-2">
                       <Sparkles className="h-4 w-4 text-primary" />
                       <AlertDescription className="text-xs font-bold text-primary">
                         {breedHint}
                       </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <Label className="font-bold flex items-center gap-1">건강 상태 / 알러지 <Info className="w-3 h-3 text-muted-foreground" /></Label>
                    <div className="flex flex-wrap gap-2">
                       {(selectedPet === 'dog' ? dogConditions : catConditions).map(condition => (
                         <Badge 
                           key={condition} 
                           variant={form.watch('petProfile.healthConditions')?.includes(condition) ? "default" : "outline"}
                           className="px-4 py-2 cursor-pointer rounded-full transition-all"
                           onClick={() => {
                             const current = form.getValues('petProfile.healthConditions') || [];
                             if (current.includes(condition)) {
                               form.setValue('petProfile.healthConditions', current.filter(c => c !== condition));
                             } else {
                               form.setValue('petProfile.healthConditions', [...current, condition]);
                             }
                           }}
                         >
                           {condition}
                         </Badge>
                       ))}
                       {allergyList.map(allergy => (
                         <Badge 
                           key={allergy} 
                           variant={form.watch('petProfile.allergies')?.includes(allergy) ? "destructive" : "outline"}
                           className="px-4 py-2 cursor-pointer rounded-full transition-all"
                           onClick={() => {
                             const current = form.getValues('petProfile.allergies') || [];
                             if (current.includes(allergy)) {
                               form.setValue('petProfile.allergies', current.filter(c => c !== allergy));
                             } else {
                               form.setValue('petProfile.allergies', [...current, allergy]);
                             }
                           }}
                         >
                           {allergy} 알러지
                         </Badge>
                       ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-xl border-none ring-1 ring-black/5 rounded-[2.5rem] bg-white overflow-hidden">
              <CardHeader className="bg-muted/30 p-8 border-b">
                <CardTitle className="flex items-center gap-3 text-xl font-black">
                  <Camera className="text-primary" size={24} /> 
                  분석할 제품 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <FormField
                    control={form.control}
                    name="image"
                    render={({ field: { onChange, name, onBlur, ref } }) => (
                        <FormItem>
                            <FormControl>
                              <div className={cn(
                                  "relative w-full aspect-video border-3 border-dashed rounded-[2rem] flex flex-col justify-center items-center text-center cursor-pointer transition-all",
                                  imageFile && imageFile.length > 0 ? "border-success bg-success/5" : "border-muted hover:border-primary hover:bg-primary/5"
                                )}>
                                  {imageFile && imageFile.length > 0 ? <CheckCircle2 className="h-12 w-12 text-success mb-2" /> : <Camera className="h-12 w-12 text-primary mb-2" />}
                                  <p className="text-sm font-black">{imageFile && imageFile.length > 0 ? "이미지 업로드 완료" : "라벨 사진 촬영 또는 업로드"}</p>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                    onChange={(e) => onChange(e.target.files)} 
                                  />
                              </div>
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="productName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">제품명 *</FormLabel>
                        <FormControl>
                          <Input placeholder="예: 인스팅트 오리지널" className="h-12 rounded-xl" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="foodType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">제품 유형 *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl">
                              <SelectValue placeholder="카테고리 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="dry">건식 사료 (Dry)</SelectItem>
                            <SelectItem value="wet">습식 사료 (Wet)</SelectItem>
                            <SelectItem value="treat">간식 (Treat)</SelectItem>
                            <SelectItem value="supplement">영양제 (Supplement)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Button 
                type="submit" 
                size="lg" 
                disabled={!isFormValid}
                className="w-full h-20 text-2xl font-black rounded-[2.5rem] shadow-2xl shadow-primary/40 transition-all bg-primary hover:bg-primary/90"
              >
                <Sparkles className="mr-3 h-8 w-8" />
                정밀 분석 리포트 생성
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </TooltipProvider>
  );
}
