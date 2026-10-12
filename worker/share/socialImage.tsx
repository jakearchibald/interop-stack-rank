import satori, { init as initSatori } from 'satori/standalone';
import { initWasm as initResvg, Resvg } from '@resvg/resvg-wasm';
import yogaWasm from 'satori/yoga.wasm';
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm';
// satori doesn't support WOFF2, so these are the WOFF versions.
import headline600 from '@fontsource/mozilla-headline/files/mozilla-headline-latin-600-normal.woff?inline';
import headline600Ext from '@fontsource/mozilla-headline/files/mozilla-headline-latin-ext-600-normal.woff?inline';
import text400 from '@fontsource/mozilla-text/files/mozilla-text-latin-400-normal.woff?inline';
import text500 from '@fontsource/mozilla-text/files/mozilla-text-latin-500-normal.woff?inline';
import code500 from '@fontsource/source-code-pro/files/source-code-pro-latin-500-normal.woff?inline';
import betterTitles from '../../lib/better-titles.js';
import { sizedAvatar } from '../../shared/avatar';
import { prepareName } from './nameFont';
import {
  socialImageItemCount,
  socialImageVersion,
  type PublicUser,
} from '../../shared/share';

const width = 1200;
const height = 630;
const avatarSize = 112;

/**
 * Memoizes an async function, but allows a retry if it fails.
 */
function once(fn: () => Promise<void>): () => Promise<void> {
  let promise: Promise<void> | null = null;
  return () => {
    promise ??= fn().catch((error) => {
      promise = null;
      throw error;
    });
    return promise;
  };
}

const initSatoriOnce = once(() => initSatori(yogaWasm));
const initResvgOnce = once(async () => {
  try {
    await initResvg(resvgWasm);
  } catch (error) {
    // resvg's state outlives this module when it's hot-reloaded in
    // development.
    if (!String(error).includes('Already initialized')) throw error;
  }
});

