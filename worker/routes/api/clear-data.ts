import {
  clearAllSessions,
  getSessionUser,
  requireAdmin,
} from '../../utils/session';

const route: ExportedHandler<Env>['fetch'] = async (request, env) => {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const bodyText = await request.text();

  if (!bodyText) {
    return Response.json({ error: 'Missing request body' }, { status: 400 });
  }

  const decodedBody = new URLSearchParams(bodyText);

  if (decodedBody.get('confirm') !== 'true') {
    return Response.json(
      { error: 'Confirmation not provided' },
      { status: 400 }
    );
  }

  const user = await getSessionUser(request, env);

  requireAdmin(user);

  const userDataStub = env.USER_DATA.getByName('global');

  await Promise.all([userDataStub.clearAllData(), clearAllSessions(env)]);

  return Response.json({ success: true });
};

export default route;
