const route: ExportedHandler<Env>['fetch'] = async (request, env, ctx) => {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const rankingStorageId = env.RANKING_STORAGE.idFromName('global');
  const rankingStorage = env.RANKING_STORAGE.get(rankingStorageId);

  // For now, we'll just return the available items
  // Later this could include aggregated statistics
  const items = [
    { id: '1', name: 'one' },
    { id: '2', name: 'two' },
    { id: '3', name: 'three' },
    { id: '4', name: 'four' },
    { id: '5', name: 'five' }
  ];

  return new Response(JSON.stringify({ items }), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export default route;