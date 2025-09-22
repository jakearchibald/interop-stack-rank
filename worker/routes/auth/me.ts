import { getSessionUser } from '../../utils/session';

const route: ExportedHandler<Env>['fetch'] = async (request, env, ctx) => {
  const user = await getSessionUser(request, env);
  return Response.json({ user });
};

export default route;
