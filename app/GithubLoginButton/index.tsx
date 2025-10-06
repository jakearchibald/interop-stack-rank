import type { FunctionalComponent } from 'preact';
import sharedStyles from '../styles.module.css';
import styles from './styles.module.css';
import githubLogo from '../icons/github.svg?raw';
import { classes } from '../utils/classes';

interface Props {
  size?: 'small' | 'large';
}

const GithubLoginButton: FunctionalComponent<Props> = ({ children, size }) => {
  return (
    <a
      href="/auth/github"
      class={classes({
        [sharedStyles.button]: true,
        [styles.githubButton]: true,
        [styles.small]: size === 'small',
      })}
    >
      <span
        class={styles.icon}
        dangerouslySetInnerHTML={{ __html: githubLogo }}
      />
      {children}
    </a>
  );
};

export default GithubLoginButton;
