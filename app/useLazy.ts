import { useEffect, useMemo, useRef } from 'preact/hooks';

type Result<T> =
  | { settled: false }
  | { settled: true; value: T }
  | { settled: true; error: Error };

export function useLazy<T>(promiseFunc: () => Promise<T>): {
  read: () => T;
} {
  const resultRef = useRef<Result<T>>({
    settled: false,
  });
  const promise = useMemo(() => promiseFunc(), []);

  useEffect(() => {
    promise.then(
      (val) => {
        resultRef.current = { settled: true, value: val };
      },
      (err) => {
        resultRef.current = { settled: true, error: err as Error };
      }
    );
  }, []);

  return {
    read() {
      const result = resultRef.current;
      if (!result.settled) throw promise;
      if ('error' in result) throw result.error;
      return result.value;
    },
  };
}
