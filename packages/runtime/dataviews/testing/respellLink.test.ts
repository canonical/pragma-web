import { describe, expect, it } from "vitest";
import { createSchema } from "../src/lib/schema/index.js";
import declare from "./declare.js";
import respellLink from "./respellLink.js";

const schema = createSchema([
  { field: "status", kind: "choices", options: ["failed"] },
]);

describe("respellLink", () => {
  it("carries a refused key through and reads the result again", () => {
    const { decoded, written, reread } = respellLink(
      schema,
      new URLSearchParams("status=failed&status=melted"),
    );
    expect(decoded.issues.map((issue) => issue.parameter)).toEqual(["status"]);
    expect(written.toString()).toBe("status=failed&status=melted");
    expect(reread.issues).toEqual(decoded.issues);
  });
  it("reads both links against the capabilities given", () => {
    const { decoded, written, reread } = respellLink(
      schema,
      new URLSearchParams("status=failed"),
      declare({ filter: {} }),
    );
    expect(decoded.issues.map((issue) => issue.parameter)).toEqual(["status"]);
    expect(written.toString()).toBe("status=failed");
    expect(reread.issues).toEqual(decoded.issues);
  });
});
