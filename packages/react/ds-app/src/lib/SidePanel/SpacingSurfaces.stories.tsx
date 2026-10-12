import {
  Button,
  Card,
  Cards,
  Modal,
  Tile,
  TooltipEngine,
} from "@canonical/react-ds-global";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { SideNavigation } from "../SideNavigation/index.js";
import { SidePanel } from "./index.js";
import type { SidePanelHandle } from "./types.js";
import "./SpacingSurfaces.css";

const meta = {
  title: "Spacing buckets/06 Surfaces",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
const tiers = ["site", "docs", "app"] as const;
type Tier = (typeof tiers)[number];
const frame = {
  paddingInline: "var(--ds-spacing-inset-surface-standard-inline)",
  paddingBlock: "var(--ds-spacing-inset-surface-standard-block)",
};
const zero = { padding: 0 };
const image = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="64"><rect width="320" height="64" fill="#777"/><path d="M0 32H320" stroke="#fff"/></svg>')}`;

function Reference({ proposed = false }: { proposed?: boolean }) {
  return (
    <Card data-owner="card" style={proposed ? frame : undefined}>
      <Card.Image src={image} alt="Full-width image band" />
      <Card.Header style={proposed ? zero : undefined}>
        <span data-seat>Surface heading</span>
      </Card.Header>
      <Card.Content style={proposed ? zero : undefined}>
        <p className="p">Comparable body copy.</p>
        <div className="surfaces-inner-scroll" data-scroll-owner>
          <pre>Wide content stays inside its named inner scroll region.</pre>
        </div>
      </Card.Content>
      <Card.Footer style={proposed ? zero : undefined}>
        <Button>Continue</Button>
        <Button importance="secondary">Cancel</Button>
      </Card.Footer>
    </Card>
  );
}

function baseline(element: HTMLElement) {
  const marker = document.createElement("span");
  marker.style.cssText =
    "display:inline-block;width:0;height:0;padding:0;margin:0;border:0;vertical-align:baseline";
  element.prepend(marker);
  const result = marker.getBoundingClientRect().top;
  marker.remove();
  return result;
}

function Measure({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<unknown>(null);
  const [guides, setGuides] = useState<number[]>([]);
  const [ticks, setTicks] = useState<{ x: number; seats: number[] }[]>([]);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let alive = true;
    const measure = () => {
      if (!alive) return;
      const origin = host.getBoundingClientRect();
      const owners = [
        ...host.querySelectorAll<HTMLElement>(
          "[data-owner],.card-header,.card-content,.card-footer,.tile-header,.tile-content,.modal-header,.modal-content,.modal-footer,.side-panel-header,.side-panel-content,.side-panel-footer,.side-navigation .header,.side-navigation .content,.side-navigation-group-header,.side-navigation-item,.tooltip,.tooltip .text,[data-scroll-owner]",
        ),
      ].map((node) => {
        const css = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        const unavailable = !rect.width || !rect.height;
        return {
          owner: node.dataset.owner ?? node.className,
          available: !unavailable,
          padding: [
            css.paddingBlockStart,
            css.paddingInlineEnd,
            css.paddingBlockEnd,
            css.paddingInlineStart,
          ],
          margin: [
            css.marginBlockStart,
            css.marginInlineEnd,
            css.marginBlockEnd,
            css.marginInlineStart,
          ],
          rowGap: css.rowGap,
          columnGap: css.columnGap,
          rows: css.gridTemplateRows,
          columns: css.gridTemplateColumns,
          background: css.backgroundColor,
          position: css.position,
          zIndex: css.zIndex,
          overflow: [css.overflowX, css.overflowY],
          rect: unavailable
            ? null
            : {
                x: rect.x - origin.x,
                y: rect.y - origin.y,
                width: rect.width,
                height: rect.height,
              },
          scroll: unavailable
            ? null
            : { clientWidth: node.clientWidth, scrollWidth: node.scrollWidth },
          aliases: {
            sourceNames: {
              compactInline: "--ds-spacing-field",
              compactBlock: "--ds-spacing-control-inset",
              standardInline: "--ds-spacing-action",
              standardBlock: "--ds-spacing-action",
              majorInline: "--grid-margin",
            },
            compactInline: css
              .getPropertyValue("--ds-spacing-inset-surface-compact-inline")
              .trim(),
            compactBlock: css
              .getPropertyValue("--ds-spacing-inset-surface-compact-block")
              .trim(),
            standardInline: css
              .getPropertyValue("--ds-spacing-inset-surface-standard-inline")
              .trim(),
            standardBlock: css
              .getPropertyValue("--ds-spacing-inset-surface-standard-block")
              .trim(),
            gridMargin: css.getPropertyValue("--grid-margin").trim(),
            gridGutter: css.getPropertyValue("--grid-gutter").trim(),
          },
        };
      });
      const cards = [
        ...host.querySelectorAll<HTMLElement>("[data-owner=card]"),
      ].map((card) => {
        const content = card.querySelector<HTMLElement>(".card-content");
        const footer = card.querySelector<HTMLElement>(".card-footer");
        const picture = card.querySelector("img");
        return {
          contentDistance:
            content?.lastElementChild && footer?.firstElementChild
              ? footer.firstElementChild.getBoundingClientRect().top -
                content.lastElementChild.getBoundingClientRect().bottom
              : null,
          seam:
            content && footer
              ? footer.getBoundingClientRect().top -
                content.getBoundingClientRect().bottom
              : null,
          imageInlineInset: picture
            ? picture.getBoundingClientRect().left -
              card.getBoundingClientRect().left
            : null,
          imageWidth: picture?.getBoundingClientRect().width ?? null,
        };
      });
      const seat = host.querySelector<HTMLElement>("[data-seat]");
      const reference = host.querySelector<HTMLElement>("[data-owner=card]");
      setGuides(
        seat && reference
          ? [
              reference.getBoundingClientRect().top - origin.top,
              baseline(seat) - origin.top,
              reference.getBoundingClientRect().bottom - origin.top,
            ]
          : [],
      );
      const peerSeats = [
        ...host.querySelectorAll<HTMLElement>(
          "[data-owner=card],[data-owner=tile],[data-owner=side-navigation],.surfaces-tooltip",
        ),
      ].flatMap((node) => {
        const rect = node.getBoundingClientRect();
        const text = node.querySelector<HTMLElement>(
          "[data-seat],.tile-header span,h1,.text",
        );
        if (
          !rect.width ||
          !rect.height ||
          !text ||
          getComputedStyle(node).visibility === "hidden"
        )
          return [];
        if (
          node.matches(".surfaces-tooltip") &&
          (rect.top < origin.top || rect.bottom > origin.bottom)
        )
          return [];
        return [
          {
            x: rect.left - origin.left,
            seats: [
              rect.top - origin.top,
              baseline(text) - origin.top,
              rect.bottom - origin.top,
            ],
          },
        ];
      });
      setTicks(peerSeats);
      setMetrics({ label, owners, cards, peerSeats });
    };
    void document.fonts.ready.then(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    for (const owner of host.querySelectorAll<HTMLElement>("[data-owner]"))
      observer.observe(owner);
    const mutation = new MutationObserver((records) => {
      if (
        records.some(
          (record) =>
            record.type === "attributes" ||
            [...record.addedNodes].some(
              (node) =>
                node instanceof HTMLElement &&
                node.matches(".surfaces-tooltip"),
            ),
        )
      )
        measure();
    });
    mutation.observe(host, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["open"],
    });
    window.addEventListener("resize", measure);
    return () => {
      alive = false;
      observer.disconnect();
      mutation.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [label]);
  return (
    <div className="surfaces-measure" ref={ref}>
      {children}
      <div className="surfaces-guides" aria-hidden="true">
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
              key={`${peer.x}-${["start", "baseline", "end"][index]}`}
              data-guide={["start", "baseline", "end"][index]}
              style={{ left: peer.x, top }}
            />
          )),
        )}
      </div>
      <output hidden data-metrics={label}>
        {JSON.stringify(metrics)}
      </output>
    </div>
  );
}

