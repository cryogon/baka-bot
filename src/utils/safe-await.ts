export async function safeAwait<T extends any[], R = any>(
  promise: (...args: T) => Promise<R>,
  ...args: T
): Promise<[null, R] | [unknown, null]> {
  try {
    const result = await promise(...args);
    return [null, result];
  } catch (err) {
    return [err, null];
  }
}
