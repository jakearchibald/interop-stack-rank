import type { FunctionalComponent } from 'preact';
import sharedStyles from '../styles.module.css';
import styles from './styles.module.css';
import githubLogo from './imgs/github.svg';

const GithubLoginButton: FunctionalComponent = ({ children }) => {
  return (
    <a
      href="/auth/github"
      class={`${sharedStyles.button} ${styles.githubButton}`}
    >
      <img src={githubLogo} alt="GitHub Logo" class={styles.icon} />
      {children}
    </a>
  );
};

export default GithubLoginButton;
