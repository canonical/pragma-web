/**
 * Every story declares and shows its columns through `createColumns`, as the
 * recipes pages do, so the code a reader copies checks each field against
 * the collection. A column over a record value the schema does not declare,
 * which `createColumns` cannot name, stays typed by hand.
 */

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { machineCollection } from "../../storybook/machines/fixtures.js";

const lib = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../lib",
);

const stories = readdirSync(lib, { recursive: true })
  .map(String)
  .filter((file) => file.endsWith(".stories.tsx"));

/** The field names the machine collection declares. */
const declared: ReadonlySet<string> = new Set(
  machineCollection.schema.fields.map((field) => field.field),
);

/** Each list of columns a story declares or shows typed by hand. */
const typedByHand = (source: string): readonly string[] =>
  [
    ...source.matchAll(
      /const \w+: readonly DataTableColumn\[\] = \[([\s\S]*?)\n\];/g,
    ),
  ].map((match) => match.at(1) ?? "");

describe("the columns a story declares", () => {
  it("are declared through createColumns wherever the schema names them", () => {
    expect(stories.length).toBeGreaterThan(0);
    const avoidable = stories.flatMap((file) =>
      typedByHand(readFileSync(path.join(lib, file), "utf8"))
        .filter((list) =>
          [...list.matchAll(/id: "([^"]+)"/g)].every((id) =>
            declared.has(id.at(1) ?? ""),
          ),
        )
        .map(() => file),
    );
    expect(avoidable).toEqual([]);
  });
});
