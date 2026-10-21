import { describe, expect, it } from "vitest";
import sideNavigationDensityCss from "../../../react/ds-app/src/lib/SideNavigation/common/density.css?raw";
import chipCss from "../../../react/ds-global/src/lib/component/Chip/styles.css?inline";
import indexSource from "../../main/src/index.css?raw";
import modifierCss from "../../main/src/private.spacing.modifiers.css?raw";
import primitiveCss from "../../main/src/private.spacing.primitive.css?raw";
import spacingRolesCss from "../../main/src/spacing-roles.css?raw";
import tokensSource from "../../main/src/tokens.css?raw";
import {
  computed,
  differences,
  layersCss,
  render,
  tokensCss,
} from "./support/pages.js";

const ROOTS = ["root", "global", "site", "docs", "app", "os"] as const;
type ProductRoot = (typeof ROOTS)[number];

const CHANNELS = [
  ["baseline", "--spacing-baseline", "--ds-spacing-baseline"],
  ["control", "--spacing-inset-control-block", "--ds-spacing-control-inset"],
  [
    "dense",
    "--_spacing-inset-control-block-dense",
    "--ds-spacing-control-inset-dense",
  ],
  ["action", "--spacing-inset-action-inline", "--ds-spacing-action"],
  ["field", "--spacing-inset-input-inline", "--ds-spacing-field"],
  ["mark", "--spacing-gap-mark-inline", "--ds-spacing-mark"],
  ["item-block", "--spacing-gap-item-block", "--ds-spacing-item-block"],
  ["item-inline", "--spacing-gap-item-inline", "--ds-spacing-item-inline"],
  ["group", "--spacing-gap-group-block", "--ds-spacing-group"],
  ["section", "--spacing-gap-section-block", "--ds-spacing-section"],
  [
    "compact-inline",
    "--spacing-inset-surface-compact-inline",
    "--ds-spacing-inset-surface-compact-inline",
  ],
  [
    "compact-block",
    "--spacing-inset-surface-compact-block",
    "--ds-spacing-inset-surface-compact-block",
  ],
  [
    "standard-inline",
    "--spacing-inset-surface-standard-inline",
    "--ds-spacing-inset-surface-standard-inline",
  ],
  [
    "standard-block",
    "--spacing-inset-surface-standard-block",
    "--ds-spacing-inset-surface-standard-block",
  ],
  ["major-inline", "--grid-margin", "--ds-spacing-inset-surface-major-inline"],
] as const;

const EXPECTED: Record<ProductRoot, readonly number[]> = {
  root: [8, 0, 4, 16, 8, 8, 8, 8, 24, 72, 8, 0, 16, 16, 13],
  global: [8, 0, 4, 16, 8, 8, 8, 8, 24, 72, 8, 0, 16, 16, 13],
  site: [8, 0, 4, 16, 8, 8, 8, 8, 24, 72, 8, 0, 16, 16, 13],
  docs: [4, 4, 4, 12, 8, 8, 4, 8, 20, 40, 8, 4, 12, 12, 13],
  app: [4, 4, 4, 12, 8, 8, 4, 8, 20, 40, 8, 4, 12, 12, 13],
  os: [4, 0, 0, 8, 4, 4, 4, 4, 24, 48, 4, 0, 8, 8, 13],
};

const probes = (root: ProductRoot): string =>
  CHANNELS.flatMap(([name, provider, alias]) => [
    `<i id="${root}-${name}-provider" style="display:block;inline-size:var(${provider})"></i>`,
    `<i id="${root}-${name}-alias" style="display:block;inline-size:var(${alias})"></i>`,
  ]).join("");

const ROOT_BODY = ROOTS.map((root) =>
  root === "root"
    ? probes(root)
    : `<div class="${root}" style="--grid-margin:13px">${probes(root)}</div>`,
).join("");

const chip = (id: string): string =>
  `<span id="${id}" class="ds chip spacing-control-seat stroke-paint stroke" data-ds-density-subscriber="static-chip"><span class="value">Chip</span></span>`;

