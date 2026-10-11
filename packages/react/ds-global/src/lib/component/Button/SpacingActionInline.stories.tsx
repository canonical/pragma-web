import type { Meta, StoryObj } from "@storybook/react-vite";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Chip } from "../Chip/index.js";
import { ContextualMenuItem } from "../ContextualMenu/index.js";
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
  baseline: number | null;
  guideLeft: number;
  guideTop: number;
  guideWidth: number;
  occupiedEnd: number;
  sharedLeft: number | null;
  sharedWidth: number | null;
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
  probe.className = "action-length-probe";
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

const readBrowserBaseline = (
  owner: HTMLElement,
  baselineOwner: HTMLElement,
  guideRect: DOMRect,
): number | null => {
  const style = getComputedStyle(baselineOwner);
  const needsTextFlowClone = /flex|grid/.test(style.display);
  if (
    !baselineOwner.matches("input, select, textarea") &&
    !needsTextFlowClone
  ) {
    const before = owner.getBoundingClientRect();
    const marker = document.createElement("span");
    marker.className = "action-baseline-marker";
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
  rig.className = "action-baseline-rig";
  const clone = baselineOwner.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("[id]").forEach((element) =>
    element.removeAttribute("id"),
  );
  clone.removeAttribute("id");
  for (const property of style) {
    clone.style.setProperty(property, style.getPropertyValue(property));
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
  marker.className = "action-baseline-marker";
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
  label: HTMLElement,
  icon: HTMLElement | null,
  hasTextBaseline: boolean,
  seat: HTMLElement,
  guide: HTMLElement,
): Metrics => {
  const style = getComputedStyle(seat);
  const ownerRect = owner.getBoundingClientRect();
  const guideRect = guide.getBoundingClientRect();
  const labelText = [...label.childNodes].find(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
  );
  const labelRange = labelText ? document.createRange() : null;
  labelRange?.selectNodeContents(labelText as Node);
  const labelRect =
    labelRange?.getBoundingClientRect() ?? label.getBoundingClientRect();
  const iconRect = icon?.getBoundingClientRect();
  const marginEnd = number(style.marginBlockEnd);

  return {
    paddingStart: number(style.paddingInlineStart),
    paddingEnd: number(style.paddingInlineEnd),
    action: resolveLength(owner, "var(--ds-spacing-action)", style),
    labelStart: labelRect.left - guideRect.left,
    labelEnd: guideRect.right - labelRect.right,
    iconBox: iconRect?.width ?? null,
    iconGap: iconRect ? labelRect.left - iconRect.right : null,
    baseline: hasTextBaseline
      ? readBrowserBaseline(owner, label, guideRect)
      : null,
    guideLeft: guideRect.left,
    guideTop: guideRect.top,
    guideWidth: guideRect.width,
    occupiedEnd: ownerRect.bottom + marginEnd - guideRect.top,
    sharedLeft: null,
    sharedWidth: null,
  };
};

const MetricsOutput = ({ metrics }: { metrics: Metrics | null }) => (
  <output
    className="action-metrics"
    data-metrics={metrics ? JSON.stringify(metrics) : undefined}
    hidden
  >
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
  labelSelector,
  iconSelector,
  reference = false,
  hasTextBaseline = true,
  seatSelector,
  guideSelector,
}: {
  label: string;
  children: React.ReactNode;
  ownerSelector: string;
  labelSelector?: string;
  iconSelector?: string;
  reference?: boolean;
  hasTextBaseline?: boolean;
  seatSelector?: string;
  guideSelector?: string;
}) => {
  const root = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const owner = root.current?.querySelector(ownerSelector) as HTMLElement | null;
      const labelOwner = labelSelector
        ? owner?.querySelector<HTMLElement>(labelSelector)
        : owner;
      const iconOwner = iconSelector
        ? owner?.querySelector<HTMLElement>(iconSelector)
        : null;
      const seatOwner = seatSelector
        ? owner?.querySelector<HTMLElement>(seatSelector)
        : owner;
      const guideOwner = guideSelector
        ? owner?.querySelector<HTMLElement>(guideSelector)
        : owner;
      const ownerStyle = owner ? getComputedStyle(owner) : null;
      if (
        owner &&
        labelOwner &&
        seatOwner &&
        guideOwner &&
        ownerStyle?.display !== "none" &&
        ownerStyle?.visibility !== "hidden"
      ) {
        const nextMetrics = readMetrics(
          owner,
          labelOwner,
          iconOwner ?? null,
          hasTextBaseline,
          seatOwner,
          guideOwner,
        );
        if (root.current) {
          const localRect = root.current.getBoundingClientRect();
          nextMetrics.guideLeft -= localRect.left;
          nextMetrics.guideTop -= localRect.top;
          if (reference) {
            const row = root.current.closest<HTMLElement>(".action-samples");
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
    const isGeneratedNode = (node: Node): boolean =>
      node instanceof Element &&
      (node.matches(
        ".action-length-probe, .action-baseline-rig, .action-baseline-marker, .action-guide, .action-shared-guides, .action-metrics",
      ) ||
        Boolean(
          node.closest(
            ".action-length-probe, .action-baseline-rig, .action-baseline-marker, .action-guide, .action-shared-guides, .action-metrics",
          ),
        ));
    const observer = new MutationObserver((records) => {
      const hasRelevantMutation = records.some((record) => {
        if (isGeneratedNode(record.target)) return false;
        if (record.type !== "childList") return true;
        return [...record.addedNodes, ...record.removedNodes].some(
          (node) => !isGeneratedNode(node),
        );
      });
      if (hasRelevantMutation) schedule();
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["aria-hidden", "class", "style"],
      childList: true,
      subtree: true,
    });
    void document.fonts.ready.then(schedule);
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
    hasTextBaseline,
    iconSelector,
    labelSelector,
    ownerSelector,
    reference,
    seatSelector,
    guideSelector,
  ]);

  return (
    <figure className="action-sample">
      <figcaption>{label}</figcaption>
      <div
        className="action-measure"
        ref={root}
        data-action-reference={reference || undefined}
      >
        {children}
        {metrics ? (
          <span
            aria-hidden="true"
            className="action-guide"
            style={
              {
                "--action-guide-left": `${metrics.guideLeft}px`,
                "--action-guide-top": `${metrics.guideTop}px`,
                "--action-guide-width": `${metrics.guideWidth}px`,
                "--action-guide-baseline": `${metrics.baseline ?? 0}px`,
                "--action-guide-end": `${metrics.occupiedEnd}px`,
              } as React.CSSProperties
            }
          >
            <span className="action-guide-top" />
            {metrics.baseline == null ? null : (
              <span className="action-guide-baseline" />
            )}
            <span className="action-guide-end" />
          </span>
        ) : null}
        {reference && metrics?.sharedWidth != null ? (
          <span
            aria-hidden="true"
            className="action-shared-guides"
            style={
              {
                "--action-shared-left": `${metrics.sharedLeft}px`,
                "--action-shared-width": `${metrics.sharedWidth}px`,
                "--action-shared-top": `${metrics.guideTop}px`,
                "--action-shared-baseline": `${metrics.guideTop + (metrics.baseline ?? 0)}px`,
                "--action-shared-end": `${metrics.guideTop + metrics.occupiedEnd}px`,
              } as React.CSSProperties
            }
          >
            <span className="action-shared-top" />
            <span className="action-shared-baseline" />
            <span className="action-shared-end" />
          </span>
        ) : null}
      </div>
      <MetricsOutput metrics={metrics} />
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

const MenuItemFixture = ({ tier }: { tier: string }) => {
  const item = {
    key: `${tier}-action-menu-item`,
    label: "Open details",
    url: "#open",
  } as React.ComponentProps<typeof ContextualMenuItem>["item"];
  return (
    <div
      className="ds contextual-menu__surface spacing-control-group action-preview-menu-surface"
      role="menu"
      aria-label={`${tier} menu item specimen`}
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
  <section className={`action-tier ${tier}`}>
    <header>
      <h2>{title}</h2>
      <span>reference first</span>
    </header>
    <div className="action-samples">
      <Measured
        label="Button"
        ownerSelector=".button"
        labelSelector=".label"
        reference
      >
        <Button>Button</Button>
      </Measured>
      <Measured
        label="Icon-only"
        ownerSelector=".button"
        hasTextBaseline={false}
      >
        <Button icon="edit" aria-label="Edit" />
      </Measured>
      <Measured
        label="Button + icon"
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
        label="Dismissible Chip"
        ownerSelector=".chip"
        labelSelector=".value"
      >
        <Chip value="Dismiss" onDismiss={() => undefined} />
      </Measured>
      <Measured
        label="Active"
        ownerSelector=".tabs"
        labelSelector=".tabs-item[data-active] .tabs-link"
        seatSelector=".tabs-item[data-active] .tabs-link"
        guideSelector=".tabs-item[data-active] .tabs-link"
      >
        <Tabs
          aria-label={`${title} active tab`}
          navigationRoot={tabsRoot}
          currentUrl="#/overview"
        />
      </Measured>
      <Measured
        label="Inactive"
        ownerSelector=".tabs"
        labelSelector=".tabs-item:not([data-active]) .tabs-link"
        seatSelector=".tabs-item:not([data-active]) .tabs-link"
        guideSelector=".tabs-item:not([data-active]) .tabs-link"
      >
        <Tabs
          aria-label={`${title} inactive tab`}
          navigationRoot={tabsRoot}
          currentUrl="#/overview"
        />
      </Measured>
      <Measured
        label="Menu item"
        ownerSelector=".action-preview-menu-surface"
        labelSelector=".contextual-menu-item .label"
        seatSelector=".contextual-menu-item"
        guideSelector=".contextual-menu-item"
      >
        <MenuItemFixture tier={tier} />
      </Measured>
    </div>
  </section>
);

export const SiteDocsApp: Story = {
  render: () => (
    <main className="spacing-action-inline">
      <h1>02 Action inline</h1>
      <p className="action-legend">
        <span className="action-legend-edge" /> block start / occupied end
        <span className="action-legend-baseline" /> browser text baseline
      </p>
      <p>No shipped Pragma horizontal top-navigation equivalent.</p>
      <Tier tier="site" title="Site" />
      <Tier tier="docs" title="Docs" />
      <Tier tier="app" title="App" />
    </main>
  ),
};
