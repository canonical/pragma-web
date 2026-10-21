import { describe, expect, it } from "vitest";
import sideNavigationItemCss from "../../../react/ds-app/src/lib/SideNavigation/common/Item/styles.css?inline";
import sideNavigationCss from "../../../react/ds-app/src/lib/SideNavigation/styles.css?inline";
import badgeCss from "../../../react/ds-global/src/lib/component/Badge/styles.css?inline";
import spacingRolesCss from "../../main/src/spacing-roles.css?raw";
import {
  computed,
  emulate,
  layersCss,
  render,
  tokensCss,
} from "./support/pages.js";

const roots = ["root", "global", "site", "docs", "app", "os"] as const;
type Root = (typeof roots)[number];

const badge = (id: string, value = "42", style = ""): string =>
  `<span class="ds badge" id="${id}"${style ? ` style="${style}"` : ""}>${value}</span>`;

const rootMarkup = (root: Root, content: string): string =>
  root === "root" ? content : `<div class="${root}">${content}</div>`;

const privateValue = (
  doc: Document,
  target: string,
  property: string,
): string => computed(doc, target).getPropertyValue(property).trim();

const close = (actual: number, expected: number, tolerance = 0.02): void => {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
};

const px = (value: string): number => Number.parseFloat(value);

const baseline = (node: HTMLElement): number => {
  const before = node.getBoundingClientRect();
  const marker = node.ownerDocument.createElement("span");
  marker.style.cssText =
    "display:inline-block;width:0;height:0;padding:0;margin:0;border:0;vertical-align:baseline";
  node.prepend(marker);
  const result = marker.getBoundingClientRect().top;
  const during = node.getBoundingClientRect();
  marker.remove();
  const after = node.getBoundingClientRect();
  close(during.width, before.width);
  close(during.height, before.height);
  close(during.top, before.top);
  close(during.left, before.left);
  close(after.width, before.width);
  close(after.height, before.height);
  close(after.top, before.top);
  close(after.left, before.left);
  return result;
};

const styles = [layersCss, tokensCss, badgeCss];
const legacyTokensCss = tokensCss.replaceAll(
  /^\s*--_typography-indicator-(?:font-size|line-height):.*;\r?$/gm,
  "",
);

