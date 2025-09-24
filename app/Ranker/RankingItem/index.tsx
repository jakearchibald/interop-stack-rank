import { type FunctionComponent } from 'preact';
import type { RankingItem as RankingItemType } from '../index';
import styles from '../styles.module.css';

interface Props {
  item: RankingItemType;
  index?: number;
  showUpButton?: boolean;
  showDownButton?: boolean;
  showRemoveButton?: boolean;
  showAddButton?: boolean;
  animId?: string | null;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove?: () => void;
  onAdd?: () => void;
  isRanked?: boolean;
}

const RankingItem: FunctionComponent<Props> = ({
  item,
  index,
  showUpButton = false,
  showDownButton = false,
  showRemoveButton = false,
  showAddButton = false,
  onMoveUp,
  onMoveDown,
  onRemove,
  onAdd,
  animId = null,
  isRanked = false,
}) => {
  return (
    <div class={styles.item} data-item-id={item.id} data-anim-id={animId}>
      <div class={styles.dragHandle}>⋮⋮</div>
      <span class={isRanked ? styles.rankedItemName : styles.itemName}>
        {isRanked && typeof index === 'number' ? `#${index + 1} ` : ''}
        <a
          href={`https://github.com/web-platform-tests/interop/issues/${item.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {item.title}
        </a>
      </span>
      {showUpButton && (
        <button
          class={`${styles.button} ${styles.upButton}`}
          onClick={onMoveUp}
        >
          ↑
        </button>
      )}
      {showDownButton && (
        <button
          class={`${styles.button} ${styles.downButton}`}
          onClick={onMoveDown}
        >
          ↓
        </button>
      )}
      {showRemoveButton && (
        <button
          class={`${styles.button} ${styles.removeButton}`}
          onClick={onRemove}
        >
          Remove
        </button>
      )}
      {showAddButton && (
        <button class={styles.addButton} onClick={onAdd}>
          Add to Ranking
        </button>
      )}
    </div>
  );
};

export default RankingItem;
