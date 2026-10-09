import { writeFile } from 'fs/promises';
import { fetchFocusAreaIssues, graphql } from './github.js';

const positiveReactions = new Set(['THUMBS_UP', 'HEART', 'HOORAY', 'ROCKET']);
const negativeReactions = new Set(['THUMBS_DOWN', 'CONFUSED']);

// Issues per GraphQL request. Larger batches are slow, and can time out.
const batchSize = 10;

const reactionsFragment = `
  fragment ReactionsPage on ReactionConnection {
    pageInfo { hasNextPage endCursor }
    nodes { content user { databaseId } }
  }
`;

const moreReactionsQuery = `
  query ($number: Int!, $cursor: String) {
    repository(owner: "web-platform-tests", name: "interop") {
      issue(number: $number) {
        reactions(first: 100, after: $cursor) { ...ReactionsPage }
      }
    }
  }
  ${reactionsFragment}
`;

/**
 * Fetch the first page of reactions for each issue, in a single request.
 * Returns a map of issue number to reaction connection.
 */
async function fetchFirstReactionPages(issueNumbers) {
  const fields = issueNumbers.map(
    (number) => `
      issue${number}: issue(number: ${number}) {
        reactions(first: 100) { ...ReactionsPage }
      }
    `
  );

  const data = await graphql(`
    query {
      repository(owner: "web-platform-tests", name: "interop") {
        ${fields.join('')}
      }
    }
    ${reactionsFragment}
  `);

  return new Map(
    issueNumbers.map((number) => [
      number,
      data.repository[`issue${number}`].reactions,
    ])
  );
}

/**
 * Fetch all reactions on an issue's opening post, starting from the first page.
 */
async function fetchAllReactions(number, firstPage) {
  const reactions = [...firstPage.nodes];
  let { pageInfo } = firstPage;

  while (pageInfo.hasNextPage) {
    const data = await graphql(moreReactionsQuery, {
      number,
      cursor: pageInfo.endCursor,
    });
    const page = data.repository.issue.reactions;
    reactions.push(...page.nodes);
    pageInfo = page.pageInfo;
  }

  return reactions;
}

/**
 * Count reactions, counting at most one positive and one negative reaction per
 * user.
 */
function countReactions(reactions) {
  const positiveUsers = new Set();
  const negativeUsers = new Set();

  for (const reaction of reactions) {
    if (!reaction.user) continue;
    if (positiveReactions.has(reaction.content)) {
      positiveUsers.add(reaction.user.databaseId);
    } else if (negativeReactions.has(reaction.content)) {
      negativeUsers.add(reaction.user.databaseId);
    }
  }

  return { positive: positiveUsers.size, negative: negativeUsers.size };
}

async function fetchReactions() {
  if (!process.env.GITHUB_TOKEN) {
    console.error('GITHUB_TOKEN not set. The GitHub GraphQL API requires it.');
    process.exit(1);
  }

  try {
    const allIssues = await fetchFocusAreaIssues();
    const reactions = {};
    const issueNumbersWithReactions = [];

    for (const issue of allIssues) {
      if (issue.reactions?.total_count === 0) {
        reactions[issue.number] = { positive: 0, negative: 0 };
      } else {
        issueNumbersWithReactions.push(issue.number);
      }
    }

    const batches = [];
    for (let i = 0; i < issueNumbersWithReactions.length; i += batchSize) {
      batches.push(issueNumbersWithReactions.slice(i, i + batchSize));
    }

    console.log(
      `Fetching reactions for ${issueNumbersWithReactions.length} issues in ${batches.length} batches`
    );

    const firstPages = await Promise.all(
      batches.map((batch) => fetchFirstReactionPages(batch))
    );

    await Promise.all(
      firstPages
        .flatMap((pages) => [...pages])
        .map(async ([number, firstPage]) => {
          reactions[number] = countReactions(
            await fetchAllReactions(number, firstPage)
          );
        })
    );

    const reactionsPath = new URL(
      '../app/results/Results/reactions.json',
      import.meta.url
    );
    await writeFile(reactionsPath, JSON.stringify(reactions, null, 2));

    console.log(
      `Wrote reactions for ${allIssues.length} issues to app/results/Results/reactions.json`
    );

    return reactions;
  } catch (error) {
    console.error('Error fetching reactions:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  fetchReactions();
}

export { fetchReactions };
