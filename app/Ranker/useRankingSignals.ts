import { type Signal, useSignal } from '@preact/signals';
import { useMemo } from 'preact/hooks';

import type { RankingItem } from '.';
import type { User } from '../../shared/user-data';
import allItems from './data.json';

export const itemsById = new Map<number, RankingItem>();
for (const item of allItems) itemsById.set(item.id, item);

function shuffle(array: unknown[], rand: () => number = Math.random) {
  let currentIndex = array.length;
  let randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(rand() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
}

export function useRankingSignals(user: User): {
  rankedItems: Signal<RankingItem[]>;
  unrankedItems: Signal<RankingItem[]>;
} {
  const initialRankedItems = useMemo<RankingItem[]>(() => {
    let rankingIds: number[] | null = null;

    const lsUnsaved = localStorage.getItem('unsavedRanking');

    if (lsUnsaved) {
      try {
        const unsavedData = JSON.parse(lsUnsaved);
        if (unsavedData && Array.isArray(unsavedData.ranking)) {
          rankingIds = unsavedData.ranking;
        }
      } catch {
        // Ignore JSON parse errors
      }
    }

    if (!rankingIds) {
      rankingIds = user.rankings;
    }

    return rankingIds
      .map((id) => itemsById.get(id))
      .filter((item): item is RankingItem => item !== undefined);
  }, [user.rankings]);

  const initialUnrankedItems = useMemo<RankingItem[]>(() => {
    const rankingIdsSet = new Set(user.rankings);
    const allUnranked = allItems.filter((item) => !rankingIdsSet.has(item.id));
    const allUnrankedIdsSet = new Set(allUnranked.map((item) => item.id));

    // Get IDs from localStorage
    let savedUnranked: number[] = [];
    const lsUnranked = localStorage.getItem('unranked');

    if (lsUnranked) {
      try {
        savedUnranked = JSON.parse(lsUnranked);
      } catch {
        // Ignore JSON parse errors
      }
    }

    const unranked: RankingItem[] = [];

    // Restore items from localStorage, if they're still unranked & exist
    for (const id of savedUnranked) {
      if (!allUnrankedIdsSet.has(id)) continue;
      allUnrankedIdsSet.delete(id);
      const item = itemsById.get(id);
      if (item) unranked.push(item);
    }

    // Append remaining items
    const remainingItems = [...allUnrankedIdsSet].map(
      (id) => itemsById.get(id)!
    );
    shuffle(remainingItems);
    unranked.push(...remainingItems);

    // Store order so it's stable across reloads
    // This is so people can take breaks and come back to ranking.
    const idsToStore = unranked.map((item) => item.id);
    localStorage.setItem('unranked', JSON.stringify(idsToStore));

    return unranked;
  }, [user.rankings]);

  const rankedItems = useSignal<RankingItem[]>(initialRankedItems);
  const unrankedItems = useSignal<RankingItem[]>(initialUnrankedItems);

  return { rankedItems, unrankedItems };
}
