import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="w-14 lg:w-56 shrink-0 border-r border-gray-200 bg-white flex flex-col py-4 gap-1 px-2 h-full overflow-y-auto">

      <!-- Profile -->
      <a
        routerLink="/profile"
        routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold"
        [routerLinkActiveOptions]="{ exact: true }"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors group"
        title="Profile"
      >
        <!-- Heroicon: user-circle (solid) -->
        <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path fill-rule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clip-rule="evenodd" />
        </svg>
        <span class="hidden lg:block text-sm">Profile</span>
      </a>

      <!-- Expenses -->
      <a
        routerLink="/expenses"
        routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold"
        [routerLinkActiveOptions]="{ exact: true }"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors group"
        title="Expenses"
      >
        <!-- Heroicon: credit-card (solid) -->
        <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.5 3.75a3 3 0 0 0-3 3v.75h21v-.75a3 3 0 0 0-3-3h-15Z" />
          <path fill-rule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-7.5Zm-18 3.75a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" clip-rule="evenodd" />
        </svg>
        <span class="hidden lg:block text-sm">Expenses</span>
      </a>

      <!-- Expense History -->
      <a
        routerLink="/expense-history"
        routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold"
        [routerLinkActiveOptions]="{ exact: true }"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors group"
        title="Expense History"
      >
        <!-- Heroicon: chart-bar-square (solid) -->
        <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path fill-rule="evenodd" d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm4.5 7.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25a.75.75 0 0 1 .75-.75Zm3.75-1.5a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0V12Zm2.25-3a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 1-1.5 0V9.75A.75.75 0 0 1 13.5 9Zm3.75-1.5a.75.75 0 0 0-1.5 0v9a.75.75 0 0 0 1.5 0v-9Z" clip-rule="evenodd" />
        </svg>
        <span class="hidden lg:block text-sm">History</span>
      </a>

    </aside>
  `,
})
export class SidebarComponent {}
