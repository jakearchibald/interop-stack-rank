function githubHeaders() {
  const headers = { Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

/**
 * Fetch every page of a GitHub API list endpoint.
 */
export async function fetchAllPages(url) {
  const perPage = 100;
  url = new URL(url);
  url.searchParams.set('per_page', perPage.toString());

  const all = [];
  let page = 1;

  while (true) {
    url.searchParams.set('page', page.toString());

    const response = await fetch(url, { headers: githubHeaders() });

    if (!response.ok) {
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText} (${url})`
      );
    }

    const items = await response.json();
    all.push(...items);

    // Check if we got fewer than the max per page, indicating this is the last page
    if (items.length < perPage) break;

    page++;
  }

  return all;
}

/**
 * Fetch all open focus area proposal issues.
 */
export function fetchFocusAreaIssues() {
  const url = new URL(
    'https://api.github.com/repos/web-platform-tests/interop/issues'
  );
  url.searchParams.set('labels', 'focus-area-proposal');
  url.searchParams.set('state', 'open');
  return fetchAllPages(url);
}

/**
 * Run a GitHub GraphQL query.
 */
export async function graphql(query, variables) {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: githubHeaders(),
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(
      `GitHub GraphQL error: ${response.status} ${response.statusText}`
    );
  }

  const { data, errors } = await response.json();

  if (errors) {
    throw new Error(
      `GitHub GraphQL error: ${errors.map((e) => e.message).join(', ')}`
    );
  }

  return data;
}
