import spellFrameAddress from "./spellFrameAddress.js";

/**
 * Follow an address the server's markup spells within the frame, so the
 * story renders the page that address leads to. Story-only.
 *
 * @note Impure: navigates the frame.
 */
export default function followInFrame(
  search: string,
  location: Pick<Location, "href" | "assign"> = window.location,
): void {
  location.assign(spellFrameAddress(location.href, search));
}
