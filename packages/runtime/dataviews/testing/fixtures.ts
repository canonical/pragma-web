/**
 * Fixture data for tests: a source declaration that can execute nothing,
 * the pagination kinds a source declares, a schema with records a facet
 * reads, and the links the wire grammar reads today with what each reads
 * as. Each helper that builds a fixture — a page, an answer, a count, a
 * completion, a slice, a display status, a stored view — is a file of its
 * own beside this one.
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
import type { LinkReading } from "./types.js";

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

/** Records of the faceted schema, one of each case a facet reader meets. */
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

/**
 * The collection the link corpus is read against: a field of every kind,
 * a set whose options are the server's, and two fields spelled with a dot
 * path.
 */
export const LINKS_COLLECTION = createCollection({
  fields: [
    {
      field: "status",
      kind: "choices",
      options: ["failed", "ready", "cancelled"],
    },
    { field: "tags", kind: "choices" },
    { field: "cpu", kind: "number", min: 0, max: 64 },
    { field: "memory", kind: "number" },
    { field: "updated", kind: "date" },
    { field: "owner", kind: "presence" },
    { field: "hostname", kind: "text" },
    {
      field: "config.region",
      kind: "choices",
      options: ["ex-east", "ex-west"],
    },
    { field: "config.cores", kind: "number" },
  ],
  identify: readId,
});

/**
 * What the corpus's source declares: every field filterable, but `tags`
 * only as any-of and `hostname` only by `contains`; search over the host
 * name; two sort terms over two fields; no grouping; pages by number.
 */
export const LINKS_CAPABILITIES: SourceCapabilities = declareCapabilities(
  LINKS_COLLECTION,
  {
    filter: {
      status: true,
      tags: ["isAny"],
      cpu: true,
      memory: true,
      updated: true,
      owner: true,
      hostname: ["contains"],
      "config.region": true,
      "config.cores": true,
    },
    search: ["hostname"],
    sort: { fields: ["hostname", "cpu"], terms: 2 },
  },
);

/**
 * Links the wire grammar reads today, each with the query and issues it
 * decodes to against `LINKS_COLLECTION` and `LINKS_CAPABILITIES`, and the
 * parameters the location writes back over it, carrying what was refused.
 * Every entry keeps its reading while the grammar grows.
 */
