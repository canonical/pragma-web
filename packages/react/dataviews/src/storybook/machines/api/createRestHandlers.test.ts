import { describe, expect, it } from "vitest";
import requestRest from "../../../../testing/requestRest.js";
import serveMockApi from "../../../../testing/serveMockApi.js";
import watchMockRequest from "../../../../testing/watchMockRequest.js";
import createRestHandlers from "./createRestHandlers.js";

const server = serveMockApi(createRestHandlers());

/** The identities of a page's items. */
const readIds = (body: unknown): readonly string[] =>
  (body as { readonly items: readonly { readonly id: string }[] }).items.map(
    (item) => item.id,
  );

describe("createRestHandlers", () => {
  it("answers the first page of every machine with exact counts", async () => {
    const { status, body } = await requestRest("live", "size=5");
    expect(status).toBe(200);
    expect(readIds(body)).toEqual(["m-01", "m-02", "m-03", "m-04", "m-05"]);
    expect(body).toMatchObject({ matched: 12 });
  });

  it("filters, searches, orders and pages as the parameters say", async () => {
    const { body } = await requestRest(
      "live",
      "status=failed&status=pending&cores__gte=4&sort=cores__desc&size=2&page=2",
    );
    // Failed or pending with at least four cores, most cores first:
    // hazel 16, birch 8, larch 8, fir 4.
    expect(body).toMatchObject({ matched: 4 });
    expect(readIds(body)).toEqual(["m-12", "m-06"]);
    const searched = await requestRest("live", "q=EX:IVY");
    expect(readIds(searched.body)).toEqual(["m-09"]);
  });

  it("looks for text in the text fields it declares", async () => {
    const { body } = await requestRest("live", "region__contains=EU-");
    expect(readIds(body)).toEqual(["m-01", "m-02", "m-07", "m-10"]);
  });

  it("reads the statuses a machine is any and none of", async () => {
    const excluded = await requestRest(
      "live",
      "status__isNone=running&status__isNone=pending",
    );
    // Neither running nor pending: the three failed machines.
    expect(excluded.body).toMatchObject({ matched: 3 });
    // Both spellings of any-of are one set of statuses.
    const either = await requestRest(
      "live",
      "status=failed&status__isAny=pending",
    );
    const listed = await requestRest("live", "status=failed&status=pending");
    expect(readIds(either.body)).toEqual(readIds(listed.body));
    const both = await requestRest(
      "live",
      "status=failed&status=pending&status__isNone=failed",
    );
    // Failed or pending, and not failed: the three pending machines.
    expect(both.body).toMatchObject({ matched: 3 });
  });

  it("looks for text a value starts with", async () => {
    const { body } = await requestRest("live", "name__startsWith=B");
    expect(readIds(body)).toEqual(["m-02"]);
    const inside = await requestRest("live", "region__startsWith=west");
    expect(inside.body).toMatchObject({ matched: 0 });
  });

  it("requires every text and every predicate at once", async () => {
    const { body } = await requestRest(
      "live",
      "name__contains=er&region__contains=eu-&status=running",
    );
    // Running in an eu- region: alder and gum; only alder holds "er".
    expect(readIds(body)).toEqual(["m-01"]);
  });

  it("reads a blank parameter as a control left empty", async () => {
    const { body } = await requestRest("live", "name__contains=&status=");
    expect(body).toMatchObject({ matched: 12 });
    // Dropped value by value, as the grammar drops them.
    const running = await requestRest("live", "status=running&status=");
    expect(running.body).toMatchObject({ matched: 6 });
    const alder = await requestRest(
      "live",
      "name__contains=&name__contains=alder",
    );
    expect(alder.body).toMatchObject({ matched: 1 });
  });

  it("pins what it answers to representative queries", async () => {
    for (const [params, expected] of [
      [
        "status=running&cores__gte=8&cores__lte=32",
        { ids: ["m-03", "m-05", "m-07"], matched: 3, facets: {} },
      ],
      [
        "name__contains=AR",
        { ids: ["m-03", "m-11", "m-12"], matched: 3, facets: {} },
      ],
      [
        "name__startsWith=c&region__contains=-2",
        { ids: ["m-03"], matched: 1, facets: {} },
      ],
      [
        "region__startsWith=AP",
        { ids: ["m-05", "m-06", "m-09", "m-12"], matched: 4, facets: {} },
      ],
      [
        "status__isAny=failed&status__isAny=pending&status__isNone=pending",
        { ids: ["m-02", "m-06", "m-10"], matched: 3, facets: {} },
      ],
      [
        "status__isNone=running",
        {
          ids: ["m-02", "m-04", "m-06", "m-08", "m-10", "m-12"],
          matched: 6,
          facets: {},
        },
      ],
      ["q=EX:I", { ids: ["m-09"], matched: 1, facets: {} }],
      [
        "q=example&sort=status__asc",
        {
          ids: [
            "m-01",
            "m-03",
            "m-05",
            "m-07",
            "m-09",
            "m-11",
            "m-02",
            "m-06",
            "m-10",
            "m-04",
            "m-08",
            "m-12",
          ],
          matched: 12,
          facets: {},
        },
      ],
      [
        "sort=status__desc",
        {
          ids: [
            "m-04",
            "m-08",
            "m-12",
            "m-02",
            "m-06",
            "m-10",
            "m-01",
            "m-03",
            "m-05",
            "m-07",
            "m-09",
            "m-11",
          ],
          matched: 12,
          facets: {},
        },
      ],
      [
        "sort=name__desc",
        {
          ids: [
            "m-12",
            "m-11",
            "m-10",
            "m-09",
            "m-08",
            "m-07",
            "m-06",
            "m-05",
            "m-04",
            "m-03",
            "m-02",
            "m-01",
          ],
          matched: 12,
          facets: {},
        },
      ],
      [
        "sort=cores__asc",
        {
          ids: [
            "m-04",
            "m-10",
            "m-01",
            "m-06",
            "m-11",
            "m-02",
            "m-07",
            "m-12",
            "m-03",
            "m-08",
            "m-05",
            "m-09",
          ],
          matched: 12,
          facets: {},
        },
      ],
      [
        "sort=region__asc&size=4&page=2",
        { ids: ["m-01", "m-02", "m-07", "m-10"], matched: 12, facets: {} },
      ],
      [
        "sort=owner__desc&size=5&page=3",
        { ids: ["m-02", "m-01"], matched: 12, facets: {} },
      ],
      ["size=5&page=4", { ids: [], matched: 12, facets: {} }],
      [
        "facet=status&facet=cores",
        {
          ids: [
            "m-01",
            "m-02",
            "m-03",
            "m-04",
            "m-05",
            "m-06",
            "m-07",
            "m-08",
            "m-09",
            "m-10",
            "m-11",
            "m-12",
          ],
          matched: 12,
          facets: {
            status: {
              kind: "values",
              values: [
                { value: "running", count: { kind: "exact", value: 6 } },
                { value: "failed", count: { kind: "exact", value: 3 } },
                { value: "pending", count: { kind: "exact", value: 3 } },
              ],
            },
            cores: { kind: "range", min: 2, max: 64 },
          },
        },
      ],
      [
        "status=failed&cores__gte=8&facet=status&facet=cores",
        {
          ids: ["m-02"],
          matched: 1,
          facets: {
            status: {
              kind: "values",
              values: [
                { value: "running", count: { kind: "exact", value: 4 } },
                { value: "failed", count: { kind: "exact", value: 1 } },
                { value: "pending", count: { kind: "exact", value: 2 } },
              ],
            },
            cores: { kind: "range", min: 2, max: 8 },
          },
        },
      ],
      [
        "q=ex:a&cores__lte=8&facet=cores&facet=status",
        {
          ids: ["m-01"],
          matched: 1,
          facets: {
            cores: { kind: "range", min: 4, max: 4 },
            status: {
              kind: "values",
              values: [
                { value: "running", count: { kind: "exact", value: 1 } },
              ],
            },
          },
        },
      ],
      [
        "name__contains=zzz&facet=status&facet=cores",
        {
          ids: [],
          matched: 0,
          facets: {
            status: { kind: "values", values: [] },
            cores: { kind: "range", min: null, max: null },
          },
        },
      ],
      [
        "region__contains=us&status__isNone=pending&sort=cores__desc&facet=status",
        {
          ids: ["m-03", "m-11"],
          matched: 2,
          facets: {
            status: {
              kind: "values",
              values: [
                { value: "running", count: { kind: "exact", value: 2 } },
                { value: "pending", count: { kind: "exact", value: 2 } },
              ],
            },
          },
        },
      ],
    ] as const) {
      const { status, body } = await requestRest("live", params);
      expect(status).toBe(200);
      const { items, matched, facets } = body as {
        readonly items: readonly { readonly id: string }[];
        readonly matched: number;
        readonly facets: unknown;
      };
      expect({ ids: items.map((item) => item.id), matched, facets }).toEqual(
        expected,
      );
    }
  });

  it("refuses what it cannot run rather than answering more", async () => {
    for (const [params, reason] of [
      ["owner__contains=ex", 'this endpoint does not accept "owner__contains"'],
      [
        "owner__startsWith=ex",
        'this endpoint does not accept "owner__startsWith"',
      ],
      ["status__isNone=deployed", '"deployed" is not a status'],
      ["cores__isNone=4", 'this endpoint does not accept "cores__isNone"'],
      [
        "name__contains__x=web",
        'this endpoint does not accept "name__contains__x"',
      ],
      ["cores__gte__x=4", 'this endpoint does not accept "cores__gte__x"'],
      [
        "sort=name__asc&sort=cores__asc",
        "this endpoint orders by one term at a time",
      ],
      ["q=a&q=b", '"q" takes one value'],
      ["name__contains=a&name__contains=b", '"name__contains" takes one value'],
      ["sort=__asc", "a sort names no field"],
      ["sort=__", "a sort names no field"],
      ["sort=note", '"note" is not a field this endpoint orders by'],
      ["sort=note__up", '"note" is not a field this endpoint orders by'],
      ["sort=name", "a sort names no direction"],
      ["sort=note__asc", '"note" is not a field this endpoint orders by'],
      ["sort=name__up", '"up" is not a direction'],
      ["sort=name__asc__x", '"sort" takes one field and one direction'],
      ["status=deployed", '"deployed" is not a status'],
      ["cores__gte=many", '"many" is not a number of cores'],
      ["page=0", '"page" is not a positive whole number'],
    ] as const) {
      expect(await requestRest("live", params)).toEqual({
        status: 400,
        body: { reason },
      });
    }
  });

  it("fails every request of the scenario that is down", async () => {
    expect(await requestRest("down", "")).toEqual({
      status: 503,
      body: { reason: "the machine inventory is unavailable" },
    });
  });

  it("answers the first page and fails the rest when only it is available", async () => {
    expect((await requestRest("first-page-only", "size=5")).status).toBe(200);
    expect(await requestRest("first-page-only", "size=5&page=2")).toEqual({
      status: 503,
      body: { reason: "the machines past the first page are unavailable" },
    });
  });

  it("never answers the scenario that is unanswered", async () => {
    const watch = watchMockRequest(server, "/api/unanswered/machines");
    const abandoned = new AbortController();
    let settled = false;
    const request = requestRest("unanswered", "", abandoned.signal);
    request.then(
      () => {
        settled = true;
      },
      () => {
        settled = true;
      },
    );
    try {
      await watch.received;
      // Two requests sent behind it, one after the other, are answered,
      // and the server still holds it: it was received and never answered.
      for (const _ of [1, 2]) {
        expect((await requestRest("live", "size=1")).status).toBe(200);
      }
      expect(watch.hasEnded()).toBe(false);
      expect(settled).toBe(false);
    } finally {
      abandoned.abort();
      watch.stop();
    }
    await expect(request).rejects.toMatchObject({ name: "AbortError" });
  });
});
