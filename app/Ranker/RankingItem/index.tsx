import { type FunctionComponent } from 'preact';
import type { RankingItem as RankingItemType } from '../index';
import * as styles from './styles.module.css';
import * as utilStyles from '../../utils.module.css';
import * as parentStyles from '../styles.module.css';
import * as rootStyles from '../../styles.module.css';
import { classes } from '../../utils/classes';
import arrowSVG from '../../icons/arrow.svg?raw';
import handleSVG from '../../icons/handle.svg?raw';
import addSVG from '../../icons/add.svg?raw';
import closeSVG from '../../icons/close.svg?raw';

interface Props {
  item: RankingItemType;
  showUpButton?: boolean;
  showDownButton?: boolean;
  showAddButton?: boolean;
  showRemoveButton?: boolean;
  showDragHandle?: boolean;
  /**
   * Reserve space for three buttons, even if fewer are shown. Used for the
   * dragged item, so it matches the item it was dragged from.
   */
  reserveThreeButtonSpace?: boolean;
  /**
   * Reserve space for the rank number, without showing it. Used for the
   * dragged item, so it matches the ranked item it was dragged from.
   */
  reserveRankSpace?: boolean;
  animId?: string | null;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onAdd?: () => void;
  onRemove?: () => void;
}

const RankingItem: FunctionComponent<Props> = ({
  item,
  showUpButton = false,
  showDownButton = false,
  showAddButton = false,
  showRemoveButton = false,
  showDragHandle = false,
  reserveThreeButtonSpace = false,
  reserveRankSpace = false,
  onMoveUp,
  onMoveDown,
  onAdd,
  onRemove,
  animId = null,
}) => {
  const buttonCount = [
    showUpButton,
    showDownButton,
    showAddButton,
    showRemoveButton,
  ].filter(Boolean).length;

  return (
    <div
      class={classes({
        [parentStyles.item]: true,
        [parentStyles.threeButtons]:
          reserveThreeButtonSpace || buttonCount >= 3,
        [parentStyles.reserveRankSpace]: reserveRankSpace,
      })}
      data-item-id={item.id}
      data-anim-id={animId}
    >
      {showDragHandle ? (
        <div
          class={styles.dragHandle}
          dangerouslySetInnerHTML={{ __html: handleSVG }}
        />
      ) : (
        <div />
      )}
      <div class={styles.itemName}>
        <a
          href={`https://github.com/web-platform-tests/interop/issues/${item.id}`}
          target="_blank"
          rel="noopener noreferrer"
          dangerouslySetInnerHTML={{ __html: item.titleHTML }}
        />
        {item.subtitleHTML && (
          <p
            class={styles.subtitle}
            dangerouslySetInnerHTML={{ __html: item.subtitleHTML }}
          />
        )}
      </div>
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
        {showRemoveButton && (
          <button
            class={`${rootStyles.button} ${styles.removeButton}`}
            onClick={onRemove}
          >
            <span class={utilStyles.srOnly}>Remove from ranking</span>
            <span dangerouslySetInnerHTML={{ __html: closeSVG }} />
          </button>
        )}
      </div>
    </div>
  );
};

export default RankingItem;
