import { render } from 'preact';
import { useEffect } from 'preact/hooks';
import { Suspense, lazy } from 'preact/compat';
import { useSignal } from '@preact/signals';
import styles from './styles.module.css';
import type { User } from '../shared/user-data';

const Ranker = lazy(() => import('./Ranker'));

function App() {
  const loading = useSignal(true);
  const user = useSignal<User | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await fetch('/api/user-data');
        const data = (await response.json()) as { userData: User | null };

        if (!data.userData) {
          return;
        }

        user.value = data.userData;
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        loading.value = false;
      }
    };

    loadUserData();
  }, []);

  const loadingResponse = <div className={styles.container}>Loading...</div>;

  if (loading.value) {
    return loadingResponse;
  }

  if (!user.value) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Interop Feature Ranking</h1>
        <div className={styles.authSection}>
          <p>Please log in to access the stack ranking tool.</p>
          <div className={styles.authButtons}>
            <a
              href="/auth/github"
              className={`${styles.button} ${styles.githubButton}`}
            >
              Sign in with GitHub
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={loadingResponse}>
      <Ranker user={user.value} />
    </Suspense>
  );
}

render(<App />, document.getElementById('app')!);
