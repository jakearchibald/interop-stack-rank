import type { FunctionalComponent } from 'preact';
import { useSignal } from '@preact/signals';
import { lazyCompute } from '../../lazyCompute';
import { useMemo } from 'preact/hooks';
import { schulze } from './schulze';
import styles from './styles.module.css';
import { classes } from '../../utils/classes';
import VS from './VS';
import { itemsById } from './data';

type SortKey =
  | 'schulzeWins'
  | 'topChoiceCount'
  | 'top3ChoiceCount'
  | 'rankCount'
  | 'averageRank'
  | 'smallRankingTopChoiceCount';

// import tmpDataURL from './tmp-data.json?url';

const candidates = [...itemsById.keys()];

const dataFetchURL = (() => {
  const currentURL = new URL(location.href);
  const fetchURL = new URL('/api/ranking-data-anon', currentURL);

  if (currentURL.searchParams.get('key')) {
    fetchURL.searchParams.set('key', currentURL.searchParams.get('key')!);
  }

  return fetchURL.pathname + fetchURL.search;
})();

const rankingDataPromise = (async () => {
  const response = await fetch(dataFetchURL);
  // const response = await fetch(tmpDataURL);
  if (response.status === 403) {
    return { error: 'Unauthorized & no key' };
  }
  if (response.status === 401) {
    return { error: 'Not authorized & no key' };
  }
  const data = (await response.json()) as number[][];
  return { data };
})();

const rankingData = lazyCompute(() => rankingDataPromise);
const smallRankingLimit = 4;

interface ResultData {
  id: number;
  schulzeWins: number;
  topChoiceCount: number;
  top3ChoiceCount: number;
  rankCount: number;
  averageRank: number;
  smallRankingTopChoiceCount: number;
}

