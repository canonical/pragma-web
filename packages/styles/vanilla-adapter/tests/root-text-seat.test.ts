import spacingSeatCss from "@canonical/styles/spacing-seat.css?inline";
import { describe, expect, it } from "vitest";
import navItemCss from "../../../react/ds-app/src/lib/SideNavigation/common/Item/styles.css?inline";
import navCss from "../../../react/ds-app/src/lib/SideNavigation/styles.css?inline";
import accordionItemCss from "../../../react/ds-global/src/lib/component/Accordion/common/Item/styles.css?inline";
import accordionCss from "../../../react/ds-global/src/lib/component/Accordion/styles.css?inline";
import wrapperCss from "../../../react/ds-global-form/src/lib/common/Wrapper/styles.css?inline";
import toggleCss from "../../../react/ds-global-form/src/lib/common/Wrapper/ToggleWrapper.css?inline";
import choicesCss from "../../../react/ds-global-form/src/lib/component/ChoicesField/styles.css?inline";
import richChoicesCss from "../../../react/ds-global-form/src/lib/component/RichChoicesField/styles.css?inline";
import checkboxCss from "../../../react/ds-global-form/src/lib/subcomponent/CheckboxInput/styles.css?inline";
import labelCss from "../../../react/ds-global-form/src/lib/subcomponent/Field/Label/styles.css?inline";
import {
  computed,
  emulate,
  MIXED_PRAGMA_CSS,
  mixedPage,
  PRAGMA_CSS,
  render,
} from "./support/pages.js";

const number = (value: string): number => Number.parseFloat(value) || 0;
const tiers = ["site", "docs", "app"] as const;
type Tier = (typeof tiers)[number];
// Font size, line height, weight and eligibility are independent expectations.
const roles = {
  site: {
    p: [16, 24, 400, true],
    h1: [42, 48, 500, false],
    h2: [42, 48, 300, false],
    h3: [24, 32, 500, false],
    h4: [24, 32, 300, false],
    h5: [16, 24, 600, true],
    h6: [16, 24, 400, true],
  },
  docs: {
    p: [14, 20, 400, true],
    h1: [32, 40, 500, false],
    h2: [32, 40, 300, false],
    h3: [24, 32, 500, false],
    h4: [24, 32, 300, false],
    h5: [18, 24, 600, false],
    h6: [18, 24, 400, false],
  },
  app: {
    p: [14, 20, 400, true],
    h1: [24, 32, 500, false],
    h2: [24, 32, 300, false],
    h3: [18, 24, 600, false],
    h4: [18, 24, 400, false],
    h5: [14, 20, 600, true],
    h6: [14, 20, 600, true],
  },
} as const;
const beforeCss = `
  .before :is(p,h1,h2,h3,h4,h5,h6,.p) {
    --start-nudge: var(--_text-unseated-nudge);
    --grid-compensation: var(--_text-unseated-compensation);
  }
  .before .ds.spacing-text-seat {
    padding-block-start: var(--ds-text-baseline-nudge);
    margin-block-end: var(--ds-text-grid-compensation);
  }
`;
const fixtureCss = `
  .text-test { display: flow-root; }
  .text-test i { display:inline-block; width:0; height:0; }
`;
const metrics = (doc: Document, id: string) => {
  const element = doc.getElementById(id);
  if (!element) throw new Error(`missing text owner ${id}`);
  const css = computed(doc, element);
  const marker = element.querySelector("i");
  if (!marker) throw new Error(`missing baseline marker ${id}`);
  const rect = element.getBoundingClientRect();
  return {
    font: number(css.fontSize),
    line: number(css.lineHeight),
    weight: number(css.fontWeight),
    start: number(css.paddingBlockStart),
    end: number(css.marginBlockEnd),
    occupied: rect.height + number(css.marginBlockEnd),
    baseline: marker.getBoundingClientRect().top - rect.top,
  };
};
const text = (id: string, tag: string, attributes = "") =>
  `<${tag} id="${id}" ${attributes}>Text<i></i></${tag}>`;
