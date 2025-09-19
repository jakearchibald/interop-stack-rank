import { parse } from 'cookie';

export interface SessionUser {
  email: string;
}

export async function getSessionUser(request: Request, env: Env): Promise<SessionUser | null> {
  const cookies = parse(request.headers.get('Cookie') || '');
  const sessionId = cookies.session;

  if (!sessionId) {
    return null;
  }

  try {
    const sessionData = await env.SESSIONS.get(sessionId);
    if (!sessionData) {
      return null;
    }

    return JSON.parse(sessionData) as SessionUser;
  } catch {
    return null;
  }
}

export function requireAuth(user: SessionUser | null): asserts user is SessionUser {
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }
}