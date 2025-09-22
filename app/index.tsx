import { render } from 'preact';
import { useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import styles from './styles.module.css';
import allItems from './data.json';
import type { User } from '../shared/user-data';

const itemsById = new Map<number, RankingItem>();
for (const item of allItems) itemsById.set(item.id, item);

interface RankingItem {
  id: number;
  title: string;
}

type SimpleUser = Omit<User, 'rankings'>;

function RankingApp() {
  const loading = useSignal(true);
  const user = useSignal<SimpleUser | null>(null);
  const rankedItems = useSignal<RankingItem[]>([]);
  const unrankedItems = useSignal<RankingItem[]>([]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await fetch('/api/user-data');
        const data = (await response.json()) as { userData: User | null };

        if (!data.userData) {
          return;
        }

        const { rankings, ...simpleUserData } = data.userData;

        const newRankedItems = rankings
          .map((id) => itemsById.get(id))
          .filter((item): item is RankingItem => item !== undefined);

        const rankingIdsSet = new Set(rankings);

        const newUnrankedItems = allItems.filter(
          (item) => !rankingIdsSet.has(item.id)
        );

        user.value = simpleUserData;
        rankedItems.value = newRankedItems;
        unrankedItems.value = newUnrankedItems;
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        loading.value = false;
      }
    };

    loadUserData();
  }, []);

  if (loading.value) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Stack Ranking</h1>
        <div className={styles.authSection}>
          <p>Please log in to access the stack ranking tool.</p>
          <div className={styles.authButtons}>
            <a
              href="/auth/github"
              className={`${styles.button} ${styles.githubButton}`}
            >
              Sign in with GitHub
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Stack Ranking</h1>
        <div className={styles.userInfo}>
          <span>Welcome, {user.name}!</span>
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
              >
                ↑
              </button>
              <button
                disabled={index === rankedItems.value.length - 1}
                className={`${styles.button} ${styles.downButton}`}
              >
                ↓
              </button>
              <button className={`${styles.button} ${styles.removeButton}`}>
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
              <button className={styles.addButton}>Add to Ranking</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

render(<RankingApp />, document.getElementById('app')!);
