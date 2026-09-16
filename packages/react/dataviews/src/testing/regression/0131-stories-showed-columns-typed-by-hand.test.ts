/**
 * The recipes pages declared their columns with `createColumns`, and the
 * stories beside them still showed, and ran, columns typed by hand as
 * `readonly DataTableColumn[]`: a reader copying a story's code got the
 * shape the pages had moved away from, with no field checked against the
 * collection.
 *
 * Every story declares and shows its columns through `createColumns`, but
 * for a column over a record value the schema does not declare, which
 * `createColumns` cannot name and which stays typed by hand.
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
  ].map((match) => match[1] ?? "");

describe("the columns a story declares", () => {
  it("are declared through createColumns wherever the schema names them", () => {
    expect(stories.length).toBeGreaterThan(0);
    const avoidable = stories.flatMap((file) =>
      typedByHand(readFileSync(path.join(lib, file), "utf8"))
        .filter((list) =>
          [...list.matchAll(/id: "([^"]+)"/g)].every((id) =>
            declared.has(id[1] ?? ""),
          ),
        )
        .map(() => file),
    );
    expect(avoidable).toEqual([]);
  });
});
