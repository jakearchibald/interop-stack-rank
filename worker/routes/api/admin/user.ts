import { getSessionUser } from '../../../utils/session';
import { requireAdmin } from '../../../utils/auth';

const route: ExportedHandler<Env>['fetch'] = async (request, env) => {
  const user = await getSessionUser(request, env);

  requireAdmin(user);

  const idParam = new URL(request.url).searchParams.get('id');
  const githubId = Number(idParam);

  if (!idParam || !Number.isInteger(githubId)) {
    return Response.json({ error: 'Invalid id' }, { status: 400 });
  }

  const userDataStub = env.USER_DATA.getByName('global');
  const userData = await userDataStub.getUserById(githubId);

  if (!userData) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  return Response.json({ userData });
};

export default route;
