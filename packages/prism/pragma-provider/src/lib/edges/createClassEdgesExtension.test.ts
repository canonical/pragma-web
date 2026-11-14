import type { CompilerContext } from "@canonical/ke-graphql";
import { describe, expect, it } from "vitest";
import { createClassEdgesExtension } from "./createClassEdgesExtension.js";

/** The `Query.classEdges` resolver the extension adds. */
const readResolver = () => {
  const extensions = createClassEdgesExtension()({
    type: () => undefined,
    iface: () => undefined,
  }) as unknown as {
    Query: { classEdges: { resolve: (...args: unknown[]) => unknown } };
  };
  return extensions.Query.classEdges.resolve;
};

describe("createClassEdgesExtension", () => {
  it("answers the class edges the request context carries", () => {
    const classEdges = [
      {
        property: "urn:p",
        subjectClass: "urn:A",
        objectClass: "urn:B",
        count: 1,
        declared: true,
      },
    ];
    expect(
      readResolver()(null, {}, { classEdges } as unknown as CompilerContext),
    ).toBe(classEdges);
  });

  it("fails loudly when the context carries none", () => {
    expect(() => readResolver()(null, {}, {})).toThrow(
      "the request context carries no class edges: build them with createPragmaProvider's handler",
    );
  });
});
