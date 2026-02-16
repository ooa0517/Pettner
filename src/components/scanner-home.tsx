
'use client';

import { useMemo, useState } from 'react';
import { 
  Camera, Sparkles, Dog, Cat, ShieldCheck, 
  CheckCircle2, Heart, Database, Stethoscope, 
  AlertCircle, ChevronRight, Info, Activity, Calendar,
  User, Ruler, Weight, Dumbbell, Zap
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
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

const bcsOptions = [
  { value: '1', label: '1. 갈비뼈 보임 (Very Thin)', description: '갈비뼈, 요추, 골반뼈가 멀리서도 보임' },
  { value: '2', label: '2. 마름 (Underweight)', description: '갈비뼈가 쉽게 만져지고 위에서 볼 때 허리가 잘록함' },
  { value: '3', label: '3. 이상적 (Ideal)', description: '갈비뼈가 적당한 지방층 뒤로 만져지며 체형이 균형 잡힘' },
  { value: '4', label: '4. 통통 (Overweight)', description: '갈비뼈를 만지기 어렵고 위에서 볼 때 허리 굴곡이 적음' },
  { value: '5', label: '5. 비만 (Obese)', description: '갈비뼈를 전혀 만질 수 없고 복부가 눈에 띄게 팽창됨' },
];

const genderOptions = [
  { value: 'male', label: '수컷' },
  { value: 'female', label: '암컷' },
  { value: 'neutered_male', label: '중성화 수컷' },
  { value: 'neutered_female', label: '중성화 암컷' },
];

type AnalysisFormValues = {
  petType: 'dog' | 'cat';
  analysisMode: 'general' | 'custom';
  productName: string;
  foodType: 'dry' | 'wet' | 'treat' | 'supplement';
  image?: FileList;
  petProfile: {
    name: string;
    breed: string;
    isMix: boolean;
    expectedSize: string;
    birthDate: string;
    dontKnowBirth: boolean;
    ageYears: string;
    ageMonths: string;
    genderStatus: 'male' | 'female' | 'neutered_male' | 'neutered_female';
    weight: string;
    bcs: string;
    activityLevel: string;
    healthConditions: string[];
    allergies: string[];
  };
};

type ScannerHomeProps = {
  onAnalyze: (data: any) => void;
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
      productName: z.string().min(1, '제품명을 입력해주세요.'),
      foodType: z.enum(['dry', 'wet', 'treat', 'supplement']),
      image: imageSchema,
      petProfile: z.object({
        name: z.string().optional().default(''),
        breed: z.string().optional().default(''),
        isMix: z.boolean().default(false),
        expectedSize: z.string().optional().default(''),
        birthDate: z.string().optional().default(''),
        dontKnowBirth: z.boolean().default(false),
        ageYears: z.string().optional().default(''),
        ageMonths: z.string().optional().default(''),
        genderStatus: z.enum(['male', 'female', 'neutered_male', 'neutered_female']),
        weight: z.string().optional().default(''),
        bcs: z.string().optional().default('3'),
        activityLevel: z.string().optional().default('NORMAL'),
        healthConditions: z.array(z.string()).default([]),
        allergies: z.array(z.string()).default([]),
      })
    });
  }, []);

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      petType: 'dog',
      analysisMode: 'custom',
      productName: '',
      foodType: 'dry',
      petProfile: {
        name: '',
        breed: '',
        isMix: false,
        expectedSize: '',
        birthDate: '',
        dontKnowBirth: false,
        ageYears: '',
        ageMonths: '',
        genderStatus: 'neutered_male',
        weight: '',
        bcs: '3',
        activityLevel: 'NORMAL',
        healthConditions: [],
        allergies: [],
      }
    },
  });

  const selectedPet = form.watch('petType');
  const analysisMode = form.watch('analysisMode');
  const imageFile = form.watch('image');
  const isMix = form.watch('petProfile.isMix');
  const dontKnowBirth = form.watch('petProfile.dontKnowBirth');

  const dogConditions = ['관절/슬개골', '피부/눈물', '소화기', '심장', '다이어트'];
  const catConditions = ['신장/비뇨기', '헤어볼', '구강/치아', '심장', '다이어트'];
  const allergyList = ['닭', '소', '양', '생선', '밀/곡물', '계란', '콩'];

  const onSubmit = (values: AnalysisFormValues) => {
    onAnalyze(values);
  };

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
            {t('scannerHome.subtitle')}
          </p>
        </div>

        <Tabs 
          defaultValue="custom" 
          onValueChange={(val) => form.setValue('analysisMode', val as any)} 
          className="w-full px-4"
        >
          <TabsList className="grid w-full grid-cols-2 h-16 rounded-2xl bg-muted/50 p-1">
            <TabsTrigger value="general" className="rounded-xl text-sm font-bold data-[state=active]:bg-white data-[state=active]:shadow-md">
              <Database className="mr-2 h-4 w-4" />
              {t('scannerHome.tabGeneral')}
            </TabsTrigger>
            <TabsTrigger value="custom" className="rounded-xl text-sm font-bold data-[state=active]:bg-white data-[state=active]:shadow-md relative">
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              {t('scannerHome.tabCustom')}
              <Badge className="absolute -top-2 -right-2 bg-primary text-[8px] font-black h-5 px-1.5 uppercase">
                {t('scannerHome.recommended')}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-10">
              
              <TabsContent value="custom" className="space-y-10 mt-0">
                <Card className="shadow-xl border-none ring-1 ring-black/5 rounded-[2.5rem] bg-white overflow-hidden">
                  <CardHeader className="bg-muted/30 p-8 border-b">
                    <CardTitle className="flex items-center gap-3 text-lg font-black">
                      <User className="text-primary" size={20} /> 
                      {t('scannerHome.identityTitle')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
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
                                <span className="font-black">강아지</span>
                              </Label>
                              <Label htmlFor="cat" className={cn(
                                "flex flex-col items-center p-6 border-2 rounded-[2rem] cursor-pointer transition-all", 
                                selectedPet === 'cat' ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-muted opacity-40"
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
                        name="petProfile.name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-black text-sm ml-1">이름</FormLabel>
                            <FormControl>
                              <Input placeholder="우리 아이 이름" className="h-14 rounded-2xl border-2" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="petProfile.breed"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-black text-sm ml-1">품종</FormLabel>
                            <div className="space-y-3">
                              <FormControl>
                                <Input placeholder="예: 말티즈, 샴" className="h-14 rounded-2xl border-2" {...field} />
                              </FormControl>
                              <div className="flex items-center space-x-2 ml-1">
                                <Checkbox 
                                  id="mix-breed" 
                                  checked={isMix}
                                  onCheckedChange={(val) => form.setValue('petProfile.isMix', !!val)}
                                />
                                <Label htmlFor="mix-breed" className="text-xs font-bold text-muted-foreground cursor-pointer">믹스견 / 품종 모름</Label>
                              </div>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {isMix && (
                      <FormField
                        control={form.control}
                        name="petProfile.expectedSize"
                        render={({ field }) => (
                          <FormItem className="animate-in slide-in-from-top-2">
                            <FormLabel className="font-black text-sm ml-1">{t('scannerHome.mixBreedLabel')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-14 rounded-2xl border-2">
                                  <SelectValue placeholder="예상 성견 크기 선택" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="small">소형 (&lt; 10kg)</SelectItem>
                                <SelectItem value="medium">중형 (10 ~ 25kg)</SelectItem>
                                <SelectItem value="large">대형 (&gt; 25kg)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="space-y-4">
                      <FormLabel className="font-black text-sm ml-1">{t('scannerHome.birthDateLabel')}</FormLabel>
                      {!dontKnowBirth ? (
                        <FormField
                          control={form.control}
                          name="petProfile.birthDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="relative">
                                  <Input type="date" className="h-14 rounded-2xl border-2 pl-12" {...field} />
                                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ) : (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                          <FormField
                            control={form.control}
                            name="petProfile.ageYears"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="몇 년생" className="h-14 rounded-2xl border-2" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="petProfile.ageMonths"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="몇 개월" className="h-14 rounded-2xl border-2" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                      <div className="flex items-center space-x-2 ml-1">
                        <Checkbox 
                          id="dont-know-birth" 
                          checked={dontKnowBirth}
                          onCheckedChange={(val) => form.setValue('petProfile.dontKnowBirth', !!val)}
                        />
                        <Label htmlFor="dont-know-birth" className="text-xs font-bold text-muted-foreground cursor-pointer">{t('scannerHome.dontKnowBirth')}</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-none ring-1 ring-black/5 rounded-[2.5rem] bg-white overflow-hidden">
                  <CardHeader className="bg-muted/30 p-8 border-b">
                    <CardTitle className="flex items-center gap-3 text-lg font-black">
                      <Weight className="text-primary" size={20} /> 
                      {t('scannerHome.statsTitle')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-10">
                    <FormField
                      control={form.control}
                      name="petProfile.genderStatus"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="font-black text-sm ml-1">{t('scannerHome.genderLabel')}</FormLabel>
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-3">
                              {genderOptions.map((opt) => (
                                <Label key={opt.value} htmlFor={opt.value} className={cn(
                                  "flex items-center justify-center p-4 border-2 rounded-2xl cursor-pointer font-bold text-sm transition-all",
                                  field.value === opt.value ? "border-primary bg-primary/5 shadow-sm" : "border-muted"
                                )}>
                                  <RadioGroupItem value={opt.value} id={opt.value} className="sr-only" />
                                  {opt.label}
                                </Label>
                              ))}
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="petProfile.weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black text-sm ml-1 flex items-center gap-1">현재 몸무게 (kg) <span className="text-destructive font-bold">*</span></FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input type="number" step="0.1" placeholder="예: 5.5" className="h-14 rounded-2xl border-2 pl-12" {...field} />
                              <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="petProfile.bcs"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="font-black text-sm ml-1">{t('scannerHome.bcsLabel')}</FormLabel>
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                              {bcsOptions.map((opt) => (
                                <Label key={opt.value} htmlFor={`bcs-${opt.value}`} className={cn(
                                  "flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all",
                                  field.value === opt.value ? "border-primary bg-primary/5" : "border-muted opacity-60"
                                )}>
                                  <RadioGroupItem value={opt.value} id={`bcs-${opt.value}`} className="sr-only" />
                                  <div className="flex justify-between items-center">
                                    <span className="font-black text-sm">{opt.label}</span>
                                    {field.value === opt.value && <CheckCircle2 className="h-5 w-5 text-primary" />}
                                  </div>
                                  <p className="text-[10px] text-muted-foreground mt-1">{opt.description}</p>
                                </Label>
                              ))}
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-none ring-1 ring-black/5 rounded-[2.5rem] bg-white overflow-hidden">
                  <CardHeader className="bg-muted/30 p-8 border-b">
                    <CardTitle className="flex items-center gap-3 text-lg font-black">
                      <Activity className="text-primary" size={20} /> 
                      {t('scannerHome.lifestyleTitle')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <FormField
                      control={form.control}
                      name="petProfile.activityLevel"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="font-black text-sm ml-1">
                            {selectedPet === 'dog' ? '하루 산책량 (활동량)' : '생활 환경'}
                          </FormLabel>
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                              {selectedPet === 'dog' ? (
                                <>
                                  {[
                                    { value: 'LOW', title: '집순이 / 노령견', desc: '산책 하루 30분 미만' },
                                    { value: 'NORMAL', title: '적당함', desc: '산책 하루 30 ~ 60분' },
                                    { value: 'HIGH', title: '에너자이저', desc: '산책 하루 1시간 이상' }
                                  ].map((lvl) => (
                                    <Label key={lvl.value} htmlFor={lvl.value} className={cn(
                                      "flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all",
                                      field.value === lvl.value ? "border-primary bg-primary/5" : "border-muted opacity-60"
                                    )}>
                                      <RadioGroupItem value={lvl.value} id={lvl.value} className="sr-only" />
                                      <div className={cn("p-2 rounded-xl", field.value === lvl.value ? "bg-primary text-white" : "bg-muted")}>
                                        <Activity className="h-5 w-5" />
                                      </div>
                                      <div>
                                        <p className="font-black text-sm">{lvl.title}</p>
                                        <p className="text-[10px] text-muted-foreground">{lvl.desc}</p>
                                      </div>
                                    </Label>
                                  ))}
                                </>
                              ) : (
                                <>
                                  {[
                                    { value: 'LOW', title: '실내묘', desc: '주로 잠을 자고 활동량이 적음' },
                                    { value: 'NORMAL', title: '보통', desc: '가끔 우다다를 하고 활발함' },
                                    { value: 'HIGH', title: '외출 / 아기고양이', desc: '매우 활동적이고 에너지가 넘침' }
                                  ].map((env) => (
                                    <Label key={env.value} htmlFor={env.value} className={cn(
                                      "flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all",
                                      field.value === env.value ? "border-primary bg-primary/5" : "border-muted opacity-60"
                                    )}>
                                      <RadioGroupItem value={env.value} id={env.value} className="sr-only" />
                                      <div className={cn("p-2 rounded-xl", field.value === env.value ? "bg-primary text-white" : "bg-muted")}>
                                        <Zap className="h-5 w-5" />
                                      </div>
                                      <div>
                                        <p className="font-black text-sm">{env.title}</p>
                                        <p className="text-[10px] text-muted-foreground">{env.desc}</p>
                                      </div>
                                    </Label>
                                  ))}
                                </>
                              )}
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-none ring-1 ring-black/5 rounded-[2.5rem] bg-white overflow-hidden">
                  <CardHeader className="bg-muted/30 p-8 border-b">
                    <CardTitle className="flex items-center gap-3 text-lg font-black">
                      <ShieldCheck className="text-primary" size={20} /> 
                      {t('scannerHome.healthTitle')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-10">
                    <div className="space-y-4">
                      <Label className="font-black text-sm ml-1">최근 건강 고민 (중복 선택)</Label>
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

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="font-black text-sm ml-1">{t('scannerHome.allergyLabel')}</Label>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-[10px] font-bold text-muted-foreground"
                          onClick={() => form.setValue('petProfile.allergies', [])}
                        >
                          {t('scannerHome.noneOrUnknown')}
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {allergyList.map(allergy => (
                           <Badge 
                             key={allergy} 
                             variant={form.watch('petProfile.allergies')?.includes(allergy) ? "destructive" : "outline"}
                             className="px-4 py-2.5 cursor-pointer rounded-full transition-all font-bold text-xs"
                             onClick={() => {
                               const current = form.getValues('petProfile.allergies') || [];
                               if (current.includes(allergy)) {
                                 form.setValue('petProfile.allergies', current.filter(a => a !== allergy));
                               } else {
                                 form.setValue('petProfile.allergies', [...current, allergy]);
                               }
                             }}
                           >
                             {allergy}
                           </Badge>
                         ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

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
                    name="foodType"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="font-black text-sm ml-1">{t('scannerHome.productTypeLabel')} *</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-3">
                            {[
                              { value: 'dry', label: '🍚 건식 사료' },
                              { value: 'wet', label: '🍲 습식 사료' },
                              { value: 'treat', label: '🍖 간식' },
                              { value: 'supplement', label: '💊 영양제' }
                            ].map((type) => (
                              <Label key={type.value} htmlFor={type.value} className={cn(
                                "flex items-center justify-center h-14 border-2 rounded-2xl cursor-pointer font-bold text-xs transition-all",
                                field.value === type.value ? "border-primary bg-primary/5 shadow-sm" : "border-muted"
                              )}>
                                <RadioGroupItem value={type.value} id={type.value} className="sr-only" />
                                {type.label}
                              </Label>
                            ))}
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />

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
                                    <p className="text-xs text-muted-foreground mt-1 font-medium px-10" dangerouslySetInnerHTML={{ __html: t('scannerHome.imageUploadSub') }} />
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

                  <FormField
                    control={form.control}
                    name="productName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-sm ml-1">제품명 (또는 브랜드명)</FormLabel>
                        <FormControl>
                          <Input placeholder="예: 인스팅트 오리지널 치킨" className="h-14 rounded-2xl border-2" {...field} />
                        </FormControl>
                        <FormDescription className="text-[10px] ml-1">정확한 분석을 위해 제품명을 입력해 주세요.</FormDescription>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="pt-6">
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={!form.watch('productName') || !(imageFile && imageFile.length > 0)}
                  className="w-full h-20 text-2xl font-black rounded-[2.5rem] shadow-2xl shadow-primary/40 transition-all bg-primary hover:bg-primary/90 disabled:opacity-30"
                >
                  <Sparkles className="mr-3 h-8 w-8" />
                  {t('scannerHome.analyzeButton')}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
