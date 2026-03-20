import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { ToastContainerComponent } from './shared/components/toast/toast.component';

import { AuthService } from './core/services/auth.service';
import { SessionTimerService } from './core/services/session-timer.service';

// ─────────────────────────────────────────────────────────────────────────────
// Global demo app configuration is defined in:
//   src/app/core/models/app-config.model.ts  →  DEFAULT_APP_CONFIG
//
// Config sections:
//   auth:
//     sessionTime               – total session duration (ms)
//     timeBeforeExpiredTrigger  – warn N ms before expiry (0 = disabled)
//     triggerMessage            – text shown in the warning toast
//
// At runtime, override defaults via the DEV panel on the login page.
// Values persist in sessionStorage for the current browser session.
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, ToastContainerComponent],
  template: `
    <div class="h-screen flex flex-col overflow-hidden">

      <app-navbar />

      <div class="flex flex-1 min-h-0">
        @if (auth.isAuthenticated()) {
          <app-sidebar />
        }
        <main class="flex-1 overflow-y-auto">
          <router-outlet />
        </main>
      </div>

    </div>

    <app-toast-container />
  `,
})
export class AppComponent {
  readonly auth = inject(AuthService);

  // Eagerly inject SessionTimerService so its constructor effect() activates
  // from app startup and reacts to auth state restored from sessionStorage.
  private readonly _timer = inject(SessionTimerService);
}
