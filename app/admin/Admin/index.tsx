import type { FunctionalComponent } from 'preact';
import { useSignal } from '@preact/signals';
import * as styles from './styles.module.css';
import * as globalStyles from '../../styles.module.css';

const clearDataConfirmText = 'clear data';

const Admin: FunctionalComponent = () => {
  const busy = useSignal(false);

  const clearData = async () => {
    const answer = prompt(
      `This will delete all rankings and log out all users. This cannot be undone.\n\nType "${clearDataConfirmText}" to confirm.`
    );

    if (answer?.trim().toLowerCase() !== clearDataConfirmText) return;

    busy.value = true;

    try {
      const response = await fetch('/api/clear-data', {
        method: 'POST',
        body: new URLSearchParams({ confirm: 'true' }),
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${await response.text()}`);
      }

      alert('All data cleared.');
      // All sessions have been cleared, including this one.
      location.reload();
    } catch (error) {
      alert(`Failed to clear data: ${(error as Error).message}`);
    } finally {
      busy.value = false;
    }
  };

  return (
    <div class={styles.container}>
      <h2>Admin</h2>
      <ul class={styles.actions}>
        <li>
          <button
            class={`${globalStyles.button} ${styles.dangerButton}`}
            disabled={busy.value}
            onClick={clearData}
          >
            Clear data
          </button>
          <p>Deletes all users & rankings, and logs everyone out.</p>
        </li>
      </ul>
    </div>
  );
};

export default Admin;
