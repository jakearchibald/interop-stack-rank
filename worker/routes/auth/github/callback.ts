import { GitHub } from 'arctic';
import { parse } from 'cookie';
import { createSession, createSessionResponse } from '../../../utils/session';

interface GitHubUser {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
}

const route: ExportedHandler<Env>['fetch'] = async (request, env) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  // Get stored state and redirect path from cookies
  const cookies = parse(request.headers.get('Cookie') || '');
  const storedState = cookies.oauth_state;
  const redirectPath = cookies.oauth_redirect || '/';

  if (!code) {
    console.error('Invalid OAuth callback - missing code', {
      code,
      state,
      storedState,
    });
    return new Response('Invalid OAuth callback - missing code', {
      status: 400,
    });
  }

  if (!state) {
    console.error('Invalid OAuth callback - missing state', {
      code,
      state,
      storedState,
    });
    return new Response('Invalid OAuth callback - missing state', {
      status: 400,
    });
  }

  if (state !== storedState) {
    console.error('Invalid OAuth callback - state & stored state mismatch', {
      code,
      state,
      storedState,
    });
    return new Response(
      'Invalid OAuth callback - state & stored state mismatch',
      { status: 400 }
    );
  }

  const github = new GitHub(
    env.GITHUB_CLIENT_ID,
    env.GITHUB_CLIENT_SECRET,
    null
  );

  try {
    const tokens = await github.validateAuthorizationCode(code);

    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`,
        'User-Agent': 'interop-stack-rank',
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const user = (await userResponse.json()) as GitHubUser;
    const userDataStub = env.USER_DATA.getByName('global');

    const [sessionId] = await Promise.all([
      createSession({ githubId: user.id }, env),
      userDataStub.saveUser({
        githubId: user.id,
        displayName: user.name || user.login,
        githubUsername: user.login,
        avatarSrc: user.avatar_url,
      }),
    ]);

    const redirectUrl = new URL(redirectPath, url.origin).toString();
    return createSessionResponse(sessionId, redirectUrl);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return new Response('Authentication failed', { status: 500 });
  }
};

export default route;
