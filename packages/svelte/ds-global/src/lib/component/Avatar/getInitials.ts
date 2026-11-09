export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter((word) => word.length > 0)
    .slice(0, 2)
    .map((word) => word.at(0))
    .join("");
}
