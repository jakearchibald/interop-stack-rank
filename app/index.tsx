import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import styles from './styles.module.css';

interface RankingItem {
  id: string;
  name: string;
}

interface RankingState {
  ranked: RankingItem[];
  noOpinion: RankingItem[];
}

interface User {
  id: string;
  provider: 'github' | 'google';
  name: string;
  email: string;
  username?: string;
  picture?: string;
}

const initialItems: RankingItem[] = [
  { id: '1', name: 'one' },
  { id: '2', name: 'two' },
  { id: '3', name: 'three' },
  { id: '4', name: 'four' },
  { id: '5', name: 'five' },
];

function RankingApp() {
  const [state, setState] = useState<RankingState>({
    ranked: [],
    noOpinion: [...initialItems],
  });
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const authResponse = await fetch('/auth/me');
        const authData = await authResponse.json();
        setUser(authData.user);

        if (authData.user) {
          // Load user's existing rankings
          const rankingsResponse = await fetch('/api/rankings');
          const rankings = await rankingsResponse.json();

          if (Array.isArray(rankings)) {
            // Convert database rankings to UI state
            const rankedItems: RankingItem[] = [];
            const unrankedItems = [...initialItems];

            // Sort rankings by rank and build ranked list
            rankings
              .filter((r: any) => r.rank !== null)
              .sort((a: any, b: any) => a.rank - b.rank)
              .forEach((ranking: any) => {
                const item = initialItems.find((i) => i.id === ranking.item_id);
                if (item) {
                  rankedItems.push(item);
                  const index = unrankedItems.findIndex(
                    (i) => i.id === item.id
                  );
                  if (index !== -1) unrankedItems.splice(index, 1);
                }
              });

            setState({
              ranked: rankedItems,
              noOpinion: unrankedItems,
            });
          }
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const saveRankings = async (newState: RankingState) => {
    if (!user) return;

    const rankings = [
      // Ranked items with their positions
      ...newState.ranked.map((item, index) => ({
        item_id: item.id,
        rank: index + 1,
      })),
      // No opinion items (rank = null)
      ...newState.noOpinion.map((item) => ({
        item_id: item.id,
        rank: null as null,
      })),
    ];

    try {
      await fetch('/api/rankings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rankings }),
      });
    } catch (error) {
      console.error('Failed to save rankings:', error);
    }
  };

  const moveItem = (
    fromSection: 'ranked' | 'noOpinion',
    fromIndex: number,
    toSection: 'ranked' | 'noOpinion',
    toIndex?: number
  ) => {
    setState((prev) => {
      const newState = { ...prev };
      const item = newState[fromSection][fromIndex];

      newState[fromSection] = newState[fromSection].filter(
        (_, i) => i !== fromIndex
      );

      if (toIndex !== undefined) {
        newState[toSection].splice(toIndex, 0, item);
      } else {
        newState[toSection].push(item);
      }

      // Auto-save rankings after each change
      saveRankings(newState);

      return newState;
    });
  };

  const moveUp = (index: number) => {
    if (index > 0) {
      moveItem('ranked', index, 'ranked', index - 1);
    }
  };

  const moveDown = (index: number) => {
    if (index < state.ranked.length - 1) {
      moveItem('ranked', index, 'ranked', index + 1);
    }
  };

  const handleDragStart = (
    e: DragEvent,
    section: 'ranked' | 'noOpinion',
    index: number
  ) => {
    e.dataTransfer?.setData('text/plain', JSON.stringify({ section, index }));
  };

  const handleDrop = (
    e: DragEvent,
    toSection: 'ranked' | 'noOpinion',
    toIndex?: number
  ) => {
    e.preventDefault();
    const data = e.dataTransfer?.getData('text/plain');
    if (data) {
      const { section: fromSection, index: fromIndex } = JSON.parse(data);
      moveItem(fromSection, fromIndex, toSection, toIndex);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  if (loading) {
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
            <a
              href="/auth/google"
              className={`${styles.button} ${styles.googleButton}`}
            >
              Sign in with Google
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
        <div
          className={styles.dropZone}
          onDrop={(e) => handleDrop(e, 'ranked')}
          onDragOver={handleDragOver}
        >
          {state.ranked.length === 0 && (
            <p className={styles.emptyMessage}>Drag items here to rank them</p>
          )}
          {state.ranked.map((item, index) => (
            <div key={item.id} className={styles.item}>
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, 'ranked', index)}
                className={styles.dragHandle}
              >
                ⋮⋮
              </div>
              <span className={styles.rankedItemName}>
                #{index + 1} {item.name}
              </span>
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className={`${styles.button} ${styles.upButton}`}
              >
                ↑
              </button>
              <button
                onClick={() => moveDown(index)}
                disabled={index === state.ranked.length - 1}
                className={`${styles.button} ${styles.downButton}`}
              >
                ↓
              </button>
              <button
                onClick={() => moveItem('ranked', index, 'noOpinion')}
                className={`${styles.button} ${styles.removeButton}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>No Opinion</h2>
        <div
          className={styles.noOpinionZone}
          onDrop={(e) => handleDrop(e, 'noOpinion')}
          onDragOver={handleDragOver}
        >
          {state.noOpinion.length === 0 && (
            <p className={styles.emptyMessage}>All items are ranked</p>
          )}
          {state.noOpinion.map((item, index) => (
            <div key={item.id} className={styles.item}>
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, 'noOpinion', index)}
                className={styles.dragHandle}
              >
                ⋮⋮
              </div>
              <span className={styles.itemName}>{item.name}</span>
              <button
                onClick={() => moveItem('noOpinion', index, 'ranked')}
                className={styles.addButton}
              >
                Add to Ranking
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

render(<RankingApp />, document.getElementById('app')!);