const row = (content: string): string =>
  `<div class="ds row sidenav-static-chip-provider-v1"><span class="end">${content}</span></div>`;

const LEGACY_ALIASES = `@layer ds.tokens {
  :root, .site {
    --ds-spacing-baseline: .5rem;
    --ds-spacing-control-inset: 0px;
    --ds-spacing-control-inset-dense: .25rem;
    --ds-spacing-action: 1rem;
    --ds-spacing-field: .5rem;
    --ds-spacing-mark: .5rem;
    --ds-spacing-item-block: .5rem;
    --ds-spacing-item-inline: .5rem;
    --ds-spacing-group: 1.5rem;
    --ds-spacing-section: 4.5rem;
  }
  .docs, .app {
    --ds-spacing-baseline: .25rem;
    --ds-spacing-control-inset: .25rem;
    --ds-spacing-control-inset-dense: .25rem;
    --ds-spacing-action: .75rem;
    --ds-spacing-field: .5rem;
    --ds-spacing-mark: .5rem;
    --ds-spacing-item-block: .25rem;
    --ds-spacing-item-inline: .5rem;
    --ds-spacing-group: 1.25rem;
    --ds-spacing-section: 2.5rem;
  }
  :where(:root, .site, .docs, .app) {
    --ds-spacing-inset-surface-compact-inline: var(--ds-spacing-field);
    --ds-spacing-inset-surface-compact-block: var(--ds-spacing-control-inset);
    --ds-spacing-inset-surface-standard-inline: var(--ds-spacing-action);
    --ds-spacing-inset-surface-standard-block: var(--ds-spacing-action);
    --ds-spacing-inset-surface-major-inline: var(--grid-margin);
  }
}`;

