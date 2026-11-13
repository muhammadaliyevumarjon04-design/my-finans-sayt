import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Trash2 } from 'lucide-react';
import type { Expense } from '@/types/expense';
import { CURRENCIES } from '@/types/expense';
import BalanceCard from '@/components/BalanceCard';
import ExpenseTable from '@/components/ExpenseTable';
import AddExpenseForm from '@/components/AddExpenseForm';
import AddBalanceForm from '@/components/AddBalanceForm';
import EditExpenseForm from '@/components/EditExpenseForm';
import CurrencySelector from '@/components/CurrencySelector';
import LanguageSelector from '@/components/LanguageSelector';
import ThemeToggle from '@/components/ThemeToggle';
import SettingsDialog from '@/components/SettingsDialog';
import TrashDialog from '@/components/TrashDialog';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { useLanguage } from '@/i18n/LanguageContext';
import { useSettings } from '@/context/SettingsContext';

const INITIAL_BALANCE_KEY = 'expense-tracker-initial-balance';
const EXPENSES_KEY = 'expense-tracker-expenses';
const CURRENCY_KEY = 'expense-tracker-currency';
const DELETED_EXPENSES_KEY = 'expense-tracker-deleted-expenses-total';
const TRASH_KEY = 'expense-tracker-trash';

function loadInitialBalance(): number | null {
  const v = localStorage.getItem(INITIAL_BALANCE_KEY);
  return v ? parseFloat(v) : null;
}

function loadExpenses(): Expense[] {
  const v = localStorage.getItem(EXPENSES_KEY);
  return v ? JSON.parse(v) : [];
}

function loadCurrency(): string {
  return localStorage.getItem(CURRENCY_KEY) || 'RUB';
}

function loadNumber(key: string): number {
  const v = localStorage.getItem(key);
  const n = v ? parseFloat(v) : 0;
  return Number.isFinite(n) ? n : 0;
}

function loadTrash(): Expense[] {
  const v = localStorage.getItem(TRASH_KEY);
  return v ? JSON.parse(v) : [];
}

