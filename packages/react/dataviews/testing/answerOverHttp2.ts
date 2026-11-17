import { onTestFinished, vi } from "vitest";

/**
 * Hand a source the mock server's answers as fetch reads them over HTTP/2,
 * with no status text, for the length of one test. The mock server answers
 * fetch in Node over HTTP/1.1, where a status with no standard text is given
 * the reason "unknown"; over HTTP/2 there is no reason to give, so the
 * status text a source reads is empty.
 *
 * @note Impure: wraps the global fetch until the test finishes.
 */
export default function answerOverHttp2(): void {
  const fetchOverHttp1 = globalThis.fetch;
  const fetches = vi
    .spyOn(globalThis, "fetch")
    .mockImplementation(async (input, init) => {
      const answer = await fetchOverHttp1(input, init);
      return new Response(answer.body, {
        status: answer.status,
        headers: answer.headers,
      });
    });
  onTestFinished(() => {
    fetches.mockRestore();
  });
}
