/**
 * A token symbol's name, the path after its namespace:
 * `https://dt.canonical.com/color.text` reads `color.text`.
 */
export default function readSymbolName(symbol: string): string {
  return symbol.slice(symbol.lastIndexOf("/") + 1);
}
