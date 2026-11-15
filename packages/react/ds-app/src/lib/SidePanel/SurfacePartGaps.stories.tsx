import { Button, Card, Cards, Tile } from "@canonical/react-ds-global";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import SidePanel from "./Provider.js";
import type { SidePanelHandle } from "./types.js";

const contexts = ["default", "global", "site", "docs", "app", "os"] as const;
const directions = ["ltr", "rtl"] as const;
const sizes = [14, 16, 20] as const;

function Units() {
  return (
    <>
      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
      >
        <Cards>
          {[
            "Short heading",
            "A longer heading that wraps onto several lines",
          ].map((heading) => (
            <Card key={heading}>
              <Card.Header>
                <span style={{ maxInlineSize: "8rem" }}>{heading}</span>
              </Card.Header>
              <Card.Content>
                <span>First</span>
                <span>Second</span>
              </Card.Content>
              <Card.Footer>
                <span>Footer</span>
              </Card.Footer>
            </Card>
          ))}
        </Cards>
      </div>
      <Tile>
        <Tile.Header>Tile heading</Tile.Header>
        <Tile.Content>
          <span>First</span>
          <span>Second</span>
        </Tile.Content>
      </Tile>
    </>
  );
}

function Panel({
  onHandle,
}: {
  onHandle: (handle: SidePanelHandle | null) => void;
}) {
  return (
    <SidePanel ref={onHandle}>
      <SidePanel.Header>Actions</SidePanel.Header>
      <SidePanel.Content>
        <div style={{ minBlockSize: "1600px" }}>Scrollable content</div>
      </SidePanel.Content>
      <SidePanel.Footer>
        {[1, 2, 3, 4].map((i) => (
          <Button key={i} style={{ inlineSize: "60px" }}>
            A{i}
          </Button>
        ))}
      </SidePanel.Footer>
    </SidePanel>
  );
}

function Fixture() {
  const handles = useRef<(SidePanelHandle | null)[]>([]);
  useEffect(() => {
    const focus = document.activeElement;
    for (const handle of handles.current) handle?.open();
    if (focus instanceof HTMLElement) focus.focus();
  }, []);
  return createPortal(
    <main data-surface-gap-proof="">
      {contexts.flatMap((context, index) =>
        directions.map((direction, dirIndex) => (
          <section
            key={`${context}-${direction}`}
            className={context === "default" ? undefined : context}
            dir={direction}
            data-gap-case={`${context}-${direction}`}
            data-product={context}
            style={
              {
                "--side-panel-transition-duration": "0ms",
                "--side-panel-inline-size": "240px",
                "--side-panel-padding-inline": "16px",
              } as React.CSSProperties
            }
          >
            <Units />
            <Panel
              onHandle={(handle) => {
                handles.current[index * 2 + dirIndex] = handle;
              }}
            />
          </section>
        )),
      )}
      <section className="site" data-outer="">
        <section
          className="app"
          data-nested=""
          data-product="app"
          style={
            {
              "--side-panel-transition-duration": "0ms",
              "--side-panel-inline-size": "240px",
              "--side-panel-padding-inline": "16px",
            } as React.CSSProperties
          }
        >
          <Units />
          <Panel
            onHandle={(handle) => {
              handles.current[12] = handle;
            }}
          />
        </section>
      </section>
    </main>,
    document.body,
  );
}

const meta = {
  title: "Components/SidePanel/Surface part gap proof",
  component: Fixture,
} satisfies Meta<typeof Fixture>;
export default meta;
type Story = StoryObj<typeof meta>;