const ResultsList: FunctionalComponent<{
  rankings: number[][];
}> = ({ rankings }) => {
  const initialSortKey = useMemo(() => {
    // Get current sort from URL
    const params = new URLSearchParams(window.location.search);
    return (params.get('sort') || 'schulzeWins') as SortKey;
  }, []);

  const sortKey = useSignal<SortKey>(initialSortKey);

  const results: ResultData[] = useMemo(() => {
    const schulzeResults = schulze(candidates, rankings);

    // Calculate stats for each ID
    const topChoiceCounts = new Map<number, number>();
    const top3ChoiceCounts = new Map<number, number>();
    const smallRankingTopChoiceCount = new Map<number, number>();
    const rankCounts = new Map<number, number>();
    const rankSums = new Map<number, number>();
    const validRankCounts = new Map<number, number>(); // For averageRank calculation (excluding single-item rankings)

    for (const ranking of rankings) {
      // Count top choice (first item in ranking)
      const topChoice = ranking[0];
      topChoiceCounts.set(topChoice, (topChoiceCounts.get(topChoice) || 0) + 1);

      if (ranking.length <= smallRankingLimit) {
        smallRankingTopChoiceCount.set(
          topChoice,
          (smallRankingTopChoiceCount.get(topChoice) || 0) + 1
        );
      }

      // For each ID in this ranking
      for (const [i, id] of ranking.entries()) {
        if (i < 3) {
          top3ChoiceCounts.set(id, (top3ChoiceCounts.get(id) || 0) + 1);
        }

        // Count how many rankings this ID appears in
        rankCounts.set(id, (rankCounts.get(id) || 0) + 1);

        // Calculate normalized position for average (0 = first, 1 = last)
        // Only include rankings with more than 1 item
        if (ranking.length > 1) {
          const normalizedPosition = i / (ranking.length - 1);
          rankSums.set(id, (rankSums.get(id) || 0) + normalizedPosition);
          validRankCounts.set(id, (validRankCounts.get(id) || 0) + 1);
        }
      }
    }

    const results: ResultData[] = schulzeResults.map(([id, schulzeWins]) => {
      const validCount = validRankCounts.get(id) || 0;
      return {
        id,
        schulzeWins,
        topChoiceCount: topChoiceCounts.get(id) || 0,
        top3ChoiceCount: top3ChoiceCounts.get(id) || 0,
        smallRankingTopChoiceCount: smallRankingTopChoiceCount.get(id) || 0,
        rankCount: rankCounts.get(id) || 0,
        averageRank: validCount > 0 ? (rankSums.get(id) || 0) / validCount : 0,
      } satisfies ResultData;
    });

    return results;
  }, [rankings]);

  const sortedResults = useMemo(() => {
    const sorted = [...results];

    switch (sortKey.value) {
      case 'schulzeWins':
        sorted.sort((a, b) => b.schulzeWins - a.schulzeWins);
        break;
      case 'topChoiceCount':
        sorted.sort((a, b) => b.topChoiceCount - a.topChoiceCount);
        break;
      case 'top3ChoiceCount':
        sorted.sort((a, b) => b.top3ChoiceCount - a.top3ChoiceCount);
        break;
      case 'rankCount':
        sorted.sort((a, b) => b.rankCount - a.rankCount);
        break;
      case 'averageRank':
        sorted.sort((a, b) => a.averageRank - b.averageRank);
        break;
      case 'smallRankingTopChoiceCount':
        sorted.sort(
          (a, b) => b.smallRankingTopChoiceCount - a.smallRankingTopChoiceCount
        );
        break;
    }

    return sorted;
  }, [results, sortKey.value]);

  const handleSortClick = (key: SortKey) => {
    return (e: Event) => {
      e.preventDefault();
      const url = new URL(location.href);
      url.searchParams.set('sort', key);
      history.replaceState({}, '', url);
      sortKey.value = key;
    };
  };

  const rankingSizeStats = useMemo(() => {
    const sizes = rankings.map((r) => r.length);
    const max = Math.max(...sizes);
    const mean = sizes.reduce((a, b) => a + b, 0) / sizes.length;
    const sorted = [...sizes].sort((a, b) => a - b);
    const median =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];
    return { max, mean, median };
  }, [rankings]);

  return (
    <div class={styles.container}>
      <VS rankings={rankings} />
      <h2>Overall Results</h2>
      <p>Number of rankings: {rankings.length}.</p>
      <p>
        Ranking sizes: max = {rankingSizeStats.max}, mean ={' '}
        {rankingSizeStats.mean.toFixed(2)}, median = {rankingSizeStats.median}.
      </p>
      <p>
        <a href={dataFetchURL}>Raw JSON data</a> - An array of each ranking,
        where the numbers are Interop GitHub issue IDs.
      </p>
      <table class={styles.resultsTable}>
        <thead>
          <tr>
            <th>Pos</th>
            <th>Issue</th>
            <th
              class={classes({
                [styles.selected]: sortKey.value === 'schulzeWins',
              })}
            >
              <a
                href="?sort=schulzeWins"
                onClick={handleSortClick('schulzeWins')}
              >
                Schulze Wins
              </a>
            </th>
            <th
              class={classes({
                [styles.selected]: sortKey.value === 'topChoiceCount',
              })}
            >
              <a
                href="?sort=topChoiceCount"
                onClick={handleSortClick('topChoiceCount')}
              >
                Top Choice Count
              </a>
            </th>
            <th
              class={classes({
                [styles.selected]:
                  sortKey.value === 'smallRankingTopChoiceCount',
              })}
            >
              <a
                href="?sort=smallRankingTopChoiceCount"
                onClick={handleSortClick('smallRankingTopChoiceCount')}
              >
                Top Choice Count
              </a>{' '}
              (in rankings of {smallRankingLimit} or fewer)
            </th>
            <th
              class={classes({
                [styles.selected]: sortKey.value === 'top3ChoiceCount',
              })}
            >
              <a
                href="?sort=top3ChoiceCount"
                onClick={handleSortClick('top3ChoiceCount')}
              >
                Top 3 Count
              </a>
            </th>
            <th
              class={classes({
                [styles.selected]: sortKey.value === 'rankCount',
              })}
            >
              <a href="?sort=rankCount" onClick={handleSortClick('rankCount')}>
                Rank Count
              </a>
            </th>
            <th
              class={classes({
                [styles.selected]: sortKey.value === 'averageRank',
              })}
            >
              <a
                href="?sort=averageRank"
                onClick={handleSortClick('averageRank')}
              >
                Average Rank
              </a>{' '}
              (0=top, 1=bottom)
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedResults.map((result, index) => (
            <tr key={result.id}>
              <td>{index + 1}</td>
              <td>
                <a
                  href={`https://github.com/web-platform-tests/interop/issues/${result.id}`}
                  target="_blank"
                  dangerouslySetInnerHTML={{
                    __html: itemsById.get(result.id)!.titleHTML,
                  }}
                />
              </td>
              <td>{result.schulzeWins}</td>
              <td>{result.topChoiceCount}</td>
              <td>{result.smallRankingTopChoiceCount}</td>
              <td>{result.top3ChoiceCount}</td>
              <td>{result.rankCount}</td>
              <td>{result.averageRank.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Results: FunctionalComponent = () => {
  if (rankingData.value.error) {
    return (
      <div class={styles.container}>
        <p>Error loading results: {rankingData.value.error}</p>
      </div>
    );
  }
  return <ResultsList rankings={rankingData.value.data!} />;
};

export default Results;
