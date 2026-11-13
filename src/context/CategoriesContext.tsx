import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';

const EXPENSE_KEY = 'expense-tracker-categories';
const INCOME_KEY = 'expense-tracker-income-categories';

const DEFAULT_EXPENSE_CATEGORIES = [
  'Еда',
  'Транспорт',
  'Жильё',
  'Развлечения',
  'Здоровье',
  'Одежда',
  'Связь',
  'Образование',
  'Прочее',
];

const DEFAULT_INCOME_CATEGORIES = ['Пополнение', 'Зарплата', 'Подарок', 'Возврат', 'Прочее'];

export type CategoryKind = 'expense' | 'income';

interface CategoriesContextValue {
  expenseCategories: string[];
  incomeCategories: string[];
  /** @deprecated используй expenseCategories */
  categories: string[];
  addCategory: (kind: CategoryKind, name: string) => void;
  removeCategory: (kind: CategoryKind, name: string) => void;
  renameCategory: (kind: CategoryKind, oldName: string, newName: string) => void;
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

function load(key: string, fallback: string[]): string[] {
  try {
    const v = localStorage.getItem(key);
    if (!v) return fallback;
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) && parsed.length ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [expenseCategories, setExpense] = useState<string[]>(() => load(EXPENSE_KEY, DEFAULT_EXPENSE_CATEGORIES));
  const [incomeCategories, setIncome] = useState<string[]>(() => load(INCOME_KEY, DEFAULT_INCOME_CATEGORIES));

  useEffect(() => {
    localStorage.setItem(EXPENSE_KEY, JSON.stringify(expenseCategories));
  }, [expenseCategories]);

  useEffect(() => {
    localStorage.setItem(INCOME_KEY, JSON.stringify(incomeCategories));
  }, [incomeCategories]);

  const setter = (kind: CategoryKind) => (kind === 'income' ? setIncome : setExpense);

  const addCategory = useCallback((kind: CategoryKind, name: string) => {
    const n = name.trim();
    if (!n) return;
    setter(kind)((prev) => (prev.includes(n) ? prev : [...prev, n]));
  }, []);

  const removeCategory = useCallback((kind: CategoryKind, name: string) => {
    setter(kind)((prev) => prev.filter((c) => c !== name));
  }, []);

  const renameCategory = useCallback((kind: CategoryKind, oldName: string, newName: string) => {
    const n = newName.trim();
    if (!n) return;
    setter(kind)((prev) => prev.map((c) => (c === oldName ? n : c)));
  }, []);

  return (
    <CategoriesContext.Provider
      value={{
        expenseCategories,
        incomeCategories,
        categories: expenseCategories,
        addCategory,
        removeCategory,
        renameCategory,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) throw new Error('useCategories must be used within CategoriesProvider');
  return ctx;
}
