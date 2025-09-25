import { render, type FunctionalComponent } from 'preact';
import { Suspense, lazy } from 'preact/compat';
import styles from './styles.module.css';
import type { User } from '../shared/user-data';
import { lazyCompute } from './lazyCompute';

const Ranker = lazy(() => import('./Ranker'));

const user = lazyCompute(async () => {
  const response = await fetch('/api/user-data');
  const data = (await response.json()) as { userData: User | null };
  return data.userData;
});

const AppInner: FunctionalComponent = () => {
  if (!user.value) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Interop Feature Ranking</h1>
        <div className={styles.authSection}>
          <p>Please log in to access the ranking tool.</p>
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
};

function App() {
  return (
    <Suspense fallback={<div className={styles.container}>Loading...</div>}>
      <AppInner />
    </Suspense>
  );
}

render(<App />, document.getElementById('app')!);
