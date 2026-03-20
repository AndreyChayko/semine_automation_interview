import { Component, inject, signal, computed } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ExpenseService } from '../../core/services/expense.service';
import { AppConfigService } from '../../core/services/app-config.service';
import { AddExpenseModalComponent } from './add-expense-modal.component';
import {
  Expense,
  ExpenseGroup,
  CATEGORY_ICONS,
  CURRENCY_SYMBOLS,
} from '../../core/models/expense.model';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [AddExpenseModalComponent],
  templateUrl: './expenses.component.html',
})
export class ExpensesComponent {
  private readonly expenseService = inject(ExpenseService);
  private readonly configService = inject(AppConfigService);

  readonly isEnabled = computed(() => this.configService.config().expenses.enabled);
  readonly maxAmount = computed(() => this.configService.config().expenses.maxMonthlyAmount);
  readonly currentTotal = this.expenseService.currentMonthTotal;
  readonly groupedExpenses = this.expenseService.groupedByDate;
  readonly hasExpenses = computed(() => this.expenseService.expenses().length > 0);

  readonly isQuotaExceeded = computed(() => this.currentTotal() >= this.maxAmount());
  readonly quotaPercent = computed(() => {
    const max = this.maxAmount();
    if (max <= 0) return 100;
    return Math.min(100, Math.round((this.currentTotal() / max) * 100));
  });
  readonly progressBarClass = computed(() => {
    const pct = this.quotaPercent();
    if (pct >= 100) return 'bg-red-500';
    if (pct >= 90) return 'bg-red-400';
    if (pct >= 60) return 'bg-amber-400';
    return 'bg-emerald-500';
  });

  readonly isModalOpen = signal(false);

  openModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  onExpenseAdded(data: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'status'>): void {
    this.expenseService.add(data);
    this.closeModal();
  }

  deleteExpense(id: string): void {
    this.expenseService.remove(id);
  }

  // ─── Formatting helpers ───────────────────────────────────────────────────

  categoryIcon(category: string): string {
    return CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] ?? '📋';
  }

  formatAmount(amount: number, currency: string): string {
    const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] ?? currency + ' ';
    return `${symbol}${amount.toFixed(2)}`;
  }

  formatGroupDate(dateStr: string): string {
    const d = new Date(dateStr + 'T12:00:00'); // noon to avoid timezone edge cases
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (isSameDay(d, today)) return 'Today';
    if (isSameDay(d, yesterday)) return 'Yesterday';

    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  dayNumber(dateStr: string): string {
    return String(new Date(dateStr + 'T12:00:00').getDate());
  }

  monthAbbr(dateStr: string): string {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' });
  }

  groupTotal(group: ExpenseGroup): string {
    const total = group.expenses.reduce((s, e) => s + e.amount, 0);
    // Use currency of first expense as group currency indicator
    const currency = group.expenses[0]?.currency ?? 'USD';
    return this.formatAmount(total, currency);
  }
}
