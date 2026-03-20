import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'expenses',
    loadComponent: () =>
      import('./features/expenses/expenses.component').then(
        (m) => m.ExpensesComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'expense-history',
    loadComponent: () =>
      import('./features/expense-history/expense-history.component').then(
        (m) => m.ExpenseHistoryComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
