import { parseCookie } from 'cookie';

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
  responseHeaders.append(
    'Set-Cookie',
    `oauth_redirect=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
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
  const user = await getRealSessionUser(request, env);
  if (user) return user;
  return getDevUser(env);
}

async function getRealSessionUser(
  request: Request,
  env: Env
): Promise<SessionUser | null> {
  const cookies = parseCookie(request.headers.get('Cookie') || '');
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

/**
 * In development, setting DEV_USER_ID in .dev.vars treats requests without a
 * session as that user, so the app can be tested without GitHub login.
 */
async function getDevUser(env: Env): Promise<SessionUser | null> {
  if (!import.meta.env.DEV) return null;

  const { DEV_USER_ID } = env as Env & { DEV_USER_ID?: string };
  if (!DEV_USER_ID) return null;

  const githubId = Number(DEV_USER_ID);
  if (!Number.isInteger(githubId)) {
    throw new Error('DEV_USER_ID must be an integer');
  }

  // Ensure the user exists. Existing rankings are kept.
  await env.USER_DATA.getByName('global').saveUser({
    githubId,
    displayName: `Dev user ${githubId}`,
    githubUsername: `dev-user-${githubId}`,
    avatarSrc: `https://avatars.githubusercontent.com/u/${githubId}`,
  });

  return { githubId };
}

export async function clearAllSessions(env: Env): Promise<void> {
  const keys: string[] = [];
  let cursor: string | undefined = undefined;

  while (true) {
    const items = await env.SESSIONS.list({ cursor });
    keys.push(...items.keys.map((item) => item.name));
    if (items.list_complete) break;
    cursor = items.cursor as string;
  }

  await Promise.all(keys.map((id) => env.SESSIONS.delete(id)));
}

export function requireAuth(
  user: SessionUser | null
): asserts user is SessionUser {
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }
}


