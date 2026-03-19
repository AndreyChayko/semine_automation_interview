import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SessionTimerService } from '../../../core/services/session-timer.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-full px-4 sm:px-6">
        <div class="flex justify-between items-center h-16 gap-4">

          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2.5 shrink-0">
            <div class="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
              <span class="text-white font-bold text-sm">S</span>
            </div>
            <span class="font-semibold text-gray-900 text-lg tracking-tight">Semine</span>
          </a>

          <!-- Right section -->
          @if (auth.isAuthenticated()) {
            <div class="flex items-center gap-3">

              <!-- Session timer badge -->
              @if (timer.active()) {
                <div
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors duration-700 select-none"
                  [class]="timer.colorClass()"
                  title="Session time remaining"
                >
                  <!-- Heroicon: clock (mini) -->
                  <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clip-rule="evenodd" />
                  </svg>
                  {{ timer.formattedTime() }}
                </div>
              }

              <!-- User info -->
              <div class="hidden sm:flex flex-col items-end">
                <span class="text-sm font-medium text-gray-800 leading-tight">
                  {{ auth.user()?.firstName }} {{ auth.user()?.lastName }}
                </span>
                <span class="text-xs text-gray-400">{{ auth.user()?.jobTitle }}</span>
              </div>

              <!-- Avatar -->
              <div class="h-9 w-9 rounded-full bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center shrink-0">
                <span class="text-indigo-700 font-bold text-sm">{{ initials() }}</span>
              </div>

              <!-- Logout -->
              <button
                (click)="auth.logout()"
                class="hidden sm:inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors font-medium px-2 py-1 rounded-md hover:bg-red-50"
              >
                <!-- Heroicon: arrow-right-on-rectangle -->
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                </svg>
                Logout
              </button>

            </div>
          }

        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
  readonly timer = inject(SessionTimerService);

  readonly initials = computed(() => {
    const u = this.auth.user();
    if (!u) return '';
    return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
  });
}
