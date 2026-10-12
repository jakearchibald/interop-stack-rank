import { getSessionUser, requireAuth } from '../../../utils/session';

/** The social image for the logged-in user, for the share page. */
const route: ExportedHandler<Env>['fetch'] = async (request, env) => {
  const sessionUser = await getSessionUser(request, env);
  requireAuth(sessionUser);

  const user = await env.USER_DATA.getByName('global').getUserById(
    sessionUser.githubId
  );

  if (!user) return new Response('Not found', { status: 404 });

  // Lazy-loaded, as it's big.
  const { socialImageResponse } = await import('../../../share/socialImage');

  return socialImageResponse(request, user, {
    // The URL is the same for all users, so it mustn't be shared.
    cacheControl: 'private, max-age=31536000, immutable',
  });
};

export default route;
