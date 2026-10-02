import { marked } from 'marked';
import { writeFile } from 'fs/promises';
import betterTitles from './better-titles.js';
import { fetchFocusAreaIssues } from './github.js';

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function titleToHTML(text) {
  // First escape HTML
  const escaped = escapeHtml(text);
  // Then convert backticks to code tags
  return escaped.replace(/`([^`]+)`/g, '<code>$1</code>');
}

/**
 * Remove line break opportunities within code, so code avoids wrapping.
 * Spaces become non-breaking, and hyphens are followed by a word joiner.
 */
function nonBreakingCode(html) {
  return html.replace(
    /<code>([^<]*)<\/code>/g,
    (_, code) =>
      `<code>${code
        .replaceAll(' ', '&nbsp;')
        .replaceAll('-', '-&#8288;')}</code>`
  );
}

async function fetchIssues() {
  try {
    const allIssues = await fetchFocusAreaIssues();

    const result = allIssues.map((issue) => {
      const titleHTML = betterTitles[issue.number]?.title
        ? marked.parseInline(betterTitles[issue.number].title)
        : titleToHTML(issue.title);

      const obj = {
        id: issue.number,
        titleHTML: nonBreakingCode(titleHTML),
      };

      if (betterTitles[issue.number]?.subtitle) {
        obj.subtitleHTML = nonBreakingCode(
          marked.parseInline(betterTitles[issue.number].subtitle)
        );
      }

      return obj;
    });

    const ids = allIssues.map((issue) => issue.number);
    const appDataPath = new URL('../app/Ranker/data.json', import.meta.url);
    const validIdsPath = new URL(
      '../worker/durable-objects/user-data/valid-ids.json',
      import.meta.url
    );

    await Promise.all([
      writeFile(appDataPath, JSON.stringify(result, null, 2)),
      writeFile(validIdsPath, JSON.stringify(ids, null, 2)),
    ]);

    console.log(`Wrote ${result.length} issues to app/data.json`);
    console.log(
      `Wrote ${ids.length} valid IDs to worker/durable-objects/user-data/valid-ids.json`
    );

    return result;
  } catch (error) {
    console.error('Error fetching issues:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  fetchIssues();
}

export { fetchIssues, nonBreakingCode };
