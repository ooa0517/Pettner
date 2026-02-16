
'use client';

import { useMemo, useState, useEffect } from 'react';
import { 
  Camera, Sparkles, Dog, Cat, ShieldCheck, 
  CheckCircle2, Heart, Database, Stethoscope, 
  AlertCircle, ChevronRight, Info, Activity, Calendar
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
        name: z.string().min(1, '이름을 입력해주세요'),
        age: z.string().min(1, '나이를 입력해주세요'),
        weight: z.string().min(1, '몸무게를 입력해주세요'),
        neutered: z.enum(['yes', 'no']),
        breed: z.string().min(1, '품종을 입력해주세요'),
        activityLevel: z.enum(['LOW', 'NORMAL', 'HIGH']),
        bcs: z.enum(['THIN', 'IDEAL', 'OVERWEIGHT']).optional(),
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
        healthConditions: [],
        allergies: [],
      }
    },
  });

  const selectedPet = form.watch('petType');
  const analysisMode = form.watch('analysisMode');
  const imageFile = form.watch('image');
  const selectedBreed = form.watch('petProfile.breed');

  const [breedHint, setBreedHint] = useState<string | null>(null);

  useEffect(() => {
    if (selectedBreed && selectedBreed.length > 1) {
      if (selectedBreed.includes('말티즈') || selectedBreed.includes('푸들') || selectedBreed.includes('비숑')) {
        setBreedHint(`${selectedBreed}는 슬개골 탈구와 눈물 자국이 흔해요. 관절 강화 성분을 꼼꼼히 체크해 드릴게요!`);
      } else if (selectedBreed.includes('슈나우저') || selectedBreed.includes('코커')) {
        setBreedHint(`${selectedBreed}는 고지혈증과 췌장염 위험이 있어요. 지방 함량을 주의 깊게 분석할게요.`);
      } else if (selectedBreed.includes('페르시안') || selectedBreed.includes('러시안')) {
        setBreedHint(`${selectedBreed}는 신장 질환 유전율이 높아요. 인(P) 수치를 핵심적으로 살펴볼게요.`);
      } else {
        setBreedHint(null);
      }
    } else {
      setBreedHint(null);
    }
  }, [selectedBreed]);

  const dogConditions = ['슬개골/관절', '눈물 자국', '피부 알러지', '비만 관리', '심장 건강'];
  const catConditions = ['신장/비뇨기', '헤어볼', '심장 건강', '비만 관리', '구강 건강'];

  const isFormValid = form.watch('productName') && (form.watch('ingredientsText') || (imageFile && imageFile.length > 0)) && (analysisMode === 'general' || (form.watch('petProfile.age') && form.watch('petProfile.weight')));

  return (
    <TooltipProvider>
      <div className="space-y-10 max-w-2xl mx-auto pb-40 animate-in fade-in duration-700">
        
        <div className="text-center space-y-4">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-5 py-2 rounded-full font-black text-xs tracking-widest uppercase">
            Vet-Engine v4.0 Active
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-foreground leading-tight">
            {t('scannerHome.title')}
          </h1>
          <p className="text-muted-foreground text-sm font-medium px-4">
            {t('scannerHome.description')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 px-4">
          <Card 
            className={cn(
              "cursor-pointer transition-all border-2 rounded-3xl overflow-hidden relative",
              analysisMode === 'custom' ? "border-primary bg-primary/5 shadow-xl scale-[1.02]" : "border-muted opacity-60"
            )}
            onClick={() => form.setValue('analysisMode', 'custom')}
          >
            <div className="p-6 flex flex-col items-center gap-3">
               <Stethoscope size={28} className={analysisMode === 'custom' ? "text-primary" : "text-muted-foreground"} />
               <p className="font-black text-sm text-center">{t('scannerHome.modeCustom')}<br/><span className="text-[10px] font-bold opacity-60">{t('scannerHome.modeCustomSub')}</span></p>
            </div>
          </Card>
          <Card 
            className={cn(
              "cursor-pointer transition-all border-2 rounded-3xl overflow-hidden relative",
              analysisMode === 'general' ? "border-primary bg-primary/5 shadow-xl scale-[1.02]" : "border-muted opacity-60"
            )}
            onClick={() => form.setValue('analysisMode', 'general')}
          >
            <div className="p-6 flex flex-col items-center gap-3">
               <Database size={28} className={analysisMode === 'general' ? "text-primary" : "text-muted-foreground"} />
               <p className="font-black text-sm text-center">{t('scannerHome.modeGeneral')}<br/><span className="text-[10px] font-bold opacity-60">{t('scannerHome.modeGeneralSub')}</span></p>
            </div>
          </Card>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onAnalyze)} className="space-y-10 px-4">
            
            {analysisMode === 'custom' && (
              <Card className="shadow-2xl border-none ring-1 ring-black/5 rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="bg-muted/30 p-8 border-b">
                  <CardTitle className="flex items-center gap-3 text-xl font-black">
                    <Heart className="text-primary fill-primary" size={24} /> 
                    {t('scannerHome.petProfileTitle')}
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
                              "flex flex-col items-center p-6 border-2 rounded-[2rem] cursor-pointer transition-all", 
                              selectedPet === 'dog' ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-muted opacity-40"
                            )}>
                              <RadioGroupItem value="dog" id="dog" className="sr-only" />
                              <Dog size={32} className={cn("mb-2", selectedPet === 'dog' ? "text-primary" : "text-muted-foreground")} />
                              <span className="font-black">{t('common.dog')}</span>
                            </Label>
                            <Label htmlFor="cat" className={cn(
                              "flex flex-col items-center p-6 border-2 rounded-[2rem] cursor-pointer transition-all", 
                              selectedPet === 'cat' ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-muted opacity-40"
                            )}>
                              <RadioGroupItem value="cat" id="cat" className="sr-only" />
                              <Cat size={32} className={cn("mb-2", selectedPet === 'cat' ? "text-primary" : "text-muted-foreground")} />
                              <span className="font-black">{t('common.cat')}</span>
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
                          <FormLabel className="font-black text-sm ml-1">품종</FormLabel>
                          <FormControl>
                            <Input placeholder="예: 말티즈, 샴" className="h-14 rounded-2xl border-2" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="petProfile.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black text-sm ml-1">이름</FormLabel>
                          <FormControl>
                            <Input placeholder="이름" className="h-14 rounded-2xl border-2" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {breedHint && (
                    <Alert className="bg-primary/5 border-primary/20 rounded-2xl animate-in slide-in-from-top-2">
                       <Sparkles className="h-5 w-5 text-primary" />
                       <AlertDescription className="text-xs font-black text-primary leading-relaxed">
                         {breedHint}
                       </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="petProfile.age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black text-sm ml-1 flex items-center gap-1">나이 (살) <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <div className="relative">
                               <Input type="number" placeholder="예: 4" className="h-14 rounded-2xl border-2 pl-12" {...field} />
                               <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="petProfile.weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black text-sm ml-1 flex items-center gap-1">몸무게 (kg) <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input type="number" step="0.1" placeholder="예: 5.5" className="h-14 rounded-2xl border-2 pl-12" {...field} />
                              <Info className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="petProfile.neutered"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="font-black text-sm ml-1">중성화 완료 여부</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                            <Label htmlFor="n-yes" className={cn("flex-1 p-4 border-2 rounded-2xl text-center cursor-pointer font-black transition-all", field.value === 'yes' ? "bg-primary text-white border-primary" : "bg-white border-muted")}>
                              <RadioGroupItem value="yes" id="n-yes" className="sr-only" />
                              네 (Yes)
                            </Label>
                            <Label htmlFor="n-no" className={cn("flex-1 p-4 border-2 rounded-2xl text-center cursor-pointer font-black transition-all", field.value === 'no' ? "bg-primary text-white border-primary" : "bg-white border-muted")}>
                              <RadioGroupItem value="no" id="n-no" className="sr-only" />
                              아니요 (No)
                            </Label>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4 pt-4">
                    <Label className="font-black text-sm ml-1">최근 건강 고민</Label>
                    <div className="flex flex-wrap gap-2">
                       {(selectedPet === 'dog' ? dogConditions : catConditions).map(condition => (
                         <Badge 
                           key={condition} 
                           variant={form.watch('petProfile.healthConditions')?.includes(condition) ? "default" : "outline"}
                           className="px-4 py-2.5 cursor-pointer rounded-full transition-all font-bold text-xs"
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-2xl border-none ring-1 ring-black/5 rounded-[2.5rem] bg-white overflow-hidden">
              <CardHeader className="bg-muted/30 p-8 border-b">
                <CardTitle className="flex items-center gap-3 text-xl font-black">
                  <Camera className="text-primary" size={24} /> 
                  {t('scannerHome.productInfoTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <FormField
                    control={form.control}
                    name="image"
                    render={({ field: { onChange } }) => (
                        <FormItem>
                            <FormControl>
                              <div className={cn(
                                  "relative w-full aspect-video border-4 border-dashed rounded-[2.5rem] flex flex-col justify-center items-center text-center cursor-pointer transition-all",
                                  imageFile && imageFile.length > 0 ? "border-success bg-success/5 shadow-inner" : "border-muted hover:border-primary hover:bg-primary/5"
                                )}>
                                  {imageFile && imageFile.length > 0 ? <CheckCircle2 className="h-16 w-16 text-success mb-4" /> : <Camera className="h-16 w-16 text-primary mb-4" />}
                                  <p className="text-lg font-black">{imageFile && imageFile.length > 0 ? "라벨 업로드 완료" : t('scannerHome.imageUploadLabel')}</p>
                                  <p className="text-xs text-muted-foreground mt-1 font-medium">{t('scannerHome.imageUploadSub')}</p>
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
                        <FormLabel className="font-black text-sm ml-1">{t('scannerHome.productNameLabel')} *</FormLabel>
                        <FormControl>
                          <Input placeholder="예: 인스팅트 오리지널" className="h-14 rounded-2xl border-2" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="foodType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-sm ml-1">{t('scannerHome.productTypeLabel')} *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-14 rounded-2xl border-2">
                              <SelectValue placeholder="카테고리 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-2xl">
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
                className="w-full h-20 text-2xl font-black rounded-[2.5rem] shadow-2xl shadow-primary/40 transition-all bg-primary hover:bg-primary/90 disabled:opacity-30"
              >
                <Sparkles className="mr-3 h-8 w-8" />
                {t('scannerHome.analyzeButton')}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </TooltipProvider>
  );
}
