export type ExpenseStatus = 'pending' | 'paid';
export type ExpenseCurrency = 'USD' | 'EUR' | 'NOK' | 'GBP';
export type ExpenseCategory =
  | 'Travel'
  | 'Meals'
  | 'Software'
  | 'Office'
  | 'Training'
  | 'Other';

export interface Expense {
  id: string;
  userId: string;
  title: string;
  amount: number;
  currency: ExpenseCurrency;
  category: ExpenseCategory;
  /** YYYY-MM-DD */
  date: string;
  description?: string;
  status: ExpenseStatus;
  /** ISO timestamp */
  createdAt: string;
}

export interface ExpenseGroup {
  date: string;
  expenses: Expense[];
}

export const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  Travel: '✈️',
  Meals: '🍽️',
  Software: '💻',
  Office: '📎',
  Training: '📚',
  Other: '📋',
};

export const CURRENCY_SYMBOLS: Record<ExpenseCurrency, string> = {
  USD: '$',
  EUR: '€',
  NOK: 'kr ',
  GBP: '£',
};

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Travel', 'Meals', 'Software', 'Office', 'Training', 'Other',
];

export const EXPENSE_CURRENCIES: ExpenseCurrency[] = ['USD', 'EUR', 'NOK', 'GBP'];
