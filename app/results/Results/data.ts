import allItems from '../../Ranker/data.json';
import reactions from './reactions.json';
import type { RankingItem } from '../../Ranker';

export const itemsById = new Map<number, RankingItem>();
for (const item of allItems) itemsById.set(item.id, item);

export interface ReactionCounts {
  positive: number;
  negative: number;
}

export const reactionsById = new Map<number, ReactionCounts>();
for (const [id, counts] of Object.entries(reactions)) {
  reactionsById.set(Number(id), counts);
}
