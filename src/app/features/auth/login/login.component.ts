import { Component, inject, signal, computed } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { DevPanelComponent } from '../../../shared/components/dev-panel/dev-panel.component';
import {
  createField,
  Validators,
  SignalField,
} from '../../../shared/utils/signal-form';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SpinnerComponent, DevPanelComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);

  readonly email = createField<string>('', [
    Validators.required('Email'),
    Validators.email(),
  ]);

  readonly password = createField<string>('', [
    Validators.required('Password'),
    Validators.minLength(6),
  ]);

  readonly showPassword = signal(false);
  readonly isLoading = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly copiedField = signal<'email' | 'password' | 'email2' | 'password2' | null>(null);

  fillCredentials(emailVal: string, passwordVal: string): void {
    this.email.set(emailVal);
    this.email.touch();
    this.password.set(passwordVal);
    this.password.touch();
    this.serverError.set(null);
  }

  copyToClipboard(value: string, field: 'email' | 'password' | 'email2' | 'password2'): void {
    navigator.clipboard.writeText(value).then(() => {
      this.copiedField.set(field);
      setTimeout(() => this.copiedField.set(null), 2000);
    });
  }

  readonly isFormValid = computed(
    () =>
      this.email.value().trim() !== '' &&
      this.password.value().trim() !== '' &&
      this.email.error() === null &&
      this.password.error() === null
  );

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onInput(field: SignalField<string>, event: Event): void {
    field.set((event.target as HTMLInputElement).value);
    field.touch();
    this.serverError.set(null);
  }

  onBlur(field: SignalField<string>): void {
    field.touch();
  }

  submit(): void {
    this.email.touch();
    this.password.touch();

    if (!this.isFormValid()) return;

    this.isLoading.set(true);
    this.serverError.set(null);

    this.auth
      .login({
        email: this.email.value(),
        password: this.password.value(),
      })
      .subscribe({
        next: () => this.isLoading.set(false),
        error: (err: { message?: string }) => {
          this.isLoading.set(false);
          this.serverError.set(
            err.message ?? 'Something went wrong. Please try again.'
          );
        },
      });
  }
}
