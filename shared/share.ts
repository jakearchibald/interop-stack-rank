/** The user data that's visible on a shared ranking. */
export interface PublicUser {
  displayName: string;
  githubUsername: string;
  avatarSrc: string;
  rankings: number[];
}

/** The number of items shown in the social image. */
export const socialImageItemCount = 3;

/**
 * Share IDs use characters without vowels, so they can't accidentally spell
 * words. Similar-looking characters (0/o, 1/l/i) are also excluded.
 */
export const shareIdAlphabet = 'bcdfghjkmnpqrstvwxz23456789';
export const shareIdLength = 12;

export function sharePath(githubUsername: string, shareId: string): string {
  return `/share/${encodeURIComponent(githubUsername)}-${shareId}/`;
}

/**
 * Splits a slug like `username-shareid` into its parts. GitHub usernames can
 * contain hyphens, but share IDs can't, so the ID is everything after the last
 * hyphen.
 */
export function parseShareSlug(
  slug: string
): { githubUsername: string; shareId: string } | null {
  const index = slug.lastIndexOf('-');
  if (index === -1) return null;

  const shareId = slug.slice(index + 1);
  if (shareId.length !== shareIdLength) return null;

  try {
    return {
      githubUsername: decodeURIComponent(slug.slice(0, index)),
      shareId,
    };
  } catch {
    // Malformed percent-encoding.
    return null;
  }
}

/**
 * A short hash of everything shown in the social image. It's used in the image
 * URL, so the URL changes when the image does. Social platforms cache images
 * aggressively, so this ensures they fetch the new one.
 */
export function socialImageVersion(user: PublicUser): string {
  const input = JSON.stringify([
    user.displayName,
    user.githubUsername,
    user.avatarSrc,
    user.rankings.slice(0, socialImageItemCount),
  ]);

  // FNV-1a. This isn't for security, it just needs to change when the input
  // does.
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}
