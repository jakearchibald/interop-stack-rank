import type { ComponentChildren } from 'preact';
import Wave from './Wave';
import { useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';

type ToastMessage =
  | { type: 'loading'; until: Promise<unknown> }
  | { type: 'saving'; until: Promise<unknown> };

let streamController: ReadableStreamDefaultController<ToastMessage>;

const messageStream = new ReadableStream<ToastMessage>({
  start(controller) {
    streamController = controller;
  },
});

export function pushToastMessage(msg: ToastMessage) {
  streamController.enqueue(msg);
}

export function useToastData() {
  const toast = useSignal<ComponentChildren>(null);
  const showing = useSignal(false);
  let released = false;

  useEffect(() => {
    const reader = messageStream.getReader();

    (async () => {
      try {
        let controller: AbortController | null = null;

        while (true) {
          const { value } = await reader.read();
          if (!value) return;

          if (controller) controller.abort();

          const messageController = new AbortController();
          controller = messageController;

          const showController = new AbortController();
          const hideController = new AbortController();
          messageController.signal.addEventListener('abort', () => {
            showController.abort();
            hideController.abort();
          });

          const message = value.type === 'loading' ? '…Loading…' : '…Saving…';
          toast.value = <Wave msg={message} />;

          if (!showing.value) {
            // Wait 1s before showing loading/saving message
            const timeoutId = setTimeout(() => {
              showing.value = true;
            }, 1000);

            showController.signal.addEventListener('abort', () => {
              clearTimeout(timeoutId);
            });
          }

          value.until
            .then(() => {
              if (showController.signal.aborted) return;
              showController.abort();
              showing.value = false;
            })
            .catch((error) => {
              if (messageController.signal.aborted) {
                return;
              }
              showController.abort();

              if (error instanceof Error && error.name !== 'AbortError') {
                toast.value = `Error: ${error.message}`;
                showing.value = true;

                const hideTimeout = setTimeout(() => {
                  showing.value = false;
                }, 100_000);

                hideController.signal.addEventListener('abort', () => {
                  clearTimeout(hideTimeout);
                });
              }
            });
        }
      } catch (error) {
        if (released) return;
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error('Error in toast message stream:', error);
      }
    })();

    return () => {
      released = true;
      reader.releaseLock();
    };
  }, []);

  return { toast, showing };
}
