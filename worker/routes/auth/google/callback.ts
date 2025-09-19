import { Google } from 'arctic';

interface GoogleUser {
  sub: string;
  name: string;
  email: string;
  picture?: string;
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
  
  const redirectUri = `${url.origin}/auth/google/callback`;
  const google = new Google(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, redirectUri);
  
  try {
    const tokens = await google.validateAuthorizationCode(code);
    
    // Fetch user info from Google
    const googleUserResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`
      }
    });
    
    if (!googleUserResponse.ok) {
      throw new Error('Failed to fetch user info');
    }
    
    const userData: GoogleUser = await googleUserResponse.json();
    
    // Store user in database using email as primary key
    const rankingStorageId = env.RANKING_STORAGE.idFromName('global');
    const rankingStorage = env.RANKING_STORAGE.get(rankingStorageId);
    
    const dbUserResponse = await rankingStorage.fetch(new Request('https://dummy/users', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        provider: 'google',
        provider_id: userData.sub,
        name: userData.name,
        picture: userData.picture
      })
    }));
    
    const dbUser = await dbUserResponse.json();
    
    // Create session with email as primary identifier
    const user = {
      email: userData.email,
      provider: 'google',
      name: userData.name,
      picture: userData.picture
    };
    
    const sessionData = btoa(JSON.stringify(user));
    
    const response = Response.redirect(url.origin);
    response.headers.set('Set-Cookie', `session=${sessionData}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`);
    response.headers.set('Set-Cookie', `oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
    
    return response;
  } catch (error) {
    console.error('Google OAuth error:', error);
    return new Response('Authentication failed', { status: 500 });
  }
};

export default route;