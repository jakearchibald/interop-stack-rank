import { render } from 'preact';
import AppShell from '../AppShell';
import Admin from './Admin';
import '../styles.module.css';

function App() {
  return <AppShell loggedInContent={() => <Admin />} />;
}

render(<App />, document.getElementById('app')!);
