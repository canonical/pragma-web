/** Whether a lookup answered with a promise, so it must be awaited. */
function isPromise<T>(value: T | Promise<T>): value is Promise<T> {
  return value instanceof Promise;
}

export default isPromise;
