import { getSessionUser } from '../../utils/session';
import { endpointClosed, requireAdmin } from '../../utils/auth';

const route: ExportedHandler<Env>['fetch'] = async (request, env) => {
  endpointClosed();
  return;

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const user = await getSessionUser(request, env);

  if (!user) {
    return Response.json({ error: 'Not logged in' }, { status: 401 });
  }

  let githubId = user.githubId;

  const bodyData = await request.json().catch(() => null);

  if (
    !bodyData ||
    typeof bodyData !== 'object' ||
    !('ranking' in bodyData) ||
    !Array.isArray(bodyData.ranking)
  ) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const bodyNumbers = bodyData.ranking.map((id: unknown) => Number(id));

  if ('githubId' in bodyData) {
    // Only admins can save rankings for other users
    requireAdmin(user);

    if (typeof bodyData.githubId !== 'number') {
      return Response.json({ error: 'Invalid githubId' }, { status: 400 });
    }
    githubId = bodyData.githubId;
  }

  const userDataStub = env.USER_DATA.getByName('global');
  await userDataStub.saveRankings(githubId, bodyNumbers);

  return Response.json({});
};

export default route;
