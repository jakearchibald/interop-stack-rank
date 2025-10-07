import type { FunctionalComponent } from 'preact';
import styles from './styles.module.css';
import { useToastData } from './useToastData';
import { classes } from '../utils/classes';
import { useSignal, useSignalEffect } from '@preact/signals';
import { useRef } from 'preact/hooks';

const Toasts: FunctionalComponent = () => {
  const { toast, showing } = useToastData();
  const displaying = useSignal(showing.peek());
  const undisplayTimeoutRef = useRef<number | null>(null);

  useSignalEffect(() => {
    if (undisplayTimeoutRef.current) clearTimeout(undisplayTimeoutRef.current);

    if (showing.value) {
      displaying.value = true;
    } else if (displaying.peek()) {
      // wait for the CSS transition to finish before removing the element from the DOM
      undisplayTimeoutRef.current = setTimeout(() => {
        displaying.value = false;
      }, 300);
    }
  });

  return (
    <div class={styles.toasts}>
      {toast.value && displaying.value && (
        <div
          class={classes({
            [styles.toast]: true,
            [styles.show]: showing.value,
          })}
          inert={!showing.value}
          role="alert"
          aria-live="polite"
        >
          {toast.value}
        </div>
      )}
    </div>
  );
};

export default Toasts;
