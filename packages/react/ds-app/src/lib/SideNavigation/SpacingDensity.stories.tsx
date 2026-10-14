import { Button, Chip } from "@canonical/react-ds-global";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { navigationDensityPolicy } from "./common/densityPolicy.js";
import { SideNavigation } from "./index.js";
import type { LinkComponentProps } from "./types.js";
import "./SpacingDensity.css";

const meta = {
  title: "Spacing buckets/08 Density host proposal",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

// Isolated frozen component Before: the real link/DOM is retained, but the
// newly added internal label helper is absent as it was before this migration.
function beforeLabel(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement<{ children?: ReactNode; className?: string }>(child))
      return child;
    if (child.type === Fragment)
      return cloneElement(child, {}, beforeLabel(child.props.children));
    if (
      child.type === "span" &&
      child.props.className?.includes("side-navigation-label")
    )
      return cloneElement(child, { className: "label" });
    return child;
  });
}
function BeforeLink({ children, ...props }: LinkComponentProps) {
  return <a {...props}>{beforeLabel(children)}</a>;
}

// A custom link can honor its full public contract without forwarding data attrs.
function ClassOnlyLink({
  href,
  className,
  children,
  "aria-current": current,
}: LinkComponentProps) {
  return (
    <a href={href} className={className} aria-current={current}>
      {children}
    </a>
  );
}

function PortalChip({
  origin,
  tier,
  onReady,
}: {
  origin: string;
  tier: string;
  onReady: (node: HTMLElement) => void;
}) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const node = document.createElement("div");
    node.className = "site density-portal-reference";
    node.dataset.densityOrigin = origin;
    const caption = document.createElement("p");
    caption.textContent = `Site portal target from ${tier}`;
    node.append(caption);
    document.body.append(node);
    setTarget(node);
    onReady(node);
    return () => node.remove();
  }, [origin, tier, onReady]);
  return target
    ? createPortal(
        <Chip value="Portal" data-non-subscriber="portal-target-site" />,
        target,
      )
    : null;
}

function baseline(node: HTMLElement) {
  const marker = document.createElement("span");
  marker.style.cssText =
    "display:inline-block;width:0;height:0;padding:0;margin:0;border:0;vertical-align:baseline";
  node.prepend(marker);
  const result = marker.getBoundingClientRect().top;
  marker.remove();
  return result;
}

