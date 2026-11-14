import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { createPortal } from "react-dom";
import { userEvent } from "storybook/test";
import Component from "./Breadcrumbs.js";
import Item from "./common/Item/Item.js";
import type { ItemProps } from "./common/Item/types.js";
import type { LinkComponentProps } from "./types.js";

type Tier = "site" | "docs" | "app";
type ExtraContext = "default" | "global" | "os";
type SpacingContext = Tier | ExtraContext;
type Direction = "ltr" | "rtl";

const tiers = ["site", "docs", "app"] as const;
const extraContexts = ["default", "global", "os"] as const;
const spacingContexts = [...tiers, ...extraContexts] as const;
const directions = ["ltr", "rtl"] as const;

const paragraphText =
  "Home server documentation installation and advanced guidance help people understand their current location.";

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
  tier: SpacingContext;
  direction: Direction;
}): ReactElement => {
  const id = `${tier}-${direction}`;
  return (
    <section
      className={tier === "default" ? undefined : tier}
      data-breadcrumb-spacing-case={id}
      dir={direction}
      style={{ display: "grid", gap: "0.5rem", maxInlineSize: "48rem" }}
    >
      <h2 style={{ margin: 0 }}>{id}</h2>
      <h3 style={{ margin: 0 }}>Default (current and disabled)</h3>
      <Component data-breadcrumb-proof-default="" items={defaultItems} />
      <h3 style={{ margin: 0 }}>Wrapped</h3>
      <div
        style={{
          alignItems: "flex-start",
          display: "flex",
          flexWrap: "wrap",
          gap: "2rem",
        }}
      >
        <div style={{ inlineSize: "18rem", maxInlineSize: "100%" }}>
          <h4 style={{ marginBlockStart: 0 }}>Breadcrumb</h4>
          <div
            className="p"
            data-breadcrumb-proof-wrap=""
            style={{ margin: 0 }}
          >
            <Component data-breadcrumb-proof-wrapped="" items={wrappedItems} />
          </div>
        </div>
        <div style={{ inlineSize: "18rem", maxInlineSize: "100%" }}>
          <h4 style={{ marginBlockStart: 0 }}>Paragraph (reference)</h4>
          <p className="p" data-breadcrumb-proof-paragraph="">
            {paragraphText}
          </p>
        </div>
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
 * Real Breadcrumbs at the three official product tiers plus the untiered,
 * global, and experimental OS contexts. The play reports 18 official primary
 * configurations separately from 18 extra-context comparisons. State and
 * custom-API observations repeat only the official configurations.
 */
export const SpacingRoles: Story = {
  args: { items: [] },
  tags: ["!autodocs"],
  render: () =>
    createPortal(
      <main
        className="breadcrumb-spacing-proof"
        data-breadcrumb-spacing-proof-root=""
        style={{
          boxSizing: "border-box",
          display: "grid",
          gap: "2rem",
          inlineSize: "100%",
          insetBlockStart: 0,
          insetInlineStart: 0,
          padding: "1rem",
          position: "absolute",
        }}
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
        {spacingContexts.flatMap((tier) =>
          directions.map((direction) => (
            <ProofCase
              direction={direction}
              key={`${tier}-${direction}`}
              tier={tier}
            />
          )),
        )}
      </main>,
      document.body,
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
        const proofRoot =
          canvasElement.ownerDocument.querySelector<HTMLElement>(
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
          "breadcrumbExtraContextConfigurations",
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
        let extraContextConfigurations = 0;

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
          if (lines.length < 2) {
            throw new Error(`${label} did not wrap naturally`);
          }
          return lines.sort((a, b) => a.top - b.top);
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
        const expectedMark = (
          context: SpacingContext,
          rootSize: number,
        ): number => rootSize * (context === "os" ? 0.25 : 0.5);

        const assertCase = (
          section: HTMLElement,
          tier: SpacingContext,
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
          const paragraph = section.querySelector<HTMLElement>(
            "[data-breadcrumb-proof-paragraph]",
          );
          const defaultList = defaultNav?.querySelector<HTMLElement>(".list");
          const wrappedList = wrappedNav?.querySelector<HTMLElement>(".list");
          const firstWrappedLink =
            wrappedList?.querySelector<HTMLElement>(".link");
          if (
            !defaultNav ||
            !wrappedNav ||
            !wrap ||
            !customNav ||
            !paragraph ||
            !defaultList ||
            !wrappedList ||
            !firstWrappedLink
          ) {
            throw new Error(`${id} fixture is incomplete`);
          }

          const mark = resolveLength(
            section,
            "--ds-spacing-mark",
            `${id} mark role`,
          );
          near(mark, expectedMark(tier, rootSize), `${id} mark role`);
          near(
            px(
              proofWindow.getComputedStyle(wrappedList).rowGap,
              `${id} computed row gap`,
            ),
            0,
            `${id} computed row gap`,
          );
          for (const [index, gap] of actualRowGaps(wrappedList, id).entries()) {
            near(gap, 0, `${id} physical row gap ${index}`);
          }

          const rows = rowsFor(wrappedList);
          const paragraphLines = textLineRects(paragraph, `${id} paragraph`);
          const linkStyle = proofWindow.getComputedStyle(firstWrappedLink);
          const paragraphStyle = proofWindow.getComputedStyle(paragraph);
          for (const property of [
            "fontFamily",
            "fontSize",
            "fontWeight",
            "letterSpacing",
            "lineHeight",
          ] as const) {
            if (linkStyle[property] !== paragraphStyle[property]) {
              throw new Error(
                `${id} paragraph ${property} differs from Breadcrumb`,
              );
            }
          }
          const lineHeight = px(linkStyle.lineHeight, `${id} line height`);
          if (tier === "site") {
            near(lineHeight, rootSize * 1.5, `${id} official line height`);
          } else if (tier === "docs" || tier === "app") {
            near(lineHeight, rootSize * 1.25, `${id} official line height`);
          }
          const paragraphPitch = finite(
            paragraphLines[1].top - paragraphLines[0].top,
            `${id} paragraph pitch`,
          );
          near(paragraphPitch, lineHeight, `${id} paragraph line pitch`);
          for (let index = 1; index < paragraphLines.length; index += 1) {
            near(
              paragraphLines[index].top - paragraphLines[index - 1].top,
              paragraphPitch,
              `${id} paragraph pitch ${index}`,
            );
          }
          for (let index = 1; index < rows.length; index += 1) {
            near(
              rows[index].top - rows[index - 1].top,
              paragraphPitch,
              `${id} Breadcrumb row pitch ${index}`,
            );
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
                roleObservations += 1;
                stateCompatibilityConfigurations += 1;
                customCompatibilityConfigurations += 1;
                if (forcedColorsActive) {
                  forcedColorReadabilityConfigurations += 1;
                }
              }
            }
            for (const context of extraContexts) {
              for (const direction of directions) {
                const section = proofRoot.querySelector<HTMLElement>(
                  `[data-breadcrumb-spacing-case="${context}-${direction}"]`,
                );
                if (!section) {
                  throw new Error(
                    `missing ${context}-${direction} Breadcrumbs case`,
                  );
                }
                assertCase(section, context, rootSize, direction);
                extraContextConfigurations += 1;
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
                "item-block-independent row gap",
              ),
              0,
              "item-block-independent row gap",
            );
            for (const gap of actualRowGaps(
              mutationList,
              "item-block-independent Breadcrumbs",
            )) {
              near(gap, 0, "item-block-independent physical row gap");
            }
            assertCase(mutationSection, "docs", 16, "ltr");
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
        proofRoot.dataset.breadcrumbExtraContextConfigurations = String(
          extraContextConfigurations,
        );
        proofRoot.dataset.breadcrumbSpacingProof = "passed";
      });

    proofWindow.__breadcrumbSpacingProofQueue = current;
    await current;
  },
};

const contextLabels: Record<SpacingContext, string> = {
  default: "No tier selected",
  global: "Global",
  site: "Sites",
  docs: "Documentation",
  app: "Applications",
  os: "OS (experimental)",
};

const DefaultContextFixture = ({
  context,
}: {
  context: SpacingContext;
}): ReactElement => (
  <section
    className={context === "default" ? undefined : context}
    data-breadcrumb-default-context={context}
    style={{ inlineSize: "38rem", maxInlineSize: "100%" }}
  >
    <h2 style={{ marginBlockStart: 0 }}>{contextLabels[context]}</h2>
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
        <div className="p" style={{ margin: 0 }}>
          <Component items={wrappedItems} />
        </div>
      </div>
      <div
        data-breadcrumb-default-context-paragraph=""
        style={{ inlineSize: "18rem", maxInlineSize: "100%" }}
      >
        <h3 style={{ marginBlockStart: 0 }}>Paragraph (reference)</h3>
        <p className="p" style={{ margin: 0 }}>
          {paragraphText}
        </p>
      </div>
    </div>
  </section>
);

/**
 * Wrapped Breadcrumb rows follow the paragraph line rhythm in every supported
 * product context. Breadcrumb items wrap as whole links; paragraph text wraps
 * by words. Single-line Breadcrumbs are unaffected.
 */
export const DefaultContext: Story = {
  args: { items: [] },
  tags: ["!autodocs"],
  // The shared Storybook decorator always assigns an official product context
  // to its mount point. A body portal deliberately bypasses that preview-only
  // ancestor so the first case shows the real unscoped :root default.
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
          <strong>Current paragraph rhythm.</strong> Each Breadcrumb uses the
          selected context’s paragraph typography and advances wrapped rows by
          the same line height.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
          {spacingContexts.map((context) => (
            <DefaultContextFixture context={context} key={context} />
          ))}
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
    delete proofRoot.dataset.breadcrumbDefaultContextConfigurations;
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
      if (lines.length < 2) throw new Error(`${label} did not wrap naturally`);
      return lines.sort((a, b) => a.top - b.top);
    };

    try {
      await proofDocument.fonts.ready;
      const rootSize = readPx(
        proofWindow.getComputedStyle(proofDocument.documentElement).fontSize,
        "root font size",
      );
      let configurations = 0;
      for (const context of spacingContexts) {
        const fixture = proofRoot.querySelector<HTMLElement>(
          `[data-breadcrumb-default-context="${context}"]`,
        );
        const list = fixture?.querySelector<HTMLElement>(".list");
        const paragraph = fixture?.querySelector<HTMLElement>(
          "[data-breadcrumb-default-context-paragraph] > .p",
        );
        const firstLink = list?.querySelector<HTMLElement>(".link");
        if (!fixture || !list || !paragraph || !firstLink) {
          throw new Error(`${context} comparison is incomplete`);
        }
        if (
          context === "default" &&
          fixture.closest(".site, .docs, .app, .global, .os")
        ) {
          throw new Error("untiered comparison selected a product context");
        }
        if (fixture.style.getPropertyValue("--ds-spacing-item-block") !== "") {
          throw new Error(`${context} comparison overrides item-block spacing`);
        }

        const items = Array.from(
          list.querySelectorAll<HTMLElement>(".breadcrumbs-item"),
        );
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
        if (rows.length < 2) {
          throw new Error(`${context} Breadcrumb did not wrap naturally`);
        }
        const paragraphLines = textLineRects(paragraph, `${context} paragraph`);
        const linkStyle = proofWindow.getComputedStyle(firstLink);
        const paragraphStyle = proofWindow.getComputedStyle(paragraph);
        for (const property of [
          "fontFamily",
          "fontSize",
          "fontWeight",
          "letterSpacing",
          "lineHeight",
        ] as const) {
          if (linkStyle[property] !== paragraphStyle[property]) {
            throw new Error(
              `${context} paragraph ${property} differs from Breadcrumb`,
            );
          }
        }
        const lineHeight = readPx(
          linkStyle.lineHeight,
          `${context} line height`,
        );
        near(
          readPx(
            proofWindow.getComputedStyle(list).rowGap,
            `${context} row gap`,
          ),
          0,
          `${context} row gap`,
        );
        const paragraphPitch = paragraphLines[1].top - paragraphLines[0].top;
        near(paragraphPitch, lineHeight, `${context} paragraph pitch`);
        for (let index = 1; index < rows.length; index += 1) {
          near(
            rows[index].top - rows[index - 1].top,
            paragraphPitch,
            `${context} Breadcrumb pitch ${index}`,
          );
          near(
            rows[index].top - rows[index - 1].bottom,
            0,
            `${context} physical row gap ${index}`,
          );
        }
        for (let index = 1; index < paragraphLines.length; index += 1) {
          near(
            paragraphLines[index].top - paragraphLines[index - 1].top,
            paragraphPitch,
            `${context} paragraph pitch ${index}`,
          );
        }
        const expectedMark = rootSize * (context === "os" ? 0.25 : 0.5);
        const separator = Array.from(
          list.querySelectorAll<HTMLElement>(".separator"),
        ).find((node) => proofWindow.getComputedStyle(node).display !== "none");
        if (!separator) {
          throw new Error(`${context} visible separator is missing`);
        }
        const separatorStyle = proofWindow.getComputedStyle(separator);
        near(
          readPx(separatorStyle.marginInlineStart, `${context} mark start`),
          expectedMark,
          `${context} mark start`,
        );
        near(
          readPx(separatorStyle.marginInlineEnd, `${context} mark end`),
          expectedMark,
          `${context} mark end`,
        );
        configurations += 1;
      }
      if (
        proofDocument.documentElement.getAttribute("style") !==
          originalRootStyle ||
        proofDocument.activeElement !== originalFocus
      ) {
        throw new Error("default-context proof changed document state");
      }
      proofRoot.dataset.breadcrumbDefaultContextConfigurations =
        String(configurations);
      proofRoot.dataset.breadcrumbDefaultContextProof = "passed";
    } catch (error) {
      proofRoot.dataset.breadcrumbDefaultContextProofError =
        error instanceof Error ? error.message : String(error);
      throw error;
    }
  },
};
