/**
 * Every link the wire grammar reads today keeps its reading: decoded
 * against one collection and its source, each link holds the query and the
 * issues it always held, and the location writes back the parameters it
 * always wrote — carrying what was refused, the host's own parameters in
 * their order with their duplicates. The corpus is the base's own output,
 * so a change to the grammar that moves any of these readings fails here.
 */

import { describe, expect, it } from "vitest";
import {
  LINKS_CAPABILITIES,
  LINKS_COLLECTION,
  LINKS_VALID_TODAY,
} from "../../../testing/index.js";
import {
  decodeQuery,
  encodeCarryingQuery,
  isNarrowingIssue,
} from "../../lib/wire/index.js";

const { schema } = LINKS_COLLECTION;

describe("links valid today read the same", () => {
  it.each(LINKS_VALID_TODAY)("reads ?$params as it always did", (link) => {
    const params = new URLSearchParams(link.params);
    const decoded = decodeQuery({
      schema,
      params,
      capabilities: LINKS_CAPABILITIES,
    });
    expect(decoded.slice).toEqual(link.slice);
    expect(decoded.issues).toEqual(link.issues);
    const written = encodeCarryingQuery({
      schema,
      slice: decoded.slice,
      applied: decoded.slice,
      window: decoded.window,
      preserve: params,
      carry: decoded.issues
        .filter(isNarrowingIssue)
        .map((issue) => issue.parameter),
    });
    expect(written.toString()).toBe(link.encoded);
  });
});
