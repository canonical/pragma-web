/**
 * The settings menu's stylesheet: its button's name is read and not drawn,
 * clipped to the one-pixel box every such word in the package takes.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const sheet = readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "styles.css"),
  "utf8",
).replace(/\/\*[\s\S]*?\*\//g, "");

describe("SettingsMenu stylesheet", () => {
  it("clips the button's name to the one-pixel box, never removed", () => {
    const rule = sheet.match(/& > \.trigger > \.label\s*\{([^{}]*)\}/)?.at(1);
    expect(rule).toBeDefined();
    expect(rule).toMatch(
      /inline-size:\s*1px;\s*block-size:\s*1px;\s*margin:\s*-1px;\s*padding:\s*0;/,
    );
    expect(rule).toMatch(/clip-path:\s*inset\(50%\);/);
    expect(rule).not.toMatch(/display:\s*none|visibility:\s*hidden/);
  });
});
