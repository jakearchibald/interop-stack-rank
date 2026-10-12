import { getSessionUser, requireAuth } from '../../../utils/session';
import { sharePath } from '../../../../shared/share';

/**
 * The logged-in user's shared ranking URL.
 *
 * - GET: Returns the path, or null if the user hasn't shared.
 * - POST: Creates the URL if needed, and returns the path.
 * - DELETE: Revokes the URL, breaking existing links.
 */
const route: ExportedHandler<Env>['fetch'] = async (request, env) => {
  const sessionUser = await getSessionUser(request, env);
  requireAuth(sessionUser);

  const userData = env.USER_DATA.getByName('global');
  const { githubId } = sessionUser;

  if (request.method === 'DELETE') {
    await userData.revokeShareId(githubId);
    return Response.json({ path: null });
  }

  if (request.method !== 'GET' && request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const [user, shareId] = await Promise.all([
    userData.getUserById(githubId),
    request.method === 'POST'
      ? userData.createShareId(githubId)
      : userData.getShareId(githubId),
  ]);

  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  return Response.json({
    path: shareId ? sharePath(user.githubUsername, shareId) : null,
  });
};

export default route;
