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
  useCallback,
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

function Reference({
  proposed = false,
  varied = false,
  withoutImage = false,
}: {
  proposed?: boolean;
  varied?: boolean;
  withoutImage?: boolean;
}) {
  return (
    <Card
      data-owner="card"
      className={proposed ? "surfaces-card-proposed" : undefined}
      data-variant={proposed ? "proposed" : "current"}
    >
      {!withoutImage && <Card.Image src={image} alt="Full-width image band" />}
      <Card.Header>
        <span data-seat>
          {varied ? "Surface heading with more detail" : "Surface heading"}
        </span>
      </Card.Header>
      <Card.Content>
        <p className="p">
          {varied
            ? "Comparable body copy with additional information that wraps naturally inside the same reading width."
            : "Comparable body copy."}
        </p>
        <div className="surfaces-inner-scroll" data-scroll-owner>
          <pre>Wide content stays inside its named inner scroll region.</pre>
        </div>
      </Card.Content>
      <Card.Footer>
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

type CardSummary = {
  viewport: number;
  cards: {
    variant: string | undefined;
    imageWidth: number | null;
    seam: number | null;
  }[];
};
function Measure({
  children,
  label,
  onSummary,
}: {
  children: ReactNode;
  label: string;
  onSummary?: (label: string, summary: CardSummary) => void;
}) {
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
          fixtureContainment: node.matches(".surfaces-nav-fixture")
            ? "Comparison-row rail containment overrides viewport takeover only; padding and all public slots are retained."
            : null,
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
              majorInline:
                "--surfaces-preview-grid-margin (viewport prototype only)",
              cardSectionGap:
                "--ds-spacing-group (Card owner and matching subgrid parent carrier)",
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
            proposedGridMargin: css
              .getPropertyValue("--surfaces-preview-grid-margin")
              .trim(),
            cardSectionGap: css.getPropertyValue("--ds-spacing-group").trim(),
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
          variant: card.dataset.variant,
          parentRows: getComputedStyle(card.parentElement as HTMLElement)
            .gridTemplateRows,
          parentGap: getComputedStyle(card.parentElement as HTMLElement).rowGap,
          framePadding: getComputedStyle(card).padding,
          sectionRects: [...card.children].map((child) => ({
            top:
              child.getBoundingClientRect().top -
              card.getBoundingClientRect().top,
            bottom:
              child.getBoundingClientRect().bottom -
              card.getBoundingClientRect().top,
          })),
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
          imageTopInset: picture
            ? picture.getBoundingClientRect().top -
              card.getBoundingClientRect().top
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
          node.matches('[data-owner="side-navigation"]') &&
          getComputedStyle(node).position === "fixed"
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
      onSummary?.(label, { viewport: window.innerWidth, cards });
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
  }, [label, onSummary]);
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

type OpenOverlaySnapshot = {
  viewport: number;
  tier: Tier;
  state: "open";
  nativeModal: boolean;
  position: string;
  zIndex: string;
  background: string;
  productionGridMargin: string;
  proposedGridMargin: string;
  width: number;
  parts: {
    name: string;
    paddingInline: string;
    paddingBlock: string;
    marginInline: string;
    overflow: string;
    clientWidth: number;
    scrollWidth: number;
  }[];
};
type OverlayReading = {
  name: string;
  state: "open" | "closed";
  current: OpenOverlaySnapshot | null;
  lastOpen: OpenOverlaySnapshot | null;
};

function Overlay({
  kind,
  proposed,
  tier,
  onReading,
}: {
  kind: "modal" | "panel";
  proposed: boolean;
  tier: Tier;
  onReading: (name: string, reading: OverlayReading) => void;
}) {
  const modal = useRef<HTMLDialogElement>(null);
  const panel = useRef<SidePanelHandle>(null);
  const name = `${tier} ${kind} ${proposed ? "proposed" : "current"}`;
  const [diagnostic, setDiagnostic] = useState<OverlayReading | null>(null);
  const refreshReading = useRef<(() => void) | null>(null);
  useEffect(() => {
    let alive = true;
    let animation = 0;
    let lastOpen: OpenOverlaySnapshot | null = null;
    let previous = "";
    const refresh = () => {
      if (!alive) return;
      const dialog = kind === "modal" ? modal.current : panel.current?.element;
      if (dialog) {
        let current: OpenOverlaySnapshot | null = null;
        if (dialog.open) {
          const css = getComputedStyle(dialog);
          current = {
            viewport: window.innerWidth,
            tier,
            state: "open",
            nativeModal: dialog.matches(":modal"),
            position: css.position,
            zIndex: css.zIndex,
            background: css.backgroundColor,
            productionGridMargin: css.getPropertyValue("--grid-margin").trim(),
            proposedGridMargin: css
              .getPropertyValue("--surfaces-preview-grid-margin")
              .trim(),
            width: dialog.getBoundingClientRect().width,
            parts: [
              ...dialog.querySelectorAll<HTMLElement>(
                ".modal-header,.modal-content,.modal-footer,.side-panel-header,.side-panel-content,.side-panel-footer,[data-scroll-owner]",
              ),
            ].map((node) => {
              const style = getComputedStyle(node);
              return {
                name: node.className,
                paddingInline: style.paddingInline,
                paddingBlock: style.paddingBlock,
                marginInline: style.marginInline,
                overflow: style.overflow,
                clientWidth: node.clientWidth,
                scrollWidth: node.scrollWidth,
              };
            }),
          };
          lastOpen = current;
        }
        const reading: OverlayReading = {
          name,
          state: dialog.open ? "open" : "closed",
          current,
          lastOpen,
        };
        const serialized = JSON.stringify(reading);
        if (serialized !== previous) {
          previous = serialized;
          setDiagnostic(reading);
          onReading(name, reading);
        }
      }
    };
    refreshReading.current = refresh;
    const animate = () => {
      refresh();
      if (alive) animation = requestAnimationFrame(animate);
    };
    refresh();
    animation = requestAnimationFrame(animate);
    const observedDialog =
      kind === "modal" ? modal.current : panel.current?.element;
    const openObserver = new MutationObserver(refresh);
    if (observedDialog)
      openObserver.observe(observedDialog, {
        attributes: true,
        attributeFilter: ["open"],
      });
    const sizeObserver = new ResizeObserver(refresh);
    if (observedDialog) {
      sizeObserver.observe(observedDialog);
      for (const node of observedDialog.querySelectorAll<HTMLElement>(
        "[data-scroll-owner]",
      ))
        sizeObserver.observe(node);
    }
    window.addEventListener("resize", refresh);
    void document.fonts.ready.then(refresh);
    return () => {
      alive = false;
      cancelAnimationFrame(animation);
      openObserver.disconnect();
      sizeObserver.disconnect();
      window.removeEventListener("resize", refresh);
      refreshReading.current = null;
    };
  }, [kind, name, tier, onReading]);
  const style = (
    proposed
      ? kind === "modal"
        ? {
            "--modal-padding-inline": "var(--surfaces-preview-grid-margin)",
            "--modal-header-padding-inline": "var(--modal-padding-inline)",
            "--modal-content-padding-inline": "var(--modal-padding-inline)",
            "--modal-footer-padding-inline": "var(--modal-padding-inline)",
          }
        : {
            "--side-panel-padding-inline":
              "var(--surfaces-preview-grid-margin)",
          }
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
      <output
        hidden
        data-overlay-reading={name}
        data-overlay-state={diagnostic?.state}
        data-overlay-viewport={diagnostic?.current?.viewport}
      >
        {JSON.stringify(diagnostic)}
      </output>
      <Button
        onClick={() => {
          if (kind === "modal") modal.current?.showModal();
          else panel.current?.open();
          refreshReading.current?.();
        }}
      >
        {name}
      </Button>
      {kind === "modal" ? (
        <Modal
          ref={modal}
          data-owner="modal"
          className={`${tier} comfortable`}
          style={style}
          onClose={() => refreshReading.current?.()}
        >
          <Modal.Header>{name}</Modal.Header>
          <Modal.Content>{body}</Modal.Content>
          <Modal.Footer>
            <Button
              onClick={() => {
                modal.current?.close();
                refreshReading.current?.();
              }}
            >
              Close
            </Button>
            <Button importance="secondary">Continue</Button>
          </Modal.Footer>
        </Modal>
      ) : (
        <SidePanel
          ref={panel}
          data-owner="side-panel"
          className={`${tier} comfortable`}
          style={style}
          onClose={() => refreshReading.current?.()}
        >
          <SidePanel.Header>{name}</SidePanel.Header>
          <SidePanel.Content>{body}</SidePanel.Content>
          <SidePanel.Footer>
            <Button
              onClick={() => {
                panel.current?.close();
                refreshReading.current?.();
              }}
            >
              Close
            </Button>
            <Button importance="secondary">Continue</Button>
          </SidePanel.Footer>
        </SidePanel>
      )}
    </div>
  );
}

function Page() {
  const [viewport, setViewport] = useState<number | null>(null);
  const [readings, setReadings] = useState<Record<string, OverlayReading>>({});
  const [cardReadings, setCardReadings] = useState<Record<string, CardSummary>>(
    {},
  );
  const onSummary = useCallback(
    (label: string, summary: CardSummary) =>
      setCardReadings((previous) =>
        JSON.stringify(previous[label]) === JSON.stringify(summary)
          ? previous
          : { ...previous, [label]: summary },
      ),
    [],
  );
  const onReading = useCallback(
    (name: string, reading: OverlayReading) =>
      setReadings((previous) => ({ ...previous, [name]: reading })),
    [],
  );
  useEffect(() => {
    const refresh = () => setViewport(window.innerWidth);
    refresh();
    window.addEventListener("resize", refresh);
    return () => window.removeEventListener("resize", refresh);
  }, []);
  const overlayCaption = (tier: Tier, kind: "modal" | "panel") => {
    const current = readings[`${tier} ${kind} current`]?.lastOpen;
    const proposed = readings[`${tier} ${kind} proposed`]?.lastOpen;
    if (!current || !proposed)
      return `Open both ${kind} variants to retain their measured comparison.`;
    if (current.viewport !== proposed.viewport || current.viewport !== viewport)
      return `${kind === "modal" ? "Modal" : "SidePanel"} snapshots were captured at ${current.viewport}px / ${proposed.viewport}px. Reopen both at the current ${viewport}px viewport to compare their gutters.`;
    const currentHeader = current.parts[0];
    const proposedHeader = proposed.parts[0];
    const footer = proposed.parts.find((part) => part.name.includes("footer"));
    return `${kind === "modal" ? "Modal" : "SidePanel"} last-open snapshots: inline padding ${currentHeader?.paddingInline} at ${current.viewport}px → ${proposedHeader?.paddingInline} at ${proposed.viewport}px. ${kind === "panel" ? `Proposed Footer uses ${footer?.marginInline} inline margins, with ${footer?.paddingInline} padding.` : "Header, Content and Footer share the gutter."} Closed geometry is unavailable; snapshots remain labelled with their captured viewport.`;
  };
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
          <Measure label={`${tier}-standard`} onSummary={onSummary}>
            {[false, true].map((proposed) => (
              <div
                key={String(proposed)}
                className={`grid surfaces-cards ${proposed ? "surfaces-cards-proposed" : "surfaces-cards-current"}`}
              >
                <Cards
                  data-owner={proposed ? "cards-proposed" : "cards-current"}
                >
                  <Reference proposed={proposed} />
                  <Reference proposed={proposed} varied withoutImage />
                </Cards>
              </div>
            ))}
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
            Card first: separate current and proposed public Cards groups, each
            sharing four tracks across short and varied content. Current section
            insets and parent gap stay shipped. Proposed Image consumes the top
            edge and stays full bleed; frame end inset is 16/12px, section
            inline insets 16/12px and block padding zero. Card owns 24/20px
            section gaps; its public Cards parent uses the same alias to keep
            inherited tracks coherent. The image-less varied Card retains frame
            start and end insets of 16/12px and the shared reserved Image track.
            Shared-track stretch is measured within each variant only. Prototype
            anatomy pending O3; no production Card or Tile change.
          </p>
          {cardReadings[`${tier}-standard`] && (
            <p className="surfaces-caption">
              At {cardReadings[`${tier}-standard`].viewport}px, current →
              proposed Image width is{" "}
              {cardReadings[`${tier}-standard`].cards[0]?.imageWidth?.toFixed(
                2,
              )}{" "}
              →{" "}
              {cardReadings[`${tier}-standard`].cards[2]?.imageWidth?.toFixed(
                2,
              )}
              px; physical section seam is{" "}
              {cardReadings[`${tier}-standard`].cards[0]?.seam?.toFixed(2)} →{" "}
              {cardReadings[`${tier}-standard`].cards[2]?.seam?.toFixed(2)}px.
              Each pair shares its own tracks; the other variant cannot size
              them.
            </p>
          )}
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
                className="surfaces-nav-fixture"
                defaultExpanded={true}
                data-owner="side-navigation"
                applicationName={
                  proposed ? "Proposed navigation" : "Current navigation"
                }
                keyboardShortcut={false}
                style={
                  proposed
                    ? { paddingInline: "var(--surfaces-preview-grid-margin)" }
                    : undefined
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
            Current outer inline inset 8px; proposed viewport grid margin is
            {viewport === null
              ? " awaiting measurement"
              : ` ${viewport < 620 ? 16 : viewport < 1036 ? 24 : 32}px at ${viewport}px`}
            . Row keylines remain derived from their own inset. Major block
            edges remain current. Both public rails are contained in this row at
            narrow widths, overriding viewport takeover only; product padding
            and all Header, Content and Footer slots are retained. Rails start
            expanded and keep their expand/collapse controls.
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
                  onReading={onReading}
                />
              )),
            )}
          </Measure>
          <p className="surfaces-caption">
            Open public Modal or SidePanel to inspect native overlay
            construction. Current inline gutter 24px; proposed viewport grid
            margin is 16px below 620, 24px from 620, and 32px from 1036. Divided
            header/footer and scrollable content keep current block padding.
            Top-layer / viewport positioning has no shared page baseline.
          </p>
          <p className="surfaces-caption">
            {overlayCaption(tier, "modal")} {overlayCaption(tier, "panel")}
          </p>
        </section>
      ))}
    </main>
  );
}
export const Surfaces: Story = { render: () => <Page /> };

