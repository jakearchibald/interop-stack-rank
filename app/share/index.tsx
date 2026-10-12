import { render } from 'preact';
import AppShell from '../AppShell';
import Share from './Share';

function App() {
  return <AppShell loggedInContent={(user) => <Share user={user} />} />;
}

render(<App />, document.getElementById('app')!);
