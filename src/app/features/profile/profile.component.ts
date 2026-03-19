import { Component, inject, signal, computed } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import {
  createField,
  Validators,
  SignalField,
} from '../../shared/utils/signal-form';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [SpinnerComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  private readonly auth = inject(AuthService);

  readonly user = this.auth.user;

  readonly isEditing = signal(false);
  readonly isSaving = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly saveSuccess = signal(false);

  readonly editForm = {
    firstName: createField<string>('', [Validators.required('First name')]),
    lastName: createField<string>('', [Validators.required('Last name')]),
    jobTitle: createField<string>(''),
    location: createField<string>(''),
    bio: createField<string>(''),
  };

  readonly hasFormErrors = computed(
    () =>
      this.editForm.firstName.error() !== null ||
      this.editForm.lastName.error() !== null
  );

  readonly initials = computed(() => {
    const u = this.user();
    if (!u) return '';
    return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
  });

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  toggleEdit(): void {
    if (!this.isEditing()) {
      const u = this.user();
      if (u) {
        this.editForm.firstName.set(u.firstName);
        this.editForm.lastName.set(u.lastName);
        this.editForm.jobTitle.set(u.jobTitle);
        this.editForm.location.set(u.location);
        this.editForm.bio.set(u.bio);
      }
    } else {
      Object.values(this.editForm).forEach((f) => f.reset());
      this.saveError.set(null);
    }
    this.isEditing.update((v) => !v);
  }

  onFieldInput(field: SignalField<string>, event: Event): void {
    field.set(
      (event.target as HTMLInputElement | HTMLTextAreaElement).value
    );
    field.touch();
    this.saveError.set(null);
  }

  onFieldBlur(field: SignalField<string>): void {
    field.touch();
  }

  saveProfile(): void {
    Object.values(this.editForm).forEach((f) => f.touch());
    if (this.hasFormErrors()) return;

    const updates: Partial<User> = {
      firstName: this.editForm.firstName.value(),
      lastName: this.editForm.lastName.value(),
      jobTitle: this.editForm.jobTitle.value(),
      location: this.editForm.location.value(),
      bio: this.editForm.bio.value(),
    };

    this.isSaving.set(true);
    this.saveError.set(null);

    this.auth.updateUser(updates).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isEditing.set(false);
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 3500);
      },
      error: (err: { message?: string }) => {
        this.isSaving.set(false);
        this.saveError.set(err.message ?? 'Failed to save changes. Please try again.');
      },
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
