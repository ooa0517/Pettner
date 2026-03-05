
'use client';

import { useMemo, useState, useEffect } from 'react';
import { 
  Camera, Sparkles, Dog, Cat, 
  Scale, Stethoscope, ChevronDown, Pill, 
  ShoppingBag, Cookie, HeartPulse, Edit3,
  Clock, Home, Droplets, AlertTriangle, Footprints
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/language-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AnalysisFormValues = {
  petType: 'dog' | 'cat';
  analysisMode: 'general' | 'custom';
  productName: string;
  productCategory: 'food' | 'treat' | 'supplement';
  detailedProductType: string;
  manualProductType: string;
  image?: FileList;
  prescriptionImage?: FileList;
  petProfile: {
    name: string;
    gender: 'male' | 'female' | 'unknown';
    breed: string;
    age: string;
    weight: string;
    neutered: 'yes' | 'no' | 'unknown';
    bcs: string;
    activityLevel: string;
    walkingTime: string;
    livingEnvironment: string;
    healthConditions: string[];
    allergies: string[];
    waterIntake: string;
    stoolCondition: string;
    medications: string;
  };
};

const CATEGORY_OPTIONS = {
  food: ['건식 사료', '습식 사료(캔/파우치)', '화식/생식', '동결건조 사료', '소프트 사료', '기타(직접 입력)'],
  treat: ['껌/치과용 간식', '져키/트릿', '츄르/퓨레', '동결건조 간식', '비스킷/쿠키', '기타(직접 입력)'],
  supplement: ['관절 영양제', '피부/모질 영양제', '눈/눈물 영양제', '유산균', '심장/신장 영양제', '종합 비타민', '기타(직접 입력)']
};

const DOG_CONDITIONS = ['슬개골 탈구', '관절염', '피부 알러지', '눈물 자국', '심장 질환', '소화 불량', '췌장염', '신장 질환'];
const CAT_CONDITIONS = ['방광염/요로결석', '신장 질환', '헤어볼', '구강 건강', '심부전', '피부 건강', '당뇨'];
const ALLERGY_LIST = ['닭고기', '소고기', '돼지고기', '연어', '곡물(그레인)', '계란', '유제품'];

const BCS_DESCRIPTIONS: Record<string, string> = {
  '1': '매우 마름 (갈비뼈가 드러나고 지방이 거의 없음)',
  '2': '마름 (위에서 볼 때 허리가 잘록하고 지방이 적음)',
  '3': '이상적 (갈비뼈가 만져지며 적당한 허리 라인)',
  '4': '통통함 (갈비뼈가 잘 만져지지 않고 허리가 두루뭉술함)',
  '5': '비만 (갈비뼈를 찾기 힘들고 배가 처진 상태)',
};

export default function ScannerHome({ onAnalyze }: { onAnalyze: (data: any) => void }) {
  const { t } = useLanguage();
  const { user } = useUser();
  const db = useFirestore();
  const [showManualInput, setShowManualInput] = useState(false);
  
  const petsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'pets');
  }, [db, user]);

  const { data: pets } = useCollection(petsQuery);

  const formSchema = useMemo(() => z.object({
    petType: z.enum(['dog', 'cat']),
    analysisMode: z.enum(['general', 'custom']),
    productName: z.string().optional(),
    productCategory: z.enum(['food', 'treat', 'supplement']),
    detailedProductType: z.string(),
    manualProductType: z.string().optional(),
    image: z.any().optional(),
    prescriptionImage: z.any().optional(),
    petProfile: z.object({
      name: z.string().optional(),
      gender: z.enum(['male', 'female', 'unknown']).optional(),
      breed: z.string().optional(),
      age: z.string().optional(),
      weight: z.string().optional(),
      neutered: z.enum(['yes', 'no', 'unknown']).optional(),
      bcs: z.string().optional(),
      activityLevel: z.string().optional(),
      walkingTime: z.string().optional(),
      livingEnvironment: z.string().optional(),
      healthConditions: z.array(z.string()).optional(),
      allergies: z.array(z.string()).optional(),
      waterIntake: z.string().optional(),
      stoolCondition: z.string().optional(),
      medications: z.string().optional(),
    })
  }), []);

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      petType: 'dog',
      analysisMode: 'custom',
      productName: '',
      productCategory: 'food',
      detailedProductType: '건식 사료',
      manualProductType: '',
      petProfile: {
        name: '',
        gender: 'unknown',
        breed: '믹스/기타',
        age: '0',
        weight: '0',
        neutered: 'unknown',
        bcs: '3',
        activityLevel: 'UNKNOWN',
        walkingTime: 'UNKNOWN',
        livingEnvironment: 'UNKNOWN',
        healthConditions: [],
        allergies: [],
        waterIntake: 'UNKNOWN',
        stoolCondition: 'UNKNOWN',
        medications: '',
      }
    },
  });

  const selectedCategory = form.watch('productCategory');
  const detailedType = form.watch('detailedProductType');
  const petType = form.watch('petType');
  const imageFile = form.watch('image');
  const prescriptionFile = form.watch('prescriptionImage');
  const selectedConditions = form.watch('petProfile.healthConditions') || [];
  const selectedAllergies = form.watch('petProfile.allergies') || [];
  const currentBCS = form.watch('petProfile.bcs');

  useEffect(() => {
    if (detailedType === '기타(직접 입력)') {
      setShowManualInput(true);
    } else {
      setShowManualInput(false);
    }
  }, [detailedType]);

  const selectSavedPet = (pet: any) => {
    form.reset({
      ...form.getValues(),
      petType: pet.petType,
      petProfile: {
        name: pet.name,
        gender: pet.gender || 'unknown',
        breed: pet.breed || '믹스/기타',
        age: pet.age?.toString() || '0',
        weight: pet.weight?.toString() || '0',
        neutered: pet.neutered || 'unknown',
        bcs: pet.bcs || '3',
        activityLevel: pet.activityLevel || 'UNKNOWN',
        walkingTime: pet.walkingTime || 'UNKNOWN',
        livingEnvironment: pet.livingEnvironment || 'UNKNOWN',
        healthConditions: pet.healthConditions || [],
        allergies: pet.allergies || [],
        waterIntake: pet.waterIntake || 'UNKNOWN',
        stoolCondition: pet.stoolCondition || 'UNKNOWN',
        medications: pet.medications || '',
      }
    });
  };

  const onSubmit = (data: AnalysisFormValues) => {
    const finalData = {
      ...data,
      detailedProductType: data.detailedProductType === '기타(직접 입력)' ? data.manualProductType : data.detailedProductType
    };
    onAnalyze(finalData);
  };

  const toggleCondition = (condition: string) => {
    const current = [...selectedConditions];
    const index = current.indexOf(condition);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(condition);
    }
    form.setValue('petProfile.healthConditions', current);
  };

  const toggleAllergy = (allergy: string) => {
    const current = [...selectedAllergies];
    const index = current.indexOf(allergy);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(allergy);
    }
    form.setValue('petProfile.allergies', current);
  };

  return (
    <div className="space-y-12 max-w-2xl mx-auto pb-48 animate-in fade-in duration-700 px-4">
      <div className="text-center space-y-4 pt-10">
        <Badge className="bg-primary/10 text-primary border-none px-4 py-2 rounded-full font-black text-[10px] tracking-widest uppercase">
          Veterinary Precision v19.2
        </Badge>
        <h1 className="text-5xl md:text-6xl font-black font-headline tracking-tighter text-foreground leading-tight">
          Pettner Scan
        </h1>
        <p className="text-muted-foreground font-medium text-lg">제품 분류 및 처방전 OCR 정밀 분석 🐾</p>
      </div>

      {user && pets && pets.length > 0 && (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8 border-2 border-primary text-primary font-black bg-white shadow-lg hover:bg-primary/5">
                저장된 반려동물 선택 <ChevronDown className="ml-2 h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-64 rounded-3xl p-2">
              <DropdownMenuLabel className="font-black">아이를 선택하세요</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {pets.map(pet => (
                <DropdownMenuItem key={pet.id} onClick={() => selectSavedPet(pet)} className="rounded-2xl cursor-pointer p-3 font-bold">
                  {pet.petType === 'cat' ? <Cat className="mr-2 h-4 w-4 text-primary"/> : <Dog className="mr-2 h-4 w-4 text-primary"/>}
                  {pet.name} ({pet.breed})
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          
          <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-primary/5 p-10 border-b">
              <CardTitle className="flex items-center gap-3 text-2xl font-black">
                <ShoppingBag className="text-primary" size={28}/> 1. 분석할 제품 분류
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <FormField control={form.control} name="productCategory" render={({ field }) => (
                <RadioGroup onValueChange={(val) => {
                  field.onChange(val);
                  form.setValue('detailedProductType', CATEGORY_OPTIONS[val as keyof typeof CATEGORY_OPTIONS][0]);
                }} value={field.value} className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'food', label: '사료', icon: ShoppingBag },
                    { id: 'treat', label: '간식', icon: Cookie },
                    { id: 'supplement', label: '영양제', icon: HeartPulse },
                  ].map((cat) => (
                    <Label key={cat.id} htmlFor={cat.id} className={cn(
                      "flex flex-col items-center p-4 border-2 rounded-3xl cursor-pointer transition-all gap-2",
                      field.value === cat.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-muted opacity-60"
                    )}>
                      <RadioGroupItem value={cat.id} id={cat.id} className="sr-only" />
                      <cat.icon size={28} className={field.value === cat.id ? "text-primary" : ""} />
                      <span className="font-black text-xs">{cat.label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              )}/>

              <div className="space-y-4">
                <Label className="font-bold text-sm ml-2">세부 유형 선택</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS[selectedCategory].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => form.setValue('detailedProductType', opt)}
                      className={cn(
                        "px-4 py-2 rounded-full font-bold text-xs border-2 transition-all",
                        detailedType === opt ? "bg-primary text-white border-primary" : "bg-white border-muted text-muted-foreground"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                
                {showManualInput && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <FormField control={form.control} name="manualProductType" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 font-black text-xs text-primary ml-2">
                          <Edit3 size={12} /> 세부 유형 직접 입력
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="예: 수제 자연식, 동결건조 토핑 등" 
                            className="rounded-2xl h-12 bg-primary/5 border-2 border-primary/20 px-4 font-bold" 
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}/>
                  </div>
                )}
              </div>

              <FormField control={form.control} name="productName" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold ml-2">제품명 (옵션)</FormLabel>
                  <FormControl>
                    <Input placeholder="제품명을 적으면 더 정확한 분석이 가능합니다." className="rounded-2xl h-12 bg-muted/10 border-none px-4" {...field} />
                  </FormControl>
                </FormItem>
              )}/>
            </CardContent>
          </Card>

          <Tabs defaultValue="custom" onValueChange={(v) => form.setValue('analysisMode', v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-20 rounded-[2.5rem] bg-white shadow-xl p-2 mb-10">
              <TabsTrigger value="general" className="rounded-[2rem] text-sm font-bold data-[state=active]:bg-muted">
                제품 성분만 분석
              </TabsTrigger>
              <TabsTrigger value="custom" className="rounded-[2rem] text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
                우리 아이 맞춤 분석
              </TabsTrigger>
            </TabsList>

            <TabsContent value="custom" className="space-y-10 mt-0">
              <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-muted/30 p-10 border-b">
                  <CardTitle className="flex items-center gap-3 text-2xl font-black"><Scale className="text-primary" size={28}/> 2. 신체 및 활동 정보</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  <FormField control={form.control} name="petType" render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-4">
                      <Label htmlFor="dog" className={cn("flex flex-col items-center p-6 border-4 rounded-[2.5rem] cursor-pointer transition-all", field.value === 'dog' ? "border-primary bg-primary/5" : "border-muted opacity-40")}>
                        <RadioGroupItem value="dog" id="dog" className="sr-only" />
                        <Dog size={48} className={cn("mb-2", field.value === 'dog' ? "text-primary" : "text-muted-foreground")} />
                        <span className="font-black">강아지</span>
                      </Label>
                      <Label htmlFor="cat" className={cn("flex flex-col items-center p-6 border-4 rounded-[2.5rem] cursor-pointer transition-all", field.value === 'cat' ? "border-primary bg-primary/5" : "border-muted opacity-40")}>
                        <RadioGroupItem value="cat" id="cat" className="sr-only" />
                        <Cat size={48} className={cn("mb-2", field.value === 'cat' ? "text-primary" : "text-muted-foreground")} />
                        <span className="font-black">고양이</span>
                      </Label>
                    </RadioGroup>
                  )}/>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="petProfile.name" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold ml-2">이름</FormLabel><FormControl><Input placeholder="아이 이름" className="rounded-2xl h-12 bg-muted/10 border-none px-4" {...field} /></FormControl></FormItem>
                    )}/>
                    <FormField control={form.control} name="petProfile.breed" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold ml-2">품종</FormLabel><FormControl><Input placeholder="예: 말티푸" className="rounded-2xl h-12 bg-muted/10 border-none px-4" {...field} /></FormControl></FormItem>
                    )}/>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="petProfile.age" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold ml-2 text-xs">나이 (살)</FormLabel><FormControl><Input type="number" step="0.1" className="rounded-2xl h-12 bg-muted/10 border-none px-4" {...field} /></FormControl></FormItem>
                    )}/>
                    <FormField control={form.control} name="petProfile.weight" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold ml-2 text-xs">체중 (kg)</FormLabel><FormControl><Input type="number" step="0.1" className="rounded-2xl h-12 bg-muted/10 border-none px-4" {...field} /></FormControl></FormItem>
                    )}/>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="petProfile.gender" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold ml-2">성별</FormLabel>
                        <div className="flex gap-2">
                          {['male', 'female'].map(v => (
                            <button key={v} type="button" onClick={() => field.onChange(v)} className={cn("flex-1 h-12 rounded-xl border-2 font-bold", field.value === v ? "border-primary bg-primary/5 text-primary" : "border-muted text-muted-foreground")}>
                              {v === 'male' ? '남아' : '여아'}
                            </button>
                          ))}
                        </div>
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name="petProfile.neutered" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold ml-2">중성화</FormLabel>
                        <div className="flex gap-2">
                          {['yes', 'no'].map(v => (
                            <button key={v} type="button" onClick={() => field.onChange(v)} className={cn("flex-1 h-12 rounded-xl border-2 font-bold", field.value === v ? "border-primary bg-primary/5 text-primary" : "border-muted text-muted-foreground")}>
                              {v === 'yes' ? '완료' : '미완'}
                            </button>
                          ))}
                        </div>
                      </FormItem>
                    )}/>
                  </div>

                  <div className="space-y-4">
                    <Label className="font-black text-lg ml-2 flex items-center gap-2"><Scale size={20} className="text-primary"/> BCS (체형 지수)</Label>
                    <FormField control={form.control} name="petProfile.bcs" render={({ field }) => (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          {['1', '2', '3', '4', '5'].map(v => (
                            <button key={v} type="button" onClick={() => field.onChange(v)} className={cn("flex-1 h-14 rounded-2xl border-2 font-black transition-all", field.value === v ? "bg-primary text-white border-primary" : "bg-white border-muted text-muted-foreground")}>
                              {v}
                            </button>
                          ))}
                        </div>
                        <div className="p-4 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
                           <p className="text-sm font-black text-primary text-center">
                             {currentBCS ? BCS_DESCRIPTIONS[currentBCS] : '체형을 선택해주세요'}
                           </p>
                        </div>
                      </div>
                    )}/>
                    <p className="text-[10px] text-muted-foreground text-center font-medium">1: 매우 마름 / 3: 이상적 / 5: 비만</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-muted/30 p-10 border-b">
                  <CardTitle className="flex items-center gap-3 text-2xl font-black"><Clock className="text-primary" size={28}/> 3. 생활 습관 리포트</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  {petType === 'dog' ? (
                    <FormField control={form.control} name="petProfile.walkingTime" render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="font-black text-lg ml-2 flex items-center gap-2"><Clock size={20} className="text-primary"/> 일일 평균 산책 시간</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'NONE', label: '안함' },
                            { id: 'UNDER_30', label: '30분 미만' },
                            { id: '30_60', label: '30분~1시간' },
                            { id: 'OVER_60', label: '1시간 이상' }
                          ].map(v => (
                            <button key={v.id} type="button" onClick={() => field.onChange(v.id)} className={cn("h-14 rounded-2xl border-2 font-bold", field.value === v.id ? "border-primary bg-primary/5 text-primary" : "border-muted text-muted-foreground")}>
                              {v.label}
                            </button>
                          ))}
                        </div>
                      </FormItem>
                    )}/>
                  ) : (
                    <FormField control={form.control} name="petProfile.livingEnvironment" render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="font-black text-lg ml-2 flex items-center gap-2"><Home size={20} className="text-primary"/> 생활 환경</FormLabel>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'INDOOR', label: '실내 전용' },
                            { id: 'OUTDOOR', label: '실외/마당' },
                            { id: 'BOTH', label: '내외 병행' }
                          ].map(v => (
                            <button key={v.id} type="button" onClick={() => field.onChange(v.id)} className={cn("h-14 rounded-2xl border-2 font-bold", field.value === v.id ? "border-primary bg-primary/5 text-primary" : "border-muted text-muted-foreground")}>
                              {v.label}
                            </button>
                          ))}
                        </div>
                      </FormItem>
                    )}/>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField control={form.control} name="petProfile.waterIntake" render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="font-black text-lg ml-2 flex items-center gap-2"><Droplets size={20} className="text-blue-500"/> 평소 음수량</FormLabel>
                        <div className="flex gap-2">
                          {['LOW', 'NORMAL', 'HIGH'].map(v => (
                            <button key={v} type="button" onClick={() => field.onChange(v)} className={cn("flex-1 h-12 rounded-xl border-2 font-bold text-xs", field.value === v ? "bg-blue-500 text-white border-blue-500" : "border-muted text-muted-foreground")}>
                              {v === 'LOW' ? '적음' : v === 'NORMAL' ? '보통' : '많음'}
                            </button>
                          ))}
                        </div>
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name="petProfile.stoolCondition" render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="font-black text-lg ml-2 flex items-center gap-2"><Footprints size={20} className="text-amber-800"/> 배변 상태</FormLabel>
                        <div className="flex gap-2">
                          {['GOOD', 'SOFT', 'HARD'].map(v => (
                            <button key={v} type="button" onClick={() => field.onChange(v)} className={cn("flex-1 h-12 rounded-xl border-2 font-bold text-xs", field.value === v ? "bg-amber-800 text-white border-amber-800" : "border-muted text-muted-foreground")}>
                              {v === 'GOOD' ? '건강' : v === 'SOFT' ? '묽음' : '딱딱'}
                            </button>
                          ))}
                        </div>
                      </FormItem>
                    )}/>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-muted/30 p-10 border-b">
                  <CardTitle className="flex items-center gap-3 text-2xl font-black"><Stethoscope className="text-primary" size={28}/> 4. 메디컬 히스토리</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  <div className="space-y-4">
                    <Label className="font-black text-lg ml-2 flex items-center gap-2"><AlertTriangle size={20} className="text-destructive"/> 알러지 성분</Label>
                    <div className="flex flex-wrap gap-2">
                      {ALLERGY_LIST.map(a => (
                        <button key={a} type="button" onClick={() => toggleAllergy(a)} className={cn("px-4 py-2 rounded-full text-xs font-bold border-2", selectedAllergies.includes(a) ? "bg-destructive text-white border-destructive" : "bg-white border-muted")}>
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="font-black text-lg ml-2 flex items-center gap-2"><HeartPulse size={20} className="text-primary"/> 주요 건강 고민</Label>
                    <div className="flex flex-wrap gap-2">
                      {(petType === 'dog' ? DOG_CONDITIONS : CAT_CONDITIONS).map(c => (
                        <button key={c} type="button" onClick={() => toggleCondition(c)} className={cn("px-4 py-2 rounded-full text-xs font-bold border-2", selectedConditions.includes(c) ? "bg-primary text-white border-primary" : "bg-white border-muted")}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="font-black text-lg ml-2 flex items-center gap-2"><Pill size={20} className="text-amber-600"/> 복용 중인 약물 / 영양제 (OCR 지원)</Label>
                    <FormField control={form.control} name="petProfile.medications" render={({ field }) => (
                      <Input placeholder="직접 입력 또는 아래 사진 촬영" className="rounded-2xl h-14 bg-muted/10 border-none px-4" {...field} />
                    )}/>
                    <FormField control={form.control} name="prescriptionImage" render={({ field: { onChange } }) => (
                      <div className={cn("relative w-full aspect-video border-4 border-dashed rounded-[2rem] flex flex-col justify-center items-center text-center cursor-pointer transition-all", prescriptionFile?.length ? "border-primary bg-primary/5" : "border-muted/30")}>
                        <Camera className="h-12 w-12 text-primary mb-2 opacity-40" />
                        <p className="text-sm font-black">{prescriptionFile?.length ? "사진 인식 준비 완료" : "처방전/영양제 라벨 촬영 (선택)"}</p>
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => onChange(e.target.files)} />
                      </div>
                    )}/>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-primary p-12 text-white">
              <CardTitle className="flex items-center gap-5 text-3xl font-black"><Camera size={36}/> 5. 분석할 제품 라벨 촬영</CardTitle>
            </CardHeader>
            <CardContent className="p-12 space-y-8">
              <FormField control={form.control} name="image" render={({ field: { onChange } }) => (
                <div className={cn("relative w-full aspect-[4/3] border-[6px] border-dashed rounded-[4.5rem] flex flex-col justify-center items-center text-center cursor-pointer transition-all", imageFile?.length ? "border-success bg-success/5" : "border-muted/30")}>
                  <Camera className="h-24 w-24 text-primary mb-6 opacity-20" />
                  <p className="text-2xl font-black">{imageFile?.length ? "라벨 사진 준비 완료" : "성분표 촬영하기"}</p>
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => onChange(e.target.files)} />
                </div>
              )}/>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" disabled={!imageFile?.length} className="w-full h-28 text-3xl font-black rounded-[3.5rem] shadow-2xl bg-primary hover:scale-[1.02] transition-all">
            <Sparkles className="mr-4 h-10 w-10" /> 분석 리포트 생성
          </Button>
        </form>
      </Form>
    </div>
  );
}