describe("the private spacing provider bridge", () => {
  it.each([
    ["primitive-first", [primitiveCss, modifierCss]],
    ["modifier-first", [modifierCss, primitiveCss]],
  ] as const)(
    "resolves every generated channel and compatibility alias at all six roots (%s)",
    async (_order, providerSheets) => {
      const doc = await render({
        root: "",
        styles: [
          layersCss,
          ...providerSheets,
          spacingRolesCss,
          ":root { --grid-margin: 13px; }",
        ],
        body: ROOT_BODY,
      });

      for (const root of ROOTS)
        for (const [index, [name]] of CHANNELS.entries()) {
          const expected = `${EXPECTED[root][index]}px`;
          expect(computed(doc, `${root}-${name}-provider`).inlineSize).toBe(
            expected,
          );
          expect(computed(doc, `${root}-${name}-alias`).inlineSize).toBe(
            expected,
          );
        }
    },
  );

  it("preserves existing typography through spacing-only Global and OS roots", async () => {
    const typography = (root: string): string =>
      `<i id="${root}-font" style="display:block;inline-size:var(--ds-typography-body-font-size)"></i><i id="${root}-line" style="display:block;inline-size:var(--ds-typography-body-line-height)"></i>`;
    const body = [
      typography("root"),
      `<div class="site">${typography("site")}</div>`,
      `<div class="docs">${typography("docs")}</div>`,
      `<div class="app">${typography("app")}<div class="global">${typography("global-in-app")}</div><div class="os">${typography("os-in-app")}</div></div>`,
    ].join("");
    const doc = await render({
      root: "",
      styles: [layersCss, primitiveCss, modifierCss, spacingRolesCss],
      body,
    });

    for (const [root, font, line] of [
      ["root", 16, 24],
      ["site", 16, 24],
      ["docs", 14, 20],
      ["app", 14, 20],
      ["global-in-app", 14, 20],
      ["os-in-app", 14, 20],
    ] as const) {
      expect(computed(doc, `${root}-font`).inlineSize).toBe(`${font}px`);
      expect(computed(doc, `${root}-line`).inlineSize).toBe(`${line}px`);
    }
  });

  it("keeps the token-only entry free of the governed selector adapter", () => {
    for (const source of [indexSource, tokensSource]) {
      expect(source).toContain(
        '@import url("./private.spacing.primitive.css")',
      );
      expect(source).toContain(
        '@import url("./private.spacing.modifiers.css")',
      );
      expect(source).not.toContain("governed-spacing.css");
    }
    for (const forbidden of [
      "data-ds-density-subscriber",
      "spacing-control-seat",
      "sidenav-static-chip-provider",
      ".ds.chip",
    ])
      expect(tokensCss).not.toContain(forbidden);
  });

  it("preserves supported default Chip geometry against the prior aliases", async () => {
    const body = ["site", "docs", "app"]
      .map((root) => `<div class="${root}">${chip(`${root}-default`)}</div>`)
      .join("");
    const current = await render({
      root: "",
      styles: [tokensCss, chipCss],
      body,
    });
    const legacy = await render({
      root: "",
      styles: [tokensCss, LEGACY_ALIASES, chipCss],
      body,
    });

    for (const root of ["site", "docs", "app"])
      expect(
        differences(
          root,
          computed(current, `${root}-default`),
          computed(legacy, `${root}-default`),
        ),
      ).toEqual([]);
  });

  it("enrolls direct and wrapped static Chips and honours DOM boundaries", async () => {
    const body = [
      `<div class="site">${chip("site-default")}${row(`${chip("site-direct")}<span>${chip("site-wrapped")}</span>`)}<div id="portal-target">${chip("site-portal")}</div></div>`,
      `<div class="docs">${chip("docs-default")}${row(`${chip("docs-direct")}<span>${chip("docs-wrapped")}</span>`)}</div>`,
      `<div class="app">${chip("app-default")}<span class="global">${chip("global-default")}</span><span class="site">${chip("nested-site-default")}</span><span class="os">${chip("os-default")}</span>${row(
        [
          chip("app-direct"),
          `<span>${chip("app-wrapped")}</span>`,
          `<span class="global">${chip("global-boundary")}${row(chip("global-reestablished"))}</span>`,
          `<span class="site">${chip("site-boundary")}${row(chip("site-reestablished"))}</span>`,
          `<span class="os">${chip("os-boundary")}</span>`,
        ].join(""),
      )}</div>`,
    ].join("");
    const doc = await render({
      root: "",
      styles: [tokensCss, chipCss, sideNavigationDensityCss],
      body,
    });
    const padding = (id: string): string => computed(doc, id).paddingBlockStart;

    for (const id of [
      "site-direct",
      "site-wrapped",
      "docs-direct",
      "docs-wrapped",
      "app-direct",
      "app-wrapped",
      "global-reestablished",
      "site-reestablished",
    ])
      expect(padding(id), id).toBe("4px");
    for (const [reference, boundary] of [
      ["global-default", "global-boundary"],
      ["nested-site-default", "site-boundary"],
      ["os-default", "os-boundary"],
      ["site-default", "site-portal"],
    ]) {
      expect(padding(boundary), boundary).toBe(padding(reference));
      expect(computed(doc, boundary).blockSize, boundary).toBe(
        computed(doc, reference).blockSize,
      );
      expect(computed(doc, boundary).marginBlockEnd, boundary).toBe(
        computed(doc, reference).marginBlockEnd,
      );
    }
  });

  it("moves a real static Chip consumer when its private provider input changes", async () => {
    const doc = await render({
      root: "",
      styles: [
        tokensCss,
        chipCss,
        sideNavigationDensityCss,
        "@layer ds.modifiers { .site { --_spacing-inset-control-block-dense: 11px; } }",
      ],
      body: `<div class="site">${chip("mutation-default")}${row(`${chip("mutation-direct")}<span>${chip("mutation-wrapped")}</span>`)}</div>`,
    });

    expect(computed(doc, "mutation-default").paddingBlockStart).not.toBe(
      "11px",
    );
    expect(computed(doc, "mutation-direct").paddingBlockStart).toBe("11px");
    expect(computed(doc, "mutation-wrapped").paddingBlockStart).toBe("11px");
  });
});
