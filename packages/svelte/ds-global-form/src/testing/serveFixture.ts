/**
 * Fetches the server rendering of a test fixture
 * (`src/testing/<name>.fixtures.svelte`) from the test server and places it in
 * a fresh container, ready for edits and hydration.
 * @note Impure: performs a request and appends to the document.
 */
export default async function serveFixture(name: string): Promise<HTMLElement> {
  const response = await fetch(`/__ssr/${name}`);
  const container = document.createElement("div");
  container.innerHTML = await response.text();
  document.body.append(container);
  return container;
}
