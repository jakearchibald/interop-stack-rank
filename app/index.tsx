import { render, type FunctionalComponent } from 'preact';
import { Suspense, lazy } from 'preact/compat';
import styles from './styles.module.css';
import type { User } from '../shared/user-data';
import { useLazy } from './useLazy';

const Ranker = lazy(() => import('./Ranker'));

interface AppInnerProps {
  userReader: { read: () => User | null };
}

const AppInner: FunctionalComponent<AppInnerProps> = ({ userReader }) => {
  const user = userReader.read();

  if (!user) {
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

  return <Ranker user={user} />;
};

function App() {
  const userReader = useLazy(async () => {
    const response = await fetch('/api/user-data');
    const data = (await response.json()) as { userData: User | null };
    return data.userData;
  });

  return (
    <Suspense fallback={<div className={styles.container}>Loading...</div>}>
      <AppInner userReader={userReader} />
    </Suspense>
  );
}

render(<App />, document.getElementById('app')!);
