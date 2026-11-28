/**
 * Where a preference form sends the reader back to: the referring page when
 * it is on this origin, the home page otherwise.
 */
export default function resolveReturnTo(
  referer: string | null | undefined,
  origin: string,
): string {
  if (!referer) return "/";

  try {
    const previous = new URL(referer);

    return previous.origin === origin ? previous.href : "/";
  } catch {
    return "/";
  }
}
