import { Injectable, signal, inject } from '@angular/core';
import { AppConfig, DEFAULT_APP_CONFIG } from '../models/app-config.model';
import { StorageService } from './storage.service';

const CONFIG_KEY = 'app_config';

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private readonly storage = inject(StorageService);

  private readonly _config = signal<AppConfig>(this.loadConfig());
  readonly config = this._config.asReadonly();

  save(config: AppConfig): void {
    this._config.set(config);
    this.storage.set(CONFIG_KEY, config);
  }

  reset(): void {
    this._config.set(DEFAULT_APP_CONFIG);
    this.storage.remove(CONFIG_KEY);
  }

  private loadConfig(): AppConfig {
    const saved = this.storage.get<AppConfig>(CONFIG_KEY);
    if (!saved) return DEFAULT_APP_CONFIG;
    // Deep merge to guard against missing keys after schema changes
    return {
      auth: { ...DEFAULT_APP_CONFIG.auth, ...saved.auth },
    };
  }
}
