import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { userEvent } from "storybook/test";
import Component from "./Button.js";

const meta = {
  title: "Button/Spacing adoption",
  component: Component,
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;
type Tier = "site" | "docs" | "app";
type Direction = "ltr" | "rtl";

const tiers = ["site", "docs", "app"] as const;
const directions = ["ltr", "rtl"] as const;
const boxedAppearances = ["neutral", "base", "positive", "negative"] as const;
const proofOwner = "apps-landscape";

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
      data-button-spacing-case={id}
      dir={direction}
      style={{
        alignItems: "start",
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
      }}
    >
      <h2 style={{ flexBasis: "100%", margin: 0 }}>{id}</h2>
      {boxedAppearances.map((appearance) => (
        <Component
          appearance={appearance}
          data-button-proof-appearance={appearance}
          key={appearance}
        >
          Action
        </Component>
      ))}
      <Component appearance="link" data-button-proof-link="">
        Link action
      </Component>
      <Component appearance="base" data-button-proof-disabled="" disabled>
        Disabled
      </Component>
      <Component
        data-button-proof-custom=""
        style={
          {
            "--button-color-background": "rgb(173, 216, 230)",
            "--button-color-text": "rgb(25, 25, 112)",
            "--button-color-border": "rgb(25, 25, 112)",
            "--button-color-background-hover": "rgb(135, 206, 250)",
            "--button-color-border-hover": "rgb(72, 61, 139)",
            "--button-color-background-active": "rgb(135, 206, 235)",
            "--button-color-border-active": "rgb(75, 0, 130)",
          } as React.CSSProperties
        }
      >
        Custom
      </Component>
      <span className="dense">
        <Component appearance="base" data-button-proof-density="dense">
          Density
        </Component>
      </span>
      <span className="comfortable">
        <Component appearance="base" data-button-proof-density="comfortable">
          Density
        </Component>
      </span>
      <Component
        appearance="base"
        aria-label="Arbitrary children"
        data-button-proof-arbitrary=""
      >
        <span>Arbitrary</span>
        <span>children</span>
      </Component>
    </section>
  );
};

/**
 * Product Button control-layout proof. The 18 geometry configurations are
 * three tiers by three root sizes by two directions. Repeated appearance,
 * state and legacy-density observations are reported separately. Mark spacing
 * remains open because this API owns no icon/label anatomy.
 */
