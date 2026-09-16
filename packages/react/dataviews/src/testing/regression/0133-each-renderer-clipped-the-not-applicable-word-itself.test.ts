/**
 * The not-applicable content is shared by the table and the cards, and drew
 * its word with a bare class each renderer's stylesheet clipped in a copy of
 * its own, so a fix to the box had to be made twice. The package clipped
 * its read-and-not-drawn words three ways besides: the menu button's name
 * to no box at all, and the announcer without its margin taken back.
 *
 * The content carries its own stylesheet, as the announcer does, and every
 * word the package reads and does not draw is clipped to one box.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const lib = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../lib",
);

const read = (file: string): string =>
  readFileSync(path.join(lib, file), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

describe("a word read and not drawn", () => {
  it("is clipped by the not-applicable content's own sheet, not the renderers'", () => {
    expect(read("common/NotApplicable/NotApplicable.tsx")).toMatch(
      /import "\.\/styles\.css";/,
    );
    for (const sheet of [
      "_work_in_progress/DataTable/styles.css",
      "_work_in_progress/Cards/styles.css",
    ]) {
      expect(read(sheet)).not.toMatch(/not-applicable/);
    }
  });

  it("is clipped to the one-pixel box everywhere the package clips one", () => {
    const boxes = [
      read("common/NotApplicable/styles.css"),
      read("common/Announcer/styles.css"),
      read("_work_in_progress/DataTable/styles.css")
        .match(/\.menu-label\s*\{[^{}]*\}/)
        ?.at(0) ?? "",
    ];
    for (const box of boxes) {
      expect(box).toMatch(
        /inline-size:\s*1px;\s*block-size:\s*1px;\s*margin:\s*-1px;\s*padding:\s*0;/,
      );
    }
  });
});
