import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties, ReactElement } from "react";
import { createPortal } from "react-dom";
import { userEvent } from "storybook/test";
import Component from "./Breadcrumbs.js";
import Item from "./common/Item/Item.js";
import type { ItemProps } from "./common/Item/types.js";
import type { LinkComponentProps } from "./types.js";

type Tier = "site" | "docs" | "app";
type Direction = "ltr" | "rtl";

const tiers = ["site", "docs", "app"] as const;
const directions = ["ltr", "rtl"] as const;

const defaultItems = [
  { url: "/", label: "Home" },
  { url: "/unavailable", label: "Unavailable", disabled: true },
  { key: "current", label: "Current", current: true },
];

const wrappedItems = [
  { url: "/", label: "Home" },
  { url: "/server", label: "Server" },
  { url: "/server/docs", label: "Documentation" },
  { url: "/server/docs/install", label: "Installation" },
  { key: "advanced", label: "Advanced", current: true },
];

const ProofCustomItem = (props: ItemProps): ReactElement => (
  <Item {...props} data-breadcrumb-proof-custom-item="" />
);

const ProofLink = ({
  children,
  ...props
}: LinkComponentProps): ReactElement => (
  <a {...props} data-breadcrumb-proof-custom-link="">
    {children}
  </a>
);

const customItems = [
  {
    url: "/custom",
    label: "Custom link",
    Component: ProofCustomItem,
  },
  {
    key: "custom-current",
    label: "Custom current",
    current: true,
    Component: ProofCustomItem,
  },
];

const ProofCase = ({
  tier,
  direction,
}: {
  tier: Tier;
  direction: Direction;
}): ReactElement => {
  const id = `${tier}-${direction}`;
  return (
    <section
      className={tier}
      data-breadcrumb-spacing-case={id}
      dir={direction}
      style={{ display: "grid", gap: "0.5rem", maxInlineSize: "48rem" }}
    >
      <h2 style={{ margin: 0 }}>{id}</h2>
      <h3 style={{ margin: 0 }}>Default (current and disabled)</h3>
      <Component data-breadcrumb-proof-default="" items={defaultItems} />
      <h3 style={{ margin: 0 }}>Wrapped</h3>
      <div
        data-breadcrumb-proof-wrap=""
        style={{ inlineSize: "18rem", maxInlineSize: "100%" }}
      >
        <Component data-breadcrumb-proof-wrapped="" items={wrappedItems} />
      </div>
      <h3 style={{ margin: 0 }}>Custom separator and components</h3>
      <Component
        data-breadcrumb-proof-custom=""
        items={customItems}
        LinkComponent={ProofLink}
        separator="›"
      />
    </section>
  );
};

