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

/** Whether any answers relate to a pair within `ids`. */
export function hasAnswersFor(answers: PairAnswers, ids: number[]): boolean {
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      if (answers.has(pairKey(ids[i], ids[j]))) return true;
    }
  }
  return false;
}
