import betterTitles from '../lib/better-titles.js';
import { socialImageItemCount, type PublicUser } from './share';

/**
 * A proposal's title as plain text. Titles are Markdown, but only use
 * backticks for code.
 */
export function plainTitle(id: number): string | undefined {
  return betterTitles[id]?.title.replaceAll('`', '');
}

/** Describes the social image, as plain text. */
export function socialImageAltText(user: PublicUser): string {
  const titles = user.rankings
    .slice(0, socialImageItemCount)
    .map(plainTitle)
    .filter((title) => title !== undefined);

  const items = titles
    .map((title, i) => `${i + 1}. ${title}${title.endsWith('.') ? '' : '.'}`)
    .join(' ');

  const picks = titles.length === 1 ? 'top pick' : 'top picks';
  return `${user.displayName}'s ${picks} in the 2027 Web Platform Feature Ranking: ${items}`;
}
