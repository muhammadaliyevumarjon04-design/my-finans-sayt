import { LANGUAGES, type Lang } from '@/i18n/translations';
import { useLanguage } from '@/i18n/LanguageContext';

export default function LanguageSelector() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="relative group">
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        className="appearance-none bg-secondary/50 border border-border px-3 py-1.5 pr-7 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-secondary transition-colors cursor-pointer focus:outline-none focus:border-primary"
        aria-label="Language"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-[8px]">
        ▼
      </div>
    </div>
  );
}
