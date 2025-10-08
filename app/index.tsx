import { render, type FunctionalComponent } from 'preact';
import { Suspense, lazy, useMemo } from 'preact/compat';
import styles from './styles.module.css';
import type { User } from '../shared/user-data';
import { lazyCompute } from './lazyCompute';
import SiteShell from './SiteShell';
import GithubLoginButton from './GithubLoginButton';
import Toasts from './Toasts';
import { pushToastMessage } from './Toasts/useToastData';

const Ranker = lazy(() => import('./Ranker'));
const userDataPromise = (async () => {
  const response = await fetch('/api/user-data');
  const data = (await response.json()) as { userData: User | null };
  return data.userData;
})();

const user = lazyCompute(() => userDataPromise);

pushToastMessage({ type: 'loading', until: userDataPromise });

const AppInner: FunctionalComponent = () => {
  if (!user.value) {
    return (
      <SiteShell
        userDetails={
          <GithubLoginButton size="small">Sign in</GithubLoginButton>
        }
      >
        <div class={styles.mainLoginButton}>
          <GithubLoginButton>Sign in with GitHub</GithubLoginButton>
        </div>
      </SiteShell>
    );
  }

  const onUnauthenticated = () => {
    // A bit blunt, but it'll do for now.
    location.reload();
  };

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
            data-id={user.value.githubId}
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
      <Ranker user={user.value} onUnauthenticated={onUnauthenticated} />
    </SiteShell>
  );
};

function App() {
  return (
    <>
      <Suspense fallback={<SiteShell />}>
        <AppInner />
      </Suspense>
      <Toasts />
    </>
  );
}

render(<App />, document.getElementById('app')!);
