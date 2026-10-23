import { HOME_LENS_MESSAGES } from "../../../../constants.js";
import type { HomeLensName } from "../../../../types.js";

/** Whether the landing has words for the lens named `name`. */
const isHomeLensName = (name: string): name is HomeLensName =>
  Object.hasOwn(HOME_LENS_MESSAGES, name);

/**
 * Assert that a lens the route table declares is one the landing has words
 * for, and name it.
 *
 * @param name - The lens's index route name.
 * @returns The name, typed as a lens of the landing.
 * @throws When the landing has no words for the lens: a lens added to the
 *   table needs its door's copy.
 */
export default function assertHomeLens(name: string): HomeLensName {
  if (!isHomeLensName(name)) {
    throw new Error(
      `The landing has no door for the lens "${name}": add its words to HOME_LENS_MESSAGES.`,
    );
  }
  return name;
}
