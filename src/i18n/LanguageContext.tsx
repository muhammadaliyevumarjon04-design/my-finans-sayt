import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { translations, type Lang, type TranslationKey } from './translations';

const LANG_KEY = 'expense-tracker-lang';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function loadLang(): Lang {
  const v = localStorage.getItem(LANG_KEY) as Lang | null;
  return v && ['ru', 'en', 'uz'].includes(v) ? v : 'ru';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(loadLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem(LANG_KEY, l);
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translations[lang][key] ?? translations.ru[key],
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
