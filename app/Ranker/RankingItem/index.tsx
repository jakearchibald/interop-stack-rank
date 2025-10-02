import { type FunctionComponent } from 'preact';
import type { RankingItem as RankingItemType } from '../index';
import styles from './styles.module.css';
import parentStyles from '../styles.module.css';
import rootStyles from '../../styles.module.css';

const handle = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -10 74.84 86.33"><path d="M5.13 23.06A10.14 10.14 0 0 0-5 33.2a10.12 10.12 0 0 0 20.2 0A10.1 10.1 0 0 0 5.13 23.07m27.29-.01A10.14 10.14 0 0 0 22.29 33.2a10.13 10.13 0 0 0 20.25 0c0-5.58-4.54-10.13-10.12-10.13m27.29-.01A10.13 10.13 0 0 0 49.63 33.2a10.11 10.11 0 0 0 20.21 0c0-5.58-4.55-10.13-10.13-10.13M5.13 56.12A10.14 10.14 0 0 0-5 66.25a10.12 10.12 0 0 0 20.2 0A10.1 10.1 0 0 0 5.13 56.12m27.29 0a10.14 10.14 0 0 0-10.13 10.13 10.13 10.13 0 0 0 20.25 0c0-5.58-4.54-10.13-10.12-10.13m27.29 0a10.13 10.13 0 0 0-10.08 10.13 10.11 10.11 0 0 0 20.21 0c0-5.58-4.55-10.13-10.13-10.13M5.13-10A10.13 10.13 0 0 0-5 .08C-5 5.66-.46 10.21 5.13 10.21a10.11 10.11 0 0 0 0-20.2M32.42-10A10.13 10.13 0 0 0 22.29.08a10.14 10.14 0 0 0 20.25 0C42.54-5.46 38-10 32.42-10m27.29 0A10.1 10.1 0 0 0 49.63.08c0 5.58 4.54 10.13 10.08 10.13 5.58 0 10.13-4.55 10.13-10.13C69.84-5.46 65.29-10 59.7-10"/></svg>`;

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
        dangerouslySetInnerHTML={{ __html: handle }}
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
            ↑
          </button>
        )}
        {showDownButton && (
          <button
            class={`${rootStyles.button} ${styles.downButton}`}
            onClick={onMoveDown}
          >
            ↓
          </button>
        )}
        {showAddButton && (
          <button class={styles.addButton} onClick={onAdd}>
            Add to Ranking
          </button>
        )}
      </div>
    </div>
  );
};

export default RankingItem;
