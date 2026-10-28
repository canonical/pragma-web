/**
 * The lens's filter, and the two rulings it encodes.
 *
 * R1: there is no persona column and no exact persona join — the axis is
 * approximate, and this module is where that honesty is enforced rather
 * than merely documented.
 *
 * The scale ruling: the default view is FILTERED, because a whole model's
 * nodes are unreadable at once and virtualisation would break the well's
 * SSR determinism.
 */

import { describe, expect, it } from "vitest";
import {
  BROWSE_JOB,
  JOURNEY_MODEL,
  MAKER_COORDINATE,
  PERSONA_ARCHITECT,
  ROLES_BY_COORDINATE,
  WILDCARD_COORDINATE,
} from "./__fixtures__/journeyModel.js";
import type { RawJob } from "./collectJourneys.js";
import {
  ALL_JOURNEYS_FILTER,
  chooseDefaultJourneyFilter,
  personaMatchesCoordinate,
  readPersonaTerm,
  selectDrawnJourneys,
} from "./journeyFilter.js";

const DOCS = "sem://design-system-docs#";

describe("chooseDefaultJourneyFilter", () => {
  it("defaults to ONE coordinate — the readable view, not every node", () => {
    const filter = chooseDefaultJourneyFilter([
      `${DOCS}coordinate.b`,
      `${DOCS}coordinate.a`,
    ]);
    // Sorted, so the choice is deterministic across server and client.
    expect(filter.coordinate).toBe(`${DOCS}coordinate.a`);
    expect(filter.persona).toBeUndefined();
  });

  it("prefers the SELECTED job's coordinate — a link must land on its job", () => {
    // The bug this prevents: following a link to a job and landing on a
    // diagram that does not contain it.
    const filter = chooseDefaultJourneyFilter(
      [`${DOCS}coordinate.a`, `${DOCS}coordinate.z`],
      `${DOCS}coordinate.z`,
    );
    expect(filter.coordinate).toBe(`${DOCS}coordinate.z`);
  });

  it("is stable — the same inputs give the same filter", () => {
    const uris = [`${DOCS}coordinate.b`, `${DOCS}coordinate.a`];
    expect(chooseDefaultJourneyFilter(uris)).toEqual(
      chooseDefaultJourneyFilter(uris),
    );
  });
});

describe("personaMatchesCoordinate (the APPROXIMATE axis)", () => {
  it("matches everything when no persona is chosen", () => {
    expect(personaMatchesCoordinate(undefined, [])).toBe(true);
    expect(personaMatchesCoordinate(undefined, [`${DOCS}role.writer`])).toBe(
      true,
    );
  });

  it("matches by BARE TERM across the persona/role filing prefixes", () => {
    // `persona.writer` and `role.writer` are different URIs naming the
    // same word; the filing prefix is Turtle bookkeeping, not vocabulary.
    expect(
      personaMatchesCoordinate(`${DOCS}persona.writer`, [`${DOCS}role.writer`]),
    ).toBe(true);
    expect(
      personaMatchesCoordinate(`${DOCS}persona.architect`, [
        `${DOCS}role.writer`,
      ]),
    ).toBe(false);
  });

  it("treats an EMPTY role axis as the wildcard the ontology says it is", () => {
    // The newcomer's jobs carry no role axis. The ontology reads that
    // as "any role", so such a coordinate genuinely serves every persona —
    // dimming it would be the lens contradicting the model.
    expect(personaMatchesCoordinate(`${DOCS}persona.agent`, [])).toBe(true);
    expect(personaMatchesCoordinate(`${DOCS}persona.designer`, [])).toBe(true);
  });
});

describe("readPersonaTerm", () => {
  it("recovers the ontology's own word from the filed local name", () => {
    expect(readPersonaTerm(`${DOCS}persona.architect`)).toBe("architect");
  });
});

describe("ALL_JOURNEYS_FILTER", () => {
  it("narrows nothing", () => {
    expect(ALL_JOURNEYS_FILTER).toEqual({
      coordinate: undefined,
      persona: undefined,
    });
  });
});

/** The fixture model's jobs as the operation delivers them, each carrying
 * its coordinate's roles. */
const RAW_JOBS: readonly RawJob[] = JOURNEY_MODEL.flatMap((coordinate) =>
  coordinate.jobs.map((job) => ({
    uri: job.uri,
    coordinates: {
      uri: coordinate.uri,
      roles: {
        edges: (ROLES_BY_COORDINATE[coordinate.uri] ?? []).map((uri) => ({
          node: { uri },
        })),
      },
    },
  })),
);

/** The URIs of the coordinates a selection draws. */
const drawnUris = (
  selection: ReturnType<typeof selectDrawnJourneys>,
): readonly string[] => selection.drawn.map((coordinate) => coordinate.uri);

describe("selectDrawnJourneys", () => {
  it("draws the default coordinate when the reader has chosen nothing", () => {
    const selection = selectDrawnJourneys(
      JOURNEY_MODEL,
      RAW_JOBS,
      undefined,
      undefined,
    );
    const first = [MAKER_COORDINATE, WILDCARD_COORDINATE].sort().at(0);
    expect(selection.filter.coordinate).toBe(first);
    expect(drawnUris(selection)).toEqual([first]);
  });

  it("opens a job's page on the job's own coordinate", () => {
    const selection = selectDrawnJourneys(
      JOURNEY_MODEL,
      RAW_JOBS,
      undefined,
      BROWSE_JOB,
    );
    expect(drawnUris(selection)).toEqual([MAKER_COORDINATE]);
  });

  it("follows the reader's choice made on the job on screen", () => {
    const selection = selectDrawnJourneys(
      JOURNEY_MODEL,
      RAW_JOBS,
      { job: undefined, filter: ALL_JOURNEYS_FILTER },
      undefined,
    );
    expect(drawnUris(selection)).toEqual(
      JOURNEY_MODEL.map((coordinate) => coordinate.uri),
    );
  });

  it("leaves a choice made on another job's page behind", () => {
    const selection = selectDrawnJourneys(
      JOURNEY_MODEL,
      RAW_JOBS,
      { job: undefined, filter: ALL_JOURNEYS_FILTER },
      BROWSE_JOB,
    );
    expect(drawnUris(selection)).toEqual([MAKER_COORDINATE]);
  });

  it("keeps only the coordinates the persona approximately matches", () => {
    const selection = selectDrawnJourneys(
      JOURNEY_MODEL,
      RAW_JOBS,
      {
        job: undefined,
        filter: { coordinate: undefined, persona: PERSONA_ARCHITECT },
      },
      undefined,
    );
    expect(drawnUris(selection)).toEqual(
      JOURNEY_MODEL.filter((coordinate) =>
        personaMatchesCoordinate(
          PERSONA_ARCHITECT,
          ROLES_BY_COORDINATE[coordinate.uri] ?? [],
        ),
      ).map((coordinate) => coordinate.uri),
    );
  });
});
