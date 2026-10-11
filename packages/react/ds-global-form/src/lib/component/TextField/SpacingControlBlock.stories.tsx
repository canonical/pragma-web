import { Button, Chip, ContextualMenu, Tabs } from "@canonical/react-ds-global";
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
  capModelBaseline: number | null;
  blockStartDifference: number | null;
  naturalVisible: number | null;
  setClosure: number | null;
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

const readMetrics = (
  owner: HTMLElement,
  baselineOwner: HTMLElement,
  seatOwner: HTMLElement,
  usesControlInset: boolean,
  referenceOwner: HTMLElement | null,
  hasTextBaseline: boolean,
  centersLineBox: boolean,
  naturalVisibleOwner: HTMLElement | null,
): Metrics => {
  const ownerStyle = getComputedStyle(owner);
  const style = getComputedStyle(seatOwner);
  const baselineStyle = getComputedStyle(baselineOwner);
  const ownerRect = owner.getBoundingClientRect();
  const baselineRect = baselineOwner.getBoundingClientRect();
  const fontSize = number(baselineStyle.fontSize);
  const lineHeight = number(baselineStyle.lineHeight);
  const cap = resolveLength(owner, "1cap", baselineStyle);
  const unit = resolveLength(owner, "var(--ds-spacing-baseline)", style);
  const inset = usesControlInset
    ? resolveLength(owner, "var(--ds-spacing-control-inset, 0px)", style)
    : 0;
  const naturalBaseline = (lineHeight + cap) / 2;
  const unquantizedNudge =
    Math.ceil((naturalBaseline - 1e-7) / unit) * unit - naturalBaseline;
  const nudge = Math.round(unquantizedNudge * 64) / 64;
  const paddingStart = number(style.paddingBlockStart);
  const paddingEnd = number(style.paddingBlockEnd);
  const marginEnd = number(style.marginBlockEnd);
  const ownerMarginEnd = number(ownerStyle.marginBlockEnd);
  const borderStart = number(baselineStyle.borderBlockStartWidth);
  const borderEnd = number(baselineStyle.borderBlockEndWidth);
  const baselinePaddingStart = number(baselineStyle.paddingBlockStart);
  const baselinePaddingEnd = number(baselineStyle.paddingBlockEnd);
  const lineBoxOffset = centersLineBox
    ? Math.max(
        0,
        (baselineRect.height -
          borderStart -
          borderEnd -
          baselinePaddingStart -
          baselinePaddingEnd -
          lineHeight) /
          2,
      )
    : 0;
  const capModelBaseline = hasTextBaseline
    ? baselineRect.top -
      ownerRect.top +
      borderStart +
      baselinePaddingStart +
      lineBoxOffset +
      naturalBaseline
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
    capModelBaseline,
    blockStartDifference: referenceOwner
      ? ownerRect.top - referenceOwner.getBoundingClientRect().top
      : null,
    naturalVisible: naturalVisibleOwner
      ? naturalVisibleOwner.getBoundingClientRect().height
      : null,
    setClosure: naturalVisibleOwner ? ownerRect.height + ownerMarginEnd : null,
  };
};

