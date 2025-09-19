import { getUserFromRequest } from '../../utils/auth';

interface RankingRequest {
  rankings: Array<{
    item_id: string;
    rank: number | null;
  }>;
}

const route: ExportedHandler<Env>['fetch'] = async (request, env, ctx) => {
  const user = getUserFromRequest(request);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const rankingStorageId = env.RANKING_STORAGE.idFromName('global');
  const rankingStorage = env.RANKING_STORAGE.get(rankingStorageId);

  if (request.method === 'GET') {
    // Get user's current rankings
    const url = new URL('https://dummy/user-rankings');
    url.searchParams.set('user_email', user.email);
    
    const response = await rankingStorage.fetch(new Request(url.toString(), {
      method: 'GET'
    }));

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch rankings' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const rankings = await response.json();
    return new Response(JSON.stringify(rankings), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (request.method === 'POST') {
    // Save user's rankings
    const body: RankingRequest = await request.json();
    
    const response = await rankingStorage.fetch(new Request('https://dummy/user-rankings', {
      method: 'POST',
      body: JSON.stringify({
        user_email: user.email,
        rankings: body.rankings
      })
    }));

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Failed to save rankings' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await response.json();
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
};

export default route;