describe("the private invariant-indicator type", () => {
  it.each([14, 16, 20])(
    "resolves every product root and nested Global/OS precedence at a %ipx root",
    async (rootSize) => {
      const body = [
        ...roots.map((root) => rootMarkup(root, badge(`${root}-badge`))),
        `<div class="os">${badge("os-outer")}<div class="global">${badge("os-global")}</div></div>`,
        `<div class="global">${badge("global-outer")}<div class="os">${badge("global-os")}</div></div>`,
      ].join("");
      const doc = await render({
        root: "",
        styles: [...styles, `:root { font-size: ${rootSize}px; }`],
        body,
      });

      for (const root of roots) {
        const style = computed(doc, `${root}-badge`);
        const factor = root === "os" ? 0.625 : 0.75;
        close(px(style.fontSize), rootSize * factor);
        close(px(style.lineHeight), rootSize);
        close(px(style.minWidth), rootSize);
      }

      close(px(computed(doc, "os-global").fontSize), rootSize * 0.75);
      close(px(computed(doc, "global-os").fontSize), rootSize * 0.625);
      expect(
        privateValue(doc, "os-global", "--_typography-indicator-font-size"),
      ).toBe("0.75rem");
      expect(
        privateValue(doc, "global-os", "--_typography-indicator-font-size"),
      ).toBe("0.625rem");
    },
  );

  it("keeps default, dense and comfortable metrics invariant and responds to its private input", async () => {
    const doc = await render({
      root: "app",
      styles,
      body: [
        badge("default"),
        `<span class="dense">${badge("dense")}</span>`,
        `<span class="comfortable">${badge("comfortable")}</span>`,
      ].join(""),
    });

    for (const id of ["default", "dense", "comfortable"]) {
      expect(computed(doc, id).fontSize).toBe("12px");
      expect(computed(doc, id).lineHeight).toBe("16px");
    }

    const root = doc.documentElement;
    root.style.setProperty("--_typography-indicator-font-size", "1rem");
    root.style.setProperty("--_typography-indicator-line-height", "1.25rem");
    expect(computed(doc, "default").fontSize).toBe("16px");
    expect(computed(doc, "default").lineHeight).toBe("20px");
    root.style.removeProperty("--_typography-indicator-font-size");
    root.style.removeProperty("--_typography-indicator-line-height");
    expect(computed(doc, "default").fontSize).toBe("12px");
    expect(computed(doc, "default").lineHeight).toBe("16px");
  });

  it("derives the square minimum from actual line height while long content grows naturally", async () => {
    const doc = await render({
      root: "site",
      styles,
      body: [
        badge("one", "1"),
        badge("long", "999T+"),
        badge("unitless", "1", "--badge-line-height:1.5"),
        badge("length", "1", "--badge-line-height:1.25rem"),
      ].join(""),
    });

    for (const id of ["one", "unitless", "length"]) {
      const style = computed(doc, id);
      close(px(style.minWidth), px(style.lineHeight));
    }
    expect(px(computed(doc, "unitless").lineHeight)).toBe(18);
    expect(px(computed(doc, "length").lineHeight)).toBe(20);
    expect(
      doc.getElementById("long")?.getBoundingClientRect().width ?? 0,
    ).toBeGreaterThan(
      doc.getElementById("one")?.getBoundingClientRect().width ?? 0,
    );
  });

  it("retains the shipped Badge type when the private provider is absent", async () => {
    const doc = await render({
      root: "",
      styles: [layersCss, legacyTokensCss, badgeCss],
      body: badge("without-provider"),
    });
    const style = computed(doc, "without-provider");

    expect(legacyTokensCss).not.toContain("--_typography-indicator-");
    expect(style.fontSize).toBe("12px");
    close(px(style.lineHeight), 16);
    close(px(style.minWidth), px(style.lineHeight));
  });

  it("retains criticality and consumer background channels", async () => {
    const doc = await render({
      root: "site",
      styles,
      body: `${badge("default-paint")}${badge("critical", "42").replace('class="ds badge"', 'class="ds badge error"')}${badge("custom", "42", "--badge-color-background:rgb(1 2 3)")}`,
    });

    expect(computed(doc, "custom").backgroundColor).toBe("rgb(1, 2, 3)");
    expect(computed(doc, "critical").backgroundColor).not.toBe(
      computed(doc, "default-paint").backgroundColor,
    );
  });

  it("lets forced colors suppress the fill while keeping native visible text", async () => {
    await emulate({ forcedColors: "active" });
    const doc = await render({
      root: "site",
      styles,
      body: `${badge(
        "forced",
        "42",
        "--badge-color-background:rgb(1 2 3)",
      )}<span id="system-colors" style="background:Canvas;color:CanvasText">native</span>`,
    });
    const style = computed(doc, "forced");
    const system = computed(doc, "system-colors");

    expect(style.forcedColorAdjust).toBe("auto");
    expect(style.backgroundColor).toBe(system.backgroundColor);
    expect(style.backgroundColor).not.toBe("rgb(1, 2, 3)");
    expect(style.color).toBe(system.color);
    expect(style.color).not.toBe("rgba(0, 0, 0, 0)");
  });

  it("keeps the token-only source declarations-only and the Badge outside density membership", () => {
    expect(spacingRolesCss).toContain(
      "--_typography-indicator-font-size: 0.75rem",
    );
    expect(spacingRolesCss).toContain(
      "--_typography-indicator-font-size: 0.625rem",
    );
    expect(spacingRolesCss).toContain(
      "--_typography-indicator-line-height: 1rem",
    );
    expect(badgeCss).not.toMatch(/data-ds-density|\.dense|\.comfortable/);
  });
});

const sideNavigationStyles = [
  layersCss,
  tokensCss,
  badgeCss,
  sideNavigationCss,
  sideNavigationItemCss,
  `.indicator-fixture { position:relative; inset:auto; z-index:auto; min-block-size:0; block-size:auto; inline-size:15rem }
   .indicator-fixture-list { list-style:none; margin:0; padding:0 }`,
];

const navItem = (id: string, withBadge: boolean): string => `
  <li class="ds side-navigation-item" id="${id}-item">
    <a class="ds row spacing-control-seat-metrics sidenav-static-chip-provider-v1" href="#${id}" id="${id}-row">
      <span class="start"></span>
      <span class="ds side-navigation-label spacing-control-seat" id="${id}-label">Machines</span>
      ${withBadge ? `<span class="end slot">${badge(`${id}-badge`)}</span>` : ""}
    </a>
  </li>`;

const navCase = (
  tier: "site" | "docs" | "app",
  density: "default" | "dense" | "comfortable",
  dir: "ltr" | "rtl" = "ltr",
): string => {
  const id = `${tier}-${density}-${dir}`;
  const densityClass = density === "default" ? "" : density;
  return `<section class="${tier} ${densityClass}" dir="${dir}">
    <div class="ds side-navigation indicator-fixture">
      <ul class="indicator-fixture-list">
        ${navItem(`${id}-plain`, false)}
        ${navItem(`${id}-nested`, true)}
      </ul>
    </div>
  </section>`;
};

