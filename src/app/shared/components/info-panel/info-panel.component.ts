import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-info-panel',
  standalone: true,
  templateUrl: './info-panel.component.html',
})
export class InfoPanelComponent {
  readonly isOpen = signal(false);

  open(): void  { this.isOpen.set(true);  }
  close(): void { this.isOpen.set(false); }
  toggle(): void { this.isOpen.update((v) => !v); }
}
