export function schulze(candidates: number[], rankings: number[][]) {
  const ballots = rankings.map((ranking) => {
    const candidateToIndex: Record<number, number> = {};
    for (const [index, candidate] of ranking.entries()) {
      candidateToIndex[candidate] = index;
    }

    return candidates.map(
      (candidate) => candidateToIndex[candidate] ?? ranking.length
    );
  });

  const d = Array.from({ length: candidates.length }, () =>
    Array(candidates.length).fill(0)
  );
  const p = Array.from({ length: candidates.length }, () =>
    Array(candidates.length).fill(0)
  );

  // Record preferences for each matchup
  for (const ballot of ballots) {
    for (let i = 0; i < candidates.length; i++) {
      for (let j = 0; j < candidates.length; j++) {
        if (i != j) {
          // For each distinct pair of candidates, record each preference
          if (ballot[i] < ballot[j]) {
            d[i][j]++;
          }
        }
      }
    }
  }

  // Calculate strongest paths (Floyd-Warshall algorithm)

  // Initialize trivial paths
  for (let i = 0; i < candidates.length; i++) {
    for (let j = 0; j < candidates.length; j++) {
      if (i != j) {
        if (d[i][j] > d[j][i]) {
          p[i][j] = d[i][j];
        }
      }
    }
  }

  // Explore alternate paths
  for (let i = 0; i < candidates.length; i++) {
    for (let j = 0; j < candidates.length; j++) {
      if (i != j) {
        for (let k = 0; k < candidates.length; k++) {
          if (i != k && j != k) {
            p[j][k] = Math.max(p[j][k], Math.min(p[j][i], p[i][k]));
          }
        }
      }
    }
  }

  const wins: number[] = Array(candidates.length).fill(0);
  for (let i = 0; i < candidates.length; i++) {
    for (let j = 0; j < candidates.length; j++) {
      if (i !== j && p[i][j] > p[j][i]) {
        wins[i]++;
      }
    }
  }

  return candidates.map(
    (candidate, index) => [candidate, wins[index]] as const
  );
}
