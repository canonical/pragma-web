import {
  Button,
  Chip,
  ContextualMenuItem,
  Tabs,
} from "@canonical/react-ds-global";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type React from "react";
import { useEffect, useRef, useState } from "react";
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
import "./SpacingControlBlock.css";

const meta = {
  title: "Spacing buckets/01 Control block",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Metrics = {
  fontSize: number;
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
    baselineOwner.append(marker);
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
  clone.querySelectorAll("[id]").forEach((element) =>
    element.removeAttribute("id"),
  );
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
  const borderValues = [
    style.borderBlockStartWidth,
    style.borderInlineEndWidth,
    style.borderBlockEndWidth,
    style.borderInlineStartWidth,
  ];

  return {
    fontSize,
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
            ?.closest(".bucket-tier")
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

const Tier = ({
  tier,
  title,
}: {
  tier: "site" | "docs" | "app";
  title: string;
}) => (
  <section className={`bucket-tier ${tier}`} data-tier={tier}>
    <header>
      <h2>{title}</h2>
      <p>
        Grid unit: <span className="tier-unit" />
      </p>
    </header>
    <div className="bucket-body-flow">
      <Measured
        label="Body flow"
        ownerSelector="p.ds"
        usesControlInset={false}
        flow
      >
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
      <Measured
        label="Date/time"
        ownerSelector=".input.datetime"
      >
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
};
