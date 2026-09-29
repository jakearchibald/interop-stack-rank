/**
 * An interactive binary insertion sort.
 *
 * This is used rather than something like merge sort, because every
 * intermediate state is a complete ordering. After each answer, the item being
 * placed moves next to the item it was compared with, so the user sees their
 * ranking improve with each question, and can stop at any point.
 */
export interface SortState<T> {
  /** Items that have been placed, in order. Excludes `current`. */
  sorted: T[];
  /** The item currently being placed, or null if sorting is complete. */
  current: T | null;
  /** Items yet to be placed. */
  pending: T[];
  /** The range of possible insertion indexes (into `sorted`) for `current`. */
  lo: number;
  hi: number;
  /** The index `current` is displayed at within `sorted`. */
  displayIndex: number;
  questionsAsked: number;
}

function startNextItem<T>(
  sorted: T[],
  pending: T[],
  questionsAsked: number
): SortState<T> {
  const [current = null, ...rest] = pending;
  return {
    sorted,
    current,
    pending: rest,
    lo: 0,
    hi: sorted.length,
    displayIndex: sorted.length,
    questionsAsked,
  };
}

export function createSortState<T>(items: T[]): SortState<T> {
  return startNextItem(items.slice(0, 1), items.slice(1), 0);
}

/** The pair to compare next, or null if sorting is complete. */
export function getComparison<T>(
  state: SortState<T>
): { item: T; other: T } | null {
  if (state.current === null) return null;
  return {
    item: state.current,
    other: state.sorted[(state.lo + state.hi) >> 1],
  };
}

export function answerComparison<T>(
  state: SortState<T>,
  itemPreferred: boolean
): SortState<T> {
  if (state.current === null) return state;

  const mid = (state.lo + state.hi) >> 1;
  let { lo, hi } = state;

  if (itemPreferred) {
    hi = mid;
  } else {
    lo = mid + 1;
  }

  // Only move the item if its displayed position contradicts the answer, so it
  // never moves in the opposite direction to the user's choice.
  const displayIndex = Math.min(Math.max(state.displayIndex, lo), hi);

  const questionsAsked = state.questionsAsked + 1;

  if (lo === hi) {
    const sorted = [
      ...state.sorted.slice(0, lo),
      state.current,
      ...state.sorted.slice(lo),
    ];
    return startNextItem(sorted, state.pending, questionsAsked);
  }

  return { ...state, lo, hi, displayIndex, questionsAsked };
}

/** The full current ordering, including the item being placed. */
export function getOrder<T>(state: SortState<T>): T[] {
  if (state.current === null) return state.sorted;
  return [
    ...state.sorted.slice(0, state.displayIndex),
    state.current,
    ...state.sorted.slice(state.displayIndex),
    ...state.pending,
  ];
}

/**
 * Stats for a binary search over `positions` possible positions. The midpoint
 * choice gives a balanced tree, so every search takes floor(log2(n)) or
 * ceil(log2(n)) questions.
 */
function searchCost(positions: number) {
  if (positions <= 1) return { min: 0, max: 0, expected: 0 };
  const min = Math.floor(Math.log2(positions));
  const deepLeaves = 2 * (positions - 2 ** min);
  return {
    min,
    max: deepLeaves === 0 ? min : min + 1,
    // Assuming the correct position is equally likely to be any of them.
    expected: min + deepLeaves / positions,
  };
}

/** Estimates how many questions remain. */
export function getRemainingQuestions<T>(state: SortState<T>): {
  min: number;
  max: number;
  expected: number;
} {
  const total = { min: 0, max: 0, expected: 0 };
  if (state.current === null) return total;

  const add = (positions: number) => {
    const cost = searchCost(positions);
    total.min += cost.min;
    total.max += cost.max;
    total.expected += cost.expected;
  };

  add(state.hi - state.lo + 1);

  for (let i = 0; i < state.pending.length; i++) {
    // Once `current` is placed, the sorted list is one longer, and grows by one
    // for each pending item placed.
    add(state.sorted.length + 2 + i);
  }

  return total;
}

/**
 * Returns whether `item` is preferred over `other`, or undefined if it isn't
 * known.
 */
export type KnownAnswer<T> = (item: T, other: T) => boolean | undefined;

/** Answers comparisons until one isn't known, or sorting is complete. */
export function skipKnownComparisons<T>(
  state: SortState<T>,
  getKnownAnswer: KnownAnswer<T>
): SortState<T> {
  let comparison;

  while ((comparison = getComparison(state))) {
    const known = getKnownAnswer(comparison.item, comparison.other);
    if (known === undefined) break;
    state = answerComparison(state, known);
  }

  return state;
}

/** A small seeded PRNG, so estimates are stable for a given state. */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Creates a random ordering of `items`, consistent with known answers where
 * possible (answers may contradict each other).
 */
function randomConsistentOrder<T>(
  items: T[],
  getKnownAnswer: KnownAnswer<T>,
  rand: () => number
): T[] {
  // For each item, the items it's known to be preferred over.
  const beats = new Map<T, T[]>(items.map((item) => [item, []]));
  // For each item, how many unplaced items are known to be preferred over it.
  const beatenByCount = new Map<T, number>(items.map((item) => [item, 0]));

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const known = getKnownAnswer(items[i], items[j]);
      if (known === undefined) continue;
      const [winner, loser] = known
        ? [items[i], items[j]]
        : [items[j], items[i]];
      beats.get(winner)!.push(loser);
      beatenByCount.set(loser, beatenByCount.get(loser)! + 1);
    }
  }

  const order: T[] = [];
  const remaining = new Set(items);

  while (remaining.size) {
    const candidates = [...remaining].filter(
      (item) => beatenByCount.get(item) === 0
    );
    // If there are none, the answers contain a cycle, so pick anything.
    const pool = candidates.length ? candidates : [...remaining];
    const next = pool[Math.floor(rand() * pool.length)];
    order.push(next);
    remaining.delete(next);

    for (const loser of beats.get(next)!) {
      beatenByCount.set(loser, beatenByCount.get(loser)! - 1);
    }
  }

  return order;
}

/**
 * Estimates how many unknown comparisons remain, by simulating the rest of the
 * sort against random orderings that are consistent with the known answers.
 */
export function estimateUnknownQuestions<T>(
  state: SortState<T>,
  getKnownAnswer: KnownAnswer<T>,
  { runs = 32 }: { runs?: number } = {}
): { min: number; max: number; expected: number } {
  const rand = mulberry32(1);
  const items = getOrder(state);
  let min = Infinity;
  let max = 0;
  let total = 0;

  for (let run = 0; run < runs; run++) {
    const rank = new Map(
      randomConsistentOrder(items, getKnownAnswer, rand).map((item, i) => [
        item,
        i,
      ])
    );
    let simState = state;
    let count = 0;
    let comparison;

    while ((comparison = getComparison(simState))) {
      const { item, other } = comparison;
      let answer = getKnownAnswer(item, other);
      if (answer === undefined) {
        count++;
        answer = rank.get(item)! < rank.get(other)!;
      }
      simState = answerComparison(simState, answer);
    }

    min = Math.min(min, count);
    max = Math.max(max, count);
    total += count;
  }

  return { min, max, expected: total / runs };
}