describe("Badge in the existing SideNavigation trailing slot", () => {
  it("shares the seated label baseline, stays within its body line and does not grow the host", async () => {
    const cases = (["site", "docs", "app"] as const).flatMap((tier) =>
      (["default", "dense", "comfortable"] as const).map((density) => ({
        density,
        id: `${tier}-${density}-ltr`,
        tier,
      })),
    );
    for (const rootSize of [14, 16, 20]) {
      const doc = await render({
        root: "",
        styles: [
          ...sideNavigationStyles,
          `:root { font-size: ${rootSize}px; }`,
        ],
        body: cases.map(({ tier, density }) => navCase(tier, density)).join(""),
      });

      for (const { id } of cases) {
        const plainItem = doc.getElementById(`${id}-plain-item`);
        const nestedItem = doc.getElementById(`${id}-nested-item`);
        const plainRow = doc.getElementById(`${id}-plain-row`);
        const nestedRow = doc.getElementById(`${id}-nested-row`);
        const label = doc.getElementById(`${id}-nested-label`);
        const badgeNode = doc.getElementById(`${id}-nested-badge`);
        if (
          !plainItem ||
          !nestedItem ||
          !plainRow ||
          !nestedRow ||
          !label ||
          !badgeNode
        )
          throw new Error(`missing ${id} fixture node`);

        close(
          nestedItem.getBoundingClientRect().height,
          plainItem.getBoundingClientRect().height,
        );
        close(
          nestedRow.getBoundingClientRect().height,
          plainRow.getBoundingClientRect().height,
        );
        close(baseline(badgeNode) - baseline(label), 0, 0.1);

        const labelStyle = computed(doc, label);
        const labelRect = label.getBoundingClientRect();
        const badgeRect = badgeNode.getBoundingClientRect();
        const lineStart = labelRect.top + px(labelStyle.paddingBlockStart);
        const lineEnd = lineStart + px(labelStyle.lineHeight);
        expect(badgeRect.top).toBeGreaterThanOrEqual(lineStart - 0.1);
        expect(badgeRect.bottom).toBeLessThanOrEqual(lineEnd + 0.1);

        const beforeFocus = nestedRow.getBoundingClientRect();
        nestedRow.focus();
        const afterFocus = nestedRow.getBoundingClientRect();
        close(afterFocus.width, beforeFocus.width);
        close(afterFocus.height, beforeFocus.height);
      }

      if (rootSize === 16) {
        const host = doc
          .getElementById("site-default-ltr-nested-item")
          ?.closest<HTMLElement>("section");
        const plainRow = doc.getElementById("site-default-ltr-plain-row");
        const nestedRow = doc.getElementById("site-default-ltr-nested-row");
        const label = doc.getElementById("site-default-ltr-nested-label");
        const badgeNode = doc.getElementById("site-default-ltr-nested-badge");
        if (!host || !plainRow || !nestedRow || !label || !badgeNode)
          throw new Error("missing mutation-sensitivity fixture node");

        host.style.setProperty("--_typography-indicator-line-height", "3rem");
        const labelStyle = computed(doc, label);
        const labelRect = label.getBoundingClientRect();
        const badgeRect = badgeNode.getBoundingClientRect();
        const lineStart = labelRect.top + px(labelStyle.paddingBlockStart);
        const lineEnd = lineStart + px(labelStyle.lineHeight);
        expect(
          badgeRect.top >= lineStart - 0.1 && badgeRect.bottom <= lineEnd + 0.1,
        ).toBe(false);
        expect(nestedRow.getBoundingClientRect().height).toBeGreaterThan(
          plainRow.getBoundingClientRect().height,
        );

        host.style.removeProperty("--_typography-indicator-line-height");
        close(
          nestedRow.getBoundingClientRect().height,
          plainRow.getBoundingClientRect().height,
        );
      }
    }
  });

  it("keeps the same fit in RTL", async () => {
    const doc = await render({
      root: "",
      styles: sideNavigationStyles,
      body: navCase("app", "dense", "rtl"),
    });
    const plain = doc.getElementById("app-dense-rtl-plain-row");
    const nested = doc.getElementById("app-dense-rtl-nested-row");
    const label = doc.getElementById("app-dense-rtl-nested-label");
    const badgeNode = doc.getElementById("app-dense-rtl-nested-badge");
    if (!plain || !nested || !label || !badgeNode)
      throw new Error("missing RTL fixture node");

    close(
      nested.getBoundingClientRect().height,
      plain.getBoundingClientRect().height,
    );
    close(baseline(badgeNode) - baseline(label), 0, 0.1);
  });
});
