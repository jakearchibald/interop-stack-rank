import type { FunctionalComponent } from 'preact';
import { lazyCompute } from '../../../lazyCompute';
import type { User } from '../../../../shared/user-data';
import { adminFetch, sizedAvatar } from '../../adminFetch';
import { itemsById } from '../../../Ranker/useRankingSignals';
import RankingItem from '../../../Ranker/RankingItem';
import * as rankerStyles from '../../../Ranker/styles.module.css';
import * as adminStyles from '../../Admin/styles.module.css';
import * as styles from './styles.module.css';

const userData = lazyCompute(() => {
  const id = new URL(location.href).searchParams.get('id') ?? '';
  return adminFetch<{ userData: User }>(
    `/api/admin/user?id=${encodeURIComponent(id)}`
  );
});

const UserView: FunctionalComponent = () => {
  const result = userData.value;

  if ('error' in result) {
    return (
      <div class={adminStyles.container}>
        <p>Error loading user: {result.error}</p>
      </div>
    );
  }

  const user = result.data.userData;
  const rankedItems = user.rankings
    .map((id) => itemsById.get(id))
    .filter((item) => item !== undefined);

  return (
    <>
      <div class={adminStyles.container}>
        <p>
          <a href="../users/">← All users</a>
        </p>
        <div class={styles.userHeader}>
          <img
            class={styles.avatar}
            src={sizedAvatar(user.avatarSrc, 128)}
            alt=""
            width={64}
            height={64}
          />
          <div>
            <h2>{user.displayName}</h2>
            <a
              href={`https://github.com/${encodeURIComponent(user.githubUsername)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/{user.githubUsername}
            </a>
          </div>
        </div>
      </div>
      <div class={rankerStyles.rankingContainer}>
        <h2 class={rankerStyles.sectionTitle}>
          <span>
            Ranked proposals{' '}
            <span class={`${rankerStyles.nowrap} ${rankerStyles.subtle}`}>
              (top = most important)
            </span>
          </span>
        </h2>
        {rankedItems.length === 0 ? (
          <p class={rankerStyles.emptyMessage}>Nothing ranked.</p>
        ) : (
          <ol
            class={`${rankerStyles.rankList} ${rankerStyles.rankedList} ${styles.readOnlyList}`}
          >
            {rankedItems.map((item) => (
              <li key={item.id}>
                <RankingItem item={item} />
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
};

export default UserView;
