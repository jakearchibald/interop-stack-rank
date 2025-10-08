const routeModules = import.meta.glob('./routes/**/*.ts') as Record<
  string,
  () => Promise<{ default: NonNullable<ExportedHandler<Env>['fetch']> }>
>;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    const route = url.pathname.endsWith('/')
      ? routeModules[`./routes${url.pathname}index.ts`]
      : routeModules[`./routes${url.pathname}.ts`];

    if (!route) {
      // Fix missing trailing slash.
      if (
        !url.pathname.endsWith('/') &&
        routeModules['./routes' + url.pathname + '/index.ts']
      ) {
        return Response.redirect(new URL(url.pathname + '/', url).href);
      }

      return new Response('Not found', { status: 404 });
    }

    const module = await route();

    if (!('default' in module)) {
      throw new Error(
        `Route module for ${url.pathname} is missing default export`
      );
    }

    if (typeof module.default !== 'function') {
      throw new Error(
        `Route module for ${url.pathname} default export is not a function`
      );
    }

    try {
      return await module.default(request, env, ctx);
    } catch (err) {
      if (err instanceof Response) {
        return err;
      }
      return new Response('Internal Server Error', { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;

// Export durable objects
export { UserData } from './durable-objects/user-data';
