import { render, type FunctionalComponent } from 'preact';
import { lazy, Suspense } from 'preact/compat';
import type { User } from '../shared/user-data';
import AppShell from './AppShell';
import Explainer from './Explainer';
import * as styles from './styles.module.css';
import { readOnly } from '../shared/config';

const Ranker = lazy(() => import('./Ranker'));
const ReadOnlyItems = lazy(() => import('./Ranker/ReadOnlyItems'));

const IndexContent: FunctionalComponent<{ user: User }> = ({ user }) => {
  const onUnauthenticated = () => {
    // A bit blunt, but it'll do for now.
    location.reload();
  };

  return (
    <Ranker
      readOnly={readOnly}
      user={user}
      onUnauthenticated={onUnauthenticated}
    />
  );
};

function App() {
  return (
    <AppShell
      loggedInContent={(user) => <IndexContent user={user} />}
      loggedOutContent={
        // Own boundary, so loading this doesn't suspend the whole shell.
        <Suspense fallback={null}>
          <ReadOnlyItems />
        </Suspense>
      }
    >
      <div class={styles.explainerContainer}>
        <Explainer />
      </div>
    </AppShell>
  );
}

render(<App />, document.getElementById('app')!);
