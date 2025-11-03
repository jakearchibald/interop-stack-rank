import { render, type FunctionalComponent } from 'preact';
import { lazy } from 'preact/compat';
import type { User } from '../shared/user-data';
import AppShell from './AppShell';
import Explainer from './Explainer';
import styles from './styles.module.css';
import { readOnly } from '../shared/config';

const Ranker = lazy(() => import('./Ranker'));

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
    <AppShell loggedInContent={(user) => <IndexContent user={user} />}>
      <div class={styles.explainerContainer}>
        <Explainer />
      </div>
    </AppShell>
  );
}

render(<App />, document.getElementById('app')!);
