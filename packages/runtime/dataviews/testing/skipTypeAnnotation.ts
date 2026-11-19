/**
 * From just past a declaration's `:`, the offset of the `=` that ends its
 * type, or -1 when the declaration ends with no initializer.
 */
export default function skipTypeAnnotation(
  text: string,
  start: number,
): number {
  let depth = 0;
  let i = start;
  while (i < text.length) {
    const c = text.charAt(i);
    if ("({[<".includes(c)) {
      depth += 1;
    } else if (")}]>".includes(c)) {
      // The `>` of a `=>` in a function type closes nothing.
      if (!(c === ">" && text.charAt(i - 1) === "=")) {
        depth -= 1;
      }
    } else if (c === "=" && depth <= 0) {
      const next = text.charAt(i + 1);
      if (next === ">" || next === "=") {
        i += 2;
        continue;
      }
      return i;
    } else if (c === ";" && depth <= 0) {
      return -1;
    }
    i += 1;
  }
  return -1;
}
