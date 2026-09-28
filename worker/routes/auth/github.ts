import {
  createAuthorizationURL,
  generateState,
} from '../../utils/github-oauth';
import { assertOrigin } from '../../utils/url';

const route: ExportedHandler<Env>['fetch'] = async (request, env) => {
  const state = generateState();
  const url = createAuthorizationURL(
    env.GITHUB_CLIENT_ID,
    state,
    import.meta.env.PROD
      ? 'https://interop-rank.jakearchibald.com/auth/github/callback'
      : null
  );

  // Get redirect parameter from query string
  const requestUrl = new URL(request.url);
  const redirectPath = requestUrl.searchParams.get('redirect') || '/';

  assertOrigin(redirectPath, requestUrl.origin);

  // Store state and redirect path for validation in callback
  const responseHeaders = new Headers();
  responseHeaders.append('Location', url.toString());
  responseHeaders.append(
    'Set-Cookie',
    `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`
  );
  responseHeaders.append(
    'Set-Cookie',
    `oauth_redirect=${encodeURIComponent(
      redirectPath
    )}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`
  );

  const response = new Response('', {
    status: 302,
    headers: responseHeaders,
  });

  return response;
};

export default route;
