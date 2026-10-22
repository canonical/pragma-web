import { NETWORK_ADDRESS_PARAM } from "../constants.js";

/**
 * Read a network route's address param off a route match, asserting its
 * shape at the one boundary where params are `unknown`-typed records.
 *
 * @param params - The matched route params, percent-decoded.
 * @returns The line's or station's address, compact or absolute.
 * @throws When the param is missing, not a string, or empty.
 */
export default function readAddressParam(
  params: Readonly<Record<string, unknown>>,
): string {
  const address = params[NETWORK_ADDRESS_PARAM];
  if (typeof address !== "string" || address.length === 0) {
    throw new Error(
      `network :${NETWORK_ADDRESS_PARAM} param must be a non-empty string`,
    );
  }
  return address;
}
