import { marked } from 'marked';
import { writeFile } from 'fs/promises';
import betterTitles from './better-titles.js';

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

async function fetchIssues() {
  const url = new URL(
    'https://api.github.com/repos/web-platform-tests/interop/issues'
  );
  const perPage = 100;
  url.searchParams.set('labels', 'focus-area-proposal');
  url.searchParams.set('state', 'open');
  url.searchParams.set('per_page', perPage.toString());

  try {
    const allIssues = [];
    let page = 1;

    while (true) {
      url.searchParams.set('page', page.toString());

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `GitHub API error: ${response.status} ${response.statusText}`
        );
      }

      const issues = await response.json();
      allIssues.push(...issues);

      // Check if we got fewer than the max per page, indicating this is the last page
      if (issues.length < perPage) break;

      page++;
    }

    const result = allIssues.map((issue) => {
      const titleHTML = betterTitles[issue.number]?.title
        ? marked.parseInline(betterTitles[issue.number].title)
        : titleToHTML(issue.title);

      const obj = {
        id: issue.number,
        titleHTML,
      };

      if (betterTitles[issue.number]?.subtitle) {
        obj.subtitleHTML = marked.parseInline(
          betterTitles[issue.number].subtitle
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

export { fetchIssues };