function Fit({
  tier,
  density = "comfortable",
}: {
  tier: string;
  density?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const originId = useId();
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [metrics, setMetrics] = useState<unknown>(null);
  const [guides, setGuides] = useState<number[]>([]);
  const [ticks, setTicks] = useState<
    { name: string; x: number; seats: number[] }[]
  >([]);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let alive = true;
    const measure = () => {
      if (!alive) return;
      const origin = host.getBoundingClientRect();
      const rows = [
        ...host.querySelectorAll<HTMLElement>(".side-navigation-item > .row"),
      ];
      const rowMetrics = rows.map((row) => {
        const rect = row.getBoundingClientRect();
        const label = row.querySelector<HTMLElement>(".side-navigation-label");
        const chip = row.querySelector<HTMLElement>(".chip");
        const item = row.closest<HTMLElement>(".side-navigation-item");
        const nav = row.closest(".side-navigation");
        const ordinal = nav
          ? [...nav.querySelectorAll(".side-navigation-item > .row")].indexOf(
              row,
            )
          : -1;
        const following =
          item?.nextElementSibling?.querySelector<HTMLElement>(":scope > .row");
        const value = chip?.querySelector<HTMLElement>(".value");
        const labelBaseline = label ? baseline(label) : null;
        const labelRange = document.createRange();
        if (label) labelRange.selectNodeContents(label);
        const labelText = label ? labelRange.getBoundingClientRect() : null;
        const mark = row.querySelector<HTMLElement>(".start .icon");
        const markBox = mark?.getBoundingClientRect();
        const chipBaseline = value ? baseline(value) : null;
        const chipCss = chip ? getComputedStyle(chip) : null;
        return {
          identity: `${row.closest("[data-density-host]")?.getAttribute("data-density-host")}:${label?.textContent}`,
          rootTag: row.tagName,
          ordinal,
          itemHeight: item?.getBoundingClientRect().height ?? null,
          itemMargin: item ? getComputedStyle(item).marginBlock : null,
          followingPaintDistance: following
            ? following.getBoundingClientRect().top - rect.bottom
            : null,
          labelSeat: label
            ? {
                helperOwner: label.classList.contains("spacing-control-seat"),
                padding: getComputedStyle(label).paddingBlock,
                margin: getComputedStyle(label).marginBlock,
                line: getComputedStyle(label).lineHeight,
              }
            : null,
          height: rect.height,
          provider: row.matches(navigationDensityPolicy.providerSelector)
            ? navigationDensityPolicy.provider
            : null,
          providerClassPresent: row.classList.contains(
            navigationDensityPolicy.providerClassName,
          ),
          diagnosticProviderAttribute: row.getAttribute(
            "data-ds-density-provider",
          ),
          top: rect.top - origin.top,
          bottom: rect.bottom - origin.top,
          x: rect.left - origin.left,
          labelBaseline:
            labelBaseline === null ? null : labelBaseline - origin.top,
          labelFont: label ? getComputedStyle(label).font : null,
          rowFont: getComputedStyle(row).font,
          mark:
            markBox && labelText
              ? {
                  width: markBox.width,
                  height: markBox.height,
                  ownTextCenterDelta:
                    markBox.top +
                    markBox.height / 2 -
                    (labelText.top + labelText.height / 2),
                }
              : null,
          hostPaintBackground: getComputedStyle(row).backgroundColor,
          selected:
            row.closest(".side-navigation-item")?.hasAttribute("data-active") ??
            false,
          chip:
            chip && chipCss && chipBaseline !== null
              ? {
                  rootTag: chip.tagName,
                  legacyResetAttributePresent: chip.hasAttribute(
                    "data-ds-density-reset",
                  ),
                  productRootTier: chip.parentElement?.matches(
                    ".site,.docs,.app",
                  )
                    ? chip.parentElement.className
                    : null,
                  height: chip.getBoundingClientRect().height,
                  occupiedHeight:
                    chip.getBoundingClientRect().height +
                    parseFloat(chipCss.marginBlockEnd),
                  paddingBlock: chipCss.paddingBlock,
                  endMargin: chipCss.marginBlockEnd,
                  fontSize: chipCss.fontSize,
                  lineHeight: chipCss.lineHeight,
                  baseline: chipBaseline - origin.top,
                  paintedClearanceStart:
                    chip.getBoundingClientRect().top - rect.top,
                  paintedClearanceEnd:
                    rect.bottom - chip.getBoundingClientRect().bottom,
                  occupiedClearanceEnd:
                    rect.bottom -
                    chip.getBoundingClientRect().bottom -
                    parseFloat(chipCss.marginBlockEnd),
                  baselineDelta:
                    labelBaseline === null
                      ? null
                      : chipBaseline - labelBaseline,
                  overflowsHost:
                    chip.getBoundingClientRect().top < rect.top - 0.01 ||
                    chip.getBoundingClientRect().bottom +
                      parseFloat(chipCss.marginBlockEnd) >
                      rect.bottom + 0.01,
                  defaultRole: chipCss
                    .getPropertyValue("--ds-spacing-control-inset")
                    .trim(),
                  denseRole: chipCss
                    .getPropertyValue("--ds-spacing-control-inset-dense")
                    .trim(),
                  helperPaddingInput: chipCss
                    .getPropertyValue("--ds-control-seat-padding-block")
                    .trim(),
                  helperEndInput: chipCss
                    .getPropertyValue("--ds-control-seat-margin-block-end")
                    .trim(),
                }
              : null,
        };
      });
      const reference = rowMetrics[0];
      setGuides(
        reference && reference.labelBaseline !== null
          ? [reference.top, reference.labelBaseline, reference.bottom]
          : [],
      );
      setTicks(
        rowMetrics
          .filter(
            (row) =>
              row.labelBaseline !== null &&
              row.identity.startsWith("candidate"),
          )
          .map((row) => ({
            name: row.identity,
            x: row.x,
            seats: [row.top, row.labelBaseline as number, row.bottom],
          })),
      );
      setMetrics({
        tier,
        publicDensityClass: density,
        viewport: window.innerWidth,
        policy: navigationDensityPolicy,
        enrollment:
          "Production direct static-Chip enrollment; actual private Label owns default helper; actual DOM product-role and portal boundaries",
        parentBaselineComparison: (() => {
          const plain = rowMetrics.find(
            (row) =>
              row.identity.startsWith("candidate-plain:") && row.ordinal === 0,
          );
          return rowMetrics
            .filter(
              (row) =>
                row.identity.startsWith("candidate-") && row.ordinal === 0,
            )
            .map((row) => ({
              identity: row.identity,
              labelBaselineDeltaFromPlain:
                row.labelBaseline === null || plain?.labelBaseline == null
                  ? null
                  : row.labelBaseline - plain.labelBaseline,
            }));
        })(),
        rows: rowMetrics,
        portalTarget: [
          ...(portalTarget?.querySelectorAll<HTMLElement>(".chip") ?? []),
        ].map((chip) => ({
          origin: originId,
          targetTier: "site",
          provider: chip.closest(navigationDensityPolicy.providerSelector)
            ? navigationDensityPolicy.provider
            : null,
          height: chip.getBoundingClientRect().height,
          occupiedHeight:
            chip.getBoundingClientRect().height +
            parseFloat(getComputedStyle(chip).marginBlockEnd),
          padding: getComputedStyle(chip).paddingBlock,
          endMargin: getComputedStyle(chip).marginBlockEnd,
        })),
        standalone: [
          ...host.querySelectorAll<HTMLElement>("[data-non-subscriber]"),
        ].map((chip) => ({
          identity: chip.dataset.nonSubscriber,
          height: chip.getBoundingClientRect().height,
          occupiedHeight:
            chip.getBoundingClientRect().height +
            parseFloat(getComputedStyle(chip).marginBlockEnd),
          padding: getComputedStyle(chip).paddingBlock,
          endMargin: getComputedStyle(chip).marginBlockEnd,
        })),
      });
    };
    void document.fonts.ready.then(measure);
    const resize = new ResizeObserver(measure);
    resize.observe(host);
    window.addEventListener("resize", measure);
    return () => {
      alive = false;
      resize.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [tier, density, portalTarget, originId]);
  return (
    <section className={`${tier} ${density} surface density-tier`}>
      <h2>{tier}</h2>
      <p>
        Production intrinsic rows · default label seat / automatic static child
      </p>
      <div ref={ref} className="density-fit-proof">
        <div className="density-fit-row">
          {[
            "candidate-plain",
            "candidate-default",
            "candidate-chip",
            "candidate-legacy-attribute",
          ].map((mode) => (
            <SideNavigation
              key={mode}
              className="density-nav-fixture"
              data-density-host={mode}
              LinkComponent={mode === "candidate-chip" ? ClassOnlyLink : "a"}
              currentUrl={`#density-${tier}-${mode}-first`}
              defaultExpanded
              keyboardShortcut={false}
              root={{
                key: mode,
                items: [
                  {
                    key: "group",
                    items: [
                      {
                        key: "first",
                        url: `#density-${tier}-${mode}-first`,
                        icon: "settings",
                        label:
                          mode === "candidate-plain"
                            ? "Plain"
                            : mode === "candidate-default"
                              ? "Root"
                              : mode === "candidate-legacy-attribute"
                                ? "Attr"
                                : "Dense",
                        slot:
                          mode === "candidate-plain" ? undefined : mode ===
                            "candidate-default" ? (
                            <span className={tier}>
                              <Chip
                                value="Chip"
                                data-non-subscriber="product-root-reference"
                              />
                            </span>
                          ) : (
                            <Chip
                              value="Chip"
                              data-ds-density-reset={
                                mode === "candidate-legacy-attribute"
                                  ? ""
                                  : undefined
                              }
                            />
                          ),
                      },
                      {
                        key: "next",
                        url: `#density-${tier}-${mode}-next`,
                        label: "Next",
                      },
                    ],
                  },
                ],
              }}
            />
          ))}
          <div className="density-guides" aria-hidden>
            {guides.map((top, index) => (
              <i
                key={["start", "baseline", "end"][index]}
                data-guide={["start", "baseline", "end"][index]}
                style={{ top }}
              />
            ))}
            {ticks.flatMap((peer) =>
              peer.seats.map((top, index) => (
                <b
                  key={`${peer.name}-${["start", "baseline", "end"][index]}`}
                  data-guide={["start", "baseline", "end"][index]}
                  style={{ left: peer.x, top }}
                />
              )),
            )}
          </div>
        </div>
        <p>
          Frozen component Before / non-subscribers and real nested DOM
          boundaries
        </p>
        <SideNavigation
          className="density-nav-fixture density-frozen-before"
          data-density-host="frozen-before"
          LinkComponent={BeforeLink}
          defaultExpanded
          keyboardShortcut={false}
          root={{
            key: "before",
            items: [
              {
                key: "group",
                items: [
                  { key: "plain", url: "#before-plain", label: "Before" },
                  {
                    key: "chip",
                    url: "#before-chip",
                    label: "Chip",
                    slot: <Chip value="Chip" />,
                  },
                ],
              },
            ],
          }}
        />
        <div className="density-other-row">
          <SideNavigation
            className="density-nav-fixture"
            data-density-host="boundaries"
            defaultExpanded
            keyboardShortcut={false}
            root={{
              key: "boundaries",
              items: [
                {
                  key: "group",
                  items: [
                    {
                      key: "button",
                      label: "Button",
                      slot: (
                        <Button data-non-subscriber="button-in-host">
                          Action
                        </Button>
                      ),
                    },
                    {
                      key: "interactive",
                      label: "Interactive",
                      slot: (
                        <Chip
                          value="Click"
                          onClick={() => {}}
                          data-non-subscriber="interactive-in-host"
                        />
                      ),
                    },
                    {
                      key: "dismiss",
                      label: "Dismiss",
                      slot: (
                        <Chip
                          value="Dismiss"
                          onDismiss={() => {}}
                          data-non-subscriber="dismiss-in-host"
                        />
                      ),
                    },
                    {
                      key: "product",
                      label: "Site root",
                      slot: (
                        <span className="site">
                          <Chip
                            value="Root"
                            data-non-subscriber="nested-site-product-root"
                          />
                        </span>
                      ),
                    },
                    {
                      key: "portal",
                      label: "Portal",
                      slot: (
                        <PortalChip
                          origin={originId}
                          tier={tier}
                          onReady={setPortalTarget}
                        />
                      ),
                    },
                  ],
                },
              ],
            }}
          />
          <Chip value="Standalone" data-non-subscriber="standalone" />
          <Button data-non-subscriber="button-outside">Action</Button>
        </div>
        <output hidden data-density-fit={tier}>
          {JSON.stringify(metrics)}
        </output>
      </div>
      <p className="density-caption">
        Plain and enrolled static Chip share the unchanged default label seat.
        Dense uses a public custom link forwarding only guaranteed props; the
        provider class keeps automatic enrollment when data attributes are
        dropped. Root is an ordinary default Chip inside a real product root.
        Attr demonstrates that the former reset attribute cannot opt out.
        Intrinsic painted rows contain closure and touch the next row; no target
        height is authored. Other controls, interactive Chips, wrappers outside
        direct-child eligibility and portals outside the direct trailing slot
        keep their default seat.
      </p>
    </section>
  );
}

export const HostProposal: Story = {
  render: () => (
    <main className="density08">
      <h1>08 Density · enrolled navigation host</h1>
      {["site", "docs", "app"].map((tier) => (
        <Fit key={tier} tier={tier} />
      ))}
    </main>
  ),
};

export const PublicDensityClasses: Story = {
  render: () => (
    <main className="density08">
      <h1>08 Density · public class boundaries</h1>
      {["site", "docs", "app"].flatMap((tier) =>
        ["normal", "comfortable", "dense"].map((density) => (
          <Fit
            key={`${tier}-${density}`}
            tier={tier}
            density={density === "normal" ? "" : density}
          />
        )),
      )}
    </main>
  ),
};

function NativeVariants({
  tier,
  expanded,
}: {
  tier: string;
  expanded: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<unknown>(null);
  const [actions, setActions] = useState(0);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let frame = 0;
    const measure = () => {
      const nav = host.querySelector<HTMLElement>(".side-navigation");
      setMetrics({
        tier,
        expanded: nav?.dataset.expanded,
        railWidth: nav?.getBoundingClientRect().width,
        rows: [
          ...host.querySelectorAll<HTMLElement>(
            navigationDensityPolicy.providerSelector,
          ),
        ].map((row) => {
          let hiddenByClosedDetails = false;
          for (
            let ancestor = row.parentElement;
            ancestor;
            ancestor = ancestor.parentElement
          ) {
            if (
              ancestor instanceof HTMLDetailsElement &&
              !ancestor.open &&
              !ancestor.querySelector(":scope > summary")?.contains(row)
            )
              hiddenByClosedDetails = true;
          }
          const available =
            !hiddenByClosedDetails &&
            row.getClientRects().length > 0 &&
            row.getBoundingClientRect().height > 0;
          const label = row.querySelector<HTMLElement>(
            ".side-navigation-label",
          );
          const mark = row.querySelector<HTMLElement>(".start .icon");
          const range = document.createRange();
          if (label) range.selectNodeContents(label);
          const text = label ? range.getBoundingClientRect() : null;
          const box = mark?.getBoundingClientRect();
          return {
            tag: row.tagName,
            label: label?.textContent,
            height: row.getBoundingClientRect().height,
            font: label ? getComputedStyle(label).font : null,
            available,
            labelBaseline: label && available ? baseline(label) : null,
            paintClip: label ? getComputedStyle(label).clipPath : null,
            mark:
              available &&
              box &&
              text &&
              box.width > 0 &&
              box.height > 0 &&
              text.height > 0
                ? {
                    width: box.width,
                    height: box.height,
                    ownTextCenterDelta:
                      box.top + box.height / 2 - (text.top + text.height / 2),
                  }
                : null,
            open: row.closest("details")?.open ?? null,
          };
        }),
      });
    };
    void document.fonts.ready.then(measure);
    const resize = new ResizeObserver(measure);
    resize.observe(host);
    const nav = host.querySelector<HTMLElement>(".side-navigation");
    if (nav) resize.observe(nav);
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const state = new MutationObserver(schedule);
    if (nav)
      state.observe(nav, {
        attributes: true,
        attributeFilter: ["data-expanded"],
      });
    host.addEventListener("toggle", schedule, true);
    host.addEventListener("click", schedule);
    return () => {
      resize.disconnect();
      state.disconnect();
      cancelAnimationFrame(frame);
      host.removeEventListener("toggle", schedule, true);
      host.removeEventListener("click", schedule);
    };
  }, [tier]);
  return (
    <section className={`${tier} surface density-tier`}>
      <h2>
        {tier} · {expanded ? "expanded" : "compact"}
      </h2>
      <div ref={ref} className="density-fit-proof">
        <SideNavigation
          className="density-nav-fixture"
          applicationName="Work"
          defaultExpanded={expanded}
          keyboardShortcut={false}
          currentUrl="#density-child"
          root={{
            key: "variants",
            items: [
              {
                key: "group",
                items: [
                  {
                    key: "link",
                    label: "Overview",
                    url: "#density-overview",
                    icon: "folder",
                    slot: <Chip value="Chip" />,
                  },
                  {
                    key: "expand",
                    label: "Resources",
                    icon: "folder",
                    items: [
                      {
                        key: "child",
                        label: "Child",
                        url: "#density-child",
                        icon: "folder",
                        slot: <Chip value="Chip" />,
                      },
                    ],
                  },
                ],
              },
            ],
          }}
          footerRoot={{
            key: "footer",
            items: [
              {
                label: "Action",
                control: "button",
                icon: "folder",
                onClick: () => setActions((n) => n + 1),
                slot: <Chip value="Chip" />,
              },
              {
                label: "Settings",
                icon: "settings",
                items: [
                  {
                    label: "Child",
                    url: "#density-footer-child",
                    icon: "folder",
                    slot: <Chip value="Chip" />,
                  },
                ],
              },
            ],
          }}
        />
        <output
          hidden
          data-density-native={`${tier}-${expanded}`}
          data-actions={actions}
        >
          {JSON.stringify(metrics)}
        </output>
      </div>
      <p>
        Real links, actions and native disclosures. Compact desktop stays
        narrow; clipped label paint preserves its intrinsic seat and accessible
        name. Mobile keeps its native Menu behavior.
      </p>
    </section>
  );
}

export const NativeRows: Story = {
  render: () => (
    <main className="density08">
      <h1>08 Density · native row variants</h1>
      {["site", "docs", "app"].flatMap((tier) =>
        [true, false].map((expanded) => (
          <NativeVariants
            key={`${tier}-${expanded}`}
            tier={tier}
            expanded={expanded}
          />
        )),
      )}
    </main>
  ),
};
