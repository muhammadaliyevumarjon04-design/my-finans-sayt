import { CURRENCIES, type Currency } from '@/types/expense';

interface CurrencySelectorProps {
  value: string;
  onChange: (code: string) => void;
}

export default function CurrencySelector({ value, onChange }: CurrencySelectorProps) {
  const current = CURRENCIES.find(c => c.code === value);

  return (
    <div className="relative group">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-secondary/50 border border-border px-3 py-1.5 pr-7 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-secondary transition-colors cursor-pointer focus:outline-none focus:border-primary"
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.symbol} {c.code}
          </option>
        ))}
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-[8px]">
        ▼
      </div>
    </div>
  );
}
