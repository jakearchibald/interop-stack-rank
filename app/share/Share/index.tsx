import type { ComponentChildren, FunctionalComponent } from 'preact';
import { useSignal } from '@preact/signals';
import { useRef } from 'preact/hooks';
import type { User } from '../../../shared/user-data';
import { socialImageVersion } from '../../../shared/share';
import { rankingToHTML, rankingToMarkdown } from './formatList';
import { classes } from '../../utils/classes';
import { lazyCompute } from '../../lazyCompute';
import * as rootStyles from '../../styles.module.css';
import * as styles from './styles.module.css';

type CopyStatus = 'idle' | 'copied' | 'error';

/** How long "Copied" is shown on a button. */
const copiedDuration = 2000;

/** A button that copies to the clipboard, and reports how it went. */
const CopyButton: FunctionalComponent<{
  onCopy: () => Promise<void>;
  /**
   * Other labels the button may have, so it doesn't change size if the label
   * changes.
   */
  sizeTo?: ComponentChildren;
}> = ({ onCopy, sizeTo, children }) => {
  const status = useSignal<CopyStatus>('idle');
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const onClick = async () => {
    clearTimeout(timeout.current);

    try {
      await onCopy();
      status.value = 'copied';
    } catch (error) {
      console.error(error);
      status.value = 'error';
    }

    timeout.current = setTimeout(() => {
      status.value = 'idle';
    }, copiedDuration);
  };

  // All labels are stacked in the same grid cell, so the button is sized to
  // the largest, and doesn't change size when the label changes.
  const labels: [CopyStatus, ComponentChildren][] = [
    ['idle', children],
    ['copied', '✓ Copied'],
    ['error', "Couldn't copy"],
  ];

  return (
    <button
      class={`${rootStyles.button} ${rootStyles.neutralButton} ${styles.copyButton}`}
      onClick={onClick}
    >
      {labels.map(([labelStatus, label]) => (
        <span
          key={labelStatus}
          class={classes({
            [styles.copyLabel]: true,
            [styles.inactive]: labelStatus !== status.value,
          })}
          aria-hidden={labelStatus !== status.value}
        >
          {label}
        </span>
      ))}
      {sizeTo && (
        <span class={`${styles.copyLabel} ${styles.inactive}`} aria-hidden>
          {sizeTo}
        </span>
      )}
    </button>
  );
};

/**
 * Writes text to the clipboard. The text can be a promise, so a fetch can
 * happen without losing the user activation the clipboard requires, which
 * Safari is strict about.
 */
async function writeToClipboard(
  data: Record<string, string | Promise<string>>,
): Promise<void> {
  const blobs = Object.fromEntries(
    Object.entries(data).map(([type, text]) => [
      type,
      Promise.resolve(text).then((t) => new Blob([t], { type })),
    ]),
  );

  await navigator.clipboard.write([new ClipboardItem(blobs)]);
}

/**
 * Gets, creates (POST), or revokes (DELETE) the user's shared ranking URL.
 * Returns null if there isn't one.
 */
async function shareURLRequest(
  method: 'GET' | 'POST' | 'DELETE',
): Promise<string | null> {
  const response = await fetch('/api/share/link', { method });
  if (!response.ok) throw new Error(`${response.status} error`);
  const { path } = (await response.json()) as { path: string | null };
  return path && new URL(path, location.href).href;
}

// Started straight away, in parallel with fetching the user. If the user
// isn't logged in, the URL isn't needed.
const initialShareURL = lazyCompute(() =>
  shareURLRequest('GET').catch(() => null),
);

interface Props {
  user: User;
}

const Share: FunctionalComponent<Props> = ({ user }) => {
  const shareURL = useSignal(initialShareURL.value);
  const revokeError = useSignal(false);
  const revokeDialog = useRef<HTMLDialogElement>(null);

  if (user.rankings.length === 0) {
    return (
      <div class={styles.container}>
        <p>
          You haven't ranked anything yet. <a href="/">Rank some proposals</a>,
          then come back to share them.
        </p>
      </div>
    );
  }

  const imageURL = `/api/share/social.png?v=${socialImageVersion(user)}`;

  const copyShareURL = async () => {
    const urlPromise = shareURLRequest('POST').then((url) => {
      if (!url) throw new Error('No URL returned');
      return url;
    });
    await writeToClipboard({ 'text/plain': urlPromise });
    shareURL.value = await urlPromise;
  };

  const onRevokeDialogClose = async () => {
    if (revokeDialog.current!.returnValue !== 'revoke') return;
    revokeError.value = false;

    try {
      shareURL.value = await shareURLRequest('DELETE');
    } catch (error) {
      console.error(error);
      revokeError.value = true;
    }
  };

  return (
    <div class={styles.container}>
      <p>
        <a href="/">← Back to your ranking</a>
      </p>
      <h2>Share your ranking</h2>
      <p>You can share your ranking directly from this site:</p>
      <div class={styles.buttons}>
        <CopyButton onCopy={copyShareURL}>
          {shareURL.value ? 'Copy ranking URL' : 'Create and copy ranking URL'}
        </CopyButton>
        {shareURL.value && (
          <button
            class={`${rootStyles.button} ${rootStyles.dangerButton}`}
            onClick={() => revokeDialog.current!.showModal()}
          >
            Revoke ranking URL
          </button>
        )}
      </div>
      {shareURL.value && (
        <p class={styles.shareURL}>
          <a href={shareURL.value}>{shareURL.value}</a>
        </p>
      )}
      {revokeError.value && <p>Couldn't revoke the ranking URL.</p>}
      <p>
        But also, at Firefox we love blogs! So if you'd rather write a blog
        post, you can copy your list, and post it along with your own
        commentary:
      </p>
      <div class={styles.buttons}>
        <CopyButton
          onCopy={() => {
            const html = rankingToHTML(user.rankings);
            // Rich text editors use text/html. Plain text fields, such as
            // HTML source editors, get the markup.
            return writeToClipboard({ 'text/html': html, 'text/plain': html });
          }}
        >
          Copy as HTML
        </CopyButton>
        <CopyButton
          onCopy={() =>
            writeToClipboard({
              'text/plain': rankingToMarkdown(user.rankings),
            })
          }
        >
          Copy as Markdown
        </CopyButton>
      </div>
      <p>And here's a social image you can use:</p>
      <img
        class={styles.socialImage}
        src={imageURL}
        alt={`${user.displayName}'s top ranked proposals`}
        width={1200}
        height={630}
      />
      <p>
        <a
          href={imageURL}
          download={`interop-ranking-${user.githubUsername}.png`}
        >
          Download it
        </a>{' '}
        (linking to it won't work).
      </p>

      <dialog
        ref={revokeDialog}
        class={styles.dialog}
        onClose={onRevokeDialogClose}
      >
        <form method="dialog">
          <p>This will break any existing links. Are you sure?</p>
          <div class={styles.buttons}>
            <button
              class={`${rootStyles.button} ${rootStyles.neutralButton}`}
              value="cancel"
              autofocus
            >
              Cancel
            </button>
            <button
              class={`${rootStyles.button} ${rootStyles.dangerButton}`}
              value="revoke"
            >
              Revoke
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
};

export default Share;