const meta = {
  title: "components/Breadcrumbs/Spacing adoption",
  component: Component,
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Real Breadcrumbs at the three product tiers. The play checks 18 primary
 * configurations: three tiers by three root sizes by two directions. The
 * state and custom-API observations repeat those configurations and are
 * reported separately.
 */
export const SpacingRoles: Story = {
  args: { items: [] },
  render: () => (
    <main
      className="breadcrumb-spacing-proof"
      data-breadcrumb-spacing-proof-root=""
      style={{ display: "grid", gap: "2rem" }}
    >
      <a
        data-breadcrumb-proof-focus-start=""
        href="#breadcrumb-proof-focus-start"
        id="breadcrumb-proof-focus-start"
        style={{
          blockSize: "1px",
          clipPath: "inset(50%)",
          inlineSize: "1px",
          overflow: "hidden",
          position: "absolute",
        }}
      >
        Focus start
      </a>
      {tiers.flatMap((tier) =>
        directions.map((direction) => (
          <ProofCase
            direction={direction}
            key={`${tier}-${direction}`}
            tier={tier}
          />
        )),
      )}
    </main>
  ),
  play: async ({ canvasElement }) => {
    type ProofWindow = Window & {
      __breadcrumbSpacingProofQueue?: Promise<void>;
    };
    const proofWindow = canvasElement.ownerDocument
      .defaultView as ProofWindow | null;
    if (!proofWindow) throw new Error("missing Breadcrumbs proof window");

    const previous =
      proofWindow.__breadcrumbSpacingProofQueue ?? Promise.resolve();
    const current = previous
      .catch(() => undefined)
      .then(async () => {
        const proofRoot = canvasElement.matches(
          "[data-breadcrumb-spacing-proof-root]",
        )
          ? (canvasElement as HTMLElement)
          : canvasElement.querySelector<HTMLElement>(
              "[data-breadcrumb-spacing-proof-root]",
            );
        if (!proofRoot) throw new Error("missing Breadcrumbs proof root");

        for (const key of [
          "breadcrumbSpacingProof",
          "breadcrumbSpacingProofError",
          "breadcrumbPrimaryConfigurations",
          "breadcrumbRoleObservations",
          "breadcrumbStateCompatibilityConfigurations",
          "breadcrumbCustomCompatibilityConfigurations",
          "breadcrumbForcedColors",
          "breadcrumbForcedColorReadabilityConfigurations",
        ] as const) {
          delete proofRoot.dataset[key];
        }

        const proofDocument = canvasElement.ownerDocument;
        const documentRoot = proofDocument.documentElement;
        const originalRootFontSize = documentRoot.style.fontSize;
        const initialFocus =
          proofDocument.activeElement instanceof HTMLElement
            ? proofDocument.activeElement
            : null;
        const forcedColorsActive = proofWindow.matchMedia(
          "(forced-colors: active)",
        ).matches;
        const activeMutations = new Map<HTMLElement, string | null>();
        let proofError: unknown;
        let primaryConfigurations = 0;
        let roleObservations = 0;
        let stateCompatibilityConfigurations = 0;
        let customCompatibilityConfigurations = 0;
        let forcedColorReadabilityConfigurations = 0;

        const nextPaint = async (): Promise<void> => {
          await new Promise<void>((resolve) => {
            proofWindow.requestAnimationFrame(() =>
              proofWindow.requestAnimationFrame(() => resolve()),
            );
          });
        };
        const finite = (value: number, label: string): number => {
          if (!Number.isFinite(value)) {
            throw new Error(`${label} is not finite`);
          }
          return value;
        };
        const px = (value: string, label: string): number =>
          finite(Number.parseFloat(value), label);
        const near = (
          actual: number,
          expected: number,
          label: string,
          tolerance = 0.55,
        ): void => {
          finite(actual, `${label} actual`);
          finite(expected, `${label} expected`);
          if (Math.abs(actual - expected) > tolerance) {
            throw new Error(
              `${label}: expected ${expected}, received ${actual}`,
            );
          }
        };
        const rememberStyle = (node: HTMLElement): void => {
          if (!activeMutations.has(node)) {
            activeMutations.set(node, node.getAttribute("style"));
          }
        };
        const restoreStyle = (node: HTMLElement): void => {
          const original = activeMutations.get(node);
          if (original === undefined) return;
          if (original === null) node.removeAttribute("style");
          else node.setAttribute("style", original);
          activeMutations.delete(node);
        };
        const resolveLength = (
          owner: HTMLElement,
          property: string,
          label: string,
        ): number => {
          const probe = proofDocument.createElement("span");
          probe.style.cssText = `position:fixed;visibility:hidden;display:block;inline-size:var(${property});block-size:0;padding:0;margin:0;border:0`;
          owner.append(probe);
          const result = px(
            proofWindow.getComputedStyle(probe).inlineSize,
            label,
          );
          probe.remove();
          return result;
        };
        const logicalGap = (
          first: DOMRect,
          second: DOMRect,
          direction: Direction,
          label: string,
        ): number => {
          if (direction === "ltr" && first.right <= second.left) {
            return second.left - first.right;
          }
          if (direction === "rtl" && second.right <= first.left) {
            return first.left - second.right;
          }
          throw new Error(`${label} is reversed or overlaps`);
        };
        const rowsFor = (
          list: HTMLElement,
        ): Array<{ top: number; bottom: number }> => {
          const rows: Array<{ top: number; bottom: number }> = [];
          const items = Array.from(list.children).filter(
            (child): child is HTMLElement => child instanceof HTMLElement,
          );
          for (const item of items) {
            const rect = item.getBoundingClientRect();
            let row = rows.find(
              (candidate) => Math.abs(candidate.top - rect.top) <= 0.75,
            );
            if (!row) {
              row = { top: rect.top, bottom: rect.bottom };
              rows.push(row);
            } else {
              row.bottom = Math.max(row.bottom, rect.bottom);
            }
          }
          return rows.sort((a, b) => a.top - b.top);
        };
        const actualRowGaps = (list: HTMLElement, label: string): number[] => {
          const rows = rowsFor(list);
          if (rows.length < 2)
            throw new Error(`${label} did not wrap naturally`);
          return rows
            .slice(1)
            .map((row, index) =>
              finite(row.top - rows[index].bottom, `${label} row gap`),
            );
        };
        const assertVisibleText = (node: HTMLElement, label: string): void => {
          const style = proofWindow.getComputedStyle(node);
          if (
            !node.textContent?.trim() ||
            node.getBoundingClientRect().width <= 0 ||
            node.getBoundingClientRect().height <= 0 ||
            style.color === "transparent" ||
            style.color === "rgba(0, 0, 0, 0)"
          ) {
            throw new Error(`${label} is not visibly rendered`);
          }
        };
        const colorProbe = proofDocument.createElement("span");
        colorProbe.style.cssText =
          "position:fixed;visibility:hidden;color:Canvas;background:Canvas";
        proofDocument.body.append(colorProbe);
        const forcedCanvasColor =
          proofWindow.getComputedStyle(colorProbe).color;
        colorProbe.remove();
        const assertForcedReadable = (
          node: HTMLElement,
          label: string,
        ): void => {
          assertVisibleText(node, label);
          if (
            forcedColorsActive &&
            proofWindow.getComputedStyle(node).color === forcedCanvasColor
          ) {
            throw new Error(`${label} matches the forced Canvas background`);
          }
        };
        const expectedItemBlock = (tier: Tier, rootSize: number): number =>
          rootSize * (tier === "site" ? 0.5 : 0.25);
        const expectedMark = (rootSize: number): number => rootSize * 0.5;

        const assertCase = (
          section: HTMLElement,
          tier: Tier,
          rootSize: number,
          direction: Direction,
        ): void => {
          const id = `${tier}-${direction}`;
          const defaultNav = section.querySelector<HTMLElement>(
            "[data-breadcrumb-proof-default]",
          );
          const wrappedNav = section.querySelector<HTMLElement>(
            "[data-breadcrumb-proof-wrapped]",
          );
          const wrap = section.querySelector<HTMLElement>(
            "[data-breadcrumb-proof-wrap]",
          );
          const customNav = section.querySelector<HTMLElement>(
            "[data-breadcrumb-proof-custom]",
          );
          const defaultList = defaultNav?.querySelector<HTMLElement>(".list");
          const wrappedList = wrappedNav?.querySelector<HTMLElement>(".list");
          if (
            !defaultNav ||
            !wrappedNav ||
            !wrap ||
            !customNav ||
            !defaultList ||
            !wrappedList
          ) {
            throw new Error(`${id} fixture is incomplete`);
          }

          const itemBlock = resolveLength(
            section,
            "--ds-spacing-item-block",
            `${id} item-block role`,
          );
          const mark = resolveLength(
            section,
            "--ds-spacing-mark",
            `${id} mark role`,
          );
          near(
            itemBlock,
            expectedItemBlock(tier, rootSize),
            `${id} item-block role`,
          );
          near(mark, expectedMark(rootSize), `${id} mark role`);
          near(
            px(
              proofWindow.getComputedStyle(wrappedList).rowGap,
              `${id} computed row gap`,
            ),
            itemBlock,
            `${id} computed row gap`,
          );
          for (const [index, gap] of actualRowGaps(wrappedList, id).entries()) {
            near(gap, itemBlock, `${id} physical row gap ${index}`);
          }
          if (rowsFor(defaultList).length !== 1) {
            throw new Error(`${id} default Breadcrumbs unexpectedly wrapped`);
          }
          if (wrap.scrollWidth > wrap.clientWidth + 1) {
            throw new Error(
              `${id} constrained Breadcrumbs overflowed horizontally`,
            );
          }

          const assertMarks = (nav: HTMLElement, label: string): void => {
            const items = Array.from(
              nav.querySelectorAll<HTMLElement>(".breadcrumbs-item"),
            );
            const firstSeparator =
              items[0]?.querySelector<HTMLElement>(".separator");
            if (
              !firstSeparator ||
              proofWindow.getComputedStyle(firstSeparator).display !== "none"
            ) {
              throw new Error(`${label} first separator is visible`);
            }
            for (let index = 1; index < items.length; index += 1) {
              const item = items[index];
              const previousItem = items[index - 1];
              const previousLink =
                previousItem?.querySelector<HTMLElement>(".link");
              const separator = item?.querySelector<HTMLElement>(".separator");
              const link = item?.querySelector<HTMLElement>(".link");
              if (
                !item ||
                !previousItem ||
                !previousLink ||
                !separator ||
                !link
              ) {
                throw new Error(`${label} mark ${index} is incomplete`);
              }
              if (separator.nextElementSibling !== link) {
                throw new Error(
                  `${label} separator ${index} no longer precedes its label`,
                );
              }
              if (
                proofWindow.getComputedStyle(separator).display === "none" ||
                Math.abs(
                  separator.getBoundingClientRect().top -
                    link.getBoundingClientRect().top,
                ) > 0.75
              ) {
                throw new Error(
                  `${label} separator ${index} is not visibly attached to its label`,
                );
              }
              assertForcedReadable(separator, `${label} separator ${index}`);
              const separatorStyle = proofWindow.getComputedStyle(separator);
              near(
                px(
                  separatorStyle.marginInlineStart,
                  `${label} separator start`,
                ),
                mark,
                `${label} separator ${index} start`,
              );
              near(
                px(separatorStyle.marginInlineEnd, `${label} separator end`),
                mark,
                `${label} separator ${index} end`,
              );
              near(
                logicalGap(
                  separator.getBoundingClientRect(),
                  link.getBoundingClientRect(),
                  direction,
                  `${label} separator ${index} to label`,
                ),
                mark,
                `${label} physical separator ${index} end`,
              );
              if (
                Math.abs(
                  previousItem.getBoundingClientRect().top -
                    item.getBoundingClientRect().top,
                ) <= 0.75
              ) {
                near(
                  logicalGap(
                    previousLink.getBoundingClientRect(),
                    separator.getBoundingClientRect(),
                    direction,
                    `${label} previous label to separator ${index}`,
                  ),
                  mark,
                  `${label} physical separator ${index} start`,
                );
              }
            }
          };
          assertMarks(defaultNav, `${id} default`);
          assertMarks(wrappedNav, `${id} wrapped`);

          const currentItem = defaultNav.querySelector<HTMLElement>(
            '[aria-current="page"]',
          );
          const disabledItem = defaultNav.querySelector<HTMLElement>(
            '[aria-disabled="true"][role="link"]',
          );
          if (
            currentItem?.tagName !== "SPAN" ||
            disabledItem?.tagName !== "SPAN"
          ) {
            throw new Error(`${id} current/disabled semantics changed`);
          }
          const defaultLink =
            defaultNav.querySelector<HTMLElement>(".link[href]");
          if (!defaultLink) throw new Error(`${id} default link is missing`);
          assertForcedReadable(defaultLink, `${id} default link`);
          assertForcedReadable(currentItem, `${id} current label`);
          assertForcedReadable(disabledItem, `${id} disabled label`);

          const customItems = customNav.querySelectorAll<HTMLElement>(
            "[data-breadcrumb-proof-custom-item]",
          );
          const customLink = customNav.querySelector<HTMLElement>(
            "[data-breadcrumb-proof-custom-link]",
          );
          const customCurrent = customNav.querySelector<HTMLElement>(
            '[data-breadcrumb-proof-custom-item] [aria-current="page"]',
          );
          const visibleCustomSeparator = Array.from(
            customNav.querySelectorAll<HTMLElement>(".separator"),
          ).find(
            (node) => proofWindow.getComputedStyle(node).display !== "none",
          );
          if (
            customItems.length !== 2 ||
            !customLink ||
            customCurrent?.tagName !== "SPAN" ||
            !visibleCustomSeparator ||
            visibleCustomSeparator.textContent !== "›"
          ) {
            throw new Error(`${id} custom Breadcrumb APIs changed`);
          }
          assertForcedReadable(customLink, `${id} custom link`);
          assertForcedReadable(customCurrent, `${id} custom current label`);
          assertForcedReadable(
            visibleCustomSeparator,
            `${id} custom separator`,
          );
        };

        const expectProofFailure = (
          action: () => void,
          label: string,
        ): void => {
          try {
            action();
          } catch {
            return;
          }
          throw new Error(
            `${label} mutation did not fail the Breadcrumbs oracle`,
          );
        };

        await proofDocument.fonts.ready;
        try {
          for (const rootSize of [14, 16, 20]) {
            documentRoot.style.fontSize = `${rootSize}px`;
            await nextPaint();
            for (const tier of tiers) {
              for (const direction of directions) {
                const section = proofRoot.querySelector<HTMLElement>(
                  `[data-breadcrumb-spacing-case="${tier}-${direction}"]`,
                );
                if (!section) {
                  throw new Error(
                    `missing ${tier}-${direction} Breadcrumbs case`,
                  );
                }
                assertCase(section, tier, rootSize, direction);
                primaryConfigurations += 1;
                roleObservations += 2;
                stateCompatibilityConfigurations += 1;
                customCompatibilityConfigurations += 1;
                if (forcedColorsActive) {
                  forcedColorReadabilityConfigurations += 1;
                }
              }
            }
          }

          documentRoot.style.fontSize = "16px";
          await nextPaint();
          const mutationSection = proofRoot.querySelector<HTMLElement>(
            '[data-breadcrumb-spacing-case="docs-ltr"]',
          );
          const mutationList = mutationSection?.querySelector<HTMLElement>(
            "[data-breadcrumb-proof-wrapped] .list",
          );
          const mutationDefault = mutationSection?.querySelector<HTMLElement>(
            "[data-breadcrumb-proof-default]",
          );
          const mutationItem =
            mutationDefault?.querySelectorAll<HTMLElement>(
              ".breadcrumbs-item",
            )[1];
          const mutationSeparator =
            mutationItem?.querySelector<HTMLElement>(".separator");
          const mutationLink =
            mutationItem?.querySelector<HTMLElement>(".link");
          const mutationPreviousLink = mutationDefault
            ?.querySelectorAll<HTMLElement>(".breadcrumbs-item")[0]
            ?.querySelector<HTMLElement>(".link");
          if (
            !mutationSection ||
            !mutationList ||
            !mutationItem ||
            !mutationSeparator ||
            !mutationLink ||
            !mutationPreviousLink
          ) {
            throw new Error("missing Breadcrumbs mutation fixture");
          }

          rememberStyle(mutationSection);
          try {
            mutationSection.style.setProperty(
              "--spacing-gap-item-block",
              "13px",
            );
            await nextPaint();
            near(
              resolveLength(
                mutationSection,
                "--ds-spacing-item-block",
                "mutated item-block bridge",
              ),
              13,
              "mutated item-block bridge",
            );
            near(
              px(
                proofWindow.getComputedStyle(mutationList).rowGap,
                "mutated physical row gap",
              ),
              13,
              "mutated computed row gap",
            );
            for (const gap of actualRowGaps(
              mutationList,
              "mutated Breadcrumbs",
            )) {
              near(gap, 13, "mutated physical row separation");
            }
            expectProofFailure(
              () => assertCase(mutationSection, "docs", 16, "ltr"),
              "item-block role",
            );
          } finally {
            restoreStyle(mutationSection);
            await nextPaint();
          }
          assertCase(mutationSection, "docs", 16, "ltr");

          rememberStyle(mutationSection);
          try {
            mutationSection.style.setProperty(
              "--spacing-gap-mark-inline",
              "11px",
            );
            await nextPaint();
            near(
              resolveLength(
                mutationSection,
                "--ds-spacing-mark",
                "mutated mark bridge",
              ),
              11,
              "mutated mark bridge",
            );
            const style = proofWindow.getComputedStyle(mutationSeparator);
            near(
              px(style.marginInlineStart, "mutated mark start"),
              11,
              "mutated mark start",
            );
            near(
              px(style.marginInlineEnd, "mutated mark end"),
              11,
              "mutated mark end",
            );
            near(
              logicalGap(
                mutationPreviousLink.getBoundingClientRect(),
                mutationSeparator.getBoundingClientRect(),
                "ltr",
                "mutated separator start",
              ),
              11,
              "mutated physical separator start",
            );
            near(
              logicalGap(
                mutationSeparator.getBoundingClientRect(),
                mutationLink.getBoundingClientRect(),
                "ltr",
                "mutated separator end",
              ),
              11,
              "mutated physical separator end",
            );
            expectProofFailure(
              () => assertCase(mutationSection, "docs", 16, "ltr"),
              "mark role",
            );
          } finally {
            restoreStyle(mutationSection);
            await nextPaint();
          }
          assertCase(mutationSection, "docs", 16, "ltr");

          rememberStyle(mutationItem);
          rememberStyle(mutationSection);
          try {
            mutationSection.style.setProperty(
              "--spacing-gap-mark-inline",
              "17px",
            );
            mutationItem.style.setProperty(
              "--breadcrumbs-item-separator-margin",
              "13px",
            );
            await nextPaint();
            const style = proofWindow.getComputedStyle(mutationSeparator);
            near(
              px(style.marginInlineStart, "override start"),
              13,
              "override start",
            );
            near(px(style.marginInlineEnd, "override end"), 13, "override end");
            near(
              logicalGap(
                mutationPreviousLink.getBoundingClientRect(),
                mutationSeparator.getBoundingClientRect(),
                "ltr",
                "override separator start",
              ),
              13,
              "override physical separator start",
            );
            near(
              logicalGap(
                mutationSeparator.getBoundingClientRect(),
                mutationLink.getBoundingClientRect(),
                "ltr",
                "override separator end",
              ),
              13,
              "override physical separator end",
            );
            expectProofFailure(
              () => assertCase(mutationSection, "docs", 16, "ltr"),
              "public separator override",
            );
          } finally {
            restoreStyle(mutationItem);
            restoreStyle(mutationSection);
            await nextPaint();
          }
          assertCase(mutationSection, "docs", 16, "ltr");

          const focusStart = proofRoot.querySelector<HTMLElement>(
            "[data-breadcrumb-proof-focus-start]",
          );
          const focusLink = proofRoot.querySelector<HTMLElement>(
            '[data-breadcrumb-spacing-case="site-ltr"] [data-breadcrumb-proof-default] .link[href]',
          );
          if (!focusStart || !focusLink) {
            throw new Error("missing Breadcrumbs focus fixture");
          }
          const beforeFocus = focusLink.getBoundingClientRect();
          focusStart.focus();
          await userEvent.tab();
          if (
            proofDocument.activeElement !== focusLink ||
            !focusLink.matches(":focus-visible")
          ) {
            throw new Error(
              "Breadcrumb link did not receive keyboard focus-visible",
            );
          }
          const focusStyle = proofWindow.getComputedStyle(focusLink);
          if (
            px(focusStyle.outlineWidth, "Breadcrumb focus width") <= 0 ||
            focusStyle.outlineStyle === "none" ||
            focusStyle.outlineColor === "transparent" ||
            focusStyle.outlineColor === "rgba(0, 0, 0, 0)"
          ) {
            throw new Error("Breadcrumb keyboard focus paint is not visible");
          }
          if (
            forcedColorsActive &&
            focusStyle.outlineColor === forcedCanvasColor
          ) {
            throw new Error(
              "Breadcrumb forced-color focus outline matches the Canvas background",
            );
          }
          near(
            focusLink.getBoundingClientRect().width,
            beforeFocus.width,
            "Breadcrumb focus width invariance",
          );
          near(
            focusLink.getBoundingClientRect().height,
            beforeFocus.height,
            "Breadcrumb focus height invariance",
          );
          assertVisibleText(focusLink, "focused Breadcrumb link");
          const nextWrappedLink = proofRoot.querySelector<HTMLElement>(
            '[data-breadcrumb-spacing-case="site-ltr"] [data-breadcrumb-proof-wrapped] .link[href]',
          );
          if (!nextWrappedLink) {
            throw new Error("missing next wrapped Breadcrumb link");
          }
          await userEvent.tab();
          if (proofDocument.activeElement !== nextWrappedLink) {
            throw new Error(
              "Breadcrumb disabled/current items entered the keyboard tab order",
            );
          }
        } catch (error) {
          proofError = error;
        } finally {
          for (const node of Array.from(activeMutations.keys())) {
            restoreStyle(node);
          }
          documentRoot.style.fontSize = originalRootFontSize;
          const active = proofDocument.activeElement;
          if (active instanceof HTMLElement && active !== initialFocus) {
            active.blur();
          }
          if (
            initialFocus &&
            initialFocus !== proofDocument.body &&
            initialFocus.isConnected
          ) {
            initialFocus.focus();
          }
          await nextPaint();
        }

        if (proofError) {
          proofRoot.dataset.breadcrumbSpacingProofError =
            proofError instanceof Error
              ? proofError.message
              : String(proofError);
          throw proofError;
        }
        proofRoot.dataset.breadcrumbPrimaryConfigurations = String(
          primaryConfigurations,
        );
        proofRoot.dataset.breadcrumbRoleObservations = String(roleObservations);
        proofRoot.dataset.breadcrumbStateCompatibilityConfigurations = String(
          stateCompatibilityConfigurations,
        );
        proofRoot.dataset.breadcrumbCustomCompatibilityConfigurations = String(
          customCompatibilityConfigurations,
        );
        proofRoot.dataset.breadcrumbForcedColors = forcedColorsActive
          ? "active"
          : "none";
        proofRoot.dataset.breadcrumbForcedColorReadabilityConfigurations =
          String(forcedColorReadabilityConfigurations);
        proofRoot.dataset.breadcrumbSpacingProof = "passed";
      });

    proofWindow.__breadcrumbSpacingProofQueue = current;
    await current;
  },
};

const DefaultContextFixture = ({
  before,
}: {
  before?: boolean;
}): ReactElement => (
  <section
    data-breadcrumb-default-context={before ? "before" : "current"}
    style={
      {
        inlineSize: "38rem",
        maxInlineSize: "100%",
        ...(before ? { "--ds-spacing-item-block": "0.25rem" } : {}),
      } as CSSProperties
    }
  >
    <h2 style={{ marginBlockStart: 0 }}>
      {before ? "Before — 4px" : "Preview — 8px"}
    </h2>
    <div
      style={{
        alignItems: "flex-start",
        display: "flex",
        flexWrap: "wrap",
        gap: "2rem",
      }}
    >
      <div
        data-breadcrumb-default-context-component=""
        style={{ inlineSize: "18rem", maxInlineSize: "100%" }}
      >
        <h3 style={{ marginBlockStart: 0 }}>Breadcrumb</h3>
        <div
          className="p"
          data-breadcrumb-default-context-leading=""
          style={{ margin: 0 }}
        >
          <Component items={wrappedItems} />
        </div>
      </div>
      <div
        data-breadcrumb-default-context-paragraph=""
        style={{ inlineSize: "18rem", maxInlineSize: "100%" }}
      >
        <h3 style={{ marginBlockStart: 0 }}>Paragraph (reference)</h3>
        <p className="p" style={{ margin: 0 }}>
          Home server documentation installation and advanced guidance help
          people understand their current location.
        </p>
      </div>
    </div>
  </section>
);

/**
 * Untiered means that the page has not selected Sites, Documentation, or
 * Applications. The current preview changes only wrapped Breadcrumbs to 8px
 * between rows; single-line Breadcrumbs are unaffected, while Documentation
 * and Applications remain at 4px. The “Before” peer uses a demonstration-only
 * role override to show the previous 4px wrapping effect.
 */
export const DefaultContext: Story = {
  args: { items: [] },
  tags: ["!autodocs"],
  // The shared Storybook decorator always assigns an official product context
  // to its mount point. A body portal deliberately bypasses that preview-only
  // ancestor so this story can show the real unscoped :root default.
  render: () =>
    createPortal(
      <main
        data-breadcrumb-default-context-proof=""
        style={{
          boxSizing: "border-box",
          display: "flow-root",
          inlineSize: "100%",
          insetBlockStart: 0,
          insetInlineStart: 0,
          padding: "1rem",
          position: "absolute",
        }}
      >
        <p>
          <strong>Page with no tier selected.</strong> The current preview uses
          8px between wrapped rows. Single-line Breadcrumbs are unaffected, and
          Documentation and Applications remain at 4px. Breadcrumb items wrap as
          whole links, while paragraph text wraps by words.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
          <DefaultContextFixture before />
          <DefaultContextFixture />
        </div>
      </main>,
      document.body,
    ),
  play: async ({ canvasElement }) => {
    const proofDocument = canvasElement.ownerDocument;
    const proofWindow = proofDocument.defaultView;
    if (!proofWindow) throw new Error("missing default-context proof window");
    const proofRoots = proofDocument.querySelectorAll<HTMLElement>(
      "[data-breadcrumb-default-context-proof]",
    );
    if (proofRoots.length !== 1 || !proofRoots[0]) {
      throw new Error(
        `expected one default-context proof root, received ${proofRoots.length}`,
      );
    }
    const proofRoot = proofRoots[0];
    delete proofRoot.dataset.breadcrumbDefaultContextProof;
    delete proofRoot.dataset.breadcrumbDefaultContextProofError;
    delete proofRoot.dataset.breadcrumbParagraphPitch;
    delete proofRoot.dataset.breadcrumbBeforePitch;
    delete proofRoot.dataset.breadcrumbPreviewPitch;
    const originalRootStyle =
      proofDocument.documentElement.getAttribute("style");
    const originalFocus = proofDocument.activeElement;

    const readPx = (value: string, label: string): number => {
      const result = Number.parseFloat(value);
      if (!Number.isFinite(result)) throw new Error(`${label} is not finite`);
      return result;
    };
    const near = (actual: number, expected: number, label: string): void => {
      if (
        !Number.isFinite(actual) ||
        !Number.isFinite(expected) ||
        Math.abs(actual - expected) > 0.55
      ) {
        throw new Error(`${label}: expected ${expected}, received ${actual}`);
      }
    };
    const roleLength = (owner: HTMLElement, property: string): number => {
      const probe = proofDocument.createElement("span");
      probe.style.cssText = `position:fixed;visibility:hidden;display:block;inline-size:var(${property});block-size:0`;
      owner.append(probe);
      const result = readPx(
        proofWindow.getComputedStyle(probe).inlineSize,
        `${property} role`,
      );
      probe.remove();
      return result;
    };
    const textLineRects = (node: HTMLElement, label: string): DOMRect[] => {
      const range = proofDocument.createRange();
      range.selectNodeContents(node);
      const lines: DOMRect[] = [];
      for (const rect of Array.from(range.getClientRects())) {
        if (rect.width <= 0 || rect.height <= 0) continue;
        if (!lines.some((line) => Math.abs(line.top - rect.top) <= 0.75)) {
          lines.push(rect);
        }
      }
      range.detach();
      if (lines.length === 0)
        throw new Error(`${label} text has no line boxes`);
      return lines.sort((a, b) => a.top - b.top);
    };
    const metrics = (fixture: HTMLElement, label: string) => {
      const list = fixture.querySelector<HTMLElement>(".list");
      const componentWrapper = fixture.querySelector<HTMLElement>(
        "[data-breadcrumb-default-context-component]",
      );
      const paragraphWrapper = fixture.querySelector<HTMLElement>(
        "[data-breadcrumb-default-context-paragraph]",
      );
      const componentLeading = fixture.querySelector<HTMLElement>(
        "[data-breadcrumb-default-context-leading]",
      );
      const paragraph = fixture.querySelector<HTMLElement>(
        "[data-breadcrumb-default-context-paragraph] > .p",
      );
      const firstLink = list?.querySelector<HTMLElement>(".link");
      if (
        !list ||
        !componentWrapper ||
        !paragraphWrapper ||
        !componentLeading ||
        !paragraph ||
        !firstLink
      ) {
        throw new Error(`${label} comparison is incomplete`);
      }
      if (paragraph.childElementCount !== 0 || paragraph.querySelector("br")) {
        throw new Error(`${label} paragraph is not naturally wrapping text`);
      }
      const items = Array.from(
        list.querySelectorAll<HTMLElement>(".breadcrumbs-item"),
      );
      if (items.length !== wrappedItems.length) {
        throw new Error(`${label} item anatomy changed`);
      }
      const rows: Array<{ top: number; bottom: number }> = [];
      for (const item of items) {
        const rect = item.getBoundingClientRect();
        const row = rows.find(
          (candidate) => Math.abs(candidate.top - rect.top) <= 0.75,
        );
        if (row) row.bottom = Math.max(row.bottom, rect.bottom);
        else rows.push({ top: rect.top, bottom: rect.bottom });
      }
      rows.sort((a, b) => a.top - b.top);
      if (rows.length < 2) throw new Error(`${label} did not wrap naturally`);
      const separator = Array.from(
        fixture.querySelectorAll<HTMLElement>(".separator"),
      ).find((node) => proofWindow.getComputedStyle(node).display !== "none");
      if (!separator) throw new Error(`${label} visible separator is missing`);
      const separatorStyle = proofWindow.getComputedStyle(separator);
      const linkStyle = proofWindow.getComputedStyle(firstLink);
      const paragraphStyle = proofWindow.getComputedStyle(paragraph);
      const componentLeadingStyle =
        proofWindow.getComputedStyle(componentLeading);
      for (const property of [
        "fontFamily",
        "fontSize",
        "fontWeight",
        "letterSpacing",
        "lineHeight",
      ] as const) {
        if (linkStyle[property] !== paragraphStyle[property]) {
          throw new Error(
            `${label} paragraph ${property} differs from Breadcrumb`,
          );
        }
      }
      const breadcrumbText = textLineRects(firstLink, `${label} Breadcrumb`)[0];
      const paragraphLines = textLineRects(paragraph, `${label} paragraph`);
      if (!breadcrumbText || paragraphLines.length < 2 || !paragraphLines[0]) {
        throw new Error(`${label} paragraph did not wrap naturally`);
      }
      const componentRect = componentWrapper.getBoundingClientRect();
      const paragraphRect = paragraphWrapper.getBoundingClientRect();
      return {
        breadcrumbPitch: rows[1]?.top - rows[0]?.top,
        componentPaddingStart: readPx(
          componentLeadingStyle.paddingBlockStart,
          `${label} Breadcrumb start padding`,
        ),
        firstBreadcrumbText: breadcrumbText,
        firstParagraphText: paragraphLines[0],
        itemMetrics: items.map((item) => {
          const rect = item.getBoundingClientRect();
          const style = proofWindow.getComputedStyle(item);
          return {
            alignItems: style.alignItems,
            display: style.display,
            fontSize: style.fontSize,
            height: rect.height,
            lineHeight: style.lineHeight,
            width: rect.width,
          };
        }),
        markEnd: readPx(separatorStyle.marginInlineEnd, `${label} mark end`),
        markRole: roleLength(fixture, "--ds-spacing-mark"),
        markStart: readPx(
          separatorStyle.marginInlineStart,
          `${label} mark start`,
        ),
        physicalGaps: rows
          .slice(1)
          .map((row, index) => row.top - rows[index].bottom),
        paragraphPitches: paragraphLines
          .slice(1)
          .map((line, index) => line.top - paragraphLines[index].top),
        paragraphPaddingStart: readPx(
          paragraphStyle.paddingBlockStart,
          `${label} paragraph start padding`,
        ),
        paragraphWidth: paragraph.getBoundingClientRect().width,
        role: roleLength(fixture, "--ds-spacing-item-block"),
        rowGap: readPx(
          proofWindow.getComputedStyle(list).rowGap,
          `${label} gap`,
        ),
        sideBySide:
          componentRect.right <= paragraphRect.left &&
          componentRect.top < paragraphRect.bottom &&
          paragraphRect.top < componentRect.bottom,
        width: list.getBoundingClientRect().width,
        lineHeight: readPx(linkStyle.lineHeight, `${label} line height`),
      };
    };

    try {
      await proofDocument.fonts.ready;
      const before = proofRoot.querySelector<HTMLElement>(
        '[data-breadcrumb-default-context="before"]',
      );
      const current = proofRoot.querySelector<HTMLElement>(
        '[data-breadcrumb-default-context="current"]',
      );
      if (!before || !current)
        throw new Error("comparison fixtures are missing");
      if (
        before.closest(".site, .docs, .app, .global, .os") ||
        current.closest(".site, .docs, .app, .global, .os")
      ) {
        throw new Error("default-context fixture selected a product tier");
      }
      if (
        current.style.getPropertyValue("--ds-spacing-item-block") !== "" ||
        before.style.getPropertyValue("--ds-spacing-item-block") !== "0.25rem"
      ) {
        throw new Error("demonstration role override boundary changed");
      }

      const rootSize = readPx(
        proofWindow.getComputedStyle(proofDocument.documentElement).fontSize,
        "root font size",
      );
      near(rootSize, 16, "default-context root size");
      const beforeMetrics = metrics(before, "before");
      const currentMetrics = metrics(current, "current");
      for (const [label, values, expectedGap] of [
        ["before", beforeMetrics, rootSize * 0.25],
        ["current", currentMetrics, rootSize * 0.5],
      ] as const) {
        near(values.role, expectedGap, `${label} item-block role`);
        near(values.rowGap, expectedGap, `${label} computed row gap`);
        for (const gap of values.physicalGaps) {
          near(gap, expectedGap, `${label} physical row gap`);
        }
        near(
          values.breadcrumbPitch,
          values.lineHeight + expectedGap,
          `${label} Breadcrumb row pitch`,
        );
        for (const pitch of values.paragraphPitches) {
          near(pitch, values.lineHeight, `${label} paragraph line pitch`);
        }
        if (values.sideBySide) {
          near(
            values.firstBreadcrumbText.top,
            values.firstParagraphText.top,
            `${label} first text line top`,
          );
          near(
            values.firstBreadcrumbText.bottom,
            values.firstParagraphText.bottom,
            `${label} first text line bottom`,
          );
        }
        near(
          values.componentPaddingStart,
          values.paragraphPaddingStart,
          `${label} reference leading`,
        );
        near(values.width, values.paragraphWidth, `${label} peer width`);
        near(values.markRole, rootSize * 0.5, `${label} mark role`);
        near(values.markStart, rootSize * 0.5, `${label} mark start`);
        near(values.markEnd, rootSize * 0.5, `${label} mark end`);
      }
      near(
        beforeMetrics.paragraphPitches[0] ?? Number.NaN,
        currentMetrics.paragraphPitches[0] ?? Number.NaN,
        "paragraph reference pitch",
      );
      near(beforeMetrics.width, currentMetrics.width, "peer list width");
      for (
        let index = 0;
        index < beforeMetrics.itemMetrics.length;
        index += 1
      ) {
        const beforeItem = beforeMetrics.itemMetrics[index];
        const currentItem = currentMetrics.itemMetrics[index];
        if (!beforeItem || !currentItem)
          throw new Error(`item ${index} is missing`);
        near(beforeItem.width, currentItem.width, `item ${index} width`);
        near(beforeItem.height, currentItem.height, `item ${index} height`);
        if (
          beforeItem.fontSize !== currentItem.fontSize ||
          beforeItem.lineHeight !== currentItem.lineHeight ||
          beforeItem.display !== currentItem.display ||
          beforeItem.alignItems !== currentItem.alignItems
        ) {
          throw new Error(`item ${index} layout or type changed`);
        }
      }
      if (
        proofDocument.documentElement.getAttribute("style") !==
          originalRootStyle ||
        proofDocument.activeElement !== originalFocus
      ) {
        throw new Error(
          "default-context proof did not preserve document state",
        );
      }
      proofRoot.dataset.breadcrumbParagraphPitch = String(
        currentMetrics.paragraphPitches[0],
      );
      proofRoot.dataset.breadcrumbBeforePitch = String(
        beforeMetrics.breadcrumbPitch,
      );
      proofRoot.dataset.breadcrumbPreviewPitch = String(
        currentMetrics.breadcrumbPitch,
      );
      proofRoot.dataset.breadcrumbDefaultContextProof = "passed";
    } catch (error) {
      proofRoot.dataset.breadcrumbDefaultContextProofError =
        error instanceof Error ? error.message : String(error);
      throw error;
    }
  },
};
