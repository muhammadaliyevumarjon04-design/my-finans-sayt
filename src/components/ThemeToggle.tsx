import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/theme/ThemeContext';
import { useLanguage } from '@/i18n/LanguageContext';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { lang } = useLanguage();
  const isDark = theme === 'dark';

  
  const translations = {
  ru: {
    light: 'СВЕТЛАЯ',
    dark: 'ТЁМНАЯ',
  },
  en: {
    light: 'LIGHT',
    dark: 'DARK',
  },
  uz: {
    light: 'YORUG‘',
    dark: 'QORONG‘I',
  },
};

const t = translations[lang] || translations.en;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? t.light : t.dark}
      className="inline-flex items-center gap-2 bg-secondary/50 border border-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-secondary hover:text-card-foreground transition-colors cursor-pointer focus:outline-none focus:border-primary"
    >
      {isDark ? <Sun size={12} /> : <Moon size={12} />}
      <span>{isDark ? t.light : t.dark}</span>
    </button>
  );
}
