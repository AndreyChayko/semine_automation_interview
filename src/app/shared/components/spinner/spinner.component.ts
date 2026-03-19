import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <span class="inline-flex items-center gap-2">
      <span
        class="rounded-full border-2 border-t-transparent animate-spin inline-block"
        [class]="spinnerClass()"
      ></span>
      @if (label()) {
        <span class="text-sm text-gray-500">{{ label() }}</span>
      }
    </span>
  `,
})
export class SpinnerComponent {
  size = input<'xs' | 'sm' | 'md' | 'lg'>('md');
  label = input<string>('');
  color = input<string>('border-indigo-600');

  spinnerClass = computed(() => {
    const sizes: Record<string, string> = {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-10 w-10',
    };
    return `${sizes[this.size()]} ${this.color()}`;
  });
}