export const DirectionalGaps: Story = {
  tags: ["!autodocs"],
  play: async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument;
    const win = doc.defaultView;
    const proof = doc.querySelector<HTMLElement>("[data-surface-gap-proof]");
    if (!win || !proof) throw new Error("missing surface gap proof");
    const root = doc.documentElement;
    const originalRootStyle = root.getAttribute("style");
    const originalFocus = doc.activeElement;
    const styles = new Map<HTMLElement, string | null>();
    const save = (node: HTMLElement) => {
      if (!styles.has(node)) styles.set(node, node.getAttribute("style"));
    };
    const frame = async () => {
      await new Promise<void>((resolve) =>
        win.requestAnimationFrame(() =>
          win.requestAnimationFrame(() => resolve()),
        ),
      );
    };
    const px = (value: string, label: string) => {
      const n = Number.parseFloat(value);
      if (!Number.isFinite(n)) throw new Error(`${label}: non-finite ${value}`);
      return n;
    };
    const near = (a: number, b: number, label: string) => {
      if (!Number.isFinite(a) || !Number.isFinite(b) || Math.abs(a - b) > 0.6)
        throw new Error(`${label}: expected ${b}, received ${a}`);
    };
    let configurations = 0;
    let owners = 0;
    let extras = 0;
    let mutationOwners = 0;
    const get = (fixture: Element) => {
      const cards = Array.from(
        fixture.querySelectorAll<HTMLElement>(".ds.card-content"),
      );
      const card = cards[0];
      const tile = fixture.querySelector<HTMLElement>(".ds.tile-content");
      const footer = fixture.querySelector<HTMLElement>(
        ".ds.side-panel-footer",
      );
      const panel = fixture.querySelector<HTMLDialogElement>(".ds.side-panel");
      const pane = fixture.querySelector<HTMLElement>(".ds.side-panel-content");
      if (!card || cards.length !== 2 || !tile || !footer || !panel || !pane)
        throw new Error("missing real surface owners");
      return { card, cards, tile, footer, panel, pane };
    };
    const block = (node: HTMLElement, expected: number, label: string) => {
      const children = node.children;
      if (children.length !== 2 || !children[0] || !children[1])
        throw new Error(`${label}: missing fields`);
      near(
        px(win.getComputedStyle(node).rowGap, label),
        expected,
        `${label} computed block`,
      );
      near(
        children[1].getBoundingClientRect().top -
          children[0].getBoundingClientRect().bottom,
        expected,
        `${label} physical block`,
      );
    };
    const footerCheck = (
      footer: HTMLElement,
      row: number,
      col: number,
      direction: string,
      label: string,
    ) => {
      const style = win.getComputedStyle(footer);
      near(px(style.rowGap, label), row, `${label} row`);
      near(px(style.columnGap, label), col, `${label} column`);
      const buttons = Array.from(footer.querySelectorAll("button"));
      if (buttons.length !== 4 || !buttons[0] || !buttons[1] || !buttons[3])
        throw new Error(`${label}: missing actions`);
      const a = buttons[0].getBoundingClientRect(),
        b = buttons[1].getBoundingClientRect(),
        last = buttons[3].getBoundingClientRect();
      near(a.top, b.top, `${label} first action row`);
      near(
        direction === "ltr" ? b.left - a.right : a.left - b.right,
        col,
        `${label} physical column`,
      );
      if (last.top <= a.top) throw new Error(`${label}: actions did not wrap`);
      const endMargin = px(
        win.getComputedStyle(buttons[0]).marginBottom,
        label,
      );
      const startMargin = px(win.getComputedStyle(buttons[3]).marginTop, label);
      near(
        last.top - a.bottom,
        row + endMargin + startMargin,
        `${label} physical occupied row`,
      );
    };
    const check = (
      fixture: HTMLElement,
      blockValue: number,
      inlineValue: number,
      row: number,
      direction: string,
      label: string,
    ) => {
      const { card, cards, tile, footer, panel, pane } = get(fixture);
      if (!panel.open || win.getComputedStyle(panel).display !== "flex")
        throw new Error(`${label}: panel closed`);
      for (const [index, owner] of cards.entries())
        block(owner, blockValue, `${label} Card ${index + 1}`);
      block(tile, blockValue, `${label} Tile`);
      footerCheck(footer, row, inlineValue, direction, `${label} Footer`);
      const ps = win.getComputedStyle(pane);
      if (ps.overflowY !== "auto" || pane.scrollHeight <= pane.clientHeight)
        throw new Error(`${label}: pane does not scroll`);
      near(px(ps.borderBlockStartWidth, label), 2, `${label} start border`);
      near(px(ps.borderBlockEndWidth, label), 2, `${label} end border`);
      const size = px(win.getComputedStyle(root).fontSize, label);
      const product = fixture.dataset["product"];
      const standard =
        size *
        (product === "docs" || product === "app"
          ? 0.75
          : product === "os"
            ? 0.5
            : 1);
      const group =
        size * (product === "docs" || product === "app" ? 1.25 : 1.5);
      const frames = cards.map((owner) => {
        if (!owner.parentElement)
          throw new Error(`${label}: missing Card frame`);
        return owner.parentElement;
      });
      if (!tile.parentElement) throw new Error(`${label}: missing Tile frame`);
      for (const owner of [...frames, tile.parentElement]) {
        const s = win.getComputedStyle(owner);
        near(
          px(s.paddingBlockStart, label),
          standard,
          `${label} frame start inset`,
        );
        near(
          px(s.paddingBlockEnd, label),
          standard,
          `${label} frame end inset`,
        );
        near(px(s.rowGap, label), group, `${label} frame group gap`);
      }
      for (const owner of cards) {
        const s = win.getComputedStyle(owner);
        near(
          px(s.paddingInlineStart, label),
          standard,
          `${label} Card inline inset`,
        );
        near(px(s.paddingBlockStart, label), 0, `${label} Card section start`);
        near(px(s.paddingBlockEnd, label), 0, `${label} Card section end`);
      }
      const tileStyle = win.getComputedStyle(tile);
      for (const edge of [
        tileStyle.paddingBlockStart,
        tileStyle.paddingBlockEnd,
        tileStyle.paddingInlineStart,
        tileStyle.paddingInlineEnd,
      ])
        near(px(edge, label), 0, `${label} Tile section inset`);
      for (const frame of frames)
        if (!win.getComputedStyle(frame).gridTemplateRows.startsWith("subgrid"))
          throw new Error(`${label}: Card lost row subgrid`);
      near(
        cards[0]?.getBoundingClientRect().top ?? NaN,
        cards[1]?.getBoundingClientRect().top ?? NaN,
        `${label} shared content track`,
      );
      const footers = frames.map((frame) =>
        frame.querySelector<HTMLElement>(".ds.card-footer"),
      );
      if (!footers[0] || !footers[1])
        throw new Error(`${label}: missing Card footers`);
      near(
        footers[0].getBoundingClientRect().top,
        footers[1].getBoundingClientRect().top,
        `${label} shared footer track`,
      );
      for (const [index, frame] of frames.entries()) {
        const header = frame.querySelector<HTMLElement>(".ds.card-header");
        const content = cards[index];
        const end = footers[index];
        if (!header || !content || !end)
          throw new Error(`${label}: missing Card sections`);
        near(
          content.getBoundingClientRect().top -
            header.getBoundingClientRect().bottom,
          group,
          `${label} Card header/content group`,
        );
        near(
          end.getBoundingClientRect().top -
            content.getBoundingClientRect().bottom,
          group,
          `${label} Card content/footer group`,
        );
      }
      const tileHeader =
        tile.parentElement.querySelector<HTMLElement>(".ds.tile-header");
      if (!tileHeader) throw new Error(`${label}: missing Tile header`);
      near(
        tile.getBoundingClientRect().top -
          tileHeader.getBoundingClientRect().bottom,
        group,
        `${label} Tile group`,
      );
      return cards.length + 2;
    };
    proof.dataset["surfaceGapProof"] = "running";
    let failed = false;
    let failure: unknown;
    try {
      await doc.fonts.ready;
      await frame();
      for (const size of sizes) {
        root.style.fontSize = `${size}px`;
        await frame();
        for (const context of contexts)
          for (const direction of directions) {
            const fixture = proof.querySelector<HTMLElement>(
              `[data-gap-case="${context}-${direction}"]`,
            );
            if (!fixture) throw new Error("missing matrix case");
            const blockValue =
              size *
              (context === "default" ||
              context === "global" ||
              context === "site"
                ? 0.5
                : 0.25);
            const inlineValue = size * (context === "os" ? 0.25 : 0.5);
            owners += check(
              fixture,
              blockValue,
              inlineValue,
              size,
              direction,
              `${context}-${direction}-${size}`,
            );
            configurations += 1;
          }
      }
      root.style.fontSize = "16px";
      await frame();
      const fixture = proof.querySelector<HTMLElement>(
        '[data-gap-case="site-ltr"]',
      );
      const nested = proof.querySelector<HTMLElement>("[data-nested]");
      const outer = proof.querySelector<HTMLElement>("[data-outer]");
      if (!fixture || !nested || !outer)
        throw new Error("missing mutation case");
      const { card, cards, tile, footer, pane, panel } = get(fixture);
      for (const node of [fixture, ...cards, tile, footer, outer]) save(node);
      const hooks = [
        "--card-content-gap",
        "--tile-content-gap",
        "--side-panel-footer-gap",
      ];
      for (const hook of hooks)
        root.style.setProperty(
          hook,
          hook === "--side-panel-footer-gap" ? "7px 9px" : "5px",
        );
      mutationOwners += check(fixture, 5, 9, 7, "ltr", "root hooks");
      extras += 1;
      for (const hook of hooks) root.style.setProperty(hook, "0px");
      mutationOwners += check(fixture, 0, 0, 0, "ltr", "root zero hooks");
      extras += 1;
      for (const hook of hooks) root.style.removeProperty(hook);
      mutationOwners += check(fixture, 8, 8, 16, "ltr", "root hooks removed");
      extras += 1;
      const frameBefore = [
        win.getComputedStyle(panel).padding,
        win.getComputedStyle(card).padding,
        win.getComputedStyle(tile.parentElement as Element).padding,
        win.getComputedStyle(pane).padding,
      ];
      fixture.style.setProperty("--ds-spacing-item-block", "13px");
      mutationOwners += check(fixture, 13, 8, 16, "ltr", "block mutation");
      extras += 1;
      fixture.style.removeProperty("--ds-spacing-item-block");
      fixture.style.setProperty("--ds-spacing-item-inline", "11px");
      mutationOwners += check(fixture, 8, 11, 16, "ltr", "inline mutation");
      extras += 1;
      outer.style.setProperty("--ds-spacing-item-block", "23px");
      outer.style.setProperty("--ds-spacing-item-inline", "29px");
      const diagnostic = doc.createElement("i");
      diagnostic.style.cssText =
        "display:block;inline-size:var(--ds-spacing-item-inline);block-size:var(--ds-spacing-item-block)";
      outer.prepend(diagnostic);
      try {
        near(
          diagnostic.getBoundingClientRect().width,
          29,
          "outer inline positive control",
        );
        near(
          diagnostic.getBoundingClientRect().height,
          23,
          "outer block positive control",
        );
        mutationOwners += check(nested, 4, 8, 16, "ltr", "nested App reset");
        extras += 1;
      } finally {
        diagnostic.remove();
      }
      fixture.style.setProperty("--card-content-gap", "5px");
      fixture.style.setProperty("--tile-content-gap", "5px");
      fixture.style.setProperty("--side-panel-footer-gap", "7px 9px");
      mutationOwners += check(
        fixture,
        5,
        9,
        7,
        "ltr",
        "ancestor two-value hooks",
      );
      extras += 1;
      // Tile has an independent hook.
      fixture.style.setProperty("--tile-content-gap", "6px");
      block(tile, 6, "Tile ancestor hook");
      mutationOwners += 1;
      extras += 1;
      for (const hook of hooks) fixture.style.setProperty(hook, "0px");
      mutationOwners += check(fixture, 0, 0, 0, "ltr", "ancestor zero hooks");
      extras += 1;
      for (const owner of cards)
        owner.style.setProperty("--card-content-gap", "3px");
      tile.style.setProperty("--tile-content-gap", "3px");
      footer.style.setProperty("--side-panel-footer-gap", "5px 7px");
      mutationOwners += check(fixture, 3, 7, 5, "ltr", "local two-value hooks");
      extras += 1;
      footer.style.setProperty("--side-panel-footer-gap", "6px");
      mutationOwners += check(
        fixture,
        3,
        6,
        6,
        "ltr",
        "local single-value hook",
      );
      extras += 1;
      for (const owner of cards)
        owner.style.setProperty("--card-content-gap", "0px");
      tile.style.setProperty("--tile-content-gap", "0px");
      footer.style.setProperty("--side-panel-footer-gap", "0px");
      mutationOwners += check(fixture, 0, 0, 0, "ltr", "local zero hooks");
      extras += 1;
      const frameAfter = [
        win.getComputedStyle(panel).padding,
        win.getComputedStyle(card).padding,
        win.getComputedStyle(tile.parentElement as Element).padding,
        win.getComputedStyle(pane).padding,
      ];
      if (frameBefore.some((value, i) => value !== frameAfter[i]))
        throw new Error("frame or pane padding changed");
    } catch (error) {
      failed = true;
      failure = error;
    }
    try {
      for (const [node, style] of styles) {
        if (style === null) node.removeAttribute("style");
        else node.setAttribute("style", style);
      }
      if (originalRootStyle === null) root.removeAttribute("style");
      else root.setAttribute("style", originalRootStyle);
      if (originalFocus instanceof HTMLElement) originalFocus.focus();
      await frame();
    } catch (error) {
      if (!failed) {
        failed = true;
        failure = error;
      } else console.error("surface gap cleanup failed", error);
    }
    if (failed) {
      proof.dataset["surfaceGapProof"] = "error";
      proof.dataset["surfaceGapError"] = String(failure);
      throw failure;
    }
    proof.dataset["surfaceGapConfigurations"] = String(configurations);
    proof.dataset["surfaceGapOwners"] = String(owners);
    proof.dataset["surfaceGapMutationOwners"] = String(mutationOwners);
    proof.dataset["surfaceGapExtras"] = String(extras);
    proof.dataset["surfaceGapForcedColors"] = String(
      win.matchMedia("(forced-colors: active)").matches,
    );
    proof.dataset["surfaceGapProof"] = "passed";
  },
};
