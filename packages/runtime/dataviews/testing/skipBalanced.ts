/**
 * The offset just past the bracket that closes the one at `start`, or the
 * text's length when it never closes.
 */
export default function skipBalanced(
  text: string,
  start: number,
  open: string,
  close: string,
): number {
  let depth = 0;
  for (let i = start; i < text.length; i += 1) {
    const c = text.charAt(i);
    if (c === open) {
      depth += 1;
    } else if (c === close) {
      depth -= 1;
      if (depth === 0) {
        return i + 1;
      }
    }
  }
  return text.length;
}
