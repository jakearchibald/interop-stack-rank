import type { FunctionalComponent } from 'preact';
import { lazyCompute } from '../../../lazyCompute';
import type { User } from '../../../../shared/user-data';
import { adminFetch } from '../../adminFetch';
import UserRanking from '../../../UserRanking';
import * as adminStyles from '../../Admin/styles.module.css';

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

  return (
    <UserRanking user={result.data.userData}>
      <p>
        <a href="../users/">← All users</a>
      </p>
    </UserRanking>
  );
};

export default UserView;
