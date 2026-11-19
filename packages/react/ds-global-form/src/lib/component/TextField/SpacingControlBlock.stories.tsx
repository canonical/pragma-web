import {
  Button,
  Chip,
  ContextualMenuItem,
  Tabs,
} from "@canonical/react-ds-global";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { expect, waitFor } from "storybook/test";
import { Form } from "../../pattern/Form/index.js";
import { ColorInput } from "../../subcomponent/ColorInput/index.js";
import { ComboboxInput } from "../../subcomponent/ComboboxInput/index.js";
import { DateInput } from "../../subcomponent/DateInput/index.js";
import { DateTimeInput } from "../../subcomponent/DateTimeInput/index.js";
import { NumberInput } from "../../subcomponent/NumberInput/index.js";
import { PasswordInput } from "../../subcomponent/PasswordInput/index.js";
import { PhoneInput } from "../../subcomponent/PhoneInput/index.js";
import { SelectInput } from "../../subcomponent/SelectInput/index.js";
import { TextInput } from "../../subcomponent/TextInput/index.js";
import { TimeInput } from "../../subcomponent/TimeInput/index.js";
import { RichChoices } from "../RichChoicesField/RichChoices.js";
import { TextField } from "./index.js";
import "./SpacingControlBlock.css";

const meta = {
  title: "Spacing buckets/01 Control block",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Metrics = {
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  inset: number;
  nudge: number;
  paddingStart: number;
  paddingEnd: number;
  marginEnd: number;
  visible: number;
  occupied: number;
  borders: string;
  blockStartDifference: number | null;
  naturalVisible: number | null;
  setClosure: number | null;
  baseline: number | null;
  baselineDifference: number | null;
  capModelBaseline: number | null;
  occupiedEnd: number;
  guideLeft: number;
  guideTop: number;
  guideWidth: number;
  sharedLeft: number | null;
  sharedWidth: number | null;
};

const number = (value: string): number => Number.parseFloat(value) || 0;
const show = (value: number): string => `${value.toFixed(2)}px`;

/** Resolve cap/rem/custom-property lengths through layout rather than parseFloat. */
const resolveLength = (
  owner: HTMLElement,
  value: string,
  style: CSSStyleDeclaration,
): number => {
  const tier = owner.closest<HTMLElement>(".site, .docs, .app") ?? owner;
  const probe = document.createElement("span");
  probe.className = "bucket-length-probe";
  probe.style.cssText = [
    "position:absolute",
    "visibility:hidden",
    "pointer-events:none",
    "block-size:0",
    `inline-size:${value}`,
    `font-family:${style.fontFamily}`,
    `font-size:${style.fontSize}`,
    `font-weight:${style.fontWeight}`,
    `line-height:${style.lineHeight}`,
  ].join(";");
  tier.append(probe);
  const result = probe.getBoundingClientRect().width;
  probe.remove();
  return result;
};

const isNativeLeaf = (element: HTMLElement): boolean =>
  element.matches("input, select, textarea");

/** Read the baseline from browser layout, without deriving it from cap metrics. */
const readBrowserBaseline = (
  owner: HTMLElement,
  baselineOwner: HTMLElement,
  guideRect: DOMRect,
): number | null => {
  const baselineStyle = getComputedStyle(baselineOwner);
  const needsTextFlowClone = /flex|grid/.test(baselineStyle.display);
  if (!isNativeLeaf(baselineOwner) && !needsTextFlowClone) {
    const before = owner.getBoundingClientRect();
    const marker = document.createElement("span");
    marker.className = "bucket-baseline-marker";
    // A leading marker reads the first baseline even when the text wraps;
    // single-line control specimens retain the same zero-size marker position.
    baselineOwner.prepend(marker);
    const markerTop = marker.getBoundingClientRect().top;
    const after = owner.getBoundingClientRect();
    marker.remove();
    if (
      Math.abs(before.width - after.width) < 0.05 &&
      Math.abs(before.height - after.height) < 0.05 &&
      Math.abs(before.top - after.top) < 0.05
    ) {
      return markerTop - guideRect.top;
    }
  }

  const tier = owner.closest<HTMLElement>(".site, .docs, .app") ?? owner;
  const baselineRect = baselineOwner.getBoundingClientRect();
  const rig = document.createElement("span");
  rig.className = "bucket-baseline-rig";
  const clone = baselineOwner.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("[id]").forEach((element) => {
    element.removeAttribute("id");
  });
  clone.removeAttribute("id");
  for (const property of baselineStyle) {
    clone.style.setProperty(property, baselineStyle.getPropertyValue(property));
  }
  clone.style.setProperty("inline-size", `${baselineRect.width}px`);
  clone.style.setProperty("block-size", `${baselineRect.height}px`);
  clone.style.setProperty("position", "static");
  clone.style.setProperty("inset", "auto");
  clone.style.setProperty("transform", "none");
  if (!needsTextFlowClone) {
    clone.style.setProperty("display", "inline-block");
    clone.style.setProperty("vertical-align", "baseline");
    clone.style.setProperty("align-self", "baseline");
  }
  const marker = document.createElement("span");
  marker.className = "bucket-baseline-marker";
  if (needsTextFlowClone) {
    const text = [...clone.childNodes].find(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
    );
    const textFlow = document.createElement("span");
    textFlow.textContent = text?.textContent ?? "";
    textFlow.append(marker);
    text?.replaceWith(textFlow);
    rig.append(clone);
  } else {
    rig.append(clone, marker);
  }
  tier.append(rig);
  const cloneRect = clone.getBoundingClientRect();
  const baseline =
    baselineRect.top -
    guideRect.top +
    marker.getBoundingClientRect().top -
    cloneRect.top;
  const faithfulSize =
    Math.abs(cloneRect.width - baselineRect.width) < 0.05 &&
    Math.abs(cloneRect.height - baselineRect.height) < 0.05;
  rig.remove();
  return faithfulSize ? baseline : null;
};

const readMetrics = (
  owner: HTMLElement,
  baselineOwner: HTMLElement,
  seatOwner: HTMLElement,
  usesControlInset: boolean,
  referenceOwner: HTMLElement | null,
  hasTextBaseline: boolean,
  naturalVisibleOwner: HTMLElement | null,
): Metrics => {
  const ownerStyle = getComputedStyle(owner);
  const style = getComputedStyle(seatOwner);
  const baselineStyle = getComputedStyle(baselineOwner);
  const ownerRect = owner.getBoundingClientRect();
  const guideRect = naturalVisibleOwner?.getBoundingClientRect() ?? ownerRect;
  const fontSize = number(baselineStyle.fontSize);
  const lineHeight = number(baselineStyle.lineHeight);
  const unit = resolveLength(owner, "var(--ds-spacing-baseline)", style);
  const inset = usesControlInset
    ? resolveLength(owner, "var(--ds-spacing-control-inset, 0px)", style)
    : 0;
  const cap = resolveLength(owner, "1cap", baselineStyle);
  const naturalBaseline = (lineHeight + cap) / 2;
  const unquantizedNudge =
    Math.ceil((naturalBaseline - 1e-7) / unit) * unit - naturalBaseline;
  const nudge = Math.round(unquantizedNudge * 64) / 64;
  const paddingStart = number(style.paddingBlockStart);
  const paddingEnd = number(style.paddingBlockEnd);
  const marginEnd = number(style.marginBlockEnd);
  const ownerMarginEnd = number(ownerStyle.marginBlockEnd);
  const baseline = hasTextBaseline
    ? readBrowserBaseline(owner, baselineOwner, guideRect)
    : null;
  const referenceLabel = referenceOwner?.querySelector<HTMLElement>(".label");
  const referenceRect = referenceOwner?.getBoundingClientRect();
  const referenceBaseline =
    referenceOwner && referenceLabel && referenceRect
      ? readBrowserBaseline(referenceOwner, referenceLabel, referenceRect)
      : null;
  const borderValues = [
    style.borderBlockStartWidth,
    style.borderInlineEndWidth,
    style.borderBlockEndWidth,
    style.borderInlineStartWidth,
  ];

  return {
    fontSize,
    fontWeight: number(baselineStyle.fontWeight),
    lineHeight,
    inset,
    nudge,
    paddingStart,
    paddingEnd,
    marginEnd,
    visible: ownerRect.height,
    occupied: ownerRect.height + ownerMarginEnd,
    borders: borderValues.join(" / "),
    blockStartDifference: referenceOwner
      ? ownerRect.top - referenceOwner.getBoundingClientRect().top
      : null,
    naturalVisible: naturalVisibleOwner
      ? naturalVisibleOwner.getBoundingClientRect().height
      : null,
    setClosure: naturalVisibleOwner ? ownerRect.height + ownerMarginEnd : null,
    baseline,
    baselineDifference:
      baseline != null && referenceBaseline != null && referenceRect
        ? guideRect.top + baseline - referenceRect.top - referenceBaseline
        : null,
    capModelBaseline: hasTextBaseline
      ? ownerRect.top - guideRect.top + paddingStart + naturalBaseline
      : null,
    occupiedEnd: ownerRect.bottom + ownerMarginEnd - guideRect.top,
    guideLeft: guideRect.left,
    guideTop: guideRect.top,
    guideWidth: guideRect.width,
    sharedLeft: null,
    sharedWidth: null,
  };
};

const MetricsOutput = ({ metrics }: { metrics: Metrics | null }) => (
  <output
    className="bucket-metrics"
    data-metrics={metrics ? JSON.stringify(metrics) : undefined}
    hidden
  >
    {metrics ? (
      <>
        font/line {show(metrics.fontSize)} / {show(metrics.lineHeight)}
        <br />
        inset/nudge {show(metrics.inset)} / {show(metrics.nudge)}
        <br />
        pads {show(metrics.paddingStart)} / {show(metrics.paddingEnd)}
        <br />
        end margin {show(metrics.marginEnd)}
        <br />
        visible/occupied {show(metrics.visible)} / {show(metrics.occupied)}
        <br />
        {metrics.naturalVisible != null ? (
          <>
            natural strip/set closure {show(metrics.naturalVisible)} /{" "}
            {show(metrics.setClosure ?? 0)}
            <br />
          </>
        ) : null}
        {metrics.blockStartDifference != null ? (
          <>
            block-start vs Plain Button {show(metrics.blockStartDifference)}
            <br />
          </>
        ) : null}
        layout borders {metrics.borders}
        <br />
        {metrics.baseline == null
          ? "no text baseline"
          : `browser baseline offset ${show(metrics.baseline)}`}
        {metrics.baselineDifference == null
          ? null
          : `; Δ vs Plain Button ${show(metrics.baselineDifference)}`}
      </>
    ) : (
      "awaiting fonts and styles"
    )}
  </output>
);

const Measured = ({
  label,
  children,
  ownerSelector,
  baselineSelector,
  seatSelector,
  usesControlInset = true,
  reference = false,
  hasTextBaseline = true,
  naturalVisibleSelector,
  flow = false,
}: {
  label: string;
  children: React.ReactNode;
  ownerSelector: string;
  baselineSelector?: string;
  seatSelector?: string;
  usesControlInset?: boolean;
  reference?: boolean;
  hasTextBaseline?: boolean;
  naturalVisibleSelector?: string;
  flow?: boolean;
}) => {
  const root = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    let frame = 0;
    let observer: MutationObserver | undefined;
    const update = () => {
      const local = root.current;
      const owner = local?.querySelector(ownerSelector) as HTMLElement | null;
      const baselineOwner = (
        baselineSelector ? owner?.querySelector(baselineSelector) : owner
      ) as HTMLElement | null;
      const seatOwner = (
        seatSelector ? owner?.querySelector(seatSelector) : owner
      ) as HTMLElement | null;
      const referenceOwner = flow
        ? null
        : local
            // Each Before/Adopted row has its own Button. A tier-wide lookup
            // would compare later rows against a Button at another block start.
            ?.closest(".bucket-samples")
            ?.querySelector<HTMLElement>("[data-bucket-reference] .button");
      const naturalVisibleOwner = naturalVisibleSelector
        ? (owner?.querySelector(naturalVisibleSelector) as HTMLElement | null)
        : null;
      const ownerStyle = owner ? getComputedStyle(owner) : null;
      const ownerIsVisible =
        ownerStyle?.display !== "none" && ownerStyle?.visibility !== "hidden";
      if (owner && baselineOwner && seatOwner && ownerIsVisible) {
        const nextMetrics = readMetrics(
          owner,
          baselineOwner,
          seatOwner,
          usesControlInset,
          referenceOwner ?? null,
          hasTextBaseline,
          naturalVisibleOwner,
        );
        if (local) {
          const localRect = local.getBoundingClientRect();
          nextMetrics.guideLeft -= localRect.left;
          nextMetrics.guideTop -= localRect.top;
          if (reference) {
            const row = local.closest<HTMLElement>(".bucket-samples");
            if (row) {
              const rowRect = row.getBoundingClientRect();
              nextMetrics.sharedLeft = rowRect.left - localRect.left;
              nextMetrics.sharedWidth = row.scrollWidth;
            }
          }
        }
        setMetrics(nextMetrics);
      }
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => requestAnimationFrame(update));
    };
    void document.fonts.ready.then(schedule);
    const isGeneratedNode = (node: Node): boolean =>
      node instanceof Element &&
      (node.matches(
        ".bucket-length-probe, .bucket-baseline-rig, .bucket-baseline-marker, .bucket-guide, .bucket-shared-guides, .bucket-metrics",
      ) ||
        Boolean(
          node.closest(
            ".bucket-length-probe, .bucket-baseline-rig, .bucket-baseline-marker, .bucket-guide, .bucket-shared-guides, .bucket-metrics",
          ),
        ));
    observer = new MutationObserver((records) => {
      const hasRelevantMutation = records.some((record) => {
        if (isGeneratedNode(record.target)) return false;
        if (record.type !== "childList") return true;
        return [...record.addedNodes, ...record.removedNodes].some(
          (node) => !isGeneratedNode(node),
        );
      });
      if (hasRelevantMutation) schedule();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
    };
  }, [
    baselineSelector,
    flow,
    hasTextBaseline,
    naturalVisibleSelector,
    ownerSelector,
    reference,
    seatSelector,
    usesControlInset,
  ]);

  return (
    <figure className="bucket-sample">
      <figcaption>{label}</figcaption>
      <div
        className={`bucket-measure${flow ? " bucket-measure--flow" : ""}`}
        ref={root}
        data-bucket-reference={reference || undefined}
      >
        {children}
        {metrics ? (
          <span
            aria-hidden="true"
            className="bucket-guide"
            style={
              {
                "--bucket-guide-left": `${metrics.guideLeft}px`,
                "--bucket-guide-top": `${metrics.guideTop}px`,
                "--bucket-guide-width": `${metrics.guideWidth}px`,
                "--bucket-guide-baseline": `${metrics.baseline ?? 0}px`,
                "--bucket-guide-end": `${metrics.occupiedEnd}px`,
              } as React.CSSProperties
            }
          >
            <span className="bucket-guide-top" />
            {metrics.baseline == null ? null : (
              <span className="bucket-guide-baseline" />
            )}
            <span className="bucket-guide-end" />
          </span>
        ) : null}
        {reference && metrics?.sharedWidth != null ? (
          <span
            aria-hidden="true"
            className="bucket-shared-guides"
            style={
              {
                "--bucket-shared-left": `${metrics.sharedLeft}px`,
                "--bucket-shared-width": `${metrics.sharedWidth}px`,
                "--bucket-shared-top": `${metrics.guideTop}px`,
                "--bucket-shared-baseline": `${metrics.guideTop + (metrics.baseline ?? 0)}px`,
                "--bucket-shared-end": `${metrics.guideTop + metrics.occupiedEnd}px`,
              } as React.CSSProperties
            }
          >
            <span className="bucket-shared-top" />
            <span className="bucket-shared-baseline" />
            <span className="bucket-shared-end" />
          </span>
        ) : null}
      </div>
      <MetricsOutput metrics={metrics} />
    </figure>
  );
};

