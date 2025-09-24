import { getSessionUser, requireAdmin } from '../../utils/session';

const route: ExportedHandler<Env>['fetch'] = async (request, env) => {
  const user = await getSessionUser(request, env);

  requireAdmin(user);

  const userDataStub = env.USER_DATA.getByName('global');

  try {
    // Get all users from the database
    const allRankings = await userDataStub.getAllRankings();

    return Response.json(allRankings);
  } catch (error) {
    console.error('Error fetching ranking data:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};

export default route;