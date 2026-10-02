export type AdminFetchResult<T> = { data: T } | { error: string };

export async function adminFetch<T>(url: string): Promise<AdminFetchResult<T>> {
  const response = await fetch(url);

  if (response.status === 401) return { error: 'Not logged in' };
  if (response.status === 403) return { error: 'Admins only' };

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    return { error: body?.error ?? `${response.status} error` };
  }

  return { data: (await response.json()) as T };
}

export function sizedAvatar(avatarSrc: string, size: number): string {
  const url = new URL(avatarSrc);
  url.searchParams.set('s', String(size));
  return url.toString();
}
