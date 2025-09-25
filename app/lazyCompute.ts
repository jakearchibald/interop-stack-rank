export function lazyCompute<T>(promiseFunc: () => Promise<T>): {
  value: T;
} {
  let result: PromiseSettledResult<T> | null = null;
  let promise: Promise<PromiseSettledResult<T>> | null = null;

  return {
    get value() {
      if (!promise) {
        promise = Promise.allSettled([promiseFunc()]).then((r) => r[0]);
        promise.then((r) => (result = r));
      }

      if (!result) throw promise;
      if ('reason' in result) throw result.reason;
      return result.value;
    },
  };
}
