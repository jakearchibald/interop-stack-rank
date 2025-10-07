import type { ComponentChildren, FunctionalComponent } from 'preact';
import styles from './styles.module.css';
import Explainer from './Explainer';
import githubLogo from '../icons/github.svg?raw';

interface Props {
  userDetails?: ComponentChildren;
}

const SiteShell: FunctionalComponent<Props> = ({ children, userDetails }) => {
  return (
    <>
      <div class={styles.siteHeader}>
        <h1>Interop Feature Ranking</h1>
        <div>{userDetails}</div>
      </div>
      <div>
        <div class={styles.container}>
          <Explainer />
        </div>
        {children}
      </div>
      <div class={styles.siteFooter}>
        <p>
          Made with ❤️ by the{' '}
          <a href="https://www.firefox.com/" target="_blank">
            Firefox
          </a>{' '}
          team
        </p>
        <p>
          <a
            href="https://github.com/jakearchibald/interop-stack-rank"
            target="_blank"
            class={styles.githubLink}
          >
            {' '}
            <span dangerouslySetInnerHTML={{ __html: githubLogo }} />
            View source
          </a>
        </p>
      </div>
    </>
  );
};

export default SiteShell;
