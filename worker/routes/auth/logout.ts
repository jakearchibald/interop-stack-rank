const route: ExportedHandler<Env>['fetch'] = async (request, env, ctx) => {
  const url = new URL(request.url);

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.origin,
      'Set-Cookie': 'session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
    },
  });
};

export default route;
