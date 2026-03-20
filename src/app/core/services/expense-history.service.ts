import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { EXPENSE_CATEGORIES, ExpenseCategory } from '../models/expense.model';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { ExpenseService } from './expense.service';

export interface CategoryTotal {
  name: string;
  value: number;
}

export interface MonthlySnapshot {
  /** 'YYYY-MM' */
  monthKey: string;
  /** 'March 2025' */
  monthLabel: string;
  chartData: CategoryTotal[];
  total: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function storageKey(userId: string): string {
  return `expense_history_${userId}`;
}

function monthLabel(year: number, month: number): string {
  return `${MONTH_NAMES[month]} ${year}`;
}

/** Generate random expense totals per category for a past month */
function generateMonthData(seed: number): CategoryTotal[] {
  // lightweight pseudo-random from seed so different months look different
  let s = seed;
  function rng(): number {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  }

  return (EXPENSE_CATEGORIES as ExpenseCategory[])
    .map((cat) => {
      // ~40 % chance a category has zero spend that month
      const active = rng() > 0.4;
      const value = active ? Math.round(rng() * 900 + 50) : 0;
      return { name: cat, value };
    })
    .filter((c) => c.value > 0);
}

/** Build snapshot for the past N calendar months */
function buildHistoricalSnapshots(userId: string, months = 6): MonthlySnapshot[] {
  const now = new Date();
  const snapshots: MonthlySnapshot[] = [];

  for (let i = 1; i <= months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth(); // 0-based
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;

    // Unique seed per user + month so data differs between Alice and Bob
    const seed = parseInt(userId, 10) * 100000 + year * 100 + month;
    const chartData = generateMonthData(seed);
    const total = chartData.reduce((s, c) => s + c.value, 0);

    snapshots.push({ monthKey: key, monthLabel: monthLabel(year, month), chartData, total });
  }

  return snapshots;
}

@Injectable({ providedIn: 'root' })
export class ExpenseHistoryService {
  private readonly auth = inject(AuthService);
  private readonly storage = inject(StorageService);
  private readonly expenseService = inject(ExpenseService);

  private readonly _historicalMonths = signal<MonthlySnapshot[]>([]);

  readonly historicalMonths = this._historicalMonths.asReadonly();

  /** Current month snapshot derived live from ExpenseService */
  readonly currentMonthSnapshot = computed<MonthlySnapshot>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;

    const totalsMap = new Map<string, number>();
    for (const exp of this.expenseService.expenses()) {
      if (exp.date.startsWith(key)) {
        totalsMap.set(exp.category, (totalsMap.get(exp.category) ?? 0) + exp.amount);
      }
    }

    const chartData: CategoryTotal[] = Array.from(totalsMap.entries()).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
    }));

    const total = chartData.reduce((s, c) => s + c.value, 0);
    return { monthKey: key, monthLabel: monthLabel(year, month), chartData, total };
  });

  constructor() {
    // Load persisted history when user logs in, clear on logout
    effect(() => {
      const user = this.auth.user();
      if (user) {
        const saved = this.storage.get<MonthlySnapshot[]>(storageKey(user.id));
        this._historicalMonths.set(saved ?? []);
      } else {
        this._historicalMonths.set([]);
      }
    });

    // On fresh login generate historical data if not already stored
    effect(() => {
      const trigger = this.auth.loginTrigger();
      if (trigger === 0) return;
      const userId = this.auth.user()?.id;
      if (!userId) return;

      const existing = this.storage.get<MonthlySnapshot[]>(storageKey(userId));
      if (!existing || existing.length === 0) {
        const snapshots = buildHistoricalSnapshots(userId, 6);
        this._historicalMonths.set(snapshots);
        this.storage.set(storageKey(userId), snapshots);
      } else {
        this._historicalMonths.set(existing);
      }
    });
  }
}
