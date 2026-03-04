'use client';

import { useState } from 'react';
import type { AnalyzePetFoodIngredientsOutput, AnalyzePetFoodIngredientsInput } from '@/ai/flows/analyze-pet-food-ingredients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, AlertCircle, Scale,
  Stethoscope, FlaskConical, BarChart3, 
  Award, ShieldAlert, Microscope, 
  Zap, ThumbsUp, ThumbsDown, 
  Sparkles, Dna, Calculator, Utensils, 
  PieChart, Factory, UserCircle, Truck,
  CheckCircle2, Info, Leaf, Gavel, History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

type AnalysisResultProps = {
  result: AnalyzePetFoodIngredientsOutput;
  input: AnalyzePetFoodIngredientsInput;
  onReset: () => void;
  resetButtonText?: string;
};

export default function AnalysisResult({ result, input, onReset, resetButtonText }: AnalysisResultProps) {
  const isCustomMode = input.analysisMode === 'custom';
  const isEn = input.language === 'en';
  const isCat = input.petType === 'cat';

  if (!result || !result.productIdentity || !result.scoreCard) {
     return (
        <div className="space-y-8 py-20 text-center">
          <AlertCircle className="w-20 h-20 text-destructive mx-auto opacity-30"/>
          <h1 className="text-3xl font-black">Analysis Error</h1>
          <p className="text-muted-foreground">AI failed to generate a complete report. Please try again with a clearer photo.</p>
          <Button onClick={onReset} variant="outline" size="lg" className="rounded-full mt-4">Try Again</Button>
        </div>
     );
  }

  const { productIdentity, scoreCard, scientificAnalysis, esgReport } = result;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-40 max-w-4xl mx-auto px-4">
      
      {/* 1. Header & Summary Card */}
      <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
        <CardContent className="p-10 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge className={cn("px-3 py-1 rounded-full text-[10px] font-black", 
                  productIdentity.pettnerCompliance.isCompliant ? "bg-success" : "bg-destructive")}>
                  {productIdentity.pettnerCompliance.isCompliant ? 'PETTNER COMPLIANT' : 'NON-COMPLIANT'}
                </Badge>
                <Badge variant="outline" className="px-3 py-1 rounded-full text-[10px] font-black border-primary text-primary">
                  V15.0 SCIENTIFIC ENGINE
                </Badge>
              </div>
              <h1 className="text-3xl font-black tracking-tighter pt-2 leading-tight">
                {productIdentity.name}
              </h1>
              <p className="text-muted-foreground font-bold">{productIdentity.brand} · {productIdentity.category}</p>
              <p className="text-xs text-primary font-black flex items-center gap-1">
                <Info size={14}/> {productIdentity.pettnerCompliance.reason}
              </p>
            </div>
            <div className="text-left md:text-right shrink-0">
               <div className="text-6xl font-black text-primary leading-none">{scoreCard.totalScore}<span className="text-xl ml-1">{isEn ? 'pts' : '점'}</span></div>
               {scoreCard.grade && (
                 <Badge className="mt-3 font-black px-4 py-1 rounded-full text-sm bg-success/20 text-success border-none">
                   Grade {scoreCard.grade}
                 </Badge>
               )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-muted/10 rounded-[2rem] flex items-center gap-4">
               <div className="p-3 bg-white rounded-2xl shadow-sm text-primary"><Factory size={20}/></div>
               <div>
                  <p className="text-[10px] font-black opacity-50 uppercase">Manufacturing</p>
                  <p className="text-xs font-bold">{productIdentity.manufacturingAudit.productionType}</p>
               </div>
            </div>
            <div className="p-5 bg-muted/10 rounded-[2rem] flex items-center gap-4">
               <div className="p-3 bg-white rounded-2xl shadow-sm text-primary"><ShieldAlert size={20}/></div>
               <div>
                  <p className="text-[10px] font-black opacity-50 uppercase">Safety Certs</p>
                  <p className="text-xs font-bold truncate max-w-[120px]">{productIdentity.manufacturingAudit.facilitySafety}</p>
               </div>
            </div>
            <div className="p-5 bg-muted/10 rounded-[2rem] flex items-center gap-4">
               <div className="p-3 bg-white rounded-2xl shadow-sm text-primary"><Truck size={20}/></div>
               <div>
                  <p className="text-[10px] font-black opacity-50 uppercase">Sourcing Origin</p>
                  <p className="text-xs font-bold">{productIdentity.manufacturingAudit.sourcingOrigin}</p>
               </div>
            </div>
          </div>

          <div className={cn("p-8 rounded-[2.5rem] border-l-8", isCustomMode ? "border-primary bg-primary/5" : "border-muted bg-muted/5")}>
             <h3 className="text-xl font-black flex items-center gap-2 mb-4">
               {isCustomMode ? <Stethoscope className="text-primary" size={20}/> : <Award className="text-primary" size={20}/>} 
               {isEn ? 'Expert Diagnostic' : '수의학적 정밀 진단'}
             </h3>
             <p className="text-lg font-bold leading-relaxed break-keep">
               {scoreCard.headline}
             </p>
             <div className="flex flex-wrap gap-2 mt-4">
               {scoreCard.statusTags?.map((tag, i) => (
                 <Badge key={i} variant="secondary" className="bg-white font-bold px-3 py-1 shadow-sm text-primary">
                   {tag}
                 </Badge>
               ))}
             </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Scientific Deep Dive (Paper Based) */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <Microscope className="text-primary w-6 h-6" />
          <h2 className="text-2xl font-black font-headline tracking-tight">{isEn ? 'Scientific Paper Audit' : '논문 기반 정밀 분석'}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 space-y-6">
            <h4 className="font-black text-sm text-muted-foreground uppercase flex items-center gap-2">
              <BarChart3 size={16}/> {isCat ? 'Cat-Specific Physiology' : 'Dog-Specific Physiology'}
            </h4>
            <div className="space-y-4">
              {isCat ? (
                <>
                  <div className="p-4 bg-muted/5 rounded-2xl">
                    <p className="text-[10px] font-black opacity-50">Taurine & Arginine</p>
                    <p className="text-sm font-bold mt-1">{scientificAnalysis.catSpecific?.taurineCheck || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-muted/5 rounded-2xl">
                    <p className="text-[10px] font-black opacity-50">Animal Protein Ratio</p>
                    <p className="text-sm font-bold mt-1">{scientificAnalysis.catSpecific?.animalProteinRatio || 'N/A'}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-muted/5 rounded-2xl">
                    <p className="text-[10px] font-black opacity-50">Omnivorous Balance</p>
                    <p className="text-sm font-bold mt-1">{scientificAnalysis.dogSpecific?.omnivorousBalance || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-muted/5 rounded-2xl">
                    <p className="text-[10px] font-black opacity-50">Breed Risk Matching</p>
                    <p className="text-sm font-bold mt-1">{scientificAnalysis.dogSpecific?.breedRiskMatching || 'N/A'}</p>
                  </div>
                </>
              )}
            </div>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8">
             <h4 className="font-black text-sm text-muted-foreground uppercase flex items-center gap-2 mb-6">
              <PieChart size={16}/> Nutrient Weight (100g/Unit)
            </h4>
            <div className="space-y-6">
              {[
                { label: 'Protein', value: scientificAnalysis.nutrientMass.protein_g, color: 'bg-primary' },
                { label: 'Fat', value: scientificAnalysis.nutrientMass.fat_g, color: 'bg-yellow-500' },
                { label: 'Carbs', value: scientificAnalysis.nutrientMass.carbs_g, color: 'bg-muted-foreground' }
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[11px] font-black"><span>{item.label}</span><span>{item.value.toFixed(1)}g</span></div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={cn("h-full transition-all duration-1000", item.color)} style={{ width: `${Math.min(item.value * 2, 100)}%` }} />
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t flex justify-between items-center">
                 <span className="text-xs font-black">Total Calories</span>
                 <span className="text-xl font-black text-primary">{scientificAnalysis.nutrientMass.kcal} kcal</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 3. Corporate ESG & Safety Audit */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <Gavel className="text-primary w-6 h-6" />
          <h2 className="text-2xl font-black font-headline tracking-tight">{isEn ? 'Corporate & ESG Audit' : '기업 및 ESG 감사 보고서'}</h2>
        </div>
        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="environmental" className="border-none shadow-lg rounded-[2.5rem] bg-white overflow-hidden">
            <AccordionTrigger className="px-8 py-6 hover:no-underline">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/10 rounded-2xl text-success"><Leaf /></div>
                <div className="text-left"><h3 className="font-black text-lg">{isEn ? 'Environmental' : '환경 경영 지표'}</h3><p className="text-xs text-muted-foreground font-medium">Packaging & Carbon Footprint</p></div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-8 pb-8 pt-4">
              <p className="text-sm font-bold leading-relaxed">{esgReport.environmental}</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="ethics" className="border-none shadow-lg rounded-[2.5rem] bg-white overflow-hidden">
            <AccordionTrigger className="px-8 py-6 hover:no-underline">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500"><UserCircle /></div>
                <div className="text-left"><h3 className="font-black text-lg">{isEn ? 'Corporate Ethics' : '기업 윤리 및 공헌'}</h3><p className="text-xs text-muted-foreground font-medium">Social Responsibility</p></div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-8 pb-8 pt-4">
              <p className="text-sm font-bold leading-relaxed">{esgReport.corporateEthics}</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="recall" className="border-none shadow-lg rounded-[2.5rem] bg-white overflow-hidden">
            <AccordionTrigger className="px-8 py-6 hover:no-underline">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-destructive/10 rounded-2xl text-destructive"><History /></div>
                <div className="text-left"><h3 className="font-black text-lg">{isEn ? 'Recall History' : '리콜 및 안전 이력'}</h3><p className="text-xs text-muted-foreground font-medium">5-Year Safety Audit</p></div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-8 pb-8 pt-4">
              <p className="text-sm font-bold leading-relaxed">{esgReport.recallHistory}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* 4. Final Veterinary Advice */}
      <Card className="border-none shadow-2xl rounded-[3.5rem] bg-primary text-white p-12 relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] opacity-10"><Stethoscope size={150} /></div>
        <div className="flex items-center gap-5 mb-8 relative z-10">
          <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md"><Zap size={40} /></div>
          <h3 className="text-2xl font-black">{isEn ? 'Final Veterinary Verdict' : '수의학적 최종 진단'}</h3>
        </div>
        <p className="text-xl font-bold leading-relaxed opacity-95 break-keep relative z-10">{result.veterinaryAdvice}</p>
      </Card>

      {/* Floating Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-2xl border-t z-50 flex justify-center shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="w-full max-w-4xl flex gap-4">
          <Button onClick={onReset} variant="outline" className="flex-1 h-16 rounded-2xl border-2 font-black text-primary"><Zap size={20} className="mr-2" /> {resetButtonText || 'New Scan'}</Button>
          <Button onClick={() => window.open(`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(productIdentity.name)}`, '_blank')} className="flex-[2] h-16 rounded-2xl text-xl font-black shadow-xl hover:scale-[1.02] transition-transform"><ShoppingBag size={24} className="mr-3" /> {isEn ? 'Buy Best Price' : '최저가 구매'}</Button>
        </div>
      </div>
    </div>
  );
}
