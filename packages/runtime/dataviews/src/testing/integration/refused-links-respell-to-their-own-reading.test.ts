/**
 * A followed link written back with its refused keys carried reads as it
 * did, and a destination moved from it reads as the destination, keeping
 * the refusals it carries.
 */

import { describe, expect, it } from "vitest";
import declare from "../../../testing/declare.js";
import respellLink from "../../../testing/respellLink.js";
import listCarriedIssues from "../../lib/provider/listCarriedIssues.js";
import { canonicalizeSlice, type Slice } from "../../lib/query/index.js";
import type { QueryIssue } from "../../lib/result/index.js";
import { createSchema } from "../../lib/schema/index.js";
import type { SourceCapabilities } from "../../lib/source/index.js";
import {
  decodeQuery,
  encodeCarryingQuery,
  isNarrowingIssue,
} from "../../lib/wire/index.js";

const schema = createSchema([
  { field: "status", kind: "choices", options: ["failed", "ready"] },
  { field: "cpu", kind: "number" },
  { field: "gpu", kind: "presence" },
  { field: "name", kind: "text" },
]);

/** A source that executes every filter but a lower bound. */
const NO_LOWER_BOUND = declare({
  filter: {
    status: ["isAny"],
    cpu: ["lte"],
    gpu: ["isSet"],
    name: ["contains"],
  },
});

/** Spellings of one set: an invalid option and a repeat at each ordinal. */
const SET_PARTS: readonly string[] = [
  "status=failed",
  "status=melted",
  "status__isAny=ready",
  "status__isAny__1=failed",
  "status__isAny__1=ready",
  "status__isAny__1=melted",
  "status__isAny__01=melted",
];

/** Spellings of one bound: repeats, mixed ordinals, gaps, refused values. */
const BOUND_PARTS: readonly string[] = [
  "cpu__gte=4",
  "cpu__gte=8",
  "cpu__gte__0=8",
  "cpu__gte__1=4",
  "cpu__gte__1=8",
  "cpu__gte__1=x",
  "cpu__gte__01=8",
  "cpu__gte__2=x",
];

/** Spellings of one presence: its marker, another value and a repeat. */
const PRESENCE_PARTS: readonly string[] = [
  "gpu__isSet=1",
  "gpu__isSet=yes",
  "gpu__isSet__0=yes",
  "gpu__isSet__1=1",
];

/** Every parameter a link is built from. */
const PARTS: readonly string[] = [
  ...SET_PARTS,
  ...BOUND_PARTS,
  ...PRESENCE_PARTS,
  "q=x",
  "q=y",
  "tab=ex",
];

/** Every ordered list of `size` parts, repeats included, as a link. */
const combine = (parts: readonly string[], size: number): string[] =>
  size === 1
    ? [...parts]
    : combine(parts, size - 1).flatMap((link) =>
        parts.map((part) => `${link}&${part}`),
      );

/** The links of two or three parts that start with `first`. */
const listShortLinks = (first: string): readonly string[] =>
  [...combine(PARTS, 1), ...combine(PARTS, 2)].map(
    (rest) => `${first}&${rest}`,
  );

/** Each field's spellings, of which every link of four parts is built. */
const FIELD_PARTS: readonly (readonly [string, readonly string[]])[] = [
  ["a set", SET_PARTS],
  ["a bound", BOUND_PARTS],
  ["a presence", PRESENCE_PARTS],
];

/** Destinations a control leads to from a link's query. */
const DESTINATIONS: readonly ((slice: Slice) => Slice)[] = [
  (slice) => ({
    ...slice,
    filter: [
      ...slice.filter,
      { field: "name", operator: "contains", operands: ["ex"] },
    ],
  }),
  (slice) => ({ ...slice, search: "z" }),
  (slice) => ({ ...slice, sort: [{ field: "cpu", direction: "desc" }] }),
];

/** Issues in an order a respelling cannot move. */
const sortIssues = (issues: readonly QueryIssue[]): string =>
  JSON.stringify(issues.map((issue) => JSON.stringify(issue)).sort());

/** A slice as canonical text. */
const spellSlice = (slice: Slice): string =>
  JSON.stringify(canonicalizeSlice(slice));

/** The links among `links` whose respelling moves their reading. */
const listMoved = (
  links: readonly string[],
  capabilities: SourceCapabilities | null = null,
): readonly string[] =>
  links.filter((link) => {
    const { decoded, reread } = respellLink(
      schema,
      new URLSearchParams(link),
      capabilities,
    );
    return (
      spellSlice(reread.slice) !== spellSlice(decoded.slice) ||
      sortIssues(reread.issues) !== sortIssues(decoded.issues)
    );
  });

/** The links among `links` a second respelling writes otherwise. */
const listUnstable = (links: readonly string[]): readonly string[] =>
  links.filter((link) => {
    const once = respellLink(schema, new URLSearchParams(link)).written;
    return respellLink(schema, once).written.toString() !== once.toString();
  });

describe("refused links respell to their own reading", () => {
  it.each(PARTS)(
    "keeps the reading of each short link starting %s",
    (first) => {
      expect(listMoved(listShortLinks(first))).toEqual([]);
    },
  );

  it.each(FIELD_PARTS)(
    "keeps the reading of each four-part link on %s",
    (_, parts) => {
      expect(listMoved(combine(parts, 4))).toEqual([]);
    },
  );

  it.each(PARTS)(
    "keeps the reading against a narrower source, starting %s",
    (first) => {
      expect(listMoved(listShortLinks(first), NO_LOWER_BOUND)).toEqual([]);
    },
  );

  it.each(PARTS)(
    "writes each short link starting %s the same twice",
    (first) => {
      expect(listUnstable(listShortLinks(first))).toEqual([]);
    },
  );

  it.each(FIELD_PARTS)(
    "writes each four-part link on %s the same twice",
    (_, parts) => {
      expect(listUnstable(combine(parts, 4))).toEqual([]);
    },
  );

  it("reads a destination as itself, with the refusals it carries", () => {
    const moved = combine(PARTS, 2).flatMap((link) => {
      const params = new URLSearchParams(link);
      const from = decodeQuery({ schema, params });
      const withheld = from.issues.filter(isNarrowingIssue);
      return DESTINATIONS.filter((move) => {
        const to = move(from.slice);
        const carried = listCarriedIssues(withheld, from.slice, to);
        const written = encodeCarryingQuery({
          schema,
          slice: to,
          window: null,
          preserve: params,
          carry: carried.map((issue) => issue.parameter),
          applied: from.slice,
        });
        const reread = decodeQuery({ schema, params: written });
        return (
          spellSlice(reread.slice) !== spellSlice(to) ||
          sortIssues(reread.issues.filter(isNarrowingIssue)) !==
            sortIssues(carried)
        );
      }).map((move) => `${DESTINATIONS.indexOf(move)} ${link}`);
    });
    expect(moved).toEqual([]);
  });
});
