import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Field, Form } from "../../../index.js";
import "../../../index.css";
import "./SpacingGaps.css";

const meta = {
  title: "Spacing buckets/05 Gaps",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
type Model = {
  id: string;
  kind: "checkbox" | "switch" | "choices";
  lines: 2 | 3;
  heading?: boolean;
  disabled?: boolean;
  natural?: boolean;
  position?: "before" | "after";
  multiple?: boolean;
  layout?: "inline" | "stacked" | "columns";
};
const toggles: Model[] = (["checkbox", "switch"] as const).flatMap((kind) =>
  (["before", "after"] as const).flatMap((position) =>
    [false, true].map((heading) => ({
      id: `${kind}-${position}-${heading ? "heading" : "plain"}`,
      kind,
      position,
      heading,
      lines: heading ? (3 as const) : (2 as const),
    })),
  ),
);
const choices: Model[] = [false, true].flatMap((multiple) =>
  (["inline", "stacked", "columns"] as const).map((layout) => ({
    id: `${multiple ? "multiple" : "radio"}-${layout}`,
    kind: "choices" as const,
    multiple,
    layout,
    lines: 3 as const,
  })),
);
const Lines = ({ count }: { count: 2 | 3 }) => (
  <>
    First line
    <br />
    Second line
    {count === 3 && (
      <>
        <br />
        Third line
      </>
    )}
  </>
);
const firstBaseline = (node: HTMLElement) => {
  const before = node.getBoundingClientRect().height;
  const marker = document.createElement("span");
  marker.className = "gaps-baseline-marker";
  node.prepend(marker);
  const result = marker.getBoundingClientRect().top;
  const after = node.getBoundingClientRect().height;
  marker.remove();
  return Math.abs(before - after) < 0.05 ? result : null;
};
const lineRects = (node: Element) => {
  const range = document.createRange();
  range.selectNodeContents(node);
  const rects = [...range.getClientRects()].filter(
    (rect) => rect.width > 0 && rect.height > 0,
  );
  return rects.filter(
    (rect, index) =>
      rects.findIndex((other) => Math.abs(other.top - rect.top) < 0.05) ===
      index,
  );
};
function Sample({
  model,
  tier,
  mode,
}: {
  model: Model;
  tier: string;
  mode: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<unknown>(null);
  const methods = useForm<Record<string, unknown>>({
    defaultValues: {
      value:
        model.kind === "choices" ? (model.multiple ? ["one"] : "one") : false,
      next: "Following value",
    },
  });
  useEffect(() => {
    methods.setError("value", {
      type: "manual",
      message: "Please enter valid text. "
        .repeat(model.lines === 2 ? 2 : 4)
        .trim(),
    });
  }, [methods, model.lines]);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let alive = true;
    const measure = () => {
      if (!alive) return;
      const fields = [...host.querySelectorAll<HTMLElement>(".field")];
      const field = fields[0];
      const following = fields[1];
      if (!field || !following) return;
      const origin = field.getBoundingClientRect().top;
      const baselineRaw = getComputedStyle(field)
        .getPropertyValue("--ds-spacing-baseline")
        .trim();
      const bU =
        parseFloat(baselineRaw) *
        (baselineRaw.endsWith("rem")
          ? parseFloat(getComputedStyle(document.documentElement).fontSize)
          : 1);
      const owners = [
        ...field.querySelectorAll<HTMLElement>(
          ".field-toggle-control,.form-choices,.option,.field-label,.field-description,.field-error",
        ),
      ].map((node) => {
        const css = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        const label = node.matches(
          ".field-label,.field-description,.field-error",
        )
          ? node
          : node.querySelector<HTMLElement>(".field-label");
        const lines = label ? lineRects(label) : [];
        const control = node.matches(".option,.field-toggle-control")
          ? node.querySelector<HTMLInputElement>("input")
          : null;
        const mark = control?.getBoundingClientRect();
        return {
          owner: node.className,
          top: rect.top - origin,
          height: rect.height,
          marginEnd: css.marginBlockEnd,
          occupiedHeight: rect.height + parseFloat(css.marginBlockEnd || "0"),
          padding: css.paddingBlock,
          rowGap: css.rowGap,
          columnGap: css.columnGap,
          fontSize: css.fontSize,
          lineHeight: css.lineHeight,
          label: label
            ? {
                fontSize: getComputedStyle(label).fontSize,
                lineHeight: getComputedStyle(label).lineHeight,
                lineCount: lines.length,
                firstBaseline: firstBaseline(label),
                advances: lines
                  .slice(1)
                  .map((line, index) => line.top - lines[index].top),
              }
            : null,
          mark:
            mark && lines.length
              ? {
                  width: mark.width,
                  height: mark.height,
                  type: control?.getAttribute("role") ?? control?.type,
                  firstLineCenterDelta:
                    mark.top +
                    mark.height / 2 -
                    (lines[0].top + lines[0].height / 2),
                  fullTextUnionCenterDelta:
                    mark.top +
                    mark.height / 2 -
                    (lines[0].top + lines[lines.length - 1].bottom) / 2,
                }
              : null,
        };
      });
      const nextLabel = following.querySelector<HTMLElement>(".field-label");
      const nextBaseline = nextLabel ? firstBaseline(nextLabel) : null;
      const followingOffset = following.getBoundingClientRect().top - origin;
      setMetrics({
        tier,
        mode,
        model: model.id,
        disabled: model.disabled ?? false,
        naturalWrap: model.natural ?? false,
        baselineUnit: bU,
        baselineRaw,
        fieldHeight: field.getBoundingClientRect().height,
        followingOffset,
        followingOffsetRemainder: followingOffset % bU,
        followingNearestGridResidual:
          followingOffset - Math.round(followingOffset / bU) * bU,
        followingBaselineOffset:
          nextBaseline === null ? null : nextBaseline - origin,
        owners,
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
  }, [model.id, model.disabled, model.natural, mode, tier]);
  return (
    <figure className="gaps-sample">
      <figcaption>
        {model.id} ·{" "}
        {model.natural
          ? "natural wrapping; help/error 3 lines"
          : `${model.lines} lines`}
      </figcaption>
      <div
        ref={ref}
        className="gaps-measure"
        data-assembly={`${tier}-${mode}-${model.id}`}
      >
        <Form methods={methods} onSubmit={() => undefined}>
          {model.kind === "choices" ? (
            <Field
              name="value"
              inputType="choices"
              disabled={model.disabled}
              label="Choices heading"
              isMultiple={model.multiple}
              layout={model.layout}
              columns={2}
              description={<Lines count={model.lines} />}
              options={[
                { value: "one", label: <Lines count={2} /> },
                {
                  value: "two",
                  label: model.natural ? (
                    "A naturally wrapping choice label with enough words to occupy several real body lines."
                  ) : (
                    <Lines count={3} />
                  ),
                },
                { value: "three", label: "Short label" },
              ]}
            />
          ) : model.kind === "checkbox" ? (
            <Field
              name="value"
              inputType="checkbox"
              label={<Lines count={model.heading ? model.lines : 2} />}
              controlLabel={
                model.heading ? <Lines count={model.lines} /> : undefined
              }
              labelPosition={model.position}
              description={<Lines count={model.lines} />}
            />
          ) : (
            <Field
              name="value"
              inputType="switch"
              label={<Lines count={model.heading ? model.lines : 2} />}
              controlLabel={
                model.heading ? <Lines count={model.lines} /> : undefined
              }
              labelPosition={model.position}
              description={<Lines count={model.lines} />}
            />
          )}
          <Field name="next" inputType="text" label="Following field" />
        </Form>
        <output hidden data-assembly-reading>
          {JSON.stringify(metrics)}
        </output>
      </div>
    </figure>
  );
}
export const Assemblies: Story = {
  render: () => (
    <main className="spacing-gaps">
      <h1>05 Gaps · owned form assemblies</h1>
      <p className="gaps-note">
        Real Toggle rows and plain Choices own complete body seats. Control
        labels, optional headings, help and errors expose actual line advances
        and following flow. Native public density classes are compared without
        enrolling a new provider. Toggle marks center the full control label;
        Choices marks center its first line. Normal following-field labels
        retain their existing density policy.
      </p>
      {["site", "docs", "app"].map((tier) =>
        ["normal", "comfortable", "dense"].map((mode) => (
          <section
            key={`${tier}-${mode}`}
            className={`${tier} ${mode === "normal" ? "" : mode} gaps-tier`}
          >
            <h2>
              {tier} · {mode}
            </h2>
            <div className="gaps-row">
              {toggles.map((model) => (
                <Sample key={model.id} model={model} tier={tier} mode={mode} />
              ))}
            </div>
            <h3>Wrapped native Choices</h3>
            <div className="gaps-row">
              {choices.map((model) => (
                <Sample key={model.id} model={model} tier={tier} mode={mode} />
              ))}
            </div>
          </section>
        )),
      )}
    </main>
  ),
};
export const DisabledAndNaturalChoices: Story = {
  render: () => (
    <main className="spacing-gaps">
      <h1>05 Gaps · disabled and naturally wrapped Choices</h1>
      <p className="gaps-note">
        Public disabled radio and multiple Choices retain their native disabled
        behavior. The enabled multiple specimen wraps ordinary text naturally;
        its mark uses the first body line.
      </p>
      {["site", "docs", "app"].map((tier) => (
        <section key={tier} className={`${tier} gaps-tier`}>
          <h2>{tier}</h2>
          <div className="gaps-row">
            {[false, true].map((multiple) => (
              <Sample
                key={String(multiple)}
                tier={tier}
                mode="normal"
                model={{
                  id: `disabled-${multiple ? "multiple" : "radio"}`,
                  kind: "choices",
                  lines: 3,
                  layout: "stacked",
                  multiple,
                  disabled: true,
                }}
              />
            ))}
            <Sample
              tier={tier}
              mode="normal"
              model={{
                id: "natural-multiple",
                kind: "choices",
                lines: 3,
                layout: "stacked",
                multiple: true,
                natural: true,
              }}
            />
          </div>
        </section>
      ))}
    </main>
  ),
};
