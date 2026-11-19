import spacingSeatCss from "@canonical/styles/spacing-seat.css?inline";
import { describe, expect, it } from "vitest";
import {
  computed,
  MIXED_PRAGMA_CSS,
  PRAGMA_CSS,
  render,
} from "./support/pages.js";

const number = (value: string): number => Number.parseFloat(value) || 0;

const metrics = (doc: Document, id: string) => {
  const element = doc.getElementById(id);
  if (!element) throw new Error(`missing text owner ${id}`);
  const css = computed(doc, element);
  const marker = element.querySelector("i");
  if (!marker) throw new Error(`missing baseline marker ${id}`);
  const rect = element.getBoundingClientRect();
  return {
    font: number(css.fontSize),
    start: number(css.paddingBlockStart),
    end: number(css.marginBlockEnd),
    occupied: rect.height + number(css.marginBlockEnd),
    baseline: marker.getBoundingClientRect().top - rect.top,
  };
};

const text = (id: string, tag: string, attributes = "") =>
  `<${tag} id="${id}" ${attributes}>Text<i></i></${tag}>`;

describe("root-size text seating", () => {
  for (const [entry, css] of [
    ["page", PRAGMA_CSS],
    ["confined island", MIXED_PRAGMA_CSS],
  ]) {
    it.each([16, 20])(
      `adds the product-default inset only to root-size owners in the ${entry} at %spx rem`,
      async (rootSize) => {
        const doc = await render({
          root: "site",
          styles: [
            css,
            spacingSeatCss,
            `html { font-size: ${rootSize}px; }
             .text-test { display: flow-root; }
             .text-test i { display: inline-block; width: 0; height: 0; }
             .before { --_text-seat-control-inset: 0px; }`,
          ],
          body: ["site", "docs", "app"]
            .map(
              (tier) =>
                `<section class="ds ${tier}">${["before", "adopted"]
                  .map(
                    (phase) =>
                      `<div class="${phase}">${[
                        "p",
                        "h1",
                        "h2",
                        "h3",
                        "h4",
                        "h5",
                        "h6",
                      ]
                        .map((tag) =>
                          text(
                            `${tier}-${phase}-${tag}`,
                            tag,
                            'class="text-test"',
                          ),
                        )
                        .join("")}
              ${text(`${tier}-${phase}-larger`, "p", 'class="text-test" style="--font-size:1.5rem"')}
              ${text(`${tier}-${phase}-near-larger`, "p", 'class="text-test" style="--font-size:calc(var(--ds-typography-body-font-size) + 0.015625px)"')}
              ${text(`${tier}-${phase}-near-smaller`, "p", 'class="text-test" style="--font-size:calc(var(--ds-typography-body-font-size) - 0.015625px)"')}
              ${text(`${tier}-${phase}-helper`, "div", 'class="ds spacing-text-seat text-test"')}
              <div role="table"><div role="row"><div role="cell" style="--_density-inset-control-block:19px">
                ${text(`${tier}-${phase}-cell`, "p", 'class="text-test"')}
              </div></div></div></div>`,
                  )
                  .join("")}</section>`,
            )
            .join(""),
        });
        for (const tier of ["site", "docs", "app"]) {
          const rootFont = ((tier === "site" ? 16 : 14) * rootSize) / 16;
          const inset = ((tier === "site" ? 0 : 4) * rootSize) / 16;
          for (const role of [
            "p",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "larger",
            "near-larger",
            "near-smaller",
            "helper",
            "cell",
          ]) {
            const before = metrics(doc, `${tier}-before-${role}`);
            const adopted = metrics(doc, `${tier}-adopted-${role}`);
            const added = Math.abs(adopted.font - rootFont) < 0.01 ? inset : 0;
            expect(
              adopted.start - before.start,
              `${tier} ${role} start`,
            ).toBeCloseTo(added, 1);
            expect(adopted.end - before.end, `${tier} ${role} end`).toBeCloseTo(
              added,
              1,
            );
            expect(
              adopted.occupied - before.occupied,
              `${tier} ${role} occupied`,
            ).toBeCloseTo(2 * added, 1);
            expect(
              adopted.baseline - before.baseline,
              `${tier} ${role} baseline`,
            ).toBeCloseTo(added, 1);
          }
        }
      },
    );
  }
});
