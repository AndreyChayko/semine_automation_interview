import { Component, output, signal, computed } from '@angular/core';
import {
  Expense,
  ExpenseCategory,
  ExpenseCurrency,
  EXPENSE_CATEGORIES,
  EXPENSE_CURRENCIES,
} from '../../core/models/expense.model';
import { createField, Validators, SignalField } from '../../shared/utils/signal-form';

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

@Component({
  selector: 'app-add-expense-modal',
  standalone: true,
  imports: [],
  template: `
    <!-- Backdrop -->
    <div
      class="fixed inset-0 z-[80] flex items-center justify-center p-4"
      (click)="onBackdropClick($event)"
    >
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <!-- Modal card -->
      <div
        class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 flex flex-col max-h-[90vh]"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 class="text-lg font-bold text-gray-900">Add Expense</h2>
            <p class="text-xs text-gray-400 mt-0.5">Register a new expense by receipt</p>
          </div>
          <button
            (click)="cancelled.emit()"
            class="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="overflow-y-auto px-6 py-5 space-y-4">

          <!-- Receipt upload area (decorative) -->
          <div class="border-2 border-dashed border-gray-200 rounded-xl p-4 flex items-center gap-3 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors cursor-pointer">
            <div class="h-10 w-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
              <!-- Heroicon: document-arrow-up -->
              <svg class="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875Zm6.905 9.97a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72V18a.75.75 0 0 0 1.5 0v-4.19l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z" clip-rule="evenodd" />
                <path d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Attach receipt</p>
              <p class="text-xs text-gray-400">PNG, JPG or PDF up to 10 MB</p>
            </div>
          </div>

          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Title <span class="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Team lunch at Noma"
              [value]="title.value()"
              (input)="onInput(title, $event)"
              (blur)="title.touch()"
              class="form-input"
              [class.form-input-error]="title.error()"
            />
            @if (title.error()) {
              <p class="mt-1 text-xs text-red-600">{{ title.error() }}</p>
            }
          </div>

          <!-- Amount + Currency -->
          <div class="grid grid-cols-[1fr_auto] gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Amount <span class="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                [value]="amount.value()"
                (input)="onInput(amount, $event)"
                (blur)="amount.touch()"
                class="form-input"
                [class.form-input-error]="amount.error()"
              />
              @if (amount.error()) {
                <p class="mt-1 text-xs text-red-600">{{ amount.error() }}</p>
              }
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
              <select
                [value]="currency()"
                (change)="onCurrencyChange($event)"
                class="form-input w-24"
              >
                @for (c of currencies; track c) {
                  <option [value]="c">{{ c }}</option>
                }
              </select>
            </div>
          </div>

          <!-- Category + Date -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select
                [value]="category()"
                (change)="onCategoryChange($event)"
                class="form-input"
              >
                @for (cat of categories; track cat) {
                  <option [value]="cat">{{ cat }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Date <span class="text-red-400">*</span>
              </label>
              <input
                type="date"
                [value]="date.value()"
                (input)="onInput(date, $event)"
                (blur)="date.touch()"
                class="form-input"
                [class.form-input-error]="date.error()"
              />
              @if (date.error()) {
                <p class="mt-1 text-xs text-red-600">{{ date.error() }}</p>
              }
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Description
              <span class="ml-1 text-xs text-gray-400 font-normal">optional</span>
            </label>
            <textarea
              rows="2"
              placeholder="Any notes about this expense..."
              [value]="description()"
              (input)="onSelectChange(description.set.bind(description), $event)"
              class="form-input resize-none"
            ></textarea>
          </div>

        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            (click)="submit()"
            class="btn-primary flex-1 py-2.5"
          >
            Register Expense
          </button>
          <button
            (click)="cancelled.emit()"
            class="btn-secondary px-5"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  `,
})
export class AddExpenseModalComponent {
  readonly expenseRegistered = output<Omit<Expense, 'id' | 'userId' | 'createdAt' | 'status'>>();
  readonly cancelled = output<void>();

  readonly categories = EXPENSE_CATEGORIES;
  readonly currencies = EXPENSE_CURRENCIES;

  readonly title = createField<string>('', [Validators.required('Title')]);
  readonly amount = createField<string>('', [
    Validators.required('Amount'),
    (v) => {
      const n = parseFloat(v);
      return isNaN(n) || n <= 0 ? 'Enter a valid positive amount' : null;
    },
  ]);
  readonly currency = signal<ExpenseCurrency>('USD');
  readonly category = signal<ExpenseCategory>('Other');
  readonly date = createField<string>(todayStr(), [Validators.required('Date')]);
  readonly description = signal('');

  readonly isValid = computed(
    () =>
      this.title.value().trim() !== '' &&
      this.amount.value().trim() !== '' &&
      this.title.error() === null &&
      this.amount.error() === null &&
      this.date.error() === null
  );

  onInput(field: SignalField<string>, event: Event): void {
    field.set((event.target as HTMLInputElement).value);
    field.touch();
  }

  onSelectChange(setter: (v: string) => void, event: Event): void {
    setter((event.target as HTMLSelectElement | HTMLTextAreaElement).value);
  }

  onCurrencyChange(event: Event): void {
    this.currency.set((event.target as HTMLSelectElement).value as ExpenseCurrency);
  }

  onCategoryChange(event: Event): void {
    this.category.set((event.target as HTMLSelectElement).value as ExpenseCategory);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancelled.emit();
    }
  }

  submit(): void {
    this.title.touch();
    this.amount.touch();
    this.date.touch();
    if (!this.isValid()) return;

    this.expenseRegistered.emit({
      title: this.title.value().trim(),
      amount: parseFloat(this.amount.value()),
      currency: this.currency() as ExpenseCurrency,
      category: this.category() as ExpenseCategory,
      date: this.date.value(),
      description: this.description() || undefined,
    });
  }
}
