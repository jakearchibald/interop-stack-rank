import { GitHub, generateState } from 'arctic';

const route: ExportedHandler<Env>['fetch'] = async (request, env, ctx) => {
  const github = new GitHub(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET, null);
  
  const state = generateState();
  const url = await github.createAuthorizationURL(state, ['user:email']);
  
  // Store state for validation in callback
  const response = Response.redirect(url.toString());
  response.headers.set('Set-Cookie', `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  
  return response;
};

export default route;