export default function Index() {
  const { t, lang } = useLanguage();
  const { autoClearDays } = useSettings();
  const [initialBalance, setInitialBalance] = useState<number | null>(loadInitialBalance);
  const [balanceInput, setBalanceInput] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>(loadExpenses);
  const [showForm, setShowForm] = useState(false);
  const [showAddBalance, setShowAddBalance] = useState(false);
  const [currencyCode, setCurrencyCode] = useState(loadCurrency);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [deletedExpensesTotal, setDeletedExpensesTotal] = useState<number>(() => loadNumber(DELETED_EXPENSES_KEY));
  const [trash, setTrash] = useState<Expense[]>(loadTrash);
  const [showTrash, setShowTrash] = useState(false);

  const saveTrash = (items: Expense[]) => {
    setTrash(items);
    localStorage.setItem(TRASH_KEY, JSON.stringify(items));
  };

  // Auto-clear trash: permanently remove items older than autoClearDays since deletion
  useEffect(() => {
    if (autoClearDays === null || trash.length === 0) return;
    const cutoff = Date.now() - autoClearDays * 24 * 60 * 60 * 1000;
    const filtered = trash.filter((e) => {
      const ts = e.deletedAt ?? new Date(e.date).getTime();
      return Number.isFinite(ts) ? ts >= cutoff : true;
    });
    if (filtered.length !== trash.length) {
      saveTrash(filtered);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoClearDays, trash.length]);

  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
  const liveSpent = expenses.reduce((s, e) => (e.type === 'income' ? s : s + e.amount), 0);
  // Удалённые расходы продолжают учитываться в «потраченном», чтобы баланс не «возвращался»
  const totalSpent = liveSpent + deletedExpensesTotal;
  const remaining = (initialBalance ?? 0) - totalSpent;

  const { convert, loading: ratesLoading, error: ratesError, updatedAt } = useExchangeRates(
    CURRENCIES.map((c) => c.code)
  );
  const convertToCurrent = (amount: number) => convert(amount, currencyCode);

  
  // Валюты, которые показываем в строке курсов
  const ratePairs =
    currencyCode === 'UZS'
      ? [
          { from: 'USD', to: 'UZS' },
          { from: 'RUB', to: 'UZS' },
        ]
      : currencyCode === 'USD'
      ? [
          { from: 'UZS', to: 'USD' },
          { from: 'RUB', to: 'USD' },
        ]
      : [
          { from: 'USD', to: 'RUB' },
          { from: 'UZS', to: 'RUB' },
        ];

  // Расчёт курса одной валюты относительно другой
  const getExchangeRate = (from: string, to: string) => {
    const fromRate = convert(1, from);
    const toRate = convert(1, to);

    return fromRate ? toRate / fromRate : 0;
  };

  const formatRate = (value: number) =>
    value.toLocaleString(
      lang === 'ru' ? 'ru-RU' : lang === 'uz' ? 'uz-UZ' : 'en-US',
      { maximumFractionDigits: 6 }
    );

  // Обратная конвертация: из выбранной валюты в базовую (RUB) для сохранения
  const toBase = (amountInCurrent: number) => {
    const rate = convert(1, currencyCode);
    if (!rate) return amountInCurrent;
    return amountInCurrent / rate;
  };

  const handleCurrencyChange = (code: string) => {
    setCurrencyCode(code);
    localStorage.setItem(CURRENCY_KEY, code);
  };

  const saveExpenses = (exps: Expense[]) => {
    setExpenses(exps);
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(exps));
  };

  const handleSetBalance = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(balanceInput);
    if (!num || num < 1) return;
    const base = toBase(num);
    setInitialBalance(base);
    localStorage.setItem(INITIAL_BALANCE_KEY, String(base));
  };

  const handleAdd = useCallback(
    (data: { amount: number; category: string; description: string; date: string }) => {
      const amountInBase = toBase(data.amount);
      const newBalance = remaining - amountInBase;
      const expense: Expense = {
        id: crypto.randomUUID(),
        ...data,
        amount: amountInBase,
        balance: newBalance,
        type: 'expense',
      };
      const updated = [expense, ...expenses];
      saveExpenses(updated);
    },
    [expenses, remaining, currencyCode]
  );

  const recalculate = (list: Expense[], base: number): Expense[] => {
    let bal = base;
    const reversed = [...list].reverse().map((e) => {
      if (e.type === 'income') {
        // income учтён в initialBalance, в журнале просто отображаем текущий остаток
        return { ...e, balance: bal };
      }
      bal -= e.amount;
      return { ...e, balance: bal };
    });
    return reversed.reverse();
  };

  const handleDelete = useCallback(
    (id: string) => {
      const entry = expenses.find((e) => e.id === id);
      if (!entry) return;
      // При удалении не меняем баланс и не уменьшаем "потрачено":
      // - удалённый расход продолжает учитываться через deletedExpensesTotal
      // - удалённый доход остаётся внутри initialBalance (мы его не вычитаем)
      if (entry.type === 'expense') {
        const newDeleted = deletedExpensesTotal + entry.amount;
        setDeletedExpensesTotal(newDeleted);
        localStorage.setItem(DELETED_EXPENSES_KEY, String(newDeleted));
      }
      const updated = expenses.filter((e) => e.id !== id);
      saveExpenses(updated);
      // Перемещаем удалённую запись в корзину с отметкой времени удаления
      saveTrash([{ ...entry, deletedAt: Date.now() }, ...trash]);
    },
    [expenses, deletedExpensesTotal, trash]
  );

  const handleRestore = useCallback(
    (id: string) => {
      const entry = trash.find((e) => e.id === id);
      if (!entry) return;
      // Восстанавливаем: для расхода уменьшаем счётчик удалённых,
      // чтобы он снова учитывался через активный журнал.
      if (entry.type === 'expense') {
        const newDeleted = Math.max(0, deletedExpensesTotal - entry.amount);
        setDeletedExpensesTotal(newDeleted);
        localStorage.setItem(DELETED_EXPENSES_KEY, String(newDeleted));
      }
      saveTrash(trash.filter((e) => e.id !== id));
      const { deletedAt: _omit, ...restored } = entry;
      saveExpenses([restored, ...expenses]);
    },
    [trash, expenses, deletedExpensesTotal]
  );

  const handleDeletePermanently = useCallback(
    (id: string) => {
      saveTrash(trash.filter((e) => e.id !== id));
    },
    [trash]
  );

  const handleEmptyTrash = useCallback(() => {
    saveTrash([]);
  }, []);

  const handleEdit = useCallback(
    (
      id: string,
      data: { date: string; description: string; category: string; amount: number }
    ) => {
      const amountInBase = toBase(data.amount);
      const updated = expenses.map((e) => (e.id === id ? { ...e, ...data, amount: amountInBase } : e));
      const recalculated = recalculate(updated, initialBalance ?? 0);
      saveExpenses(recalculated);
    },
    [expenses, initialBalance, currencyCode]
  );

  const handleResetBalance = () => {
    localStorage.removeItem(INITIAL_BALANCE_KEY);
    localStorage.removeItem(EXPENSES_KEY);
    localStorage.removeItem(DELETED_EXPENSES_KEY);
    localStorage.removeItem(TRASH_KEY);
    setInitialBalance(null);
    setExpenses([]);
    setDeletedExpensesTotal(0);
    setTrash([]);
    setBalanceInput('');
  };

  const handleAddBalance = useCallback(
    (data: { amount: number; category: string; description: string; date: string }) => {
      const amountInBase = toBase(data.amount);
      const newInitial = (initialBalance ?? 0) + amountInBase;
      setInitialBalance(newInitial);
      localStorage.setItem(INITIAL_BALANCE_KEY, String(newInitial));

      const incomeEntry: Expense = {
        id: crypto.randomUUID(),
        date: data.date,
        amount: amountInBase,
        category: data.category,
        description: data.description,
        balance: remaining + amountInBase,
        type: 'income',
      };
      saveExpenses([incomeEntry, ...expenses]);
      setShowAddBalance(false);
    },
    [expenses, initialBalance, remaining, currencyCode]
  );

  // Setup screen
  if (initialBalance === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSetBalance}
          className="bg-card border border-border p-10 w-full max-w-sm space-y-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="size-3 rounded-full bg-success animate-pulse shadow-[0_0_10px_hsl(var(--success))]" />
              <span className="text-xs tracking-widest text-muted-foreground font-bold uppercase">
                {t('systemActive')}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-card-foreground tracking-tighter uppercase">
              {t('appTitle')}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              {t('language')}
            </label>
            <LanguageSelector />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              {t('currency')}
            </label>
            <CurrencySelector value={currencyCode} onChange={handleCurrencyChange} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block">
              {t('initialBalance')} ({currency.symbol})
            </label>
            <input
              type="number"
              value={balanceInput}
              onChange={(e) => setBalanceInput(e.target.value)}
              placeholder={t('enterAmount')}
              className="w-full bg-secondary border border-border px-3 py-3 text-lg text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors tabular-nums"
              autoFocus
              min="1"
              step="1"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-primary/10 border border-primary/40 text-primary text-sm font-bold uppercase tracking-widest hover:bg-primary/20 transition-colors"
          >
            {t('start')}
          </button>
        </motion.form>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-4 sm:pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="size-3 rounded-full bg-success animate-pulse shadow-[0_0_10px_hsl(var(--success))]" />
              <span className="text-[10px] sm:text-xs tracking-widest text-muted-foreground font-bold uppercase">
                {t('systemActive')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-card-foreground tracking-tighter uppercase mt-1">
              {t('appTitle')}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center w-full md:w-auto">
            <button
              onClick={() => setShowTrash(true)}
              aria-label={t('trash')}
              title={t('trash')}
              className="size-8 flex items-center justify-center bg-secondary border border-border text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors shrink-0 relative"
            >
              <Trash2 className="size-4" />
              {trash.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 flex items-center justify-center bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full">
                  {trash.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              aria-label={t('settings')}
              className="size-8 flex items-center justify-center bg-secondary border border-border text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors shrink-0"
            >
              <Settings className="size-4" />
            </button>
            <ThemeToggle />
            <LanguageSelector />
            <CurrencySelector value={currencyCode} onChange={handleCurrencyChange} />
            <button
              onClick={handleResetBalance}
              className="px-3 sm:px-4 py-1.5 bg-destructive/10 border border-destructive/50 text-destructive text-[10px] font-bold uppercase hover:bg-destructive/20 transition-colors"
            >
              {t('reset')}
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-3 sm:px-4 py-1.5 bg-primary/10 border border-primary/40 text-primary text-[10px] font-bold uppercase hover:bg-primary/20 transition-colors"
            >
              {t('addExpense')}
            </button>
            <button
              onClick={() => setShowAddBalance(true)}
              className="px-3 sm:px-4 py-1.5 bg-lime/10 border border-lime/50 text-lime text-[10px] font-bold uppercase hover:bg-lime/20 transition-colors"
            >
              {t('addBalance')}
            </button>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <BalanceCard label={t('initialBalance')} value={initialBalance} variant="primary" symbol={currency.symbol} convert={convertToCurrent} />
          <BalanceCard label={t('spent')} value={totalSpent} variant="destructive" symbol={currency.symbol} convert={convertToCurrent} />
          <BalanceCard label={t('remaining')} value={remaining} variant="accent" symbol={currency.symbol} convert={convertToCurrent} />
        </motion.div>


{(ratesLoading || ratesError || updatedAt) && (
  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex flex-wrap items-center gap-x-3 gap-y-1">
    {ratesLoading && t('loadingRate')}

    {ratesError && (
      <span className="text-destructive">
        {t('rateUnavailable')}
      </span>
    )}

    {!ratesLoading && !ratesError && updatedAt && (
      <>
        <span>
          {t('rateInfo')}
        </span>

        {ratePairs.map((pair) => (
          <span key={`${pair.from}-${pair.to}`}>
            · 1 {pair.from} = {' '}
            {formatRate(getExchangeRate(pair.from, pair.to))} {pair.to}
          </span>
        ))}

        <span>
          · {t('updated')}{' '}
          {new Date(updatedAt).toLocaleString(
            lang === 'ru'
              ? 'ru-RU'
              : lang === 'uz'
              ? 'uz-UZ'
              : 'en-US'
          )}
        </span>
      </>
    )}
  </div>
)}


        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <ExpenseTable expenses={expenses} onDelete={handleDelete} onEdit={setEditing} symbol={currency.symbol} convert={convertToCurrent} />
        </motion.div>

        <AnimatePresence>
          {editing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EditExpenseForm
                expense={{ ...editing, amount: convertToCurrent(editing.amount) }}
                onSave={handleEdit}
                onClose={() => setEditing(null)}
              />
            </motion.div>
          )}
          {showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AddExpenseForm onAdd={handleAdd} onClose={() => setShowForm(false)} symbol={currency.symbol} />
            </motion.div>
          )}
          {showAddBalance && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AddBalanceForm
                onAdd={handleAddBalance}
                onClose={() => setShowAddBalance(false)}
                symbol={currency.symbol}
              />
            </motion.div>
          )}
          {showSettings && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SettingsDialog onClose={() => setShowSettings(false)} />
            </motion.div>
          )}
          {showTrash && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TrashDialog
                items={trash}
                onClose={() => setShowTrash(false)}
                onRestore={handleRestore}
                onDeletePermanently={handleDeletePermanently}
                onEmpty={handleEmptyTrash}
                symbol={currency.symbol}
                convert={convertToCurrent}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
