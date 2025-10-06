import { type FunctionComponent } from 'preact';
import type { RankingItem as RankingItemType } from '../index';
import styles from './styles.module.css';
import utilStyles from '../../utils.module.css';
import parentStyles from '../styles.module.css';
import rootStyles from '../../styles.module.css';
import arrowSVG from '../../icons/arrow.svg?raw';
import handleSVG from '../../icons/handle.svg?raw';
import addSVG from '../../icons/add.svg?raw';

interface Props {
  item: RankingItemType;
  showUpButton?: boolean;
  showDownButton?: boolean;
  showAddButton?: boolean;
  animId?: string | null;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onAdd?: () => void;
}

const RankingItem: FunctionComponent<Props> = ({
  item,
  showUpButton = false,
  showDownButton = false,
  showAddButton = false,
  onMoveUp,
  onMoveDown,
  onAdd,
  animId = null,
}) => {
  return (
    <div class={parentStyles.item} data-item-id={item.id} data-anim-id={animId}>
      <div
        class={styles.dragHandle}
        dangerouslySetInnerHTML={{ __html: handleSVG }}
      ></div>
      <span class={styles.itemName}>
        <a
          href={`https://github.com/web-platform-tests/interop/issues/${item.id}`}
          target="_blank"
          rel="noopener noreferrer"
          dangerouslySetInnerHTML={{ __html: item.titleHTML }}
        />
      </span>
      <div class={styles.buttons}>
        {showUpButton && (
          <button
            class={`${rootStyles.button} ${styles.upButton}`}
            onClick={onMoveUp}
          >
            <span class={utilStyles.srOnly}>Up</span>
            <span dangerouslySetInnerHTML={{ __html: arrowSVG }} />
          </button>
        )}
        {showDownButton && (
          <button
            class={`${rootStyles.button} ${styles.downButton}`}
            onClick={onMoveDown}
          >
            <span class={utilStyles.srOnly}>Down</span>
            <span dangerouslySetInnerHTML={{ __html: arrowSVG }} />
          </button>
        )}
        {showAddButton && (
          <button
            class={`${rootStyles.button} ${styles.addButton}`}
            onClick={onAdd}
          >
            <span class={utilStyles.srOnly}>Add to ranking</span>
            <span dangerouslySetInnerHTML={{ __html: addSVG }} />
          </button>
        )}
      </div>
    </div>
  );
};

export default RankingItem;
