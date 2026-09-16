/**
 * Every component props type in the package extends its root element's
 * native props, is derived from another component's props that do, or says
 * why it does not.
 */

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const lib = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../lib",
);

/** Each component folder's props types file: a sibling of a `.tsx` of its name. */
const propsFiles = readdirSync(lib, { recursive: true })
  .map(String)
  .filter((file) => file.endsWith(`${path.sep}types.ts`))
  .filter((file) => {
    const folder = path.dirname(file);
    const component = path.basename(folder);
    return readdirSync(path.join(lib, folder)).includes(`${component}.tsx`);
  });

describe("a component's props type", () => {
  it("extends native props or says why it does not", () => {
    expect(propsFiles.length).toBeGreaterThan(0);
    const silent = propsFiles.filter((file) => {
      const source = readFileSync(path.join(lib, file), "utf8");
      return (
        /export type \w+Props\b/.test(source) &&
        !/ComponentProps(WithoutRef)?</.test(source) &&
        // A connected part's props are another component's, which say it.
        !/(Omit|Pick)<\s*\w+Props</.test(source) &&
        !/Exempt from the native-prop extension convention/.test(source)
      );
    });
    expect(silent).toEqual([]);
  });
});
