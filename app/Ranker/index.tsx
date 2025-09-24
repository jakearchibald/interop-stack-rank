import { type FunctionComponent } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import PointerTracker from '../utils/PointerTracker';

import styles from './styles.module.css';
import type { User } from '../../shared/user-data';
import { itemsById, useRankingSignals } from './useRankingSignals';
import { useSignal } from '@preact/signals';
import RankingItem from './RankingItem';
import { classes } from '../utils/classes';

function doFlip(container: HTMLElement) {
  // Get current item positions
  const initialStyles: Record<
    string,
    { x: number; y: number; opacity: string; zIndex: string }
  > = {};

  for (const el of container.querySelectorAll('[data-anim-id]')) {
    if (!(el instanceof HTMLElement)) continue;
    const animId = el.dataset.animId;
    if (!animId) continue;
    const rect = el.getBoundingClientRect();
    initialStyles[animId] = {
      x: rect.x,
      y: rect.y,
      opacity: getComputedStyle(el).opacity,
      zIndex: getComputedStyle(el).zIndex,
    };
  }

  requestAnimationFrame(() => {
    for (const el of container.querySelectorAll('[data-anim-id]')) {
      if (!(el instanceof HTMLElement)) continue;
      const animId = el.dataset.animId;
      if (!animId) continue;
      const rect = el.getBoundingClientRect();
      const initial = initialStyles[animId];
      if (!initial) continue;

      // Optimise by skipping anims that are completely offscreen
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const startAndEndOutOfView = [initial, rect].every(
        (pos) =>
          pos.x < -el.offsetWidth ||
          pos.y < -el.offsetHeight ||
          pos.x > viewportWidth ||
          pos.y > viewportHeight
      );

      if (startAndEndOutOfView) continue;

      const deltaX = initial.x - rect.x;
      const deltaY = initial.y - rect.y;

      el.animate(
        {
          offset: 0,
          transform: `translate(${deltaX}px, ${deltaY}px)`,
          opacity: initial.opacity,
        },
        { duration: 250, easing: 'ease' }
      );

      el.animate(
        {
          offset: 0,
          zIndex: initial.zIndex,
        },
        { duration: 250, easing: 'step-end' }
      );
    }
  });
}

export interface RankingItem {
  id: number;
  title: string;
}

interface Props {
  user: User;
}

