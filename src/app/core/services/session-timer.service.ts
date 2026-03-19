import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { AuthService } from './auth.service';
import { AppConfigService } from './app-config.service';
import { ToastService } from './toast.service';

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

@Injectable({ providedIn: 'root' })
export class SessionTimerService {
  private readonly auth = inject(AuthService);
  private readonly configService = inject(AppConfigService);
  private readonly toastService = inject(ToastService);

  private subscription?: Subscription;
  private warningTriggered = false;
  private warningToastId?: string;

  private readonly _remaining = signal<number>(0);
  readonly remaining = this._remaining.asReadonly();

  readonly active = computed(() => this.auth.isAuthenticated() && this._remaining() > 0);

  /** CSS classes for the timer badge background, transitions through green → yellow → red */
  readonly colorClass = computed(() => {
    const sessionTime = this.configService.config().auth.sessionTime;
    const remaining = this._remaining();
    if (sessionTime <= 0) return 'bg-emerald-500 text-white';

    const pct = remaining / sessionTime; // fraction of time REMAINING

    if (pct <= 0.1) return 'bg-red-500 text-white';
    if (pct <= 0.4) return 'bg-amber-400 text-gray-900';
    return 'bg-emerald-500 text-white';
  });

  readonly formattedTime = computed(() => {
    const ms = this._remaining();
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  });

  constructor() {
    // React to auth state changes
    effect(() => {
      if (this.auth.isAuthenticated()) {
        this.start();
      } else {
        this.stop();
      }
    });
  }

  start(): void {
    this.stop();
    this.warningTriggered = false;
    this.warningToastId = undefined;

    const sessionTime = this.configService.config().auth.sessionTime;
    this._remaining.set(sessionTime);

    this.subscription = interval(1000).subscribe(() => {
      const next = Math.max(0, this._remaining() - 1000);
      this._remaining.set(next);

      // Warning toast
      const triggerMs = this.configService.config().auth.timeBeforeExpiredTrigger;
      if (!this.warningTriggered && triggerMs > 0 && next <= triggerMs && next > 0) {
        this.warningTriggered = true;
        this.warningToastId = this.toastService.show(
          this.configService.config().auth.triggerMessage,
          'warning',
          0 // persistent
        );
      }

      if (next <= 0) {
        this.stop();
        this.auth.logout();
      }
    });
  }

  stop(): void {
    this.subscription?.unsubscribe();
    this.subscription = undefined;
    this._remaining.set(0);

    // Dismiss lingering warning toast on logout
    if (this.warningToastId) {
      this.toastService.dismiss(this.warningToastId);
      this.warningToastId = undefined;
    }
  }
}
