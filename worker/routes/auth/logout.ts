import { assertOrigin } from '../../utils/url';

const route: ExportedHandler<Env>['fetch'] = async (request, env, ctx) => {
  const url = new URL(request.url);
  const redirectPath = url.searchParams.get('redirect') || '/';
  const redirectUrl = new URL(redirectPath, url.origin).toString();

  assertOrigin(redirectUrl, url.origin);

  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectUrl,
      'Set-Cookie': 'session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
    },
  });
};

export default route;