const changed = (doc: Document, tier: Tier, role: string, inset: number) => {
  const before = metrics(doc, `${tier}-before-${role}`);
  const adopted = metrics(doc, `${tier}-adopted-${role}`);
  expect(adopted.start - before.start, `${tier} ${role} start`).toBeCloseTo(
    inset,
    2,
  );
  expect(adopted.end - before.end, `${tier} ${role} end`).toBeCloseTo(inset, 2);
  expect(
    adopted.occupied - before.occupied,
    `${tier} ${role} occupied`,
  ).toBeCloseTo(2 * inset, 2);
  expect(
    adopted.baseline - before.baseline,
    `${tier} ${role} baseline`,
  ).toBeCloseTo(inset, 2);
  return { before, adopted };
};

describe("root-size text seating", () => {
  for (const [entry, css] of [
    ["page", PRAGMA_CSS],
    ["confined island", MIXED_PRAGMA_CSS],
  ] as const) {
    it.each([16, 20])(
      `pins tier roles and used-font eligibility in the ${entry} at %spx rem`,
      async (rootSize) => {
        const scale = rootSize / 16;
        const doc = await render({
          root: "site",
          styles: [
            css,
            spacingSeatCss,
            beforeCss,
            fixtureCss,
            `html {font-size:${rootSize}px}`,
          ],
          body: tiers
            .map(
              (tier) =>
                `<section class="ds ${tier}">${["before", "adopted"]
                  .map(
                    (phase) => `<div class="${phase}">${Object.keys(roles[tier])
                      .map((tag) =>
                        text(
                          `${tier}-${phase}-${tag}`,
                          tag,
                          'class="text-test"',
                        ),
                      )
                      .join("")}
        ${text(`${tier}-${phase}-larger`, "p", 'class="text-test" style="font-size:24px"')}
        ${text(`${tier}-${phase}-root-heading`, "h3", 'class="text-test" style="font-size:var(--ds-typography-body-font-size)"')}
        ${text(`${tier}-${phase}-missing-input`, "p", 'class="text-test" style="--font-size:initial;font-size:var(--ds-typography-body-font-size)"')}
        ${text(`${tier}-${phase}-near-larger`, "p", 'class="text-test" style="font-size:calc(var(--ds-typography-body-font-size) + 0.015625px)"')}
        ${text(`${tier}-${phase}-near-smaller`, "p", 'class="text-test" style="font-size:calc(var(--ds-typography-body-font-size) - 0.015625px)"')}
        ${text(`${tier}-${phase}-helper`, "div", 'class="ds spacing-text-seat text-test"')}
        ${text(`${tier}-${phase}-larger-helper`, "div", 'class="ds spacing-text-seat text-test" style="font-size:24px"')}
        <div role="table"><div role="row"><div role="cell" style="--_density-inset-control-block:19px">${text(`${tier}-${phase}-cell`, "p", 'class="text-test"')}</div></div></div>
        </div>`,
                  )
                  .join("")}</section>`,
            )
            .join(""),
        });
        for (const tier of tiers) {
          const inset = (tier === "site" ? 0 : 4) * scale;
          for (const [role, [font, line, weight, seated]] of Object.entries(
            roles[tier],
          )) {
            const { before, adopted } = changed(
              doc,
              tier,
              role,
              seated ? inset : 0,
            );
            for (const measured of [before, adopted]) {
              expect(measured.font, `${tier} ${role} font`).toBeCloseTo(
                font * scale,
                3,
              );
              expect(measured.line, `${tier} ${role} line`).toBeCloseTo(
                line * scale,
                3,
              );
              expect(measured.weight, `${tier} ${role} weight`).toBe(weight);
            }
          }
          for (const role of [
            "root-heading",
            "missing-input",
            "helper",
            "cell",
          ])
            changed(doc, tier, role, inset);
          for (const role of [
            "larger",
            "larger-helper",
            "near-larger",
            "near-smaller",
          ])
            changed(doc, tier, role, 0);
          const missing = metrics(doc, `${tier}-adopted-missing-input`);
          const body = metrics(doc, `${tier}-adopted-p`);
          expect(
            missing.start,
            `${tier} missing --font-size keeps cap nudge`,
          ).toBeCloseTo(body.start, 3);
          expect(missing.start).toBeGreaterThan(inset);
          expect(metrics(doc, `${tier}-adopted-larger`).font).toBeCloseTo(
            24,
            3,
          );
          expect(metrics(doc, `${tier}-adopted-root-heading`).font).toBeCloseTo(
            (tier === "site" ? 16 : 14) * scale,
            3,
          );
        }
      },
    );
  }

  it.each(["app", "docs", "site"] as const)(
    "pins root and nested h6 weights when html itself is %s",
    async (root) => {
      for (const css of [PRAGMA_CSS, MIXED_PRAGMA_CSS]) {
        const doc = await render({
          root,
          styles: [css],
          body: `<h6 class="ds" id="root">Root</h6><section class="site"><h6 class="ds" id="site">Site</h6><section class="docs"><h6 class="ds" id="docs">Docs</h6><section class="app"><h6 class="ds" id="app">App</h6></section></section></section>`,
        });
        for (const [id, tier] of [
          ["root", root],
          ["site", "site"],
          ["docs", "docs"],
          ["app", "app"],
        ] as const) {
          expect(
            number(computed(doc, id).fontSize),
            `${root} ${id} h6 size`,
          ).toBe(roles[tier].h6[0]);
          expect(
            number(computed(doc, id).fontWeight),
            `${root} ${id} h6 weight`,
          ).toBe(roles[tier].h6[2]);
        }
      }
    },
  );

  it.each(["4.56", "4.61"] as const)(
    "restores both text-seat edges across the Vanilla %s important margin rule",
    async (version) => {
      const spec = mixedPage(version, {
        root: "app comfortable light",
        body: ["before", "adopted"]
          .map(
            (phase) =>
              `<div class="${phase}"><div class="p-content-card__author-and-date">${text(`app-${phase}-boundary-p`, "p", 'class="ds p text-test"')}</div><fieldset class="ds form-rich-choices"><div class="ds option p-content-card__author-and-date"><label id="app-${phase}-boundary-card" class="ds p text-test">Text<i></i></label></div></fieldset></div>`,
          )
          .join(""),
      });
      spec.styles.push(richChoicesCss, beforeCss, fixtureCss);
      const doc = await render(spec);
      const body = changed(doc, "app", "boundary-p", 4);
      expect(body.adopted.occupied).toBeCloseTo(32, 2);
      const card = changed(doc, "app", "boundary-card", 0);
      expect(card.adopted.occupied).toBeCloseTo(40, 2);
    },
  );

  it.each(["h3", "h6", "p"] as const)(
    "keeps the Accordion header shell unseated around an embedded %s",
    async (tag) => {
      const doc = await render({
        root: "site",
        styles: [
          PRAGMA_CSS,
          accordionCss,
          accordionItemCss,
          beforeCss,
          fixtureCss,
        ],
        body: tiers
          .map(
            (tier) =>
              `<section class="${tier}">${["before", "adopted"].map((phase) => `<div class="${phase} ds accordion"><details class="ds accordion-item"><summary id="${tier}-${phase}-shell" class="header"><span class="chevron"></span><span class="heading">${text(`${tier}-${phase}-embedded`, tag, 'class="text-test"')}</span></summary><div class="content editorial"></div></details></div>`).join("")}</section>`,
          )
          .join(""),
      });
      for (const tier of tiers) {
        const before = metrics(doc, `${tier}-before-embedded`);
        const adopted = metrics(doc, `${tier}-adopted-embedded`);
        expect(
          adopted.start - before.start,
          `${tier} ${tag} header start`,
        ).toBeCloseTo(0, 2);
        expect(
          adopted.end - before.end,
          `${tier} ${tag} header end`,
        ).toBeCloseTo(0, 2);
        const oldShell = doc.getElementById(`${tier}-before-shell`);
        const newShell = doc.getElementById(`${tier}-adopted-shell`);
        if (!oldShell || !newShell)
          throw new Error("missing actual Accordion header shell");
        expect(
          newShell.getBoundingClientRect().height -
            oldShell.getBoundingClientRect().height,
          `${tier} ${tag} header closure`,
        ).toBeCloseTo(0, 2);
      }
    },
  );

  it.each(["none", "active"] as const)(
    "inherits one chrome opt-out through nested text helpers in forced colors %s",
    async (forcedColors) => {
      await emulate({ forcedColors });
      for (const css of [PRAGMA_CSS, MIXED_PRAGMA_CSS]) {
        for (const rootSize of [16, 20]) {
          const scale = rootSize / 16;
          const doc = await render({
            root: "site",
            styles: [
              css,
              spacingSeatCss,
              accordionCss,
              accordionItemCss,
              richChoicesCss,
              labelCss,
              beforeCss,
              fixtureCss,
              `html {font-size:${rootSize}px} .nested-shell {display:flow-root}`,
            ],
            body: tiers
              .map(
                (tier) =>
                  `<section class="ds ${tier}">${["before", "adopted"]
                    .map(
                      (phase) => `
              <div class="${phase}">
                <div id="${tier}-${phase}-isolated-shell" class="nested-shell" style="--_text-seat-inset:0px">
                  ${text(`${tier}-${phase}-isolated-helper`, "span", 'class="ds field-label spacing-text-seat text-test"')}
                  ${text(`${tier}-${phase}-isolated-prose`, "p", 'class="p text-test"')}
                </div>
                <div class="ds accordion"><details class="ds accordion-item">
                  <summary id="${tier}-${phase}-nested-header-shell" class="header"><span class="chevron"></span><span class="heading">
                    ${text(`${tier}-${phase}-header-helper`, "span", 'class="ds field-label spacing-text-seat text-test"')}
                  </span></summary><div class="content editorial"></div>
                </details></div>
                <fieldset class="ds form-rich-choices"><div class="ds option"><input type="radio" id="${tier}-${phase}-nested-input"/>
                  <label id="${tier}-${phase}-nested-card-shell" class="p" for="${tier}-${phase}-nested-input">
                    ${text(`${tier}-${phase}-card-helper`, "span", 'class="ds field-label spacing-text-seat text-test"')}
                  </label>
                </div></fieldset>
              </div>`,
                    )
                    .join("")}</section>`,
              )
              .join(""),
          });
          for (const tier of tiers) {
            for (const role of [
              "isolated-helper",
              "isolated-prose",
              "header-helper",
              "card-helper",
            ]) {
              const result = changed(doc, tier, role, 0);
              expect(
                result.before.occupied,
                `${tier} ${role} original closure`,
              ).toBeCloseTo((tier === "site" ? 40 : 24) * scale, 2);
              expect(
                result.adopted.occupied,
                `${tier} ${role} unseated closure`,
              ).toBeCloseTo((tier === "site" ? 40 : 24) * scale, 2);
            }
            for (const shell of [
              "isolated-shell",
              "nested-header-shell",
              "nested-card-shell",
            ]) {
              const oldShell = doc.getElementById(`${tier}-before-${shell}`);
              const newShell = doc.getElementById(`${tier}-adopted-${shell}`);
              if (!oldShell || !newShell) throw new Error(`missing ${shell}`);
              const oldOccupied =
                oldShell.getBoundingClientRect().height +
                number(computed(doc, oldShell).marginBlockEnd);
              const newOccupied =
                newShell.getBoundingClientRect().height +
                number(computed(doc, newShell).marginBlockEnd);
              expect(
                newOccupied,
                `${tier} ${shell} has no second seat or closure`,
              ).toBeCloseTo(oldOccupied, 2);
            }
          }
        }
      }
    },
  );

  it.each([16, 20])(
    "absorbs the label's end inset into the stacked field gap at %spx rem",
    async (rootSize) => {
      const scale = rootSize / 16;
      for (const css of [PRAGMA_CSS, MIXED_PRAGMA_CSS]) {
        const doc = await render({
          root: "site",
          styles: [
            css,
            wrapperCss,
            labelCss,
            beforeCss,
            fixtureCss,
            `html {font-size:${rootSize}px} .before .ds.field {row-gap:var(--form-field-label-gap)}`,
          ],
          body: tiers
            .map(
              (tier) =>
                `<section class="ds ${tier}">${["before", "adopted"]
                  .map(
                    (phase) => `
            <form class="${phase} ds form"><div id="${tier}-${phase}-stacked-field" class="ds field" style="grid-template-columns:1fr">
              <label id="${tier}-${phase}-stacked-label" class="ds field-label spacing-text-seat text-test" for="${tier}-${phase}-stacked-input">Label<i></i></label>
              <div class="payload"><div id="${tier}-${phase}-stacked-control" class="ds input text chrome spacing-control-seat stroke-paint stroke-paint-overlay stroke-block-end focus-within"><input id="${tier}-${phase}-stacked-input" value="Value"/></div></div>
            </div></form>`,
                  )
                  .join("")}</section>`,
            )
            .join(""),
        });
        for (const tier of tiers) {
          const inset = (tier === "site" ? 0 : 4) * scale;
          const label = changed(doc, tier, "stacked-label", inset);
          expect(label.before.occupied, `${tier} old label seat`).toBeCloseTo(
            (tier === "site" ? 40 : 24) * scale,
            2,
          );
          expect(
            label.adopted.occupied,
            `${tier} adopted label seat`,
          ).toBeCloseTo((tier === "site" ? 40 : 32) * scale, 2);
          const readings = ["before", "adopted"].map((phase) => {
            const field = doc.getElementById(`${tier}-${phase}-stacked-field`);
            const owner = doc.getElementById(`${tier}-${phase}-stacked-label`);
            const control = doc.getElementById(
              `${tier}-${phase}-stacked-control`,
            );
            if (!field || !owner || !control)
              throw new Error("missing actual stacked field owner");
            const ownerTop = owner.getBoundingClientRect().top;
            const ownerMetrics = metrics(doc, `${tier}-${phase}-stacked-label`);
            return {
              gap: number(computed(doc, field).rowGap),
              controlTop: control.getBoundingClientRect().top - ownerTop,
              baselineToControl:
                control.getBoundingClientRect().top -
                ownerTop -
                ownerMetrics.baseline,
            };
          });
          expect(readings[0].gap, `${tier} original item gap`).toBeCloseTo(
            (tier === "site" ? 8 : 4) * scale,
            2,
          );
          expect(readings[1].gap, `${tier} absorbed item gap`).toBeCloseTo(
            (tier === "site" ? 8 : 0) * scale,
            2,
          );
          expect(
            readings[0].controlTop,
            `${tier} original label to control`,
          ).toBeCloseTo((tier === "site" ? 48 : 28) * scale, 2);
          expect(
            readings[1].controlTop,
            `${tier} adopted label to control`,
          ).toBeCloseTo((tier === "site" ? 48 : 32) * scale, 2);
          expect(
            readings[1].baselineToControl,
            `${tier} label baseline to control is preserved`,
          ).toBeCloseTo(readings[0].baselineToControl, 2);
        }
      }
    },
  );

  it.each([
    "custom",
    "leading-description",
    "chrome-opt-out",
    "toggle",
    "side-by-side",
  ] as const)(
    "retains the public and composition gap contract for %s fields",
    async (variant) => {
      const doc = await render({
        root: "site",
        styles: [
          PRAGMA_CSS,
          wrapperCss,
          labelCss,
          toggleCss,
          checkboxCss,
          beforeCss,
          fixtureCss,
          `.before .ds.field {row-gap:var(--form-field-label-gap)}
           .before .ds.field:has(> .payload > .ds.field-description:first-child) {row-gap:var(--form-field-label-description-gap,var(--form-field-label-gap))}`,
        ],
        body: tiers
          .map(
            (tier) =>
              `<section class="${tier}">${["before", "adopted"]
                .map((phase) => {
                  const prefix = `${tier}-${phase}`;
                  const heading = text(
                    `${prefix}-gap-label`,
                    "label",
                    'class="ds field-label spacing-text-seat text-test"',
                  );
                  const control = `<div id="${prefix}-gap-control" class="ds input text chrome spacing-control-seat"><input value="Value"/></div>`;
                  const description = `<p id="${prefix}-gap-description" class="ds field-description p text-test">Description<i></i></p>`;
                  const style =
                    variant === "custom" || variant === "side-by-side"
                      ? "--form-field-label-gap:12px"
                      : variant === "leading-description"
                        ? "--form-field-label-description-gap:12px"
                        : variant === "chrome-opt-out"
                          ? "--_text-seat-inset:0px"
                          : "";
                  const content =
                    variant === "toggle"
                      ? `${heading}<div id="${prefix}-gap-control" class="ds field-toggle-control spacing-text-seat"><input class="ds form-checkbox" type="checkbox"/><label class="ds field-label field-toggle-inline-label">Toggle</label></div>${description}`
                      : `${heading}<div id="${prefix}-gap-payload" class="payload">${variant === "leading-description" ? description : ""}${control}</div>`;
                  const columns =
                    variant === "side-by-side"
                      ? "grid-template-columns:1fr 1fr;--form-label-columns:1;--form-payload-columns:2"
                      : "grid-template-columns:1fr";
                  return `<form class="${phase} ds form"><div id="${prefix}-gap-field" class="ds field${variant === "toggle" ? " field-toggle" : ""}" style="${columns};${style}">${content}</div></form>`;
                })
                .join("")}</section>`,
          )
          .join(""),
      });
      for (const tier of tiers) {
        const itemGap = tier === "site" ? 8 : 4;
        const inset = tier === "site" ? 0 : 4;
        const baselineToPayload: number[] = [];
        for (const phase of ["before", "adopted"]) {
          const prefix = `${tier}-${phase}`;
          const field = doc.getElementById(`${prefix}-gap-field`);
          const label = doc.getElementById(`${prefix}-gap-label`);
          const control = doc.getElementById(`${prefix}-gap-control`);
          if (!field || !label || !control)
            throw new Error("missing actual field composition");
          const publicGap =
            variant === "custom" ||
            variant === "leading-description" ||
            variant === "side-by-side"
              ? 12
              : itemGap;
          const absorbs = variant !== "toggle" && variant !== "chrome-opt-out";
          const expectedGap =
            phase === "adopted" && absorbs ? publicGap - inset : publicGap;
          expect(
            number(computed(doc, field).rowGap),
            `${tier} ${phase} ${variant} row gap`,
          ).toBeCloseTo(expectedGap, 2);
          if (variant === "toggle") {
            const description = doc.getElementById(`${prefix}-gap-description`);
            if (!description)
              throw new Error("missing actual toggle description");
            for (const [previous, next] of [
              [label, control],
              [control, description],
            ]) {
              expect(
                next.getBoundingClientRect().top -
                  previous.getBoundingClientRect().bottom -
                  number(computed(doc, previous).marginBlockEnd),
                `${tier} ${phase} toggle relationship gap`,
              ).toBeCloseTo(itemGap, 2);
            }
          } else {
            const payload = doc.getElementById(`${prefix}-gap-payload`);
            if (!payload) throw new Error("missing actual field payload");
            expect(
              number(computed(doc, payload).rowGap),
              `${tier} payload internal gap remains independent`,
            ).toBeCloseTo(itemGap, 2);
            if (variant === "chrome-opt-out") {
              expect(
                metrics(doc, `${prefix}-gap-label`).occupied,
                `${tier} chrome-owned label remains unseated`,
              ).toBeCloseTo(tier === "site" ? 40 : 24, 2);
              expect(
                control.getBoundingClientRect().top -
                  label.getBoundingClientRect().top,
                `${tier} opted-out field keeps original relationship`,
              ).toBeCloseTo(tier === "site" ? 48 : 28, 2);
            } else if (variant === "side-by-side") {
              const before = {
                label: label.getBoundingClientRect().top,
                control: control.getBoundingClientRect().top,
                height: field.getBoundingClientRect().height,
              };
              field.style.rowGap = "99px";
              expect(
                label.getBoundingClientRect().top,
                `${tier} same-row label ignores row gap`,
              ).toBeCloseTo(before.label, 2);
              expect(
                control.getBoundingClientRect().top,
                `${tier} same-row control ignores row gap`,
              ).toBeCloseTo(before.control, 2);
              expect(
                field.getBoundingClientRect().height,
                `${tier} same-row field height ignores row gap`,
              ).toBeCloseTo(before.height, 2);
            } else {
              baselineToPayload.push(
                payload.getBoundingClientRect().top -
                  label.getBoundingClientRect().top -
                  metrics(doc, `${prefix}-gap-label`).baseline,
              );
            }
          }
        }
        if (baselineToPayload.length)
          expect(
            baselineToPayload[1],
            `${tier} ${variant} preserves label-baseline relationship`,
          ).toBeCloseTo(baselineToPayload[0], 2);
      }
    },
  );

  it.each(["none", "active"] as const)(
    "keeps RichChoices card construction unseated in forced colors %s",
    async (forcedColors) => {
      await emulate({ forcedColors });
      const doc = await render({
        root: "site",
        styles: [PRAGMA_CSS, richChoicesCss, beforeCss, fixtureCss],
        body: tiers
          .map(
            (tier) =>
              `<section class="${tier}">${["before", "adopted"].map((phase) => `<div class="${phase}"><fieldset class="ds form-rich-choices"><div class="ds option"><input type="radio" id="${tier}-${phase}-input"/><label id="${tier}-${phase}-card" class="p text-test" for="${tier}-${phase}-input">Text<i></i></label></div></fieldset></div>`).join("")}</section>`,
          )
          .join(""),
      });
      for (const tier of tiers) {
        const { before, adopted } = changed(doc, tier, "card", 0);
        expect(before.occupied, `${tier} original card`).toBeCloseTo(
          tier === "site" ? 56 : 40,
          2,
        );
        expect(adopted.occupied, `${tier} adopted card`).toBeCloseTo(
          tier === "site" ? 56 : 40,
          2,
        );
      }
    },
  );

  it.each(["none", "active"] as const)(
    "preserves mark gaps and disclosure keylines with the adopted text seat in forced colors %s",
    async (forcedColors) => {
      await emulate({ forcedColors });
      const doc = await render({
        root: "site",
        styles: [
          PRAGMA_CSS,
          spacingSeatCss,
          toggleCss,
          checkboxCss,
          choicesCss,
          accordionCss,
          accordionItemCss,
          navCss,
          navItemCss,
          beforeCss,
          fixtureCss,
          `.proof {width:300px;display:flow-root}.proof .side-navigation-item {width:240px}.proof i{display:inline-block;width:0;height:0}`,
        ],
        body: tiers
          .map(
            (tier) =>
              `<section class="${tier} proof">${["before", "adopted"]
                .map(
                  (phase) => `<div class="${phase}">
      <div class="ds field field-toggle"><div id="${tier}-${phase}-toggle" class="ds field-toggle-control spacing-text-seat"><input type="checkbox" class="ds form-checkbox"/><label class="ds field-label field-toggle-inline-label">Text<i></i></label></div></div>
      <div class="ds accordion"><details class="ds accordion-item" open><summary class="header"><span class="chevron"></span><span class="heading" id="${tier}-${phase}-heading">Heading</span></summary><div class="content editorial"><p id="${tier}-${phase}-content" class="p text-test">Text<i></i></p></div></details></div>
      <ul><li class="ds side-navigation-item"><a class="ds row spacing-control-seat-metrics"><span class="start"></span><span id="${tier}-${phase}-nav" class="ds side-navigation-label spacing-control-seat">Text<i></i></span></a></li></ul>
      </div>`,
                )
                .join("")}</section>`,
          )
          .join(""),
      });
      for (const tier of tiers) {
        const inset = tier === "site" ? 0 : 4;
        changed(doc, tier, "toggle", inset);
        changed(doc, tier, "content", inset);
        const navBefore = metrics(doc, `${tier}-before-nav`);
        const navAfter = metrics(doc, `${tier}-adopted-nav`);
        expect(
          navAfter.occupied,
          `${tier} nav control seat unchanged`,
        ).toBeCloseTo(navBefore.occupied, 2);
        for (const phase of ["before", "adopted"]) {
          const toggle = doc.getElementById(`${tier}-${phase}-toggle`);
          if (!toggle) throw new Error("missing toggle fixture");
          const mark = toggle.querySelector("input");
          const label = toggle.querySelector("label");
          if (!mark || !label) throw new Error("missing actual mark or label");
          expect(
            mark.getBoundingClientRect().width,
            `${tier} body mark size`,
          ).toBeCloseTo(tier === "site" ? 16 : 14, 2);
          expect(
            label.getBoundingClientRect().left -
              mark.getBoundingClientRect().right,
            `${tier} mark gap`,
          ).toBeCloseTo(8, 2);
          const heading = doc.getElementById(`${tier}-${phase}-heading`);
          const content = doc.getElementById(`${tier}-${phase}-content`);
          if (!heading || !content)
            throw new Error("missing actual keyline owner");
          expect(
            content.getBoundingClientRect().left -
              heading.getBoundingClientRect().left,
            `${tier} content keyline`,
          ).toBeCloseTo(0, 2);
        }
      }
    },
  );
});
