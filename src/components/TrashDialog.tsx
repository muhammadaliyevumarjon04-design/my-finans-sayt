import { Trash2, RotateCcw, X } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Expense } from '@/types/expense';
import { useLanguage } from '@/i18n/LanguageContext';

interface TrashDialogProps {
  items: Expense[];
  onClose: () => void;
  onRestore: (id: string) => void;
  onDeletePermanently: (id: string) => void;
  onEmpty: () => void;
  symbol: string;
  convert?: (amount: number) => number;
}

export default function TrashDialog({
  items,
  onClose,
  onRestore,
  onDeletePermanently,
  onEmpty,
  symbol,
  convert,
}: TrashDialogProps) {
  const { t } = useLanguage();
  const conv = convert ?? ((n: number) => n);
  const fmt = (n: number) =>
    new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(conv(n)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border w-full max-w-2xl max-h-[85vh] flex flex-col"
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-card-foreground flex items-center gap-2">
            <Trash2 className="size-4" />
            {t('trash')}
            <span className="text-xs text-muted-foreground font-normal">({items.length})</span>
          </h2>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={onEmpty}
                className="px-3 py-1.5 bg-destructive/10 border border-destructive/50 text-destructive text-[10px] font-bold uppercase hover:bg-destructive/20 transition-colors"
              >
                {t('emptyTrash')}
              </button>
            )}
            <button
              onClick={onClose}
              aria-label={t('cancel')}
              className="size-8 flex items-center justify-center bg-secondary border border-border text-card-foreground hover:bg-accent transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {items.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground text-sm">{t('trashEmpty')}</div>
          ) : (
            <ul className="divide-y divide-border/50">
              {items.map((e) => {
                const isIncome = e.type === 'income';
                return (
                  <li key={e.id} className="p-3 sm:p-4 flex items-center gap-3 hover:bg-secondary/30">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground tabular-nums">{e.date}</span>
                        <span
                          className={`px-2 py-0.5 border text-[10px] font-bold uppercase ${
                            isIncome
                              ? 'border-lime/50 text-lime bg-lime/10'
                              : 'border-border bg-secondary/50'
                          }`}
                        >
                          {e.category}
                        </span>
                      </div>
                      <div className="text-sm text-card-foreground font-bold mt-1 truncate">
                        {e.description || '—'}
                      </div>
                    </div>
                    <div
                      className={`text-sm font-bold tabular-nums shrink-0 ${
                        isIncome ? 'text-lime' : 'text-destructive'
                      }`}
                    >
                      {isIncome ? '+ ' : '- '}
                      {fmt(e.amount)} {symbol}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => onRestore(e.id)}
                        aria-label={t('restore')}
                        title={t('restore')}
                        className="size-8 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                      >
                        <RotateCcw size={14} />
                      </button>
                      <button
                        onClick={() => onDeletePermanently(e.id)}
                        aria-label={t('deletePermanently')}
                        title={t('deletePermanently')}
                        className="size-8 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  );
}
