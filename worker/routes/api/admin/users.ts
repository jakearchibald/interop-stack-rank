import { getSessionUser } from '../../../utils/session';
import { requireAdmin } from '../../../utils/auth';

const route: ExportedHandler<Env>['fetch'] = async (request, env) => {
  const user = await getSessionUser(request, env);

  requireAdmin(user);

  const userDataStub = env.USER_DATA.getByName('global');
  const users = await userDataStub.getUserSummaries();

  return Response.json(users);
};

export default route;
