import { describe, expect, it } from "vitest";
import weighRelationEntries from "./weighRelationEntries.js";

const DS = "https://ds.canonical.com/";
const entryOf = (property: string, other: string) => ({
  predicate: { uri: `${DS}${property}`, label: property },
  other: { uri: `${DS}${other}`, label: other },
});
const edgeOf = (
  property: string,
  subject: string,
  object: string,
  count: number,
) => ({
  property: `${DS}${property}`,
  subjectClass: `${DS}${subject}`,
  objectClass: `${DS}${object}`,
  count,
  declared: true,
});

describe("weighRelationEntries", () => {
  it("counts each outgoing relation by its edge, the heaviest first, an uncounted one last", () => {
    const weighed = weighRelationEntries(
      [entryOf("tier", "Tier"), entryOf("tag", "Tag"), entryOf("loose", "X")],
      [
        edgeOf("tier", "UIBlock", "Tier", 320),
        edgeOf("tag", "UIBlock", "Tag", 726),
        edgeOf("tag", "Other", "Tag", 9000),
      ],
      `${DS}UIBlock`,
      "outgoing",
    );
    expect(
      weighed.map(({ predicate, count }) => [predicate.label, count]),
    ).toEqual([
      ["tag", 726],
      ["tier", 320],
      ["loose", undefined],
    ]);
  });

  it("counts an incoming relation from the class at its other end", () => {
    const [weighed] = weighRelationEntries(
      [entryOf("block", "Binding")],
      [edgeOf("block", "Binding", "UIBlock", 1010)],
      `${DS}UIBlock`,
      "incoming",
    );
    expect(weighed?.count).toBe(1010);
  });

  it("keeps the order of relations of equal weight", () => {
    const weighed = weighRelationEntries(
      [entryOf("a", "A"), entryOf("b", "B")],
      [edgeOf("a", "C", "A", 0), edgeOf("b", "C", "B", 0)],
      `${DS}C`,
      "outgoing",
    );
    expect(weighed.map(({ predicate }) => predicate.label)).toEqual(["a", "b"]);
  });
});
