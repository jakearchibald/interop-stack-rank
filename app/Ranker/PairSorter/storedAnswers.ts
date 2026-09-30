const storageKey = 'pairSorterAnswers';

/** Maps a pair key to the ID of the preferred item. */
export type PairAnswers = Map<string, number>;

function pairKey(idA: number, idB: number): string {
  return idA < idB ? `${idA}-${idB}` : `${idB}-${idA}`;
}

export function loadAnswers(): PairAnswers {
  const answers: PairAnswers = new Map();

  try {
    const data = JSON.parse(localStorage.getItem(storageKey) ?? '{}');
    for (const [key, preferredId] of Object.entries(data)) {
      if (typeof preferredId === 'number') answers.set(key, preferredId);
    }
  } catch {
    // Ignore JSON parse errors
  }

  return answers;
}

export function saveAnswer(
  answers: PairAnswers,
  preferredId: number,
  otherId: number
): void {
  answers.set(pairKey(preferredId, otherId), preferredId);
  localStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(answers)));
}

export function removeAnswer(
  answers: PairAnswers,
  idA: number,
  idB: number
): void {
  answers.delete(pairKey(idA, idB));
  localStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(answers)));
}

export function clearAnswers(answers: PairAnswers): void {
  answers.clear();
  localStorage.removeItem(storageKey);
}

/**
 * Whether `itemId` was preferred over `otherId`, or undefined if the pair
 * hasn't been answered.
 */
export function getAnswer(
  answers: PairAnswers,
  itemId: number,
  otherId: number
): boolean | undefined {
  const preferredId = answers.get(pairKey(itemId, otherId));
  if (preferredId === undefined) return undefined;
  return preferredId === itemId;
}

/**
 * Creates a lookup of whether `itemId` is preferred over `otherId`, or
 * undefined if it isn't known. As well as direct answers, this includes answers
 * implied by transitivity (if A beats B, and B beats C, then A beats C), since
 * a sort only asks enough questions to determine the order this way.
 *
 * Answers may contradict each other. In that case, direct answers are used, and
 * contradicting inferences are treated as unknown.
 */
export function createAnswerLookup(
  answers: PairAnswers,
  ids: number[],
): (itemId: number, otherId: number) => boolean | undefined {
  const idSet = new Set(ids);
  // For each item, the items it's directly preferred over.
  const beats = new Map<number, number[]>(ids.map((id) => [id, []]));

  for (const [key, preferredId] of answers) {
    const [idA, idB] = key.split('-').map(Number);
    if (!idSet.has(idA) || !idSet.has(idB)) continue;
    beats.get(preferredId)!.push(preferredId === idA ? idB : idA);
  }

  // For each item, every item it's directly or indirectly preferred over.
  const reachable = new Map<number, Set<number>>();

  for (const id of ids) {
    const seen = new Set<number>();
    const stack = [...beats.get(id)!];
    let next;

    while ((next = stack.pop()) !== undefined) {
      if (seen.has(next)) continue;
      seen.add(next);
      stack.push(...beats.get(next)!);
    }

    reachable.set(id, seen);
  }

  return (itemId, otherId) => {
    const direct = getAnswer(answers, itemId, otherId);
    if (direct !== undefined) return direct;

    const itemBeatsOther = reachable.get(itemId)?.has(otherId) ?? false;
    const otherBeatsItem = reachable.get(otherId)?.has(itemId) ?? false;
    if (itemBeatsOther === otherBeatsItem) return undefined;
    return itemBeatsOther;
  };
}

/** Whether any answers relate to a pair within `ids`. */
export function hasAnswersFor(answers: PairAnswers, ids: number[]): boolean {
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      if (answers.has(pairKey(ids[i], ids[j]))) return true;
    }
  }
  return false;
}
