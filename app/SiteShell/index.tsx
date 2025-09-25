import type { ComponentChildren, FunctionalComponent } from 'preact';
import styles from './styles.module.css';

interface Props {
  userDetails?: ComponentChildren;
}

const SiteShell: FunctionalComponent<Props> = ({ children, userDetails }) => {
  return (
    <>
      <div class={styles.siteHeader}>
        <h1 class={styles.title}>Interop Feature Ranking</h1>
        <div>{userDetails}</div>
      </div>
      <div class={styles.container}>{children}</div>
    </>
  );
};

export default SiteShell;
