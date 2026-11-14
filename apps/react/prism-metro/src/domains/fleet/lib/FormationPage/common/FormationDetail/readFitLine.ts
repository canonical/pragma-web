/**
 * Read the line a platform fit names, by its code, among the formation's
 * lines. The fits are measured over those same lines, so every fit's code
 * is among them.
 *
 * @param lines - The formation's lines, by code.
 * @param code - The fit's line code.
 * @returns The line with that code.
 * @throws When no line has the code, which the shared source rules out.
 */
export default function readFitLine<TLine>(
  lines: ReadonlyMap<string, TLine>,
  code: string,
): TLine {
  const line = lines.get(code);
  if (line === undefined) {
    throw new Error(`no line of the formation has the code ${code}`);
  }
  return line;
}
