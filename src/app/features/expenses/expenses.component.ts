import { Component } from '@angular/core';

@Component({
  selector: 'app-expenses',
  standalone: true,
  template: `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col items-center justify-center py-28 text-center">

        <!-- Icon -->
        <div class="h-20 w-20 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <!-- Heroicon: credit-card (solid) -->
          <svg class="h-10 w-10 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.5 3.75a3 3 0 0 0-3 3v.75h21v-.75a3 3 0 0 0-3-3h-15Z" />
            <path fill-rule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-7.5Zm-18 3.75a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" clip-rule="evenodd" />
          </svg>
        </div>

        <h1 class="text-2xl font-bold text-gray-900 mb-2">Expenses</h1>
        <p class="text-gray-400 text-sm max-w-xs leading-relaxed">
          Expense tracking and reporting features will appear here in a future release.
        </p>

        <!-- Coming soon badge -->
        <span class="mt-5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full border border-indigo-100">
          <span class="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
          Coming soon
        </span>

      </div>
    </div>
  `,
})
export class ExpensesComponent {}
