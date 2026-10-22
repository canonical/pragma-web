import { Badge, Button, Chip } from "@canonical/react-ds-global";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Children,
  cloneElement,
  type CSSProperties,
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

function SiteProviderLink({ className, ...props }: LinkComponentProps) {
  return <a {...props} className={`${className} site`} />;
}

function AppProviderLink({ className, ...props }: LinkComponentProps) {
  return <a {...props} className={`${className} app`} />;
}

function DocsProviderLink({ className, ...props }: LinkComponentProps) {
  return <a {...props} className={`${className} docs`} />;
}

const candidateModes = [
  "candidate-plain",
  "candidate-direct",
  "candidate-one-wrapper",
  "candidate-two-wrappers",
  "candidate-legacy-switches",
  "candidate-product-root",
  "candidate-same-node-provider",
] as const;
type CandidateMode = (typeof candidateModes)[number];

function candidateLabel(mode: CandidateMode) {
  switch (mode) {
    case "candidate-plain":
      return "Plain";
    case "candidate-direct":
      return "Direct";
    case "candidate-one-wrapper":
      return "Wrapped";
    case "candidate-two-wrappers":
      return "RTL wrapped";
    case "candidate-legacy-switches":
      return "Legacy switches";
    case "candidate-product-root":
      return "Product root";
    case "candidate-same-node-provider":
      return "Root provider";
  }
}

function crossTier(tier: string) {
  if (tier === "site") return "app";
  if (tier === "app") return "site";
  return "docs";
}

