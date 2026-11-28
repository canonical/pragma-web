import { onTestFinished } from "vitest";

/**
 * Fetches the server rendering of a test fixture
 * (`src/testing/<name>.fixtures.svelte`) from the test server and places it in
 * a fresh container, ready for edits and hydration. The container leaves the
 * document when the test finishes, even when the test fails or times out, so
 * its markup and IDs never reach a later test.
 * @note Impure: performs a request and appends to the document.
 */
export default async function serveFixture(name: string): Promise<HTMLElement> {
  const container = document.body.appendChild(document.createElement("div"));
  onTestFinished(() => container.remove());
  const response = await fetch(`/__ssr/${name}`);
  container.innerHTML = await response.text();
  return container;
}
