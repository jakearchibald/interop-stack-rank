import { GitHub, generateState } from 'arctic';

const route: ExportedHandler<Env>['fetch'] = async (request, env, ctx) => {
  const github = new GitHub(
    env.GITHUB_CLIENT_ID,
    env.GITHUB_CLIENT_SECRET,
    null
  );

  const state = generateState();
  const url = await github.createAuthorizationURL(state, []);

  // Store state for validation in callback
  const response = new Response('', {
    status: 302,
    headers: {
      location: url.toString(),
      'Set-Cookie': `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
    },
  });

  return response;
};

export default route;
