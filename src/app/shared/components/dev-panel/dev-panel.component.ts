import { Component, inject, signal, computed } from '@angular/core';
import { AppConfigService, DEMO_USER_IDS, DemoUserId } from '../../../core/services/app-config.service';
import { AppConfig, HistoryConfig } from '../../../core/models/app-config.model';

interface DevFormState {
  sessionTimeMs: number;
  triggerTimeMs: number;
  triggerMessage: string;
  expensesEnabled: boolean;
  expensesMaxAmount: number;
  historyEnabled: boolean;
  historyLayout: HistoryConfig['layout'];
}

const DEMO_USERS: { id: DemoUserId; name: string }[] = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
];

function configToForm(cfg: AppConfig): DevFormState {
  return {
    sessionTimeMs: cfg.auth.sessionTime,
    triggerTimeMs: cfg.auth.timeBeforeExpiredTrigger,
    triggerMessage: cfg.auth.triggerMessage,
    expensesEnabled: cfg.expenses.enabled,
    expensesMaxAmount: cfg.expenses.maxMonthlyAmount,
    historyEnabled: cfg.history.enabled,
    historyLayout: cfg.history.layout,
  };
}

function formToConfig(form: DevFormState): AppConfig {
  return {
    auth: {
      sessionTime: form.sessionTimeMs,
      timeBeforeExpiredTrigger: form.triggerTimeMs,
      triggerMessage: form.triggerMessage || 'Session expiring soon.',
    },
    expenses: {
      enabled: form.expensesEnabled,
      maxMonthlyAmount: form.expensesMaxAmount,
    },
    history: {
      enabled: form.historyEnabled,
      layout: form.historyLayout,
    },
  };
}

@Component({
  selector: 'app-dev-panel',
  standalone: true,
  templateUrl: './dev-panel.component.html',
})
export class DevPanelComponent {
  private readonly configService = inject(AppConfigService);

  readonly isOpen = signal(false);
  readonly users = DEMO_USERS;
  readonly selectedUserId = signal<DemoUserId>('1');

  /** Per-user unsaved form states — preserved when switching tabs */
  private readonly _formStates = signal<Record<string, DevFormState>>(
    Object.fromEntries(
      DEMO_USER_IDS.map((id) => [id, configToForm(this.configService.getConfigForUser(id))])
    ) as Record<DemoUserId, DevFormState>
  );

  readonly currentForm = computed(() => this._formStates()[this.selectedUserId()]);

  readonly sessionTimeHint = computed(() => this.msToHuman(this.currentForm().sessionTimeMs));
  readonly triggerTimeHint = computed(() => {
    const ms = this.currentForm().triggerTimeMs;
    return ms === 0 ? 'disabled' : this.msToHuman(ms);
  });

  toggle(): void {
    if (!this.isOpen()) {
      this._formStates.set(
        Object.fromEntries(
          DEMO_USER_IDS.map((id) => [id, configToForm(this.configService.getConfigForUser(id))])
        ) as Record<DemoUserId, DevFormState>
      );
    }
    this.isOpen.update((v) => !v);
  }

  selectUser(id: DemoUserId): void {
    this.selectedUserId.set(id);
  }

  patchForm(patch: Partial<DevFormState>): void {
    const uid = this.selectedUserId();
    this._formStates.update((states) => ({
      ...states,
      [uid]: { ...states[uid], ...patch },
    }));
  }

  onNumberInput(key: keyof Pick<DevFormState, 'sessionTimeMs' | 'triggerTimeMs' | 'expensesMaxAmount'>, event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const val = parseInt(raw, 10);
    this.patchForm({ [key]: isNaN(val) ? 0 : Math.max(0, val) });
  }

  onTextInput(event: Event): void {
    this.patchForm({ triggerMessage: (event.target as HTMLInputElement).value });
  }

  toggleExpenses(): void {
    this.patchForm({ expensesEnabled: !this.currentForm().expensesEnabled });
  }

  toggleHistory(): void {
    this.patchForm({ historyEnabled: !this.currentForm().historyEnabled });
  }

  setHistoryLayout(layout: HistoryConfig['layout']): void {
    this.patchForm({ historyLayout: layout });
  }

  save(): void {
    const uid = this.selectedUserId();
    this.configService.saveForUser(uid, formToConfig(this.currentForm()));
    this.isOpen.set(false);
  }

  reset(): void {
    const uid = this.selectedUserId();
    this.configService.resetForUser(uid);
    this._formStates.update((states) => ({
      ...states,
      [uid]: configToForm(this.configService.getConfigForUser(uid)),
    }));
  }

  private msToHuman(ms: number): string {
    if (ms === 0) return '0s';
    const totalSec = ms / 1000;
    if (totalSec < 60) return `${totalSec}s`;
    const min = totalSec / 60;
    if (min < 60) return `${min.toFixed(1)} min`;
    return `${(min / 60).toFixed(1)} hr`;
  }
}
