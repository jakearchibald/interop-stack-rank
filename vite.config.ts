import { defineConfig } from 'vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [
    preact(),
    cloudflare({
      experimental: { headersAndRedirectsDevModeSupport: true },
    }),
  ],
});
