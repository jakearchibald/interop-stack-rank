const route: ExportedHandler<Env>['fetch'] = async (request, env, ctx) => {
  const url = new URL(request.url);
  
  // Clear session cookie
  const response = Response.redirect(url.origin);
  response.headers.set('Set-Cookie', `session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
  
  return response;
};

export default route;