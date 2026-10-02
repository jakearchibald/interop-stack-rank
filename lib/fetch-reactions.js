import { writeFile } from 'fs/promises';
import { fetchAllPages, fetchFocusAreaIssues } from './github.js';

const positiveReactions = new Set(['+1', 'heart', 'hooray', 'rocket']);
const negativeReactions = new Set(['-1', 'confused']);

/**
 * Count reactions on the issue's opening post, counting at most one positive
 * and one negative reaction per user.
 */
async function fetchReactionCounts(issue) {
  if (issue.reactions?.total_count === 0) return { positive: 0, negative: 0 };

  const reactions = await fetchAllPages(
    `https://api.github.com/repos/web-platform-tests/interop/issues/${issue.number}/reactions`
  );

  const positiveUsers = new Set();
  const negativeUsers = new Set();

  for (const reaction of reactions) {
    if (!reaction.user) continue;
    if (positiveReactions.has(reaction.content)) {
      positiveUsers.add(reaction.user.id);
    } else if (negativeReactions.has(reaction.content)) {
      negativeUsers.add(reaction.user.id);
    }
  }

  return { positive: positiveUsers.size, negative: negativeUsers.size };
}

async function fetchReactions() {
  if (!process.env.GITHUB_TOKEN) {
    console.warn(
      'GITHUB_TOKEN not set. Unauthenticated requests are limited to 60/hour, which may not be enough to fetch reactions.'
    );
  }

  try {
    const allIssues = await fetchFocusAreaIssues();
    const reactions = {};

    for (const [i, issue] of allIssues.entries()) {
      console.log(
        `Fetching reactions for #${issue.number} (${i + 1}/${allIssues.length})`
      );
      reactions[issue.number] = await fetchReactionCounts(issue);
    }

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
