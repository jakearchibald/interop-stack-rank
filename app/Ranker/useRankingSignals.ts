import { type Signal, useSignal } from '@preact/signals';
import { useMemo, useState } from 'preact/hooks';

import type { RankingItem } from '.';
import type { User } from '../../shared/user-data';
import allItems from './data.json';
import {
  answersFromList,
  answersToList,
  type PairAnswers,
  takeLegacyAnswers,
} from './PairSorter/storedAnswers';

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

function getUnsavedData(): { ranking?: unknown; pairAnswers?: unknown } {
  try {
    return JSON.parse(localStorage.getItem('unsavedRanking') ?? '{}') ?? {};
  } catch {
    // Ignore JSON parse errors
    return {};
  }
}

/**
 * Get the items that aren't in `rankedIds`, in a random order that's stable
 * across reloads (stored in localStorage).
 */
export function getStableUnrankedOrder({
  rankedIds = new Set(),
}: { rankedIds?: Set<number> } = {}): RankingItem[] {
  const allUnranked = allItems.filter((item) => !rankedIds.has(item.id));
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
  const remainingItems = [...allUnrankedIdsSet].map((id) => itemsById.get(id)!);
  shuffle(remainingItems);
  unranked.push(...remainingItems);

  // Store order so it's stable across reloads
  // This is so people can take breaks and come back to ranking.
  const idsToStore = unranked.map((item) => item.id);
  localStorage.setItem('unranked', JSON.stringify(idsToStore));

  return unranked;
}

export function useRankingSignals(user: User): {
  rankedItems: Signal<RankingItem[]>;
  unrankedItems: Signal<RankingItem[]>;
  /** Mutated in place, and saved along with the ranking. */
  pairAnswers: PairAnswers;
} {
  const initialRankingIds = useMemo<number[]>(() => {
    const { ranking } = getUnsavedData();
    return Array.isArray(ranking) ? ranking : user.rankings;
  }, [user.rankings]);

  const initialRankedItems = useMemo<RankingItem[]>(() => {
    return initialRankingIds
      .map((id) => itemsById.get(id))
      .filter((item): item is RankingItem => item !== undefined);
  }, [initialRankingIds]);

  const [pairAnswers] = useState<PairAnswers>(() => {
    const { pairAnswers } = getUnsavedData();
    const answers = answersFromList(
      Array.isArray(pairAnswers) ? pairAnswers : user.pairAnswers,
    );

    // Queue answers from before they were saved to the server. The ranker
    // saves unsaved data on load.
    if (takeLegacyAnswers(answers)) {
      localStorage.setItem(
        'unsavedRanking',
        JSON.stringify({
          ranking: initialRankingIds,
          pairAnswers: answersToList(answers),
        }),
      );
    }

    return answers;
  });

  const initialUnrankedItems = useMemo<RankingItem[]>(
    () => getStableUnrankedOrder({ rankedIds: new Set(user.rankings) }),
    [user.rankings],
  );

  const rankedItems = useSignal<RankingItem[]>(initialRankedItems);
  const unrankedItems = useSignal<RankingItem[]>(initialUnrankedItems);

  return { rankedItems, unrankedItems, pairAnswers };
}
