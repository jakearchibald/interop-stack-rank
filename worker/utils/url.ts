export function assertOrigin(url: string, expectedOrigin: string): void {
  const parsedUrl = new URL(url, expectedOrigin);
  if (parsedUrl.origin !== expectedOrigin) {
    throw new Error(`Invalid origin: ${parsedUrl.origin}`);
  }
}
