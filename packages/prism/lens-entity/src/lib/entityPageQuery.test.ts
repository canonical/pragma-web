import { describe, expect, it } from "vitest";
import {
  METRO_NAMESPACES,
  NORTHGATE_CURIE,
  NORTHGATE_IRI,
  STATIONS_BINDING,
} from "../../testing/fixtures.js";
import {
  buildEntityPageVariables,
  entityNamespacesQueryNode,
  entityPageQueryNode,
  readUriParam,
} from "./entityPageQuery.js";

describe("readUriParam", () => {
  it("returns the decoded address", () => {
    expect(readUriParam({ uri: NORTHGATE_CURIE })).toBe(NORTHGATE_CURIE);
  });

  it("asserts the shape: a missing, empty or non-string address throws", () => {
    expect(() => readUriParam({})).toThrow(/non-empty string/);
    expect(() => readUriParam({ uri: "" })).toThrow(/non-empty string/);
    expect(() => readUriParam({ uri: 42 })).toThrow(/non-empty string/);
  });
});

describe("buildEntityPageVariables", () => {
  it("expands a compact address through the namespaces, beside the class", () => {
    expect(
      buildEntityPageVariables(
        STATIONS_BINDING,
        NORTHGATE_CURIE,
        METRO_NAMESPACES,
      ),
    ).toEqual({ id: NORTHGATE_IRI, classUri: "metro:Station" });
  });

  it("passes an absolute IRI through", () => {
    expect(
      buildEntityPageVariables(STATIONS_BINDING, NORTHGATE_IRI, []),
    ).toEqual({ id: NORTHGATE_IRI, classUri: "metro:Station" });
  });
});

describe("the compiled operations", () => {
  it("are the namespaces lookup and the page", () => {
    expect(entityNamespacesQueryNode.params.name).toBe("EntityNamespacesQuery");
    expect(entityPageQueryNode.params.name).toBe("EntityPageQuery");
  });
});
