import { render } from 'preact';
import { useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import styles from './styles.module.css';
import type { User } from '../shared/user-data';
import Ranker from './Ranker';

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

  if (loading.value) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (!user.value) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Stack Ranking</h1>
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

  return <Ranker user={user.value} />;
}

render(<App />, document.getElementById('app')!);
