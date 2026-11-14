import { useRoute } from "@canonical/router-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement, ReactNode } from "react";
import { userEvent } from "storybook/test";
import {
  machineTabsRoot,
  productTabsRoot,
  productTabsWithInertRoot,
  routerTabsRoot,
} from "../../../storybook/tabs/fixtures.js";
import {
  HashLink,
  withHashRouter,
} from "../../../storybook/tabs/story-utils.js";
import { Badge } from "../Badge/index.js";
import Component from "./Tabs.js";
import type { TabItem } from "./types.js";
import "../../../storybook/tabs/static-indicators.css";

const meta = {
  title: "components/Tabs",
  component: Component,
  args: {
    "aria-label": "Sections",
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof Component>;

/**
 * Default: tabs render as plain `<a>` links (no router). The fixture urls are
 * hash-relative (`#/overview`), so activating a tab stays on the page. The tab
 * matching `currentUrl` is marked active.
 */
export const Default: Story = {
  args: {
    navigationRoot: productTabsRoot,
    currentUrl: "#/overview",
  },
};

/**
 * A tab whose item has no `url` renders as inert, muted text rather than a link.
 */
export const WithInertTab: Story = {
  args: {
    navigationRoot: productTabsWithInertRoot,
    currentUrl: "#/overview",
  },
};

/**
 * Overflow: when the tabs exceed the container width the strip scrolls
 * horizontally.
 */
export const Overflow: Story = {
  args: {
    navigationRoot: machineTabsRoot,
    currentUrl: "#/overview",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "20rem" }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * Router integration via a custom `LinkComponent`.
 *
 * Tabs is router-agnostic — it only knows `LinkComponentProps`. This story
 * injects a `HashLink` adapter and derives `currentUrl` from the live route
 * (`useRoute()`), so tabs navigate client-side and the active tab follows
 * navigation. This is the pattern for wiring Tabs to a real router (e.g.
 * `@canonical/router-react`, Next.js, React Router). The other stories use the
 * default `<a>` and need no router.
 */
export const WithRouterLink: Story = {
  args: {
    navigationRoot: routerTabsRoot,
  },
  decorators: [withHashRouter],
  render: (args) => {
    const { pathname } = useRoute();
    return (
      <Component {...args} currentUrl={pathname} LinkComponent={HashLink} />
    );
  },
};

type IndicatorTier = "site" | "docs" | "app";
type IndicatorDensity = "default" | "dense" | "comfortable";

const indicatorRoot = (slot?: ReactNode): TabItem => ({
  key: "root",
  items: [
    {
      className: slot ? "indicator-tab" : "plain-tab",
      label: "Machines",
      slot,
      url: "#/machines",
    },
  ],
});

const IndicatorCase = ({
  tier,
  density,
  dir = "ltr",
}: {
  tier: IndicatorTier;
  density: IndicatorDensity;
  dir?: "ltr" | "rtl";
}): ReactElement => {
  const densityClass = density === "default" ? "" : density;
  const id = `${tier}-${density}-${dir}`;
  return (
    <section
      className={[tier, densityClass, "tabs-indicator-case"]
        .filter(Boolean)
        .join(" ")}
      data-tabs-indicator-case={id}
      dir={dir}
    >
      <h2>{`${tier} · ${density}${dir === "rtl" ? " · RTL" : ""}`}</h2>
      <div className="tabs-indicator-pair badge-pair">
        <Component
          aria-label={`${id} plain Badge comparison`}
          navigationRoot={indicatorRoot()}
        />
        <Component
          aria-label={`${id} Badge indicator`}
          navigationRoot={indicatorRoot(<Badge value={42} />)}
        />
      </div>
    </section>
  );
};

const apiCoverageRoot: TabItem = {
  key: "root",
  items: [
    { label: "Numeric", slot: 0, url: "#/numeric" },
    {
      disabled: true,
      label: "Disabled",
      slot: <Badge value={1234567} />,
      url: "#/disabled",
    },
    { key: "inert", label: "Inert", slot: <Badge value={3} /> },
    {
      label: "Wrapped",
      slot: (
        <span className="neutral-indicator-wrapper">
          <Badge value={1204} />
        </span>
      ),
      url: "#/wrapped",
    },
  ],
};

/**
 * Public Badge and other static, noninteractive content in the approved
 * indicator slot. Chips are not supported in tabs. Each Badge tab has an
 * intrinsic plain peer so baseline, occupied height and focus paint can be
 * compared without grid stretching.
 */
export const StaticIndicators: Story = {
  render: () => (
    <main className="tabs-indicator-proof">
      <h1>Tabs static indicators</h1>
      <p>
        Badge stays invariant across product and compatibility contexts. Chips
        are not supported in tabs.
      </p>
      <div className="tabs-indicator-grid">
        {(["site", "docs", "app"] as const).flatMap((tier) =>
          (["default", "dense", "comfortable"] as const).flatMap((density) =>
            (["ltr", "rtl"] as const).map((dir) => (
              <IndicatorCase
                key={`${tier}-${density}-${dir}`}
                tier={tier}
                density={density}
                dir={dir}
              />
            )),
          ),
        )}
      </div>
      <section className="app tabs-indicator-api-cases">
        <h2>API cases</h2>
        <Component
          aria-label="Static indicator API cases"
          navigationRoot={apiCoverageRoot}
        />
        <p>
          These are rendering and API examples, not additional geometry
          configurations. The accessible name uses the visible shortened count
          (for example, “Disabled 1.2M+”). The title also uses the shortened
          count.
        </p>
      </section>
    </main>
  ),
  play: async ({ canvasElement }) => {
    type ProofWindow = Window & {
      __tabsBadgeProofQueue?: Promise<void>;
    };
    const proofWindow = canvasElement.ownerDocument.defaultView as ProofWindow;
    const previous = proofWindow.__tabsBadgeProofQueue ?? Promise.resolve();
    const settledPrevious = previous.catch(() => undefined);
    const current = settledPrevious.then(async () => {
      const proofRoot = canvasElement.matches("main.tabs-indicator-proof")
        ? canvasElement
        : canvasElement.querySelector<HTMLElement>("main.tabs-indicator-proof");
      if (!proofRoot) throw new Error("missing Tabs Badge proof root");

      delete proofRoot.dataset.tabsBadgeProof;
      delete proofRoot.dataset.tabsBadgeProofError;
      delete proofRoot.dataset.tabsBadgePrimaryConfigurations;
      delete proofRoot.dataset.tabsBadgeCompatibilityObservations;
      delete proofRoot.dataset.tabsBadgeObservations;
      delete proofRoot.dataset.tabsBadgeFixtureConformance;

      const documentRoot = canvasElement.ownerDocument.documentElement;
      const originalRootFontSize = documentRoot.style.fontSize;
      const initialFocus =
        canvasElement.ownerDocument.activeElement instanceof HTMLElement
          ? canvasElement.ownerDocument.activeElement
          : null;
      let mutationHost: HTMLElement | null = null;
      let injectedChip: HTMLElement | null = null;

      const nextPaint = async (): Promise<void> => {
        await new Promise<void>((resolve) => {
          proofWindow.requestAnimationFrame(() =>
            proofWindow.requestAnimationFrame(() => resolve()),
          );
        });
      };
      const finite = (value: number, label: string): number => {
        if (!Number.isFinite(value)) throw new Error(`${label} is not finite`);
        return value;
      };
      const px = (value: string, label: string): number =>
        finite(Number.parseFloat(value), label);
      const near = (
        actual: number,
        expected: number,
        label: string,
        tolerance = 0.5,
      ): void => {
        finite(actual, `${label} actual`);
        finite(expected, `${label} expected`);
        if (Math.abs(actual - expected) > tolerance) {
          throw new Error(`${label}: expected ${expected}, received ${actual}`);
        }
      };
      const expectProofFailure = (proof: () => void, label: string): void => {
        try {
          proof();
        } catch {
          return;
        }
        throw new Error(`${label} mutation escaped its proof oracle`);
      };
      const assertFixtureContainsNoChip = (root: ParentNode): void => {
        if (root.querySelector(".tabs .chip")) {
          throw new Error(
            "StaticIndicators fixture contains an unsupported Chip",
          );
        }
      };
      const baseline = (element: HTMLElement, label: string): number => {
        const before = element.getBoundingClientRect();
        const marker = element.ownerDocument.createElement("span");
        marker.dataset.tabsBaselineMarker = "";
        marker.style.cssText =
          "display:inline-block;inline-size:0;block-size:0;margin:0;padding:0;border:0;vertical-align:baseline";
        element.append(marker);
        const value = finite(
          marker.getBoundingClientRect().bottom,
          `${label} baseline`,
        );
        marker.remove();
        const after = element.getBoundingClientRect();
        near(after.width, before.width, `${label} marker width`);
        near(after.height, before.height, `${label} marker height`);
        return value;
      };
      const assertTabBadgeBaseline = (
        badge: HTMLElement,
        label: HTMLElement,
        proofLabel: string,
      ): void => {
        near(
          baseline(badge, `${proofLabel} Badge`) -
            baseline(label, `${proofLabel} label`),
          0,
          `${proofLabel} baseline`,
        );
      };
      const assertTabBadgeFontSize = (
        badge: HTMLElement,
        rootSize: number,
        proofLabel: string,
      ): void => {
        near(
          px(
            proofWindow.getComputedStyle(badge).fontSize,
            `${proofLabel} Badge font size`,
          ),
          rootSize * 0.75,
          `${proofLabel} Badge font size`,
        );
      };
      const assertTabBadgeBodyLine = (
        link: HTMLElement,
        badge: HTMLElement,
        proofLabel: string,
      ): void => {
        const linkStyle = proofWindow.getComputedStyle(link);
        const linkRect = link.getBoundingClientRect();
        const badgeRect = badge.getBoundingClientRect();
        const lineStart =
          linkRect.top +
          px(linkStyle.paddingBlockStart, `${proofLabel} padding start`);
        const lineEnd =
          lineStart +
          px(linkStyle.lineHeight, `${proofLabel} label line height`);
        if (
          badgeRect.top < lineStart - 0.5 ||
          badgeRect.bottom > lineEnd + 0.5
        ) {
          throw new Error(`${proofLabel} Badge escapes the label body line`);
        }
      };
      const assertTabBadgeClearance = (
        link: HTMLElement,
        badge: HTMLElement,
        proofLabel: string,
      ): void => {
        const linkRect = link.getBoundingClientRect();
        const badgeRect = badge.getBoundingClientRect();
        const blockStartClearance = finite(
          badgeRect.top - linkRect.top,
          `${proofLabel} block-start clearance`,
        );
        const blockEndClearance = finite(
          linkRect.bottom - badgeRect.bottom,
          `${proofLabel} block-end clearance`,
        );
        if (blockStartClearance <= 0 || blockEndClearance <= 0) {
          throw new Error(`${proofLabel} Badge touches the tab edge`);
        }
      };

      try {
        for (const rootSize of [14, 16, 20]) {
          documentRoot.style.fontSize = `${rootSize}px`;
          await nextPaint();

          for (const tier of ["site", "docs", "app"] as const) {
            for (const density of [
              "default",
              "dense",
              "comfortable",
            ] as const) {
              for (const dir of ["ltr", "rtl"] as const) {
                const id = `${tier}-${density}-${dir}`;
                const section = proofRoot.querySelector<HTMLElement>(
                  `[data-tabs-indicator-case="${id}"]`,
                );
                const tabs = section?.querySelectorAll<HTMLElement>(
                  ":scope > .tabs-indicator-pair > .tabs",
                );
                const plainTabs = tabs?.item(0);
                const badgeTabs = tabs?.item(1);
                const plainLink =
                  plainTabs?.querySelector<HTMLElement>(".tabs-link");
                const badgeLink =
                  badgeTabs?.querySelector<HTMLElement>(".tabs-link");
                const badge = badgeLink?.querySelector<HTMLElement>(
                  ".tabs-indicator .badge",
                );
                const label =
                  badgeLink?.querySelector<HTMLElement>(".tabs-label");
                if (
                  !section ||
                  !plainTabs ||
                  !badgeTabs ||
                  !plainLink ||
                  !badgeLink ||
                  !badge ||
                  !label
                ) {
                  throw new Error(`missing ${id} Tabs Badge proof node`);
                }

                const plainLinkRect = plainLink.getBoundingClientRect();
                const badgeLinkRect = badgeLink.getBoundingClientRect();
                const plainLinkStyle = proofWindow.getComputedStyle(plainLink);
                near(
                  badgeLinkRect.height,
                  plainLinkRect.height,
                  `${id} link height`,
                );
                near(
                  badgeTabs.getBoundingClientRect().height,
                  plainTabs.getBoundingClientRect().height,
                  `${id} strip height`,
                );
                if (density !== "default") {
                  const defaultPlainLink = proofRoot.querySelector<HTMLElement>(
                    `[data-tabs-indicator-case="${tier}-default-${dir}"] .tabs-indicator-pair > .tabs:first-child .tabs-link`,
                  );
                  if (!defaultPlainLink) {
                    throw new Error(`missing ${id} default plain comparison`);
                  }
                  const defaultRect = defaultPlainLink.getBoundingClientRect();
                  const defaultStyle =
                    proofWindow.getComputedStyle(defaultPlainLink);
                  near(
                    plainLinkRect.height,
                    defaultRect.height,
                    `${id} compatibility height`,
                  );
                  near(
                    plainLinkRect.width,
                    defaultRect.width,
                    `${id} compatibility width`,
                  );
                  for (const property of [
                    "padding-block-start",
                    "padding-block-end",
                    "line-height",
                  ] as const) {
                    near(
                      px(
                        plainLinkStyle.getPropertyValue(property),
                        `${id} ${property}`,
                      ),
                      px(
                        defaultStyle.getPropertyValue(property),
                        `${id} default ${property}`,
                      ),
                      `${id} compatibility ${property}`,
                    );
                  }
                }
                assertTabBadgeBaseline(badge, label, id);
                assertTabBadgeFontSize(badge, rootSize, id);
                near(
                  px(
                    proofWindow.getComputedStyle(badge).lineHeight,
                    `${id} Badge line height`,
                  ),
                  rootSize,
                  `${id} Badge line height`,
                );
                assertTabBadgeBodyLine(badgeLink, badge, id);
                assertTabBadgeClearance(badgeLink, badge, id);

                const linkStyle = proofWindow.getComputedStyle(badgeLink);

                if (
                  badgeLink.hasAttribute("data-ds-density-provider") ||
                  badgeLink.hasAttribute("data-ds-density-policy-version") ||
                  badgeLink.classList.contains(
                    "tabs-static-chip-provider-v1",
                  ) ||
                  linkStyle.getPropertyValue("--tabs-static-chip-inset").trim()
                ) {
                  throw new Error(`${id} exposes removed Tab density support`);
                }
                assertFixtureContainsNoChip(badgeTabs);
              }
            }
          }

          if (rootSize === 16) {
            mutationHost = proofRoot.querySelector<HTMLElement>(
              '[data-tabs-indicator-case="site-default-ltr"]',
            );
            const links = mutationHost?.querySelectorAll<HTMLElement>(
              ":scope > .tabs-indicator-pair > .tabs .tabs-link",
            );
            const plainLink = links?.item(0);
            const badgeLink = links?.item(1);
            if (!mutationHost || !plainLink || !badgeLink) {
              throw new Error("missing Tabs Badge mutation proof node");
            }
            const originalHeight = badgeLink.getBoundingClientRect().height;
            mutationHost.style.setProperty(
              "--_typography-indicator-line-height",
              "3rem",
            );
            await nextPaint();
            if (
              badgeLink.getBoundingClientRect().height <=
              plainLink.getBoundingClientRect().height
            ) {
              throw new Error("Tabs Badge mutation did not grow its host");
            }
            mutationHost.style.removeProperty(
              "--_typography-indicator-line-height",
            );
            await nextPaint();
            near(
              badgeLink.getBoundingClientRect().height,
              originalHeight,
              "restored Tabs Badge height",
            );
            const badge = badgeLink.querySelector<HTMLElement>(".badge");
            const label = badgeLink.querySelector<HTMLElement>(".tabs-label");
            if (!badge || !label) {
              throw new Error("missing Tabs Badge causal-oracle node");
            }
            const originalBadgeStyle = badge.getAttribute("style");
            try {
              badge.style.position = "relative";
              badge.style.top = "-2px";
              expectProofFailure(
                () => assertTabBadgeBaseline(badge, label, "mutated"),
                "Tabs Badge baseline",
              );
              badge.style.removeProperty("position");
              badge.style.removeProperty("top");

              badge.style.fontSize = "1rem";
              expectProofFailure(
                () => assertTabBadgeFontSize(badge, 16, "mutated"),
                "Tabs Badge font size",
              );
              badge.style.removeProperty("font-size");

              badge.style.transform = "translateY(-8px)";
              expectProofFailure(
                () => assertTabBadgeBodyLine(badgeLink, badge, "mutated"),
                "Tabs Badge body line",
              );
              badge.style.removeProperty("transform");

              badge.style.transform = "translateY(-100px)";
              expectProofFailure(
                () => assertTabBadgeClearance(badgeLink, badge, "mutated"),
                "Tabs Badge edge clearance",
              );
            } finally {
              if (originalBadgeStyle === null) badge.removeAttribute("style");
              else badge.setAttribute("style", originalBadgeStyle);
            }
            assertTabBadgeBaseline(badge, label, "restored");
            assertTabBadgeFontSize(badge, 16, "restored");
            assertTabBadgeBodyLine(badgeLink, badge, "restored");
            assertTabBadgeClearance(badgeLink, badge, "restored");
            mutationHost = null;
          }
        }
        documentRoot.style.fontSize = "16px";
        await nextPaint();
        const focusLinks = proofRoot.querySelectorAll<HTMLElement>(
          '[data-tabs-indicator-case="site-default-ltr"] .tabs-link',
        );
        const focusPlainLink = focusLinks.item(0);
        const focusBadgeLink = focusLinks.item(1);
        if (!focusPlainLink || !focusBadgeLink) {
          throw new Error("missing representative keyboard focus fixture");
        }
        focusPlainLink.focus();
        const beforeKeyboardFocus = focusBadgeLink.getBoundingClientRect();
        await userEvent.tab();
        await nextPaint();
        if (canvasElement.ownerDocument.activeElement !== focusBadgeLink) {
          throw new Error("keyboard Tab did not focus the Badge tab");
        }
        if (!focusBadgeLink.matches(":focus-visible")) {
          throw new Error(
            "keyboard-focused Badge tab does not match :focus-visible",
          );
        }
        const focusStyle = proofWindow.getComputedStyle(focusBadgeLink);
        const focusOutlineWidth = px(
          focusStyle.outlineWidth,
          "focus outline width",
        );
        const focusOutlineOffset = px(
          focusStyle.outlineOffset,
          "focus outline offset",
        );
        if (
          focusStyle.outlineStyle === "none" ||
          focusOutlineWidth <= 0 ||
          focusOutlineOffset >= 0 ||
          focusStyle.outlineColor === "transparent" ||
          focusStyle.outlineColor === "rgba(0, 0, 0, 0)"
        ) {
          throw new Error(
            "keyboard-focused Badge tab has no inward visible outline paint",
          );
        }
        near(
          focusOutlineOffset,
          -focusOutlineWidth,
          "focus outline inward offset",
        );
        const afterKeyboardFocus = focusBadgeLink.getBoundingClientRect();
        near(
          afterKeyboardFocus.width,
          beforeKeyboardFocus.width,
          "keyboard focus width",
        );
        near(
          afterKeyboardFocus.height,
          beforeKeyboardFocus.height,
          "keyboard focus height",
        );

        const indicator =
          focusBadgeLink.querySelector<HTMLElement>(".tabs-indicator");
        if (!indicator) throw new Error("missing no-Chip fixture target");
        injectedChip = canvasElement.ownerDocument.createElement("span");
        injectedChip.className = "ds chip";
        indicator.append(injectedChip);
        expectProofFailure(
          () => assertFixtureContainsNoChip(proofRoot),
          "no-Chip fixture conformance",
        );
        injectedChip.remove();
        injectedChip = null;
        assertFixtureContainsNoChip(proofRoot);
        proofRoot.dataset.tabsBadgeFixtureConformance = "passed";
      } finally {
        injectedChip?.remove();
        const activeElement = canvasElement.ownerDocument.activeElement;
        if (activeElement instanceof HTMLElement) {
          activeElement.blur();
        }
        if (
          initialFocus?.isConnected &&
          initialFocus !== canvasElement.ownerDocument.body &&
          initialFocus !== canvasElement.ownerDocument.documentElement
        ) {
          initialFocus.focus();
        }
        mutationHost?.style.removeProperty(
          "--_typography-indicator-line-height",
        );
        documentRoot.style.fontSize = originalRootFontSize;
        await nextPaint();
      }

      if (proofRoot.querySelector("[data-tabs-baseline-marker]")) {
        throw new Error("Tabs Badge proof leaked a baseline marker");
      }
      proofRoot.dataset.tabsBadgePrimaryConfigurations = "18";
      proofRoot.dataset.tabsBadgeCompatibilityObservations = "36";
      proofRoot.dataset.tabsBadgeObservations = "54";
      proofRoot.dataset.tabsBadgeProof = "passed";
    });
    proofWindow.__tabsBadgeProofQueue = current;
    try {
      await current;
    } catch (error) {
      const proofRoot = canvasElement.matches("main.tabs-indicator-proof")
        ? canvasElement
        : canvasElement.querySelector<HTMLElement>("main.tabs-indicator-proof");
      if (proofRoot) {
        delete proofRoot.dataset.tabsBadgeProof;
        delete proofRoot.dataset.tabsBadgePrimaryConfigurations;
        delete proofRoot.dataset.tabsBadgeCompatibilityObservations;
        delete proofRoot.dataset.tabsBadgeObservations;
        proofRoot.dataset.tabsBadgeProofError =
          error instanceof Error ? error.message : String(error);
      }
      throw error;
    } finally {
      if (proofWindow.__tabsBadgeProofQueue === current) {
        delete proofWindow.__tabsBadgeProofQueue;
      }
    }
  },
};
