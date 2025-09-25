import { type Signal, useSignal } from '@preact/signals';
import { useMemo } from 'preact/hooks';

import type { RankingItem } from '.';
import type { User } from '../../shared/user-data';
import allItems from '../data.json';

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
        rankingIds = JSON.parse(lsUnsaved);
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
    const unranked = allItems.filter((item) => !rankingIdsSet.has(item.id));
    shuffle(unranked);

    return unranked;
  }, [user.rankings]);

  const rankedItems = useSignal<RankingItem[]>(initialRankedItems);
  const unrankedItems = useSignal<RankingItem[]>(initialUnrankedItems);

  return { rankedItems, unrankedItems };
}
