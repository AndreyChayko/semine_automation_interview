import { Injectable, inject, signal, computed, effect } from '@angular/core';
import {
  Expense,
  ExpenseCategory,
  ExpenseCurrency,
  ExpenseGroup,
} from '../models/expense.model';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';

function generateId(): string {
  return `exp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

const SEED_TITLES = [
  'Team lunch',
  'Conference registration',
  'Software license renewal',
  'Office supplies',
  'Uber to client site',
  'Client dinner',
  'Flight booking',
  'Hotel stay',
  'Training course',
  'Co-working space',
];
const SEED_CATEGORIES: ExpenseCategory[] = [
  'Travel', 'Meals', 'Software', 'Office', 'Training',
];
const SEED_CURRENCIES: ExpenseCurrency[] = ['USD', 'EUR', 'NOK'];

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly auth = inject(AuthService);
  private readonly storage = inject(StorageService);

  private readonly _expenses = signal<Expense[]>([]);

  readonly expenses = this._expenses.asReadonly();

  /** Expenses grouped by date, newest first */
  readonly groupedByDate = computed<ExpenseGroup[]>(() => {
    const map = new Map<string, Expense[]>();
    for (const exp of this._expenses()) {
      const list = map.get(exp.date) ?? [];
      list.push(exp);
      map.set(exp.date, list);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, expenses]) => ({
        date,
        expenses: [...expenses].sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt)
        ),
      }));
  });

  /** Sum of all expenses in the current calendar month */
  readonly currentMonthTotal = computed(() => {
    const now = new Date();
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return this._expenses()
      .filter((e) => e.date.startsWith(prefix))
      .reduce((sum, e) => sum + e.amount, 0);
  });

  constructor() {
    // Load persisted expenses when user is available, clear on logout
    effect(() => {
      const user = this.auth.user();
      if (user) {
        const saved = this.storage.get<Expense[]>(`expenses_${user.id}`) ?? [];
        this._expenses.set(saved);
      } else {
        this._expenses.set([]);
      }
    });

    // On every fresh login (loginTrigger increments), add 1–3 paid seed expenses
    effect(() => {
      const trigger = this.auth.loginTrigger();
      if (trigger === 0) return; // skip initial value — not a fresh login
      const userId = this.auth.user()?.id;
      if (userId) {
        const seeds = this.generateSeedExpenses(userId);
        this._expenses.update((list) => [...list, ...seeds]);
      }
    });

    // Persist to sessionStorage whenever expenses change
    effect(() => {
      const userId = this.auth.user()?.id;
      if (userId) {
        this.storage.set(`expenses_${userId}`, this._expenses());
      }
    });
  }

  add(expense: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'status'>): void {
    const userId = this.auth.user()?.id;
    if (!userId) return;
    const newExpense: Expense = {
      ...expense,
      id: generateId(),
      userId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this._expenses.update((list) => [newExpense, ...list]);
  }

  remove(id: string): void {
    // Only pending expenses can be deleted
    this._expenses.update((list) =>
      list.filter((e) => !(e.id === id && e.status === 'pending'))
    );
  }

  private generateSeedExpenses(userId: string): Expense[] {
    const count = Math.floor(Math.random() * 3) + 1;
    const now = new Date();
    const daysInMonth = now.getDate();

    return Array.from({ length: count }, () => {
      const daysAgo = Math.floor(Math.random() * Math.max(daysInMonth - 1, 1));
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo);

      return {
        id: generateId(),
        userId,
        title: SEED_TITLES[Math.floor(Math.random() * SEED_TITLES.length)],
        amount: Math.round((Math.random() * 450 + 50) * 100) / 100,
        currency: SEED_CURRENCIES[Math.floor(Math.random() * SEED_CURRENCIES.length)] as ExpenseCurrency,
        category: SEED_CATEGORIES[Math.floor(Math.random() * SEED_CATEGORIES.length)] as ExpenseCategory,
        date: d.toISOString().split('T')[0],
        status: 'paid' as const,
        createdAt: new Date().toISOString(),
      };
    });
  }
}
