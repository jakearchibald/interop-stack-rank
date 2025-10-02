import type { FunctionalComponent } from 'preact';
import styles from './styles.module.css';

const Explainer: FunctionalComponent = () => {
  return (
    <div class={styles.explainer}>
      <p>
        For{' '}
        <a href="https://github.com/web-platform-tests/interop/tree/main/2026">
          Interop 2026
        </a>
        , we wanted to try a new way to gather feedback on which proposals
        matter most to developers.
      </p>

      <p>
        This site lets you rank the proposals you care about, giving us
        important data when it comes to deciding which proposals to make part of
        Interop 2026.
      </p>

      <p>
        <strong>Please only rank proposals you feel positively about.</strong>{' '}
        If there are features you don't know or even feel negatively about,
        leave them unranked.
      </p>
    </div>
  );
};

export default Explainer;