export const SpacingRoles: Story = {
  args: { children: "" },
  render: () => (
    <main
      className="button-spacing-proof"
      data-product-button-owner={proofOwner}
      style={{ display: "grid", gap: "2rem" }}
    >
      <section
        className="app"
        data-button-proof-focus-case=""
        style={{ display: "flex", gap: "1rem", alignItems: "center" }}
      >
        <a href="#button-proof-focus-start" id="button-proof-focus-start">
          Focus start
        </a>
        <Component appearance="base" data-button-proof-focus-boxed="">
          Boxed focus
        </Component>
        <Component appearance="link" data-button-proof-focus-link="">
          Link focus
        </Component>
      </section>
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
      __productButtonProofQueue?: Promise<void>;
    };
    const proofWindow = canvasElement.ownerDocument
      .defaultView as ProofWindow | null;
    if (!proofWindow) throw new Error("missing Button proof window");
    const previous = proofWindow.__productButtonProofQueue ?? Promise.resolve();
    const current = previous
      .catch(() => undefined)
      .then(async () => {
        const proofRoot = canvasElement.matches("main.button-spacing-proof")
          ? canvasElement
          : canvasElement.querySelector<HTMLElement>(
              "main.button-spacing-proof",
            );
        if (!proofRoot) throw new Error("missing Button spacing proof root");

        for (const key of [
          "productButtonProof",
          "productButtonProofError",
          "productButtonGeometryConfigurations",
          "productButtonAppearanceObservations",
          "productButtonLinkObservations",
          "productButtonDisabledObservations",
          "productButtonCustomPaintObservations",
          "productButtonDensityObservations",
        ] as const) {
          delete proofRoot.dataset[key];
        }

        const documentRoot = canvasElement.ownerDocument.documentElement;
        const originalRootFontSize = documentRoot.style.fontSize;
        const initialFocus =
          canvasElement.ownerDocument.activeElement instanceof HTMLElement
            ? canvasElement.ownerDocument.activeElement
            : null;
        const activeMutations = new Map<HTMLElement, string | null>();

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
        const expectProofFailure = (proof: () => void, label: string): void => {
          try {
            proof();
          } catch {
            return;
          }
          throw new Error(`${label} mutation escaped its proof oracle`);
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
          const probe = owner.ownerDocument.createElement("span");
          probe.style.cssText = `position:fixed;visibility:hidden;display:block;inline-size:var(${property});block-size:0;padding:0;margin:0;border:0`;
          owner.append(probe);
          const result = px(
            proofWindow.getComputedStyle(probe).inlineSize,
            label,
          );
          probe.remove();
          return result;
        };
        const resolveColor = (
          owner: HTMLElement,
          value: string,
          label: string,
        ): string => {
          const probe = owner.ownerDocument.createElement("span");
          probe.style.cssText = `position:fixed;visibility:hidden;display:block;color:${value}`;
          owner.append(probe);
          const result = proofWindow.getComputedStyle(probe).color;
          probe.remove();
          if (!result || result === "rgba(0, 0, 0, 0)") {
            throw new Error(`${label} is not visible`);
          }
          return result;
        };
        const independentPaint = (
          appearance: string,
          background: string,
          color: string,
        ): { backgroundColor: string; color: string } => {
          const probe = canvasElement.ownerDocument.createElement("span");
          probe.className = appearance;
          probe.style.backgroundColor = background;
          probe.style.color = color;
          proofRoot.append(probe);
          const style = proofWindow.getComputedStyle(probe);
          const result = {
            backgroundColor: style.backgroundColor,
            color: style.color,
          };
          probe.remove();
          return result;
        };
        const assertStylesheetIsolation = (): void => {
          const buttonRules: string[] = [];
          for (const sheet of Array.from(
            canvasElement.ownerDocument.styleSheets,
          )) {
            try {
              for (const rule of Array.from(sheet.cssRules)) {
                if (rule.cssText.includes(".ds.button")) {
                  buttonRules.push(rule.cssText);
                }
              }
            } catch {
              // Cross-origin sheets cannot participate in this Vite proof.
            }
          }
          const ownerLayer = `@layer ds.components.${proofOwner}`;
          const ownerRule = buttonRules.find((rule) =>
            rule.includes(ownerLayer),
          );
          if (!ownerRule) {
            throw new Error(`missing isolated ${proofOwner} Button CSS`);
          }
          for (const requiredStateChannel of [
            ":hover",
            "--button-color-background-hover",
            "--button-color-border-hover",
            ":active",
            "--button-color-background-active",
            "--button-color-border-active",
          ]) {
            if (!ownerRule.includes(requiredStateChannel)) {
              throw new Error(
                `isolated Button CSS lost ${requiredStateChannel}`,
              );
            }
          }
          if (
            buttonRules.some(
              (rule) =>
                rule.includes("@layer ds.components.global") &&
                rule.includes(".ds.button"),
            )
          ) {
            throw new Error("Global Button CSS masks the product Button proof");
          }
          for (const productLayer of [
            "apps-anbox",
            "apps-landscape",
            "apps-lxd",
            "apps-portal",
          ]) {
            if (
              productLayer !== proofOwner &&
              buttonRules.some((rule) =>
                rule.includes(`@layer ds.components.${productLayer}`),
              )
            ) {
              throw new Error(
                `${productLayer} Button CSS masks the ${proofOwner} proof`,
              );
            }
          }
        };
        const tierValues = (tier: Tier, rootSize: number) => {
          if (tier === "site") {
            return {
              fontSize: rootSize,
              lineHeight: rootSize * 1.5,
              action: rootSize,
              controlInset: 0,
              occupancyAt16: 40,
            };
          }
          return {
            fontSize: rootSize * 0.875,
            lineHeight: rootSize * 1.25,
            action: rootSize * 0.75,
            controlInset: rootSize * 0.25,
            occupancyAt16: 32,
          };
        };
        const assertBoxedControl = (
          button: HTMLButtonElement,
          tier: Tier,
          rootSize: number,
          label: string,
        ): void => {
          const style = proofWindow.getComputedStyle(button);
          const values = tierValues(tier, rootSize);
          if (
            !button.classList.contains("spacing-control-seat") ||
            !button.classList.contains("stroke-paint") ||
            !button.classList.contains("stroke")
          ) {
            throw new Error(`${label} is missing shared control paint helpers`);
          }
          near(
            px(style.fontSize, `${label} font size`),
            values.fontSize,
            `${label} font size`,
          );
          near(
            px(style.lineHeight, `${label} line height`),
            values.lineHeight,
            `${label} line height`,
          );
          const action = resolveLength(
            button,
            "--ds-spacing-action",
            `${label} action role`,
          );
          near(action, values.action, `${label} action role`);
          near(
            px(style.paddingInlineStart, `${label} inline start`),
            action,
            `${label} inline start`,
          );
          near(
            px(style.paddingInlineEnd, `${label} inline end`),
            action,
            `${label} inline end`,
          );
          const controlInset = resolveLength(
            button,
            "--ds-spacing-control-inset",
            `${label} control inset role`,
          );
          near(
            controlInset,
            values.controlInset,
            `${label} control inset role`,
          );
          const baselineNudge = resolveLength(
            button,
            "--ds-control-baseline-nudge",
            `${label} baseline nudge`,
          );
          const controlPadding = resolveLength(
            button,
            "--ds-control-padding-block",
            `${label} control padding`,
          );
          near(
            controlPadding,
            controlInset + baselineNudge,
            `${label} baseline-adjusted control padding`,
          );
          near(
            px(style.paddingBlockStart, `${label} block start`),
            controlPadding,
            `${label} block start`,
          );
          near(
            px(style.paddingBlockEnd, `${label} block end`),
            controlPadding,
            `${label} block end`,
          );
          const occupiedSize = resolveLength(
            button,
            "--ds-control-occupied-size",
            `${label} occupied size`,
          );
          const closure = resolveLength(
            button,
            "--ds-control-grid-compensation",
            `${label} closure`,
          );
          near(
            button.getBoundingClientRect().height,
            occupiedSize,
            `${label} occupied height`,
          );
          near(
            px(style.marginBlockStart, `${label} margin start`),
            0,
            `${label} margin start`,
          );
          near(
            px(style.marginBlockEnd, `${label} margin end`),
            closure,
            `${label} closure margin`,
          );
          if (rootSize === 16) {
            near(
              occupiedSize + closure,
              values.occupancyAt16,
              `${label} 16px-root occupancy`,
            );
          }
          for (const [edge, width] of [
            ["top", style.borderTopWidth],
            ["right", style.borderRightWidth],
            ["bottom", style.borderBottomWidth],
            ["left", style.borderLeftWidth],
          ] as const) {
            near(
              px(width, `${label} ${edge} border`),
              0,
              `${label} ${edge} border`,
            );
          }
          if (
            px(style.borderTopLeftRadius, `${label} radius`) !== 0 ||
            style.position !== "static"
          ) {
            throw new Error(`${label} lost square static construction`);
          }
          if (
            resolveLength(
              button,
              "--ds-stroke-width",
              `${label} stroke width`,
            ) <= 0 ||
            style.boxShadow === "none"
          ) {
            throw new Error(`${label} lost paint-only stroke`);
          }
        };
        const assertLinkBoundary = (
          button: HTMLButtonElement,
          tier: Tier,
          rootSize: number,
          label: string,
        ): void => {
          const style = proofWindow.getComputedStyle(button);
          const values = tierValues(tier, rootSize);
          if (
            button.classList.contains("spacing-control-seat") ||
            button.classList.contains("stroke-paint") ||
            button.classList.contains("stroke")
          ) {
            throw new Error(`${label} link exposes boxed helpers`);
          }
          near(
            px(style.fontSize, `${label} font size`),
            values.fontSize,
            `${label} font size`,
          );
          near(
            px(style.lineHeight, `${label} line height`),
            values.lineHeight,
            `${label} line height`,
          );
          for (const [name, value] of [
            ["padding block start", style.paddingBlockStart],
            ["padding block end", style.paddingBlockEnd],
            ["padding inline start", style.paddingInlineStart],
            ["padding inline end", style.paddingInlineEnd],
            ["margin block start", style.marginBlockStart],
            ["margin block end", style.marginBlockEnd],
            ["border top", style.borderTopWidth],
            ["border right", style.borderRightWidth],
            ["border bottom", style.borderBottomWidth],
            ["border left", style.borderLeftWidth],
          ] as const) {
            near(px(value, `${label} ${name}`), 0, `${label} ${name}`);
          }
          if (
            style.backgroundColor !== "rgba(0, 0, 0, 0)" ||
            style.boxShadow !== "none"
          ) {
            throw new Error(`${label} link retained boxed paint`);
          }
        };
        const assertCustomPaint = (
          button: HTMLButtonElement,
          label: string,
        ): void => {
          const style = proofWindow.getComputedStyle(button);
          if (
            style.backgroundColor !== "rgb(173, 216, 230)" ||
            style.color !== "rgb(25, 25, 112)" ||
            resolveColor(
              button,
              "var(--ds-stroke-color)",
              `${label} stroke`,
            ) !== "rgb(25, 25, 112)"
          ) {
            throw new Error(`${label} custom paint aliases were lost`);
          }
        };
        const assertFocusPaint = (
          button: HTMLButtonElement,
          label: string,
        ): void => {
          if (
            canvasElement.ownerDocument.activeElement !== button ||
            !button.matches(":focus-visible")
          ) {
            throw new Error(`${label} did not receive keyboard focus-visible`);
          }
          const style = proofWindow.getComputedStyle(button);
          if (
            px(style.outlineWidth, `${label} outline width`) <= 0 ||
            style.outlineStyle === "none" ||
            style.outlineColor === "transparent" ||
            style.outlineColor === "rgba(0, 0, 0, 0)"
          ) {
            throw new Error(`${label} focus paint is not visible`);
          }
        };

        try {
          assertStylesheetIsolation();
          let geometryConfigurations = 0;
          let appearanceObservations = 0;
          let linkObservations = 0;
          let disabledObservations = 0;
          let customPaintObservations = 0;
          let densityObservations = 0;

          for (const rootSize of [14, 16, 20]) {
            documentRoot.style.fontSize = `${rootSize}px`;
            await nextPaint();
            for (const tier of tiers) {
              for (const direction of directions) {
                const id = `${tier}-${direction}`;
                const section = proofRoot.querySelector<HTMLElement>(
                  `[data-button-spacing-case="${id}"]`,
                );
                if (!section) throw new Error(`missing ${id} Button case`);
                const boxed = Array.from(
                  section.querySelectorAll<HTMLButtonElement>(
                    "[data-button-proof-appearance]",
                  ),
                );
                const neutral = boxed.find(
                  (button) =>
                    button.dataset.buttonProofAppearance === "neutral",
                );
                const link = section.querySelector<HTMLButtonElement>(
                  "[data-button-proof-link]",
                );
                const disabled = section.querySelector<HTMLButtonElement>(
                  "[data-button-proof-disabled]",
                );
                const custom = section.querySelector<HTMLButtonElement>(
                  "[data-button-proof-custom]",
                );
                const arbitrary = section.querySelector<HTMLButtonElement>(
                  "[data-button-proof-arbitrary]",
                );
                const densityButtons = Array.from(
                  section.querySelectorAll<HTMLButtonElement>(
                    "[data-button-proof-density]",
                  ),
                );
                if (
                  !neutral ||
                  !link ||
                  !disabled ||
                  !custom ||
                  !arbitrary ||
                  boxed.length !== boxedAppearances.length ||
                  densityButtons.length !== 2
                ) {
                  throw new Error(`incomplete ${id} Button proof case`);
                }

                assertBoxedControl(neutral, tier, rootSize, `${id} neutral`);
                geometryConfigurations += 1;
                const neutralStyle = proofWindow.getComputedStyle(neutral);
                for (const button of boxed) {
                  const appearance =
                    button.dataset.buttonProofAppearance ?? "missing";
                  assertBoxedControl(
                    button,
                    tier,
                    rootSize,
                    `${id} ${appearance}`,
                  );
                  const style = proofWindow.getComputedStyle(button);
                  near(
                    button.getBoundingClientRect().height,
                    neutral.getBoundingClientRect().height,
                    `${id} ${appearance} height`,
                  );
                  near(
                    px(style.marginBlockEnd, `${id} ${appearance} margin`),
                    px(neutralStyle.marginBlockEnd, `${id} neutral margin`),
                    `${id} ${appearance} closure`,
                  );
                  appearanceObservations += 1;
                }

                assertLinkBoundary(link, tier, rootSize, `${id} link`);
                linkObservations += 1;
                assertBoxedControl(disabled, tier, rootSize, `${id} disabled`);
                if (!disabled.disabled) {
                  throw new Error(`${id} disabled lost native state`);
                }
                disabledObservations += 1;
                assertBoxedControl(custom, tier, rootSize, `${id} custom`);
                assertCustomPaint(custom, `${id} custom`);

                customPaintObservations += 1;

                for (const button of densityButtons) {
                  assertBoxedControl(
                    button,
                    tier,
                    rootSize,
                    `${id} ${button.dataset.buttonProofDensity}`,
                  );
                  const style = proofWindow.getComputedStyle(button);
                  near(
                    button.getBoundingClientRect().height,
                    neutral.getBoundingClientRect().height,
                    `${id} ${button.dataset.buttonProofDensity} height`,
                  );
                  near(
                    px(style.paddingBlockStart, `${id} density block`),
                    px(neutralStyle.paddingBlockStart, `${id} neutral block`),
                    `${id} ${button.dataset.buttonProofDensity} block padding`,
                  );
                  densityObservations += 1;
                }

                if (
                  arbitrary.children.length !== 2 ||
                  arbitrary.firstElementChild?.textContent !== "Arbitrary" ||
                  arbitrary.lastElementChild?.textContent !== "children" ||
                  proofWindow.getComputedStyle(arbitrary).columnGap !== "normal"
                ) {
                  throw new Error(
                    `${id} arbitrary children gained invented mark anatomy`,
                  );
                }
              }
            }
          }

          documentRoot.style.fontSize = "16px";
          await nextPaint();
          const representative = proofRoot.querySelector<HTMLElement>(
            '[data-button-spacing-case="docs-ltr"]',
          );
          const representativeButton =
            representative?.querySelector<HTMLButtonElement>(
              '[data-button-proof-appearance="neutral"]',
            );
          const representativeCustom =
            representative?.querySelector<HTMLButtonElement>(
              "[data-button-proof-custom]",
            );
          if (
            !representative ||
            !representativeButton ||
            !representativeCustom
          ) {
            throw new Error("missing representative Button mutation case");
          }

          const defaultProviderWidth =
            representativeButton.getBoundingClientRect().width;
          rememberStyle(representative);
          try {
            representative.style.setProperty(
              "--spacing-inset-action-inline",
              "19px",
            );
            await nextPaint();
            near(
              px(
                proofWindow.getComputedStyle(representativeButton)
                  .paddingInlineStart,
                "provider action padding",
              ),
              19,
              "provider action padding",
            );
            if (
              representativeButton.getBoundingClientRect().width <=
              defaultProviderWidth
            ) {
              throw new Error(
                "provider action token did not expand the Button",
              );
            }
          } finally {
            restoreStyle(representative);
            await nextPaint();
          }
          const defaultProviderHeight =
            representativeButton.getBoundingClientRect().height;
          rememberStyle(representative);
          try {
            representative.style.setProperty(
              "--spacing-inset-control-block",
              "9px",
            );
            await nextPaint();
            if (
              representativeButton.getBoundingClientRect().height <=
              defaultProviderHeight
            ) {
              throw new Error(
                "provider control token did not expand the Button",
              );
            }
          } finally {
            restoreStyle(representative);
            await nextPaint();
          }
          assertBoxedControl(
            representativeButton,
            "docs",
            16,
            "restored provider bindings",
          );

          const defaultStrokeRect =
            representativeButton.getBoundingClientRect();
          rememberStyle(representativeButton);
          try {
            representativeButton.style.setProperty(
              "--button-border-width",
              "3px",
            );
            await nextPaint();
            near(
              resolveLength(
                representativeButton,
                "--ds-stroke-width",
                "consumer stroke width",
              ),
              3,
              "consumer stroke width",
            );
            const overrideStyle =
              proofWindow.getComputedStyle(representativeButton);
            near(
              representativeButton.getBoundingClientRect().width,
              defaultStrokeRect.width,
              "consumer stroke override width",
            );
            near(
              representativeButton.getBoundingClientRect().height,
              defaultStrokeRect.height,
              "consumer stroke override height",
            );
            for (const width of [
              overrideStyle.borderTopWidth,
              overrideStyle.borderRightWidth,
              overrideStyle.borderBottomWidth,
              overrideStyle.borderLeftWidth,
            ]) {
              near(
                px(width, "consumer layout border"),
                0,
                "consumer layout border",
              );
            }
          } finally {
            restoreStyle(representativeButton);
            await nextPaint();
          }
          assertBoxedControl(
            representativeButton,
            "docs",
            16,
            "restored consumer stroke override",
          );

          for (const [property, value, label] of [
            ["--button-padding-inline-start", "0px", "action"],
            ["--ds-control-seat-padding-block", "0px", "control"],
            ["--ds-stroke-width", "0px", "stroke"],
          ] as const) {
            rememberStyle(representativeButton);
            try {
              representativeButton.style.setProperty(property, value);
              expectProofFailure(
                () =>
                  assertBoxedControl(
                    representativeButton,
                    "docs",
                    16,
                    `mutated ${label}`,
                  ),
                `${label} role`,
              );
            } finally {
              restoreStyle(representativeButton);
            }
            assertBoxedControl(
              representativeButton,
              "docs",
              16,
              `restored ${label}`,
            );
          }

          const paintCases = Array.from(
            representative.querySelectorAll<HTMLButtonElement>(
              "[data-button-proof-appearance]",
            ),
          );
          for (const button of paintCases) {
            const appearance = button.dataset.buttonProofAppearance ?? "";
            const style = proofWindow.getComputedStyle(button);
            const expected = independentPaint(
              appearance,
              "var(--modifier-color, var(--button-color-background))",
              "var(--modifier-color-text, var(--button-color-text))",
            );
            if (
              style.backgroundColor !== expected.backgroundColor ||
              style.color !== expected.color
            ) {
              throw new Error(`${appearance} changed legacy paint channels`);
            }
            const expectedStroke = independentPaint(
              appearance,
              "transparent",
              "var(--modifier-color-border, currentColor)",
            ).color;
            if (
              resolveColor(
                button,
                "var(--ds-stroke-color)",
                `${appearance} stroke`,
              ) !== expectedStroke
            ) {
              throw new Error(`${appearance} changed legacy stroke channel`);
            }
          }

          rememberStyle(representativeCustom);
          try {
            representativeCustom.style.setProperty(
              "--button-color-background",
              "transparent",
            );
            expectProofFailure(
              () =>
                assertCustomPaint(representativeCustom, "mutated appearance"),
              "appearance channel",
            );
          } finally {
            restoreStyle(representativeCustom);
          }
          assertCustomPaint(representativeCustom, "restored appearance");

          const focusStart = proofRoot.querySelector<HTMLElement>(
            "#button-proof-focus-start",
          );
          const boxedFocus = proofRoot.querySelector<HTMLButtonElement>(
            "[data-button-proof-focus-boxed]",
          );
          const linkFocus = proofRoot.querySelector<HTMLButtonElement>(
            "[data-button-proof-focus-link]",
          );
          if (!focusStart || !boxedFocus || !linkFocus) {
            throw new Error("missing Button focus proof controls");
          }
          focusStart.focus();
          const boxedBefore = boxedFocus.getBoundingClientRect();
          await userEvent.tab();
          assertFocusPaint(boxedFocus, "boxed Button");
          near(
            boxedFocus.getBoundingClientRect().width,
            boxedBefore.width,
            "boxed focus width",
          );
          near(
            boxedFocus.getBoundingClientRect().height,
            boxedBefore.height,
            "boxed focus height",
          );

          rememberStyle(boxedFocus);
          try {
            boxedFocus.style.setProperty("--ds-focus-width", "0px");
            expectProofFailure(
              () => assertFocusPaint(boxedFocus, "mutated boxed Button"),
              "focus role",
            );
          } finally {
            restoreStyle(boxedFocus);
          }
          assertFocusPaint(boxedFocus, "restored boxed Button");

          const linkBefore = linkFocus.getBoundingClientRect();
          await userEvent.tab();
          assertFocusPaint(linkFocus, "link Button");
          near(
            linkFocus.getBoundingClientRect().width,
            linkBefore.width,
            "link focus width",
          );
          near(
            linkFocus.getBoundingClientRect().height,
            linkBefore.height,
            "link focus height",
          );

          let clickCount = 0;
          const onClick = (): void => {
            clickCount += 1;
          };
          representativeButton.addEventListener("click", onClick);
          try {
            await userEvent.click(representativeButton);
            if (clickCount !== 1) {
              throw new Error("native Button click did not fire exactly once");
            }
          } finally {
            representativeButton.removeEventListener("click", onClick);
          }
          let disabledClickCount = 0;
          const representativeDisabled =
            representative.querySelector<HTMLButtonElement>(
              "[data-button-proof-disabled]",
            );
          if (!representativeDisabled) {
            throw new Error("missing representative disabled Button");
          }
          const onDisabledClick = (): void => {
            disabledClickCount += 1;
          };
          representativeDisabled.addEventListener("click", onDisabledClick);
          try {
            await userEvent.click(representativeDisabled);
            if (disabledClickCount !== 0) {
              throw new Error("disabled Button fired a native click");
            }
          } finally {
            representativeDisabled.removeEventListener(
              "click",
              onDisabledClick,
            );
          }

          proofRoot.dataset.productButtonGeometryConfigurations = String(
            geometryConfigurations,
          );
          proofRoot.dataset.productButtonAppearanceObservations = String(
            appearanceObservations,
          );
          proofRoot.dataset.productButtonLinkObservations =
            String(linkObservations);
          proofRoot.dataset.productButtonDisabledObservations =
            String(disabledObservations);
          proofRoot.dataset.productButtonCustomPaintObservations = String(
            customPaintObservations,
          );
          proofRoot.dataset.productButtonDensityObservations =
            String(densityObservations);
          proofRoot.dataset.productButtonProof = "passed";
        } catch (error) {
          proofRoot.dataset.productButtonProofError =
            error instanceof Error ? error.message : String(error);
          throw error;
        } finally {
          for (const node of Array.from(activeMutations.keys())) {
            restoreStyle(node);
          }
          const activeElement = canvasElement.ownerDocument.activeElement;
          if (activeElement instanceof HTMLElement) activeElement.blur();
          if (initialFocus?.isConnected) initialFocus.focus();
          documentRoot.style.fontSize = originalRootFontSize;
        }
      });
    proofWindow.__productButtonProofQueue = current;
    await current;
  },
};
