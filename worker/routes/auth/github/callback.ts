import { GitHub } from 'arctic';
import { parse } from 'cookie';

interface GitHubUser {
  id: number;
  login: string;
  email: string;
  name: string;
}

interface GithubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

const route: ExportedHandler<Env>['fetch'] = async (request, env, ctx) => {
  const url = new URL(request.url);
  console.log('Got request url:', url.toString());
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  // Get stored state from cookie
  const cookies = parse(request.headers.get('Cookie') || '');
  const storedState = cookies.oauth_state;

  if (!code || !state || state !== storedState) {
    return new Response('Invalid OAuth callback', { status: 400 });
  }

  const github = new GitHub(
    env.GITHUB_CLIENT_ID,
    env.GITHUB_CLIENT_SECRET,
    null
  );

  try {
    const tokens = await github.validateAuthorizationCode(code);

    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`,
        'User-Agent': 'interop-stack-rank',
      },
    });

    if (!emailResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const emails = (await emailResponse.json()) as GithubEmail[];
    const primaryEmail = emails.find((e) => e.primary);

    if (!primaryEmail) {
      return new Response('No primary email found in GitHub account', {
        status: 400,
      });
    }

    const email = primaryEmail.email;

    // Store user in database using email as primary key
    const rankingStorageId = env.RANKING_STORAGE.idFromName('global');
    const rankingStorage = env.RANKING_STORAGE.get(rankingStorageId);

    const dbUserResponse = await rankingStorage.fetch(
      new Request('https://dummy/users', {
        method: 'POST',
        body: JSON.stringify({
          email: email,
          provider: 'github',
        }),
      })
    );

    const dbUser = await dbUserResponse.json();

    // Generate secure session ID and store in KV
    const sessionId = crypto.randomUUID();
    const sessionData = JSON.stringify({ email });

    await env.SESSIONS.put(sessionId, sessionData, {
      expirationTtl: 86400 // 24 hours
    });

    const response = Response.redirect(url.origin);
    response.headers.set(
      'Set-Cookie',
      `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`
    );
    response.headers.set(
      'Set-Cookie',
      `oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
    );

    return response;
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return new Response('Authentication failed', { status: 500 });
  }
};

export default route;
