import type { TestContext } from "vitest";

/**
 * Run the test's failure handlers now, resolving with the messages they
 * threw.
 *
 * @note Impure: runs each handler the test registered through
 * `onTestFailed`.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default async function runFailureHandlers(
  context: TestContext,
): Promise<string[]> {
  const handlers: unknown = Reflect.get(context.task, "onFailed");
  if (!Array.isArray(handlers)) {
    throw new Error("vitest no longer keeps task.onFailed");
  }
  const thrown: string[] = [];
  for (const handler of handlers) {
    try {
      await handler(context);
    } catch (error) {
      thrown.push(error instanceof Error ? error.message : String(error));
    }
  }
  return thrown;
}
