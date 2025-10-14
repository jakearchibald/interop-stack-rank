import { render } from 'preact';
import AppShell from '../AppShell';
import Results from './Results';

function App() {
  return <AppShell loggedInContent={() => <Results />} />;
}

render(<App />, document.getElementById('app')!);
