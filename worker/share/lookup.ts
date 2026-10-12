import {
  parseShareSlug,
  sharePath,
  type PublicUser,
} from '../../shared/share';

/**
 * Finds the user for a `/share/[slug]/…` URL.
 *
 * Users are found by the share ID alone, so links keep working if the user
 * changes their GitHub username. In that case, this returns a redirect to the
 * URL with the current username.
 */
export async function getSharedUser(
  request: Request,
  env: Env
): Promise<PublicUser | Response> {
  const url = new URL(request.url);
  const [, , slug] = url.pathname.split('/');
  const parsed = parseShareSlug(slug);
  const notFound = new Response('Not found', { status: 404 });

  if (!parsed) return notFound;

  const user = await env.USER_DATA.getByName('global').getUserByShareId(
    parsed.shareId
  );

  if (!user) return notFound;

  if (user.githubUsername !== parsed.githubUsername) {
    const currentPrefix = sharePath(user.githubUsername, parsed.shareId);
    const rest = url.pathname.split('/').slice(3).join('/');
    return Response.redirect(new URL(currentPrefix + rest + url.search, url));
  }

  return user;
}
