import { Button, InlineCode, KeyboardKey } from "@canonical/react-ds-global";
import { Field, Form } from "@canonical/react-ds-global-form";
import { TokenTable } from "@canonical/react-tokens";
import "@canonical/react-ds-global-form/dist/esm/index.css";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { commentExample, diffExample } from "../GitDiffViewer/fixtures.js";
import { GitDiffViewer } from "../GitDiffViewer/index.js";
import { FileTree } from "./index.js";
import "./SpacingFieldInline.css";

const meta = {
  title: "Spacing buckets/03 Field inline",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Metrics = {
  paddingStart: number;
  paddingEnd: number;
  fieldRole: number;
  baseline: number | null;
  baselineKind: "browser-text" | "css-alignment";
  guideLeft: number;
  guideTop: number;
  guideWidth: number;
  occupiedEnd: number;
  structuralGutter: number | null;
  depthIndent: number | null;
  caretRoom: number | null;
  resetSlot: number | null;
  searchSlot: number | null;
  wrapperInsetStart: number;
  wrapperInsetEnd: number;
  labelKeyline: number;
  labelKeylineKind: "dom-text" | "content-edge-inferred" | "native-inferred";
  sharedLeft: number | null;
  sharedWidth: number | null;
};

const number = (value: string): number => Number.parseFloat(value) || 0;

const resolveLength = (
  owner: HTMLElement,
  value: string,
  style: CSSStyleDeclaration,
): number => {
  const tier = owner.closest<HTMLElement>(".site, .docs, .app") ?? owner;
  const probe = document.createElement("span");
  probe.className = "field-length-probe";
  probe.style.cssText = [
    "position:absolute",
    "visibility:hidden",
    "pointer-events:none",
    "block-size:0",
    `inline-size:${value}`,
    `font-family:${style.fontFamily}`,
    `font-size:${style.fontSize}`,
    `font-weight:${style.fontWeight}`,
    `line-height:${style.lineHeight}`,
  ].join(";");
  tier.append(probe);
  const result = probe.getBoundingClientRect().width;
  probe.remove();
  return result;
};

const readBrowserBaseline = (
  owner: HTMLElement,
  baselineOwner: HTMLElement,
  guideRect: DOMRect,
): number | null => {
  const style = getComputedStyle(baselineOwner);
  const needsTextFlowClone = /flex|grid/.test(style.display);
  if (
    !baselineOwner.matches("input, select, textarea") &&
    !needsTextFlowClone
  ) {
    const before = owner.getBoundingClientRect();
    const marker = document.createElement("span");
    marker.className = "field-baseline-marker";
    baselineOwner.append(marker);
    const markerTop = marker.getBoundingClientRect().top;
    const after = owner.getBoundingClientRect();
    marker.remove();
    if (
      Math.abs(before.width - after.width) < 0.05 &&
      Math.abs(before.height - after.height) < 0.05 &&
      Math.abs(before.top - after.top) < 0.05
    ) {
      return markerTop - guideRect.top;
    }
  }

  const tier = owner.closest<HTMLElement>(".site, .docs, .app") ?? owner;
  const baselineRect = baselineOwner.getBoundingClientRect();
  const rig = document.createElement("span");
  rig.className = "field-baseline-rig";
  const clone = baselineOwner.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("[id]").forEach((element) => {
    element.removeAttribute("id");
  });
  clone.removeAttribute("id");
  for (const property of style) {
    clone.style.setProperty(property, style.getPropertyValue(property));
  }
  clone.style.setProperty("inline-size", `${baselineRect.width}px`);
  clone.style.setProperty("block-size", `${baselineRect.height}px`);
  clone.style.setProperty("position", "static");
  clone.style.setProperty("inset", "auto");
  clone.style.setProperty("transform", "none");
  if (!needsTextFlowClone) {
    clone.style.setProperty("display", "inline-block");
    clone.style.setProperty("vertical-align", "baseline");
    clone.style.setProperty("align-self", "baseline");
  }
  const marker = document.createElement("span");
  marker.className = "field-baseline-marker";
  if (needsTextFlowClone) {
    const text = [...clone.childNodes].find(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
    );
    if (!text) return null;
    const textFlow = document.createElement("span");
    textFlow.textContent = text.textContent;
    textFlow.append(marker);
    text.replaceWith(textFlow);
    rig.append(clone);
  } else {
    rig.append(clone, marker);
  }
  tier.append(rig);
  const cloneRect = clone.getBoundingClientRect();
  const baseline =
    baselineRect.top -
    guideRect.top +
    marker.getBoundingClientRect().top -
    cloneRect.top;
  const faithfulSize =
    Math.abs(cloneRect.width - baselineRect.width) < 0.05 &&
    Math.abs(cloneRect.height - baselineRect.height) < 0.05;
  rig.remove();
  return faithfulSize && Number.isFinite(baseline) ? baseline : null;
};

const selectSelfOrDescendant = (
  owner: HTMLElement,
  selector: string | undefined,
): HTMLElement | null =>
  selector
    ? owner.matches(selector)
      ? owner
      : owner.querySelector<HTMLElement>(selector)
    : owner;

const readLabelKeyline = (
  baselineOwner: HTMLElement,
  guideRect: DOMRect,
): Pick<Metrics, "labelKeyline" | "labelKeylineKind"> => {
  const baselineRect = baselineOwner.getBoundingClientRect();
  const style = getComputedStyle(baselineOwner);
  if (baselineOwner.matches("input, select, textarea")) {
    return {
      labelKeyline:
        baselineRect.left + number(style.paddingInlineStart) - guideRect.left,
      labelKeylineKind: "native-inferred",
    };
  }
  const walker = document.createTreeWalker(baselineOwner, NodeFilter.SHOW_TEXT);
  let text = walker.nextNode();
  while (text && !text.textContent?.trim()) text = walker.nextNode();
  if (text) {
    const range = document.createRange();
    range.selectNodeContents(text);
    return {
      labelKeyline: range.getBoundingClientRect().left - guideRect.left,
      labelKeylineKind: "dom-text",
    };
  }
  return {
    labelKeyline:
      baselineRect.left +
      number(style.borderInlineStartWidth) +
      number(style.paddingInlineStart) -
      guideRect.left,
    labelKeylineKind: "content-edge-inferred",
  };
};

const Measured = ({
  label,
  children,
  ownerSelector,
  baselineSelector,
  seatSelector,
  reference = false,
  structuralSelector,
  depthSelector,
  hasCaret = false,
  resetSelector,
  searchSelector,
  baselineKind = "browser-text",
  guideSelector,
}: {
  label: string;
  children: React.ReactNode;
  ownerSelector: string;
  baselineSelector?: string;
  seatSelector?: string;
  reference?: boolean;
  structuralSelector?: string;
  depthSelector?: string;
  hasCaret?: boolean;
  resetSelector?: string;
  searchSelector?: string;
  baselineKind?: Metrics["baselineKind"];
  guideSelector?: string;
}) => {
  const root = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const owner = root.current?.querySelector<HTMLElement>(ownerSelector);
      if (!owner || getComputedStyle(owner).display === "none") return;
      const baselineOwner = selectSelfOrDescendant(owner, baselineSelector);
      const seat = selectSelfOrDescendant(owner, seatSelector);
      const guide = selectSelfOrDescendant(owner, guideSelector);
      if (!baselineOwner || !seat || !guide) return;
      const ownerRect = owner.getBoundingClientRect();
      const seatRect = seat.getBoundingClientRect();
      const guideRect = guide.getBoundingClientRect();
      const ownerStyle = getComputedStyle(owner);
      const seatStyle = getComputedStyle(seat);
      const fieldRole = resolveLength(
        owner,
        "var(--ds-spacing-field)",
        seatStyle,
      );
      const structural = structuralSelector
        ? (owner
            .closest("tr")
            ?.querySelector<HTMLElement>(structuralSelector) ??
          root.current?.querySelector<HTMLElement>(structuralSelector))
        : null;
      const depth = depthSelector
        ? selectSelfOrDescendant(owner, depthSelector)
        : null;
      const reset = resetSelector
        ? owner.querySelector<HTMLElement>(resetSelector)
        : null;
      const search = searchSelector
        ? owner.querySelector<HTMLElement>(searchSelector)
        : null;
      const keyline = readLabelKeyline(baselineOwner, guideRect);
      const next: Metrics = {
        paddingStart: number(seatStyle.paddingInlineStart),
        paddingEnd: number(seatStyle.paddingInlineEnd),
        fieldRole,
        baseline: readBrowserBaseline(owner, baselineOwner, guideRect),
        baselineKind,
        guideLeft: guideRect.left,
        guideTop: guideRect.top,
        guideWidth: guideRect.width,
        occupiedEnd:
          ownerRect.bottom + number(ownerStyle.marginBlockEnd) - guideRect.top,
        structuralGutter: structural?.getBoundingClientRect().width ?? null,
        depthIndent: depth?.getBoundingClientRect().width ?? null,
        caretRoom: hasCaret
          ? Math.max(0, number(seatStyle.paddingInlineEnd) - fieldRole)
          : null,
        resetSlot: reset?.getBoundingClientRect().width ?? null,
        searchSlot: search?.getBoundingClientRect().width ?? null,
        wrapperInsetStart: seatRect.left - ownerRect.left,
        wrapperInsetEnd: ownerRect.right - seatRect.right,
        ...keyline,
        sharedLeft: null,
        sharedWidth: null,
      };
      const localRect = root.current?.getBoundingClientRect();
      if (!localRect) return;
      next.guideLeft -= localRect.left;
      next.guideTop -= localRect.top;
      if (reference) {
        const row = root.current?.closest<HTMLElement>(".field-samples");
        if (row) {
          const rowRect = row.getBoundingClientRect();
          next.sharedLeft = rowRect.left - localRect.left;
          next.sharedWidth = row.scrollWidth;
        }
      }
      setMetrics(next);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => requestAnimationFrame(update));
    };
    const isGeneratedNode = (node: Node): boolean =>
      node instanceof Element &&
      (node.matches(
        ".field-length-probe, .field-baseline-rig, .field-baseline-marker, .field-guide, .field-shared-guides, .field-metrics",
      ) ||
        Boolean(
          node.closest(
            ".field-length-probe, .field-baseline-rig, .field-baseline-marker, .field-guide, .field-shared-guides, .field-metrics",
          ),
        ));
    const observer = new MutationObserver((records) => {
      if (
        records.some((record) => {
          if (isGeneratedNode(record.target)) return false;
          if (record.type !== "childList") return true;
          return [...record.addedNodes, ...record.removedNodes].some(
            (node) => !isGeneratedNode(node),
          );
        })
      ) {
        schedule();
      }
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
    baselineSelector,
    baselineKind,
    depthSelector,
    guideSelector,
    hasCaret,
    ownerSelector,
    reference,
    resetSelector,
    seatSelector,
    searchSelector,
    structuralSelector,
  ]);

  return (
    <figure className="field-sample">
      <figcaption>{label}</figcaption>
      <div className="field-measure" ref={root}>
        {children}
        {metrics ? (
          <>
            <span
              aria-hidden="true"
              className="field-guide"
              style={
                {
                  "--field-guide-left": `${metrics.guideLeft}px`,
                  "--field-guide-top": `${metrics.guideTop}px`,
                  "--field-guide-baseline": `${metrics.baseline ?? 0}px`,
                  "--field-guide-end": `${metrics.occupiedEnd}px`,
                } as React.CSSProperties
              }
            >
              <span className="field-guide-top" />
              {metrics.baseline == null ? null : (
                <span className="field-guide-baseline" />
              )}
              <span className="field-guide-end" />
            </span>
            {reference && metrics.sharedWidth != null ? (
              <span
                aria-hidden="true"
                className="field-shared-guides"
                style={
                  {
                    "--field-shared-left": `${metrics.sharedLeft}px`,
                    "--field-shared-width": `${metrics.sharedWidth}px`,
                    "--field-shared-top": `${metrics.guideTop}px`,
                    "--field-shared-baseline": `${metrics.guideTop + (metrics.baseline ?? 0)}px`,
                    "--field-shared-end": `${metrics.guideTop + metrics.occupiedEnd}px`,
                  } as React.CSSProperties
                }
              >
                <span className="field-shared-top" />
                <span className="field-shared-baseline" />
                <span className="field-shared-end" />
              </span>
            ) : null}
          </>
        ) : null}
        <output
          className="field-metrics"
          data-metrics={metrics ? JSON.stringify(metrics) : undefined}
          hidden
        />
      </div>
    </figure>
  );
};

