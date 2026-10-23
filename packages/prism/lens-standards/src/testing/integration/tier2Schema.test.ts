// @vitest-environment node

/**
 * The reading page's operation sends its prose to the server. relay-compiler
 * compiles a field it reads from an `extend type Query` block as a client
 * extension and strips it from the operation text, so a schema handed to it
 * with the Prose extension unmerged would compile cleanly and fetch no prose
 * at all. This reads the compiled operation and asserts that `prose` is in
 * the text the server receives, and in no client-extension selection.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import standardEntityQueryNode from "../../__generated__/StandardEntityQuery.graphql.js";

/** The compiled artifact's source, read as text. */
const ARTIFACT_SOURCE = readFileSync(
  fileURLToPath(
    new URL(
      "../../__generated__/StandardEntityQuery.graphql.ts",
      import.meta.url,
    ),
  ),
  "utf8",
);

describe("the reading page's operation", () => {
  it("sends the standard's prose to the server", () => {
    expect(standardEntityQueryNode.params.text).toContain(
      "body: prose(uri: $uri) {",
    );
    expect(standardEntityQueryNode.params.text).toContain(
      "fragment StandardProse_body on Prose {",
    );
  });

  it("compiles no selection as a client extension", () => {
    expect(ARTIFACT_SOURCE).not.toContain("ClientExtension");
  });
});
