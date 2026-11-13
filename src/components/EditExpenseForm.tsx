import { useState } from 'react';
import type { Expense } from '@/types/expense';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCategories } from '@/context/CategoriesContext';

interface EditExpenseFormProps {
  expense: Expense;
  onSave: (
    id: string,
    data: { date: string; description: string; category: string; amount: number }
  ) => void;
  onClose: () => void;
}

export default function EditExpenseForm({ expense, onSave, onClose }: EditExpenseFormProps) {
  const { t } = useLanguage();
  const { categories } = useCategories();
  const [date, setDate] = useState(expense.date);
  const [description, setDescription] = useState(expense.description);
  const [category, setCategory] = useState(expense.category);
  const [amount, setAmount] = useState(String(expense.amount));
  const isIncome = expense.type === 'income';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num < 1) return;
    onSave(expense.id, { date, description, category, amount: num });
    onClose();
  };

  const inputClass =
    'w-full bg-secondary border border-border px-3 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors tabular-nums';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-card border border-border p-8 w-full max-w-md space-y-5"
      >
        <h2 className="text-sm font-bold uppercase tracking-widest text-card-foreground mb-6">
          {isIncome ? t('editIncome') : t('editExpense')}
        </h2>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block">
            {t('amount')}
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1"
            className={inputClass}
            min="1"
            step="1"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block">
            {t('date')}
          </label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block">
            {t('category')}
          </label>
          {isIncome ? (
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            />
          ) : (
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
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
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-border text-sm font-bold uppercase tracking-widest text-muted-foreground hover:bg-secondary transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 bg-primary/10 border border-primary/40 text-primary text-sm font-bold uppercase tracking-widest hover:bg-primary/20 transition-colors"
          >
            {t('save')}
          </button>
        </div>
      </form>
    </div>
  );
}