const token = {
  cssVar: "--color-text",
  id: "color.text",
  type: "color" as const,
  tier: "semantic" as const,
  stability: "stable" as const,
  cssOutputFile: "sets.semantic.css",
  isPaired: false,
  valueLight: "#111111",
};

const SearchSpecimen = () => {
  const [query, setQuery] = useState("alpha");
  return (
    <FileTree onSearch={setQuery} searchQuery={query} header={<FileTree.SearchBox />}>
      <FileTree.File name="alpha.ts" />
    </FileTree>
  );
};

const Tier = ({
  tier,
  title,
}: {
  tier: "site" | "docs" | "app";
  title: string;
}) => (
  <section className={`field-tier ${tier}`}>
    <header>
      <h2>{title}</h2>
      <span>Text input reference</span>
    </header>
    <div className="field-samples">
      <Measured
        label="Text input"
        ownerSelector=".input.text"
        baselineSelector="input"
        seatSelector="input"
        reference
      >
        <Form defaultValues={{ text: "alpha" }} onSubmit={() => undefined}>
          <Field
            name="text"
            inputType="text"
            aria-label={`${title} text input`}
          />
        </Form>
      </Measured>
      <Measured
        label="Button breaker"
        ownerSelector=".button"
        baselineSelector=".label"
        seatSelector=".button"
      >
        <Button>Apply</Button>
      </Measured>
      <Measured
        label="Select"
        ownerSelector=".input.select"
        baselineSelector="select"
        seatSelector="select"
        hasCaret
      >
        <Form defaultValues={{ select: "alpha" }} onSubmit={() => undefined}>
          <Field
            name="select"
            inputType="select"
            aria-label={`${title} select`}
            options={[{ label: "Alpha", value: "alpha" }]}
          />
        </Form>
      </Measured>
      <Measured
        label="Textarea (CSS baseline)"
        ownerSelector="textarea"
        baselineSelector="textarea"
        seatSelector="textarea"
        baselineKind="css-alignment"
      >
        <Form defaultValues={{ textarea: "alpha" }} onSubmit={() => undefined}>
          <Field
            name="textarea"
            inputType="textarea"
            aria-label={`${title} textarea`}
            rows={1}
          />
        </Form>
      </Measured>
      <Measured
        label="Combobox"
        ownerSelector=".input.combobox-input"
        baselineSelector="input"
        seatSelector="input"
        resetSelector=".combobox-reset-button"
      >
        <Form defaultValues={{ combo: "alpha" }} onSubmit={() => undefined}>
          <Field
            name="combo"
            inputType="combobox"
            aria-label={`${title} combobox`}
            options={[{ label: "Alpha", value: "alpha" }]}
          />
        </Form>
      </Measured>
      <Measured
        label="Search"
        ownerSelector=".search-box"
        baselineSelector="input"
        seatSelector="input"
        resetSelector=".reset"
        searchSelector=".search"
      >
        <SearchSpecimen />
      </Measured>
      <Measured
        label="Tree node"
        ownerSelector='.node[title="/src/alpha.ts"]'
        baselineSelector=".nodename"
        seatSelector=".node"
        depthSelector=".indentation-block"
      >
        <FileTree>
          <FileTree.Folder name="src" defaultOpen>
            <FileTree.File name="alpha.ts" />
          </FileTree.Folder>
        </FileTree>
      </Measured>
      <Measured
        label="Diff line"
        ownerSelector=".diff-line:not(.diff-line-hunk)"
        baselineSelector=".diff-content pre"
        seatSelector=".diff-content pre"
        guideSelector=".diff-content pre"
        structuralSelector=".diff-gutter"
      >
        <div className="field-preview-diff field-preview-diff-standard">
          <GitDiffViewer
            diff={diffExample}
            isCollapsed={false}
            onCollapseToggle={() => undefined}
          >
            <GitDiffViewer.CodeDiffViewer />
          </GitDiffViewer>
        </div>
      </Measured>
      <Measured
        label="Annotated row"
        ownerSelector=".annotated-diff-line .container"
        baselineSelector=".container > div"
        seatSelector=".container"
      >
        <div className="field-preview-diff field-preview-diff-annotated">
          <GitDiffViewer
            diff={diffExample}
            lineDecorations={commentExample}
            isCollapsed={false}
            onCollapseToggle={() => undefined}
          >
            <GitDiffViewer.CodeDiffViewer />
          </GitDiffViewer>
        </div>
      </Measured>
      <Measured
        label="Inline code"
        ownerSelector="code"
        baselineSelector="code"
        seatSelector="code"
      >
        <span className="field-inline-line">
          before <InlineCode>--color-text</InlineCode> after
        </span>
      </Measured>
      <Measured
        label="Key"
        ownerSelector="kbd"
        baselineSelector="kbd"
        seatSelector="kbd"
      >
        <span className="field-inline-line">
          before <KeyboardKey keyValue="enter" /> after
        </span>
      </Measured>
      <Measured
        label="Token cell"
        ownerSelector="td"
        baselineSelector=".var-name"
        seatSelector="td"
      >
        <div className="field-preview-token">
          <TokenTable
            tokens={[token]}
            columns={["token"]}
            showCount={false}
            dense
          />
        </div>
      </Measured>
    </div>
  </section>
);

export const SiteDocsApp: Story = {
  render: () => (
    <main className="spacing-field-inline">
      <h1>03 Field inline</h1>
      <p className="field-legend">
        <span className="field-legend-edge" /> block start / occupied end{" "}
        <span className="field-legend-baseline" /> browser text baseline
      </p>
      <Tier tier="site" title="Site" />
      <Tier tier="docs" title="Docs" />
      <Tier tier="app" title="App" />
    </main>
  ),
};
