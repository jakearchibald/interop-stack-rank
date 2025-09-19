export interface User {
  id: string;
  provider: 'github' | 'google';
  name: string;
  email: string;
  username?: string;
  picture?: string;
}

export function getUserFromRequest(request: Request): User | null {
  const cookies = request.headers.get('Cookie') || '';
  const sessionCookie = cookies.split(';')
    .find(cookie => cookie.trim().startsWith('session='))
    ?.split('=')[1];
  
  if (!sessionCookie) {
    return null;
  }
  
  try {
    return JSON.parse(atob(sessionCookie));
  } catch {
    return null;
  }
}

export function requireAuth(request: Request): User {
  const user = getUserFromRequest(request);
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }
  return user;
}