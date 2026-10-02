import { render } from 'preact';
import { Suspense } from 'preact/compat';
import AppShell from '../../AppShell';
import Users from './Users';
import '../../styles.module.css';
import * as styles from '../Admin/styles.module.css';

function App() {
  return (
    <AppShell
      loggedInContent={() => (
        <Suspense fallback={<p class={styles.container}>Loading…</p>}>
          <Users />
        </Suspense>
      )}
    />
  );
}

render(<App />, document.getElementById('app')!);