function candidateSlot(mode: CandidateMode, tier: string) {
  const chip = <Chip value="Chip" />;
  switch (mode) {
    case "candidate-plain":
      return undefined;
    case "candidate-direct":
      return chip;
    case "candidate-one-wrapper":
      return <span className="density-neutral-wrapper">{chip}</span>;
    case "candidate-two-wrappers":
      return (
        <span className="density-neutral-wrapper">
          <span className="density-neutral-wrapper">{chip}</span>
        </span>
      );
    case "candidate-legacy-switches":
      return (
        <span
          className="comfortable density-neutral-wrapper"
          data-ds-density-reset
        >
          <span className="dense density-neutral-wrapper">{chip}</span>
        </span>
      );
    case "candidate-product-root":
      return (
        <span className={`${crossTier(tier)} density-neutral-wrapper`}>
          <Chip value="Chip" data-non-subscriber="product-root-reference" />
        </span>
      );
    case "candidate-same-node-provider":
      return chip;
  }
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
          "Production static-Chip enrollment through neutral wrappers; actual private Label owns default helper; actual DOM product-role and portal boundaries",
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
          {candidateModes.map((mode) => (
            <SideNavigation
              key={mode}
              className="density-nav-fixture"
              data-density-host={mode}
              dir={mode === "candidate-two-wrappers" ? "rtl" : "ltr"}
              LinkComponent={
                mode === "candidate-direct"
                  ? ClassOnlyLink
                  : mode === "candidate-same-node-provider"
                    ? tier === "site"
                      ? AppProviderLink
                      : tier === "app"
                        ? SiteProviderLink
                        : DocsProviderLink
                    : "a"
              }
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
                        label: candidateLabel(mode),
                        slot: candidateSlot(mode, tier),
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
          <span className={crossTier(tier)}>
            <Chip
              value="Target default"
              data-non-subscriber="cross-tier-standalone"
            />
          </span>
          <Button data-non-subscriber="button-outside">Action</Button>
          <div
            className={`ds row ${navigationDensityPolicy.providerClassName} density-policy-boundary`}
            data-density-policy-diagnostic="nested-provider"
          >
            <div className="end">
              <div className={crossTier(tier)}>
                <SideNavigation
                  className="density-nav-fixture density-nested-provider-fixture"
                  data-density-host="nested-provider"
                  defaultExpanded
                  keyboardShortcut={false}
                  root={{
                    key: "nested-provider",
                    items: [
                      {
                        key: "group",
                        items: [
                          {
                            key: "chip",
                            label: "Nested",
                            slot: <Chip value="Chip" />,
                          },
                        ],
                      },
                    ],
                  }}
                />
              </div>
            </div>
          </div>
          <div
            className={`ds row ${navigationDensityPolicy.providerClassName} density-policy-boundary`}
            data-density-policy-diagnostic="same-node-provider"
          >
            <div className="end">
              <SideNavigation
                className="density-nav-fixture density-nested-provider-fixture"
                data-density-host="nested-same-node-provider"
                defaultExpanded
                keyboardShortcut={false}
                LinkComponent={
                  tier === "site"
                    ? AppProviderLink
                    : tier === "app"
                      ? SiteProviderLink
                      : DocsProviderLink
                }
                root={{
                  key: "nested-same-node-provider",
                  items: [
                    {
                      key: "group",
                      items: [
                        {
                          key: "chip",
                          label: "Same node",
                          url: "#density-nested-same-node-provider",
                          slot: <Chip value="Chip" />,
                        },
                      ],
                    },
                  ],
                }}
              />
            </div>
          </div>
        </div>
        <output hidden data-density-fit={tier}>
          {JSON.stringify(metrics)}
        </output>
      </div>
      <p className="density-caption">
        Plain, direct and wrapped static Chips share the unchanged label seat.
        Direct uses a public custom link forwarding only guaranteed props; the
        private provider class preserves enrollment. Neutral wrappers, legacy
        density classes and the former reset attribute cannot opt out. A real
        cross-tier product root restores its target-tier default. Nested and
        same-node providers inside the outer trailing slot establish target-tier
        density again after a real root reset. Intrinsic painted rows contain
        closure and touch the next row; no target height is authored. Other
        controls, interactive Chips and portals outside the trailing slot keep
        their default seat.
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

type IndicatorFitMetrics = {
  badgeBaselineDelta: number;
  badgeBlockEndClearance: number;
  badgeBlockStartClearance: number;
  badgeFontSize: string;
  badgeLineHeight: string;
  itemHeightDelta: number;
  rowHeightDelta: number;
};

type ChipBadgePairMetrics = {
  badgeBaselineDelta: number;
  badgeBlockEndClearance: number;
  badgeBlockStartClearance: number;
  badgeCapsuleClearance: number;
  badgeInlineEndClearance: number;
  badgeInlineStartClearance: number;
  chipHeightDelta: number;
  rowHeightDelta: number;
};

function roundedCapsuleClearance(
  chipRect: DOMRect,
  badgeRect: DOMRect,
  radius: number,
  stroke: number,
): number {
  const halfWidth = chipRect.width / 2 - stroke;
  const halfHeight = chipRect.height / 2 - stroke;
  const innerRadius = Math.max(
    0,
    Math.min(radius, chipRect.width / 2, chipRect.height / 2) - stroke,
  );
  const centerX = chipRect.left + chipRect.width / 2;
  const centerY = chipRect.top + chipRect.height / 2;
  const corners = [
    [badgeRect.left, badgeRect.top],
    [badgeRect.right, badgeRect.top],
    [badgeRect.right, badgeRect.bottom],
    [badgeRect.left, badgeRect.bottom],
  ] as const;
  return Math.min(
    ...corners.map(([x, y]) => {
      const qx = Math.abs(x - centerX) - (halfWidth - innerRadius);
      const qy = Math.abs(y - centerY) - (halfHeight - innerRadius);
      const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
      const inside = Math.min(Math.max(qx, qy), 0);
      return -(outside + inside - innerRadius);
    }),
  );
}

function measureChipBadgePair(
  root: HTMLElement,
  name: "standalone" | "navigation",
): ChipBadgePairMetrics | null {
  const plainChip = root.querySelector<HTMLElement>(`.${name}-plain-chip`);
  const badgeChip = root.querySelector<HTMLElement>(`.${name}-badge-chip`);
  const plainRow = root.querySelector<HTMLElement>(`.${name}-plain-row`);
  const badgeRow = root.querySelector<HTMLElement>(`.${name}-badge-row`);
  const label = badgeChip?.querySelector<HTMLElement>(".value");
  const badge = badgeChip?.querySelector<HTMLElement>(".badge");
  if (!plainChip || !badgeChip || !plainRow || !badgeRow || !label || !badge)
    return null;

  const badgeRect = badge.getBoundingClientRect();
  const chipRect = badgeChip.getBoundingClientRect();
  const stroke = Number.parseFloat(
    getComputedStyle(badgeChip).getPropertyValue("--chip-border-width"),
  );
  const radius = Number.parseFloat(getComputedStyle(badgeChip).borderRadius);
  return {
    badgeBaselineDelta: baseline(badge) - baseline(label),
    badgeBlockEndClearance: chipRect.bottom - stroke - badgeRect.bottom,
    badgeBlockStartClearance: badgeRect.top - chipRect.top - stroke,
    badgeCapsuleClearance: roundedCapsuleClearance(
      chipRect,
      badgeRect,
      radius,
      stroke,
    ),
    badgeInlineEndClearance: chipRect.right - stroke - badgeRect.right,
    badgeInlineStartClearance: badgeRect.left - chipRect.left - stroke,
    chipHeightDelta: chipRect.height - plainChip.getBoundingClientRect().height,
    rowHeightDelta:
      badgeRow.getBoundingClientRect().height -
      plainRow.getBoundingClientRect().height,
  };
}

function ChipBadgeTier({
  density,
  dir = "ltr",
  tier,
}: {
  density: "default" | "dense" | "comfortable";
  dir?: "ltr" | "rtl";
  tier: "site" | "docs" | "app";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<{
    navigation: ChipBadgePairMetrics;
    standalone: ChipBadgePairMetrics;
  } | null>(null);
  const densityClass = density === "default" ? "" : density;
  const badgeValue = density === "comfortable" ? 132_456_455 : 7;
  const badgeStyle =
    tier === "app" && density === "comfortable"
      ? ({ "--badge-color-background": "rgb(1 2 3)" } as CSSProperties)
      : undefined;
  const badge = () => (
    <Badge
      value={badgeValue}
      criticality={density === "dense" ? "error" : undefined}
      style={badgeStyle}
    />
  );

  useEffect(() => {
    let active = true;
    void document.fonts.ready.then(() => {
      requestAnimationFrame(() => {
        const root = ref.current;
        if (!active || !root) return;
        const standalone = measureChipBadgePair(root, "standalone");
        const navigation = measureChipBadgePair(root, "navigation");
        if (standalone && navigation) setMetrics({ navigation, standalone });
      });
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className={`${tier} ${densityClass} chip-badge-case`} dir={dir}>
      <h2>{`${tier} · ${density}${dir === "rtl" ? " · RTL" : ""}`}</h2>
      <div ref={ref}>
        <div className="chip-badge-pair">
          <div className="standalone-plain-row">
            <Chip className="standalone-plain-chip" value="Machines" />
          </div>
          <div className="standalone-badge-row">
            <Chip
              className="standalone-badge-chip"
              value="Machines"
              badge={badge()}
            />
          </div>
        </div>
        <SideNavigation
          className="indicator-fit-nav"
          data-chip-badge-fit={`${tier}-${density}-${dir}`}
          defaultExpanded
          keyboardShortcut={false}
          root={{
            key: `${tier}-${density}-chip-badge`,
            items: [
              {
                key: "chips",
                items: [
                  {
                    className: "navigation-plain-row",
                    key: "plain",
                    label: "Machines",
                    slot: (
                      <Chip className="navigation-plain-chip" value="Machines" />
                    ),
                  },
                  {
                    className: "navigation-badge-row",
                    key: "badge",
                    label: "Machines",
                    slot: (
                      <Chip
                        className="navigation-badge-chip"
                        value="Machines"
                        badge={badge()}
                      />
                    ),
                  },
                ],
              },
            ],
          }}
        />
      </div>
      <output hidden data-chip-badge-fit-result={`${tier}-${density}-${dir}`}>
        {metrics ? JSON.stringify(metrics) : "pending"}
      </output>
    </section>
  );
}

function IndicatorBadgeTier({
  density,
  dir = "ltr",
  tier,
}: {
  density: "default" | "dense" | "comfortable";
  dir?: "ltr" | "rtl";
  tier: "site" | "docs" | "app";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<IndicatorFitMetrics | null>(null);

  useEffect(() => {
    let active = true;
    void document.fonts.ready.then(() => {
      requestAnimationFrame(() => {
        const root = ref.current;
        const plainItem = root?.querySelector<HTMLElement>(
          ".indicator-fit-plain",
        );
        const badgeItem = root?.querySelector<HTMLElement>(
          ".indicator-fit-badge",
        );
        const plainRow = plainItem?.querySelector<HTMLElement>(".row");
        const badgeRow = badgeItem?.querySelector<HTMLElement>(".row");
        const label = badgeItem?.querySelector<HTMLElement>(
          ".side-navigation-label",
        );
        const badge = badgeItem?.querySelector<HTMLElement>(".badge");
        if (
          !active ||
          !plainItem ||
          !badgeItem ||
          !plainRow ||
          !badgeRow ||
          !label ||
          !badge
        )
          return;

        const labelStyle = getComputedStyle(label);
        const badgeStyle = getComputedStyle(badge);
        const labelRect = label.getBoundingClientRect();
        const badgeRect = badge.getBoundingClientRect();
        const lineStart =
          labelRect.top + Number.parseFloat(labelStyle.paddingBlockStart);
        const lineEnd = lineStart + Number.parseFloat(labelStyle.lineHeight);
        setMetrics({
          badgeBaselineDelta: baseline(badge) - baseline(label),
          badgeBlockEndClearance: lineEnd - badgeRect.bottom,
          badgeBlockStartClearance: badgeRect.top - lineStart,
          badgeFontSize: badgeStyle.fontSize,
          badgeLineHeight: badgeStyle.lineHeight,
          itemHeightDelta:
            badgeItem.getBoundingClientRect().height -
            plainItem.getBoundingClientRect().height,
          rowHeightDelta:
            badgeRow.getBoundingClientRect().height -
            plainRow.getBoundingClientRect().height,
        });
      });
    });
    return () => {
      active = false;
    };
  }, []);

  const densityClass = density === "default" ? "" : density;
  return (
    <section className={`${tier} ${densityClass} indicator-fit-case`} dir={dir}>
      <h2>{`${tier} · ${density}${dir === "rtl" ? " · RTL" : ""}`}</h2>
      <div ref={ref}>
        <SideNavigation
          className="indicator-fit-nav"
          data-indicator-fit={`${tier}-${density}-${dir}`}
          defaultExpanded
          keyboardShortcut={false}
          root={{
            key: `${tier}-${density}`,
            items: [
              {
                key: "indicators",
                items: [
                  {
                    className: "indicator-fit-plain",
                    icon: "machines",
                    key: "plain",
                    label: "Machines",
                  },
                  {
                    className: "indicator-fit-badge",
                    icon: "machines",
                    key: "badge",
                    label: "Machines",
                    slot: <Badge value={42} />,
                  },
                ],
              },
            ],
          }}
        />
      </div>
      <output hidden data-indicator-fit-result={`${tier}-${density}-${dir}`}>
        {metrics ? JSON.stringify(metrics) : "pending"}
      </output>
    </section>
  );
}

/**
 * The supported invariant-indicator route: real Badge instances in the
 * existing static SideNavigation trailing slot, paired with plain rows.
 */
export const InvariantBadge: Story = {
  render: () => (
    <main className="density08 indicator-fit">
      <h1>08 Density · invariant Badge fit</h1>
      <div className="indicator-fit-grid">
        {(["site", "docs", "app"] as const).flatMap((tier) =>
          (["default", "dense", "comfortable"] as const).map((density) => (
            <IndicatorBadgeTier
              key={`${tier}-${density}`}
              density={density}
              tier={tier}
            />
          )),
        )}
        <IndicatorBadgeTier
          key="app-dense-rtl"
          density="dense"
          dir="rtl"
          tier="app"
        />
      </div>
      <h1>08 Density · Badge inside Chip</h1>
      <div className="indicator-fit-grid chip-badge-grid">
        {(["site", "docs", "app"] as const).flatMap((tier) =>
          (["default", "dense", "comfortable"] as const).map((density) => (
            <ChipBadgeTier
              key={`${tier}-${density}-chip-badge`}
              density={density}
              tier={tier}
            />
          )),
        )}
        <ChipBadgeTier
          key="app-dense-rtl-chip-badge"
          density="dense"
          dir="rtl"
          tier="app"
        />
      </div>
    </main>
  ),
};
