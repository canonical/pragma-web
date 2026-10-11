import type { Meta, StoryObj } from "@storybook/react-vite";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Chip } from "../Chip/index.js";
import { ContextualMenu } from "../ContextualMenu/index.js";
import { Tabs } from "../Tabs/index.js";
import { Button } from "./index.js";
import "./SpacingActionInline.css";

const meta = {
  title: "Spacing buckets/02 Action inline",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Metrics = {
  paddingStart: number;
  paddingEnd: number;
  action: number;
  labelStart: number;
  labelEnd: number;
  iconBox: number | null;
  iconGap: number | null;
  baseline: number;
};

const number = (value: string): number => Number.parseFloat(value) || 0;
const show = (value: number): string => `${value.toFixed(2)}px`;

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
  label: HTMLElement,
  icon: HTMLElement | null,
): Metrics => {
  const style = getComputedStyle(owner);
  const labelStyle = getComputedStyle(label);
  const ownerRect = owner.getBoundingClientRect();
  const labelText = [...label.childNodes].find(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
  );
  const labelRange = labelText ? document.createRange() : null;
  labelRange?.selectNodeContents(labelText as Node);
  const labelRect =
    labelRange?.getBoundingClientRect() ?? label.getBoundingClientRect();
  const iconRect = icon?.getBoundingClientRect();
  const lineHeight = number(labelStyle.lineHeight);
  const cap = resolveLength(owner, "1cap", labelStyle);

  return {
    paddingStart: number(style.paddingInlineStart),
    paddingEnd: number(style.paddingInlineEnd),
    action: resolveLength(owner, "var(--ds-spacing-action)", style),
    labelStart: labelRect.left - ownerRect.left,
    labelEnd: ownerRect.right - labelRect.right,
    iconBox: iconRect?.width ?? null,
    iconGap: iconRect ? labelRect.left - iconRect.right : null,
    baseline: labelRect.top - ownerRect.top + (lineHeight + cap) / 2,
  };
};

const MetricsOutput = ({
  metrics,
  portal,
}: {
  metrics: Metrics | null;
  portal: boolean;
}) => (
  <output className="action-metrics">
    {metrics ? (
      <>
        pads {show(metrics.paddingStart)} / {show(metrics.paddingEnd)}
        <br />
        action role {show(metrics.action)}
        <br />
        label start/end {show(metrics.labelStart)} / {show(metrics.labelEnd)}
        <br />
        icon box/gap{" "}
        {metrics.iconBox == null
          ? "not present"
          : `${show(metrics.iconBox)} / ${show(metrics.iconGap ?? 0)}`}
        {portal ? (
          <>
            <br />
            portal tier measurement
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
  labelSelector,
  iconSelector,
  globalOwnerSelector,
}: {
  label: string;
  children: React.ReactNode;
  ownerSelector: string;
  labelSelector?: string;
  iconSelector?: string;
  globalOwnerSelector?: string;
}) => {
  const root = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const owner = (
        globalOwnerSelector
          ? document.querySelector(globalOwnerSelector)
          : root.current?.querySelector(ownerSelector)
      ) as HTMLElement | null;
      const labelOwner = labelSelector
        ? owner?.querySelector<HTMLElement>(labelSelector)
        : owner;
      const iconOwner = iconSelector
        ? owner?.querySelector<HTMLElement>(iconSelector)
        : null;
      const ownerStyle = owner ? getComputedStyle(owner) : null;
      if (
        owner &&
        labelOwner &&
        ownerStyle?.display !== "none" &&
        ownerStyle?.visibility !== "hidden"
      ) {
        setMetrics(readMetrics(owner, labelOwner, iconOwner ?? null));
      } else if (globalOwnerSelector) {
        setMetrics(null);
      }
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => requestAnimationFrame(update));
    };
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["aria-hidden", "class", "style"],
      childList: true,
      subtree: Boolean(globalOwnerSelector),
    });
    void document.fonts.ready.then(schedule);
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [globalOwnerSelector, iconSelector, labelSelector, ownerSelector]);

  return (
    <figure className="action-sample">
      <figcaption>{label}</figcaption>
      <div
        className={`action-measure${globalOwnerSelector ? " action-measure--portal" : ""}`}
        ref={root}
        style={
          {
            "--action-baseline": metrics ? `${metrics.baseline}px` : undefined,
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
  key: "action-spacing-tabs",
  label: "Action spacing tabs",
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
      maxWidth="14rem"
      items={[
        {
          key: `${tier}-open`,
          label: "Open details",
          url: "#open",
          className: `measure-action-menu-${tier}`,
        },
        { key: `${tier}-copy`, label: "Copy link", url: "#copy" },
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
  <section className={`action-tier ${tier}`}>
    <header>
      <h2>{title}</h2>
      <span>reference first</span>
    </header>
    <div className="action-samples">
      <Measured
        label="Plain Button — reference"
        ownerSelector=".button"
        labelSelector=".label"
      >
        <Button>Button</Button>
      </Measured>
      <Measured
        label="Leading-icon Button"
        ownerSelector=".button"
        labelSelector=".label"
        iconSelector=".icon"
      >
        <Button icon="edit">Edit</Button>
      </Measured>
      <Measured
        label="Clickable Chip"
        ownerSelector=".chip"
        labelSelector=".value"
      >
        <Chip value="Download" onClick={() => undefined} />
      </Measured>
      <Measured
        label="Static dismissible Chip"
        ownerSelector=".chip"
        labelSelector=".value"
      >
        <Chip value="Dismiss" onDismiss={() => undefined} />
      </Measured>
      <Measured
        label="Active Tab"
        ownerSelector=".tabs-item[data-active] .tabs-link"
      >
        <Tabs
          aria-label={`${title} active tab`}
          navigationRoot={tabsRoot}
          currentUrl="#/overview"
        />
      </Measured>
      <Measured
        label="Inactive Tab"
        ownerSelector=".tabs-item:not([data-active]) .tabs-link"
      >
        <Tabs
          aria-label={`${title} inactive tab`}
          navigationRoot={tabsRoot}
          currentUrl="#/overview"
        />
      </Measured>
      <Measured
        label="ContextualMenu portal item"
        ownerSelector=".contextual-menu"
        labelSelector=".label"
        globalOwnerSelector={`.contextual-menu__surface.${tier}:not(.submenu) .measure-action-menu-${tier}`}
      >
        <TierMenu tier={tier} />
      </Measured>
    </div>
  </section>
);

export const SiteDocsApp: Story = {
  render: () => (
    <main className="spacing-action-inline">
      <h1>02 Action inline</h1>
      <p>
        Each blue guide is a local cap-model estimate. Outlines show the
        measured action box; captions and metrics sit outside it.
      </p>
      <p>No shipped Pragma horizontal top-navigation equivalent.</p>
      <Tier tier="site" title="Site" />
      <Tier tier="docs" title="Docs" />
      <Tier tier="app" title="App" />
    </main>
  ),
};
