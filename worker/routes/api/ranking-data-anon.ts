import { getSessionUser } from '../../utils/session';
import { requireDataAccess } from '../../utils/auth';

const route: ExportedHandler<Env>['fetch'] = async (request, env) => {
  const user = await getSessionUser(request, env);

  requireDataAccess(user);

  const userDataStub = env.USER_DATA.getByName('global');

  try {
    const allRankings = await userDataStub.getAllRankings();
    const anonRankings = allRankings
      .map((ranking) => ranking.rankings)
      .filter((ranking) => ranking.length > 0);

    return Response.json(anonRankings);
  } catch (error) {
    console.error('Error fetching ranking data:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};

export default route;
