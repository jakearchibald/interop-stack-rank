import allItems from '../../Ranker/data.json';
import type { RankingItem } from '../../Ranker';

export const itemsById = new Map<number, RankingItem>();
for (const item of allItems) itemsById.set(item.id, item);
