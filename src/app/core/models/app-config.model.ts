export interface AuthConfig {
  /** Total session duration in milliseconds */
  sessionTime: number;
  /** Time before session expiry to show warning (ms). Set to 0 to disable. */
  timeBeforeExpiredTrigger: number;
  /** Message shown in the warning toast */
  triggerMessage: string;
}

export interface ExpensesConfig {
  /** Whether expense registration is enabled for this user */
  enabled: boolean;
  /** Max total expenses allowed per calendar month (in base currency) */
  maxMonthlyAmount: number;
}

export interface HistoryConfig {
  /** Whether the expense history page is enabled for this user */
  enabled: boolean;
  /** How charts are arranged: single column list or responsive tile grid */
  layout: 'list' | 'grid';
}

export interface AppConfig {
  auth: AuthConfig;
  expenses: ExpensesConfig;
  history: HistoryConfig;
}

// ─── Default configuration ────────────────────────────────────────────────────
export const DEFAULT_APP_CONFIG: AppConfig = {
  auth: {
    sessionTime: 5 * 60 * 1000,          // 5 minutes
    timeBeforeExpiredTrigger: 60 * 1000, // warn 1 minute before expiry
    triggerMessage: 'Your session will expire in 1 minute. Please save your work.',
  },
  expenses: {
    enabled: true,
    maxMonthlyAmount: 1500,
  },
  history: {
    enabled: true,
    layout: 'list',
  },
};
