import { describe, expect, it } from "vitest";
import sideNavigationItemCss from "../../../react/ds-app/src/lib/SideNavigation/common/Item/styles.css?inline";
import sideNavigationCss from "../../../react/ds-app/src/lib/SideNavigation/styles.css?inline";
import badgeCss from "../../../react/ds-global/src/lib/component/Badge/styles.css?inline";
import chipCss from "../../../react/ds-global/src/lib/component/Chip/styles.css?inline";
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

const roundedCapsuleClearance = (
  chipRect: DOMRect,
  badgeRect: DOMRect,
  radius: number,
  stroke: number,
): number => {
  const halfWidth = chipRect.width / 2 - stroke;
  const halfHeight = chipRect.height / 2 - stroke;
  const innerRadius = Math.max(
    0,
    Math.min(radius, chipRect.width / 2, chipRect.height / 2) - stroke,
  );
  const centerX = chipRect.left + chipRect.width / 2;
  const centerY = chipRect.top + chipRect.height / 2;
  const corners = [
    [badgeRect.left, badgeRect.top],
    [badgeRect.right, badgeRect.top],
    [badgeRect.right, badgeRect.bottom],
    [badgeRect.left, badgeRect.bottom],
  ] as const;
  return Math.min(
    ...corners.map(([x, y]) => {
      const qx = Math.abs(x - centerX) - (halfWidth - innerRadius);
      const qy = Math.abs(y - centerY) - (halfHeight - innerRadius);
      const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
      const inside = Math.min(Math.max(qx, qy), 0);
      return -(outside + inside - innerRadius);
    }),
  );
};

const px = (value: string): number => Number.parseFloat(value);

