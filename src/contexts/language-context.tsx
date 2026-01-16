'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import en from '@/locales/en.json';
import ko from '@/locales/ko.json';

type Language = 'en' | 'ko';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations = { en, ko };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('ko');

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'en' || browserLang === 'ko') {
      setLanguage(browserLang as Language);
    }
  }, []);

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if translation is missing in the current language
        let fallbackResult: any = translations['en'];
        for (const fk of keys) {
          fallbackResult = fallbackResult?.[fk];
        }
        if (fallbackResult !== undefined) return fallbackResult;
        
        // Fallback to Korean if also missing in English
        let koFallbackResult: any = translations['ko'];
        for (const fk of keys) {
            koFallbackResult = koFallbackResult?.[fk];
        }
        return koFallbackResult || key;
      }
    }
    return result || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
