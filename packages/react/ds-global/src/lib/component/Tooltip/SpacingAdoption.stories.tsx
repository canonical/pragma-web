import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactElement, useState } from "react";
import { createPortal } from "react-dom";
import { Accordion } from "../Accordion/index.js";
import { Icon } from "../Icon/index.js";
import TooltipEngine from "./TooltipEngine.js";

type SpacingContext = "default" | "global" | "site" | "docs" | "app" | "os";
type Direction = "ltr" | "rtl";

const contexts: readonly SpacingContext[] = [
  "default",
  "global",
  "site",
  "docs",
  "app",
  "os",
];
const directions: readonly Direction[] = ["ltr", "rtl"];
const rootSizes = [14, 16, 20] as const;
const officialContexts = new Set<SpacingContext>(["site", "docs", "app"]);
const contextLabels: Record<SpacingContext, string> = {
  default: "Default (untiered)",
  global: "Global",
  site: "Sites",
  docs: "Documentation",
  app: "Applications",
  os: "OS (experimental)",
};

const ProofCase = ({
  context,
  direction,
}: {
  context: SpacingContext;
  direction: Direction;
}): ReactElement => {
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);

  return (
    <section
      className={context === "default" ? undefined : context}
      data-mark-gap-case={`${context}-${direction}`}
      dir={direction}
      ref={setPortalHost}
      style={{
        inlineSize: "22rem",
        maxInlineSize: "100%",
        minBlockSize: "15rem",
      }}
    >
      <h6 style={{ marginBlockStart: 0 }}>
        {contextLabels[context]} · {direction.toUpperCase()}
      </h6>
      {portalHost ? (
        <div
          style={{
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            gap: "6rem",
            paddingBlockEnd: "6rem",
          }}
        >
          <TooltipEngine
            Message={"Marked tooltip message\nwraps onto a second line"}
            icon={<Icon icon="information" />}
            messageElementClassName="mark-gap-marked-tooltip"
            open
            parentElement={portalHost}
            preferredDirections={["block-end"]}
          >
            <button type="button">Marked target</button>
          </TooltipEngine>
          <TooltipEngine
            Message="Tooltip without a mark"
            messageElementClassName="mark-gap-unmarked-tooltip"
            open
            parentElement={portalHost}
            preferredDirections={["block-end"]}
          >
            <button type="button">Unmarked target</button>
          </TooltipEngine>
        </div>
      ) : null}
      <Accordion>
        <Accordion.Item
          data-mark-gap-accordion=""
          expanded
          heading={<span data-mark-gap-heading="">Accordion heading</span>}
        >
          <span data-mark-gap-content="">Aligned accordion content</span>
        </Accordion.Item>
      </Accordion>
    </section>
  );
};

