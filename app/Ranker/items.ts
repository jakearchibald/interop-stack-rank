import type { RankingItem } from './types';
import allItems from './data.json';

export { allItems };

export const itemsById = new Map<number, RankingItem>();
for (const item of allItems) itemsById.set(item.id, item);

export function issueURL(id: number): string {
  return `https://github.com/web-platform-tests/interop/issues/${id}`;
}
