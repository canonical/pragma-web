import { SideNavigation } from "@canonical/react-ds-app";
import { Accordion, Button, Icon } from "@canonical/react-ds-global";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Field, Form } from "../../../index.js";
import "../../../index.css";
import "./SpacingMarks.css";

const meta = {
  title: "Spacing buckets/04 Marks",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Metrics = {
  markInline: number;
  markBlock: number;
  paintTileInline: number | null;
  paintTileBlock: number | null;
  slotInline: number;
  slotBlock: number;
  columnGap: number | null;
  markToLabel: number | null;
  fontSize: number;
  labelBaseline: number | null;
  roleGap: number;
  bodyIconSize: number;
  guideLeft: number;
  guideTop: number;
  occupiedEnd: number;
  baselineKind: "browser-text" | "native-control";
  anatomy:
    | "standard"
    | "dedicated-track"
    | "native-caret"
    | "empty-slot"
    | "no-slot";
  sharedLeft: number | null;
  sharedWidth: number | null;
};

const number = (value: string): number => Number.parseFloat(value) || 0;

const resolveLength = (owner: HTMLElement, value: string): number => {
  const tier = owner.closest<HTMLElement>(".site, .docs, .app") ?? owner;
  const probe = document.createElement("span");
  probe.className = "marks-length-probe";
  probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;inline-size:${value};block-size:0`;
  tier.append(probe);
  const result = probe.getBoundingClientRect().width;
  probe.remove();
  return result;
};

const readBrowserBaseline = (
  owner: HTMLElement,
  label: HTMLElement,
  guideRect: DOMRect,
): number | null => {
  const style = getComputedStyle(label);
  if (
    !label.matches("input, select, textarea") &&
    !/flex|grid/.test(style.display)
  ) {
    const before = owner.getBoundingClientRect();
    const marker = document.createElement("span");
    marker.className = "marks-baseline-marker";
    label.append(marker);
    const baseline = marker.getBoundingClientRect().top - guideRect.top;
    const after = owner.getBoundingClientRect();
    marker.remove();
    if (
      Math.abs(before.width - after.width) < 0.05 &&
      Math.abs(before.height - after.height) < 0.05 &&
      Math.abs(before.top - after.top) < 0.05
    )
      return baseline;
  }

  const tier = owner.closest<HTMLElement>(".site, .docs, .app") ?? owner;
  const rect = label.getBoundingClientRect();
  const rig = document.createElement("span");
  rig.className = "marks-baseline-rig";
  const clone = label.cloneNode(true) as HTMLElement;
  clone.removeAttribute("id");
  clone.querySelectorAll("[id]").forEach((element) => {
    element.removeAttribute("id");
  });
  for (const property of style) {
    clone.style.setProperty(property, style.getPropertyValue(property));
  }
  clone.style.setProperty("inline-size", `${rect.width}px`);
  clone.style.setProperty("block-size", `${rect.height}px`);
  clone.style.setProperty("position", "static");
  clone.style.setProperty("display", "inline-block");
  clone.style.setProperty("vertical-align", "baseline");
  const marker = document.createElement("span");
  marker.className = "marks-baseline-marker";
  rig.append(clone, marker);
  tier.append(rig);
  const cloneRect = clone.getBoundingClientRect();
  const baseline =
    rect.top -
    guideRect.top +
    marker.getBoundingClientRect().top -
    cloneRect.top;
  const faithfulSize =
    Math.abs(cloneRect.width - rect.width) < 0.05 &&
    Math.abs(cloneRect.height - rect.height) < 0.05;
  rig.remove();
  return faithfulSize && Number.isFinite(baseline) ? baseline : null;
};

const Measured = ({
  label,
  children,
  ownerSelector,
  slotSelector,
  markSelector,
  labelSelector,
  reference = false,
  nativeCaret = false,
  trailing = false,
  dedicatedTrack = false,
}: {
  label: string;
  children: React.ReactNode;
  ownerSelector: string;
  slotSelector?: string;
  markSelector?: string;
  labelSelector: string;
  reference?: boolean;
  nativeCaret?: boolean;
  trailing?: boolean;
  dedicatedTrack?: boolean;
}) => {
  const root = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const owner = root.current?.querySelector<HTMLElement>(ownerSelector);
      if (!owner || getComputedStyle(owner).display === "none") return;
      const slot = slotSelector
        ? owner.querySelector<HTMLElement>(slotSelector)
        : null;
      const mark = markSelector
        ? owner.querySelector<HTMLElement>(markSelector)
        : null;
      const text = nativeCaret
        ? owner
        : owner.querySelector<HTMLElement>(labelSelector);
      if (!text) return;
      const guideRect = owner.getBoundingClientRect();
      const ownerStyle = getComputedStyle(owner);
      const labelRect = text.getBoundingClientRect();
      const labelStyle = getComputedStyle(text);
      const roleGap = resolveLength(owner, "var(--ds-spacing-mark)");
      const bodyIconSize = resolveLength(
        owner,
        "var(--ds-typography-body-font-size)",
      );
      const caretSize = nativeCaret
        ? 2 * number(ownerStyle.backgroundSize.split(" ")[0])
        : 0;
      const slotRect = slot?.getBoundingClientRect();
      const markRect = mark?.getBoundingClientRect();
      const gap = nativeCaret
        ? number(labelStyle.paddingInlineEnd) -
          number(labelStyle.paddingInlineStart) -
          caretSize
        : !slotRect
          ? null
          : trailing
            ? (slotRect?.left ?? 0) - labelRect.right
            : labelRect.left - (slotRect?.right ?? 0);
      const localRect = root.current?.getBoundingClientRect();
      if (!localRect) return;
      const next: Metrics = {
        markInline: nativeCaret ? caretSize : (markRect?.width ?? 0),
        markBlock: nativeCaret ? caretSize / 2 : (markRect?.height ?? 0),
        paintTileInline: nativeCaret ? caretSize / 2 : null,
        paintTileBlock: nativeCaret ? caretSize / 2 : null,
        slotInline: nativeCaret ? caretSize : (slotRect?.width ?? 0),
        slotBlock: nativeCaret ? caretSize : (slotRect?.height ?? 0),
        columnGap: nativeCaret ? null : number(ownerStyle.columnGap),
        markToLabel: gap,
        fontSize: number(labelStyle.fontSize),
        labelBaseline: readBrowserBaseline(owner, text, guideRect),
        roleGap,
        bodyIconSize,
        guideLeft: guideRect.left - localRect.left,
        guideTop: guideRect.top - localRect.top,
        occupiedEnd: guideRect.height + number(ownerStyle.marginBlockEnd),
        baselineKind: nativeCaret ? "native-control" : "browser-text",
        anatomy: nativeCaret
          ? "native-caret"
          : dedicatedTrack
            ? "dedicated-track"
            : mark
              ? "standard"
              : slot
                ? "empty-slot"
                : "no-slot",
        sharedLeft: null,
        sharedWidth: null,
      };
      if (reference) {
        const row = root.current?.closest<HTMLElement>(".marks-samples");
        if (row) {
          next.sharedLeft = row.getBoundingClientRect().left - localRect.left;
          next.sharedWidth = row.scrollWidth;
        }
      }
      setMetrics(next);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => requestAnimationFrame(update));
    };
    const generated = (node: Node): boolean =>
      node instanceof Element &&
      Boolean(
        node.closest(
          ".marks-length-probe, .marks-baseline-rig, .marks-baseline-marker, .marks-guide, .marks-shared-guides, .marks-metrics",
        ),
      );
    const observer = new MutationObserver((records) => {
      if (
        records.some((record) => {
          if (generated(record.target)) return false;
          if (record.type !== "childList") return true;
          return [...record.addedNodes, ...record.removedNodes].some(
            (node) => !generated(node),
          );
        })
      )
        schedule();
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "style"],
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
    ownerSelector,
    slotSelector,
    markSelector,
    labelSelector,
    reference,
    nativeCaret,
    trailing,
    dedicatedTrack,
  ]);

  return (
    <figure className="marks-sample">
      <figcaption>{label}</figcaption>
      <div className="marks-measure" ref={root}>
        {children}
        {metrics ? (
          <>
            <span
              className="marks-guide"
              aria-hidden="true"
              style={
                {
                  "--marks-guide-left": `${metrics.guideLeft}px`,
                  "--marks-guide-top": `${metrics.guideTop}px`,
                  "--marks-guide-baseline": `${metrics.labelBaseline ?? 0}px`,
                  "--marks-guide-end": `${metrics.occupiedEnd}px`,
                } as React.CSSProperties
              }
            >
              <span className="marks-guide-top" />
              {metrics.labelBaseline == null ? null : (
                <span className="marks-guide-baseline" />
              )}
              <span className="marks-guide-end" />
            </span>
            {reference && metrics.sharedWidth != null ? (
              <span
                className="marks-shared-guides"
                aria-hidden="true"
                style={
                  {
                    "--marks-shared-left": `${metrics.sharedLeft}px`,
                    "--marks-shared-width": `${metrics.sharedWidth}px`,
                    "--marks-shared-top": `${metrics.guideTop}px`,
                    "--marks-shared-baseline": `${metrics.guideTop + (metrics.labelBaseline ?? 0)}px`,
                    "--marks-shared-end": `${metrics.guideTop + metrics.occupiedEnd}px`,
                  } as React.CSSProperties
                }
              >
                <span className="marks-shared-top" />
                <span className="marks-shared-baseline" />
                <span className="marks-shared-end" />
              </span>
            ) : null}
          </>
        ) : null}
        <output
          className="marks-metrics"
          data-metrics={metrics ? JSON.stringify(metrics) : undefined}
          hidden
        />
      </div>
    </figure>
  );
};

const AccordionSpecimen = () => {
  const [expanded, setExpanded] = useState(false);
  return (
    <Accordion>
      <Accordion.Item
        heading="Details"
        expanded={expanded}
        onExpandedChange={setExpanded}
      >
        Details content
      </Accordion.Item>
    </Accordion>
  );
};

const NavigationSpecimen = () => {
  const [actionCount, setActionCount] = useState(0);
  return (
    <SideNavigation
      applicationName="Marks"
      keyboardShortcut={false}
      root={{
        key: "root",
        items: [
          {
            key: "group",
            items: [
              { key: "marked", label: "Marked", icon: "edit" },
              { key: "plain", label: "No icon" },
              {
                key: "expandable",
                label: "Expandable",
                icon: "edit",
                items: [{ key: "child", label: "Child" }],
              },
            ],
          },
        ],
      }}
      footerRoot={{
        key: "footer",
        items: [
          {
            label: actionCount ? `Action ${actionCount}` : "Action",
            icon: "edit",
            control: "button",
            onClick: () => setActionCount((count) => count + 1),
          },
        ],
      }}
    />
  );
};

const Tier = ({
  tier,
  title,
}: {
  tier: "site" | "docs" | "app";
  title: string;
}) => (
  <section className={`marks-tier ${tier}`}>
    <header>
      <h2>{title}</h2>
      <span>Icon-leading Button reference</span>
    </header>
    <div className="marks-samples">
      <Measured
        label="Button + icon"
        ownerSelector=".button"
        slotSelector=":scope > .icon"
        markSelector=":scope > .icon > svg"
        labelSelector=":scope > .label"
        reference
      >
        <Button icon="edit">Apply</Button>
      </Measured>
      <Measured
        label="Button icon override"
        ownerSelector=".button"
        slotSelector=":scope > .icon"
        markSelector=":scope > .icon > svg"
        labelSelector=":scope > .label"
      >
        <Button
          icon="edit"
          style={{ "--icon-size": "1.125rem" } as React.CSSProperties}
        >
          Apply
        </Button>
      </Measured>
      <Measured
        label="Button, no mark"
        ownerSelector=".button"
        slotSelector=":scope > .icon"
        labelSelector=":scope > .label"
      >
        <Button>Apply</Button>
      </Measured>
      <Measured
        label="Standalone Icon"
        ownerSelector=".marks-icon-pair"
        slotSelector=":scope > .icon"
        markSelector=":scope > .icon"
        labelSelector=":scope > .marks-icon-label"
      >
        <span className="marks-icon-pair">
          <Icon icon="edit" />
          <span className="marks-icon-label">Icon</span>
        </span>
      </Measured>
      <Measured
        label="Icon, ancestor override"
        ownerSelector=".marks-icon-pair"
        slotSelector=":scope > .icon"
        markSelector=":scope > .icon"
        labelSelector=":scope > .marks-icon-label"
      >
        <span
          className="marks-icon-pair"
          style={{ "--icon-size": "1.125rem" } as React.CSSProperties}
        >
          <Icon icon="edit" />
          <span className="marks-icon-label">Icon</span>
        </span>
      </Measured>
      <Measured
        label="Icon, direct override"
        ownerSelector=".marks-icon-pair"
        slotSelector=":scope > .icon"
        markSelector=":scope > .icon"
        labelSelector=":scope > .marks-icon-label"
      >
        <span className="marks-icon-pair">
          <Icon
            icon="edit"
            style={{ "--icon-size": "1.5rem" } as React.CSSProperties}
          />
          <span className="marks-icon-label">Icon</span>
        </span>
      </Measured>
      <Measured
        label="Checkbox"
        ownerSelector=".field-toggle-control"
        slotSelector=":scope > input"
        markSelector=":scope > input"
        labelSelector=":scope > .field-label"
      >
        <Form defaultValues={{ check: true }} onSubmit={() => undefined}>
          <Field name="check" inputType="checkbox" label="Enabled" />
        </Form>
      </Measured>
      <Measured
        label="Radio"
        ownerSelector=".option"
        slotSelector=":scope > input"
        markSelector=":scope > input"
        labelSelector=":scope > .field-label"
      >
        <Form defaultValues={{ radio: "one" }} onSubmit={() => undefined}>
          <Field
            name="radio"
            inputType="choices"
            label="Choice"
            options={[
              { label: "One", value: "one" },
              { label: "Two", value: "two" },
            ]}
          />
        </Form>
      </Measured>
      <Measured
        label="Switch track"
        ownerSelector=".field-toggle-control"
        slotSelector=":scope > input"
        markSelector=":scope > input"
        labelSelector=":scope > .field-label"
        trailing
        dedicatedTrack
      >
        <Form defaultValues={{ switch: true }} onSubmit={() => undefined}>
          <Field name="switch" inputType="switch" label="Enabled" />
        </Form>
      </Measured>
      <Measured
        label="Select caret"
        ownerSelector="select"
        labelSelector="select"
        nativeCaret
      >
        <Form defaultValues={{ select: "one" }} onSubmit={() => undefined}>
          <Field
            name="select"
            inputType="select"
            aria-label={`${title} choice`}
            options={[{ label: "One", value: "one" }]}
          />
        </Form>
      </Measured>
      <Measured
        label="Accordion"
        ownerSelector=".accordion-item > .header"
        slotSelector=":scope > .chevron"
        markSelector=":scope > .chevron"
        labelSelector=":scope > .heading"
      >
        <AccordionSpecimen />
      </Measured>
      <Measured
        label="Nav icon"
        ownerSelector=".side-navigation-item:has(.start svg) > .row"
        slotSelector=":scope > .start"
        markSelector=":scope > .start svg"
        labelSelector=":scope > .label"
      >
        <NavigationSpecimen />
      </Measured>
      <Measured
        label="Nav empty slot"
        ownerSelector=".side-navigation-item:not(:has(.start svg)) > .row"
        slotSelector=":scope > .start"
        labelSelector=":scope > .label"
      >
        <NavigationSpecimen />
      </Measured>
      <Measured
        label="Nav disclosure"
        ownerSelector=".side-navigation-item-expandable > .details > .row"
        slotSelector=":scope > .start"
        markSelector=":scope > .start svg"
        labelSelector=":scope > .label"
      >
        <NavigationSpecimen />
      </Measured>
      <Measured
        label="Nav action"
        ownerSelector=".side-navigation-item-button > .row"
        slotSelector=":scope > .start"
        markSelector=":scope > .start svg"
        labelSelector=":scope > .label"
      >
        <NavigationSpecimen />
      </Measured>
    </div>
  </section>
);

export const SiteDocsApp: Story = {
  render: () => (
    <main className="spacing-marks">
      <h1>04 Marks</h1>
      <p className="marks-legend">
        <span className="marks-legend-edge" /> block start / occupied end{" "}
        <span className="marks-legend-baseline" /> browser text baseline
      </p>
      <Tier tier="site" title="Site" />
      <Tier tier="docs" title="Docs" />
      <Tier tier="app" title="App" />
    </main>
  ),
};
