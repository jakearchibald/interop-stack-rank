import type { FunctionalComponent } from 'preact';
import { useSignal } from '@preact/signals';
import { useMemo } from 'preact/hooks';
import { itemsById } from '../data';
import styles from './styles.module.css';

interface VsProps {
  rankings: number[][];
}

interface ComparisonResult {
  bothRankedCount: number;
  item1RankedCount: number;
  item2RankedCount: number;
  item1WinsCount: number;
  item2WinsCount: number;
}

const VS: FunctionalComponent<VsProps> = ({ rankings }) => {
  const selectedItem1 = useSignal<number | null>(null);
  const selectedItem2 = useSignal<number | null>(null);
  const input1Value = useSignal<string>('');
  const input2Value = useSignal<string>('');

  const items = useMemo(() => [...itemsById.values()], []);

  const comparisonResult = useMemo<ComparisonResult | null>(() => {
    if (selectedItem1.value === null || selectedItem2.value === null) {
      return null;
    }

    const id1 = selectedItem1.value;
    const id2 = selectedItem2.value;

    let bothRankedCount = 0;
    let item1WinsCount = 0;
    let item2WinsCount = 0;
    let item1RankedCount = 0;
    let item2RankedCount = 0;

    for (const ranking of rankings) {
      const index1 = ranking.indexOf(id1);
      const index2 = ranking.indexOf(id2);

      // Count individual appearances
      if (index1 !== -1) {
        item1RankedCount++;
      }
      if (index2 !== -1) {
        item2RankedCount++;
      }

      // Both items must be in this ranking
      if (index1 !== -1 && index2 !== -1) {
        bothRankedCount++;

        // Lower index = higher rank (better position)
        if (index1 < index2) {
          item1WinsCount++;
        } else if (index2 < index1) {
          item2WinsCount++;
        }
      }
    }

    return {
      bothRankedCount,
      item1RankedCount,
      item2RankedCount,
      item1WinsCount,
      item2WinsCount,
    };
  }, [rankings, selectedItem1.value, selectedItem2.value]);

  const handleItem1Change = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const value = input.value;
    input1Value.value = value;

    // Try to parse as number (ID)
    const numValue = Number(value);
    if (!isNaN(numValue) && itemsById.has(numValue)) {
      selectedItem1.value = numValue;
    } else {
      selectedItem1.value = null;
    }
  };

  const handleItem2Change = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const value = input.value;
    input2Value.value = value;

    // Try to parse as number (ID)
    const numValue = Number(value);
    if (!isNaN(numValue) && itemsById.has(numValue)) {
      selectedItem2.value = numValue;
    } else {
      selectedItem2.value = null;
    }
  };

  return (
    <div class={styles.container}>
      <h2>Head-to-Head Comparison</h2>
      <div class={styles.selectors}>
        <div class={styles.selectorGroup}>
          <label htmlFor="item1-input">Proposal 1:</label>
          <input
            id="item1-input"
            type="text"
            list="items-datalist-1"
            placeholder="Search for item…"
            value={input1Value.value}
            onInput={handleItem1Change}
          />
          <datalist id="items-datalist-1">
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                <span
                  dangerouslySetInnerHTML={{
                    __html: itemsById.get(item.id)!.titleHTML,
                  }}
                />{' '}
                #{item.id}
              </option>
            ))}
          </datalist>
        </div>

        <div class={styles.versus}>vs</div>

        <div class={styles.selectorGroup}>
          <label htmlFor="item2-input">Proposal 2:</label>
          <input
            id="item2-input"
            type="text"
            list="items-datalist-1"
            placeholder="Search for item…"
            value={input2Value.value}
            onInput={handleItem2Change}
          />
        </div>
      </div>

      {comparisonResult && (
        <div class={styles.results}>
          <h3>Results</h3>
          <p>
            <strong>
              {selectedItem1.value && (
                <span
                  dangerouslySetInnerHTML={{
                    __html: itemsById.get(selectedItem1.value)!.titleHTML,
                  }}
                />
              )}{' '}
              appears in:
            </strong>{' '}
            {comparisonResult.item1RankedCount}
          </p>
          <p>
            <strong>
              {selectedItem2.value && (
                <span
                  dangerouslySetInnerHTML={{
                    __html: itemsById.get(selectedItem2.value)!.titleHTML,
                  }}
                />
              )}{' '}
              appears in:
            </strong>{' '}
            {comparisonResult.item2RankedCount}
          </p>
          <p>
            <strong>Rankings containing both:</strong>{' '}
            {comparisonResult.bothRankedCount}
          </p>

          {comparisonResult.bothRankedCount > 0 && (
            <div class={styles.winStats}>
              <div class={styles.stat}>
                <span class={styles.label}>
                  {selectedItem1.value && (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: itemsById.get(selectedItem1.value)!.titleHTML,
                      }}
                    />
                  )}{' '}
                  wins:
                </span>
                <span class={styles.value}>
                  {comparisonResult.item1WinsCount} (
                  {(
                    (comparisonResult.item1WinsCount /
                      comparisonResult.bothRankedCount) *
                    100
                  ).toFixed(1)}
                  %)
                </span>
              </div>

              <div class={styles.stat}>
                <span class={styles.label}>
                  {selectedItem2.value && (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: itemsById.get(selectedItem2.value)!.titleHTML,
                      }}
                    />
                  )}{' '}
                  wins:
                </span>
                <span class={styles.value}>
                  {comparisonResult.item2WinsCount} (
                  {(
                    (comparisonResult.item2WinsCount /
                      comparisonResult.bothRankedCount) *
                    100
                  ).toFixed(1)}
                  %)
                </span>
              </div>
            </div>
          )}

          {comparisonResult.bothRankedCount === 0 && (
            <p class={styles.noComparison}>
              These items do not appear together in any rankings.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default VS;
