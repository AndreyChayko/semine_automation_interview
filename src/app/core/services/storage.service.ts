import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly PREFIX = 'app_';

  get<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(this.PREFIX + key);
      return item ? (JSON.parse(item) as T) : null;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      sessionStorage.setItem(this.PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn('SessionStorage write failed:', e);
    }
  }

  remove(key: string): void {
    sessionStorage.removeItem(this.PREFIX + key);
  }

  clear(): void {
    const keys = Object.keys(sessionStorage).filter((k) =>
      k.startsWith(this.PREFIX)
    );
    keys.forEach((k) => sessionStorage.removeItem(k));
  }
}
