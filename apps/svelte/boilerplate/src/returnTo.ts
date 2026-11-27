/** Return to the referring page only when it is on this origin. */
export function returnTo(referer: string | null, origin: string): string {
  if (!referer) return "/";
  try {
    const previous = new URL(referer);
    return previous.origin === origin ? previous.href : "/";
  } catch {
    return "/";
  }
}
