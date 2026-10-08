import type { FunctionalComponent } from 'preact';
import * as sharedStyles from '../styles.module.css';
import * as styles from './styles.module.css';
import githubLogo from '../icons/github.svg?raw';
import { classes } from '../utils/classes';

interface Props {
  size?: 'small' | 'large';
}

/** URL that signs in via GitHub, then returns to the current page. */
export function getLoginURL(): string {
  const currentPath = location.pathname + location.search;
  return `/auth/github?redirect=${encodeURIComponent(currentPath)}`;
}

const GithubLoginButton: FunctionalComponent<Props> = ({ children, size }) => {
  return (
    <a
      href={getLoginURL()}
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