const tabsRoot: React.ComponentProps<typeof Tabs>["navigationRoot"] = {
  key: "spacing-tabs",
  label: "Spacing tabs",
  items: [
    { key: "overview", label: "Overview", url: "#/overview" },
    { key: "details", label: "Details", url: "#/details" },
  ],
};

const MenuItemFixture = ({ tier }: { tier: string }) => {
  const item = {
    key: `${tier}-preview-menu-item`,
    label: "Open details",
    url: "#open",
  } as React.ComponentProps<typeof ContextualMenuItem>["item"];
  return (
    <div
      className="ds contextual-menu__surface spacing-control-group spacing-preview-menu-surface"
      role="menu"
      aria-label={`${tier} menu item specimen`}
      aria-hidden="false"
    >
      <ContextualMenuItem
        item={item}
        itemProps={{ role: "menuitem", tabIndex: -1 }}
        onSelect={() => undefined}
      />
    </div>
  );
};

type TierName = "site" | "docs" | "app";
// Fixed size/line/weight expectations keep a changed type mapping from silently
// redefining which roles the proof considers root-size.
const typeScale = {
  site: {
    body: [16, 24, 400],
    h1: [42, 48, 500],
    h2: [42, 48, 300],
    h3: [24, 32, 500],
    h4: [24, 32, 300],
    h5: [16, 24, 600],
    h6: [16, 24, 400],
  },
  docs: {
    body: [14, 20, 400],
    h1: [32, 40, 500],
    h2: [32, 40, 300],
    h3: [24, 32, 500],
    h4: [24, 32, 300],
    h5: [18, 24, 600],
    h6: [18, 24, 400],
  },
  app: {
    body: [14, 20, 400],
    h1: [24, 32, 500],
    h2: [24, 32, 300],
    h3: [18, 24, 600],
    h4: [18, 24, 400],
    h5: [14, 20, 600],
    h6: [14, 20, 600],
  },
} as const;
const seatedRoles: Record<TierName, readonly string[]> = {
  site: ["body", "h5", "h6", "helper", "wrapped", "cell-body"],
  docs: ["body", "helper", "wrapped", "cell-body"],
  app: ["body", "h5", "h6", "helper", "wrapped", "cell-body"],
};
const textSeatRoles = [
  "body",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "helper",
  "wrapped",
  "cell-body",
] as const;
type TextSeatResult = {
  role: string;
  before: number;
  adopted: number;
  baselineDelta: number;
  beforeBaseline: number | null;
  adoptedBaseline: number | null;
  buttonDelta: number | null;
};
type FieldSeatResult = {
  labelToInputTop: number;
  labelToInputBaseline: number;
  labelBaselineOffset: number;
  inputBaselineOffset: number;
  labelOccupied: number;
  inputOccupied: number;
};
type RichChoiceResult = {
  painted: number;
  occupied: number;
  marginEnd: number;
};

