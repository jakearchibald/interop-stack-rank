import { getSessionUser } from '../../utils/session';

const route: ExportedHandler<Env>['fetch'] = async (request, env) => {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const user = await getSessionUser(request, env);

  if (!user) {
    return Response.json({ error: 'Not logged in' }, { status: 401 });
  }

  const bodyData = await request.json().catch(() => null);

  if (!bodyData || !Array.isArray(bodyData)) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const bodyNumbers = bodyData.map((id: unknown) => Number(id));

  const userDataStub = env.USER_DATA.getByName('global');
  await userDataStub.saveRankings(user.githubId, bodyNumbers);

  return Response.json({});
};

export default route;