const Ranker: FunctionComponent<Props> = ({ user }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { rankedItems, unrankedItems } = useRankingSignals(user);

  const insertBeforeId = (
    item: RankingItem,
    targetList: 'ranked' | 'unranked',
    beforeId: number | null
  ) => {
    const destinationList =
      targetList === 'ranked' ? rankedItems : unrankedItems;

    // Remove from lists
    rankedItems.value = rankedItems.value.filter((i) => i.id !== item.id);
    unrankedItems.value = unrankedItems.value.filter((i) => i.id !== item.id);

    // Determine the index to insert at in the destination list
    const insertIndex =
      beforeId !== null
        ? destinationList.value.findIndex((i) => i.id === beforeId)
        : destinationList.value.length;

    // Insert into destination list at the correct position
    if (insertIndex === -1) {
      destinationList.value = [...destinationList.value, item];
    } else {
      destinationList.value = [
        ...destinationList.value.slice(0, insertIndex),
        item,
        ...destinationList.value.slice(insertIndex),
      ];
    }

    postRankings();
    doFlip(containerRef.current!);
  };

  const fetchControllerRef = useRef<AbortController | null>(null);

  const postRankings = async () => {
    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }
    const controller = new AbortController();
    fetchControllerRef.current = controller;

    const rankingBody = JSON.stringify(
      rankedItems.value.map((item) => item.id)
    );
    localStorage.setItem('unsavedRanking', rankingBody);

    try {
      const response = await fetch('/api/save-ranking', {
        method: 'POST',
        body: rankingBody,
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });

      if (response.ok) {
        localStorage.removeItem('unsavedRanking');
      } else {
        console.error('Failed to save rankings:', response.statusText);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Fetch was aborted, likely due to a new request being made
        return;
      }
      console.error('Error saving rankings:', error);
    } finally {
      if (fetchControllerRef.current === controller) {
        fetchControllerRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (localStorage.getItem('unsavedRanking')) {
      postRankings();
    }
  }, []);

  const initialDraggingPositionRef = useRef<{ x: number; y: number } | null>(
    null
  );
  const draggingItem = useSignal<RankingItem | null>(null);
  const draggingItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let activeDropZone: HTMLElement | null = null;

    const pointerTracker = new PointerTracker(containerRef.current, {
      start(pointerEvent) {
        if (pointerTracker.currentPointers.length > 0) return false;
        if (!(pointerEvent.target instanceof HTMLElement)) return false;

        const handle = pointerEvent.target.closest(`.${styles.dragHandle}`);
        if (handle === null) return false;

        const item = handle.closest(`[data-item-id]`);
        if (!(item instanceof HTMLElement)) return false;

        const itemId = Number(item.dataset.itemId);
        const itemData = itemsById.get(itemId);
        if (!itemData) return false;

        draggingItem.value = itemData;

        const itemRect = item.getBoundingClientRect();
        initialDraggingPositionRef.current = { x: itemRect.x, y: itemRect.y };

        queueMicrotask(() => {
          if (!draggingItemRef.current) return;
          draggingItemRef.current.style.width = `${itemRect.width}px`;
          draggingItemRef.current.style.transform = `translate(${itemRect.x}px, ${itemRect.y}px)`;
        });

        return handle !== null;
      },
      move() {
        const startPointer = pointerTracker.startPointers[0];
        const currentPointer = pointerTracker.currentPointers[0];
        if (!draggingItemRef.current || !initialDraggingPositionRef.current) {
          return;
        }

        const deltaY = currentPointer.clientY - startPointer.clientY;
        const { x, y } = initialDraggingPositionRef.current;

        draggingItemRef.current.style.transform = `translate(${x}px, ${
          y + deltaY
        }px)`;

        const element = document.elementFromPoint(
          currentPointer.clientX,
          currentPointer.clientY
        );

        if (element !== activeDropZone) {
          if (activeDropZone) {
            activeDropZone.classList.remove(styles.activeDropZone);
          }
          if (
            element === null ||
            !(element instanceof HTMLElement) ||
            !element.classList.contains(styles.dropTarget)
          ) {
            activeDropZone = null;
            return;
          }
          activeDropZone = element as HTMLElement;
          activeDropZone.classList.add(styles.activeDropZone);
        }
      },
      end(pointerEvent) {
        const draggedItem = draggingItem.value!;
        draggingItem.value = null;

        if (activeDropZone) {
          activeDropZone.classList.remove(styles.activeDropZone);
          activeDropZone = null;
        }

        const element = document.elementFromPoint(
          pointerEvent.clientX,
          pointerEvent.clientY
        );

        if (
          element === null ||
          !(element instanceof HTMLElement) ||
          !element.classList.contains(styles.dropTarget)
        ) {
          doFlip(containerRef.current!);
          return;
        }

        const targetList = element.dataset.targetList as 'ranked' | 'unranked';

        const beforeId = Number(element.dataset.targetBeforeId) || null;
        insertBeforeId(draggedItem, targetList, beforeId);
      },
    });
    return () => {
      pointerTracker.stop();
    };
  }, []);

  return (
    <div class={styles.container} ref={containerRef}>
      <header class={styles.header}>
        <h1 class={styles.title}>Stack Ranking</h1>
        <div class={styles.userInfo}>
          <span>Welcome, {user.displayName}!</span>
          <a
            href="/auth/logout"
            class={`${styles.button} ${styles.logoutButton}`}
          >
            Logout
          </a>
        </div>
      </header>

      <div class={styles.section}>
        <h2 class={styles.sectionTitle}>Ranked Items (Top = Most Important)</h2>
        <div class={styles.dropZone}>
          {rankedItems.value.length === 0 ? (
            <p class={styles.emptyMessage}>Drag items here to rank them</p>
          ) : (
            <ol class={styles.rankList}>
              {rankedItems.value.map((item, index, arr) => (
                <>
                  {draggingItem.value &&
                    index === 0 &&
                    item.id !== draggingItem.value.id && (
                      <li
                        class={styles.dropTarget}
                        key={`drop-target-before-${item.id}`}
                        data-target-list="ranked"
                        data-target-before-id={item.id}
                      />
                    )}
                  <li
                    key={item.id}
                    class={classes({
                      [styles.beingDragged]: draggingItem.value?.id === item.id,
                    })}
                  >
                    <RankingItem
                      item={item}
                      index={index}
                      isRanked={true}
                      showUpButton={true}
                      showDownButton={true}
                      showRemoveButton={true}
                      animId={
                        draggingItem.value?.id === item.id
                          ? null
                          : `item-${item.id}`
                      }
                      onMoveUp={() =>
                        insertBeforeId(item, 'ranked', arr[index - 1]?.id)
                      }
                      onMoveDown={() =>
                        insertBeforeId(
                          item,
                          'ranked',
                          arr[index + 2]?.id ?? null
                        )
                      }
                      onRemove={() =>
                        insertBeforeId(
                          item,
                          'unranked',
                          unrankedItems.value[0]?.id ?? null
                        )
                      }
                    />
                  </li>
                  {draggingItem.value &&
                    item.id !== draggingItem.value.id &&
                    draggingItem.value.id !== arr[index + 1]?.id && (
                      <li
                        class={styles.dropTarget}
                        key={`drop-target-after-${item.id}`}
                        data-target-list="ranked"
                        data-target-before-id={arr[index + 1]?.id ?? ''}
                      />
                    )}
                </>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div class={styles.section}>
        <h2 class={styles.sectionTitle} data-anim-id="unranked-heading">
          No Opinion
        </h2>
        <div class={styles.noOpinionZone}>
          {unrankedItems.value.length === 0 ? (
            <p class={styles.emptyMessage}>All items are ranked</p>
          ) : (
            <ol class={styles.rankList}>
              {unrankedItems.value.map((item, index, arr) => (
                <>
                  {draggingItem.value &&
                    index === 0 &&
                    item.id !== draggingItem.value.id && (
                      <li
                        class={styles.dropTarget}
                        key={`drop-target-before-${item.id}`}
                        data-target-list="unranked"
                        data-target-before-id={item.id}
                      />
                    )}
                  <li
                    key={item.id}
                    class={classes({
                      [styles.beingDragged]: draggingItem.value?.id === item.id,
                    })}
                  >
                    <RankingItem
                      item={item}
                      showAddButton={true}
                      onAdd={() => insertBeforeId(item, 'ranked', null)}
                      animId={
                        draggingItem.value?.id === item.id
                          ? null
                          : `item-${item.id}`
                      }
                    />
                  </li>
                  {draggingItem.value &&
                    item.id !== draggingItem.value.id &&
                    draggingItem.value.id !== arr[index + 1]?.id && (
                      <li
                        class={styles.dropTarget}
                        key={`drop-target-after-${item.id}`}
                        data-target-list="unranked"
                        data-target-before-id={arr[index + 1]?.id ?? ''}
                      />
                    )}
                </>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div class={styles.draggingItemContainer} ref={draggingItemRef}>
        {draggingItem.value && (
          <RankingItem
            item={draggingItem.value}
            animId={`item-${draggingItem.value.id}`}
          />
        )}
      </div>
    </div>
  );
};

export default Ranker;
