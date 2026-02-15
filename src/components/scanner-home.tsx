'use client';

import { useMemo, useState } from 'react';
import { 
  Camera, Sparkles, Dog, Cat, ShieldCheck, 
  AlertTriangle, Info, Star, CheckCircle2,
  Calendar, Activity, Heart, Trash2, 
  ChevronDown, ChevronUp, ArrowRight,
  Stethoscope, Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

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
  const [isHovered, setIsHovered] = useState(false);
  
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
  const weight = form.watch('petProfile.weight');

  const dogConditions = ['관절', '피부/알러지', '소화/장', '눈물자국', '비만 관리'];
  const catConditions = ['신장/하부요로기', '헤어볼', '치아 건강', '심장 질환', '비만 관리'];
  const allergyList = ['닭고기', '소고기', '생선', '돼지고기', '오리고기', '밀가루', '옥수수'];

  const toggleAllergy = (allergy: string) => {
    const current = form.getValues('petProfile.allergies') || [];
    if (current.includes(allergy)) {
      form.setValue('petProfile.allergies', current.filter(a => a !== allergy));
    } else {
      form.setValue('petProfile.allergies', [...current, allergy]);
    }
  };

  const clearAllergies = () => {
    form.setValue('petProfile.allergies', []);
  };

  const isFormValid = form.watch('productName') && (form.watch('ingredientsText') || (imageFile && imageFile.length > 0));

  return (
    <TooltipProvider>
      <div className="space-y-8 max-w-2xl mx-auto pb-32 animate-in fade-in duration-700">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-4 py-1.5 rounded-full font-black text-xs tracking-widest uppercase">
            Free Personalized Analysis
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-foreground">
            {t('scannerHome.title')}
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            반려동물 정보를 입력하면 맞춤형 리포트를 무료로 볼 수 있습니다.
          </p>
        </div>

        {/* Analysis Mode Selector */}
        <div className="grid grid-cols-2 gap-4">
          <Card 
            className={cn(
              "cursor-pointer transition-all duration-300 border-2 overflow-hidden relative group",
              analysisMode === 'custom' ? "border-primary bg-primary/5 shadow-lg scale-[1.02]" : "border-muted hover:border-primary/50"
            )}
            onClick={() => form.setValue('analysisMode', 'custom')}
          >
            <div className="p-5 flex flex-col items-center gap-3">
               <div className={cn("p-3 rounded-2xl", analysisMode === 'custom' ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                  <Stethoscope size={24} />
               </div>
               <div className="text-center">
                  <p className="font-black text-sm">우리 아이 맞춤 분석</p>
                  <p className="text-[10px] text-muted-foreground">유전/건강 상태 반영</p>
               </div>
               {analysisMode === 'custom' && <CheckCircle2 className="absolute top-3 right-3 text-primary w-5 h-5" />}
            </div>
          </Card>
          <Card 
            className={cn(
              "cursor-pointer transition-all duration-300 border-2 overflow-hidden relative group",
              analysisMode === 'general' ? "border-primary bg-primary/5 shadow-lg scale-[1.02]" : "border-muted hover:border-primary/50"
            )}
            onClick={() => form.setValue('analysisMode', 'general')}
          >
            <div className="p-5 flex flex-col items-center gap-3">
               <div className={cn("p-3 rounded-2xl", analysisMode === 'general' ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                  <Database size={24} />
               </div>
               <div className="text-center">
                  <p className="font-black text-sm">제품 성분만 분석</p>
                  <p className="text-[10px] text-muted-foreground">객관적 성분 중심</p>
               </div>
               {analysisMode === 'general' && <CheckCircle2 className="absolute top-3 right-3 text-primary w-5 h-5" />}
            </div>
          </Card>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onAnalyze)} className="space-y-10">
            
            {/* 1. Pet Profile Form (Conditional) */}
            {analysisMode === 'custom' && (
              <Card className="shadow-xl border-none ring-1 ring-black/5 rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="bg-muted/30 p-8 border-b">
                  <CardTitle className="flex items-center gap-3 text-xl font-black">
                    <Heart className="text-primary fill-primary" size={24} /> 
                    누구를 위한 분석인가요?
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-10">
                  
                  {/* Species Selection */}
                  <FormField
                    control={form.control}
                    name="petType"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4">
                            <Label htmlFor="dog" className={cn(
                              "flex flex-col items-center p-6 border-2 rounded-3xl cursor-pointer transition-all", 
                              selectedPet === 'dog' ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-muted"
                            )}>
                              <RadioGroupItem value="dog" id="dog" className="sr-only" />
                              <Dog size={32} className={cn("mb-2", selectedPet === 'dog' ? "text-primary" : "text-muted-foreground")} />
                              <span className="font-black">강아지</span>
                            </Label>
                            <Label htmlFor="cat" className={cn(
                              "flex flex-col items-center p-6 border-2 rounded-3xl cursor-pointer transition-all", 
                              selectedPet === 'cat' ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-muted"
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

                  {/* Basic Info Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="petProfile.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">이름</FormLabel>
                          <FormControl>
                            <Input placeholder="아이 이름" className="h-12 rounded-xl" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
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
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="petProfile.age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">나이 (살)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="예: 3" className="h-12 rounded-xl" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="petProfile.weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">몸무게 (kg) *</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" placeholder="예: 5.5" className="h-12 rounded-xl" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Neutered Status */}
                  <FormField
                    control={form.control}
                    name="petProfile.neutered"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="font-bold">중성화 여부</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                            <Label htmlFor="neutered-yes" className={cn("flex-1 py-3 border-2 rounded-xl text-center cursor-pointer transition-all", field.value === 'yes' ? "border-primary bg-primary/5" : "border-muted")}>
                              <RadioGroupItem value="yes" id="neutered-yes" className="sr-only" />
                              예
                            </Label>
                            <Label htmlFor="neutered-no" className={cn("flex-1 py-3 border-2 rounded-xl text-center cursor-pointer transition-all", field.value === 'no' ? "border-primary bg-primary/5" : "border-muted")}>
                              <RadioGroupItem value="no" id="neutered-no" className="sr-only" />
                              아니오
                            </Label>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Dog Specific: Activity & BCS */}
                  {selectedPet === 'dog' && (
                    <div className="space-y-8 animate-in slide-in-from-top-4">
                      <FormField
                        control={form.control}
                        name="petProfile.activityLevel"
                        render={({ field }) => (
                          <FormItem className="space-y-4">
                            <FormLabel className="font-bold">산책/활동량</FormLabel>
                            <FormControl>
                              <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-3 gap-3">
                                <Label htmlFor="act-low" className={cn("flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer text-xs", field.value === 'LOW' ? "border-primary bg-primary/5" : "border-muted")}>
                                  <RadioGroupItem value="LOW" id="act-low" className="sr-only" />
                                  30분 미만
                                </Label>
                                <Label htmlFor="act-normal" className={cn("flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer text-xs", field.value === 'NORMAL' ? "border-primary bg-primary/5" : "border-muted")}>
                                  <RadioGroupItem value="NORMAL" id="act-normal" className="sr-only" />
                                  30~60분
                                </Label>
                                <Label htmlFor="act-high" className={cn("flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer text-xs", field.value === 'HIGH' ? "border-primary bg-primary/5" : "border-muted")}>
                                  <RadioGroupItem value="HIGH" id="act-high" className="sr-only" />
                                  60분 이상
                                </Label>
                              </RadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="petProfile.bcs"
                        render={({ field }) => (
                          <FormItem className="space-y-4">
                            <FormLabel className="font-bold">현재 체형 (BCS)</FormLabel>
                            <FormControl>
                              <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-3 gap-3">
                                <Label htmlFor="bcs-thin" className={cn("flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer", field.value === 'THIN' ? "border-primary bg-primary/5" : "border-muted")}>
                                  <RadioGroupItem value="THIN" id="bcs-thin" className="sr-only" />
                                  <span className="text-xl mb-1">🦴</span>
                                  <span className="text-[10px]">마름</span>
                                </Label>
                                <Label htmlFor="bcs-ideal" className={cn("flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer", field.value === 'IDEAL' ? "border-primary bg-primary/5" : "border-muted")}>
                                  <RadioGroupItem value="IDEAL" id="bcs-ideal" className="sr-only" />
                                  <span className="text-xl mb-1">🐕</span>
                                  <span className="text-[10px]">이상적</span>
                                </Label>
                                <Label htmlFor="bcs-over" className={cn("flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer", field.value === 'OVERWEIGHT' ? "border-primary bg-primary/5" : "border-muted")}>
                                  <RadioGroupItem value="OVERWEIGHT" id="bcs-over" className="sr-only" />
                                  <span className="text-xl mb-1">🍖</span>
                                  <span className="text-[10px]">비만</span>
                                </Label>
                              </RadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Cat Specific: Environment */}
                  {selectedPet === 'cat' && (
                    <div className="space-y-8 animate-in slide-in-from-top-4">
                      <FormField
                        control={form.control}
                        name="petProfile.environment"
                        render={({ field }) => (
                          <FormItem className="space-y-4">
                            <FormLabel className="font-bold">생활 환경</FormLabel>
                            <FormControl>
                              <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4">
                                <Label htmlFor="env-indoor" className={cn("flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer", field.value === 'INDOOR' ? "border-primary bg-primary/5" : "border-muted")}>
                                  <RadioGroupItem value="INDOOR" id="env-indoor" className="sr-only" />
                                  실내 전용
                                </Label>
                                <Label htmlFor="env-mixed" className={cn("flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer", field.value === 'MIXED' ? "border-primary bg-primary/5" : "border-muted")}>
                                  <RadioGroupItem value="MIXED" id="env-mixed" className="sr-only" />
                                  실내외 병행
                                </Label>
                              </RadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Health Concerns (Dynamic Chips) */}
                  <FormField
                    control={form.control}
                    name="petProfile.healthConditions"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="font-bold">건강 고민 (중복 선택)</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {(selectedPet === 'dog' ? dogConditions : catConditions).map((condition) => (
                            <Badge 
                              key={condition} 
                              variant={field.value?.includes(condition) ? "default" : "outline"}
                              className={cn(
                                "px-4 py-2 cursor-pointer transition-all rounded-full",
                                field.value?.includes(condition) ? "bg-primary border-primary" : "text-muted-foreground"
                              )}
                              onClick={() => {
                                const current = field.value || [];
                                if (current.includes(condition)) {
                                  field.onChange(current.filter(c => c !== condition));
                                } else {
                                  field.onChange([...current, condition]);
                                }
                              }}
                            >
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Allergy Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="font-bold">알러지 원재료 (중복 선택)</Label>
                      <Button variant="ghost" size="sm" type="button" onClick={clearAllergies} className="h-7 text-xs text-muted-foreground">초기화</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {allergyList.map((allergy) => (
                        <Badge 
                          key={allergy} 
                          variant={form.watch('petProfile.allergies')?.includes(allergy) ? "default" : "outline"}
                          className={cn(
                            "px-4 py-2 cursor-pointer transition-all rounded-full",
                            form.watch('petProfile.allergies')?.includes(allergy) ? "bg-destructive border-destructive" : "text-muted-foreground"
                          )}
                          onClick={() => toggleAllergy(allergy)}
                        >
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 2. Product Information Card */}
            <Card className="shadow-xl border-none ring-1 ring-black/5 rounded-[2.5rem] bg-white overflow-hidden">
              <CardHeader className="bg-muted/30 p-8 border-b">
                <CardTitle className="flex items-center gap-3 text-xl font-black">
                  <Database className="text-primary" size={24} /> 
                  분석할 제품 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                
                {/* Image Upload */}
                <FormField
                    control={form.control}
                    name="image"
                    render={({ field: { onChange, name, onBlur, ref } }) => (
                        <FormItem>
                            <FormControl>
                              <div 
                                className={cn(
                                  "relative w-full aspect-video border-3 border-dashed rounded-[2rem] flex flex-col justify-center items-center text-center cursor-pointer transition-all duration-500 overflow-hidden",
                                  imageFile && imageFile.length > 0 ? "border-success bg-success/5" : "border-muted hover:border-primary hover:bg-primary/5 bg-muted/10"
                                )}
                              >
                                  <div className={cn("p-6 rounded-full mb-4 shadow-inner", imageFile && imageFile.length > 0 ? "bg-success/20" : "bg-primary/10")}>
                                    {imageFile && imageFile.length > 0 ? <CheckCircle2 className="h-12 w-12 text-success" /> : <Camera className="h-12 w-12 text-primary" />}
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-lg font-black text-foreground">
                                        {imageFile && imageFile.length > 0 ? "촬영 완료!" : "라벨 사진 촬영/업로드"}
                                    </p>
                                    <p className="text-xs text-muted-foreground px-10">
                                      성분표와 등록성분량이 잘 보이게 찍어주세요.
                                    </p>
                                  </div>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    capture="environment" 
                                    className="absolute inset-0 opacity-0 cursor-pointer z-50 w-full h-full" 
                                    onChange={(e) => onChange(e.target.files)} 
                                    name={name}
                                    onBlur={onBlur}
                                    ref={ref}
                                  />
                              </div>
                            </FormControl>
                            <FormMessage />
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="brandName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">브랜드명 (선택)</FormLabel>
                        <FormControl>
                          <Input placeholder="예: 인스팅트 (Instinct)" className="h-12 rounded-xl" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="foodType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">제품 유형 *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl border-2">
                            <SelectValue placeholder="카테고리를 선택해주세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="dry">건식 사료 (Dry Food)</SelectItem>
                          <SelectItem value="wet">습식 사료 (Wet Food)</SelectItem>
                          <SelectItem value="cooked">화식/생식 (Cooked/Raw)</SelectItem>
                          <SelectItem value="treat">간식 (Treat)</SelectItem>
                          <SelectItem value="supplement">영양제 (Supplement)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ingredientsText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">원재료명 텍스트 (직접 입력 시)</FormLabel>
                      <FormControl>
                        <textarea 
                          className="w-full min-h-[120px] p-4 border-2 rounded-2xl text-sm focus:ring-primary focus:border-primary outline-none transition-all"
                          placeholder="원재료 목록을 여기에 복사해서 붙여넣어 주세요."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-[11px]">사진을 업로드했다면 입력하지 않으셔도 됩니다.</FormDescription>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Bottom Notice & CTA */}
            <div className="space-y-6">
              <Alert className="bg-muted/50 border-none rounded-2xl">
                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                <AlertDescription className="text-xs text-muted-foreground leading-relaxed">
                  Pettner는 AI 수의 영양 분석 시스템입니다. 질환이 있는 반려동물의 경우 반드시 주치의와 먼저 상담하십시오. 모든 데이터는 최신 가이드라인을 기반으로 산출됩니다.
                </AlertDescription>
              </Alert>

              <Button 
                type="submit" 
                size="lg" 
                disabled={!isFormValid}
                className="w-full h-20 text-2xl font-black rounded-[2rem] shadow-2xl shadow-primary/40 hover:scale-[1.01] active:scale-95 transition-all bg-primary hover:bg-primary/90 disabled:opacity-50"
              >
                <Sparkles className="mr-3 h-8 w-8" />
                분석 리포트 생성 시작
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </TooltipProvider>
  );
}
