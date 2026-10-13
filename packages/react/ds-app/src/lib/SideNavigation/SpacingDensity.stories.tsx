import { Chip } from "@canonical/react-ds-global";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { SideNavigation } from "./index.js";
import type { LinkComponentProps } from "./types.js";
import "./SpacingDensity.css";

const meta = {
  title: "Spacing buckets/08 Density host proposal",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

// The public LinkComponent receives one Fragment. Preserve its real anchor and
// existing children; only its actual label gains the shared default seat.
function seatLabel(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement<{ children?: ReactNode; className?: string }>(child))
      return child;
    if (child.type === Fragment)
      return cloneElement(child, {}, seatLabel(child.props.children));
    if (
      child.type === "span" &&
      child.props.className?.split(/\s+/).includes("label")
    ) {
      return cloneElement(child, {
        className: [
          ...(child.props.className
            ?.split(/\s+/)
            .filter((name) => name !== "label") ?? []),
          "ds",
          "density-nav-label",
          "spacing-control-seat",
        ].join(" "),
      });
    }
    return child;
  });
}
function LabelSeatLink({ children, ...props }: LinkComponentProps) {
  return <a {...props}>{seatLabel(children)}</a>;
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
        const label = row.querySelector<HTMLElement>(
          ".density-nav-label,.label",
        );
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
          top: rect.top - origin.top,
          bottom: rect.bottom - origin.top,
          x: rect.left - origin.left,
          labelBaseline:
            labelBaseline === null ? null : labelBaseline - origin.top,
          labelFont: label ? getComputedStyle(label).font : null,
          hostPaintBackground: getComputedStyle(row).backgroundColor,
          selected:
            row.closest(".side-navigation-item")?.hasAttribute("data-active") ??
            false,
          chip:
            chip && chipCss && chipBaseline !== null
              ? {
                  rootTag: chip.tagName,
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
        enrollment:
          "Intrinsic linked Nav-slot proof through the existing public LinkComponent adapter; actual Label owns default helper, no fixed host target or production density enrollment",
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
  }, [tier, density]);
  return (
    <section className={`${tier} ${density} surface density-tier`}>
      <h2>{tier}</h2>
      <p>Intrinsic linked rows · default parent seat / direct dense child</p>
      <div ref={ref} className="density-fit-proof">
        <div className="density-fit-row">
          {["candidate-plain", "candidate-default", "candidate-chip"].map(
            (mode) => (
              <SideNavigation
                key={mode}
                className={`density-nav-fixture density-host-candidate ${mode === "candidate-chip" ? "density-host-clearance-candidate" : ""}`}
                data-density-host={mode}
                currentUrl={`#density-${tier}-${mode}-first`}
                LinkComponent={LabelSeatLink}
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
                          label:
                            mode === "candidate-plain"
                              ? "Plain"
                              : mode === "candidate-default"
                                ? "Regular"
                                : "Dense",
                          slot:
                            mode === "candidate-plain" ? undefined : (
                              <Chip value="Chip" />
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
            ),
          )}
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
          Legacy fixed rows / Standalone / Explicit Site reset outside the
          intrinsic prototype
        </p>
        <div className="density-other-row">
          <SideNavigation
            className="density-nav-fixture"
            data-density-host="current-default"
            defaultExpanded
            keyboardShortcut={false}
            root={{
              key: "current",
              items: [
                {
                  key: "group",
                  items: [
                    { key: "plain", label: "Plain" },
                    {
                      key: "chip",
                      label: "Regular",
                      slot: <Chip value="Chip" />,
                    },
                  ],
                },
              ],
            }}
          />
          {tier === "site" && (
            <SideNavigation
              className="density-nav-fixture density-legacy-fixed density-host-clearance-candidate"
              data-density-host="current32-dense32"
              defaultExpanded
              keyboardShortcut={false}
              root={{
                key: "legacy-dense",
                items: [
                  {
                    key: "group",
                    items: [
                      {
                        key: "chip",
                        label: "32px row",
                        slot: <Chip value="Chip" />,
                      },
                    ],
                  },
                ],
              }}
            />
          )}
          <Chip value="Standalone" data-non-subscriber="standalone" />
          <div className="site">
            <Chip
              value="Site reset"
              data-non-subscriber="explicit-site-reset"
            />
          </div>
        </div>
        <output hidden data-density-fit={tier}>
          {JSON.stringify(metrics)}
        </output>
      </div>
      <p className="density-caption">
        Linked public Nav slots use a disclosed LinkComponent adapter to attach
        the existing helper to the real label, preserving the anchor and
        children. The label determines intrinsic row height; two adjacent
        painted rows contain its closing margin and expose actual touching
        distance without a target height. Only the direct static Chip selects
        existing dense 4px padding and no end compensation; baselines and
        painted clearance are measured, with production enrollment still
        pending.
      </p>
    </section>
  );
}

export const HostProposal: Story = {
  render: () => (
    <main className="density08">
      <h1>08 Density · host fit proposal</h1>
      {["site", "docs", "app"].map((tier) => (
        <Fit key={tier} tier={tier} />
      ))}
    </main>
  ),
};

export const PublicDensityClasses: Story = {
  render: () => (
    <main className="density08">
      <h1>08 Density · public class boundary proposal</h1>
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
