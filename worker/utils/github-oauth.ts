export function generateState(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function createAuthorizationURL(
  clientId: string,
  state: string,
  redirectURI: string
): URL {
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('state', state);
  url.searchParams.set('redirect_uri', redirectURI);
  return url;
}

interface TokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

export async function validateAuthorizationCode(
  clientId: string,
  clientSecret: string,
  code: string
): Promise<string> {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'interop-stack-rank',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });

  if (!response.ok) {
    throw new Error(`Token request failed with status ${response.status}`);
  }

  // GitHub reports errors with a 200 status, so check the body too
  const data = (await response.json()) as TokenResponse;

  if (!data.access_token) {
    throw new Error(
      `Token request failed: ${data.error_description || data.error}`
    );
  }

  return data.access_token;
}
