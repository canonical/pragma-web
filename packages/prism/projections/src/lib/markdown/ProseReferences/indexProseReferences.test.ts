import { describe, expect, it } from "vitest";
import {
  ONTOLOGY_CLASS_NODE,
  PROSE_REFERENCES,
  STATION_NODE,
} from "../../../../testing/fixtures.js";
import indexProseReferences from "./indexProseReferences.js";

describe("indexProseReferences", () => {
  it("keys each node by its absolute IRI", () => {
    const index = indexProseReferences(PROSE_REFERENCES.edges);
    expect(index.get(ONTOLOGY_CLASS_NODE.uri)).toBe(ONTOLOGY_CLASS_NODE);
    expect(index.get(STATION_NODE.uri)).toBe(STATION_NODE);
  });

  it("keys each node by its compact address", () => {
    const index = indexProseReferences(PROSE_REFERENCES.edges);
    expect(index.get("ds:UIBlock")).toBe(ONTOLOGY_CLASS_NODE);
    expect(index.get("metro:station/kings-cross")).toBe(STATION_NODE);
  });

  it("holds nothing else", () => {
    expect(indexProseReferences(PROSE_REFERENCES.edges).size).toBe(4);
    expect(indexProseReferences([]).size).toBe(0);
  });
});
