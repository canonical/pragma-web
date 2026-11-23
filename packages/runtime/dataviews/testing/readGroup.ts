/** The text a match's capture group read, or a failure when it read none. */
export default function readGroup(
  match: RegExpExecArray,
  index: number,
): string {
  const group = match.at(index);
  if (group === undefined) {
    throw new Error(`expected capture group ${index} in "${match.at(0)}"`);
  }
  return group;
}
