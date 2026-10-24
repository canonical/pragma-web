import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties, ReactElement } from "react";
import { createPortal } from "react-dom";
import { KeyboardKey } from "../KeyboardKey/index.js";
import InlineCode from "./InlineCode.js";

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
  default: "Default (global values, no context class)",
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
}): ReactElement => (
  <section
    className={context === "default" ? undefined : context}
    data-inline-data-case={`${context}-${direction}`}
    dir={direction}
    style={{ inlineSize: "20rem", maxInlineSize: "100%" }}
  >
    <h2 style={{ marginBlockStart: 0 }}>
      {contextLabels[context]} · {direction.toUpperCase()}
    </h2>
    <p className="p" data-inline-data-paragraph="">
      Run <InlineCode data-inline-data-code="">snap info juju</InlineCode>, then
      press <KeyboardKey data-inline-data-key-short="" keyValue="c" /> or the
      longer <KeyboardKey data-inline-data-key-long="" keyValue="backspace" />
      key.
      This surrounding sentence is deliberately long enough to wrap naturally
      across multiple lines without fixture padding on either component.
    </p>
  </section>
);

const meta = {
  title: "components/InlineCode/Spacing adoption",
  component: InlineCode,
} satisfies Meta<typeof InlineCode>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * InlineCode and KeyboardKey read input-inline spacing in the context where
 * they render. Existing public component hooks remain explicit overrides.
 */
