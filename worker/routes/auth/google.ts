import { Google, generateState } from 'arctic';

const route: ExportedHandler<Env>['fetch'] = async (request, env, ctx) => {
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/auth/google/callback`;
  
  const google = new Google(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, redirectUri);
  
  const state = generateState();
  const authUrl = await google.createAuthorizationURL(state, ['openid', 'profile', 'email']);
  
  // Store state for validation in callback
  const response = Response.redirect(authUrl.toString());
  response.headers.set('Set-Cookie', `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  
  return response;
};

export default route;