const meta = {
  title: "components/Tooltip/Spacing adoption",
  component: TooltipEngine,
} satisfies Meta<typeof TooltipEngine>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Tooltip and Accordion resolve their mark-to-label gap in the rendered context. */
export const ContextualMarkGap: Story = {
  args: { children: null, Message: "" },
  tags: ["!autodocs"],
  render: () =>
    createPortal(
      <main
        data-mark-gap-proof-root=""
        style={{
          boxSizing: "border-box",
          display: "flex",
          flexWrap: "wrap",
          gap: "2rem",
          inlineSize: "100%",
          insetBlockStart: 0,
          insetInlineStart: 0,
          padding: "1rem",
          position: "absolute",
        }}
      >
        {contexts.flatMap((context) =>
          directions.map((direction) => (
            <ProofCase
              context={context}
              direction={direction}
              key={`${context}-${direction}`}
            />
          )),
        )}
      </main>,
      document.body,
    ),
  play: async ({ canvasElement }) => {
    type ProofWindow = Window & {
      __markGapSpacingProofQueue?: Promise<void>;
    };
    const proofDocument = canvasElement.ownerDocument;
    const proofWindow = proofDocument.defaultView as ProofWindow | null;
    if (!proofWindow) throw new Error("missing mark-gap proof window");

    const previous =
      proofWindow.__markGapSpacingProofQueue ?? Promise.resolve();
    const current = previous
      .catch(() => undefined)
      .then(async () => {
        const roots = proofDocument.querySelectorAll<HTMLElement>(
          "[data-mark-gap-proof-root]",
        );
        if (roots.length !== 1 || !roots[0]) {
          throw new Error(
            `expected one mark-gap proof root, received ${roots.length}`,
          );
        }
        const proofRoot = roots[0];
        for (const key of [
          "markGapProof",
          "markGapProofError",
          "markGapPrimaryConfigurations",
          "markGapExtraConfigurations",
          "markGapConsumerObservations",
          "markGapForcedColors",
        ] as const) {
          delete proofRoot.dataset[key];
        }

        const documentRoot = proofDocument.documentElement;
        const originalRootStyle = documentRoot.getAttribute("style");
        const forcedColors = proofWindow.matchMedia(
          "(forced-colors: active)",
        ).matches;
        const mutatedStyles = new Map<HTMLElement, string | null>();
        const mutatedOpen = new Map<HTMLDetailsElement, boolean>();
        let primaryConfigurations = 0;
        let extraConfigurations = 0;
        let consumerObservations = 0;

        const rememberStyle = (node: HTMLElement): void => {
          if (!mutatedStyles.has(node)) {
            mutatedStyles.set(node, node.getAttribute("style"));
          }
        };
        const nextPaint = async (): Promise<void> => {
          await new Promise<void>((resolve) => {
            proofWindow.requestAnimationFrame(() =>
              proofWindow.requestAnimationFrame(() => resolve()),
            );
          });
        };
        const px = (value: string, label: string): number => {
          const parsed = Number.parseFloat(value);
          if (!Number.isFinite(parsed))
            throw new Error(`${label} is not finite`);
          return parsed;
        };
        const near = (
          actual: number,
          expected: number,
          label: string,
        ): void => {
          if (Math.abs(actual - expected) > 0.55) {
            throw new Error(
              `${label}: expected ${expected}, received ${actual}`,
            );
          }
        };
        const logicalGap = (
          slot: HTMLElement,
          label: HTMLElement,
          direction: Direction,
        ): number => {
          const slotRect = slot.getBoundingClientRect();
          const labelRect = label.getBoundingClientRect();
          return direction === "ltr"
            ? labelRect.left - slotRect.right
            : slotRect.left - labelRect.right;
        };
        const logicalStart = (
          node: HTMLElement,
          direction: Direction,
        ): number => {
          const rect = node.getBoundingClientRect();
          return direction === "ltr" ? rect.left : rect.right;
        };
        const effectiveBackground = (node: HTMLElement): string => {
          let currentNode: HTMLElement | null = node;
          while (currentNode) {
            const value =
              proofWindow.getComputedStyle(currentNode).backgroundColor;
            if (value !== "transparent" && value !== "rgba(0, 0, 0, 0)") {
              return value;
            }
            currentNode = currentNode.parentElement;
          }
          throw new Error("no effective background color found");
        };
        const assertReadable = (node: HTMLElement, label: string): void => {
          if (!forcedColors) return;
          const style = proofWindow.getComputedStyle(node);
          if (
            style.color === "transparent" ||
            style.color === "rgba(0, 0, 0, 0)" ||
            style.color === effectiveBackground(node)
          ) {
            throw new Error(`${label} is unreadable in forced colors`);
          }
        };
        const readRolePx = (provider: HTMLElement, label: string): number => {
          const probe = proofDocument.createElement("span");
          probe.style.cssText =
            "position:absolute;visibility:hidden;inline-size:var(--ds-spacing-mark);";
          provider.append(probe);
          try {
            return px(
              proofWindow.getComputedStyle(probe).inlineSize,
              `${label} role`,
            );
          } finally {
            probe.remove();
          }
        };
        const tooltipGeometry = (
          tooltip: HTMLElement,
        ): Record<string, string | number> => {
          const style = proofWindow.getComputedStyle(tooltip);
          return {
            blockSize: tooltip.getBoundingClientRect().height,
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            lineHeight: style.lineHeight,
            paddingBlockEnd: style.paddingBlockEnd,
            paddingBlockStart: style.paddingBlockStart,
            paddingInlineEnd: style.paddingInlineEnd,
            paddingInlineStart: style.paddingInlineStart,
          };
        };
        const accordionGeometry = (
          item: HTMLDetailsElement,
        ): Record<string, string | number> => {
          const header = item.querySelector<HTMLElement>(":scope > .header");
          const content = item.querySelector<HTMLElement>(":scope > .content");
          const chevron =
            header?.querySelector<HTMLElement>(":scope > .chevron");
          if (!header || !content || !chevron) {
            throw new Error("accordion geometry is incomplete");
          }
          const headerStyle = proofWindow.getComputedStyle(header);
          const contentStyle = proofWindow.getComputedStyle(content);
          return {
            chevronBlockSize: chevron.getBoundingClientRect().height,
            headerBlockSize: header.getBoundingClientRect().height,
            headerPaddingBlockEnd: headerStyle.paddingBlockEnd,
            headerPaddingBlockStart: headerStyle.paddingBlockStart,
            contentPaddingBlockEnd: contentStyle.paddingBlockEnd,
            contentPaddingBlockStart: contentStyle.paddingBlockStart,
          };
        };
        const assertGeometry = (
          actual: Record<string, string | number>,
          expected: Record<string, string | number>,
          label: string,
        ): void => {
          for (const property of Object.keys(expected)) {
            const before = expected[property];
            const after = actual[property];
            if (typeof before === "number" && typeof after === "number") {
              near(after, before, `${label} ${property}`);
            } else if (after !== before) {
              throw new Error(`${label} ${property} changed`);
            }
          }
        };
        const assertTooltip = (
          tooltip: HTMLElement,
          expected: number,
          direction: Direction,
          label: string,
        ): void => {
          const content =
            tooltip.querySelector<HTMLElement>(":scope > .content");
          const icon = content?.querySelector<HTMLElement>(":scope > .icon");
          const text = content?.querySelector<HTMLElement>(":scope > .text");
          if (
            !content ||
            !icon ||
            !text ||
            tooltip.getAttribute("role") !== "tooltip"
          ) {
            throw new Error(`${label} marked Tooltip is incomplete`);
          }
          near(
            px(proofWindow.getComputedStyle(content).columnGap, `${label} gap`),
            expected,
            `${label} computed gap`,
          );
          near(
            logicalGap(icon, text, direction),
            expected,
            `${label} physical gap`,
          );
          const range = proofDocument.createRange();
          range.selectNodeContents(text);
          const lineTops = Array.from(range.getClientRects())
            .filter((rect) => rect.width > 0 && rect.height > 0)
            .map((rect) => rect.top)
            .filter(
              (top, index, values) =>
                values.findIndex(
                  (candidate) => Math.abs(candidate - top) < 0.75,
                ) === index,
            );
          range.detach();
          if (lineTops.length < 2)
            throw new Error(`${label} message is not multiline`);
          assertReadable(tooltip, `${label} Tooltip text`);
        };
        const assertUnmarkedTooltip = (
          tooltip: HTMLElement,
          expected: number,
          label: string,
        ): void => {
          const content =
            tooltip.querySelector<HTMLElement>(":scope > .content");
          if (!content)
            throw new Error(`${label} unmarked Tooltip is incomplete`);
          if (content.children.length !== 1 || content.querySelector(".icon")) {
            throw new Error(`${label} unmarked Tooltip gained a mark slot`);
          }
          near(
            px(proofWindow.getComputedStyle(content).columnGap, `${label} gap`),
            expected,
            `${label} unmarked computed gap`,
          );
          assertReadable(tooltip, `${label} unmarked Tooltip text`);
        };
        const accordionParts = (item: HTMLDetailsElement, label: string) => {
          const header = item.querySelector<HTMLElement>(":scope > .header");
          const chevron =
            header?.querySelector<HTMLElement>(":scope > .chevron");
          const heading =
            header?.querySelector<HTMLElement>(":scope > .heading");
          const content = item.querySelector<HTMLElement>(":scope > .content");
          const contentLabel = content?.querySelector<HTMLElement>(
            "[data-mark-gap-content]",
          );
          if (!header || !chevron || !heading || !content || !contentLabel) {
            throw new Error(`${label} Accordion is incomplete`);
          }
          return { chevron, content, contentLabel, header, heading };
        };
        const assertAccordion = (
          item: HTMLDetailsElement,
          expected: number,
          direction: Direction,
          label: string,
        ): void => {
          const { chevron, contentLabel, header, heading } = accordionParts(
            item,
            label,
          );
          const headerStyle = proofWindow.getComputedStyle(header);
          near(
            px(headerStyle.columnGap, `${label} gap`),
            expected,
            `${label} computed gap`,
          );
          near(
            logicalGap(chevron, heading, direction),
            expected,
            `${label} physical gap`,
          );
          const headerRect = header.getBoundingClientRect();
          const chevronWidth = chevron.getBoundingClientRect().width;
          const headerStart =
            direction === "ltr"
              ? headerRect.left +
                px(headerStyle.borderLeftWidth, `${label} left border`) +
                px(headerStyle.paddingInlineStart, `${label} header inset`)
              : headerRect.right -
                px(headerStyle.borderRightWidth, `${label} right border`) -
                px(headerStyle.paddingInlineStart, `${label} header inset`);
          const expectedKeyline =
            direction === "ltr"
              ? headerStart + chevronWidth + expected
              : headerStart - chevronWidth - expected;
          near(
            logicalStart(heading, direction),
            expectedKeyline,
            `${label} heading keyline`,
          );
          near(
            logicalStart(contentLabel, direction),
            expectedKeyline,
            `${label} content keyline`,
          );
          assertReadable(heading, `${label} Accordion heading`);
          assertReadable(contentLabel, `${label} Accordion content`);
        };
        const assertContentIndent = (
          item: HTMLDetailsElement,
          expected: number,
          direction: Direction,
          label: string,
        ): void => {
          const { contentLabel } = accordionParts(item, label);
          const itemRect = item.getBoundingClientRect();
          const itemStyle = proofWindow.getComputedStyle(item);
          const itemStart =
            direction === "ltr"
              ? itemRect.left +
                px(itemStyle.borderLeftWidth, `${label} left border`)
              : itemRect.right -
                px(itemStyle.borderRightWidth, `${label} right border`);
          const expectedKeyline =
            direction === "ltr" ? itemStart + expected : itemStart - expected;
          near(
            logicalStart(contentLabel, direction),
            expectedKeyline,
            `${label} keyline`,
          );
        };

        let assertionError: unknown;
        let assertionFailed = false;
        try {
          await proofDocument.fonts.ready;
          await nextPaint();
          for (const rootSize of rootSizes) {
            documentRoot.style.fontSize = `${rootSize}px`;
            await nextPaint();
            for (const context of contexts) {
              const expected = rootSize * (context === "os" ? 0.25 : 0.5);
              for (const direction of directions) {
                const label = `${context}-${direction} at ${rootSize}px`;
                const fixture = proofRoot.querySelector<HTMLElement>(
                  `[data-mark-gap-case="${context}-${direction}"]`,
                );
                const marked = fixture?.querySelector<HTMLElement>(
                  ":scope > .mark-gap-marked-tooltip",
                );
                const unmarked = fixture?.querySelector<HTMLElement>(
                  ":scope > .mark-gap-unmarked-tooltip",
                );
                const item = fixture?.querySelector<HTMLDetailsElement>(
                  "[data-mark-gap-accordion]",
                );
                if (!fixture || !marked || !unmarked || !item) {
                  throw new Error(`${label} fixture is incomplete`);
                }
                if (
                  marked.parentElement !== fixture ||
                  unmarked.parentElement !== fixture
                ) {
                  throw new Error(
                    `${label} TooltipEngine portal left its provider`,
                  );
                }
                if (
                  context === "default" &&
                  fixture.closest(".global, .site, .docs, .app, .os")
                ) {
                  throw new Error("default fixture selected a product context");
                }
                near(readRolePx(fixture, label), expected, `${label} role`);
                assertTooltip(marked, expected, direction, label);
                assertUnmarkedTooltip(unmarked, expected, label);
                assertAccordion(item, expected, direction, label);
                consumerObservations += 2;
                if (officialContexts.has(context)) primaryConfigurations += 1;
                else extraConfigurations += 1;
              }
            }
          }

          documentRoot.style.fontSize = "16px";
          await nextPaint();
          const provider = proofRoot.querySelector<HTMLElement>(
            '[data-mark-gap-case="app-ltr"]',
          );
          const neighbor = proofRoot.querySelector<HTMLElement>(
            '[data-mark-gap-case="app-rtl"]',
          );
          const marked = provider?.querySelector<HTMLElement>(
            ":scope > .mark-gap-marked-tooltip",
          );
          const unmarked = provider?.querySelector<HTMLElement>(
            ":scope > .mark-gap-unmarked-tooltip",
          );
          const item = provider?.querySelector<HTMLDetailsElement>(
            "[data-mark-gap-accordion]",
          );
          const neighborTooltip = neighbor?.querySelector<HTMLElement>(
            ":scope > .mark-gap-marked-tooltip",
          );
          const neighborItem = neighbor?.querySelector<HTMLDetailsElement>(
            "[data-mark-gap-accordion]",
          );
          if (
            !provider ||
            !neighbor ||
            !marked ||
            !unmarked ||
            !item ||
            !neighborTooltip ||
            !neighborItem
          ) {
            throw new Error("mutation fixtures are incomplete");
          }
          const markedGeometry = tooltipGeometry(marked);
          const itemGeometry = accordionGeometry(item);
          rememberStyle(provider);
          rememberStyle(marked);
          rememberStyle(item);
          mutatedOpen.set(item, item.open);

          provider.style.setProperty("--spacing-gap-mark-inline", "13px");
          await nextPaint();
          near(readRolePx(provider, "mutated provider"), 13, "mutated bridge");
          assertTooltip(marked, 13, "ltr", "generated Tooltip bridge");
          assertAccordion(item, 13, "ltr", "generated Accordion bridge");
          assertTooltip(neighborTooltip, 8, "rtl", "neighbor Tooltip");
          assertAccordion(neighborItem, 8, "rtl", "neighbor Accordion");
          assertGeometry(
            tooltipGeometry(marked),
            markedGeometry,
            "mutated Tooltip",
          );
          assertGeometry(
            accordionGeometry(item),
            itemGeometry,
            "mutated Accordion",
          );

          provider.style.setProperty("--tooltip-gap", "11px");
          provider.style.setProperty("--accordion-item-header-gap", "12px");
          await nextPaint();
          assertTooltip(marked, 11, "ltr", "inherited Tooltip hook");
          assertUnmarkedTooltip(
            unmarked,
            11,
            "inherited unmarked Tooltip hook",
          );
          assertAccordion(item, 12, "ltr", "inherited Accordion hook");

          marked.style.setProperty("--tooltip-gap", "9px");
          item.style.setProperty("--accordion-item-header-gap", "10px");
          await nextPaint();
          assertTooltip(marked, 9, "ltr", "direct Tooltip hook");
          assertUnmarkedTooltip(
            unmarked,
            11,
            "direct Tooltip sibling isolation",
          );
          assertAccordion(item, 10, "ltr", "direct Accordion hook");

          marked.style.setProperty("--tooltip-gap", "0px");
          item.style.setProperty("--accordion-item-header-gap", "0px");
          await nextPaint();
          assertTooltip(marked, 0, "ltr", "zero Tooltip hook");
          assertUnmarkedTooltip(unmarked, 11, "zero Tooltip sibling isolation");
          assertAccordion(item, 0, "ltr", "zero Accordion hook");

          marked.style.setProperty("--tooltip-gap", "9px");
          item.style.setProperty("--accordion-item-header-gap", "10px");
          item.style.setProperty("--accordion-item-content-indent", "31px");
          await nextPaint();
          assertTooltip(marked, 9, "ltr", "restored direct Tooltip hook");
          const { chevron, header, heading } = accordionParts(
            item,
            "content override header gap",
          );
          near(
            px(
              proofWindow.getComputedStyle(header).columnGap,
              "content override header gap",
            ),
            10,
            "content override computed header gap",
          );
          near(
            logicalGap(chevron, heading, "ltr"),
            10,
            "content override physical header gap",
          );
          assertContentIndent(item, 31, "ltr", "content indent override");
          item.style.removeProperty("--accordion-item-content-indent");
          await nextPaint();
          assertAccordion(item, 10, "ltr", "restored derived content keyline");

          marked.style.removeProperty("--tooltip-gap");
          item.style.removeProperty("--accordion-item-header-gap");
          await nextPaint();
          assertTooltip(marked, 11, "ltr", "restored inherited Tooltip hook");
          assertAccordion(item, 12, "ltr", "restored inherited Accordion hook");

          provider.style.removeProperty("--tooltip-gap");
          provider.style.removeProperty("--accordion-item-header-gap");
          await nextPaint();
          assertTooltip(marked, 13, "ltr", "restored Tooltip bridge");
          assertAccordion(item, 13, "ltr", "restored Accordion bridge");

          provider.style.removeProperty("--spacing-gap-mark-inline");
          await nextPaint();
          assertTooltip(marked, 8, "ltr", "restored Tooltip context");
          assertAccordion(item, 8, "ltr", "restored Accordion context");
          assertGeometry(
            tooltipGeometry(marked),
            markedGeometry,
            "restored Tooltip",
          );
          assertGeometry(
            accordionGeometry(item),
            itemGeometry,
            "restored Accordion",
          );

          const summary = item.querySelector<HTMLElement>(":scope > summary");
          if (!summary || !item.open)
            throw new Error("Accordion did not start open");
          summary.click();
          await nextPaint();
          if (item.open) throw new Error("native Accordion did not close");
          summary.click();
          await nextPaint();
          if (!item.open) throw new Error("native Accordion did not reopen");
        } catch (error) {
          assertionError = error;
          assertionFailed = true;
        }

        let cleanupError: unknown;
        let cleanupFailed = false;
        try {
          for (const [node, style] of mutatedStyles) {
            if (style === null) node.removeAttribute("style");
            else node.setAttribute("style", style);
          }
          for (const [item, open] of mutatedOpen) item.open = open;
          if (originalRootStyle === null) documentRoot.removeAttribute("style");
          else documentRoot.setAttribute("style", originalRootStyle);
          await nextPaint();
          if (
            (documentRoot.getAttribute("style") ?? "") !==
            (originalRootStyle ?? "")
          ) {
            throw new Error("proof did not restore the document root");
          }
          for (const [node, style] of mutatedStyles) {
            if ((node.getAttribute("style") ?? "") !== (style ?? "")) {
              throw new Error("proof did not restore a temporary hook");
            }
          }
          for (const [item, open] of mutatedOpen) {
            if (item.open !== open)
              throw new Error("proof did not restore Accordion open state");
          }
        } catch (error) {
          cleanupError = error;
          cleanupFailed = true;
        }

        if (assertionFailed && cleanupFailed) {
          console.error(
            "Mark-gap spacing proof cleanup failed after an assertion failure",
            cleanupError,
          );
        }
        if (assertionFailed || cleanupFailed) {
          const error = assertionFailed ? assertionError : cleanupError;
          proofRoot.dataset.markGapProofError =
            error instanceof Error ? error.message : String(error);
          throw error;
        }

        proofRoot.dataset.markGapPrimaryConfigurations = String(
          primaryConfigurations,
        );
        proofRoot.dataset.markGapExtraConfigurations =
          String(extraConfigurations);
        proofRoot.dataset.markGapConsumerObservations =
          String(consumerObservations);
        proofRoot.dataset.markGapForcedColors = String(forcedColors);
        proofRoot.dataset.markGapProof = "passed";
      });
    proofWindow.__markGapSpacingProofQueue = current;
    try {
      await current;
    } finally {
      if (proofWindow.__markGapSpacingProofQueue === current) {
        delete proofWindow.__markGapSpacingProofQueue;
      }
    }
  },
};
