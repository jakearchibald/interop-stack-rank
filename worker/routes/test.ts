const route: ExportedHandler<Env>['fetch'] = async () => {
  return new Response('Test route is working');
};

export default route;
