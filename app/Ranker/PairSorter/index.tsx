import { type FunctionComponent } from 'preact';
import { useEffect, useMemo, useRef } from 'preact/hooks';
import { useComputed, useSignal } from '@preact/signals';
import type { RankingItem } from '../index';
import * as styles from './styles.module.css';
import * as rootStyles from '../../styles.module.css';
import * as utilStyles from '../../utils.module.css';
import {
  answerComparison,
  createSortState,
  estimateUnknownQuestions,
  getComparison,
  getOrder,
  getRemainingQuestions,
  type KnownAnswer,
  type SortState,
  skipKnownComparisons,
} from './binaryInsertionSort';
import {
  clearAnswers,
  getAnswer,
  hasAnswersFor,
  loadAnswers,
  removeAnswer,
  saveAnswer,
} from './storedAnswers';
import { viewTransitionWithTypes } from '../../utils/viewTransition';

interface Props {
  items: RankingItem[];
  onReorder: (items: RankingItem[]) => void;
  onClose: () => void;
}

/** Whether the item being placed is preferred, or 'same' if it's a tie. */
type Response = boolean | 'same';

const PairSorter: FunctionComponent<Props> = ({
  items,
  onReorder,
  onClose,
}) => {
  // Only the initial items are used. The parent closes the sorter if the
  // ranking is changed by other means.
  const state = useSignal(createSortState(items));
  const answers = useMemo(loadAnswers, []);
  const offerReuse = useMemo(
    () =>
      hasAnswersFor(
        answers,
        items.map((item) => item.id),
      ),
    [],
  );
  const phase = useSignal<'reuse-prompt' | 'sorting'>(
    offerReuse ? 'reuse-prompt' : 'sorting',
  );
  const reusing = useSignal(false);
  const questionsAnswered = useSignal(0);
  /** States before each answered question, for undo. */
  const history = useSignal<SortState<RankingItem>[]>([]);
  const firstChoiceRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Pairs are never compared twice within a sort, so this only finds answers
  // from previous sorts. If the user chose to start over, there are none.
  const getKnownAnswer: KnownAnswer<RankingItem> = (item, other) =>
    getAnswer(answers, item.id, other.id);

  const comparison = useComputed(() => getComparison(state.value));

  const choices = useComputed(() => {
    if (!comparison.value) return null;
    const { item, other } = comparison.value;
    const pair = [
      { item, preferred: true },
      { item: other, preferred: false },
    ];
    // The item being placed stays on the same side for all its questions, but
    // the side alternates between items, to avoid a bias towards one option.
    return state.value.sorted.length % 2 === 0 ? pair : pair.reverse();
  });

  const remaining = useComputed(() => {
    // Without previous answers, the number of questions can be calculated.
    if (!reusing.value) return getRemainingQuestions(state.value);
    // Otherwise, it depends on which pairs come up, so it's simulated.
    return estimateUnknownQuestions(state.value, getKnownAnswer);
  });

  const progress = useComputed(() => {
    const answered = questionsAnswered.value;
    const { min, max, expected } = remaining.value;
    const exact = min === max;
    const estimatedTotal = Math.max(
      answered + 1,
      answered + Math.round(exact ? max : expected),
    );
    return { answered, exact, estimatedTotal };
  });

  const answer = (response: Response) => {
    if (phase.value !== 'sorting') return;
    const answeredState = state.value;
    const answeredComparison = getComparison(answeredState);
    if (!answeredComparison) return;

    viewTransitionWithTypes(['pair-sorter-answer'], () => {
      // Ignore answers to a question that's already been replaced, which can
      // happen with quick key presses while a transition is starting.
      if (state.value !== answeredState) return;

      const { item, other } = answeredComparison;
      // Either order is fine for a tie. It isn't saved, so it's asked again in
      // future sorts, rather than becoming a firm answer.
      const itemPreferred =
        response === 'same' ? Math.random() < 0.5 : response;

      if (response === true) saveAnswer(answers, item.id, other.id);
      else if (response === false) saveAnswer(answers, other.id, item.id);

      history.value = [...history.value, answeredState];
      questionsAnswered.value++;
      state.value = skipKnownComparisons(
        answerComparison(answeredState, itemPreferred),
        getKnownAnswer,
      );
      onReorder(getOrder(state.value));
    });
  };

  const undo = () => {
    const previousState = history.value.at(-1);
    if (phase.value !== 'sorting' || !previousState) return;
    const undoneState = state.value;

    viewTransitionWithTypes(['pair-sorter-undo'], () => {
      if (state.value !== undoneState) return;

      // Known answers are skipped, so this pair had no saved answer before the
      // question was asked.
      const { item, other } = getComparison(previousState)!;
      removeAnswer(answers, item.id, other.id);

      history.value = history.value.slice(0, -1);
      questionsAnswered.value--;
      state.value = previousState;
      onReorder(getOrder(previousState));
    });
  };

  const chooseReuse = (reuse: boolean) => {
    if (phase.value !== 'reuse-prompt') return;

    viewTransitionWithTypes(['pair-sorter-answer'], () => {
      if (reuse) {
        reusing.value = true;
        state.value = skipKnownComparisons(state.value, getKnownAnswer);
        onReorder(getOrder(state.value));
      } else {
        clearAnswers(answers);
      }
      phase.value = 'sorting';
    });
  };

  // Undoing from the done state brings the choices back, so they need focus
  // again.
  useEffect(() => {
    const ref = comparison.value ? firstChoiceRef : closeRef;
    ref.current?.focus({ preventScroll: true });
  }, [phase.value, !comparison.value]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLElement &&
        event.target.closest('input, textarea, select, [contenteditable]')
      ) {
        return;
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        !event.shiftKey &&
        !event.altKey &&
        event.key.toLowerCase() === 'z'
      ) {
        event.preventDefault();
        undo();
        return;
      }

      if (event.ctrlKey || event.metaKey || event.altKey) return;

      if (event.key === '1' || event.key === '2') {
        const choice = choices.value?.[Number(event.key) - 1];
        if (!choice) return;
        event.preventDefault();
        answer(choice.preferred);
      } else if (event.key === '3') {
        event.preventDefault();
        answer('same');
      } else if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    addEventListener('keydown', onKeyDown);
    return () => removeEventListener('keydown', onKeyDown);
  });

  if (phase.value === 'reuse-prompt') {
    return (
      <div class={styles.pairSorter}>
        <h3 class={styles.question}>Re-use your previous answers?</h3>
        <p class={styles.promptText}>
          You've compared some of these before. Re-using those answers means
          fewer questions, but it may clash with any manual reordering you've
          done since then.
        </p>
        <div class={styles.actions}>
          <div class={styles.promptChoices}>
            <button
              ref={firstChoiceRef}
              class={`${rootStyles.button} ${styles.primaryButton}`}
              onClick={() => chooseReuse(true)}
            >
              Yes
            </button>
            <button
              class={`${rootStyles.button} ${styles.dangerButton}`}
              onClick={() => chooseReuse(false)}
            >
              Start over
            </button>
          </div>
          <button
            class={`${rootStyles.button} ${styles.secondaryButton}`}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const canUndo = history.value.length > 0;

  // aria-disabled rather than disabled, so focus isn't lost when the last
  // answer is undone.
  const undoButton = (
    <button
      class={`${rootStyles.button} ${styles.secondaryButton}`}
      aria-disabled={canUndo ? undefined : 'true'}
      aria-keyshortcuts="Control+Z Meta+Z"
      onClick={undo}
    >
      Undo
    </button>
  );

  if (!choices.value) {
    return (
      <div class={styles.pairSorter}>
        <p class={styles.doneMessage} role="status">
          {questionsAnswered.value === 0
            ? 'All done! Your previous answers put your ranking in order.'
            : `All done! Your ranking is in order, after ${
                questionsAnswered.value
              } ${questionsAnswered.value === 1 ? 'question' : 'questions'}. `}
          You can still reorder your items manually if you wish.
        </p>
        <div class={styles.actions}>
          <div class={styles.actionButtons}>
            {canUndo && undoButton}
            <button
              ref={closeRef}
              class={`${rootStyles.button} ${styles.secondaryButton}`}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { answered, exact, estimatedTotal } = progress.value;

  return (
    <div class={styles.pairSorter}>
      <div class={styles.header}>
        <h3 class={styles.question}>Which is more important to you?</h3>
        <p class={styles.progressText}>
          Question {answered + 1} of {exact ? '' : '~'}
          {estimatedTotal}
        </p>
      </div>
      {/* The choice buttons change content without a focus change, so the new
          pair is announced here. */}
      <p class={utilStyles.srOnly} aria-live="polite">
        Question {answered + 1} of {exact ? '' : 'about '}
        {estimatedTotal}:{' '}
        <span
          dangerouslySetInnerHTML={{ __html: choices.value[0].item.titleHTML }}
        />
        , or{' '}
        <span
          dangerouslySetInnerHTML={{ __html: choices.value[1].item.titleHTML }}
        />
        ?
      </p>
      <progress
        class={styles.progress}
        value={answered}
        max={estimatedTotal}
        aria-label="Sorting progress"
      />
      <div class={styles.choices}>
        {choices.value.map(({ item, preferred }, index) => (
          <button
            key={index}
            ref={index === 0 ? firstChoiceRef : undefined}
            class={styles.choice}
            onClick={() => answer(preferred)}
          >
            <kbd class={styles.shortcut}>{index + 1}</kbd>
            <span class={styles.choiceText}>
              <span
                class={styles.choiceTitle}
                dangerouslySetInnerHTML={{ __html: item.titleHTML }}
              />
              {item.subtitleHTML && (
                <span
                  class={styles.choiceSubtitle}
                  dangerouslySetInnerHTML={{ __html: item.subtitleHTML }}
                />
              )}
            </span>
          </button>
        ))}
      </div>
      <button class={styles.sameChoice} onClick={() => answer('same')}>
        <kbd class={styles.shortcut}>3</kbd>
        About the same
      </button>
      <div class={styles.actions}>
        <p class={styles.hint}>
          <span class={styles.keyboardHint}>
            Press <kbd>1</kbd>, <kbd>2</kbd>, or <kbd>3</kbd> to choose.{' '}
          </span>
          Changes are saved as you go.
        </p>
        <div class={styles.actionButtons}>
          {undoButton}
          <button
            class={`${rootStyles.button} ${styles.secondaryButton}`}
            onClick={onClose}
          >
            Stop here
          </button>
        </div>
      </div>
    </div>
  );
};

export default PairSorter;
