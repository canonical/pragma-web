/**
 * Fixture data for tests: a source declaration that can execute nothing,
 * the pagination kinds a source declares, and a schema with records a
 * facet reads. Each helper that builds a fixture — a page, an answer, a
 * count, a completion, a slice, a display status, a stored view — is a
 * file of its own beside this one.
 */
import { createCollection } from "../src/lib/collection/index.js";

import type { RowRecord } from "../src/lib/rows/index.js";
import { createSchema } from "../src/lib/schema/index.js";
import {
  declareCapabilities,
  type PaginationCapabilities,
  type SourceCapabilities,
} from "../src/lib/source/index.js";
import readId from "./readId.js";

/**
 * A source declaring nothing executable: every request is refused. Built
 * the way a source builds its own, so the fixture and the refusing defaults
 * cannot drift apart; `declareCapabilities.test.ts` pins what they are.
 */
export const NOTHING_DECLARED: SourceCapabilities = declareCapabilities(
  createCollection({ fields: [], identify: readId }),
  {},
);

/** An offset source: any page is reachable by number. */
export const BY_NUMBER: PaginationCapabilities = Object.freeze({
  kind: "offset",
});

/** A forward cursor source: pages are reached only through its tokens. */
export const FORWARD_CURSORS: PaginationCapabilities = Object.freeze({
  kind: "cursor",
  backward: false,
  durable: false,
});

/**
 * A schema with a field of every kind, and records holding each field's
 * values as a facet meets them: listed, unlisted, absent, null and of
 * another type, so each reader's rules for what it counts are exercised.
 */
export const FACETED_SCHEMA = createSchema([
  {
    field: "status",
    kind: "choices",
    options: ["running", "failed", "pending"],
  },
  { field: "cpu", kind: "number" },
  { field: "owner", kind: "presence" },
  { field: "updated", kind: "date" },
  { field: "name", kind: "text" },
]);

export const FACETED_ROWS: readonly RowRecord[] = [
  {
    id: "a",
    status: "running",
    cpu: 4,
    owner: "ex:ada",
    updated: "2026-01-02",
    name: "alpha",
  },
  {
    id: "b",
    status: "failed",
    cpu: 16,
    owner: null,
    updated: "2025-12-31",
    name: "beta",
  },
  {
    id: "c",
    status: "failed",
    cpu: 8,
    updated: new Date("2026-03-01T00:00:00Z"),
    name: "gamma",
  },
  {
    id: "d",
    status: "unlisted",
    cpu: 32,
    owner: false,
    updated: 1_700_000_000_000,
    name: "delta",
  },
  { id: "e", status: true, cpu: "12", name: "epsilon" },
  { id: "g", status: "archived" },
  { id: "f" },
];
