import { type Signal, useSignal } from '@preact/signals';

/**
 * A signal that's kept up to date with `value`, such as for turning a prop into
 * a signal.
 */
export function useLiveSignal<T>(value: T): Signal<T> {
  const signal = useSignal(value);
  // Synchronously catch prop changes on every render
  signal.value = value;
  return signal;
}