function Compact() {
  const [parent, setParent] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setParent} className="surfaces-tooltip-stage">
      {parent && (
        <TooltipEngine
          parentElement={parent}
          open
          Message="Compact surface"
          messageElementClassName="surfaces-tooltip"
          preferredDirections={["block-end"]}
        >
          <Button>Tooltip target</Button>
        </TooltipEngine>
      )}
    </div>
  );
}

function Overlay({
  kind,
  proposed,
  tier,
}: {
  kind: "modal" | "panel";
  proposed: boolean;
  tier: Tier;
}) {
  const modal = useRef<HTMLDialogElement>(null);
  const panel = useRef<SidePanelHandle>(null);
  const name = `${tier} ${kind} ${proposed ? "proposed" : "current"}`;
  const style = (
    proposed
      ? kind === "modal"
        ? {
            "--modal-padding-inline": "var(--grid-margin)",
            "--modal-header-padding-inline": "var(--modal-padding-inline)",
            "--modal-content-padding-inline": "var(--modal-padding-inline)",
            "--modal-footer-padding-inline": "var(--modal-padding-inline)",
          }
        : { "--side-panel-padding-inline": "var(--grid-margin)" }
      : {}
  ) as CSSProperties;
  const body = (
    <>
      <p className="p">
        Comparable body copy. Current block edges remain unselected.
      </p>
      <div className="surfaces-inner-scroll" data-scroll-owner>
        <pre>
          Wide content stays inside the content scroll region without moving the
          frame stroke. This deliberately long row continues beyond the reading
          width so horizontal overflow is owned by the inner scroll region.
        </pre>
      </div>
    </>
  );
  return (
    <div className="surfaces-overlay-trigger">
      <Button
        onClick={() =>
          kind === "modal" ? modal.current?.showModal() : panel.current?.open()
        }
      >
        {name}
      </Button>
      {kind === "modal" ? (
        <Modal
          ref={modal}
          data-owner="modal"
          className={`${tier} comfortable`}
          style={style}
        >
          <Modal.Header>{name}</Modal.Header>
          <Modal.Content>{body}</Modal.Content>
          <Modal.Footer>
            <Button onClick={() => modal.current?.close()}>Close</Button>
            <Button importance="secondary">Continue</Button>
          </Modal.Footer>
        </Modal>
      ) : (
        <SidePanel
          ref={panel}
          data-owner="side-panel"
          className={`${tier} comfortable`}
          style={style}
        >
          <SidePanel.Header>{name}</SidePanel.Header>
          <SidePanel.Content>{body}</SidePanel.Content>
          <SidePanel.Footer>
            <Button onClick={() => panel.current?.close()}>Close</Button>
            <Button importance="secondary">Continue</Button>
          </SidePanel.Footer>
        </SidePanel>
      )}
    </div>
  );
}

