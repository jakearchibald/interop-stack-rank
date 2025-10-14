import { defineConfig } from 'vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import preact from '@preact/preset-vite';
import { markdown } from './lib/vite-plugin-markdown';

export default defineConfig({
  plugins: [
    preact(),
    markdown(),
    cloudflare({
      experimental: { headersAndRedirectsDevModeSupport: true },
    }),
  ],
  environments: {
    client: {
      build: {
        rollupOptions: {
          input: {
            index: 'index.html',
            results: 'results/index.html',
          },
        },
      },
    },
  },
});
