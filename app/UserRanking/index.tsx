import type { ComponentChildren, FunctionalComponent } from 'preact';
import type { PublicUser } from '../../shared/share';
import { sizedAvatar } from '../../shared/avatar';
import { itemsById } from '../Ranker/items';
import RankingItem from '../Ranker/RankingItem';
import * as rankerStyles from '../Ranker/styles.module.css';
import { classes } from '../utils/classes';
import * as styles from './styles.module.css';

interface Props {
  user: PublicUser;
  /** Shown after the list. */
  footer?: ComponentChildren;
  /**
   * 'shared' centers the user's details and leaves out their GitHub link, for
   * publicly shared rankings.
   */
  variant?: 'default' | 'shared';
}

/**
 * A read-only view of a user's ranking. Children are shown above the user's
 * details.
 *
 * This is also rendered on the server, for shared rankings, so it must not use
 * browser APIs.
 */
const UserRanking: FunctionalComponent<Props> = ({
  user,
  footer,
  variant = 'default',
  children,
}) => {
  const rankedItems = user.rankings
    .map((id) => itemsById.get(id))
    .filter((item) => item !== undefined);

  return (
    <>
      <div class={styles.container}>
        {children}
        <div
          class={classes({
            [styles.userHeader]: true,
            [styles.centered]: variant === 'shared',
          })}
        >
          <img
            class={styles.avatar}
            src={sizedAvatar(user.avatarSrc, 128)}
            alt=""
            width={64}
            height={64}
          />
          <div>
            <h2>{user.displayName}</h2>
            {variant === 'default' && (
              <a
                href={`https://github.com/${encodeURIComponent(user.githubUsername)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/{user.githubUsername}
              </a>
            )}
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
        {footer && <div class={styles.footer}>{footer}</div>}
      </div>
    </>
  );
};

export default UserRanking;
