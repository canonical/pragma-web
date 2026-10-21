/**
 * Round to a tenth of a px. Well positions are computed identically on the
 * server and the client, and settling every coordinate keeps the server
 * markup byte-equal across engines.
 *
 * @param value - A coordinate, in px.
 * @returns The coordinate rounded to one decimal place.
 */
export default function settle(value: number): number {
  return Math.round(value * 10) / 10;
}
