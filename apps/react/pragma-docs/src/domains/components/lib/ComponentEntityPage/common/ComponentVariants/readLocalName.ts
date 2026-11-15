/**
 * The last dot-separated segment of a design-system address, the name a
 * published component's prop takes for it:
 * `https://ds.canonical.com/global.modifier.primary` reads `primary`.
 */
export default function readLocalName(address: string): string {
  return address.slice(address.lastIndexOf(".") + 1);
}
