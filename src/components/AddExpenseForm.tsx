import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCategories } from '@/context/CategoriesContext';

interface AddExpenseFormProps {
  onAdd: (expense: { amount: number; category: string; description: string; date: string }) => void;
  onClose: () => void;
  symbol: string;
}

export default function AddExpenseForm({ onAdd, onClose, symbol }: AddExpenseFormProps) {
  const { t } = useLanguage();
  const { categories } = useCategories();
  const today = new Date().toISOString().slice(0, 10);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>(categories[0] ?? '');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(today);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num < 1) return;
    onAdd({ amount: num, category, description, date });
    setAmount('');
    setDescription('');
    onClose();
  };

  const inputClass =
    'w-full bg-secondary border border-border px-3 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-card border border-border p-8 w-full max-w-md space-y-5"
      >
        <h2 className="text-sm font-bold uppercase tracking-widest text-card-foreground mb-6">
          {t('newExpense')}
        </h2>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block">
            {t('amount')} ({symbol})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1"
            className={inputClass}
            autoFocus
            min="1"
            step="1"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block">
            {t('category')}
          </label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block">
            {t('date')}
          </label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block">
            {t('description')}
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('comment')}
            className={inputClass}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border text-sm font-bold uppercase tracking-widest text-muted-foreground hover:bg-secondary transition-colors">
            {t('cancel')}
          </button>
          <button type="submit" className="flex-1 py-2.5 bg-primary/10 border border-primary/40 text-primary text-sm font-bold uppercase tracking-widest hover:bg-primary/20 transition-colors">
            {t('add')}
          </button>
        </div>
      </form>
    </div>
  );
}
