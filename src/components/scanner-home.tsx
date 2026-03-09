'use client';

import { useMemo, useState } from 'react';
import { 
  Camera, Sparkles, Dog, Cat, 
  Scale, Stethoscope, ChevronDown, Pill, 
  ShoppingBag, Cookie, HeartPulse,
  Clock, Home, Droplets, AlertTriangle, Footprints,
  Target, Info, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from '@/components/ui/separator';

type AnalysisFormValues = {
  petType: 'dog' | 'cat';
  analysisMode: 'general' | 'custom';
  productName: string;
  productCategory: 'food' | 'treat' | 'supplement';
  detailedProductType: string;
  image?: FileList;
  petProfile: {
    name: string;
    gender: 'male' | 'female' | 'unknown';
    breed: string;
    age: string;
    weight: string;
    neutered: 'yes' | 'no' | 'unknown';
    bcs: string;
    activityLevel: 'LOW' | 'NORMAL' | 'HIGH' | 'VERY_HIGH' | 'UNKNOWN';
    walkingTime: string;
    livingEnvironment: 'INDOOR' | 'OUTDOOR' | 'BOTH' | 'UNKNOWN';
    healthConditions: string[];
    customHealthCondition: string;
    allergies: string[];
    customAllergy: string;
    waterIntake: 'LOW' | 'NORMAL' | 'HIGH' | 'UNKNOWN';
    stoolCondition: 'GOOD' | 'SOFT' | 'HARD' | 'DIARRHEA' | 'UNKNOWN';
    medications: string;
  };
};

const CATEGORY_OPTIONS = {
  food: ['건식 사료', '습식 사료(캔/파우치)', '화식/생식', '동결건조 사료', '소프트 사료', '기타(직접 입력)'],
  treat: ['껌/치과용 간식', '져키/트릿', '츄르/퓨레', '동결건조 간식', '비스킷/쿠키', '기타(직접 입력)'],
  supplement: ['관절 영양제', '피부/모질 영양제', '눈/눈물 영양제', '유산균', '심장/신장 영양제', '종합 비타민', '기타(직접 입력)']
};

const BCS_DESCRIPTIONS: Record<string, string> = {
  '1': '매우 마름 (지방 거의 없음)',
  '2': '마름 (지방 적음)',
  '3': '이상적 (적당한 체형)',
  '4': '통통함 (약간의 과체중)',
  '5': '비만 (심한 과체중)',
};

const dogConditions = ['슬개골 탈구', '관절염', '피부 알러지', '눈물 자국', '심장 질환', '소화 불량', '췌장염', '신장 질환', '기타(직접 입력)'];
const catConditions = ['방광염/요로결석', '신장 질환', '헤어볼', '구강 건강', '심부전', '피부 건강', '당뇨', '기타(직접 입력)'];
const allergyList = ['닭고기', '소고기', '돼지고기', '연어', '곡물(그레인)', '계란', '유제품', '기타(직접 입력)', '없음/모름'];

export default function ScannerHome({ onAnalyze }: { onAnalyze: (data: any) => void }) {
  const { user } = useUser();
  const db = useFirestore();
  
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
    image: z.any().optional(),
    petProfile: z.object({
      name: z.string().optional(),
      gender: z.enum(['male', 'female', 'unknown']).optional(),
      breed: z.string().optional(),
      age: z.string().optional(),
      weight: z.string().optional(),
      neutered: z.enum(['yes', 'no', 'unknown']).optional(),
      bcs: z.string().optional(),
      activityLevel: z.enum(['LOW', 'NORMAL', 'HIGH', 'VERY_HIGH', 'UNKNOWN']).optional(),
      walkingTime: z.string().optional(),
      livingEnvironment: z.enum(['INDOOR', 'OUTDOOR', 'BOTH', 'UNKNOWN']).optional(),
      healthConditions: z.array(z.string()).optional(),
      customHealthCondition: z.string().optional(),
      allergies: z.array(z.string()).optional(),
      customAllergy: z.string().optional(),
      waterIntake: z.enum(['LOW', 'NORMAL', 'HIGH', 'UNKNOWN']).optional(),
      stoolCondition: z.enum(['GOOD', 'SOFT', 'HARD', 'DIARRHEA', 'UNKNOWN']).optional(),
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
      petProfile: {
        name: '', gender: 'unknown', breed: '', age: '0', weight: '0', neutered: 'unknown', bcs: '3',
        activityLevel: 'UNKNOWN', walkingTime: 'UNKNOWN', livingEnvironment: 'UNKNOWN', healthConditions: [], customHealthCondition: '', allergies: [], customAllergy: '', waterIntake: 'UNKNOWN', stoolCondition: 'UNKNOWN', medications: '',
      }
    },
  });

  const selectedCategory = form.watch('productCategory');
  const detailedType = form.watch('detailedProductType');
  const imageFile = form.watch('image');
  const analysisMode = form.watch('analysisMode');
  const selectedPetType = form.watch('petType');
  const currentPetProfile = form.watch('petProfile');

  const conditions = selectedPetType === 'dog' ? dogConditions : catConditions;

  const selectSavedPet = (pet: any) => {
    form.reset({
      ...form.getValues(),
      petType: pet.petType,
      petProfile: {
        name: pet.name, 
        gender: pet.gender || 'unknown', 
        breed: pet.breed || '', 
        age: pet.age?.toString() || '0', 
        weight: pet.weight?.toString() || '0', 
        neutered: pet.neutered || 'unknown', 
        bcs: pet.bcs || '3',
        activityLevel: pet.activityLevel || 'UNKNOWN', 
        walkingTime: pet.walkingTime || 'UNKNOWN', 
        livingEnvironment: pet.livingEnvironment || 'UNKNOWN', 
        healthConditions: pet.healthConditions || [], 
        customHealthCondition: pet.customHealthCondition || '', 
        allergies: pet.allergies || [], 
        customAllergy: pet.customAllergy || '', 
        waterIntake: pet.waterIntake || 'UNKNOWN', 
        stoolCondition: pet.stoolCondition || 'UNKNOWN', 
        medications: pet.medications || '',
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onAnalyze)} className="space-y-12 max-w-2xl mx-auto pb-48 animate-in fade-in duration-700 px-4">
        <div className="text-center space-y-4 pt-10">
          <Badge className="bg-primary/10 text-primary border-none px-4 py-2 rounded-full font-black text-[10px] tracking-widest uppercase">
            Veterinary Hybrid Scan v21.0
          </Badge>
          <h1 className="text-5xl font-black font-headline tracking-tighter text-foreground leading-tight">
            {analysisMode === 'custom' ? '맞춤 분석' : '성분 분석'}
          </h1>
          <p className="text-muted-foreground font-medium text-lg">
            {analysisMode === 'custom' ? '우리 아이 전용 메디컬 리포트' : '제품 표준 성분 및 품질 감사'}
          </p>
        </div>

        <Tabs defaultValue="custom" onValueChange={(v) => form.setValue('analysisMode', v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-20 rounded-[2.5rem] bg-white shadow-xl p-2 mb-10">
            <TabsTrigger value="general" className="rounded-[2rem] text-sm font-bold data-[state=active]:bg-muted flex items-center gap-2">
              <ShoppingBag size={18} /> 제품 성분만 분석
            </TabsTrigger>
            <TabsTrigger value="custom" className="rounded-[2rem] text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-white flex items-center gap-2">
              <Target size={18} /> 우리 아이 맞춤 분석
            </TabsTrigger>
          </TabsList>

          <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white mb-10">
            <CardHeader className="bg-muted/30 p-10 border-b">
              <CardTitle className="flex items-center gap-3 text-2xl font-black">
                <ShoppingBag className="text-primary" size={28}/> 1. 제품 분류
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
               <FormField control={form.control} name="productCategory" render={({ field }) => (
                  <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'food', label: '사료', icon: ShoppingBag },
                      { id: 'treat', label: '간식', icon: Cookie },
                      { id: 'supplement', label: '영양제', icon: HeartPulse },
                    ].map((cat) => (
                      <Label key={cat.id} htmlFor={cat.id} className={cn(
                        "flex flex-col items-center p-4 border-2 rounded-3xl cursor-pointer transition-all gap-2",
                        field.value === cat.id ? "border-primary bg-primary/5" : "border-muted opacity-60"
                      )}>
                        <RadioGroupItem value={cat.id} id={cat.id} className="sr-only" />
                        <cat.icon size={28} />
                        <span className="font-black text-xs">{cat.label}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                )}/>

                <div className="space-y-4">
                  <Label className="font-bold text-sm ml-2">세부 유형</Label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_OPTIONS[selectedCategory].map((opt) => (
                      <button key={opt} type="button" onClick={() => form.setValue('detailedProductType', opt)} className={cn("px-4 py-2 rounded-full font-bold text-xs border-2 transition-all", detailedType === opt ? "bg-primary text-white border-primary" : "bg-white border-muted")}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <FormField control={form.control} name="productName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold ml-2">제품명 (선택)</FormLabel>
                    <FormControl><Input placeholder="정확한 제품명을 적어주세요." className="rounded-2xl h-12 bg-muted/10 border-none px-4" {...field} /></FormControl>
                  </FormItem>
                )}/>
            </CardContent>
          </Card>

          <TabsContent value="custom" className="space-y-10 mt-0">
            <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/20 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
              <div className="p-2 bg-primary rounded-xl text-white"><Info size={20}/></div>
              <p className="text-sm font-bold text-primary leading-relaxed">
                아이의 건강 상태와 알레르기 정보를 입력하시면, AI가 사료 성분과의 상성을 1:1로 매칭해 드립니다.
              </p>
            </div>

            {user && pets && pets.length > 0 && (
              <div className="flex justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="lg" variant="outline" className="rounded-full h-14 px-8 border-2 border-primary text-primary font-black bg-white shadow-lg">
                      저장된 아이 선택 <ChevronDown className="ml-2 h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-64 rounded-3xl p-2 bg-white shadow-2xl border-none">
                    {pets.map(pet => (
                      <DropdownMenuItem key={pet.id} onClick={() => selectSavedPet(pet)} className="rounded-2xl cursor-pointer p-3 font-bold hover:bg-primary/5">
                        {pet.name} ({pet.breed})
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
              <CardHeader className="bg-muted/30 p-10 border-b">
                <CardTitle className="flex items-center gap-3 text-2xl font-black"><Stethoscope className="text-primary" size={28}/> 2. 아이 상세 메디컬 프로필</CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-12">
                {/* 1단계: 기본 정보 */}
                <div className="space-y-8">
                  <h3 className="text-lg font-black flex items-center gap-2 border-b pb-2"><Info className="text-primary" size={20}/> 기본 정보</h3>
                  <FormField control={form.control} name="petType" render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-4">
                      <Label htmlFor="dog" className={cn("flex flex-col items-center p-6 border-4 rounded-[2.5rem] cursor-pointer transition-all", field.value === 'dog' ? "border-primary bg-primary/5" : "border-muted opacity-40")}>
                        <RadioGroupItem value="dog" id="dog" className="sr-only" />
                        <Dog size={48} className={cn("mb-2", field.value === 'dog' ? "text-primary" : "")} />
                        <span className="font-black">강아지</span>
                      </Label>
                      <Label htmlFor="cat" className={cn("flex flex-col items-center p-6 border-4 rounded-[2.5rem] cursor-pointer transition-all", field.value === 'cat' ? "border-primary bg-primary/5" : "border-muted opacity-40")}>
                        <RadioGroupItem value="cat" id="cat" className="sr-only" />
                        <Cat size={48} className={cn("mb-2", field.value === 'cat' ? "text-primary" : "")} />
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
                    <FormField control={form.control} name="petProfile.gender" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold ml-2">성별</FormLabel>
                        <div className="flex gap-2">
                          {['male', 'female', 'unknown'].map(v => (
                            <div key={v} onClick={() => field.onChange(v)} className={cn("flex-1 text-center py-3 border-2 rounded-xl font-bold text-xs cursor-pointer transition-all", field.value === v ? "border-primary bg-primary/5 text-primary" : "border-muted text-muted-foreground")}>
                              {v === 'male' ? '남아' : v === 'female' ? '여아' : '모름'}
                            </div>
                          ))}
                        </div>
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name="petProfile.neutered" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold ml-2">중성화</FormLabel>
                        <div className="flex gap-2">
                          {['yes', 'no', 'unknown'].map(v => (
                            <div key={v} onClick={() => field.onChange(v)} className={cn("flex-1 text-center py-3 border-2 rounded-xl font-bold text-xs cursor-pointer transition-all", field.value === v ? "border-primary bg-primary/5 text-primary" : "border-muted text-muted-foreground")}>
                              {v === 'yes' ? '완료' : v === 'no' ? '미완' : '모름'}
                            </div>
                          ))}
                        </div>
                      </FormItem>
                    )}/>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="petProfile.age" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold ml-2">나이 (살)</FormLabel><FormControl><Input type="number" step="0.1" className="rounded-2xl h-12 bg-muted/10 border-none px-4" {...field} /></FormControl></FormItem>
                    )}/>
                    <FormField control={form.control} name="petProfile.weight" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold ml-2">체중 (kg)</FormLabel><FormControl><Input type="number" step="0.1" className="rounded-2xl h-12 bg-muted/10 border-none px-4" {...field} /></FormControl></FormItem>
                    )}/>
                  </div>
                </div>

                <Separator />

                {/* 2단계: 신체 및 환경 */}
                <div className="space-y-8">
                  <h3 className="text-lg font-black flex items-center gap-2 border-b pb-2"><Home className="text-primary" size={20}/> 생활 및 환경</h3>
                  <FormField control={form.control} name="petProfile.walkingTime" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold ml-2 flex items-center gap-2"><Clock size={16}/> 일일 산책 시간</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'NONE', label: '안함' },
                          { id: 'UNDER_30', label: '30분 미만' },
                          { id: '30_60', label: '30분~1시간' },
                          { id: 'OVER_60', label: '1시간 이상' }
                        ].map(v => (
                          <div key={v.id} onClick={() => field.onChange(v.id)} className={cn("p-3 border-2 rounded-xl cursor-pointer text-center font-bold text-xs", field.value === v.id ? "border-primary bg-primary/5 text-primary" : "border-muted text-muted-foreground")}>
                            {v.label}
                          </div>
                        ))}
                      </div>
                    </FormItem>
                  )}/>

                  <FormField control={form.control} name="petProfile.bcs" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold ml-2 flex items-center gap-2"><Scale size={16}/> BCS (체형 지수)</FormLabel>
                      <div className="space-y-3">
                        <div className="flex gap-1.5">
                          {['1', '2', '3', '4', '5'].map(v => (
                            <div key={v} onClick={() => field.onChange(v)} className={cn("flex-1 h-10 border-2 rounded-xl flex items-center justify-center font-black cursor-pointer text-sm transition-all", field.value === v ? "border-primary bg-primary text-white" : "border-muted text-muted-foreground")}>
                              {v}
                            </div>
                          ))}
                        </div>
                        <div className="p-3 bg-muted/30 rounded-xl text-center">
                          <p className="text-xs font-black text-primary">{BCS_DESCRIPTIONS[field.value || '3']}</p>
                        </div>
                      </div>
                    </FormItem>
                  )}/>
                </div>

                <Separator />

                {/* 3단계: 건강 고민 및 알러지 */}
                <div className="space-y-8">
                  <h3 className="text-lg font-black flex items-center gap-2 border-b pb-2"><HeartPulse className="text-primary" size={20}/> 건강 고민 및 알러지</h3>
                  <FormField control={form.control} name="petProfile.allergies" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold ml-2 flex items-center gap-2"><AlertTriangle className="text-destructive" size={16}/> 알러지 및 주의 성분</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {allergyList.map(a => (
                          <div key={a} onClick={() => {
                            const cur = field.value || [];
                            if (a === '없음/모름') {
                              field.onChange(['없음/모름']);
                              return;
                            }
                            const filtered = cur.filter(x => x !== '없음/모름');
                            field.onChange(filtered.includes(a) ? filtered.filter(x => x !== a) : [...filtered, a]);
                          }} className={cn("px-4 py-1.5 rounded-full text-xs font-bold border-2 cursor-pointer transition-all", field.value?.includes(a) ? "bg-destructive text-white border-destructive" : "bg-white border-muted text-muted-foreground")}>
                            {a}
                          </div>
                        ))}
                      </div>
                    </FormItem>
                  )}/>

                  <FormField control={form.control} name="petProfile.healthConditions" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold ml-2 flex items-center gap-2"><Stethoscope className="text-primary" size={16}/> 주요 건강 고민</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {conditions.map(c => (
                          <div key={c} onClick={() => {
                            const cur = field.value || [];
                            field.onChange(cur.includes(c) ? cur.filter(x => x !== c) : [...cur, c]);
                          }} className={cn("px-4 py-1.5 rounded-full text-xs font-bold border-2 cursor-pointer transition-all", field.value?.includes(c) ? "bg-primary text-white border-primary" : "bg-white border-muted text-muted-foreground")}>
                            {c}
                          </div>
                        ))}
                      </div>
                    </FormItem>
                  )}/>
                </div>

                <Separator />

                {/* 4단계: 기타 습관 */}
                <div className="space-y-8">
                  <h3 className="text-lg font-black flex items-center gap-2 border-b pb-2"><Footprints className="text-primary" size={20}/> 기타 생활 습관</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="petProfile.waterIntake" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold ml-2 flex items-center gap-2"><Droplets className="text-blue-500" size={16}/> 음수량</FormLabel>
                        <div className="flex gap-1.5">
                          {['LOW', 'NORMAL', 'HIGH'].map(v => (
                            <div key={v} onClick={() => field.onChange(v)} className={cn("flex-1 text-center py-2 border-2 rounded-xl font-bold text-[10px] cursor-pointer", field.value === v ? "bg-blue-500 text-white border-blue-500" : "bg-white border-muted")}>
                              {v === 'LOW' ? '적음' : v === 'NORMAL' ? '보통' : '많음'}
                            </div>
                          ))}
                        </div>
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name="petProfile.stoolCondition" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold ml-2 flex items-center gap-2"><Footprints className="text-amber-800" size={16}/> 배변 상태</FormLabel>
                        <div className="flex gap-1.5">
                          {['GOOD', 'SOFT', 'DIARRHEA'].map(v => (
                            <div key={v} onClick={() => field.onChange(v)} className={cn("flex-1 text-center py-2 border-2 rounded-xl font-bold text-[10px] cursor-pointer", field.value === v ? "bg-amber-800 text-white border-amber-800" : "bg-white border-muted")}>
                              {v === 'GOOD' ? '건강' : v === 'SOFT' ? '묽음' : '설사'}
                            </div>
                          ))}
                        </div>
                      </FormItem>
                    )}/>
                  </div>
                  <FormField control={form.control} name="petProfile.medications" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold ml-2 flex items-center gap-2"><Pill className="text-primary" size={16}/> 복용 중인 약물/영양제</FormLabel>
                      <FormControl><Input placeholder="예: 관절 영양제, 심장약 등" className="rounded-2xl h-12 bg-muted/10 border-none px-4" {...field} /></FormControl>
                    </FormItem>
                  )}/>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-primary p-12 text-white">
            <CardTitle className="flex items-center gap-5 text-3xl font-black"><Camera size={36}/> 제품 라벨 촬영</CardTitle>
          </CardHeader>
          <CardContent className="p-12 space-y-8 text-center">
            <FormField control={form.control} name="image" render={({ field: { onChange } }) => (
              <div className={cn("relative w-full aspect-[4/3] border-[6px] border-dashed rounded-[4.5rem] flex flex-col justify-center items-center cursor-pointer transition-all", imageFile?.length ? "border-success bg-success/5" : "border-muted/30")}>
                <Camera className="h-24 w-24 text-primary mb-6 opacity-20" />
                <p className="text-2xl font-black">{imageFile?.length ? "라벨 사진 준비 완료" : "성분표 촬영하기"}</p>
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => onChange(e.target.files)} />
              </div>
            )}/>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" disabled={!imageFile?.length} className="w-full h-28 text-3xl font-black rounded-[3.5rem] shadow-2xl bg-primary hover:scale-[1.02] transition-all">
          <Sparkles className="mr-4 h-10 w-10" /> 
          {analysisMode === 'custom' ? '맞춤 리포트 생성' : '성분 분석 시작'}
        </Button>
      </form>
    </Form>
  );
}
