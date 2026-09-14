/**
 * Wait for every answer a stand-in has given to settle. Code that reacts to
 * an answer as it is given has run that reaction by the time this resolves,
 * so a case waits for the answers, never for a duration.
 */
export default async function settleCalls(calls: {
  readonly mock: { readonly results: readonly { readonly value: unknown }[] };
}): Promise<void> {
  await Promise.allSettled(calls.mock.results.map(({ value }) => value));
}
