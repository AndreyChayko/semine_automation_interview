import { signal, computed, Signal } from '@angular/core';

export type Validator<T> = (value: T) => string | null;

export interface SignalField<T> {
  readonly value: Signal<T>;
  readonly error: Signal<string | null>;
  readonly touched: Signal<boolean>;
  set: (value: T) => void;
  touch: () => void;
  reset: () => void;
}

export function createField<T>(
  initial: T,
  validators: Validator<T>[] = []
): SignalField<T> {
  const _value = signal<T>(initial);
  const _touched = signal(false);

  const error = computed<string | null>(() => {
    if (!_touched()) return null;
    for (const validator of validators) {
      const err = validator(_value());
      if (err) return err;
    }
    return null;
  });

  return {
    value: _value.asReadonly(),
    error,
    touched: _touched.asReadonly(),
    set: (v: T) => _value.set(v),
    touch: () => _touched.set(true),
    reset: () => {
      _value.set(initial);
      _touched.set(false);
    },
  };
}

export const Validators = {
  required:
    (label = 'This field') =>
    (v: string): string | null =>
      v.trim() === '' ? `${label} is required` : null,

  email:
    () =>
    (v: string): string | null =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        ? null
        : 'Enter a valid email address',

  minLength:
    (min: number) =>
    (v: string): string | null =>
      v.length < min ? `Must be at least ${min} characters` : null,
};