function Page() {
  return (
    <main className="surfaces06">
      <h1>06 Surfaces</h1>
      <p>
        Compact edges are selected. Standard frame insets and grid-owned major
        gutters are proposals for O3.
      </p>
      {tiers.map((tier) => (
        <section
          key={tier}
          className={`${tier} comfortable surface surfaces-tier`}
        >
          <h2>{tier}</h2>
          <h3>Standard · current / proposed</h3>
          <Measure label={`${tier}-standard`}>
            <div className="grid surfaces-cards">
              <Cards data-owner="cards">
                <Reference />
                <Reference proposed />
              </Cards>
            </div>
            <Tile data-owner="tile">
              <Tile.Header>
                <span>Current Tile</span>
              </Tile.Header>
              <Tile.Content>
                <p className="p">Comparable body copy.</p>
              </Tile.Content>
            </Tile>
            <Tile data-owner="tile" style={frame}>
              <Tile.Header style={zero}>
                <span>Proposed Tile</span>
              </Tile.Header>
              <Tile.Content style={zero}>
                <p className="p">Comparable body copy.</p>
              </Tile.Content>
            </Tile>
          </Measure>
          <p className="surfaces-caption">
            Card first: shipped section insets / proposed frame insets with zero
            section padding. The shared parent’s 16px track gap remains; the
            selected 24/20px block group gap is not applied here. Image becomes
            inset by 16/12px plus the existing border; shared four-track rows
            and inherited Card color remain. Shared tracks stretch the proposed
            sections, retaining about 49/51px content-to-footer distance rather
            than reducing it to the track gap. Tile retains its own surface
            context. Anatomy pending O3; no production Card or Tile change.
          </p>
          <h3>Compact · selected</h3>
          <Measure label={`${tier}-compact`}>
            <div className="grid surfaces-reference">
              <Reference />
            </div>
            <Compact />
          </Measure>
          <p className="surfaces-caption">
            Real tooltip portal uses the tier’s compact aliases. Frame padding
            and text nudge are separate owners; positioning and arrow are
            preserved. The shipped fixed portal has z-index auto; positive-layer
            escape remains an existing mechanism limitation, pending
            disposition.
          </p>
          <h3>Persistent panel · current / proposed</h3>
          <Measure label={`${tier}-navigation`}>
            <div className="grid surfaces-reference">
              <Reference />
            </div>
            {[false, true].map((proposed) => (
              <SideNavigation
                key={String(proposed)}
                data-owner="side-navigation"
                applicationName={
                  proposed ? "Proposed navigation" : "Current navigation"
                }
                keyboardShortcut={false}
                style={
                  proposed ? { paddingInline: "var(--grid-margin)" } : undefined
                }
                root={{
                  key: "root",
                  items: [
                    {
                      key: "group",
                      label: "Workspace",
                      items: [
                        { key: "one", label: "Overview" },
                        { key: "two", label: "Resources" },
                      ],
                    },
                  ],
                }}
                footerRoot={{ key: "footer", items: [{ label: "Settings" }] }}
              />
            ))}
          </Measure>
          <p className="surfaces-caption">
            Current outer inline inset 8px; proposed grid margin 32px. Row
            keylines remain derived from their own inset. Major block edges
            remain current.
          </p>
          <h3>Native overlays · current / proposed</h3>
          <Measure label={`${tier}-overlays`}>
            <div className="grid surfaces-reference">
              <Reference />
            </div>
            {(["modal", "panel"] as const).flatMap((kind) =>
              [false, true].map((proposed) => (
                <Overlay
                  key={`${kind}-${proposed}`}
                  kind={kind}
                  proposed={proposed}
                  tier={tier}
                />
              )),
            )}
          </Measure>
          <p className="surfaces-caption">
            Open public Modal or SidePanel to inspect native overlay
            construction. Current inline gutter 24px; proposed grid margin 32px
            (+33%). Divided header/footer and scrollable content keep current
            block padding. Top-layer / viewport positioning has no shared page
            baseline.
          </p>
        </section>
      ))}
    </main>
  );
}
export const Surfaces: Story = { render: () => <Page /> };
