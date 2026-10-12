export function sizedAvatar(avatarSrc: string, size: number): string {
  const url = new URL(avatarSrc);
  url.searchParams.set('s', String(size));
  return url.toString();
}
