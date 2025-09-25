type Result<T> =
  | { settled: false }
  | { settled: true; value: T }
  | { settled: true; error: Error };

export function lazyCompute<T>(promiseFunc: () => Promise<T>): {
  value: T;
} {
  let result: Result<T> = { settled: false };
  let promise: Promise<T> | null = null;

  return {
    get value() {
      if (!promise) {
        promise = promiseFunc();
        promise.then(
          (val) => {
            result = { settled: true, value: val };
          },
          (err) => {
            result = { settled: true, error: err as Error };
          }
        );
      }

      if (!result.settled) throw promise;
      if ('error' in result) throw result.error;
      return result.value;
    },
  };
}
