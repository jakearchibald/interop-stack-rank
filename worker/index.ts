const routeModules = import.meta.glob('./routes/**/*.ts') as Record<
  string,
  () => Promise<{ default: NonNullable<ExportedHandler<Env>['fetch']> }>
>;

/**
 * Routes with `[param]` path segments, which match any single segment. These
 * are only used if there isn't an exact match. Handlers read the param from
 * the URL.
 */
const dynamicRoutes = Object.keys(routeModules)
  .filter((key) => key.includes('['))
  .map((key) => {
    const pattern = key
      .split(/(\[[^\]/]+\])/)
      .map((part, i) =>
        // Odd parts are params.
        i % 2 ? '[^/]+' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      )
      .join('');
    return { regex: new RegExp(`^${pattern}$`), key };
  });

function findRoute(pathname: string) {
  const filePath = pathname.endsWith('/')
    ? `./routes${pathname}index.ts`
    : `./routes${pathname}.ts`;

  if (routeModules[filePath]) return routeModules[filePath];

  for (const { regex, key } of dynamicRoutes) {
    if (regex.test(filePath)) return routeModules[key];
  }

  return undefined;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    const route = findRoute(url.pathname);

    if (!route) {
      // Fix missing trailing slash.
      if (!url.pathname.endsWith('/') && findRoute(url.pathname + '/')) {
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
