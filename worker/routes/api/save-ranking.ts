import { getSessionUser } from '../../utils/session';
import { endpointClosed, requireAdmin } from '../../utils/auth';
import { readOnly } from '../../../shared/config';
import type { PairAnswerList } from '../../../shared/user-data';

/**
 * Comfortably above the number of possible pairs (n * (n - 1) / 2 for n items),
 * but stops huge payloads being processed.
 */
const maxPairAnswers = 20_000;
/** Comfortably above the number of items. */
const maxRankingLength = 1_000;

const route: ExportedHandler<Env>['fetch'] = async (request, env) => {
  if (readOnly) endpointClosed();

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const user = await getSessionUser(request, env);

  if (!user) {
    return Response.json({ error: 'Not logged in' }, { status: 401 });
  }

  let githubId = user.githubId;

  const bodyData = await request.json().catch(() => null);

  if (
    !bodyData ||
    typeof bodyData !== 'object' ||
    !('ranking' in bodyData) ||
    !Array.isArray(bodyData.ranking) ||
    bodyData.ranking.length > maxRankingLength
  ) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const bodyNumbers = bodyData.ranking.map((id: unknown) => Number(id));

  let pairAnswers: PairAnswerList | undefined;

  if ('pairAnswers' in bodyData) {
    if (
      !Array.isArray(bodyData.pairAnswers) ||
      bodyData.pairAnswers.length > maxPairAnswers ||
      !bodyData.pairAnswers.every(
        (answer: unknown) =>
          Array.isArray(answer) &&
          answer.length === 2 &&
          answer.every((id) => typeof id === 'number')
      )
    ) {
      return Response.json({ error: 'Invalid pairAnswers' }, { status: 400 });
    }
    pairAnswers = bodyData.pairAnswers;
  }

  if ('githubId' in bodyData) {
    // Only admins can save rankings for other users
    requireAdmin(user);

    if (typeof bodyData.githubId !== 'number') {
      return Response.json({ error: 'Invalid githubId' }, { status: 400 });
    }
    githubId = bodyData.githubId;
  }

  const userDataStub = env.USER_DATA.getByName('global');
  await userDataStub.saveRankings(githubId, bodyNumbers, { pairAnswers });

  return Response.json({});
};

export default route;
