import { Component, inject, signal, computed } from '@angular/core';
import { AppConfigService } from '../../../core/services/app-config.service';
import { AppConfig } from '../../../core/models/app-config.model';

@Component({
  selector: 'app-dev-panel',
  standalone: true,
  templateUrl: './dev-panel.component.html',
})
export class DevPanelComponent {
  private readonly configService = inject(AppConfigService);

  readonly isOpen = signal(false);

  // ─── Local form state (mirrors AppConfig structure) ───────────────────────
  readonly sessionTimeMs = signal(this.configService.config().auth.sessionTime);
  readonly triggerTimeMs = signal(this.configService.config().auth.timeBeforeExpiredTrigger);
  readonly triggerMessage = signal(this.configService.config().auth.triggerMessage);

  readonly sessionTimeHint = computed(() => this.msToHuman(this.sessionTimeMs()));
  readonly triggerTimeHint = computed(() => {
    const ms = this.triggerTimeMs();
    return ms === 0 ? 'disabled' : this.msToHuman(ms);
  });

  toggle(): void {
    if (!this.isOpen()) {
      // Re-sync from saved config when opening
      const cfg = this.configService.config();
      this.sessionTimeMs.set(cfg.auth.sessionTime);
      this.triggerTimeMs.set(cfg.auth.timeBeforeExpiredTrigger);
      this.triggerMessage.set(cfg.auth.triggerMessage);
    }
    this.isOpen.update((v) => !v);
  }

  onNumberInput(setter: (v: number) => void, event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const val = parseInt(raw, 10);
    setter(isNaN(val) ? 0 : Math.max(0, val));
  }

  onTextInput(event: Event): void {
    this.triggerMessage.set((event.target as HTMLInputElement).value);
  }

  save(): void {
    const config: AppConfig = {
      auth: {
        sessionTime: this.sessionTimeMs(),
        timeBeforeExpiredTrigger: this.triggerTimeMs(),
        triggerMessage: this.triggerMessage() || 'Session expiring soon.',
      },
    };
    this.configService.save(config);
    this.isOpen.set(false);
  }

  reset(): void {
    this.configService.reset();
    const cfg = this.configService.config();
    this.sessionTimeMs.set(cfg.auth.sessionTime);
    this.triggerTimeMs.set(cfg.auth.timeBeforeExpiredTrigger);
    this.triggerMessage.set(cfg.auth.triggerMessage);
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
