export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  balance: number;
  type?: 'expense' | 'income';
  deletedAt?: number;
}

export const CATEGORIES = [
  'Еда',
  'Транспорт',
  'Жильё',
  'Развлечения',
  'Здоровье',
  'Одежда',
  'Связь',
  'Образование',
  'Прочее',
] as const;

export interface Currency {
  code: string;
  symbol: string;
  label: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'RUB', symbol: '₽', label: 'Рубли (₽)' },
  { code: 'UZS', symbol: 'сўм', label: 'Сумы (сўм)' },
  { code: 'USD', symbol: '$', label: 'Доллары ($)' },
];
