/**
 * The stylesheet's contract with the markup. jsdom applies no CSS, so what
 * is pinned is what a stylesheet change can break with every render still
 * green: each class the sheet styles is one a drawing of either type draws,
 * the structure its combinators assume is the one drawn, and every value is
 * a token — the borrowed foreground of the bars and the band included, since
 * the design system has no chart palette and the prototype invents none.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createFacetedFleet,
  createFacetedManual,
} from "../../../../testing/createFacetedProviders.js";
import DataChart from "./DataChart.js";

const here = path.dirname(fileURLToPath(import.meta.url));

/** A file beside this one, as text. */
const read = (file: string): string =>
  readFileSync(path.join(here, file), "utf8");

// Comments and the layer name dropped, so neither prose nor `ds.components`
// is ever taken for a class selector; whitespace collapsed, so a rule is
// named by its selector list on one line.
const sheet = read("styles.css")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/@layer[^{;]*/g, "")
  .replace(/\s+/g, " ");

/** The bar chart over a fleet its source counts. */
const bars = (): HTMLElement =>
  render(
    <DataChart
      provider={createFacetedFleet()}
      type="bar"
      field="status"
      label="Machines by status"
    />,
  ).container;

/** The range chart over a fleet whose cores its source measures. */
const range = (): HTMLElement =>
  render(
    <DataChart
      provider={createFacetedFleet()}
      type="range"
      field="cores"
      label="Cores"
    />,
  ).container;

/** The chart while no result answers, drawing its status. */
const pending = (): HTMLElement =>
  render(
    <DataChart
      provider={createFacetedManual().provider}
      type="bar"
      field="status"
      label="Machines by status"
    />,
  ).container;

const root = ".ds.data-chart";

describe("DataChart stylesheet", () => {
  it("styles only classes a chart of either type draws", () => {
    const styled = new Set(
      [...sheet.matchAll(/\.([a-z][\w-]*)/g)].map(([, name = ""]) => name),
    );
    const drawn = new Set(
      [bars(), range(), pending()].flatMap((container) =>
        [...container.querySelectorAll("[class]")].flatMap((element) => [
          ...element.classList,
        ]),
      ),
    );
    expect(styled.size).toBeGreaterThan(0);
    expect([...styled].filter((name) => !drawn.has(name))).toEqual([]);
  });

  it("renders the structure the stylesheet's combinators assume, for bars", () => {
    const container = bars();
    for (const selector of [
      `${root} > .chart`,
      `${root} > .data`,
      `${root} .bar`,
      `${root} .grid-line`,
      `${root} .tick`,
      `${root} .label`,
      `${root} .value`,
    ]) {
      expect(container.querySelector(selector), selector).not.toBeNull();
    }
  });

  it("renders the structure the stylesheet's combinators assume, for a range", () => {
    const container = range();
    for (const selector of [
      `${root} > .chart`,
      `${root} > .data`,
      `${root} .axis`,
      `${root} .band`,
      `${root} .marker`,
      `${root} .tick`,
      `${root} .value`,
    ]) {
      expect(container.querySelector(selector), selector).not.toBeNull();
    }
  });

  it("styles the status the chart carries as an attribute", () => {
    expect(sheet).toMatch(/& > \.status \{/);
    expect(
      pending().querySelector(`${root} > .status[data-status]`),
    ).not.toBeNull();
  });

  it("binds the borrowed foreground and the surface ring to tokens", () => {
    expect(sheet).toMatch(
      /& :is\(\.bar, \.band, \.marker\) \{ fill: var\(--color-foreground-primary\);/,
    );
    expect(sheet).toMatch(/& \.marker \{ stroke: var\(--color-background\);/);
  });

  it("writes no length or colour of its own", () => {
    expect(sheet).not.toMatch(/\d(px|rem|em)\b|#[0-9a-f]{3,8}\b|opacity/i);
  });
});
