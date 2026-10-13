import { Chip } from "@canonical/react-ds-global";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { SideNavigation } from "./index.js";
import "./SpacingDensity.css";

const meta = {
  title: "Spacing buckets/08 Density host proposal",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

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
        const label = row.querySelector<HTMLElement>(".label");
        const chip = row.querySelector<HTMLElement>(".chip");
        const value = chip?.querySelector<HTMLElement>(".value");
        const labelBaseline = label ? baseline(label) : null;
        const chipBaseline = value ? baseline(value) : null;
        const chipCss = chip ? getComputedStyle(chip) : null;
        return {
          identity: `${row.closest("[data-density-host]")?.getAttribute("data-density-host")}:${label?.textContent}`,
          rootTag: row.tagName,
          height: rect.height,
          top: rect.top - origin.top,
          bottom: rect.bottom - origin.top,
          x: rect.left - origin.left,
          labelBaseline:
            labelBaseline === null ? null : labelBaseline - origin.top,
          labelFont: label ? getComputedStyle(label).font : null,
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
          "Prototype only: public non-link LeafNavItem.slot, no production subscriber",
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
      <p>Proposed shared seat · plain row / Chip row</p>
      <div ref={ref} className="density-fit-proof">
        <div className="density-fit-row">
          {["candidate-plain", "candidate-chip"].map((mode) => (
            <SideNavigation
              key={mode}
              className="density-nav-fixture density-host-candidate"
              data-density-host={mode}
              defaultExpanded
              keyboardShortcut={false}
              root={{
                key: mode,
                items: [
                  {
                    key: "group",
                    items: [
                      {
                        key: "plain",
                        label:
                          mode === "candidate-plain"
                            ? "Plain text"
                            : "With Chip",
                        className: "spacing-control-seat",
                        slot:
                          mode === "candidate-chip" ? (
                            <Chip value="Chip" />
                          ) : undefined,
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
          Legacy current rows / Standalone / Explicit Site reset outside the
          proposed host
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
                    { key: "plain", label: "Plain text" },
                    {
                      key: "chip",
                      label: "With Chip",
                      slot: <Chip value="Chip" />,
                    },
                  ],
                },
              ],
            }}
          />
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
        Real public non-link Item slots contain static Chips; each 32px row
        stays shipped. Site proposal selects the existing dense member through
        helper inputs, omitting child nudge and end compensation. Docs/App
        retain default seating. Baseline fit is measured, not inferred from
        height. Shared guides reference the proposed plain row and its
        same-level Chip peer. Legacy rows are separate. Standalone and explicit
        Site reset are outside the proposed host, not a nested reset-policy
        proof. Host enrollment remains pending owner choice; no Table or Tabs
        API is added.
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
