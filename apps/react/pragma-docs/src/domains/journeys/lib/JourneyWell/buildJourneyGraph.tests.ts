/**
 * The journey layout's determinism contract, pinned.
 *
 * `buildJourneyGraph` runs on the server (into the SSR markup) and again
 * on the client (into the hydrated tree). The well draws every node and
 * edge from these positions, so if the two runs disagreed by a single
 * pixel the hydration suite would see a mismatch. The property is
 * therefore not "looks right" but BYTE EQUALITY, asserted directly.
 *
 * The fixtures are deliberately shaped like the real graph's awkward
 * cases rather than a tidy tree: a shared coordinate, a surface two jobs
 * both reach, a pairing with no arrival, a job with no pairings, and a
 * surface composing no layout. Those are the five shapes the demand model
 * actually contains — 34 of 133 pairings carry no arrival, and only 16
 * reach a layout — so a layout that only worked on the happy path would
 * fail here.
 */

import { describe, expect, it } from "vitest";
import { LATTICE_PITCH } from "#lib/graph";
import type { JourneyCoordinate } from "../../types.js";
import {
  buildJourneyGraph,
  classifyArrival,
  classifyRole,
} from "./buildJourneyGraph.js";
import {
  COLUMN_PITCH,
  NODE_HEIGHT,
  NODE_WIDTH,
  ROLE_PRIMARY_CLASS,
  ROLE_SECONDARY_CLASS,
  ROW_PITCH,
} from "./constants.js";

const SURFACE = "sem://surface#";
const DOCS = "sem://design-system-docs#";

/**
 * A fixture carrying every awkward shape at once: two jobs on one
 * coordinate; a surface (`view.components`) both jobs reach; a pairing
 * with no arrival; a job with no pairings at all; and a surface with no
 * layout beside one that has it.
 */
const FIXTURE: readonly JourneyCoordinate[] = [
  {
    uri: `${DOCS}coordinate.maker-duo`,
    label: "human × designer+engineer",
    jobs: [
      {
        uri: `${DOCS}job.l3`,
        label: "L3 — Browse components",
        pairings: [
          {
            uri: `${DOCS}pairing.l3-components`,
            label: "L3 → Components",
            role: `${SURFACE}Primary`,
            arrival: `${SURFACE}ColdEntry`,
            surface: {
              uri: `${DOCS}view.components`,
              label: "Components",
              surfaceType: "Lens",
              href: "/components",
              layout: { uri: `${DOCS}layout.catalog`, label: "Catalog" },
            },
          },
          {
            // No arrival — the honest 34-of-133 case.
            uri: `${DOCS}pairing.l3-chips`,
            label: "L3 → chips",
            role: `${SURFACE}Secondary`,
            arrival: null,
            surface: {
              uri: `${DOCS}view.chips`,
              label: "chips",
              surfaceType: "Mechanism",
              href: null,
              // No layout — the honest majority case.
              layout: null,
            },
          },
        ],
      },
      {
        uri: `${DOCS}job.b2`,
        label: "B2 — Integrate a component",
        pairings: [
          {
            uri: `${DOCS}pairing.b2-components`,
            label: "B2 → Components",
            role: `${SURFACE}Primary`,
            arrival: `${SURFACE}SubjectKept`,
            // The SHARED surface: reached by two different jobs.
            surface: {
              uri: `${DOCS}view.components`,
              label: "Components",
              surfaceType: "Lens",
              href: "/components",
              layout: { uri: `${DOCS}layout.catalog`, label: "Catalog" },
            },
          },
        ],
      },
      {
        // Demand nothing serves — it must still earn a row.
        uri: `${DOCS}job.orphan`,
        label: "Orphan — served by nothing",
        pairings: [],
      },
    ],
  },
];

