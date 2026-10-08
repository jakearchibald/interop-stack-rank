import { type FunctionComponent } from 'preact';
import { useMemo } from 'preact/hooks';
import * as styles from '../styles.module.css';
import * as localStyles from './styles.module.css';
import RankingItem from '../RankingItem';
import { getStableUnrankedOrder } from '../useRankingSignals';
import { getLoginURL } from '../../GithubLoginButton';

/** All items, in a stable random order, for users who aren't logged in. */
const ReadOnlyItems: FunctionComponent = () => {
  const items = useMemo(() => getStableUnrankedOrder(), []);

  return (
    <div class={styles.rankingContainer}>
      <h2 class={styles.sectionTitle}>Proposals</h2>
      <p class={localStyles.signInNote}>
        <a href={getLoginURL()}>Sign in with GitHub</a> to rank these.
      </p>
      <ol class={styles.rankList}>
        {items.map((item) => (
          <li key={item.id}>
            <RankingItem item={item} />
          </li>
        ))}
      </ol>
    </div>
  );
};

export default ReadOnlyItems;
