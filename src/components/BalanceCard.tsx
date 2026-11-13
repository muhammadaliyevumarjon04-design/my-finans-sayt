interface BalanceCardProps {
  label: string;
  value: number;
  variant: 'primary' | 'accent' | 'destructive';
  symbol: string;
  convert?: (amount: number) => number;
}

const variantStyles = {
  primary: 'border-l-primary text-primary/70',
  accent: 'border-l-accent text-accent/70',
  destructive: 'border-l-destructive text-destructive/70',
};

const glowStyles = {
  primary: 'glow-cyan',
  accent: 'glow-amber',
  destructive: '',
};

export default function BalanceCard({ label, value, variant, symbol, convert }: BalanceCardProps) {
  const displayValue = convert ? convert(value) : value;
  const isNegative = displayValue < 0;
  const formatted = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(Math.abs(displayValue)));
  const prefix = variant === 'destructive' ? '- ' : isNegative ? '- ' : '';
  const negativeClass = isNegative && variant !== 'destructive' ? 'text-destructive' : '';

  return (
    <div className={`bg-card/60 border border-border/50 backdrop-blur-md p-4 sm:p-6 border-l-4 ${variantStyles[variant]}`}>
      <div className={`text-[10px] sm:text-xs uppercase font-bold tracking-widest mb-2 sm:mb-4 ${variantStyles[variant].split(' ').pop()}`}>
        {label}
      </div>
      <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tighter tabular-nums break-all ${negativeClass || 'text-card-foreground'} ${glowStyles[variant]}`}>
        {prefix}{formatted} {symbol}
      </div>
    </div>
  );
}
