import type { Meta, StoryObj } from "@storybook/react-vite";
import { createPortal } from "react-dom";
import Popover from "./Popover.js";

const contexts = ["default", "global", "site", "docs", "app", "os"] as const;
const directions = ["ltr", "rtl"] as const;
const sizes = [14, 16, 20] as const;

const meta = {
  title: "_work_in_progress/component/Popover/Compact spacing proof",
  component: Popover,
} satisfies Meta<typeof Popover>;
export default meta;
type Story = StoryObj<typeof meta>;

export const CompactSurface: Story = {
  args: { trigger: "Open", children: "Content" },
  tags: ["!autodocs"],
  render: () =>
    createPortal(
      <main data-compact-proof="" style={{ position: "absolute", inset: 0 }}>
        {contexts.flatMap((context) =>
          directions.map((direction) => (
            <section
              key={`${context}-${direction}`}
              className={context === "default" ? undefined : context}
              dir={direction}
              data-case={`${context}-${direction}`}
            >
              <Popover trigger="Open" open>
                <span
                  data-content-probe=""
                  style={{ display: "block", width: "20px", height: "10px" }}
                />
              </Popover>
            </section>
          )),
        )}
        <section className="site">
          <section className="app" data-nested="">
            <Popover trigger="Nested" open>
              <span
                data-content-probe=""
                style={{ display: "block", width: "20px", height: "10px" }}
              />
            </Popover>
          </section>
        </section>
        <section className="site">
          <table>
            <tbody>
              <tr>
                <td data-density-cell="">
                  <Popover trigger="Cell" open>
                    <span
                      data-content-probe=""
                      style={{
                        display: "block",
                        width: "20px",
                        height: "10px",
                      }}
                    />
                  </Popover>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
        <section className="site" data-wrapped="">
          <Popover trigger="Wrapped" open maxWidth="120px">
            <span data-wrapped-text="" style={{ display: "block" }}>
              This deliberately long message wraps across several lines inside
              the compact popover.
            </span>
          </Popover>
        </section>
        <section className="site" data-disclosure="">
          <Popover trigger="Toggle">Disclosure content</Popover>
        </section>
      </main>,
      document.body,
    ),
  play: async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument;
    const win = doc.defaultView;
    const proof = doc.querySelector<HTMLElement>("[data-compact-proof]");
    if (!win || !proof) throw new Error("missing compact proof root");
    proof.dataset["compactProof"] = "running";
    const forced = win.matchMedia("(forced-colors: active)").matches;
    const root = doc.documentElement;
    const originalRootStyle = root.getAttribute("style");
    const changed = new Map<HTMLElement, string | null>();
    const save = (node: HTMLElement) => {
      if (!changed.has(node)) changed.set(node, node.getAttribute("style"));
    };
    const frame = async () => {
      await new Promise<void>((resolve) =>
        win.requestAnimationFrame(() =>
          win.requestAnimationFrame(() => resolve()),
        ),
      );
    };
    const near = (actual: number, expected: number, label: string) => {
      if (Math.abs(actual - expected) > 0.6)
        throw new Error(`${label}: expected ${expected}, received ${actual}`);
    };
    const px = (value: string) => {
      const n = Number.parseFloat(value);
      if (!Number.isFinite(n)) throw new Error(`invalid length ${value}`);
      return n;
    };
    const parts = (container: Element) => {
      const details =
        container.querySelector<HTMLDetailsElement>("details.ds.popover");
      const content = details?.querySelector<HTMLElement>(":scope > .content");
      const child = content?.querySelector<HTMLElement>("[data-content-probe]");
      if (!details || !content || !child || content.parentElement !== details)
        throw new Error("missing direct Popover content");
      return { details, content, child };
    };
    let configurations = 0;
    let observations = 0;
    const check = (
      container: Element,
      block: number,
      inline: number,
      direction: string,
      label: string,
    ) => {
      const { details, content, child } = parts(container);
      const style = win.getComputedStyle(content);
      if (
        !details.open ||
        content.getAttribute("aria-hidden") !== "false" ||
        content.dataset["positioned"] !== "true" ||
        style.visibility !== "visible" ||
        style.position !== "fixed"
      )
        throw new Error(`${label}: content not open and positioned`);
      for (const [actual, expected, axis] of [
        [style.paddingBlockStart, block, "block-start"],
        [style.paddingBlockEnd, block, "block-end"],
        [style.paddingInlineStart, inline, "inline-start"],
        [style.paddingInlineEnd, inline, "inline-end"],
      ] as const)
        near(px(actual), expected, `${label} computed ${axis}`);
      const outer = content.getBoundingClientRect();
      const inner = child.getBoundingClientRect();
      near(
        inner.top - outer.top - px(style.borderTopWidth),
        block,
        `${label} physical block-start`,
      );
      near(
        outer.bottom - inner.bottom - px(style.borderBottomWidth),
        block,
        `${label} physical block-end`,
      );
      const left = inner.left - outer.left - px(style.borderLeftWidth);
      const right = outer.right - inner.right - px(style.borderRightWidth);
      near(
        direction === "ltr" ? left : right,
        inline,
        `${label} physical inline-start`,
      );
      near(
        direction === "ltr" ? right : left,
        inline,
        `${label} physical inline-end`,
      );
      observations += 1;
    };
    let failure: unknown;
    let failed = false;
    const disclosure = proof.querySelector<HTMLDetailsElement>(
      "[data-disclosure] details",
    );
    const originalOpen = disclosure?.open;
    try {
      await doc.fonts.ready;
      await frame();
      for (const size of sizes) {
        root.style.fontSize = `${size}px`;
        await frame();
        for (const context of contexts)
          for (const direction of directions) {
            const fixture = proof.querySelector<HTMLElement>(
              `[data-case="${context}-${direction}"]`,
            );
            if (!fixture) throw new Error("missing matrix fixture");
            const block =
              context === "docs" || context === "app" ? size / 4 : 0;
            const inline = size * (context === "os" ? 0.25 : 0.5);
            check(
              fixture,
              block,
              inline,
              direction,
              `${context}-${direction}-${size}`,
            );
            configurations += 1;
          }
      }
      root.style.fontSize = "16px";
      await frame();
      const fixture = proof.querySelector<HTMLElement>(
        '[data-case="site-ltr"]',
      );
      const nested = proof.querySelector<HTMLElement>("[data-nested]");
      if (!fixture || !nested) throw new Error("missing mutation fixtures");
      const { content } = parts(fixture);
      save(fixture);
      save(content);
      const outer = nested.parentElement;
      if (!outer) throw new Error("missing nested parent");
      save(outer);
      outer.style.setProperty(
        "--ds-spacing-inset-surface-compact-block",
        "23px",
      );
      outer.style.setProperty(
        "--ds-spacing-inset-surface-compact-inline",
        "29px",
      );
      check(nested, 4, 8, "ltr", "nested app boundary");
      root.style.setProperty("--popover-padding-vertical", "3px");
      root.style.setProperty("--popover-padding-horizontal", "6px");
      check(fixture, 3, 6, "ltr", "root hooks");
      root.style.removeProperty("--popover-padding-vertical");
      root.style.removeProperty("--popover-padding-horizontal");
      fixture.style.setProperty(
        "--ds-spacing-inset-surface-compact-block",
        "13px",
      );
      check(fixture, 13, 8, "ltr", "compact block input");
      fixture.style.removeProperty("--ds-spacing-inset-surface-compact-block");
      fixture.style.setProperty(
        "--ds-spacing-inset-surface-compact-inline",
        "17px",
      );
      check(fixture, 0, 17, "ltr", "compact inline input");
      check(nested, 4, 8, "ltr", "nested product reset");
      fixture.style.setProperty("--popover-padding-vertical", "5px");
      fixture.style.setProperty("--popover-padding-horizontal", "7px");
      check(fixture, 5, 7, "ltr", "ancestor hooks");
      content.style.setProperty("--popover-padding-vertical", "0px");
      content.style.setProperty("--popover-padding-horizontal", "0px");
      check(fixture, 0, 0, "ltr", "local zero hooks");
      content.style.setProperty("--popover-padding-vertical", "9px");
      content.style.setProperty("--popover-padding-horizontal", "11px");
      check(fixture, 9, 11, "ltr", "local nonzero hooks");
      content.style.removeProperty("--popover-padding-vertical");
      content.style.removeProperty("--popover-padding-horizontal");
      fixture.style.removeProperty("--popover-padding-vertical");
      fixture.style.removeProperty("--popover-padding-horizontal");
      fixture.style.removeProperty("--ds-spacing-inset-surface-compact-block");
      fixture.style.removeProperty("--ds-spacing-inset-surface-compact-inline");
      content.style.setProperty("--_density-inset-control-block", "19px");
      const diagnostic = doc.createElement("i");
      diagnostic.style.cssText =
        "display:block;position:absolute;inline-size:var(--_density-inset-control-block)";
      content.append(diagnostic);
      try {
        near(
          px(win.getComputedStyle(diagnostic).inlineSize),
          19,
          "density positive probe",
        );
        check(fixture, 0, 8, "ltr", "density isolation");
      } finally {
        diagnostic.remove();
      }
      const cell = proof.querySelector<HTMLElement>("[data-density-cell]");
      if (!cell) throw new Error("missing density cell");
      save(cell);
      cell.style.setProperty("--_spacing-inset-control-block-dense", "21px");
      const cellProbe = doc.createElement("i");
      cellProbe.style.cssText =
        "display:block;position:absolute;inline-size:var(--_density-inset-control-block)";
      cell.append(cellProbe);
      try {
        near(
          px(win.getComputedStyle(cellProbe).inlineSize),
          21,
          "actual cell density selection",
        );
        check(cell, 0, 8, "ltr", "actual cell density isolation");
      } finally {
        cellProbe.remove();
      }
      const wrapped = proof.querySelector<HTMLElement>(
        "[data-wrapped] .content",
      );
      const wrappedText = wrapped?.querySelector<HTMLElement>(
        "[data-wrapped-text]",
      );
      if (
        !wrapped ||
        !wrappedText ||
        wrapped.dataset["positioned"] !== "true" ||
        win.getComputedStyle(wrapped).visibility !== "visible"
      )
        throw new Error("wrapped Popover not visible and positioned");
      const range = doc.createRange();
      range.selectNodeContents(wrappedText);
      const lines = new Set(
        Array.from(range.getClientRects(), (rect) => Math.round(rect.top)),
      );
      range.detach();
      if (lines.size < 2) throw new Error("Popover body did not wrap");
      const bounds = wrapped.getBoundingClientRect();
      const wrappedStyle = win.getComputedStyle(wrapped);
      near(px(wrappedStyle.maxWidth), 120, "wrapped Popover max width");
      const inlineEdges =
        px(wrappedStyle.paddingLeft) +
        px(wrappedStyle.paddingRight) +
        px(wrappedStyle.borderLeftWidth) +
        px(wrappedStyle.borderRightWidth);
      if (bounds.width - inlineEdges > 120.6)
        throw new Error("wrapped Popover content exceeds its max width");
      if (
        bounds.left < -0.5 ||
        bounds.top < -0.5 ||
        bounds.right > win.innerWidth + 0.5 ||
        bounds.bottom > win.innerHeight + 0.5
      )
        throw new Error("wrapped Popover exceeds viewport");
      if (!disclosure) throw new Error("missing disclosure");
      const trigger = disclosure.querySelector<HTMLElement>("summary");
      const panel = disclosure.querySelector<HTMLElement>(":scope > .content");
      if (!trigger || !panel || disclosure.open)
        throw new Error("disclosure initial state");
      trigger.click();
      for (
        let i = 0;
        i < 20 &&
        (!disclosure.open ||
          panel.dataset["positioned"] !== "true" ||
          win.getComputedStyle(panel).visibility !== "visible");
        i += 1
      )
        await frame();
      if (
        !disclosure.open ||
        panel.getAttribute("aria-hidden") !== "false" ||
        panel.dataset["positioned"] !== "true" ||
        win.getComputedStyle(panel).visibility !== "visible"
      )
        throw new Error("disclosure did not open and position");
      trigger.click();
      await frame();
      if (disclosure.open || panel.getAttribute("aria-hidden") !== "true")
        throw new Error("disclosure did not close");
    } catch (error) {
      failed = true;
      failure = error;
    }
    try {
      for (const [node, style] of changed) {
        if (style === null) node.removeAttribute("style");
        else node.setAttribute("style", style);
      }
      if (originalRootStyle === null) root.removeAttribute("style");
      else root.setAttribute("style", originalRootStyle);
      if (
        disclosure &&
        originalOpen !== undefined &&
        disclosure.open !== originalOpen
      )
        disclosure.querySelector<HTMLElement>("summary")?.click();
      await frame();
    } catch (error) {
      if (!failed) {
        failed = true;
        failure = error;
      } else console.error("compact proof cleanup failed", error);
    }
    if (failed) {
      proof.dataset["compactProof"] = "error";
      proof.dataset["compactError"] = String(failure);
      throw failure;
    }
    proof.dataset["compactConfigurations"] = String(configurations);
    proof.dataset["compactObservations"] = String(observations);
    proof.dataset["compactForcedColors"] = String(forced);
    proof.dataset["compactProof"] = "passed";
  },
};
