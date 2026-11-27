/** Formats a byte limit for a constraint message. */
function formatLimit(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
}

/**
 * Checks a file selection against the field's `maxFiles` and `maxSize` limits
 * and returns the message for the first violation, or `undefined`.
 * @note Pure.
 */
export default function validateFileConstraints(
  files: readonly File[],
  maxFiles: number | undefined,
  maxSize: number | undefined,
): string | undefined {
  if (maxFiles !== undefined && files.length > maxFiles)
    return `You can upload at most ${maxFiles} file${maxFiles === 1 ? "" : "s"}.`;
  const tooBig =
    maxSize === undefined
      ? undefined
      : files.find((file) => file.size > maxSize);
  return tooBig && maxSize !== undefined
    ? `${tooBig.name} exceeds ${formatLimit(maxSize)}.`
    : undefined;
}
