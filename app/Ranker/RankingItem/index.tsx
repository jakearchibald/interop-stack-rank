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
  isRanked = false,
}) => {
  return (
    <div class={styles.item} data-item-id={item.id}>
      <div class={styles.dragHandle}>⋮⋮</div>
      <span class={isRanked ? styles.rankedItemName : styles.itemName}>
        {isRanked && typeof index === 'number' ? `#${index + 1} ` : ''}
        {item.title}
      </span>
      {showUpButton && (
        <button
          disabled={index === 0}
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
