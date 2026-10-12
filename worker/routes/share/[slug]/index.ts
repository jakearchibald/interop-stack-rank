import { getSharedUser } from '../../../share/lookup';
import { renderSharePage } from '../../../share/page';

const route: ExportedHandler<Env>['fetch'] = async (request, env) => {
  const user = await getSharedUser(request, env);
  if (user instanceof Response) return user;
  return renderSharePage(request, env, user);
};

export default route;