// Public shipped control: no preview class or candidate style on any owner.
function ShippedPair({ tier }: { tier: Tier }) {
  const ref = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<unknown>(null);
  useEffect(() => {
    const measure = () => {
      const host = ref.current;
      if (!host) return;
      setMetrics({
        tier,
        viewport: window.innerWidth,
        groupRows: getComputedStyle(host.querySelector(".cards") as HTMLElement)
          .gridTemplateRows,
        cards: [...host.querySelectorAll<HTMLElement>(".card")].map((card) => ({
          width: card.getBoundingClientRect().width,
          height: card.getBoundingClientRect().height,
          rows: getComputedStyle(card).gridTemplateRows,
          padding: getComputedStyle(card).padding,
          image: card.querySelector("img")
            ? {
                width: card.querySelector("img")?.getBoundingClientRect().width,
                height: card.querySelector("img")?.getBoundingClientRect()
                  .height,
              }
            : null,
          sections: [...card.children].map((node) => ({
            className: node.className,
            width: node.getBoundingClientRect().width,
            height: node.getBoundingClientRect().height,
            top:
              node.getBoundingClientRect().top -
              card.getBoundingClientRect().top,
            padding: getComputedStyle(node).padding,
          })),
        })),
      });
    };
    void document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [tier]);
  return (
    <section
      className={`${tier} comfortable surface`}
      style={{
        padding: 16,
        background: "var(--surface-color-background)",
        color: "var(--surface-color-text)",
        overflowX: "auto",
      }}
    >
      <h2>{tier} · isolated shipped Cards pair</h2>
      <div
        ref={ref}
        className="grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,16rem)",
          gap: "var(--grid-gutter)",
          inlineSize: "max-content",
        }}
      >
        <Cards>
          <Reference />
          <Reference varied withoutImage />
        </Cards>
      </div>
      <output hidden data-shipped-current={tier}>
        {JSON.stringify(metrics)}
      </output>
    </section>
  );
}
export const ShippedCurrentReference: Story = {
  render: () => (
    <main>
      {tiers.map((tier) => (
        <ShippedPair key={tier} tier={tier} />
      ))}
    </main>
  ),
};
