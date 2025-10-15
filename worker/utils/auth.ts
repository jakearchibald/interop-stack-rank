import { type SessionUser } from './session';

export interface User {
  id: string;
  provider: 'github' | 'google';
  name: string;
  email: string;
  username?: string;
  picture?: string;
}

const admins = new Set([
  93594, // Jake
  294864, // James
]);

const dataAccess = new Set([
  ...admins,
  498917, // Philip
  244772, // Simon
  1152698, // Patrick
  118266, // Keith
  332653, // jrmuizel
  9219935, // smaug---
]);

export function requireDataAccess(
  user: SessionUser | null
): asserts user is SessionUser {
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  if (!dataAccess.has(user.githubId)) {
    throw new Response('Forbidden', { status: 403 });
  }
}

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
