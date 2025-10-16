import type { FunctionalComponent } from 'preact';
import { useSignal } from '@preact/signals';
import { lazyCompute } from '../../lazyCompute';
import allItems from '../../Ranker/data.json';
import type { RankingItem } from '../../Ranker';
import { useMemo } from 'preact/hooks';
import { schulze } from './schulze';
import styles from './styles.module.css';

type SortKey =
  | 'schulzeWins'
  | 'topChoiceCount'
  | 'rankCount'
  | 'averageRank'
  | 'smallRankingTopChoiceCount';

// import tmpDataURL from './tmp-data.json?url';

export const itemsById = new Map<number, RankingItem>();
for (const item of allItems) itemsById.set(item.id, item);

const candidates = [...itemsById.keys()];

const rankingDataPromise = (async () => {
  const currentURL = new URL(location.href);
  const fetchURL = new URL('/api/ranking-data-anon', currentURL);

  if (currentURL.searchParams.get('key')) {
    fetchURL.searchParams.set('key', currentURL.searchParams.get('key')!);
  }

  const response = await fetch(fetchURL);
  // const response = await fetch(tmpDataURL);
  if (response.status === 403) {
    return { error: 'Unauthorized' };
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

  return (
    <div class={styles.container}>
      <p>Number of rankings: {rankings.length}.</p>
      <table class={styles.resultsTable}>
        <thead>
          <tr>
            <th>Pos</th>
            <th>Issue</th>
            <th>
              <a
                href="?sort=schulzeWins"
                onClick={handleSortClick('schulzeWins')}
              >
                Schulze Wins
              </a>
            </th>
            <th>
              <a
                href="?sort=topChoiceCount"
                onClick={handleSortClick('topChoiceCount')}
              >
                Top Choice Count
              </a>
            </th>
            <th>
              <a
                href="?sort=smallRankingTopChoiceCount"
                onClick={handleSortClick('smallRankingTopChoiceCount')}
              >
                Top Choice Count
              </a>{' '}
              (in rankings of {smallRankingLimit} or fewer)
            </th>
            <th>
              <a href="?sort=rankCount" onClick={handleSortClick('rankCount')}>
                Rank Count
              </a>
            </th>
            <th>
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
    return <p>Error loading results: {rankingData.value.error}</p>;
  }
  return <ResultsList rankings={rankingData.value.data!} />;
};

export default Results;
