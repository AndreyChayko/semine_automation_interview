import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  /** Auto-dismiss after this many ms. 0 = persistent. */
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(message: string, type: ToastType = 'info', duration = 5000): string {
    const id = Math.random().toString(36).slice(2, 9);
    this._toasts.update((t) => [...t, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }

    return id;
  }

  dismiss(id: string): void {
    this._toasts.update((t) => t.filter((toast) => toast.id !== id));
  }

  dismissAll(): void {
    this._toasts.set([]);
  }
}
