import { getSessionUser } from '../../utils/session';

const route: ExportedHandler<Env>['fetch'] = async (request, env, ctx) => {
  const userDataStub = env.USER_DATA.getByName('global');

  const user = await getSessionUser(request, env);

  if (!user) {
    return Response.json({ userData: null });
  }

  const userData = await userDataStub.getUserById(user.githubId);
  return Response.json({ userData });
};

export default route;
