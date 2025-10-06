import { marked } from 'marked';
import type { Plugin } from 'vite';

export function markdown(): Plugin {
  return {
    name: 'vite-plugin-markdown',
    async transform(code, id) {
      if (!id.endsWith('.md')) return null;

      const html = await marked.parse(code, { async: true });

      return {
        code: `export default ${JSON.stringify(html)};`,
        map: null,
      };
    },
  };
}
