import type { FunctionalComponent } from 'preact';
import { lazyCompute } from '../../lazyCompute';
import allItems from '../../Ranker/data.json';
import type { RankingItem } from '../../Ranker';
import { useMemo } from 'preact/hooks';
import { schulze } from './schulze';
import styles from './styles.module.css';

// import tmpDataURL from './tmp-data.json?url';

export const itemsById = new Map<number, RankingItem>();
for (const item of allItems) itemsById.set(item.id, item);

const candidates = [...itemsById.keys()];

const rankingDataPromise = (async () => {
  const response = await fetch('/api/ranking-data-anon');
  // const response = await fetch(tmpDataURL);
  if (response.status === 403) {
    return { error: 'Unauthorized' };
  }
  const data = (await response.json()) as number[][];
  return { data };
})();

const rankingData = lazyCompute(() => rankingDataPromise);

const ResultsList: FunctionalComponent<{
  rankings: number[][];
}> = ({ rankings }) => {
  const results = useMemo(() => schulze(candidates, rankings), [rankings]);
  const rankedCount = useMemo(() => {
    const rankedCount = new Map<number, number>();
    for (const ranking of rankings) {
      for (const rank of ranking) {
        rankedCount.set(rank, (rankedCount.get(rank) || 0) + 1);
      }
    }
    return rankedCount;
  }, [rankings]);

  return (
    <div class={styles.container}>
      <p>Number of rankings: {rankings.length}.</p>
      <ol class={styles.resultsList}>
        {results.map(([id, wins]) => (
          <li key={id}>
            <a
              href={`https://github.com/web-platform-tests/interop/issues/${id}`}
              target="_blank"
              dangerouslySetInnerHTML={{
                __html: itemsById.get(Number(id))!.titleHTML,
              }}
            />
            : {wins} wins. {rankedCount.get(Number(id)) || 0} times ranked.
          </li>
        ))}
      </ol>
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
