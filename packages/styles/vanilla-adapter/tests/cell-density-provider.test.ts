import { describe, expect, it } from "vitest";
import modifierCss from "../../main/src/private.spacing.modifiers.css?raw";
import primitiveCss from "../../main/src/private.spacing.primitive.css?raw";
import spacingRolesCss from "../../main/src/spacing-roles.css?raw";
import {
  COMPONENT_CSS,
  computed,
  emulate,
  layersCss,
  render,
} from "./support/pages.js";

const hosts = [
  "td",
  "th",
  "cell",
  "gridcell",
  "rowheader",
  "columnheader",
] as const;
const roots = ["", "global", "site", "docs", "app", "os"] as const;
const probe = (id: string): string =>
  `<i id="${id}" style="display:block;inline-size:var(--_density-inset-control-block)"></i>`;
const host = (kind: string, content: string): string =>
  kind === "td" || kind === "th"
    ? `<table><tbody><tr><${kind}>${content}</${kind}></tr></tbody></table>`
    : `<div role="${kind === "gridcell" ? "grid" : "table"}"><div role="row"><div role="${kind}">${content}</div></div></div>`;

describe("automatic cell density selection", () => {
  it.each(["none", "active"] as const)(
    "selects through DOM ancestry in forced-colors %s",
    async (forcedColors) => {
      await emulate({ forcedColors });
      for (const order of [
        [primitiveCss, modifierCss, spacingRolesCss],
        [spacingRolesCss, modifierCss, primitiveCss],
      ]) {
        for (const size of [14, 16, 20])
          for (const direction of ["ltr", "rtl"]) {
            const body = roots
              .map(
                (
                  root,
                  index,
                ) => `<section class="${root}" style="--_spacing-inset-control-block-dense:11px" dir="${direction}">
          ${hosts.map((kind, i) => host(kind, `${probe(`p${index}-${i}`)}<span class="dense" data-ds-density-reset><span class="comfortable" data-ds-density-reset>${probe(`w${index}-${i}`)}</span></span><section class="site">${probe(`b${index}-${i}`)}${host("cell", probe(`n${index}-${i}`))}</section>`)).join("")}
          ${root ? ["cell", "gridcell", "rowheader", "columnheader"].map((role, i) => `<div role="${role === "gridcell" ? "grid" : "table"}"><div role="row"><section class="${root}" role="${role}" id="same${index}-${i}" style="--_spacing-inset-control-block-dense:11px">${probe(`samep${index}-${i}`)}</section></div></div><section class="${root}">${probe(`default${index}-${i}`)}</section>`).join("") : ""}
          <div role="grid"><div role="row"><div id="move${index}" role="gridcell">${probe(`m${index}`)}</div></div></div><div class="site" role="table"><div role="row" id="target${index}"></div></div>
        </section>`,
              )
              .join("");
            const doc = await render({
              root: "",
              styles: [layersCss, ...order, `html { font-size:${size}px }`],
              body,
            });
            for (const [index] of roots.entries()) {
              for (const [i] of hosts.entries()) {
                for (const prefix of ["p", "w"])
                  expect(
                    computed(doc, `${prefix}${index}-${i}`).inlineSize,
                  ).toBe("11px");
                expect(computed(doc, `b${index}-${i}`).inlineSize).toBe("0px");
                expect(computed(doc, `n${index}-${i}`).inlineSize).toBe(
                  `${size / 4}px`,
                );
              }
              if (index > 0)
                for (let i = 0; i < 4; i += 1) {
                  const same = doc.getElementById(`same${index}-${i}`);
                  if (!same) throw new Error("missing same-element provider");
                  expect(computed(doc, `samep${index}-${i}`).inlineSize).toBe(
                    "11px",
                  );
                  const role = same.getAttribute("role");
                  if (!role) throw new Error("missing role");
                  same.removeAttribute("role");
                  expect(computed(doc, `samep${index}-${i}`).inlineSize).toBe(
                    computed(doc, `default${index}-${i}`).inlineSize,
                  );
                  same.setAttribute("role", role);
                  expect(computed(doc, `samep${index}-${i}`).inlineSize).toBe(
                    "11px",
                  );
                }
              const move = doc.getElementById(`move${index}`);
              const target = doc.getElementById(`target${index}`);
              if (!move || !target) throw new Error("missing fixture");
              expect(computed(doc, `m${index}`).inlineSize).toBe("11px");
              move.removeAttribute("role");
              expect(computed(doc, `m${index}`).inlineSize).not.toBe("11px");
              target.append(move);
              move.setAttribute("role", "cell");
              expect(computed(doc, `m${index}`).inlineSize).toBe(
                `${size / 4}px`,
              );
            }
          }
      }
    },
  );

  it("selects each product's ordinary dense value", async () => {
    const doc = await render({
      root: "",
      styles: [layersCss, primitiveCss, modifierCss, spacingRolesCss],
      body: roots
        .map(
          (root, index) =>
            `<div class="${root}">${host("cell", probe(`ordinary${index}`))}</div>`,
        )
        .join(""),
    });
    for (const [index, root] of roots.entries()) {
      expect(computed(doc, `ordinary${index}`).inlineSize).toBe(
        root === "os" ? "0px" : "4px",
      );
    }
  });

  it("detects the missing selection rule", async () => {
    const prior = spacingRolesCss.replace(
      /@layer ds\.density\s*\{[\s\S]*?\n\}/,
      "",
    );
    expect(prior).not.toBe(spacingRolesCss);
    const doc = await render({
      root: "site",
      styles: [layersCss, primitiveCss, modifierCss, prior],
      body: `<div style="--_spacing-inset-control-block-dense:11px">${host("cell", probe("negative"))}</div>`,
    });
    expect(() =>
      expect(computed(doc, "negative").inlineSize).toBe("11px"),
    ).toThrow();
    expect(computed(doc, "negative").inlineSize).toBe("0px");
  });

  it("leaves public aliases and the button fixture geometry unchanged when the private input changes", async () => {
    const doc = await render({
      root: "site",
      styles: [
        layersCss,
        primitiveCss,
        modifierCss,
        spacingRolesCss,
        COMPONENT_CSS,
      ],
      body: `<div role="table"><div role="row"><div role="cell" id="cell"><button class="ds button" id="button">Button</button>${probe("selected")}<i id="public" style="display:block;inline-size:var(--ds-spacing-control-inset);block-size:var(--ds-spacing-inset-surface-compact-block)"></i></div></div></div>`,
    });
    const button = doc.getElementById("button");
    const cell = doc.getElementById("cell");
    if (!button || !cell) throw new Error("missing fixture");
    const geometry = () => {
      const style = computed(doc, button);
      return [
        style.inlineSize,
        style.blockSize,
        style.paddingBlockStart,
        style.paddingBlockEnd,
      ];
    };
    const before = geometry();
    const aliases = [
      computed(doc, "public").inlineSize,
      computed(doc, "public").blockSize,
    ];
    cell.style.setProperty("--_spacing-inset-control-block-dense", "11px");
    expect(computed(doc, "selected").inlineSize).toBe("11px");
    expect(geometry()).toEqual(before);
    expect([
      computed(doc, "public").inlineSize,
      computed(doc, "public").blockSize,
    ]).toEqual(aliases);
  });
});
