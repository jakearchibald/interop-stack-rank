import { render } from 'preact';
import AppShell from '../AppShell';
import Results from './Results';

function App() {
  return <AppShell><Results /></AppShell>;
}

render(<App />, document.getElementById('app')!);
