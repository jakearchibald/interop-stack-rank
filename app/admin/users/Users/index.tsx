import type { FunctionalComponent } from 'preact';
import { lazyCompute } from '../../../lazyCompute';
import type { UserSummary } from '../../../../shared/user-data';
import { adminFetch, sizedAvatar } from '../../adminFetch';
import * as adminStyles from '../../Admin/styles.module.css';
import * as styles from './styles.module.css';
import * as utilStyles from '../../../utils.module.css';

const usersData = lazyCompute(() =>
  adminFetch<UserSummary[]>('/api/admin/users')
);

const Users: FunctionalComponent = () => {
  const result = usersData.value;

  if ('error' in result) {
    return (
      <div class={adminStyles.container}>
        <p>Error loading users: {result.error}</p>
      </div>
    );
  }

  const users = result.data;

  return (
    <div class={adminStyles.container}>
      <h2>Users</h2>
      <p>
        {users.length} users, {users.filter((u) => u.rankedCount > 0).length}{' '}
        with rankings.
      </p>
      <table class={styles.usersTable}>
        <thead>
          <tr>
            <th>
              <span class={utilStyles.srOnly}>Avatar</span>
            </th>
            <th>Name</th>
            <th class={styles.numeric}>Ranked</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.githubId}>
              <td>
                <img
                  class={styles.avatar}
                  src={sizedAvatar(user.avatarSrc, 64)}
                  alt=""
                  width={32}
                  height={32}
                  loading="lazy"
                />
              </td>
              <td>
                <a href={`../user/?id=${user.githubId}`}>{user.displayName}</a>{' '}
                <span class={styles.username}>({user.githubUsername})</span>
              </td>
              <td class={styles.numeric}>{user.rankedCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
