import { render, type FunctionalComponent } from 'preact';
import { Suspense, lazy, useMemo } from 'preact/compat';
import styles from './styles.module.css';
import type { User } from '../shared/user-data';
import { lazyCompute } from './lazyCompute';
import SiteShell from './SiteShell';
import GithubLoginButton from './GithubLoginButton';

const Ranker = lazy(() => import('./Ranker'));

const user = lazyCompute(async () => {
  const response = await fetch('/api/user-data');
  const data = (await response.json()) as { userData: User | null };
  return data.userData;
});

const AppInner: FunctionalComponent = () => {
  if (!user.value) {
    return (
      <SiteShell userDetails={<GithubLoginButton>Sign in</GithubLoginButton>}>
        <div class={styles.mainLoginButton}>
          <GithubLoginButton>Sign in with GitHub</GithubLoginButton>
        </div>
      </SiteShell>
    );
  }

  const userAvatar = useMemo(() => {
    const url = new URL(user.value!.avatarSrc);
    url.searchParams.set('s', '80');
    return url.toString();
  }, [user.value!.avatarSrc]);

  return (
    <SiteShell
      userDetails={
        <div class={styles.userInfo}>
          <img
            class={styles.avatar}
            src={userAvatar}
            alt={user.value.displayName}
          />
          <a
            href="/auth/logout"
            class={`${styles.button} ${styles.logoutButton}`}
          >
            Logout
          </a>
        </div>
      }
    >
      <Ranker user={user.value} />
    </SiteShell>
  );
};

function App() {
  return (
    <Suspense
      fallback={
        <SiteShell>
          <div class={styles.loadingMessage}>
            <p>Loading…</p>
          </div>
        </SiteShell>
      }
    >
      <AppInner />
    </Suspense>
  );
}

render(<App />, document.getElementById('app')!);
