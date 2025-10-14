import { render, type FunctionalComponent } from 'preact';
import type { User } from '../../shared/user-data';
import AppShell from '../AppShell';

const ResultsPage: FunctionalComponent<{ user: User }> = ({ user }) => {
  return <p>Results page</p>;
};

function App() {
  return <AppShell loggedInContent={(user) => <ResultsPage user={user} />} />;
}

render(<App />, document.getElementById('app')!);
