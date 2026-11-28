/**
 * Requests the server rendering of each named test fixture once, so that a
 * test's own request finds the fixture's SSR module graph compiled. The first
 * rendering compiles that whole graph, which takes seconds on a busy runner:
 * call this from a `beforeAll` hook, outside any test's timeout.
 * @note Impure: performs requests.
 */
export default async function warmFixtures(...names: string[]): Promise<void> {
  for (const name of names) await (await fetch(`/__ssr/${name}`)).text();
}
