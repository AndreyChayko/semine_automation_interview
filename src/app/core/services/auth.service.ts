import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User, LoginCredentials, AuthState } from '../models/user.model';
import { MockApiService } from './mock-api.service';
import { StorageService } from './storage.service';

const AUTH_KEY = 'auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(MockApiService);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  private readonly _state = signal<AuthState>(this.loadFromStorage());

  /** Increments on every fresh login (not on page-refresh restore). */
  private readonly _loginTrigger = signal(0);

  readonly user = computed(() => this._state().user);
  readonly token = computed(() => this._state().token);
  readonly isAuthenticated = computed(() => this._state().isAuthenticated);
  readonly loginTrigger = this._loginTrigger.asReadonly();

  constructor() {
    // Persist state to sessionStorage on every change
    effect(() => {
      this.storage.set(AUTH_KEY, this._state());
    });
  }

  login(credentials: LoginCredentials): Observable<{ user: User; token: string }> {
    return this.api.login(credentials).pipe(
      tap(({ user, token }) => {
        this._state.set({ user, token, isAuthenticated: true });
        this._loginTrigger.update((n) => n + 1);
        this.router.navigate(['/profile']);
      })
    );
  }

  logout(): void {
    this._state.set({ user: null, token: null, isAuthenticated: false });
    this.router.navigate(['/login']);
  }

  updateUser(updates: Partial<User>): Observable<User> {
    const token = this.token();
    if (!token) throw new Error('Not authenticated');

    return this.api.updateProfile(token, updates).pipe(
      tap((user) => {
        this._state.update((state) => ({ ...state, user }));
      })
    );
  }

  private loadFromStorage(): AuthState {
    return (
      this.storage.get<AuthState>(AUTH_KEY) ?? {
        user: null,
        token: null,
        isAuthenticated: false,
      }
    );
  }
}
