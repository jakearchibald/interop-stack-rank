import { type ComponentChildren, type FunctionalComponent } from 'preact';
import { Suspense, useMemo } from 'preact/compat';
import styles from '../styles.module.css';
import type { User } from '../../shared/user-data';
import { lazyCompute } from '../lazyCompute';
import SiteShell from './SiteShell';
import GithubLoginButton from '../GithubLoginButton';
import Toasts from '../Toasts';
import { pushToastMessage } from '../Toasts/useToastData';

const userDataPromise = (async () => {
  const response = await fetch('/api/user-data');
  const data = (await response.json()) as { userData: User | null };
  return data.userData;
})();

const user = lazyCompute(() => userDataPromise);

pushToastMessage({ type: 'loading', until: userDataPromise });

interface AppInnerProps {
  loggedInContent?: (user: User) => ComponentChildren;
}

const AppInner: FunctionalComponent<AppInnerProps> = ({
  loggedInContent,
  children,
}) => {
  if (!user.value) {
    return (
      <SiteShell
        userDetails={
          <GithubLoginButton size="small">Sign in</GithubLoginButton>
        }
      >
        {children}
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

  const resolvedContent = loggedInContent ? loggedInContent(user.value!) : null;

  const currentPath = location.pathname + location.search;
  const logoutURL = new URL('/auth/logout', location.origin);
  logoutURL.searchParams.set('redirect', currentPath);

  return (
    <SiteShell
      userDetails={
        <div class={styles.userInfo}>
          <img
            class={styles.avatar}
            src={userAvatar}
            alt={`${user.value.displayName} (${user.value.githubUsername})`}
            data-id={user.value.githubId}
          />
          <a
            href={logoutURL.toString()}
            class={`${styles.button} ${styles.logoutButton}`}
          >
            Logout
          </a>
        </div>
      }
    >
      {children}
      {resolvedContent}
    </SiteShell>
  );
};

interface AppShellProps {
  loggedInContent?: (user: User) => ComponentChildren;
}

const AppShell: FunctionalComponent<AppShellProps> = ({
  loggedInContent,
  children,
}) => {
  return (
    <>
      <Suspense fallback={<SiteShell>{children}</SiteShell>}>
        <AppInner loggedInContent={loggedInContent}>{children}</AppInner>
      </Suspense>
      <Toasts />
    </>
  );
};

export default AppShell;