describe("buildJourneyGraph", () => {
  it("is byte-identical across repeated runs", () => {
    const first = buildJourneyGraph(FIXTURE);
    const second = buildJourneyGraph(FIXTURE);
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  it("is byte-identical regardless of the input's own order", () => {
    // The graph's result order is insertion order; this function sorts
    // explicitly rather than trusting it, so a reordered input must give
    // an identical layout. This is the assertion that would fail if the
    // explicit sort were ever dropped.
    const reversed: readonly JourneyCoordinate[] = FIXTURE.map(
      (coordinate) => ({
        ...coordinate,
        jobs: [...coordinate.jobs].reverse().map((job) => ({
          ...job,
          pairings: [...job.pairings].reverse(),
        })),
      }),
    );
    expect(JSON.stringify(buildJourneyGraph(reversed))).toBe(
      JSON.stringify(buildJourneyGraph(FIXTURE)),
    );
  });

  it("places every node on its hop's column, never between", () => {
    const { nodes } = buildJourneyGraph(FIXTURE);
    for (const node of nodes) {
      expect(node.x % COLUMN_PITCH).toBe(0);
      expect(node.width).toBe(NODE_WIDTH);
      expect(node.height).toBe(NODE_HEIGHT);
    }
  });

  it("sets every corner on the lattice, so no float survives into a position", () => {
    // A shared node's row is a mean, and a raw mean can be a
    // non-terminating binary fraction; snapping it to the lattice keeps
    // every y an integer multiple of the pitch.
    const { nodes } = buildJourneyGraph(FIXTURE);
    for (const node of nodes) {
      expect(node.x % LATTICE_PITCH).toBe(0);
      expect(node.y % LATTICE_PITCH).toBe(0);
    }
  });

  it("stands a shared node on the mean of its rows, snapped down", () => {
    const { nodes } = buildJourneyGraph(FIXTURE);
    const yOf = (uri: string): number | undefined =>
      nodes.find((node) => node.id === `${DOCS}${uri}`)?.y;
    // Rows by URI order: job.b2 takes row 0, job.l3 rows 1 and 2, and
    // job.orphan row 3, so the coordinate serving all four stands on row
    // 1.5, as does job.l3.
    expect(yOf("job.b2")).toBe(0);
    expect(yOf("job.l3")).toBe(1.5 * ROW_PITCH);
    expect(yOf("coordinate.maker-duo")).toBe(1.5 * ROW_PITCH);
    expect(yOf("job.orphan")).toBe(3 * ROW_PITCH);
  });

  it("connects only nodes it places, so every edge can be drawn", () => {
    const { nodes, edges } = buildJourneyGraph(FIXTURE);
    const ids = new Set(nodes.map((node) => node.id));
    for (const edge of edges) {
      expect(ids.has(edge.source)).toBe(true);
      expect(ids.has(edge.target)).toBe(true);
    }
  });

  it("emits one node per URI even when several journeys share it", () => {
    const { nodes } = buildJourneyGraph(FIXTURE);
    const ids = nodes.map((node) => node.id);
    expect(ids).toStrictEqual([...new Set(ids)]);
    // The shared surface appears exactly once despite two jobs reaching it.
    expect(ids.filter((id) => id === `${DOCS}view.components`)).toHaveLength(1);
  });

  it("renders a job with no pairings as a row that simply ends", () => {
    const { nodes, edges } = buildJourneyGraph(FIXTURE);
    const orphan = nodes.find((node) => node.id === `${DOCS}job.orphan`);
    expect(orphan).toBeDefined();
    // It is connected FROM its coordinate and to nothing onward.
    expect(edges.some((edge) => edge.target === `${DOCS}job.orphan`)).toBe(
      true,
    );
    expect(edges.some((edge) => edge.source === `${DOCS}job.orphan`)).toBe(
      false,
    );
  });

  it("renders honest absence: no layout node where none is composed", () => {
    const { nodes, edges } = buildJourneyGraph(FIXTURE);
    // `view.chips` composes no layout, so nothing follows it.
    expect(edges.some((edge) => edge.source === `${DOCS}view.chips`)).toBe(
      false,
    );
    // And no layout node was invented for it by walking any chain.
    const layoutNodes = nodes.filter((node) => node.data.kind === "layout");
    expect(layoutNodes.map((node) => node.id)).toStrictEqual([
      `${DOCS}layout.catalog`,
    ]);
  });

  it("carries role and arrival as data, never as position", () => {
    const { nodes } = buildJourneyGraph(FIXTURE);
    const noArrival = nodes.find(
      (node) => node.id === `${DOCS}pairing.l3-chips`,
    );
    expect(noArrival?.data.arrival).toBeUndefined();
    expect(noArrival?.data.role).toBe(`${SURFACE}Secondary`);
    // Two pairings differing only in role/arrival sit on their own rows by
    // allocation order — their decoration never moved them.
    const withArrival = nodes.find(
      (node) => node.id === `${DOCS}pairing.l3-components`,
    );
    expect(withArrival?.data.arrival).toBe(`${SURFACE}ColdEntry`);
  });
});

describe("the role and arrival class mappings", () => {
  it("maps the two real roles and nothing else", () => {
    expect(classifyRole(`${SURFACE}Primary`)).toBe(ROLE_PRIMARY_CLASS);
    expect(classifyRole(`${SURFACE}Secondary`)).toBe(ROLE_SECONDARY_CLASS);
    expect(classifyRole(`${SURFACE}Invented`)).toBeUndefined();
    expect(classifyRole(null)).toBeUndefined();
    expect(classifyRole(undefined)).toBeUndefined();
  });

  it("maps the PREFIXED form the live graph actually returns", () => {
    // Verified against the running backend: `pairingRole.uri` comes back
    // as `surface:Primary`, not `sem://surface#Primary`. Both forms must
    // map, or every edge would silently lose its weight in production
    // while the full-IRI unit fixtures stayed green.
    expect(classifyRole("surface:Primary")).toBe(ROLE_PRIMARY_CLASS);
    expect(classifyRole("surface:Secondary")).toBe(ROLE_SECONDARY_CLASS);
    expect(classifyArrival("surface:ColdEntry")).toBe("arrival-coldentry");
    expect(classifyArrival("surface:NoMove")).toBe("arrival-nomove");
  });

  it("maps each real arrival, and decorates nothing when absent", () => {
    expect(classifyArrival(`${SURFACE}ColdEntry`)).toBe("arrival-coldentry");
    expect(classifyArrival(`${SURFACE}SubjectKept`)).toBe(
      "arrival-subjectkept",
    );
    expect(classifyArrival(`${SURFACE}NoMove`)).toBe("arrival-nomove");
    // The 34-of-133 case: no arrival is DATA, so it decorates nothing.
    expect(classifyArrival(null)).toBeUndefined();
    expect(classifyArrival(undefined)).toBeUndefined();
  });
});
