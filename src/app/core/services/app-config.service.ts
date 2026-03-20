import { Injectable, signal, computed, inject } from '@angular/core';
import { AppConfig, DEFAULT_APP_CONFIG } from '../models/app-config.model';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';

/** User IDs of the two demo accounts (must match mock-api.service.ts) */
export const DEMO_USER_IDS = ['1', '2'] as const;
export type DemoUserId = (typeof DEMO_USER_IDS)[number];

function storageKey(userId: string): string {
  return `app_config_${userId}`;
}

function deepMerge(saved: AppConfig): AppConfig {
  return {
    auth: { ...DEFAULT_APP_CONFIG.auth, ...saved.auth },
    expenses: { ...DEFAULT_APP_CONFIG.expenses, ...saved.expenses },
  };
}

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private readonly storage = inject(StorageService);
  private readonly auth = inject(AuthService);

  /** Per-user config map; falls back to DEFAULT_APP_CONFIG when key absent */
  private readonly _configs = signal<Record<string, AppConfig>>(this.loadAll());

  /** Active config for the currently logged-in user (or default if no user) */
  readonly config = computed(() => {
    const userId = this.auth.user()?.id;
    return userId
      ? (this._configs()[userId] ?? DEFAULT_APP_CONFIG)
      : DEFAULT_APP_CONFIG;
  });

  getConfigForUser(userId: string): AppConfig {
    return this._configs()[userId] ?? DEFAULT_APP_CONFIG;
  }

  saveForUser(userId: string, config: AppConfig): void {
    this._configs.update((map) => ({ ...map, [userId]: config }));
    this.storage.set(storageKey(userId), config);
  }

  resetForUser(userId: string): void {
    this._configs.update((map) => ({ ...map, [userId]: DEFAULT_APP_CONFIG }));
    this.storage.set(storageKey(userId), DEFAULT_APP_CONFIG);
  }

  private loadAll(): Record<string, AppConfig> {
    const result: Record<string, AppConfig> = {};
    for (const id of DEMO_USER_IDS) {
      const saved = this.storage.get<AppConfig>(storageKey(id));
      if (saved) {
        result[id] = deepMerge(saved);
      } else {
        // Persist defaults immediately so sessionStorage is always populated
        result[id] = DEFAULT_APP_CONFIG;
        this.storage.set(storageKey(id), DEFAULT_APP_CONFIG);
      }
    }
    return result;
  }
}
