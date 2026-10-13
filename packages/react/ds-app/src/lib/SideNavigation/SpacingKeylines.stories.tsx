import { Accordion } from "@canonical/react-ds-global";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { SideNavigation } from "./index.js";
import "./SpacingKeylines.css";

const meta = {
  title: "Spacing buckets/07 Keylines",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
const tiers = ["site", "docs", "app"] as const;

function Row({
  tier,
  direction,
  scroll = false,
  density = "comfortable",
}: {
  tier: string;
  direction: "ltr" | "rtl";
  scroll?: boolean;
  density?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<unknown>(null);
  const [line, setLine] = useState<number | null>(null);
  const [ticks, setTicks] = useState<{ x: number; y: number; name: string }[]>(
    [],
  );
  const [expanded, setExpanded] = useState(true);
  const [context, setContext] = useState({ key: "one", name: "Context one" });
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let alive = true;
    const measure = () => {
      if (!alive) return;
      const origin = host.getBoundingClientRect();
      const nav = host.querySelector<HTMLElement>(".side-navigation");
      const header = host.querySelector<HTMLElement>(
        ".accordion-item > .header",
      );
      if (!nav || !header) return;
      const edge = (rect: DOMRect) =>
        direction === "rtl" ? rect.right : rect.left;
      const text = (element: Element) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        return range.getBoundingClientRect();
      };
      const labels = [
        ...host.querySelectorAll<HTMLElement>(
          ".accordion-item > .header > .heading,.accordion-item > .content > [data-keyline-content],.side-navigation-header .title,.side-navigation-group-header,.side-navigation-item > .row > .side-navigation-label,.side-navigation-item-button > .row > .side-navigation-label,.side-navigation-item-expandable > .details > .row > .side-navigation-label,.side-navigation-context-switcher .trigger > .side-navigation-label > .row > .side-navigation-label",
        ),
      ].filter((node) => node.getBoundingClientRect().width > 0);
      const records = labels.map((node) => {
        const rect = text(node);
        const popup = node.closest<HTMLElement>(".children");
        const clip = node.closest<HTMLElement>(".content");
        const inMeasuredPlane =
          (!popup || getComputedStyle(popup).position !== "fixed") &&
          (!clip ||
            (rect.top + rect.height / 2 >= clip.getBoundingClientRect().top &&
              rect.top + rect.height / 2 <=
                clip.getBoundingClientRect().bottom));
        const owner = node.closest<HTMLElement>(
          ".row,.header,.side-navigation-group-header,.brand-container,.content",
        );
        return {
          name: node.textContent,
          inMeasuredPlane,
          start:
            (edge(rect) - edge(nav.getBoundingClientRect())) *
            (direction === "rtl" ? -1 : 1),
          x: edge(rect) - origin.left,
          y: rect.top + rect.height / 2 - origin.top,
          ownTextRect: { width: rect.width, height: rect.height },
          ownerPadding: owner ? getComputedStyle(owner).paddingInline : null,
          ownerMarginStart: owner
            ? getComputedStyle(owner).marginInlineStart
            : null,
        };
      });
      const heading = header.querySelector(".heading");
      const trigger = nav.querySelector<HTMLElement>(
        ".side-navigation-context-switcher .trigger",
      );
      const parent = nav.querySelector<HTMLElement>(
        ".side-navigation-item-expandable > .details > .row",
      );
      const css = getComputedStyle(nav);
      const active = [
        ...nav.querySelectorAll<HTMLElement>("[data-active] > .row"),
      ].find((row) => row.getBoundingClientRect().height > 0);
      const scroller = active?.closest<HTMLElement>(
        nav.dataset.expanded === "false"
          ? ".children,.footer"
          : ".content,.footer",
      );
      const paint = active ? getComputedStyle(active, "::before") : null;
      setLine(heading ? edge(text(heading)) - origin.left : null);
      setTicks(
        records
          .filter((record) => record.inMeasuredPlane)
          .map((record) => ({
            x: record.x,
            y: record.y,
            name: record.name ?? "",
          })),
      );
      setMetrics({
        tier,
        density,
        currentContext: context.key,
        direction,
        viewport: window.innerWidth,
        outerSurfacePadding: css.paddingInline,
        legacyControlInsetCarrier: css
          .getPropertyValue("--sidenav-inset-inline")
          .trim(),
        surfaceInsetCarrier: css
          .getPropertyValue("--sidenav-surface-inset-inline")
          .trim(),
        parts: [...nav.children]
          .filter((node) =>
            node.matches(
              ".side-navigation-header,.side-navigation-context-switcher-region,.content,.footer",
            ),
          )
          .map((node) => ({
            owner: node.className,
            inlinePadding: getComputedStyle(node).paddingInline,
            width: node.getBoundingClientRect().width,
          })),
        indicator:
          active && paint && scroller
            ? {
                sourceKind:
                  "Computed logical pseudo-element paint; window is the actual region or collapsed popup",
                windowOwner: scroller.className,
                startOffset: paint.insetInlineStart,
                width: paint.inlineSize,
                color: paint.backgroundColor,
                logicalStartInClip:
                  (edge(active.getBoundingClientRect()) -
                    edge(scroller.getBoundingClientRect())) *
                    (direction === "rtl" ? -1 : 1) +
                  parseFloat(paint.insetInlineStart),
                clipOverflow: getComputedStyle(scroller).overflow,
                scroll: {
                  width: scroller.clientWidth,
                  scrollWidth: scroller.scrollWidth,
                  height: scroller.clientHeight,
                  scrollHeight: scroller.scrollHeight,
                },
              }
            : null,
        rowStartInset: parent
          ? getComputedStyle(parent).paddingInlineStart
          : null,
        markSize: css
          .getPropertyValue("--sidenav-icon-column-inline-size")
          .trim(),
        markGap: css.getPropertyValue("--sidenav-icon-gap").trim(),
        continuation: css
          .getPropertyValue("--sidenav-label-continuation")
          .trim(),
        brandWidth: css.getPropertyValue("--sidenav-logo-inline-size").trim(),
        brandGap: getComputedStyle(
          nav.querySelector(".brand-container") as Element,
        ).gap,
        field: trigger
          ? {
              boxStart:
                (edge(trigger.getBoundingClientRect()) -
                  edge(nav.getBoundingClientRect())) *
                (direction === "rtl" ? -1 : 1),
              paddingInline: getComputedStyle(trigger).paddingInline,
              borderBoxHeight: trigger.getBoundingClientRect().height,
              marginEnd: getComputedStyle(trigger).marginBlockEnd,
              occupiedHeight:
                trigger.getBoundingClientRect().height +
                parseFloat(getComputedStyle(trigger).marginBlockEnd),
              seatOwner: "existing Button helper; default tier seat",
              kind: "ContextualMenu button trigger; native menu selection retained",
              open: trigger.getAttribute("aria-expanded"),
            }
          : null,
        gridMargin: css.getPropertyValue("--grid-margin").trim(),
        gridGutter: css.getPropertyValue("--grid-gutter").trim(),
        labels: records,
      });
    };
    void document.fonts.ready.then(measure);
    const resize = new ResizeObserver(measure);
    resize.observe(host);
    const mutation = new MutationObserver(measure);
    mutation.observe(host, {
      attributes: true,
      subtree: true,
      attributeFilter: ["open", "data-expanded", "aria-expanded"],
    });
    window.addEventListener("resize", measure);
    host.addEventListener("scroll", measure, true);
    return () => {
      alive = false;
      resize.disconnect();
      mutation.disconnect();
      window.removeEventListener("resize", measure);
      host.removeEventListener("scroll", measure, true);
    };
  }, [tier, direction, context, density]);
  return (
    <section
      className={`${tier} ${density} surface keylines-tier`}
      dir={direction}
    >
      <h2>
        {tier} · {direction.toUpperCase()}
      </h2>
      <div className="keylines-row" ref={ref}>
        <Accordion>
          <Accordion.Item
            heading="Disclosure title"
            expanded={expanded}
            onExpandedChange={setExpanded}
          >
            <p className="p" data-keyline-content>
              Nested prose label
            </p>
          </Accordion.Item>
        </Accordion>
        <SideNavigation
          className="keylines-nav-fixture"
          applicationName="Application"
          brand={
            <span role="img" aria-label="Brand">
              ●
            </span>
          }
          defaultExpanded
          keyboardShortcut={false}
          currentUrl="#keylines-nested"
          footerRoot={{
            key: "footer",
            items: [
              { label: "Footer action", icon: "folder", control: "button" },
              {
                label: "Footer group",
                icon: "folder",
                items: [{ url: "#keylines-nested", label: "Footer child" }],
              },
            ],
          }}
          root={{
            key: "root",
            items: [
              {
                key: "group",
                label: "Group header",
                items: [
                  {
                    key: "parent",
                    label: "Parent label",
                    icon: "folder",
                    items: [
                      {
                        url: "#keylines-nested",
                        label: "Nested label",
                        icon: "folder",
                      },
                      { key: "nested-markless", label: "Nested without mark" },
                    ],
                  },
                  { key: "markless", label: "Parent without mark" },
                  ...(scroll
                    ? Array.from({ length: 12 }, (_, index) => ({
                        key: `scroll-${index}`,
                        label: `Scrollable entry ${index + 1}`,
                        icon: "folder" as const,
                      }))
                    : []),
                ],
              },
            ],
          }}
          contextSwitcher={{
            title: "Context header",
            currentContext: context,
            contexts: [
              { key: "one", name: "Context one" },
              { key: "two", name: "Context two" },
            ],
            onContextChange: setContext,
          }}
        />
        <div className="keylines-guides" aria-hidden>
          {line !== null && <i style={{ left: line }} />}
          {ticks.map((tick) => (
            <b
              key={tick.name}
              data-peer={tick.name}
              style={{ left: tick.x, top: tick.y }}
            />
          ))}
        </div>
        <output
          hidden
          data-keylines={`${tier}-${direction}`}
          data-public-density={density}
        >
          {JSON.stringify(metrics)}
        </output>
      </div>
      <p className="keylines-caption">
        Accordion label first. Header keeps its 20px brand column; its gap
        derives from the row’s mark column and gap. Nested rows keep their
        native mark column and continue the parent label without another indent;
        disclosure grouping and interaction carry the hierarchy.
        ContextSwitcher’s actual button box starts on the label keyline, with
        its existing 8px text inset. Navigation is contained in this comparison
        row, with every slot retained. Expanded labels start at the responsive
        viewport gutter plus the 16/14px mark and 8px gap. Compact desktop
        navigation retains 8px gutters and the current 52px width. Accordion
        retains its own 16px inset and 40/38px label start. Navigation rows now
        contain the actual default label seat; intrinsic paint includes its
        closure without a target height. Context menu sizing retains its
        existing global portal fallback. Clipped labels and viewport popups keep
        hidden measurements and have no row-guide markers.
      </p>
    </section>
  );
}

export const Keylines: Story = {
  render: () => (
    <main className="keylines07">
      <h1>07 Keylines</h1>
      {tiers.map((tier) =>
        (["ltr", "rtl"] as const).map((direction) => (
          <Row key={`${tier}-${direction}`} tier={tier} direction={direction} />
        )),
      )}
    </main>
  ),
};
export const Scrollable: Story = {
  render: () => (
    <main className="keylines07">
      <h1>07 Keylines · native scroll proof</h1>
      {tiers.map((tier) =>
        (["ltr", "rtl"] as const).map((direction) => (
          <Row
            key={`${tier}-${direction}`}
            tier={tier}
            direction={direction}
            scroll
          />
        )),
      )}
    </main>
  ),
};

export const PublicDensityClasses: Story = {
  render: () => (
    <main className="keylines07">
      <h1>07 Keylines · public density class boundaries</h1>
      {tiers.flatMap((tier) =>
        ["normal", "comfortable", "dense"].map((density) => (
          <Row
            key={`${tier}-${density}`}
            tier={tier}
            direction="ltr"
            density={density === "normal" ? "" : density}
          />
        )),
      )}
    </main>
  ),
};
