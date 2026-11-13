import type { Expense } from '@/types/expense';
import { Pencil, Trash2 } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useSettings } from '@/context/SettingsContext';

interface ExpenseTableProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onEdit: (expense: Expense) => void;
  symbol: string;
  convert?: (amount: number) => number;
}

export default function ExpenseTable({ expenses, onDelete, onEdit, symbol, convert }: ExpenseTableProps) {
  const { t } = useLanguage();
  const { editMode } = useSettings();
  const conv = convert ?? ((n: number) => n);
  const fmt = (n: number) =>
    new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(conv(n)));
  return (
    <div className="bg-card/60 border border-border/50 backdrop-blur-md h-full flex flex-col">
      <div className="p-2 sm:p-4 border-b border-border flex justify-between items-center">
        <h2 className="text-sm font-bold uppercase tracking-widest text-card-foreground flex items-center gap-2">
          <span className="size-2 bg-primary shadow-[0_0_5px_hsl(var(--primary))]" />
          {t('journalTitle')}
        </h2>
        <span className="text-xs text-muted-foreground">
          {expenses.length} {expenses.length === 1 ? t('record') : t('records')}
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] uppercase text-muted-foreground font-bold border-b border-border">
              <th className="p-2 sm:p-4 tracking-widest">{t('date')}</th>
              <th className="p-2 sm:p-4 tracking-widest">{t('description')}</th>
              <th className="p-2 sm:p-4 tracking-widest">{t('category')}</th>
              <th className="p-2 sm:p-4 tracking-widest text-right">{t('amount')}</th>
              <th className="p-2 sm:p-4 tracking-widest text-right">{t('balance')}</th>
                {editMode && <th className="p-2 sm:p-4 w-20" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={editMode ? 6 : 5} className="p-8 text-center text-muted-foreground text-sm">
                  {t('noRecords')}
                </td>
              </tr>
            )}
            {expenses.map((e) => {
              const isIncome = e.type === 'income';
              return (
                <tr key={e.id} className="hover:bg-secondary/30 group transition-colors">
                  <td className="p-2 sm:p-4 text-xs text-muted-foreground tabular-nums">{e.date}</td>
                  <td className="p-2 sm:p-4">
                    <div className="text-sm text-card-foreground font-bold">{e.description || '—'}</div>
                  </td>
                  <td className="p-2 sm:p-4">
                    <span
                      className={`px-2 py-0.5 border text-[10px] font-bold uppercase ${
                        isIncome
                          ? 'border-lime/50 text-lime bg-lime/10'
                          : 'border-border bg-secondary/50'
                      }`}
                    >
                      {e.category}
                    </span>
                  </td>
                  <td
                    className={`p-4 text-right tabular-nums font-bold text-sm ${
                      isIncome ? 'text-lime' : 'text-destructive'
                    }`}
                  >
                    {isIncome ? '+ ' : '- '}
                    {fmt(e.amount)} {symbol}
                  </td>
                  <td className="p-2 sm:p-4 text-right tabular-nums text-muted-foreground text-sm">
                    {fmt(e.balance)} {symbol}
                  </td>
                    {editMode && (
                      <td className="p-2 sm:p-4">
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEdit(e)}
                            className="text-muted-foreground hover:text-primary"
                            aria-label={t('edit')}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => onDelete(e.id)}
                            className="text-muted-foreground hover:text-destructive"
                            aria-label={t('delete')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