const TextSeatSamples = ({
  tier,
  phase,
}: {
  tier: TierName;
  phase: string;
}) => (
  <>
    <div className="bucket-samples">
      <Measured
        label="Plain Button"
        ownerSelector=".button"
        baselineSelector=".label"
        reference
      >
        <Button>Button</Button>
      </Measured>
      <Measured label="Body" ownerSelector="p">
        <p data-root-seat-role="body">Body text</p>
      </Measured>
      <Measured
        label={`Heading 5 · ${typeScale[tier].h5[0]}px`}
        ownerSelector="h5"
      >
        <h5 data-root-seat-role="h5">Heading five</h5>
      </Measured>
      <Measured
        label={`Heading 4 · ${typeScale[tier].h4[0]}px`}
        ownerSelector="h4"
        usesControlInset={false}
      >
        <h4 data-root-seat-role="h4">Heading four</h4>
      </Measured>
    </div>
    <div className="bucket-text-diagnostics">
      <figure>
        <figcaption>Heading 1 · {typeScale[tier].h1[0]}px</figcaption>
        <h1 data-root-seat-role="h1">Heading one</h1>
      </figure>
      <figure>
        <figcaption>Heading 2 · {typeScale[tier].h2[0]}px</figcaption>
        <h2 data-root-seat-role="h2">Heading two</h2>
      </figure>
      <figure>
        <figcaption>Heading 3 · {typeScale[tier].h3[0]}px</figcaption>
        <h3 data-root-seat-role="h3">Heading three</h3>
      </figure>
      <figure>
        <figcaption>Heading 6 · {typeScale[tier].h6[0]}px</figcaption>
        <h6 data-root-seat-role="h6">Heading six</h6>
      </figure>
      <figure>
        <figcaption>Shared body seat</figcaption>
        <div className="ds spacing-text-seat" data-root-seat-role="helper">
          Shared body seat
        </div>
      </figure>
      <figure>
        <figcaption>Wrapped body · first baseline</figcaption>
        <p className="bucket-wrapped-text" data-root-seat-role="wrapped">
          Wrapped body text keeps its first baseline and every subsequent line
          on the grid.
        </p>
      </figure>
      <figure>
        <figcaption>Body in a density-providing cell</figcaption>
        <table>
          <tbody>
            <tr>
              <td>
                <p data-root-seat-role="cell-body">Cell body text</p>
              </td>
            </tr>
          </tbody>
        </table>
      </figure>
      <figure className="bucket-field-fixture">
        <figcaption>Stacked field · label to input</figcaption>
        <Form onSubmit={() => undefined}>
          <TextField
            name={`${tier}-${phase}-text-seat`}
            label="Field label"
            defaultValue="Text input"
          />
        </Form>
      </figure>
      <figure className="bucket-rich-choice-fixture">
        <figcaption>Rich choice · chrome retains its own seat</figcaption>
        <RichChoices
          name={`${tier}-${phase}-rich-seat`}
          options={[{ value: "one", label: "Rich choice" }]}
          value="one"
          onChange={() => undefined}
        />
      </figure>
    </div>
  </>
);

