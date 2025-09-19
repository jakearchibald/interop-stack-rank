const route: ExportedHandler<Env>['fetch'] = async (request, env, ctx) => {
  const cookies = request.headers.get('Cookie') || '';
  const sessionCookie = cookies.split(';')
    .find(cookie => cookie.trim().startsWith('session='))
    ?.split('=')[1];
  
  if (!sessionCookie) {
    return new Response(JSON.stringify({ user: null }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const userData = JSON.parse(atob(sessionCookie));
    return new Response(JSON.stringify({ user: userData }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ user: null }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export default route;