function dataURLToBytes(dataURL: string): Uint8Array<ArrayBuffer> {
  const binary = atob(dataURL.slice(dataURL.indexOf(',') + 1));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  // In chunks, to avoid exceeding the argument limit.
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

let fonts: Parameters<typeof satori>[1]['fonts'] | null = null;

function getFonts() {
  if (!fonts) {
    const font = (
      name: string,
      dataURL: string,
      weight: 400 | 500 | 600
    ) => ({ name, data: dataURLToBytes(dataURL).buffer, weight });

    fonts = [
      font('Mozilla Headline', headline600, 600),
      font('Mozilla Headline Ext', headline600Ext, 600),
      font('Mozilla Text', text400, 400),
      font('Mozilla Text', text500, 500),
      font('Source Code Pro', code500, 500),
    ];
  }
  return fonts;
}

/** Fetches the avatar as a data URL, since satori needs the image data. */
async function fetchAvatar(avatarSrc: string): Promise<string | null> {
  try {
    const response = await fetch(sizedAvatar(avatarSrc, avatarSize * 2));
    if (!response.ok) return null;
    const type = response.headers.get('Content-Type') ?? 'image/png';
    const bytes = new Uint8Array(await response.arrayBuffer());
    return `data:${type};base64,${bytesToBase64(bytes)}`;
  } catch (error) {
    console.error("Couldn't fetch avatar", error);
    return null;
  }
}

const codeStyle = {
  fontFamily: 'Source Code Pro',
  fontSize: '0.9em',
  padding: '0 0.2em',
  borderRadius: '0.25em',
  // The site's code background, on white.
  background: '#eff0f2',
  // Code doesn't wrap on the site either.
  whiteSpace: 'nowrap' as const,
};

/**
 * Renders a Markdown title, where backticks mark code.
 *
 * satori lays out each child of an element as a flex item, rather than as
 * inline text, so the title is split into words that wrap.
 */
function Title({ markdown }: { markdown: string }) {
  type Piece = { text: string; code: boolean };
  // Each word is a list of pieces with no space between them, such as code
  // followed by a comma.
  const words: Piece[][] = [[]];

  for (const [i, part] of markdown.split(/`([^`]+)`/).entries()) {
    // Odd parts are code.
    if (i % 2) {
      words.at(-1)!.push({ text: part, code: true });
      continue;
    }

    for (const [j, text] of part.split(/\s+/).entries()) {
      if (j > 0) words.push([]);
      if (text) words.at(-1)!.push({ text, code: false });
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        columnGap: '0.25em',
      }}
    >
      {words
        .filter((word) => word.length > 0)
        .map((word) => (
          <div style={{ display: 'flex' }}>
            {word.map((piece) =>
              piece.code ? (
                <span style={codeStyle}>{piece.text}</span>
              ) : (
                <span>{piece.text}</span>
              )
            )}
          </div>
        ))}
    </div>
  );
}

async function renderPNG(user: PublicUser): Promise<Uint8Array<ArrayBuffer>> {
  const [avatar, name] = await Promise.all([
    fetchAvatar(user.avatarSrc),
    prepareName(user),
    initSatoriOnce(),
    initResvgOnce(),
  ]);

  const titles = user.rankings
    .slice(0, socialImageItemCount)
    .map((id) => betterTitles[id]?.title)
    .filter((title) => title !== undefined);

  const svg = await satori(
    <div
      style={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        padding: '48px 64px',
        background: '#f4f5f8',
        color: '#1a1c21',
        fontFamily: 'Mozilla Text',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {avatar && (
          <img
            src={avatar}
            width={avatarSize}
            height={avatarSize}
            style={{ borderRadius: '50%', border: '1px solid #d6d9e0' }}
          />
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div
            style={{
              fontFamily: name.fontFamily,
              fontWeight: 600,
              fontSize: 52,
              lineHeight: 1.1,
            }}
          >
            {name.text}
          </div>
          <div style={{ fontSize: 28, color: '#5b606c' }}>
            2027 Web Platform Feature Ranking
          </div>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          marginTop: 40,
        }}
      >
        {titles.map((title, i) => (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              padding: '16px 28px',
              background: '#fff',
              border: '1px solid #d6d9e0',
              borderRadius: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexShrink: 0,
                alignItems: 'center',
                justifyContent: 'center',
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: '#3b5bdb',
                color: '#fff',
                fontSize: 28,
                fontWeight: 500,
              }}
            >
              {i + 1}
            </div>
            <div
              style={{
                display: 'flex',
                flex: 1,
                fontSize: 30,
                fontWeight: 500,
                lineHeight: 1.3,
                // Two lines at most.
                maxHeight: 30 * 1.3 * 2,
                overflow: 'hidden',
              }}
            >
              <Title markdown={title} />
            </div>
          </div>
        ))}
      </div>
    </div>,
    { width, height, fonts: [...getFonts(), ...name.fonts] }
  );

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width } });
  // Copied, as the result is typed as possibly SharedArrayBuffer-backed.
  const png = new Uint8Array(resvg.render().asPng());
  resvg.free();
  return png;
}

/**
 * Responds with the social image for a user. The `v` param must match the
 * current version of the image, otherwise this redirects to the current
 * version. That means a response for a given URL never changes, so it can be
 * cached forever.
 */
export async function socialImageResponse(
  request: Request,
  user: PublicUser,
  {
    cacheControl,
    ctx,
  }: {
    cacheControl: string;
    /** If provided, responses are cached at the edge. */
    ctx?: ExecutionContext;
  }
): Promise<Response> {
  const url = new URL(request.url);
  const version = socialImageVersion(user);

  if (url.searchParams.get('v') !== version) {
    url.searchParams.set('v', version);
    return new Response(null, {
      status: 302,
      headers: { Location: url.href, 'Cache-Control': 'no-store' },
    });
  }

  const cache = ctx ? await caches.open('social-images') : null;
  const cached = await cache?.match(request);
  if (cached) return cached;

  const response = new Response(await renderPNG(user), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': cacheControl,
    },
  });

  if (cache) ctx!.waitUntil(cache.put(request, response.clone()));
  return response;
}
