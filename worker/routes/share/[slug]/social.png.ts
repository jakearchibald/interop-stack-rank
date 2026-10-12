import { getSharedUser } from '../../../share/lookup';

const route: ExportedHandler<Env>['fetch'] = async (request, env, ctx) => {
  const user = await getSharedUser(request, env);
  if (user instanceof Response) return user;

  // Lazy-loaded, as it's big.
  const { socialImageResponse } = await import('../../../share/socialImage');

  return socialImageResponse(request, user, {
    cacheControl: 'public, max-age=31536000, immutable',
    ctx,
  });
};

export default route;
