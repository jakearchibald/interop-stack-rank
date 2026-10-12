import { renderToString } from 'preact-render-to-string';
import SiteShell from '../../app/AppShell/SiteShell';
import UserRanking from '../../app/UserRanking';
import {
  socialImageItemCount,
  socialImageVersion,
  type PublicUser,
} from '../../shared/share';
import { plainTitle, socialImageAltText } from '../../shared/socialImageAlt';

/**
 * Renders a shared ranking. The page is entirely rendered here, with no
 * client-side script. The template is the built `share-template/index.html`,
 * which provides the styles.
 */
export async function renderSharePage(
  request: Request,
  env: Env,
  user: PublicUser
): Promise<Response> {
  const url = new URL(request.url);
  const template = await env.ASSETS.fetch(new URL('/share-template/', url));

  if (!template.ok) {
    throw new Error(`Couldn't fetch share template: ${template.status}`);
  }

  const pageURL = new URL(url.pathname, url).href;
  const imageURL = new URL(
    `social.png?v=${socialImageVersion(user)}`,
    pageURL
  ).href;
  const title = `${user.displayName}'s 2027 Web Platform Feature Ranking`;
  const imageAlt = socialImageAltText(user);
  const topTitles = user.rankings
    .slice(0, socialImageItemCount)
    .map(plainTitle)
    .filter((title) => title !== undefined);
  const description =
    topTitles.length === 0
      ? 'Nothing ranked yet.'
      : `Top picks: ${topTitles.map((title, i) => `${i + 1}. ${title}`).join(', ')}`;

  const body = renderToString(
    <SiteShell>
      <UserRanking
        user={user}
        variant="shared"
        footer={<a href="/">Make your own ranking</a>}
      />
    </SiteShell>
  );

  const metaContent: Record<string, string> = {
    'meta[property="og:title"]': title,
    'meta[name="twitter:title"]': title,
    'meta[property="og:description"]': description,
    'meta[name="description"]': description,
    'meta[property="og:image"]': imageURL,
    'meta[name="twitter:image"]': imageURL,
    'meta[property="og:image:alt"]': imageAlt,
    'meta[name="twitter:image:alt"]': imageAlt,
    'meta[property="og:url"]': pageURL,
  };

  let rewriter = new HTMLRewriter()
    .on('title', {
      element(element) {
        element.setInnerContent(title);
      },
    })
    .on('#app', {
      element(element) {
        element.setInnerContent(body, { html: true });
      },
    });

  // The template's script only exists to bring in styles, so it isn't needed
  // in production. In development, Vite adds styles using script.
  if (!import.meta.env.DEV) {
    rewriter = rewriter.on('script, link[rel="modulepreload"]', {
      element(element) {
        element.remove();
      },
    });
  }

  for (const [selector, content] of Object.entries(metaContent)) {
    rewriter = rewriter.on(selector, {
      element(element) {
        element.setAttribute('content', content);
      },
    });
  }

  const response = rewriter.transform(template);

  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // The ranking can change at any time, so revalidate.
      'Cache-Control': 'no-cache',
    },
  });
}
