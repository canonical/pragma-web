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
  capModelBaseline: number;
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
  const capModelBaseline =
    baselineRect.top -
    ownerRect.top +
    number(baselineStyle.borderBlockStartWidth) +
    number(baselineStyle.paddingBlockStart) +
    naturalBaseline;
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
        layout borders {metrics.borders}
        <br />
        cap-model baseline offset {show(metrics.capModelBaseline)}
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
}: {
  label: string;
  children: React.ReactNode;
  ownerSelector: string;
  baselineSelector?: string;
  seatSelector?: string;
  globalOwnerSelector?: string;
  usesControlInset?: boolean;
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
      const ownerStyle = owner ? getComputedStyle(owner) : null;
      const ownerIsVisible =
        ownerStyle?.display !== "none" && ownerStyle?.visibility !== "hidden";
      if (owner && baselineOwner && seatOwner && ownerIsVisible) {
        observer?.disconnect();
        setMetrics(
          readMetrics(owner, baselineOwner, seatOwner, usesControlInset),
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
    globalOwnerSelector,
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
        style={
          {
            "--bucket-first-baseline":
              metrics && !globalOwnerSelector
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
      <Measured label="Plain Button" ownerSelector=".button">
        <Button>Button</Button>
      </Measured>
      <Measured label="Leading-icon Button" ownerSelector=".button">
        <Button icon="edit">Edit</Button>
      </Measured>
      <Measured label="Icon-only Button" ownerSelector=".button">
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
      >
        <TextInput name={`${tier}-text`} defaultValue="Text input" />
      </Measured>
      <Measured
        label="NumberInput wrapper / leaf"
        ownerSelector=".input.number"
        baselineSelector="input"
      >
        <NumberInput name={`${tier}-number`} defaultValue={42} suffix="kg" />
      </Measured>
      <Measured
        label="PasswordInput wrapper / leaf"
        ownerSelector=".input.password"
        baselineSelector="input"
      >
        <PasswordInput name={`${tier}-password`} defaultValue="secret" />
      </Measured>
      <Measured
        label="PhoneInput wrapper / number leaf"
        ownerSelector=".input.phone"
        baselineSelector=".number-input"
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
      >
        <Tabs
          aria-label={`${title} sections`}
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
