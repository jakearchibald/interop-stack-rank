import type { FunctionalComponent } from 'preact';
import styles from './styles.module.css';
import content from './content.md';

const Explainer: FunctionalComponent = () => {
  return (
    <div
      class={styles.explainer}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default Explainer;
