import type { SourceCapabilities } from "../src/lib/source/index.js";
import { NOTHING_DECLARED } from "./fixtures.js";

/** `NOTHING_DECLARED` with the named members replaced. */
export default function declare(
  overrides: Partial<SourceCapabilities>,
): SourceCapabilities {
  return { ...NOTHING_DECLARED, ...overrides };
}
