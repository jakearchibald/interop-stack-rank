import { GitHub } from 'arctic';

interface GitHubUser {
  id: number;
  login: string;
  email: string;
  name: string;
}

const route: ExportedHandler<Env>['fetch'] = async (request, env, ctx) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  
  // Get stored state from cookie
  const cookies = request.headers.get('Cookie') || '';
  const storedState = cookies.split(';')
    .find(cookie => cookie.trim().startsWith('oauth_state='))
    ?.split('=')[1];
  
  if (!code || !state || state !== storedState) {
    return new Response('Invalid OAuth callback', { status: 400 });
  }
  
  const github = new GitHub(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET, null);
  
  try {
    const tokens = await github.validateAuthorizationCode(code);
    
    // Fetch user info from GitHub
    const githubUserResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'User-Agent': 'interop-stack-rank'
      }
    });
    
    if (!githubUserResponse.ok) {
      throw new Error('Failed to fetch user info');
    }
    
    const userData: GitHubUser = await githubUserResponse.json();
    
    // Fetch user email if not public
    let email = userData.email;
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'User-Agent': 'interop-stack-rank'
        }
      });
      
      if (emailResponse.ok) {
        const emails = await emailResponse.json();
        const primaryEmail = emails.find((e: any) => e.primary);
        email = primaryEmail?.email;
      }
    }
    
    if (!email) {
      return new Response('No email found in GitHub account', { status: 400 });
    }

    // Store user in database using email as primary key
    const rankingStorageId = env.RANKING_STORAGE.idFromName('global');
    const rankingStorage = env.RANKING_STORAGE.get(rankingStorageId);
    
    const dbUserResponse = await rankingStorage.fetch(new Request('https://dummy/users', {
      method: 'POST',
      body: JSON.stringify({
        email: email,
        provider: 'github',
        provider_id: userData.id.toString(),
        name: userData.name,
        username: userData.login
      })
    }));
    
    const dbUser = await dbUserResponse.json();
    
    // Create session with email as primary identifier
    const user = {
      email: email,
      provider: 'github',
      username: userData.login,
      name: userData.name
    };
    
    const sessionData = btoa(JSON.stringify(user));
    
    const response = Response.redirect(url.origin);
    response.headers.set('Set-Cookie', `session=${sessionData}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`);
    response.headers.set('Set-Cookie', `oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
    
    return response;
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return new Response('Authentication failed', { status: 500 });
  }
};

export default route;