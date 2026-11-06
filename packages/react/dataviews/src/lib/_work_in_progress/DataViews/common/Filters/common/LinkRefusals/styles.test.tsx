/**
 * The stylesheet's contract with the markup. jsdom applies no CSS, so what
 * is pinned is what a stylesheet change can break with every render still
 * green: each class the sheet styles is one the list renders, in the
 * structure its combinators assume, and the list keeps its markers.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createMemoryLocation } from "@canonical/dataviews-core";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createMachineProvider from "../../../../../../../../testing/createMachineProvider.js";
import DataViews from "../../../../Provider.js";
import Filters from "../../Filters.js";

const here = path.dirname(fileURLToPath(import.meta.url));

// Comments and the layer name dropped, so neither prose nor `ds.components`
// is ever taken for a class selector; whitespace collapsed, so a rule is
// named by its selector list on one line.
const sheet = readFileSync(path.join(here, "styles.css"), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/@layer[^{;]*/g, "")
  .replace(/\s+/g, " ");

/** The filters on a link whose refused clause they list. */
const mountList = (): HTMLElement => {
  const { provider } = createMachineProvider({
    rows: [],
    location: createMemoryLocation({ href: "/machines?status=melted" }),
  });
  const { container } = render(
    <DataViews provider={provider}>
      <Filters />
    </DataViews>,
  );
  const list = container.querySelector(".ds.data-views-filters-link-refusals");
  if (!(list instanceof HTMLElement)) {
    throw new Error("expected the refused clauses' list");
  }
  return list;
};

describe("LinkRefusals stylesheet", () => {
  it("styles only classes the list renders", () => {
    const styled = new Set(
      [...sheet.matchAll(/\.([a-z][\w-]*)/g)].map(([, name = ""]) => name),
    );
    const root = mountList();
    const rendered = new Set(
      [root, ...root.querySelectorAll("[class]")].flatMap((element) => [
        ...element.classList,
      ]),
    );
    expect(styled.size).toBeGreaterThan(0);
    expect([...styled].filter((name) => !rendered.has(name))).toEqual([]);
  });

  it("renders the structure the stylesheet's combinators assume", () => {
    const root = mountList();
    expect(root.matches(".ds.data-views-filters-link-refusals")).toBe(true);
    expect(root.querySelector(":scope > .list > li")).not.toBeNull();
  });

  it("writes no length or colour of its own, and keeps the list's markers", () => {
    expect(sheet).not.toMatch(/\d(px|rem|em)\b|#[0-9a-f]{3,8}\b|opacity/i);
    expect(sheet).not.toMatch(/list-style/);
  });
});
