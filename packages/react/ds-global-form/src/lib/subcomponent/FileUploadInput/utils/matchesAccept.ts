/**
 * Whether a file matches an `accept` list, by the rules of the native
 * `accept` attribute: a `.ext` entry matches the end of the file name, a
 * `type/*` entry matches the start of the MIME type, and any other entry
 * matches the MIME type exactly. Matching ignores case. An empty list accepts
 * every file.
 * @note Pure.
 */
export default function matchesAccept(file: File, accept: string): boolean {
  const entries = accept
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  if (entries.length === 0) return true;
  const fileName = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return entries.some((entry) => {
    if (entry.startsWith(".")) return fileName.endsWith(entry);
    if (entry.endsWith("/*")) return type.startsWith(entry.slice(0, -1));
    return type === entry;
  });
}
