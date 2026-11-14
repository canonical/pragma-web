import { describe, expect, it } from "vitest";
import {
  EDGE_DECLARATIONS,
  EDGE_OBSERVATIONS,
  EX,
  LENS_OUTLINE,
} from "../../testing/fixtures.js";
import { weighClassEdges } from "./weighClassEdges.js";

const edges = weighClassEdges(
  EDGE_DECLARATIONS,
  EDGE_OBSERVATIONS,
  LENS_OUTLINE,
);

describe("weighClassEdges", () => {
  it("counts the observations of the domain's and range's subclasses", () => {
    expect(
      edges.find((edge) => edge.property === `${EX}worksFor` && edge.declared),
    ).toEqual({
      property: `${EX}worksFor`,
      subjectClass: `${EX}Person`,
      objectClass: `${EX}Agent`,
      count: 5,
      declared: true,
    });
  });

  it("serves a declared edge nothing covers with count 0", () => {
    expect(edges.find((edge) => edge.property === `${EX}employs`)).toEqual({
      property: `${EX}employs`,
      subjectClass: `${EX}Agent`,
      objectClass: `${EX}Person`,
      count: 0,
      declared: true,
    });
  });

  it("serves each observation no declaration covers as undeclared", () => {
    expect(edges.filter((edge) => !edge.declared)).toEqual([
      {
        property: `${EX}name`,
        subjectClass: `${EX}Agent`,
        objectClass: `${EX}Thing`,
        count: 5,
        declared: false,
      },
      {
        property: `${EX}worksFor`,
        subjectClass: `${EX}Place`,
        objectClass: `${EX}Agent`,
        count: 1,
        declared: false,
      },
    ]);
  });

  it("sums repeated undeclared observations of one pair", () => {
    const observation = {
      property: `${EX}name`,
      subjectClass: `${EX}Thing`,
      objectClass: `${EX}Thing`,
      count: 2,
    };
    expect(
      weighClassEdges([], [observation, observation], LENS_OUTLINE),
    ).toEqual([{ ...observation, count: 4, declared: false }]);
  });

  it("counts each statement once per edge that covers it", () => {
    const statement = {
      property: `${EX}worksFor`,
      subjectClass: `${EX}Employee`,
      objectClass: `${EX}Agent`,
      count: 1,
    };
    const nested = weighClassEdges(
      [
        {
          property: `${EX}worksFor`,
          domain: `${EX}Person`,
          range: `${EX}Agent`,
        },
        {
          property: `${EX}worksFor`,
          domain: `${EX}Employee`,
          range: `${EX}Agent`,
        },
      ],
      [statement],
      LENS_OUTLINE,
    );
    expect(nested.map((edge) => [edge.subjectClass, edge.count])).toEqual([
      [`${EX}Employee`, 1],
      [`${EX}Person`, 1],
    ]);
  });

  it("sorts by property, then subject class, then object class", () => {
    expect(
      edges.map((edge) => [edge.property, edge.subjectClass, edge.objectClass]),
    ).toEqual([
      [`${EX}employs`, `${EX}Agent`, `${EX}Person`],
      [`${EX}locatedIn`, `${EX}Thing`, `${EX}Place`],
      [`${EX}name`, `${EX}Agent`, `${EX}Thing`],
      [`${EX}worksFor`, `${EX}Person`, `${EX}Agent`],
      [`${EX}worksFor`, `${EX}Place`, `${EX}Agent`],
    ]);
    const sameProperty = weighClassEdges(
      [
        { property: `${EX}p`, domain: `${EX}Thing`, range: `${EX}Place` },
        { property: `${EX}p`, domain: `${EX}Thing`, range: `${EX}Agent` },
      ],
      [],
      LENS_OUTLINE,
    );
    expect(sameProperty.map((edge) => edge.objectClass)).toEqual([
      `${EX}Agent`,
      `${EX}Place`,
    ]);
  });
});