const MetricsOutput = ({
  metrics,
  portal,
}: {
  metrics: Metrics | null;
  portal: boolean;
}) => (
  <output className="bucket-metrics">
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
        {metrics.blockStartDifference != null && !portal ? (
          <>
            block-start vs Plain Button {show(metrics.blockStartDifference)}
            <br />
          </>
        ) : null}
        layout borders {metrics.borders}
        <br />
        {metrics.capModelBaseline == null
          ? "no text baseline"
          : `cap-model baseline offset ${show(metrics.capModelBaseline)}`}
        {portal ? (
          <>
            <br />
            portal tier measurement; outside shared row
          </>
        ) : null}
      </>
    ) : portal ? (
      "open Actions to measure"
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
  globalOwnerSelector,
  usesControlInset = true,
  reference = false,
  hasTextBaseline = true,
  centersLineBox = false,
  naturalVisibleSelector,
}: {
  label: string;
  children: React.ReactNode;
  ownerSelector: string;
  baselineSelector?: string;
  seatSelector?: string;
  globalOwnerSelector?: string;
  usesControlInset?: boolean;
  reference?: boolean;
  hasTextBaseline?: boolean;
  centersLineBox?: boolean;
  naturalVisibleSelector?: string;
}) => {
  const root = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    let frame = 0;
    let observer: MutationObserver | undefined;
    const update = () => {
      const local = root.current;
      const owner = (
        globalOwnerSelector
          ? document.querySelector(globalOwnerSelector)
          : local?.querySelector(ownerSelector)
      ) as HTMLElement | null;
      const baselineOwner = (
        baselineSelector ? owner?.querySelector(baselineSelector) : owner
      ) as HTMLElement | null;
      const seatOwner = (
        seatSelector ? owner?.querySelector(seatSelector) : owner
      ) as HTMLElement | null;
      const referenceOwner = local
        ?.closest(".bucket-tier")
        ?.querySelector<HTMLElement>("[data-bucket-reference] .button");
      const naturalVisibleOwner = naturalVisibleSelector
        ? (owner?.querySelector(naturalVisibleSelector) as HTMLElement | null)
        : null;
      const ownerStyle = owner ? getComputedStyle(owner) : null;
      const ownerIsVisible =
        ownerStyle?.display !== "none" && ownerStyle?.visibility !== "hidden";
      if (owner && baselineOwner && seatOwner && ownerIsVisible) {
        observer?.disconnect();
        setMetrics(
          readMetrics(
            owner,
            baselineOwner,
            seatOwner,
            usesControlInset,
            referenceOwner ?? null,
            hasTextBaseline,
            centersLineBox,
            naturalVisibleOwner,
          ),
        );
      }
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => requestAnimationFrame(update));
    };
    void document.fonts.ready.then(schedule);
    observer = new MutationObserver(schedule);
    observer.observe(
      document.body,
      globalOwnerSelector
        ? {
            attributes: true,
            attributeFilter: ["aria-hidden", "class", "style"],
            childList: true,
            subtree: true,
          }
        : { childList: true, subtree: true },
    );
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [
    baselineSelector,
    centersLineBox,
    globalOwnerSelector,
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
        className={`bucket-measure${globalOwnerSelector ? " bucket-measure--portal" : ""}`}
        ref={root}
        data-bucket-reference={reference || undefined}
        style={
          {
            "--bucket-first-baseline":
              metrics &&
              metrics.capModelBaseline != null &&
              !globalOwnerSelector
                ? `${metrics.capModelBaseline}px`
                : undefined,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
      <MetricsOutput metrics={metrics} portal={Boolean(globalOwnerSelector)} />
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

const TierMenu = ({ tier }: { tier: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <ContextualMenu
      label={`${tier} actions`}
      open={open}
      onOpenChange={setOpen}
      preferredDirections={[{ side: "block-end", align: "start" }]}
      maxWidth="16rem"
      items={[
        {
          key: `${tier}-open`,
          label: "Open details",
          url: "#open",
          className: `measure-menu-${tier}`,
        },
        { type: "separator", key: `${tier}-separator` },
        {
          key: `${tier}-more`,
          label: "More actions with a wrapping label",
          items: [
            { key: `${tier}-edit`, label: "Edit", url: "#edit" },
            { key: `${tier}-copy`, label: "Copy link", url: "#copy" },
          ],
        },
      ]}
    >
      Actions
    </ContextualMenu>
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
    <div className="bucket-samples">
      <Measured
        label="Body paragraph"
        ownerSelector="p.ds"
        usesControlInset={false}
      >
        <p className="ds">Body paragraph</p>
      </Measured>
      <Measured label="Plain Button" ownerSelector=".button" reference>
        <Button>Button</Button>
      </Measured>
      <Measured label="Leading-icon Button" ownerSelector=".button">
        <Button icon="edit">Edit</Button>
      </Measured>
      <Measured
        label="Icon-only Button"
        ownerSelector=".button"
        hasTextBaseline={false}
      >
        <Button icon="edit" aria-label="Edit" />
      </Measured>
      <Measured label="Static dismissible Chip" ownerSelector=".chip">
        <Chip value="Dismiss" onDismiss={() => undefined} />
      </Measured>
      <Measured label="Clickable Chip" ownerSelector=".chip">
        <Chip value="Download" onClick={() => undefined} />
      </Measured>
      <Measured
        label="TextInput wrapper / leaf"
        ownerSelector=".input.text"
        baselineSelector="input"
        centersLineBox
      >
        <TextInput name={`${tier}-text`} defaultValue="Text input" />
      </Measured>
      <Measured
        label="NumberInput wrapper / leaf"
        ownerSelector=".input.number"
        baselineSelector="input"
        centersLineBox
      >
        <NumberInput name={`${tier}-number`} defaultValue={42} suffix="kg" />
      </Measured>
      <Measured
        label="PasswordInput wrapper / leaf"
        ownerSelector=".input.password"
        baselineSelector="input"
        centersLineBox
      >
        <PasswordInput name={`${tier}-password`} defaultValue="secret" />
      </Measured>
      <Measured
        label="PhoneInput wrapper / number leaf"
        ownerSelector=".input.phone"
        baselineSelector=".number-input"
        centersLineBox
      >
        <PhoneInput
          name={`${tier}-phone`}
          value="+12025550123"
          onChange={() => undefined}
        />
      </Measured>
      <Measured label="DateInput native leaf" ownerSelector=".input.date">
        <DateInput name={`${tier}-date`} defaultValue="2026-10-10" />
      </Measured>
      <Measured label="TimeInput native leaf" ownerSelector=".input.time">
        <TimeInput name={`${tier}-time`} defaultValue="10:30" />
      </Measured>
      <Measured
        label="DateTimeInput native leaf"
        ownerSelector=".input.datetime"
      >
        <DateTimeInput
          name={`${tier}-datetime`}
          defaultValue="2026-10-10T10:30"
        />
      </Measured>
      <Measured
        label="ComboboxInput inner chrome"
        ownerSelector=".input.combobox-input"
        baselineSelector="input"
        centersLineBox
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
      <Measured label="SelectInput" ownerSelector=".input.select">
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
        label="ColorInput trigger chrome"
        ownerSelector=".color-trigger"
        baselineSelector=".color-value"
      >
        <ColorInput value="#3b82f6" onChange={() => undefined} />
      </Measured>
      <Measured
        label="ColorInput inline hex chrome"
        ownerSelector=".color-inline-seat"
        baselineSelector=".hex-input"
      >
        <ColorInput value="#3b82f6" swatches={[]} onChange={() => undefined} />
      </Measured>
      <Measured
        label="Tabs strip / item row"
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
        label="Tabs forced fallback"
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
        label="ContextualMenu portal / item rows"
        ownerSelector=".contextual-menu"
        globalOwnerSelector={`.contextual-menu__surface.${tier}:not(.submenu)`}
        seatSelector={`.measure-menu-${tier}`}
        baselineSelector={`.measure-menu-${tier} .label`}
      >
        <TierMenu tier={tier} />
      </Measured>
    </div>
  </section>
);

export const SiteDocsApp: Story = {
  render: () => (
    <main className="spacing-control-block">
      <h1>01 Control block</h1>
      <p>
        Captions and metrics sit outside the measured rows. The row uses first
        baseline alignment. Each blue guide marks the local cap-model estimate,
        reported separately from CSS row alignment.
      </p>
      <p>No shipped Pragma equivalents: SegmentedControl and Pagination.</p>
      <Tier tier="site" title="Site" />
      <Tier tier="docs" title="Docs" />
      <Tier tier="app" title="App" />
    </main>
  ),
};
