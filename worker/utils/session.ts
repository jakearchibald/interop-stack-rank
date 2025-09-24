import { parse } from 'cookie';

export interface SessionUser {
  githubId: number;
}

export async function createSession(
  user: SessionUser,
  env: Env
): Promise<string> {
  const sessionId = crypto.randomUUID();
  const sessionData = JSON.stringify(user);

  await env.SESSIONS.put(sessionId, sessionData, {
    expirationTtl: 86400, // 24 hours
  });

  return sessionId;
}

export function createSessionResponse(
  sessionId: string,
  location: string
): Response {
  const responseHeaders = new Headers();
  responseHeaders.append('Location', location);
  responseHeaders.append(
    'Set-Cookie',
    `session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
  );
  responseHeaders.append(
    'Set-Cookie',
    `oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );

  const response = new Response('', {
    status: 302,
    headers: responseHeaders,
  });

  return response;
}

export async function getSessionUser(
  request: Request,
  env: Env
): Promise<SessionUser | null> {
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

export function requireAuth(
  user: SessionUser | null
): asserts user is SessionUser {
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }
}

const admins = new Set<number>([93594, 294864]);

export function requireAdmin(
  user: SessionUser | null
): asserts user is SessionUser {
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  if (!admins.has(user.githubId)) {
    throw new Response('Forbidden', { status: 403 });
  }
}
