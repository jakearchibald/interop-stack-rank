import betterTitles from '../../../lib/better-titles.js';
import { issueURL, itemsById } from '../../Ranker/items';

function escapeHTML(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/**
 * lib/fetch-issues.js stops code wrapping on the site, using non-breaking
 * spaces and word joiners. Those would be confusing in someone else's post,
 * since they break copy & paste of the code.
 */
function cleanCodeHTML(html: string): string {
  return html.replace(
    /<code>([^<]*)<\/code>/g,
    (_, code: string) =>
      `<code>${code.replaceAll('&nbsp;', ' ').replaceAll('&#8288;', '')}</code>`
  );
}

export function rankingToMarkdown(rankings: number[]): string {
  return rankings
    .filter((id) => betterTitles[id])
    .map((id, index) => {
      const { title, subtitle } = betterTitles[id];
      const item = `${index + 1}. [${title}](${issueURL(id)})`;
      if (!subtitle) return item;
      // Some titles already end with a full stop.
      return `${item}${title.endsWith('.') ? '' : '.'} ${subtitle}`;
    })
    .join('\n');
}

export function rankingToHTML(rankings: number[]): string {
  const items = rankings
    .map((id) => itemsById.get(id))
    .filter((item) => item !== undefined)
    .map((item) => {
      const link = `<a href="${escapeHTML(issueURL(item.id))}">${cleanCodeHTML(item.titleHTML)}</a>`;
      if (!item.subtitleHTML) return `  <li><span class="title">${link}</span></li>`;
      // Some titles already end with a full stop.
      const fullStop = item.titleHTML.endsWith('.') ? '' : '.';
      const title = `<span class="title">${link}${fullStop}</span>`;
      const description = `<span class="description">${cleanCodeHTML(item.subtitleHTML)}</span>`;
      return `  <li>${title} ${description}</li>`;
    });

  return `<ol>\n${items.join('\n')}\n</ol>`;
}