export const ContextualInputInline: Story = {
  tags: ["!autodocs"],
  render: () =>
    createPortal(
      <main
        data-inline-data-proof-root=""
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
      __inlineDataSpacingProofQueue?: Promise<void>;
    };
    const proofDocument = canvasElement.ownerDocument;
    const proofWindow = proofDocument.defaultView as ProofWindow | null;
    if (!proofWindow) throw new Error("missing inline-data proof window");

    const previous =
      proofWindow.__inlineDataSpacingProofQueue ?? Promise.resolve();
    const current = previous
      .catch(() => undefined)
      .then(async () => {
        const roots = proofDocument.querySelectorAll<HTMLElement>(
          "[data-inline-data-proof-root]",
        );
        if (roots.length !== 1 || !roots[0]) {
          throw new Error(
            `expected one inline-data proof root, received ${roots.length}`,
          );
        }
        const proofRoot = roots[0];
        for (const key of [
          "inlineDataProof",
          "inlineDataProofError",
          "inlineDataPrimaryConfigurations",
          "inlineDataExtraConfigurations",
          "inlineDataConsumerObservations",
          "inlineDataForcedColors",
        ] as const) {
          delete proofRoot.dataset[key];
        }

        const documentRoot = proofDocument.documentElement;
        const originalRootStyle = documentRoot.getAttribute("style");
        const forcedColors = proofWindow.matchMedia(
          "(forced-colors: active)",
        ).matches;
        const mutatedStyles = new Map<HTMLElement, string | null>();
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
          if (!Number.isFinite(parsed)) throw new Error(`${label} is not finite`);
          return parsed;
        };
        const near = (
          actual: number,
          expected: number,
          label: string,
        ): void => {
          if (Math.abs(actual - expected) > 0.55) {
            throw new Error(`${label}: expected ${expected}, received ${actual}`);
          }
        };
        const readRolePx = (provider: HTMLElement, label: string): number => {
          const probe = proofDocument.createElement("span");
          probe.style.cssText =
            "position:absolute;visibility:hidden;inline-size:var(--ds-spacing-field);";
          provider.append(probe);
          try {
            return px(
              proofWindow.getComputedStyle(probe).inlineSize,
              `${label} bridge`,
            );
          } finally {
            probe.remove();
          }
        };
        const effectiveBackground = (node: HTMLElement): string => {
          let current: HTMLElement | null = node;
          while (current) {
            const value = proofWindow.getComputedStyle(current).backgroundColor;
            if (value !== "transparent" && value !== "rgba(0, 0, 0, 0)") {
              return value;
            }
            current = current.parentElement;
          }
          throw new Error("no effective background color found");
        };
        const assertPadding = (
          node: HTMLElement,
          expected: number,
          label: string,
        ): void => {
          const style = proofWindow.getComputedStyle(node);
          near(px(style.paddingInlineStart, `${label} start`), expected, `${label} start`);
          near(px(style.paddingInlineEnd, `${label} end`), expected, `${label} end`);
          const contents = proofDocument.createRange();
          contents.selectNodeContents(node);
          const contentRect = contents.getBoundingClientRect();
          contents.detach();
          const borderRect = node.getBoundingClientRect();
          near(
            contentRect.left -
              borderRect.left -
              px(style.borderLeftWidth, `${label} left border`),
            expected,
            `${label} physical left clearance`,
          );
          near(
            borderRect.right -
              contentRect.right -
              px(style.borderRightWidth, `${label} right border`),
            expected,
            `${label} physical right clearance`,
          );
          if (
            forcedColors &&
            (style.color === "rgba(0, 0, 0, 0)" ||
              style.color === effectiveBackground(node))
          ) {
            throw new Error(`${label} text is unreadable in forced colors`);
          }
        };
        const baselineOffset = (node: HTMLElement): number => {
          const probe = proofDocument.createElement("span");
          probe.style.cssText =
            "border:0;display:inline-block;block-size:0;inline-size:0;margin:0;padding:0;";
          node.after(probe);
          const offset =
            probe.getBoundingClientRect().top - node.getBoundingClientRect().top;
          probe.remove();
          return offset;
        };
        const geometry = (node: HTMLElement): Record<string, string | number> => {
          const style = proofWindow.getComputedStyle(node);
          return {
            baselineOffset: baselineOffset(node),
            blockSize: node.getBoundingClientRect().height,
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            lineHeight: style.lineHeight,
            paddingBlockEnd: style.paddingBlockEnd,
            paddingBlockStart: style.paddingBlockStart,
          };
        };
        const assertGeometry = (
          node: HTMLElement,
          expected: Record<string, string | number>,
          label: string,
        ): void => {
          const actual = geometry(node);
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

        try {
          await proofDocument.fonts.ready;
          for (const rootSize of rootSizes) {
            documentRoot.style.fontSize = `${rootSize}px`;
            await nextPaint();
            for (const context of contexts) {
              const expected = rootSize * (context === "os" ? 0.25 : 0.5);
              for (const direction of directions) {
                const label = `${context}-${direction} at ${rootSize}px`;
                const fixture = proofRoot.querySelector<HTMLElement>(
                  `[data-inline-data-case="${context}-${direction}"]`,
                );
                const code = fixture?.querySelector<HTMLElement>(
                  "[data-inline-data-code]",
                );
                const keys = fixture?.querySelectorAll<HTMLElement>(
                  "[data-inline-data-key-short], [data-inline-data-key-long]",
                );
                const paragraph = fixture?.querySelector<HTMLElement>(
                  "[data-inline-data-paragraph]",
                );
                if (!fixture || !code || !keys || keys.length !== 2 || !paragraph) {
                  throw new Error(`${label} fixture is incomplete`);
                }
                if (
                  context === "default" &&
                  fixture.closest(".global, .site, .docs, .app, .os")
                ) {
                  throw new Error("default fixture selected a product context");
                }
                if (code.tagName !== "CODE") {
                  throw new Error(`${label} InlineCode lost native code semantics`);
                }
                if (
                  Array.from(keys).some(
                    (key) =>
                      key.tagName !== "KBD" ||
                      (!key.ariaLabel && !key.textContent?.trim()),
                  )
                ) {
                  throw new Error(`${label} KeyboardKey semantics are incomplete`);
                }
                near(readRolePx(fixture, label), expected, `${label} role`);
                assertPadding(code, expected, `${label} InlineCode`);
                for (const [index, key] of Array.from(keys).entries()) {
                  assertPadding(key, expected, `${label} KeyboardKey ${index}`);
                }
                consumerObservations += 1 + keys.length;
                if (officialContexts.has(context)) primaryConfigurations += 1;
                else extraConfigurations += 1;
              }
            }
          }

          documentRoot.style.fontSize = "16px";
          await nextPaint();
          const provider = proofRoot.querySelector<HTMLElement>(
            '[data-inline-data-case="app-ltr"]',
          );
          const neighbor = proofRoot.querySelector<HTMLElement>(
            '[data-inline-data-case="app-rtl"]',
          );
          const code = provider?.querySelector<HTMLElement>(
            "[data-inline-data-code]",
          );
          const key = provider?.querySelector<HTMLElement>(
            "[data-inline-data-key-long]",
          );
          const neighborCode = neighbor?.querySelector<HTMLElement>(
            "[data-inline-data-code]",
          );
          const shortKey = provider?.querySelector<HTMLElement>(
            "[data-inline-data-key-short]",
          );
          const neighborKey = neighbor?.querySelector<HTMLElement>(
            "[data-inline-data-key-long]",
          );
          const paragraph = provider?.querySelector<HTMLElement>(
            "[data-inline-data-paragraph]",
          );
          if (
            !provider ||
            !neighbor ||
            !code ||
            !key ||
            !shortKey ||
            !neighborCode ||
            !neighborKey ||
            !paragraph
          ) {
            throw new Error("mutation fixtures are incomplete");
          }
          const codeGeometry = geometry(code);
          const keyGeometry = geometry(key);
          const proseLineTops: number[] = [];
          const walker = proofDocument.createTreeWalker(
            paragraph,
            NodeFilter.SHOW_TEXT,
          );
          let textNode = walker.nextNode();
          while (textNode) {
            if (
              textNode.parentElement === paragraph &&
              textNode.textContent?.trim()
            ) {
              const range = proofDocument.createRange();
              range.selectNodeContents(textNode);
              for (const rect of Array.from(range.getClientRects())) {
                if (rect.width > 0 && rect.height > 0) {
                  proseLineTops.push(rect.top);
                }
              }
              range.detach();
            }
            textNode = walker.nextNode();
          }
          const lineTops = proseLineTops
            .filter(
              (top, index, values) =>
                values.findIndex((candidate) => Math.abs(candidate - top) < 0.75) ===
                index,
            );
          if (lineTops.length < 2) {
            throw new Error("surrounding prose did not wrap naturally");
          }

          rememberStyle(provider);
          rememberStyle(code);
          rememberStyle(key);
          provider.style.setProperty("--spacing-inset-input-inline", "13px");
          await nextPaint();
          near(readRolePx(provider, "mutated provider"), 13, "mutated bridge");
          assertPadding(code, 13, "mutated InlineCode");
          assertPadding(key, 13, "mutated KeyboardKey");
          assertPadding(neighborCode, 8, "unchanged neighboring InlineCode");
          assertPadding(neighborKey, 8, "unchanged neighboring KeyboardKey");
          assertGeometry(code, codeGeometry, "mutated InlineCode");
          assertGeometry(key, keyGeometry, "mutated KeyboardKey");

          provider.style.setProperty("--inline-code-padding-inline", "11px");
          provider.style.setProperty("--keyboard-key-padding-inline", "12px");
          await nextPaint();
          assertPadding(code, 11, "inherited InlineCode hook");
          assertPadding(key, 12, "inherited KeyboardKey hook");

          code.style.setProperty("--inline-code-padding-inline", "9px");
          key.style.setProperty("--keyboard-key-padding-inline", "10px");
          await nextPaint();
          assertPadding(code, 9, "local InlineCode hook");
          assertPadding(key, 10, "local KeyboardKey hook");
          assertPadding(shortKey, 12, "inherited sibling KeyboardKey hook");

          code.style.setProperty("--inline-code-padding-inline", "0px");
          key.style.setProperty("--keyboard-key-padding-inline", "0px");
          await nextPaint();
          assertPadding(code, 0, "zero InlineCode hook");
          assertPadding(key, 0, "zero KeyboardKey hook");
          assertPadding(shortKey, 12, "zero sibling KeyboardKey hook");

          code.style.removeProperty("--inline-code-padding-inline");
          key.style.removeProperty("--keyboard-key-padding-inline");
          await nextPaint();
          assertPadding(code, 11, "restored inherited InlineCode hook");
          assertPadding(key, 12, "restored inherited KeyboardKey hook");

          provider.style.removeProperty("--inline-code-padding-inline");
          provider.style.removeProperty("--keyboard-key-padding-inline");
          await nextPaint();
          assertPadding(code, 13, "restored InlineCode bridge");
          assertPadding(key, 13, "restored KeyboardKey bridge");

          provider.style.removeProperty("--spacing-inset-input-inline");
          await nextPaint();
          assertPadding(code, 8, "restored InlineCode context");
          assertPadding(key, 8, "restored KeyboardKey context");
          assertGeometry(code, codeGeometry, "restored InlineCode");
          assertGeometry(key, keyGeometry, "restored KeyboardKey");

        } catch (error) {
          proofRoot.dataset.inlineDataProofError =
            error instanceof Error ? error.message : String(error);
          throw error;
        } finally {
          for (const [node, style] of mutatedStyles) {
            if (style === null) node.removeAttribute("style");
            else node.setAttribute("style", style);
          }
          if (originalRootStyle === null) documentRoot.removeAttribute("style");
          else documentRoot.setAttribute("style", originalRootStyle);
          await nextPaint();
          if (documentRoot.getAttribute("style") !== originalRootStyle) {
            const error = new Error("proof did not restore the document root");
            proofRoot.dataset.inlineDataProofError = error.message;
            throw error;
          }
          for (const [node, style] of mutatedStyles) {
            if (node.getAttribute("style") !== style) {
              const error = new Error("proof did not restore a temporary hook");
              proofRoot.dataset.inlineDataProofError = error.message;
              throw error;
            }
          }
        }

        proofRoot.dataset.inlineDataPrimaryConfigurations =
          String(primaryConfigurations);
        proofRoot.dataset.inlineDataExtraConfigurations =
          String(extraConfigurations);
        proofRoot.dataset.inlineDataConsumerObservations =
          String(consumerObservations);
        proofRoot.dataset.inlineDataForcedColors = String(forcedColors);
        proofRoot.dataset.inlineDataProof = "passed";
      });
    proofWindow.__inlineDataSpacingProofQueue = current;
    try {
      await current;
    } finally {
      if (proofWindow.__inlineDataSpacingProofQueue === current) {
        delete proofWindow.__inlineDataSpacingProofQueue;
      }
    }
  },
};
