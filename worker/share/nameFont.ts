import headlineUnicode from '@fontsource/mozilla-headline/unicode.json';
import { cleanDisplayName, type PublicUser } from '../../shared/share';

interface Font {
  name: string;
  data: ArrayBuffer;
  weight: 600;
}

/**
 * The bundled Mozilla Headline fonts. The Latin Extended subset has its own
 * name, as satori only uses one font per name and weight.
 */
export const headlineFamily = 'Mozilla Headline, Mozilla Headline Ext';

/** Code point ranges covered by the bundled Mozilla Headline fonts. */
const headlineRanges = Object.values(headlineUnicode)
  .flatMap((ranges) => ranges.split(','))
  .map((range) => {
    const [start, end = start] = range.replaceAll('U+', '').split('-');
    return [parseInt(start, 16), parseInt(end, 16)] as const;
  });

function isCovered(char: string): boolean {
  const codePoint = char.codePointAt(0)!;
  return headlineRanges.some(
    ([start, end]) => codePoint >= start && codePoint <= end
  );
}

/** Emoji, including the parts of emoji sequences. */
const emojiRE =
  /\p{RGI_Emoji}|\p{Extended_Pictographic}|[\u{FE0E}\u{FE0F}\u{20E3}\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}]/gv;

/**
 * Scripts satori can't render properly, as it doesn't support right-to-left
 * text, or the shaping these scripts need.
 */
const unsupportedScriptRE =
  /[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Syriac}\p{Script=Thaana}\p{Script=Nko}\p{Script=Devanagari}\p{Script=Bengali}\p{Script=Gurmukhi}\p{Script=Gujarati}\p{Script=Oriya}\p{Script=Tamil}\p{Script=Telugu}\p{Script=Kannada}\p{Script=Malayalam}\p{Script=Sinhala}\p{Script=Thai}\p{Script=Lao}\p{Script=Tibetan}\p{Script=Myanmar}\p{Script=Khmer}]/u;

/**
 * Fallback font families for scripts Noto Sans doesn't cover, in priority
 * order. Japanese comes before Chinese, so Japanese names use Japanese forms
 * of shared characters.
 */
const scriptFamilies: [script: RegExp, family: string][] = [
  [/[\p{Script=Hiragana}\p{Script=Katakana}]/u, 'Noto Sans JP'],
  [/\p{Script=Hangul}/u, 'Noto Sans KR'],
  [/\p{Script=Han}/u, 'Noto Sans SC'],
  [/\p{Script=Armenian}/u, 'Noto Sans Armenian'],
  [/\p{Script=Georgian}/u, 'Noto Sans Georgian'],
  [/\p{Script=Ethiopic}/u, 'Noto Sans Ethiopic'],
];

/** How long Google Fonts responses are cached at the edge. */
const fontCacheTTL = 60 * 60 * 24 * 30;

/**
 * Fetches fallback fonts from Google Fonts, subset to just the characters in
 * the text, which keeps them small. Noto Sans covers Latin, Greek and
 * Cyrillic, and the script-specific families cover others.
 */
async function fetchFallbackFonts(
  text: string
): Promise<{ fonts: Font[]; families: string[] }> {
  const families = [
    'Noto Sans',
    ...scriptFamilies
      .filter(([script]) => script.test(text))
      .map(([, family]) => family),
  ];

  const url = new URL('https://fonts.googleapis.com/css2');
  for (const family of families) {
    url.searchParams.append('family', `${family}:wght@600`);
  }
  url.searchParams.set('text', text);

  const fetchOptions = {
    signal: AbortSignal.timeout(5000),
    cf: { cacheEverything: true, cacheTtl: fontCacheTTL },
  };

  // Without a browser user agent, Google Fonts serves TrueType, which satori
  // supports (unlike WOFF2).
  const cssResponse = await fetch(url, fetchOptions);
  if (!cssResponse.ok) {
    throw new Error(`Google Fonts CSS: ${cssResponse.status} error`);
  }
  const css = await cssResponse.text();

  const faces = [
    ...css.matchAll(
      /font-family:\s*'([^']+)'[^}]*?src:\s*url\(([^)]+)\)\s*format\('(truetype|opentype|woff)'\)/g
    ),
  ];
  if (faces.length === 0) throw new Error('No usable fonts in Google Fonts CSS');

  const fonts = await Promise.all(
    faces.map(async ([, name, fontURL]) => {
      const response = await fetch(fontURL, fetchOptions);
      if (!response.ok) {
        throw new Error(`Google Fonts font: ${response.status} error`);
      }
      return { name, data: await response.arrayBuffer(), weight: 600 as const };
    })
  );

  return { fonts, families };
}

/**
 * Prepares the user's name for the social image. Emoji are removed, as there's
 * no emoji font.
 *
 * If the name is entirely covered by Mozilla Headline, it's used. Otherwise,
 * the whole name uses fallback fonts, so it's in a consistent style. If the
 * fallback fonts can't be fetched, unsupported characters are removed.
 *
 * Names in scripts satori can't render are replaced with the GitHub username.
 */
export async function prepareName(user: PublicUser): Promise<{
  text: string;
  fontFamily: string;
  fonts: Font[];
}> {
  const text =
    cleanDisplayName(user).replace(emojiRE, '').replace(/\s+/g, ' ').trim() ||
    user.githubUsername;

  if (unsupportedScriptRE.test(text)) {
    return { text: user.githubUsername, fontFamily: headlineFamily, fonts: [] };
  }

  if ([...text].every(isCovered)) {
    return { text, fontFamily: headlineFamily, fonts: [] };
  }

  try {
    const { fonts, families } = await fetchFallbackFonts(text);
    return { text, fontFamily: families.join(', '), fonts };
  } catch (error) {
    console.error("Couldn't fetch fallback fonts", error);
    const supported = [...text]
      .filter(isCovered)
      .join('')
      .replace(/\s+/g, ' ')
      .trim();
    return {
      text: supported || user.githubUsername,
      fontFamily: headlineFamily,
      fonts: [],
    };
  }
}