export const LINKS_VALID_TODAY: readonly LinkReading[] = [
  {
    params: "",
    slice: { filter: [], search: null, sort: [], group: [] },
    issues: [],
    encoded: "page=1&size=50",
  },
  {
    params: "status=failed",
    slice: {
      filter: [{ field: "status", operator: "isAny", operands: ["failed"] }],
      search: null,
      sort: [],
      group: [],
    },
    issues: [],
    encoded: "status=failed&page=1&size=50",
  },
  {
    params: "status=failed&status=ready",
    slice: {
      filter: [
        { field: "status", operator: "isAny", operands: ["failed", "ready"] },
      ],
      search: null,
      sort: [],
      group: [],
    },
    issues: [],
    encoded: "status=failed&status=ready&page=1&size=50",
  },
  {
    params: "status=ready&status=failed&status=ready",
    slice: {
      filter: [
        {
          field: "status",
          operator: "isAny",
          operands: ["ready", "failed", "ready"],
        },
      ],
      search: null,
      sort: [],
      group: [],
    },
    issues: [],
    encoded: "status=failed&status=ready&page=1&size=50",
  },
  {
    params: "status__isAny=failed&status__isAny=ready",
    slice: {
      filter: [
        { field: "status", operator: "isAny", operands: ["failed", "ready"] },
      ],
      search: null,
      sort: [],
      group: [],
    },
    issues: [],
    encoded: "status=failed&status=ready&page=1&size=50",
  },
  {
    params: "status=failed&status__isAny=ready",
    slice: {
      filter: [
        { field: "status", operator: "isAny", operands: ["failed", "ready"] },
      ],
      search: null,
      sort: [],
      group: [],
    },
    issues: [],
    encoded: "status=failed&status=ready&page=1&size=50",
  },
  {
    params: "status__isNone=cancelled",
    slice: {
      filter: [
        { field: "status", operator: "isNone", operands: ["cancelled"] },
      ],
      search: null,
      sort: [],
      group: [],
    },
    issues: [],
    encoded: "status__isNone=cancelled&page=1&size=50",
  },
  {
    params: "status=failed&status__isNone=cancelled",
    slice: {
      filter: [
        { field: "status", operator: "isAny", operands: ["failed"] },
        { field: "status", operator: "isNone", operands: ["cancelled"] },
      ],
      search: null,
      sort: [],
      group: [],
    },
    issues: [],
    encoded: "status=failed&status__isNone=cancelled&page=1&size=50",
  },
  {
    params: "cpu__gte=4",
    slice: {
      filter: [{ field: "cpu", operator: "gte", operands: [4] }],
      search: null,
      sort: [],
      group: [],
    },
    issues: [],
    encoded: "cpu__gte=4&page=1&size=50",
  },
  {
    params: "cpu__lte=32&cpu__gte=4",
    slice: {
      filter: [
        { field: "cpu", operator: "lte", operands: [32] },
        { field: "cpu", operator: "gte", operands: [4] },
      ],
      search: null,
      sort: [],
      group: [],
    },
    issues: [],
    encoded: "cpu__gte=4&cpu__lte=32&page=1&size=50",
  },
  {
    params: "cpu__gte=4&cpu__gte=8",
    slice: {
      filter: [{ field: "cpu", operator: "gte", operands: [4] }],
      search: null,
      sort: [],
      group: [],
    },
    issues: [
      {
        parameter: "cpu__gte",
        field: "cpu",
        code: "malformed",
        reason: '"cpu__gte" takes one value; the extra values were ignored',
      },
    ],
    encoded: "cpu__gte=4&cpu__gte=8&page=1&size=50",
  },
  {
    params: "hostname__contains=ex&hostname__contains=web",
    slice: {
      filter: [{ field: "hostname", operator: "contains", operands: ["ex"] }],
      search: null,
      sort: [],
      group: [],
    },
    issues: [
      {
        parameter: "hostname__contains",
        field: "hostname",
        code: "malformed",
        reason:
          '"hostname__contains" takes one value; the extra values were ignored',
      },
    ],
    encoded: "hostname__contains=ex&hostname__contains=web&page=1&size=50",
  },
  {
    params: "hostname__startsWith=ex",
    slice: { filter: [], search: null, sort: [], group: [] },
    issues: [
      {
        parameter: "hostname__startsWith",
        field: "hostname",
        code: "undeclared-operator",
        reason: 'field "hostname" cannot be filtered with startsWith',
      },
    ],
    encoded: "hostname__startsWith=ex&page=1&size=50",
  },
  {
    params: "owner__isSet=1",
    slice: {
      filter: [{ field: "owner", operator: "isSet", operands: [] }],
      search: null,
      sort: [],
      group: [],
    },
    issues: [],
    encoded: "owner__isSet=1&page=1&size=50",
  },
  {
    params: "owner__isSet=",
    slice: { filter: [], search: null, sort: [], group: [] },
    issues: [],
    encoded: "page=1&size=50",
  },
  {
    params: "updated__gte=2026-01-02",
    slice: {
      filter: [{ field: "updated", operator: "gte", operands: ["2026-01-02"] }],
      search: null,
      sort: [],
      group: [],
    },
    issues: [],
    encoded: "updated__gte=2026-01-02&page=1&size=50",
  },
  {
    params: "updated__lte=2026-13-40",
    slice: { filter: [], search: null, sort: [], group: [] },
    issues: [
      {
        parameter: "updated__lte",
        field: "updated",
        code: "invalid",
        reason: '"2026-13-40" is not an ISO-8601 calendar date (YYYY-MM-DD)',
      },
    ],
    encoded: "updated__lte=2026-13-40&page=1&size=50",
  },
  {
    params: "status__bogus=failed",
    slice: { filter: [], search: null, sort: [], group: [] },
    issues: [
      {
        parameter: "status__bogus",
        field: "status",
        code: "malformed",
        reason: 'unknown operator "bogus"',
      },
    ],
    encoded: "status__bogus=failed&page=1&size=50",
  },
  {
    params: "status__=failed",
    slice: { filter: [], search: null, sort: [], group: [] },
    issues: [
      {
        parameter: "status__",
        field: "status",
        code: "malformed",
        reason: 'unknown operator ""',
      },
    ],
    encoded: "status__=failed&page=1&size=50",
  },
  {
    params: "gone__isAny=a&gone=b",
    slice: { filter: [], search: null, sort: [], group: [] },
    issues: [
      {
        parameter: "gone__isAny",
        field: "gone",
        code: "undeclared-field",
        reason: '"gone" is not a field of this collection',
      },
    ],
    encoded: "gone__isAny=a&gone=b&page=1&size=50",
  },
  {
    params: "gone=b",
    slice: { filter: [], search: null, sort: [], group: [] },
    issues: [],
    encoded: "gone=b&page=1&size=50",
  },
  {
    params: "status=&cpu__gte=",
    slice: { filter: [], search: null, sort: [], group: [] },
    issues: [],
    encoded: "page=1&size=50",
  },
  {
    params: "config.region=ex-east",
    slice: {
      filter: [
        { field: "config.region", operator: "isAny", operands: ["ex-east"] },
      ],
      search: null,
      sort: [],
      group: [],
    },
    issues: [],
    encoded: "config.region=ex-east&page=1&size=50",
  },
  {
    params: "config.cores__gte=2",
    slice: {
      filter: [{ field: "config.cores", operator: "gte", operands: [2] }],
      search: null,
      sort: [],
      group: [],
    },
    issues: [],
    encoded: "config.cores__gte=2&page=1&size=50",
  },
  {
    params: "memory__gte=1e21",
    slice: { filter: [], search: null, sort: [], group: [] },
    issues: [
      {
        parameter: "memory__gte",
        field: "memory",
        code: "invalid",
        reason: "not a number",
      },
    ],
    encoded: "memory__gte=1e21&page=1&size=50",
  },
  {
    params: "memory__gte=0.0000001",
    slice: {
      filter: [{ field: "memory", operator: "gte", operands: [1e-7] }],
      search: null,
      sort: [],
      group: [],
    },
    issues: [],
    encoded: "memory__gte=0.0000001&page=1&size=50",
  },
  {
    params: "memory__lte=1000000000000000000000",
    slice: {
      filter: [{ field: "memory", operator: "lte", operands: [1e21] }],
      search: null,
      sort: [],
      group: [],
    },
    issues: [],
    encoded: "memory__lte=1000000000000000000000&page=1&size=50",
  },
  {
    params: "tags=ex-gpu&tags=ex-nvme",
    slice: {
      filter: [
        { field: "tags", operator: "isAny", operands: ["ex-gpu", "ex-nvme"] },
      ],
      search: null,
      sort: [],
      group: [],
    },
    issues: [],
    encoded: "tags=ex-gpu&tags=ex-nvme&page=1&size=50",
  },
  {
    params: "tags__isNone=ex-gpu",
    slice: { filter: [], search: null, sort: [], group: [] },
    issues: [
      {
        parameter: "tags__isNone",
        field: "tags",
        code: "undeclared-operator",
        reason: 'field "tags" cannot be filtered with isNone',
      },
    ],
    encoded: "tags__isNone=ex-gpu&page=1&size=50",
  },
  {
    params: "status=failed&status=bogus",
    slice: {
      filter: [{ field: "status", operator: "isAny", operands: ["failed"] }],
      search: null,
      sort: [],
      group: [],
    },
    issues: [
      {
        parameter: "status",
        field: "status",
        code: "invalid",
        reason: '"bogus" is not an option of "status"',
      },
    ],
    encoded: "status=failed&status=bogus&page=1&size=50",
  },
  {
    params: "q=alder&q=birch",
    slice: { filter: [], search: "alder", sort: [], group: [] },
    issues: [
      {
        parameter: "q",
        field: null,
        code: "malformed",
        reason: '"q" takes one value; the extra values were ignored',
      },
    ],
    encoded: "q=alder&q=birch&page=1&size=50",
  },
  {
    params: "q=alder",
    slice: { filter: [], search: "alder", sort: [], group: [] },
    issues: [],
    encoded: "q=alder&page=1&size=50",
  },
  {
    params: "sort=hostname__asc&sort=cpu__desc",
    slice: {
      filter: [],
      search: null,
      sort: [
        { field: "hostname", direction: "asc" },
        { field: "cpu", direction: "desc" },
      ],
      group: [],
    },
    issues: [],
    encoded: "sort=hostname__asc&sort=cpu__desc&page=1&size=50",
  },
  {
    params: "sort=updated__asc",
    slice: { filter: [], search: null, sort: [], group: [] },
    issues: [
      {
        parameter: "sort",
        field: null,
        code: "undeclared-field",
        reason: 'field "updated" cannot be sorted',
      },
    ],
    encoded: "page=1&size=50",
  },
  {
    params: "sort=hostname__asc&sort=hostname__desc",
    slice: {
      filter: [],
      search: null,
      sort: [{ field: "hostname", direction: "asc" }],
      group: [],
    },
    issues: [],
    encoded: "sort=hostname__asc&page=1&size=50",
  },
  {
    params: "group=status",
    slice: { filter: [], search: null, sort: [], group: [] },
    issues: [
      {
        parameter: "group",
        field: null,
        code: "too-many-levels",
        reason: "this source cannot group",
      },
    ],
    encoded: "page=1&size=50",
  },
  {
    params: "page=2&size=25",
    slice: { filter: [], search: null, sort: [], group: [] },
    issues: [],
    encoded: "page=2&size=25",
  },
  {
    params: "page=0&size=x",
    slice: { filter: [], search: null, sort: [], group: [] },
    issues: [
      {
        parameter: "page",
        field: null,
        code: "malformed",
        reason: '"0" is not a positive integer',
      },
      {
        parameter: "size",
        field: null,
        code: "malformed",
        reason: '"x" is not a positive integer',
      },
    ],
    encoded: "page=1&size=50",
  },
  {
    params: "cursor=ex-token",
    slice: { filter: [], search: null, sort: [], group: [] },
    issues: [
      {
        parameter: "cursor",
        field: null,
        code: "unreachable-page",
        reason: "this source pages by number and reaches no page by token",
      },
    ],
    encoded: "page=1&size=50",
  },
  {
    params: "view=ex-saved&status=failed",
    slice: {
      filter: [{ field: "status", operator: "isAny", operands: ["failed"] }],
      search: null,
      sort: [],
      group: [],
    },
    issues: [],
    encoded: "view=ex-saved&status=failed&page=1&size=50",
  },
  {
    params: "table.order=hostname&table.hidden=cpu",
    slice: { filter: [], search: null, sort: [], group: [] },
    issues: [],
    encoded: "table.order=hostname&table.hidden=cpu&page=1&size=50",
  },
  {
    params: "tab=ex-one&status=failed&tab=ex-two&ref=ex",
    slice: {
      filter: [{ field: "status", operator: "isAny", operands: ["failed"] }],
      search: null,
      sort: [],
      group: [],
    },
    issues: [],
    encoded: "tab=ex-one&tab=ex-two&ref=ex&status=failed&page=1&size=50",
  },
  {
    params: "cpu__gte=4&tab=x&cpu__gte=",
    slice: {
      filter: [{ field: "cpu", operator: "gte", operands: [4] }],
      search: null,
      sort: [],
      group: [],
    },
    issues: [],
    encoded: "tab=x&cpu__gte=4&page=1&size=50",
  },
];