const RootTextComparison = ({ tier }: { tier: TierName }) => {
  const root = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<{
    checks: number;
    errors: string[];
    rows: TextSeatResult[];
    fields: { before: FieldSeatResult; adopted: FieldSeatResult } | null;
    richChoices: { before: RichChoiceResult; adopted: RichChoiceResult } | null;
  } | null>(null);

  useEffect(() => {
    const local = root.current;
    if (!local) return;
    let frame = 0;
    const measure = () => {
      const before = local.querySelector<HTMLElement>(
        '[data-text-seat-phase="before"]',
      );
      const adopted = local.querySelector<HTMLElement>(
        '[data-text-seat-phase="adopted"]',
      );
      if (!before || !adopted) return;
      let checks = 0;
      const errors: string[] = [];
      const rows: TextSeatResult[] = [];
      const check = (valid: boolean, label: string) => {
        checks += 1;
        if (!valid) errors.push(label);
      };
      const equal = (actual: number, expected: number, label: string) =>
        check(
          Math.abs(actual - expected) < 0.05,
          `${label}: ${show(actual)} ≠ ${show(expected)}`,
        );
      const button = adopted.querySelector<HTMLElement>(".button");
      if (!button) return;
      const style = getComputedStyle(button);
      const rootScale =
        number(getComputedStyle(document.documentElement).fontSize) / 16;
      const inset = (tier === "site" ? 0 : 4) * rootScale;
      const unit = (tier === "site" ? 8 : 4) * rootScale;
      const expectedOneLine = (tier === "site" ? 40 : 32) * rootScale;
      equal(
        resolveLength(button, "var(--ds-spacing-control-inset)", style),
        inset,
        "tier control inset",
      );
      equal(
        resolveLength(button, "var(--ds-spacing-baseline)", style),
        unit,
        "tier baseline unit",
      );
      equal(
        button.getBoundingClientRect().height + number(style.marginBlockEnd),
        expectedOneLine,
        "reference Button occupied seat",
      );
      const buttonLabel = button.querySelector<HTMLElement>(".label");
      const buttonBaseline = buttonLabel
        ? readBrowserBaseline(
            button,
            buttonLabel,
            button.getBoundingClientRect(),
          )
        : null;
      for (const role of textSeatRoles) {
        const owner = adopted.querySelector<HTMLElement>(
          `[data-root-seat-role="${role}"]`,
        );
        const oldOwner = before.querySelector<HTMLElement>(
          `[data-root-seat-role="${role}"]`,
        );
        if (!owner || !oldOwner) {
          check(false, `${role}: missing Before/Adopted peer`);
          continue;
        }
        const oldMetrics = readMetrics(
          oldOwner,
          oldOwner,
          oldOwner,
          false,
          null,
          true,
          null,
        );
        const metrics = readMetrics(
          owner,
          owner,
          owner,
          true,
          button,
          true,
          null,
        );
        const expectedType =
          role === "helper" || role === "wrapped" || role === "cell-body"
            ? typeScale[tier].body
            : typeScale[tier][role];
        for (const [phase, measured] of [
          ["Before", oldMetrics],
          ["Adopted", metrics],
        ] as const) {
          equal(
            measured.fontSize,
            expectedType[0] * rootScale,
            `${role} ${phase} font size`,
          );
          equal(
            measured.lineHeight,
            expectedType[1] * rootScale,
            `${role} ${phase} line height`,
          );
          equal(
            measured.fontWeight,
            expectedType[2],
            `${role} ${phase} font weight`,
          );
        }
        const eligible = seatedRoles[tier].includes(role);
        const addedInset = eligible ? inset : 0;
        equal(
          metrics.paddingStart - oldMetrics.paddingStart,
          addedInset,
          `${role} start inset`,
        );
        equal(
          metrics.marginEnd - oldMetrics.marginEnd,
          addedInset,
          `${role} end inset`,
        );
        equal(
          metrics.occupied - oldMetrics.occupied,
          2 * addedInset,
          `${role} occupied change`,
        );
        equal(
          metrics.occupied / unit,
          Math.round(metrics.occupied / unit),
          `${role} grid closure`,
        );
        const baselineDelta =
          (metrics.baseline ?? Number.NaN) -
          (oldMetrics.baseline ?? Number.NaN);
        equal(baselineDelta, addedInset, `${role} first baseline change`);
        if (eligible) {
          equal(
            (metrics.baseline ?? Number.NaN) - (buttonBaseline ?? Number.NaN),
            0,
            `${role} first baseline offset vs Button`,
          );
        }
        if (["body", "helper", "cell-body"].includes(role)) {
          equal(metrics.occupied, expectedOneLine, `${role} occupied seat`);
        }
        if (role === "body" || (eligible && ["h4", "h5"].includes(role))) {
          equal(
            metrics.baselineDifference ?? Number.NaN,
            0,
            `${role} Button baseline`,
          );
        }
        if (role === "wrapped") {
          check(
            metrics.occupied > expectedOneLine,
            "wrapped: expected multiple lines",
          );
        }
        rows.push({
          role,
          before: oldMetrics.occupied,
          adopted: metrics.occupied,
          baselineDelta,
          beforeBaseline: oldMetrics.baseline,
          adoptedBaseline: metrics.baseline,
          buttonDelta: ["body", "h4", "h5"].includes(role)
            ? metrics.baselineDifference
            : null,
        });
      }
      const fieldMetrics = (phase: HTMLElement): FieldSeatResult | null => {
        const field = phase.querySelector<HTMLElement>(
          ".bucket-field-fixture .field",
        );
        const label = field?.querySelector<HTMLElement>(
          ":scope > .field-label",
        );
        const input = field?.querySelector<HTMLElement>(".input.text");
        const leaf = input?.querySelector<HTMLElement>("input");
        if (!label || !input || !leaf) return null;
        const labelRect = label.getBoundingClientRect();
        const inputRect = input.getBoundingClientRect();
        const labelBaseline = readBrowserBaseline(label, label, labelRect);
        const inputBaseline = readBrowserBaseline(input, leaf, inputRect);
        return {
          labelToInputTop: inputRect.top - labelRect.top,
          labelToInputBaseline:
            inputRect.top +
            (inputBaseline ?? Number.NaN) -
            labelRect.top -
            (labelBaseline ?? Number.NaN),
          labelBaselineOffset: labelBaseline ?? Number.NaN,
          inputBaselineOffset: inputBaseline ?? Number.NaN,
          labelOccupied:
            labelRect.height + number(getComputedStyle(label).marginBlockEnd),
          inputOccupied:
            inputRect.height + number(getComputedStyle(input).marginBlockEnd),
        };
      };
      const beforeField = fieldMetrics(before);
      const adoptedField = fieldMetrics(adopted);
      const fields =
        beforeField && adoptedField
          ? { before: beforeField, adopted: adoptedField }
          : null;
      check(fields != null, "stacked field: missing label/input specimen");
      if (fields) {
        equal(
          fields.before.labelToInputTop,
          (tier === "site" ? 48 : 28) * rootScale,
          "Before field label to input top",
        );
        equal(
          fields.adopted.labelToInputTop,
          (tier === "site" ? 48 : 36) * rootScale,
          "Adopted field label to input top",
        );
        // Flow adds the inset twice, while the label's own first baseline also
        // moves by one inset. Preserve the browser's native-input baseline
        // offset instead of assuming it equals a plain text element's offset.
        equal(
          fields.adopted.labelToInputBaseline -
            fields.before.labelToInputBaseline,
          inset,
          "field baseline separation change",
        );
        equal(
          fields.adopted.labelBaselineOffset -
            fields.before.labelBaselineOffset,
          inset,
          "field label first baseline change",
        );
        equal(
          fields.adopted.inputBaselineOffset,
          fields.before.inputBaselineOffset,
          "native input baseline offset unchanged",
        );
        equal(
          fields.adopted.labelOccupied,
          expectedOneLine,
          "Adopted field label occupied seat",
        );
        equal(
          fields.adopted.inputOccupied,
          fields.before.inputOccupied,
          "field input remains unchanged",
        );
      }
      const richChoiceMetrics = (
        phase: HTMLElement,
      ): RichChoiceResult | null => {
        const card = phase.querySelector<HTMLElement>(
          ".bucket-rich-choice-fixture .option > label",
        );
        if (!card) return null;
        const painted = card.getBoundingClientRect().height;
        const marginEnd = number(getComputedStyle(card).marginBlockEnd);
        return { painted, occupied: painted + marginEnd, marginEnd };
      };
      const beforeChoice = richChoiceMetrics(before);
      const adoptedChoice = richChoiceMetrics(adopted);
      const richChoices =
        beforeChoice && adoptedChoice
          ? { before: beforeChoice, adopted: adoptedChoice }
          : null;
      check(richChoices != null, "rich choice: missing card specimen");
      if (richChoices) {
        equal(
          richChoices.adopted.painted,
          richChoices.before.painted,
          "rich choice painted size unchanged",
        );
        equal(
          richChoices.adopted.marginEnd,
          richChoices.before.marginEnd,
          "rich choice unseated closure unchanged",
        );
        equal(
          richChoices.adopted.occupied,
          richChoices.before.occupied,
          "rich choice occupied size unchanged",
        );
        if (tier !== "site")
          equal(
            richChoices.adopted.occupied,
            40 * rootScale,
            "rich choice occupied seat",
          );
      }
      setResult({ checks, errors, rows, fields, richChoices });
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(local);
    void document.fonts.ready.then(schedule);
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [tier]);

  return (
    <div
      className="bucket-text-comparison"
      ref={root}
      data-root-text-seat={tier}
    >
      <h3>Root-size text · Before / Adopted</h3>
      <p>
        Body and root-size headings gain the tier-default inset on both metric
        edges. Larger headings keep their previous occupied size. Text in cells
        keeps the same default seat.
      </p>
      {(["before", "adopted"] as const).map((phase) => (
        <div
          key={phase}
          className="bucket-text-phase"
          data-text-seat-phase={phase}
        >
          <h4 className="bucket-text-phase-heading">
            {phase === "before" ? "Before" : "Adopted"}
          </h4>
          <TextSeatSamples tier={tier} phase={phase} />
        </div>
      ))}
      <output
        className="bucket-text-summary"
        data-root-text-seat-result={
          result ? (result.errors.length ? "error" : "pass") : "pending"
        }
        data-root-text-seat-metrics={
          result ? JSON.stringify(result) : undefined
        }
      >
        {result ? (
          <>
            {result.errors.length
              ? result.errors.join("; ")
              : `${result.checks} checks passed.`}
            {result.rows.map((row) => (
              <span key={row.role}>
                {row.role}: {show(row.before)} → {show(row.adopted)} occupied;
                first baseline offset {show(row.beforeBaseline ?? Number.NaN)} →{" "}
                {show(row.adoptedBaseline ?? Number.NaN)}
                {row.buttonDelta != null
                  ? `; adopted Δ vs Button ${show(row.buttonDelta)}`
                  : ""}
                .
              </span>
            ))}
            {result.fields && (
              <span>
                Field label → input top:{" "}
                {show(result.fields.before.labelToInputTop)} →{" "}
                {show(result.fields.adopted.labelToInputTop)}; baseline
                separation: {show(result.fields.before.labelToInputBaseline)} →{" "}
                {show(result.fields.adopted.labelToInputBaseline)}.
              </span>
            )}
            {result.richChoices && (
              <span>
                Rich choice occupied: {show(result.richChoices.before.occupied)}{" "}
                → {show(result.richChoices.adopted.occupied)}; painted:{" "}
                {show(result.richChoices.before.painted)} →{" "}
                {show(result.richChoices.adopted.painted)}.
              </span>
            )}
          </>
        ) : (
          "Awaiting fonts and text-seat measurements."
        )}
      </output>
    </div>
  );
};

const Tier = ({ tier, title }: { tier: TierName; title: string }) => (
  <section className={`bucket-tier ${tier}`} data-tier={tier}>
    <header>
      <h2>{title}</h2>
      <p>
        Grid unit: <span className="tier-unit" />
      </p>
    </header>
    <RootTextComparison tier={tier} />
    <div className="bucket-body-flow">
      <Measured label="Body flow" ownerSelector="p.ds" flow>
        <p className="ds">Body paragraph</p>
        <span className="bucket-following-flow-marker" aria-hidden="true" />
      </Measured>
    </div>
    <div className="bucket-samples">
      <Measured
        label="Button"
        ownerSelector=".button"
        baselineSelector=".label"
        reference
      >
        <Button>Button</Button>
      </Measured>
      <Measured label="Body paragraph" ownerSelector="p.ds">
        <p className="ds">Body text</p>
      </Measured>
      <Measured
        label="Button + icon"
        ownerSelector=".button"
        baselineSelector=".label"
      >
        <Button icon="edit">Edit</Button>
      </Measured>
      <Measured
        label="Icon-only"
        ownerSelector=".button"
        hasTextBaseline={false}
      >
        <Button icon="edit" aria-label="Edit" />
      </Measured>
      <Measured
        label="Dismissible Chip"
        ownerSelector=".chip"
        baselineSelector=".value"
      >
        <Chip value="Dismiss" onDismiss={() => undefined} />
      </Measured>
      <Measured
        label="Clickable Chip"
        ownerSelector=".chip"
        baselineSelector=".value"
      >
        <Chip value="Download" onClick={() => undefined} />
      </Measured>
      <Measured
        label="Text"
        ownerSelector=".input.text"
        baselineSelector="input"
      >
        <TextInput name={`${tier}-text`} defaultValue="Text input" />
      </Measured>
      <Measured
        label="Number"
        ownerSelector=".input.number"
        baselineSelector="input"
      >
        <NumberInput name={`${tier}-number`} defaultValue={42} suffix="kg" />
      </Measured>
      <Measured
        label="Password"
        ownerSelector=".input.password"
        baselineSelector="input"
      >
        <PasswordInput name={`${tier}-password`} defaultValue="secret" />
      </Measured>
      <Measured
        label="Phone"
        ownerSelector=".input.phone"
        baselineSelector=".number-input"
      >
        <PhoneInput
          name={`${tier}-phone`}
          value="+12025550123"
          onChange={() => undefined}
        />
      </Measured>
      <Measured label="Date" ownerSelector=".input.date">
        <DateInput name={`${tier}-date`} defaultValue="2026-10-10" />
      </Measured>
      <Measured label="Time" ownerSelector=".input.time">
        <TimeInput name={`${tier}-time`} defaultValue="10:30" />
      </Measured>
      <Measured label="Date/time" ownerSelector=".input.datetime">
        <DateTimeInput
          name={`${tier}-datetime`}
          defaultValue="2026-10-10T10:30"
        />
      </Measured>
      <Measured
        label="Combobox"
        ownerSelector=".input.combobox-input"
        baselineSelector="input"
      >
        <ComboboxInput
          value="one"
          onChange={() => undefined}
          options={[
            { label: "Option one", value: "one" },
            { label: "Option two", value: "two" },
          ]}
        />
      </Measured>
      <Measured label="Select" ownerSelector=".input.select">
        <SelectInput
          name={`${tier}-select`}
          defaultValue="one"
          options={[
            { label: "Option one", value: "one" },
            { label: "Option two", value: "two" },
          ]}
        />
      </Measured>
      <Measured
        label="Color trigger"
        ownerSelector=".color-trigger"
        baselineSelector=".color-value"
      >
        <ColorInput value="#3b82f6" onChange={() => undefined} />
      </Measured>
      <Measured
        label="Inline color"
        ownerSelector=".color-inline-seat"
        baselineSelector=".hex-input"
      >
        <ColorInput value="#3b82f6" swatches={[]} onChange={() => undefined} />
      </Measured>
      <Measured
        label="Tabs"
        ownerSelector=".tabs"
        seatSelector=".tabs-link"
        baselineSelector=".tabs-link"
        naturalVisibleSelector=".tabs-list"
      >
        <Tabs
          aria-label={`${title} sections`}
          navigationRoot={tabsRoot}
          currentUrl="#/overview"
        />
      </Measured>
      <Measured
        label="Tabs fallback"
        ownerSelector=".tabs"
        seatSelector=".tabs-link"
        baselineSelector=".tabs-link"
        naturalVisibleSelector=".tabs-list"
      >
        <Tabs
          className="spacing-control-force-fallback"
          aria-label={`${title} sections, forced fallback`}
          navigationRoot={tabsRoot}
          currentUrl="#/overview"
        />
      </Measured>
      <Measured
        label="Menu item"
        ownerSelector=".spacing-preview-menu-surface"
        seatSelector=".contextual-menu-item"
        baselineSelector=".contextual-menu-item .label"
        naturalVisibleSelector=".contextual-menu-item"
      >
        <MenuItemFixture tier={tier} />
      </Measured>
    </div>
  </section>
);

export const SiteDocsApp: Story = {
  render: () => (
    <main className="spacing-control-block">
      <h1>01 Control block</h1>
      <p className="bucket-legend">
        <span className="bucket-legend-edge" /> block start / occupied end
        <span className="bucket-legend-baseline" /> browser text baseline
        <span className="bucket-legend-following" /> following flow start
      </p>
      <p>No shipped Pragma equivalents: SegmentedControl and Pagination.</p>
      <Tier tier="site" title="Site" />
      <Tier tier="docs" title="Docs" />
      <Tier tier="app" title="App" />
    </main>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(
      () => {
        const proofs = canvasElement.querySelectorAll<HTMLElement>(
          "[data-root-text-seat-result]",
        );
        expect(proofs).toHaveLength(3);
        for (const proof of proofs) {
          expect(
            proof.dataset.rootTextSeatResult,
            proof.textContent ?? "Root text seat measurements are pending",
          ).toBe("pass");
        }
      },
      { timeout: 10000 },
    );
  },
};
