import { type FunctionComponent } from 'preact';
import { useEffect, useMemo, useRef } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import styles from './styles.module.css';
import allItems from '../data.json';
import type { User } from '../../shared/user-data';

const itemsById = new Map<number, RankingItem>();
for (const item of allItems) itemsById.set(item.id, item);

function swapIndexes(arr: unknown[], indexA: number, indexB: number) {
  [arr[indexA], arr[indexB]] = [arr[indexB], arr[indexA]];
}

interface RankingItem {
  id: number;
  title: string;
}

type SimpleUser = Pick<
  User,
  'githubId' | 'displayName' | 'githubUsername' | 'avatarSrc'
>;

interface Props {
  user: User;
}

const Ranker: FunctionComponent<Props> = ({ user }) => {
  const simpleUser = useMemo<SimpleUser>(() => {
    const { rankings, ...simpleUserData } = user;
    return simpleUserData;
  }, [user]);

  const initialRankedItems = useMemo<RankingItem[]>(() => {
    let rankingIds: number[] | null = null;

    const lsUnsaved = localStorage.getItem('unsavedRanking');

    if (lsUnsaved) {
      try {
        rankingIds = JSON.parse(lsUnsaved);
      } catch {
        // Ignore JSON parse errors
      }
    }

    if (!rankingIds) {
      rankingIds = user.rankings;
    }

    return rankingIds
      .map((id) => itemsById.get(id))
      .filter((item): item is RankingItem => item !== undefined);
  }, [user.rankings]);

  const initialUnrankedItems = useMemo<RankingItem[]>(() => {
    const rankingIdsSet = new Set(user.rankings);
    return allItems.filter((item) => !rankingIdsSet.has(item.id));
  }, [user.rankings]);

  const rankedItems = useSignal<RankingItem[]>(initialRankedItems);
  const unrankedItems = useSignal<RankingItem[]>(initialUnrankedItems);

  const addToRanking = (item: RankingItem) => {
    rankedItems.value = [...rankedItems.value, item];
    unrankedItems.value = unrankedItems.value.filter((i) => i.id !== item.id);
    postRankings();
  };

  const removeFromRanking = (item: RankingItem) => {
    rankedItems.value = rankedItems.value.filter((i) => i.id !== item.id);
    unrankedItems.value = [...unrankedItems.value, item];
    postRankings();
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newRankedItems = [...rankedItems.value];
    swapIndexes(newRankedItems, index, index - 1);
    rankedItems.value = newRankedItems;
    postRankings();
  };

  const moveDown = (index: number) => {
    if (index === rankedItems.value.length - 1) return;
    const newRankedItems = [...rankedItems.value];
    swapIndexes(newRankedItems, index, index + 1);
    rankedItems.value = newRankedItems;
    postRankings();
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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Stack Ranking</h1>
        <div className={styles.userInfo}>
          <span>Welcome, {simpleUser.displayName}!</span>
          <a
            href="/auth/logout"
            className={`${styles.button} ${styles.logoutButton}`}
          >
            Logout
          </a>
        </div>
      </header>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Ranked Items (Top = Most Important)
        </h2>
        <div className={styles.dropZone}>
          {rankedItems.value.length === 0 && (
            <p className={styles.emptyMessage}>Drag items here to rank them</p>
          )}
          {rankedItems.value.map((item, index) => (
            <div key={item.id} className={styles.item}>
              <div draggable className={styles.dragHandle}>
                ⋮⋮
              </div>
              <span className={styles.rankedItemName}>
                #{index + 1} {item.title}
              </span>
              <button
                disabled={index === 0}
                className={`${styles.button} ${styles.upButton}`}
                onClick={() => moveUp(index)}
              >
                ↑
              </button>
              <button
                disabled={index === rankedItems.value.length - 1}
                className={`${styles.button} ${styles.downButton}`}
                onClick={() => moveDown(index)}
              >
                ↓
              </button>
              <button
                className={`${styles.button} ${styles.removeButton}`}
                onClick={() => removeFromRanking(item)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>No Opinion</h2>
        <div className={styles.noOpinionZone}>
          {unrankedItems.value.length === 0 && (
            <p className={styles.emptyMessage}>All items are ranked</p>
          )}
          {unrankedItems.value.map((item) => (
            <div key={item.id} className={styles.item}>
              <div className={styles.dragHandle}>⋮⋮</div>
              <span className={styles.itemName}>{item.title}</span>
              <button
                className={styles.addButton}
                onClick={() => addToRanking(item)}
              >
                Add to Ranking
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Ranker;
