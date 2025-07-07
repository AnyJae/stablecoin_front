'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import ko from '@/locales/ko.json';
import en from '@/locales/en.json';

export type Language = 'ko' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: { [key: string]: string | number }) => string;
  tArray: (key: string) => string[];
}

const translations = {
  ko,
  en
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ko');

  // 언어 설정 함수
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  };

  // 번역 함수
  const t = (key: string, variables?: { [key: string]: string | number }): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key; 
      }
    }
    
    if (typeof value !== 'string') {
        console.warn(`Translation value for key "${key}" is not a string.`);
        return key;
    }

    let translatedString: string = value;

    if (variables) {
      for (const varName in variables) {
        if (Object.prototype.hasOwnProperty.call(variables, varName)) {
          const placeholder = new RegExp(`{{\\s*${varName}\\s*}}`, 'g'); // {{ varName }} 패턴을 찾음
          translatedString = translatedString.replace(placeholder, String(variables[varName]));
        }
      }
    }
    
    return translatedString;
  };

  // 배열 번역 함수
  const tArray = (key: string): string[] => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return [];
      }
    }
    
    return Array.isArray(value) ? value : [];
  };

  // 초기 언어 설정
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    const browserLanguage = navigator.language.startsWith('ko') ? 'ko' : 'en';
    const defaultLanguage = savedLanguage || browserLanguage;
    
    setLanguage(defaultLanguage);
  }, []);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    tArray
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 