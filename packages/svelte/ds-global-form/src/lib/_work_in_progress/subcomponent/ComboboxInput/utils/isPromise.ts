/** Whether a lookup answered with a promise, so it must be awaited. @note Pure. */
export default function isPromise<T>(
  value: T | Promise<T>,
): value is Promise<T> {
  return value instanceof Promise;
}