const baseline = (node: HTMLElement): number => {
  const before = node.getBoundingClientRect();
  const marker = node.ownerDocument.createElement("span");
  marker.dataset.baselineMarker = "";
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
  expect(node.querySelector("[data-baseline-marker]")).toBeNull();
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

const chipBadgeStyles = [
  ...sideNavigationStyles,
  chipCss,
  `.chip-badge-test-row { display:flex; align-items:flex-start; inline-size:max-content }
   .chip-badge-test-nav { position:relative; inset:auto; z-index:auto; min-block-size:0; block-size:auto; inline-size:20rem }
   .chip-badge-test-list { list-style:none; margin:0; padding:0 }`,
];

const chip = (
  id: string,
  withBadge: boolean,
  badgeValue: string,
  badgeClass = "",
  badgeStyle = "",
): string => `<span
  class="ds chip spacing-control-seat stroke-paint stroke"
  data-ds-density-subscriber="static-chip"
  id="${id}-chip"
><span class="value" id="${id}-label">Machines</span>${
  withBadge
    ? badge(`${id}-badge`, badgeValue, badgeStyle).replace(
        'class="ds badge"',
        `class="ds badge${badgeClass ? ` ${badgeClass}` : ""}"`,
      )
    : ""
}</span>`;

const chipNavItem = (
  id: string,
  withBadge: boolean,
  badgeValue: string,
  badgeClass = "",
  badgeStyle = "",
): string => `
  <li class="ds side-navigation-item" id="${id}-row">
    <span class="ds row spacing-control-seat-metrics sidenav-static-chip-provider-v1">
      <span class="start"></span>
      <span class="ds side-navigation-label spacing-control-seat">${
        withBadge ? "Badge Chip" : "Plain Chip"
      }</span>
      <span class="end slot">${chip(
        id,
        withBadge,
        badgeValue,
        badgeClass,
        badgeStyle,
      )}</span>
    </span>
  </li>`;

const chipBadgeCase = (
  tier: "site" | "docs" | "app",
  density: "default" | "dense" | "comfortable",
  dir: "ltr" | "rtl" = "ltr",
): string => {
  const id = `${tier}-${density}-${dir}`;
  const densityClass = density === "default" ? "" : density;
  const badgeValue = density === "comfortable" ? "132M+" : "7";
  const badgeClass = density === "dense" ? "error" : "";
  const badgeStyle =
    tier === "app" && density === "comfortable"
      ? "--badge-color-background:rgb(1 2 3)"
      : "";
  return `<section class="${tier} ${densityClass}" dir="${dir}" id="${id}-host">
    <div class="chip-badge-test-row" id="${id}-standalone-plain-row">${chip(
      `${id}-standalone-plain`,
      false,
      badgeValue,
    )}</div>
    <div class="chip-badge-test-row" id="${id}-standalone-badge-row">${chip(
      `${id}-standalone-badge`,
      true,
      badgeValue,
      badgeClass,
      badgeStyle,
    )}</div>
    <div class="ds side-navigation chip-badge-test-nav">
      <ul class="chip-badge-test-list">
        ${chipNavItem(`${id}-navigation-plain`, false, badgeValue)}
        ${chipNavItem(
          `${id}-navigation-badge`,
          true,
          badgeValue,
          badgeClass,
          badgeStyle,
        )}
      </ul>
    </div>
  </section>`;
};

const assertChipBadgePair = (
  doc: Document,
  id: string,
  placement: "standalone" | "navigation",
  rootSize: number,
): void => {
  const plainId = `${id}-${placement}-plain`;
  const badgeId = `${id}-${placement}-badge`;
  const plainChip = doc.getElementById(`${plainId}-chip`);
  const badgeChip = doc.getElementById(`${badgeId}-chip`);
  const plainRow = doc.getElementById(`${plainId}-row`);
  const badgeRow = doc.getElementById(`${badgeId}-row`);
  const label = doc.getElementById(`${badgeId}-label`);
  const badgeNode = doc.getElementById(`${badgeId}-badge`);
  if (!plainChip || !badgeChip || !plainRow || !badgeRow || !label || !badgeNode)
    throw new Error(`missing ${id} ${placement} fixture node`);

  const plainChipRect = plainChip.getBoundingClientRect();
  const chipRect = badgeChip.getBoundingClientRect();
  const badgeRect = badgeNode.getBoundingClientRect();
  const stroke = px(
    computed(doc, badgeChip).getPropertyValue("--chip-border-width"),
  );
  const radius = px(computed(doc, badgeChip).borderRadius);
  close(chipRect.height, plainChipRect.height);
  close(
    badgeRow.getBoundingClientRect().height,
    plainRow.getBoundingClientRect().height,
  );
  close(baseline(badgeNode) - baseline(label), 0, 0.1);
  expect(badgeRect.top - chipRect.top - stroke).toBeGreaterThan(0);
  expect(chipRect.bottom - stroke - badgeRect.bottom).toBeGreaterThan(0);
  expect(badgeRect.left - chipRect.left - stroke).toBeGreaterThan(0);
  expect(chipRect.right - stroke - badgeRect.right).toBeGreaterThan(0);
  expect(
    roundedCapsuleClearance(chipRect, badgeRect, radius, stroke),
  ).toBeGreaterThan(0);
  close(px(computed(doc, badgeNode).fontSize), rootSize * 0.75);
  close(px(computed(doc, badgeNode).lineHeight), rootSize);
};

describe("Badge in the public Chip slot", () => {
  it("shares the Chip label baseline, preserves host sizes and clears every painted edge", async () => {
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
          ...chipBadgeStyles,
          `:root { font-size: ${rootSize}px; }`,
        ],
        body: cases.map(({ tier, density }) => chipBadgeCase(tier, density)).join(""),
      });

      for (const { id } of cases) {
        assertChipBadgePair(doc, id, "standalone", rootSize);
        assertChipBadgePair(doc, id, "navigation", rootSize);
      }

      if (rootSize === 16) {
        const host = doc.getElementById("site-default-ltr-host");
        const plainChip = doc.getElementById(
          "site-default-ltr-standalone-plain-chip",
        );
        const badgeChip = doc.getElementById(
          "site-default-ltr-standalone-badge-chip",
        );
        const badgeNode = doc.getElementById(
          "site-default-ltr-standalone-badge-badge",
        );
        if (!host || !plainChip || !badgeChip || !badgeNode)
          throw new Error("missing Chip mutation-sensitivity fixture node");
        host.style.setProperty("--_typography-indicator-line-height", "3rem");
        expect(badgeChip.getBoundingClientRect().height).toBeGreaterThan(
          plainChip.getBoundingClientRect().height,
        );
        host.style.removeProperty("--_typography-indicator-line-height");
        close(
          badgeChip.getBoundingClientRect().height,
          plainChip.getBoundingClientRect().height,
        );
        expect(computed(doc, badgeNode).lineHeight).toBe("16px");
      }
    }
  });

  it("keeps logical spacing and painted clearance in RTL", async () => {
    const doc = await render({
      root: "",
      styles: chipBadgeStyles,
      body: chipBadgeCase("app", "dense", "rtl"),
    });
    assertChipBadgePair(doc, "app-dense-rtl", "standalone", 16);
    assertChipBadgePair(doc, "app-dense-rtl", "navigation", 16);
  });

  it("suppresses a custom Badge fill in forced colors without hiding its text", async () => {
    await emulate({ forcedColors: "active" });
    const doc = await render({
      root: "",
      styles: chipBadgeStyles,
      body: `${chipBadgeCase("app", "comfortable")}<span id="chip-system-colors" style="background:Canvas;color:CanvasText">native</span>`,
    });
    const badgeNode = doc.getElementById(
      "app-comfortable-ltr-standalone-badge-badge",
    );
    if (!badgeNode) throw new Error("missing forced-colors Chip Badge");
    const style = computed(doc, badgeNode);
    const system = computed(doc, "chip-system-colors");
    expect(style.backgroundColor).toBe(system.backgroundColor);
    expect(style.backgroundColor).not.toBe("rgb(1, 2, 3)");
    expect(style.color).toBe(system.color);
    expect(style.color).not.toBe("rgba(0, 0, 0, 0)");
  });
});
